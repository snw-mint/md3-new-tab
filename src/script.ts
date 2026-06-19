/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import './core/palette';
import { initSidebarControls, initThemeControls } from './core/sidebar';
import { bindGlobalEvents } from './core/event-bindings';
import { initDisplay } from './core/display';
import { DOM } from './core/dom-references';

document.addEventListener('DOMContentLoaded', () => {
  initDisplay();
  initSidebarControls();
  initThemeControls();
  bindGlobalEvents();

  const launcherBtn = DOM.header.appLauncherBtn;
  const launcherPopup = document.getElementById('launcherPopup');

  if (launcherBtn && launcherPopup) {
    let launcherLoaded = false;
    let dragInitialized = false;

    const loadLauncher = async () => {
      if (launcherLoaded) return;
      launcherLoaded = true;
      try {
        const { renderLauncherApps, initLauncherDrag } = await import('./core/launcher');
        const { launcherData } = await import('./core/launcher-data');
        const { globalState } = await import('./core/state');

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
        if (grid && !dragInitialized) {
          dragInitialized = true;
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

  // Search Engine Logic
  const engineBtn = document.getElementById('engineBtn');
  const engineDropdown = document.getElementById('engineDropdown');

  if (engineBtn && engineDropdown) {
    let engineLoaded = false;

    // Apply initial engine right away so the search bar works
    const applyInitialEngine = async () => {
      try {
        const { getSavedEngine, applyEngineToForm, bindSearchForm } = await import('./core/search-engine');
        applyEngineToForm(getSavedEngine());
        bindSearchForm();
      } catch (e) {
        console.error('Failed to apply initial search engine', e);
      }
    };
    applyInitialEngine();

    const loadSearchEngineDropdown = async () => {
      if (engineLoaded) return;
      engineLoaded = true;
      try {
        const { initSearchEngineDropdown } = await import('./core/search-engine');
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
        const { initCustomSelectSystem } = await import('./core/md3-select');
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
});
