/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import './core/ui/palette';
import { initSidebarControls, initThemeControls, initSidebarRouter } from './core/ui/sidebar';
import { bindGlobalEvents } from './core/boot/event-bindings';
import { initDisplay } from './core/boot/display';
import { DOM } from './core/shared/dom-refs';
import { initBackupSystem } from './core/ui/backup';
import { initWallpaper } from './core/boot/wallpaper';
import { showSnackbar } from './core/ui/snackbar';
import { globalState } from './core/shared/state';
import { getSavedEngine, applyEngineToForm, bindSearchForm } from './core/boot/search';
import { bindSearchSuggestions } from './core/boot/search-suggestions';
import { loadTranslations } from './core/shared/i18n';

document.addEventListener('DOMContentLoaded', () => {
  loadTranslations();

  const languageSelect = document.getElementById('languageSelect') as HTMLButtonElement | null;
  if (languageSelect) {
    const savedLang = localStorage.getItem('userLanguage') || 'en_US';
    languageSelect.value = savedLang;
    languageSelect.addEventListener('change', (e: any) => {
      const newLang = e.detail?.value || languageSelect.value;
      localStorage.setItem('userLanguage', newLang);
      loadTranslations();
    });
  }

  initDisplay();
  initSidebarControls();
  initThemeControls();
  initSidebarRouter();
  initBackupSystem();
  initWallpaper();

  let searchInitialized = globalState.current.searchEnabled;
  if (searchInitialized) {
    applyEngineToForm(getSavedEngine());
    bindSearchForm();
    bindSearchSuggestions();
  }

  globalState.subscribe((state) => {
    if (state.searchEnabled && !searchInitialized) {
      searchInitialized = true;
      applyEngineToForm(getSavedEngine());
      bindSearchForm();
      bindSearchSuggestions();
    }
    document.title = state.customTabName || 'New Tab';

    if (state.hideGoogleShortcuts) {
      document.documentElement.setAttribute('data-hide-google-shortcuts', 'true');
    } else {
      document.documentElement.removeAttribute('data-hide-google-shortcuts');
    }

    if (!state.launcherEnabled) {
      document.documentElement.setAttribute('data-hide-app-launcher', 'true');
    } else {
      document.documentElement.removeAttribute('data-hide-app-launcher');
    }
  });

  bindGlobalEvents((shortcutsGrid) => {
    let dragInitialized = false;
    shortcutsGrid.addEventListener(
      'pointerover',
      async () => {
        if (dragInitialized) return;
        dragInitialized = true;
        try {
          const { initVanillaDragAndDrop } = await import('./core/lazy/drag-drop');
          const { initShortcuts } = await import('./core/boot/shortcuts-render');
          const manager = initShortcuts();
          manager.initDragDrop(initVanillaDragAndDrop);
        } catch (e) {
          console.error('Failed to load drag-drop module', e);
          dragInitialized = false;
        }
      },
      { once: true },
    );
  });

  const launcherBtn = DOM.header.appLauncherBtn;
  const launcherPopup = document.getElementById('launcherPopup');

  if (launcherBtn && launcherPopup) {
    let launcherLoaded = false;
    let launcherDragInitialized = false;

    const loadLauncher = async () => {
      if (launcherLoaded) return;
      launcherLoaded = true;
      try {
        const { renderLauncherApps, initLauncherDrag } = await import('./core/lazy/launcher');
        const { launcherData } = await import('./core/lazy/launcher-data');

        const renderCurrentProvider = () => {
          const provider = globalState.current.launcherProvider;
          const data = launcherData[provider];
          renderLauncherApps(data, {
            launcherGrid: document.getElementById('launcherGrid'),
            launcherAllAppsLink: document.getElementById('launcherAllAppsLink') as HTMLAnchorElement | null,
          });
        };

        renderCurrentProvider();

        globalState.subscribe(() => {
          renderCurrentProvider();
        });

        const grid = document.getElementById('launcherGrid');
        if (grid && !launcherDragInitialized) {
          launcherDragInitialized = true;
          grid.addEventListener(
            'pointerover',
            () => {
              initLauncherDrag(grid);
            },
            { once: true },
          );
        }
      } catch (e) {
        console.error('Failed to load launcher module', e);
        launcherLoaded = false;
      }
    };

    launcherBtn.addEventListener('pointerenter', loadLauncher, { once: true });

    launcherBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      launcherPopup.classList.toggle('active');
      if (!launcherLoaded) loadLauncher();
    });

    document.addEventListener('click', (e) => {
      if (!launcherPopup.contains(e.target as Node) && !launcherBtn.contains(e.target as Node)) {
        launcherPopup.classList.remove('active');
      }
    });
  }

  const engineBtn = document.getElementById('engineBtn');
  const engineDropdown = document.getElementById('engineDropdown');

  if (engineBtn && engineDropdown) {
    let engineLoaded = false;

    const loadSearchEngineDropdown = async () => {
      if (engineLoaded) return;
      engineLoaded = true;
      try {
        const { initSearchEngineDropdown } = await import('./core/lazy/search-engine-dropdown');
        initSearchEngineDropdown();
      } catch (e) {
        console.error('Failed to load search engine module', e);
        engineLoaded = false;
      }
    };

    engineBtn.addEventListener('pointerenter', loadSearchEngineDropdown, {
      once: true,
    });

    engineBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      engineDropdown.classList.toggle('active');
      if (!engineLoaded) loadSearchEngineDropdown();
    });

    document.addEventListener('click', (e) => {
      if (!engineDropdown.contains(e.target as Node) && !engineBtn.contains(e.target as Node)) {
        engineDropdown.classList.remove('active');
      }
    });
  }

  const selectTriggers = document.querySelectorAll('.md3-select-trigger');
  if (selectTriggers.length > 0) {
    let selectSystemLoaded = false;
    const loadSelectSystem = async () => {
      if (selectSystemLoaded) return;
      selectSystemLoaded = true;
      try {
        const { initCustomSelectSystem } = await import('./core/lazy/md3-select');
        initCustomSelectSystem();
      } catch (e) {
        console.error('Failed to load custom select system', e);
        selectSystemLoaded = false;
      }
    };

    selectTriggers.forEach((trigger) => {
      trigger.addEventListener('pointerenter', loadSelectSystem, {
        once: true,
      });
      trigger.addEventListener('click', loadSelectSystem, { once: true });
    });
  }

  const appVersionDisplay = document.getElementById('appVersionDisplay');
  if (appVersionDisplay) {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
        const manifest = chrome.runtime.getManifest();
        if (manifest && manifest.version) {
          appVersionDisplay.textContent = `v${manifest.version}`;
        }
      }
    } catch (e) {
      console.warn('Could not retrieve extension version', e);
    }
  }

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['extension_updated_version'], (result) => {
      if (result.extension_updated_version) {
        const version = result.extension_updated_version as string;
        showSnackbar({
          text: chrome.i18n.getMessage('snackbarUpdate', [version]),
          actionText: chrome.i18n.getMessage('snackbarReleaseNotes'),
          duration: 8000,
          onAction: () => {
            window.open('https://github.com/snw-mint/md3-new-tab/releases', '_blank');
          }
        });
        chrome.storage.local.remove('extension_updated_version');
      }
    });
  }
});
