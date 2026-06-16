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
  const { weatherToggle, weatherBlock, shortcutsToggle, shortcutsBlock, launcherToggle, launcherBlock, clockToggle, clockBlock, clockStyleSelect, clock12hFormat, clockShowDate } = DOM.settings;
  const { appLauncherBtn } = DOM.header;
  const weatherOrigins = [
    'https://geocoding-api.open-meteo.com/*',
    'https://api.open-meteo.com/*',
  ];

  updateWeatherWidget();

  let shortcutsLoaded = false;
  const loadShortcutsModule = async () => {
    if (shortcutsLoaded) return;
    shortcutsLoaded = true;
    try {
      const { initShortcuts } = await import('./shortcuts/index');
      initShortcuts();
    } catch (e) {
      console.error('Failed to load shortcuts module', e);
      shortcutsLoaded = false;
    }
  };

  globalState.subscribe((state) => {
    DOMUnits.syncExpandableGroup(
      { toggle: clockToggle, block: clockBlock },
      state.clockEnabled,
    );
    DOMUnits.syncWeatherGroup(
      { toggle: weatherToggle, block: weatherBlock },
      state,
    );
    DOMUnits.syncExpandableGroup(
      { toggle: shortcutsToggle, block: shortcutsBlock },
      state.shortcutsEnabled,
    );
    DOMUnits.syncExpandableGroup(
      { toggle: launcherToggle, block: launcherBlock },
      state.launcherEnabled,
    );
    if (appLauncherBtn) {
      appLauncherBtn.style.display = state.launcherEnabled ? '' : 'none';
    }
    const shortcutsGrid = document.getElementById('shortcutsGrid');
    if (shortcutsGrid) {
      shortcutsGrid.style.display = state.shortcutsEnabled ? '' : 'none';
    }
    updateWeatherWidget();

    if (state.shortcutsEnabled) {
      loadShortcutsModule();
    }
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

  if (shortcutsToggle) {
    shortcutsToggle.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      globalState.current.shortcutsEnabled = target.checked;
    });
  }

  if (clockToggle) {
    clockToggle.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      globalState.current.clockEnabled = target.checked;
    });
  }

  if (clockStyleSelect) {
    clockStyleSelect.value = globalState.current.clockStyle;
    clockStyleSelect.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      globalState.current.clockStyle = target.value;
    });
    globalState.subscribe((state) => {
      if (clockStyleSelect.value !== state.clockStyle) {
        clockStyleSelect.value = state.clockStyle;
      }
    });
  }

  if (clock12hFormat) {
    clock12hFormat.checked = globalState.current.clock12hFormat;
    clock12hFormat.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      globalState.current.clock12hFormat = target.checked;
    });
    globalState.subscribe((state) => {
      if (clock12hFormat.checked !== state.clock12hFormat) {
        clock12hFormat.checked = state.clock12hFormat;
      }
    });
  }

  if (clockShowDate) {
    clockShowDate.checked = globalState.current.clockShowDate;
    clockShowDate.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      globalState.current.clockShowDate = target.checked;
    });
    globalState.subscribe((state) => {
      if (clockShowDate.checked !== state.clockShowDate) {
        clockShowDate.checked = state.clockShowDate;
      }
    });
  }

  const shortcutsRowsSelect = document.getElementById('shortcutsRowsSelect') as HTMLButtonElement | null;
  if (shortcutsRowsSelect) {
    // Sync UI with state
    shortcutsRowsSelect.value = globalState.current.shortcutsRows;
    
    shortcutsRowsSelect.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      globalState.current.shortcutsRows = target.value;
    });

    globalState.subscribe((state) => {
      if ((shortcutsRowsSelect as any).value !== state.shortcutsRows) {
        (shortcutsRowsSelect as any).value = state.shortcutsRows;
      }
    });
  }

  if (launcherToggle) {
    launcherToggle.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      globalState.current.launcherEnabled = target.checked;
    });
  }

  const launcherProviderSelect = document.getElementById('launcherProviderSelect') as HTMLButtonElement | null;
  if (launcherProviderSelect) {
    launcherProviderSelect.value = globalState.current.launcherProvider;
    
    launcherProviderSelect.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      globalState.current.launcherProvider = target.value as 'google' | 'microsoft' | 'proton';
    });

    globalState.subscribe((state) => {
      if (launcherProviderSelect.value !== state.launcherProvider) {
        launcherProviderSelect.value = state.launcherProvider;
      }
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
  const cityInputWrapper = document.getElementById('cityInputWrapper');

  if (searchBtn && cityInput) {
    const cityString = localStorage.getItem('ent_weather_city');
    if (cityString) {
      try {
        const cityData = JSON.parse(cityString);
        if (cityData && cityData.name) {
          cityInput.value = cityData.name;
        }
      } catch (e) {}
    }

    cityInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        searchBtn.click();
      }
    });

    cityInput.addEventListener('input', () => {
      if (cityInputWrapper) cityInputWrapper.classList.remove('has-error');
    });

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
