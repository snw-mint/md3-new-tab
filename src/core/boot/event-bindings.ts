/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { DOM } from '../shared/dom-refs';
import { DOMUnits } from '../shared/dom-units';
import { globalState } from '../shared/state';
import { updateWeatherWidget } from './weather';
import { showWarningModal } from '../ui/modals';
import { t } from '../shared/i18n';

async function checkPermission(origins: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    const chromeApi = (window as any).chrome;
    if (!chromeApi?.permissions?.contains) return resolve(false);
    chromeApi.permissions.contains({ origins }, (result: boolean) => {
      resolve(Boolean(result));
    });
  });
}

async function requestPermission(origins: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    const chromeApi = (window as any).chrome;
    if (!chromeApi?.permissions?.request) return resolve(false);
    chromeApi.permissions.request({ origins }, (granted: boolean) => {
      resolve(Boolean(granted));
    });
  });
}

function showPermissionModal(onGranted: () => void, onDenied: () => void) {
  showWarningModal({
    title: t('warningPermissionTitle'),
    messageHtml: t('warningPermissionMessage').replace('$API_LINK$', '<a href="https://open-meteo.com" target="_blank">Open-Meteo API</a>'),
    confirmText: t('warningAgree'),
    cancelText: t('btnCancel'),
    onConfirm: async () => {
      const granted = await requestPermission([
        'https://geocoding-api.open-meteo.com/*',
        'https://api.open-meteo.com/*',
      ]);
      if (granted) onGranted();
      else onDenied();
    },
    onCancel: () => {
      onDenied();
    }
  });
}

function showSearchSuggestionsPermissionModal(onGranted: () => void, onDenied: () => void) {
  showWarningModal({
    title: t('warningPermissionTitle'),
    messageHtml: t('warningPermissionMessage').replace('$API_LINK$', '<a href="https://duckduckgo.com" target="_blank">DuckDuckGo API</a>'),
    confirmText: t('warningAgree'),
    cancelText: t('btnCancel'),
    onConfirm: async () => {
      const granted = await requestPermission([
        'https://duckduckgo.com/*'
      ]);
      if (granted) onGranted();
      else onDenied();
    },
    onCancel: () => {
      onDenied();
    }
  });
}

export function bindGlobalEvents(onShortcutsReady: (container: HTMLElement) => void): void {
  const { wallpaperToggle, wallpaperBlock, wallpaperColorToggle, weatherToggle, weatherBlock, shortcutsToggle, shortcutsBlock, searchToggle, searchBlock, searchSuggestionsToggle, launcherToggle, launcherBlock, displayToggle, displayBlock, displayStyleSelect, displayClockOptions, greetingNameInputWrapper, greetingNameInput, greetingHighlightNameCheckbox, clock12hFormat, clockShowDate } = DOM.settings;
  const { appLauncherBtn } = DOM.header;
  const weatherOrigins = [
    'https://geocoding-api.open-meteo.com/*',
    'https://api.open-meteo.com/*',
  ];
  const searchSuggestionsOrigins = [
    'https://duckduckgo.com/*'
  ];

  updateWeatherWidget();

  let shortcutsLoaded = false;
  const loadShortcutsModule = async () => {
    if (shortcutsLoaded) return;
    shortcutsLoaded = true;
    try {
      const { initShortcuts } = await import('./shortcuts-render');
      const manager = initShortcuts();
      const grid = document.getElementById('shortcutsGrid');
      if (grid) onShortcutsReady(grid);
      return manager;
    } catch (e) {
      console.error('Failed to load shortcuts module', e);
      shortcutsLoaded = false;
    }
  };

  globalState.subscribe((state) => {
    DOMUnits.syncExpandableGroup(
      { toggle: wallpaperToggle, block: wallpaperBlock },
      state.wallpaperEnabled,
    );
    DOMUnits.syncExpandableGroup(
      { toggle: displayToggle, block: displayBlock },
      state.displayEnabled,
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
    DOMUnits.syncExpandableGroup(
      { toggle: searchToggle, block: searchBlock },
      state.searchEnabled,
    );
    if (state.searchEnabled) {
      document.documentElement.removeAttribute('data-search-enabled');
    } else {
      document.documentElement.setAttribute('data-search-enabled', 'false');
    }
    if (appLauncherBtn) {
      appLauncherBtn.style.display = state.launcherEnabled ? '' : 'none';
    }
    const shortcutsGrid = document.getElementById('shortcutsGrid');
    if (shortcutsGrid) {
      shortcutsGrid.style.display = state.shortcutsEnabled ? '' : 'none';
    }
    if (searchSuggestionsToggle && searchSuggestionsToggle.checked !== state.searchSuggestionsEnabled) {
      searchSuggestionsToggle.checked = state.searchSuggestionsEnabled;
    }
    updateWeatherWidget();

    if (state.shortcutsEnabled) {
      loadShortcutsModule();
    }
    if (wallpaperColorToggle) {
      if (!state.wallpaperEnabled || !state.wallpaperImage) {
        wallpaperColorToggle.disabled = true;
        wallpaperColorToggle.checked = false;
        const group = wallpaperColorToggle.closest('.md3-checkbox-group');
        if (group) group.classList.add('disabled');
      } else {
        wallpaperColorToggle.disabled = false;
        wallpaperColorToggle.checked = state.colorFromWallpaper;
        const group = wallpaperColorToggle.closest('.md3-checkbox-group');
        if (group) group.classList.remove('disabled');
      }
    }
  });

  if (wallpaperColorToggle) {
    wallpaperColorToggle.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      globalState.current.colorFromWallpaper = target.checked;
    });
  }

  if (wallpaperToggle) {
    wallpaperToggle.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      globalState.current.wallpaperEnabled = target.checked;
    });
  }

  const { wallpaperOverlaySlider } = DOM.settings;
  if (wallpaperOverlaySlider) {
    const updateSliderProgress = (value: number) => {
      const progress = (value / 0.8) * 100;
      wallpaperOverlaySlider.style.setProperty('--slider-progress', `${progress}%`);
    };

    wallpaperOverlaySlider.value = globalState.current.wallpaperOverlay.toString();
    updateSliderProgress(globalState.current.wallpaperOverlay);

    wallpaperOverlaySlider.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const val = parseFloat(target.value);
      globalState.current.wallpaperOverlay = val;
      updateSliderProgress(val);
    });
    globalState.subscribe((state) => {
      const isDisabled = !state.wallpaperEnabled || !state.wallpaperImage;
      wallpaperOverlaySlider.disabled = isDisabled;
      
      const sliderGroup = wallpaperOverlaySlider.closest('.slider-group');
      if (sliderGroup) {
        if (isDisabled) {
          sliderGroup.classList.add('disabled');
        } else {
          sliderGroup.classList.remove('disabled');
        }
      }

      if (wallpaperOverlaySlider.value !== state.wallpaperOverlay.toString()) {
        wallpaperOverlaySlider.value = state.wallpaperOverlay.toString();
        updateSliderProgress(state.wallpaperOverlay);
      }
    });
  }

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

  if (searchToggle) {
    searchToggle.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      globalState.current.searchEnabled = target.checked;
    });
  }

  if (searchSuggestionsToggle) {
    searchSuggestionsToggle.addEventListener('change', async (e) => {
      const target = e.target as HTMLInputElement;
      const wantsToEnable = target.checked;

      if (!wantsToEnable) {
        globalState.current.searchSuggestionsEnabled = false;
        return;
      }

      const hasPerm = await checkPermission(searchSuggestionsOrigins);
      if (hasPerm) {
        globalState.current.searchSuggestionsEnabled = true;
        return;
      }

      target.checked = false;
      showSearchSuggestionsPermissionModal(
        () => {
          globalState.current.searchSuggestionsEnabled = true;
          if (searchSuggestionsToggle) searchSuggestionsToggle.checked = true;
        },
        () => {
          globalState.current.searchSuggestionsEnabled = false;
          if (searchSuggestionsToggle) searchSuggestionsToggle.checked = false;
        },
      );
    });
  }

  if (displayToggle) {
    displayToggle.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      globalState.current.displayEnabled = target.checked;
    });
  }

  if (displayStyleSelect) {
    const updateDisplaySettingsUI = (style: string) => {
      if (style === 'greetings') {
        if (greetingNameInputWrapper) greetingNameInputWrapper.style.display = '';
        if (displayClockOptions) displayClockOptions.style.display = 'none';
      } else {
        if (greetingNameInputWrapper) greetingNameInputWrapper.style.display = 'none';
        if (displayClockOptions) displayClockOptions.style.display = '';
      }
    };

    displayStyleSelect.value = globalState.current.displayStyle;
    displayStyleSelect.setAttribute('value', globalState.current.displayStyle);
    updateDisplaySettingsUI(globalState.current.displayStyle);

    displayStyleSelect.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      globalState.current.displayStyle = target.value;
    });
    globalState.subscribe((state) => {
      if (displayStyleSelect.value !== state.displayStyle) {
        displayStyleSelect.value = state.displayStyle;
      }
      if (displayStyleSelect.getAttribute('value') !== state.displayStyle) {
        displayStyleSelect.setAttribute('value', state.displayStyle);
      }
      updateDisplaySettingsUI(state.displayStyle);
    });
  }

  if (greetingNameInput) {
    greetingNameInput.value = globalState.current.greetingName;
    greetingNameInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      globalState.current.greetingName = target.value;
    });
    globalState.subscribe((state) => {
      if (greetingNameInput.value !== state.greetingName) {
        greetingNameInput.value = state.greetingName;
      }
      if (greetingHighlightNameCheckbox) {
        const hasName = state.greetingName.trim().length > 0;
        greetingHighlightNameCheckbox.disabled = !hasName;

        if (!hasName && state.greetingHighlightName) {
          globalState.current.greetingHighlightName = false;
        } else if (greetingHighlightNameCheckbox.checked !== state.greetingHighlightName) {
          greetingHighlightNameCheckbox.checked = state.greetingHighlightName;
        }
      }
    });
  }

  if (greetingHighlightNameCheckbox) {
    greetingHighlightNameCheckbox.checked = globalState.current.greetingHighlightName;
    greetingHighlightNameCheckbox.disabled = !globalState.current.greetingName.trim();
    greetingHighlightNameCheckbox.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      globalState.current.greetingHighlightName = target.checked;
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
    shortcutsRowsSelect.value = globalState.current.shortcutsRows;
    shortcutsRowsSelect.setAttribute('value', globalState.current.shortcutsRows);

    shortcutsRowsSelect.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      globalState.current.shortcutsRows = target.value;
    });

    globalState.subscribe((state) => {
      if ((shortcutsRowsSelect as any).value !== state.shortcutsRows) {
        (shortcutsRowsSelect as any).value = state.shortcutsRows;
      }
      if (shortcutsRowsSelect.getAttribute('value') !== state.shortcutsRows) {
        shortcutsRowsSelect.setAttribute('value', state.shortcutsRows);
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
    launcherProviderSelect.setAttribute('value', globalState.current.launcherProvider);

    launcherProviderSelect.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      globalState.current.launcherProvider = target.value as 'google' | 'microsoft' | 'proton';
    });

    globalState.subscribe((state) => {
      if (launcherProviderSelect.value !== state.launcherProvider) {
        launcherProviderSelect.value = state.launcherProvider;
      }
      if (launcherProviderSelect.getAttribute('value') !== state.launcherProvider) {
        launcherProviderSelect.setAttribute('value', state.launcherProvider);
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

  const cityInput = document.getElementById('weatherCityInput') as HTMLInputElement;
  const cityInputWrapper = document.getElementById('cityInputWrapper');
  const clearCityBtn = document.getElementById('clearCityBtn') || cityInputWrapper?.querySelector('.clear-input-btn');

  if (cityInput) {
    const cityString = localStorage.getItem('ent_weather_city');
    if (cityString) {
      try {
        const cityData = JSON.parse(cityString);
        if (cityData && cityData.name) {
          cityInput.value = cityData.name;
        }
      } catch (e) {}
    }

    const cityAutocompletePopup = document.getElementById('cityAutocompletePopup');
    const cityAutocompleteList = document.getElementById('cityAutocompleteList');
    let citySearchDebounceTimer: number | null = null;

    const closeAutocomplete = () => {
      cityAutocompletePopup?.classList.remove('active');
    };

    const positionAutocomplete = () => {
      if (!cityAutocompletePopup || !cityInputWrapper || !cityAutocompleteList) return;
      const rect = cityInputWrapper.getBoundingClientRect();
      const computedRadius = parseFloat(window.getComputedStyle(cityInputWrapper).borderRadius) || 12;
      
      cityAutocompletePopup.style.borderRadius = `${Math.min(computedRadius, 16)}px`;
      cityAutocompletePopup.style.width = `${rect.width}px`;
      cityAutocompletePopup.style.left = `${rect.left}px`;
      
      const popupHeight = Math.min(260, cityAutocompleteList.scrollHeight + 8);
      const checkOverflowBottom = rect.bottom + popupHeight > window.innerHeight;
      const checkOverflowTop = rect.top - popupHeight > 0;

      if (checkOverflowBottom && checkOverflowTop) {
        cityAutocompletePopup.style.top = `${rect.top - 4 - popupHeight}px`;
      } else {
        cityAutocompletePopup.style.top = `${rect.bottom + 4}px`;
      }
    };

    const handleCitySelect = async (res: any) => {
      const displayName = [res.name, res.admin1].filter(Boolean).join(', ');
      const cityData = { name: displayName, lat: res.latitude, lon: res.longitude, country: res.country };
      
      if (cityInputWrapper) cityInputWrapper.classList.remove('has-error');
      localStorage.setItem('ent_weather_city', JSON.stringify(cityData));
      globalState.current.weatherCity = cityData.name;
      cityInput.value = cityData.name;
      closeAutocomplete();
      await updateWeatherWidget();
    };

    cityInput.addEventListener('input', () => {
      if (cityInputWrapper) cityInputWrapper.classList.remove('has-error');
      
      const query = cityInput.value.trim();
      
      if (citySearchDebounceTimer) {
        window.clearTimeout(citySearchDebounceTimer);
      }
      
      if (query.length < 3) {
        closeAutocomplete();
        return;
      }
      
      citySearchDebounceTimer = window.setTimeout(async () => {
        if (!cityAutocompleteList || !cityAutocompletePopup) return;
        
        try {
          const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=3&language=en&format=json`;
          const response = await fetch(url);
          const data = await response.json();
          
          cityAutocompleteList.innerHTML = '';
          
          if (data.results && data.results.length > 0) {
            data.results.forEach((res: any) => {
              const item = document.createElement('div');
              item.className = 'md3-custom-select-item';
              item.textContent = [res.name, res.admin1].filter(Boolean).join(', ');
              item.addEventListener('click', (e) => {
                e.stopPropagation();
                handleCitySelect(res);
              });
              cityAutocompleteList.appendChild(item);
            });
          } else {
            const item = document.createElement('div');
            item.className = 'md3-custom-select-item empty';
            item.setAttribute('data-i18n', 'noResultsFound');
            item.textContent = t('noResultsFound') || 'No results found';
            cityAutocompleteList.appendChild(item);
          }
          
          cityAutocompletePopup.classList.add('active');
          positionAutocomplete();
        } catch (error) {
          console.error('Autocomplete fetch error:', error);
        }
      }, 500);
    });

    window.addEventListener('resize', () => {
      if (cityAutocompletePopup?.classList.contains('active')) {
        positionAutocomplete();
      }
    });

    document.querySelectorAll('.settings-popup, .expandable-content').forEach((container) => {
      container.addEventListener('scroll', () => {
        closeAutocomplete();
      });
    });

    cityInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (cityAutocompletePopup?.classList.contains('active')) {
          const firstResult = cityAutocompleteList?.querySelector('.md3-custom-select-item:not(.empty)') as HTMLElement;
          if (firstResult) {
            firstResult.click();
          }
        }
      }
    });

    document.addEventListener('click', (e) => {
      if (cityAutocompletePopup?.classList.contains('active') && !cityInputWrapper?.contains(e.target as Node)) {
        closeAutocomplete();
      }
    });

    if (clearCityBtn) {
      clearCityBtn.addEventListener('click', () => {
        cityInput.value = '';
        cityInput.focus();
        closeAutocomplete();
        if (cityInputWrapper) cityInputWrapper.classList.remove('has-error');
      });
    }
  }
}
