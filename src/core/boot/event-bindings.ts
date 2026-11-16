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
import { initShortcuts } from './shortcuts-render';
import { t } from '../shared/i18n';
import {
  HOST_PERMISSIONS,
  WALLPAPER_PROVIDER_CONFIGS,
  checkPermission,
  showWeatherPermissionModal,
  showWallpaperPermissionModal,
  showSearchSuggestionsPermissionModal,
} from '../shared/permissions';

export function bindGlobalEvents(onShortcutsReady: (container: HTMLElement) => void): void {
  const { wallpaperToggle, wallpaperBlock, wallpaperColorToggle, weatherToggle, weatherBlock, shortcutsToggle, shortcutsBlock, searchToggle, searchBlock, searchSuggestionsToggle, voiceSearchToggle, askAiToggle, launcherToggle, launcherBlock, displayToggle, displayBlock, displayStyleSelect } = DOM.settings;

  updateWeatherWidget();

  let shortcutsNotified = false;
  const ensureShortcutsReady = () => {
    initShortcuts();
    if (shortcutsNotified) return;
    const grid = document.getElementById('shortcutsGrid');
    if (grid) {
      shortcutsNotified = true;
      onShortcutsReady(grid);
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
    const shortcutsGrid = document.getElementById('shortcutsGrid');
    if (shortcutsGrid) {
      shortcutsGrid.style.display = state.shortcutsEnabled ? '' : 'none';
      if (state.hideShortcutNames) {
        shortcutsGrid.setAttribute('data-hide-names', 'true');
      } else {
        shortcutsGrid.removeAttribute('data-hide-names');
      }
    }
    if (state.shortcutShape && state.shortcutShape !== 'circle') {
      document.documentElement.setAttribute('data-shortcut-shape', state.shortcutShape);
    } else {
      document.documentElement.removeAttribute('data-shortcut-shape');
    }
    if (searchSuggestionsToggle && searchSuggestionsToggle.checked !== state.searchSuggestionsEnabled) {
      searchSuggestionsToggle.checked = state.searchSuggestionsEnabled;
    }
    if (voiceSearchToggle && voiceSearchToggle.checked !== state.voiceSearchEnabled) {
      voiceSearchToggle.checked = state.voiceSearchEnabled;
    }
    if (askAiToggle && askAiToggle.checked !== state.askAiEnabled) {
      askAiToggle.checked = state.askAiEnabled;
    }
    updateWeatherWidget();

    if (state.shortcutsEnabled) {
      ensureShortcutsReady();
    }
    if (wallpaperColorToggle) {
      const canEnable = state.wallpaperEnabled && (state.wallpaperProvider !== 'upload' || !!state.wallpaperImage);
      if (!canEnable) {
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
    wallpaperToggle.addEventListener('change', async (e) => {
      const target = e.target as HTMLInputElement;
      const wantsToEnable = target.checked;

      if (!wantsToEnable) {
        globalState.current.wallpaperEnabled = false;
        return;
      }

      const currentProvider = globalState.current.wallpaperProvider || 'upload';
      const config = WALLPAPER_PROVIDER_CONFIGS[currentProvider];

      if (config) {
        const hasPerm = await checkPermission(config.origins);
        if (hasPerm) {
          globalState.current.wallpaperEnabled = true;
          return;
        }

        target.checked = false;
        showWallpaperPermissionModal(
          currentProvider,
          () => {
            globalState.current.wallpaperEnabled = true;
          },
          () => {
            globalState.current.wallpaperEnabled = false;
          }
        );
      } else {
        globalState.current.wallpaperEnabled = true;
      }
    });
  }

  const { wallpaperProviderSelect } = DOM.settings;
  if (wallpaperProviderSelect) {
    wallpaperProviderSelect.value = globalState.current.wallpaperProvider || 'upload';
    wallpaperProviderSelect.setAttribute('value', globalState.current.wallpaperProvider || 'upload');

    wallpaperProviderSelect.addEventListener('change', async (e) => {
      const target = e.target as HTMLSelectElement;
      const selectedProvider = target.value as 'upload' | 'pexels' | 'media_commons' | 'bing';
      const prevProvider = globalState.current.wallpaperProvider || 'upload';
      const config = WALLPAPER_PROVIDER_CONFIGS[selectedProvider];

      if (!config) {
        globalState.current.wallpaperProvider = selectedProvider;
        return;
      }

      const hasPerm = await checkPermission(config.origins);
      if (hasPerm) {
        globalState.current.wallpaperProvider = selectedProvider;
        return;
      }

      showWallpaperPermissionModal(
        selectedProvider,
        () => {
          globalState.current.wallpaperProvider = selectedProvider;
        },
        () => {
          globalState.current.wallpaperProvider = prevProvider;
          wallpaperProviderSelect.value = prevProvider;
          wallpaperProviderSelect.setAttribute('value', prevProvider);
          const valEl = wallpaperProviderSelect.querySelector('.md3-select-value');
          const optEl = wallpaperProviderSelect.querySelector(`[data-value="${prevProvider}"]`);
          if (valEl && optEl) {
            valEl.textContent = optEl.textContent;
          }
        }
      );
    });

    globalState.subscribe((state) => {
      const prov = state.wallpaperProvider || 'upload';
      if (wallpaperProviderSelect.value !== prov) {
        wallpaperProviderSelect.value = prov;
      }
      if (wallpaperProviderSelect.getAttribute('value') !== prov) {
        wallpaperProviderSelect.setAttribute('value', prov);
      }
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
      const isDisabled = !state.wallpaperEnabled || (state.wallpaperProvider === 'upload' && !state.wallpaperImage);
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

      const hasPerm = await checkPermission(HOST_PERMISSIONS.weather);
      if (hasPerm) {
        globalState.current.weatherEnabled = true;
        return;
      }

      target.checked = false;
      showWeatherPermissionModal(
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

      const hasPerm = await checkPermission(HOST_PERMISSIONS.suggestions);
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

  if (voiceSearchToggle) {
    voiceSearchToggle.checked = globalState.current.voiceSearchEnabled;
    voiceSearchToggle.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      globalState.current.voiceSearchEnabled = target.checked;
    });
  }

  if (askAiToggle) {
    askAiToggle.checked = globalState.current.askAiEnabled;
    askAiToggle.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      globalState.current.askAiEnabled = target.checked;
    });
  }

  if (displayToggle) {
    displayToggle.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      globalState.current.displayEnabled = target.checked;
    });
  }

  if (displayStyleSelect) {
    const updateDisplayStyleVal = (val: string) => {
      if (displayStyleSelect.value !== val) displayStyleSelect.value = val;
      if (displayStyleSelect.getAttribute('value') !== val) displayStyleSelect.setAttribute('value', val);
      const valEl = displayStyleSelect.querySelector('.md3-select-value');
      const optEl = displayStyleSelect.querySelector(`[data-value="${val}"]`);
      if (valEl && optEl) {
        const i18nKey = optEl.getAttribute('data-i18n');
        const fallbackText = optEl.textContent || '';
        if (i18nKey) {
          valEl.setAttribute('data-i18n', i18nKey);
          valEl.textContent = t(i18nKey, fallbackText);
        } else {
          valEl.removeAttribute('data-i18n');
          valEl.textContent = fallbackText;
        }
      }
    };

    updateDisplayStyleVal(globalState.current.displayStyle);

    displayStyleSelect.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      globalState.current.displayStyle = target.value;
    });
    globalState.subscribe((state) => {
      updateDisplayStyleVal(state.displayStyle);
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

  const tuRadios = document.querySelectorAll<HTMLInputElement>('input[name="tempUnit"]');
  const syncTu = (u: 'C' | 'F') => {
    tuRadios.forEach((r) => {
      r.checked = r.value === u;
    });
  };

  syncTu(globalState.current.tempUnit);

  tuRadios.forEach((r) => {
    r.addEventListener('change', () => {
      if (r.checked) {
        globalState.current.tempUnit = r.value as 'C' | 'F';
      }
    });
  });

  globalState.subscribe((s) => {
    syncTu(s.tempUnit);
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
          const { fetchCitySuggestions } = await import('../lazy/providers/weather-api');
          const results = await fetchCitySuggestions(query);
          
          cityAutocompleteList.innerHTML = '';
          
          if (results.length > 0) {
            results.forEach((res) => {
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
            item.textContent = t('noResultsFound', 'No results found');
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
