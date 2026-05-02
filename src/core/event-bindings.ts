/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { DOM } from './dom-references';
import { DOMUnits } from './dom-units';
import { globalState } from './state';
import { requestPermission, checkPermission, fetchCityData } from './services';
import { updateWeatherWidget } from './weather';

function showPermissionModal(onGranted: () => void, onDenied: () => void) {
  const overlay = document.getElementById('warningModal');
  const title = document.getElementById('warning-modal-title');
  const msg = document.getElementById('warning-modal-message');
  const btnConfirm = document.getElementById('warning-btn-confirm');
  const btnCancel = document.getElementById('warning-btn-cancel');

  if (!overlay || !title || !msg || !btnConfirm || !btnCancel)
    return onDenied();

  title.textContent = 'Permission Required';
  msg.innerHTML =
    'To use this feature, MD3: Expressive New Tab needs permission to access <a href="https://open-meteo.com" target="_blank">Open-Meteo API</a>. This ensures your privacy and security.';
  btnConfirm.textContent = 'Agree';
  btnCancel.textContent = 'Cancel';

  overlay.classList.add('active');

  const closeModal = () => overlay.classList.remove('active');

  btnConfirm.onclick = async () => {
    closeModal();
    const granted = await requestPermission([
      'https://geocoding-api.open-meteo.com/*',
      'https://api.open-meteo.com/*',
    ]);
    if (granted) onGranted();
    else onDenied();
  };

  btnCancel.onclick = () => {
    closeModal();
    onDenied();
  };
}

export function bindGlobalEvents(): void {
  const { weatherToggle, weatherBlock } = DOM.settings;
  const weatherOrigins = [
    'https://geocoding-api.open-meteo.com/*',
    'https://api.open-meteo.com/*',
  ];

  updateWeatherWidget();

  globalState.subscribe((state) => {
    DOMUnits.syncWeatherGroup(
      { toggle: weatherToggle, block: weatherBlock },
      state,
    );
    updateWeatherWidget();
  });

  if (weatherToggle) {
    weatherToggle.addEventListener('change', async (e) => {
      const target = e.target as HTMLInputElement;
      const wantsToEnable = target.checked;

      if (!wantsToEnable) {
        globalState.current.weatherEnabled = false;
        return;
      }

      const hasPerm = await checkPermission(weatherOrigins);
      if (hasPerm) {
        globalState.current.weatherEnabled = true;
        return;
      }

      target.checked = false;
      showPermissionModal(
        () => {
          globalState.current.weatherEnabled = true;
        },
        () => {
          globalState.current.weatherEnabled = false;
        },
      );
    });
  }

  document.querySelectorAll('input[name="tempUnit"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.checked) {
        globalState.current.tempUnit = target.value as 'C' | 'F';
      }
    });
  });

  const searchBtn = document.getElementById('searchCityBtn');
  const cityInput = document.getElementById(
    'weatherCityInput',
  ) as HTMLInputElement;
  const clearCityBtn = document.getElementById('clearCityBtn');
  const cityInputWrapper = document.getElementById('cityInputWrapper');

  if (searchBtn && cityInput) {
    cityInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        searchBtn.click();
      }
    });

    cityInput.addEventListener('input', () => {
      if (cityInputWrapper) cityInputWrapper.classList.remove('has-error');
    });

    if (clearCityBtn) {
      clearCityBtn.addEventListener('click', () => {
        cityInput.value = '';
        if (cityInputWrapper) cityInputWrapper.classList.remove('has-error');
        cityInput.focus();
      });
    }

    searchBtn.addEventListener('click', async () => {
      const query = cityInput.value.trim();
      if (!query) return;

      searchBtn.classList.add('loading');
      const cityData = await fetchCityData(query);

      if (cityData) {
        if (cityInputWrapper) cityInputWrapper.classList.remove('has-error');
        localStorage.setItem('ent_weather_city', JSON.stringify(cityData));
        globalState.current.weatherCity = cityData.name;
        cityInput.value = cityData.name;
        await updateWeatherWidget();
      } else {
        if (cityInputWrapper) cityInputWrapper.classList.add('has-error');
      }

      searchBtn.classList.remove('loading');
    });
  }
}
