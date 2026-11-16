import './core/ui/palette';
import { initSidebarControls, initThemeControls, initSidebarRouter } from './core/ui/sidebar';
import { bindGlobalEvents } from './core/boot/event-bindings';
import { initDisplay } from './core/boot/display';
import { DOM } from './core/shared/dom-refs';
import { initWallpaper } from './core/boot/wallpaper';
import { showSnackbar } from './core/ui/snackbar';
import { globalState } from './core/shared/state';
import { getSavedEngine, applyEngineToForm, bindSearchForm } from './core/boot/search';
import { loadTranslations } from './core/shared/i18n';

document.addEventListener('DOMContentLoaded', () => {
  loadTranslations();

  if (sessionStorage.getItem('md3_settings_restored') === 'true') {
    showSnackbar({ text: chrome.i18n.getMessage('snackbarSettingsRestored'), duration: 4000 });
    sessionStorage.removeItem('md3_settings_restored');
  }

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
  initWallpaper();

  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) {
    let backupLoaded = false;
    const loadBackupSystem = () => {
      if (backupLoaded) return;
      backupLoaded = true;
      import('./core/lazy/backup')
        .then(({ initBackupSystem }) => initBackupSystem())
        .catch(() => {
          backupLoaded = false;
        });
    };
    settingsBtn.addEventListener('pointerenter', loadBackupSystem, { once: true });
    settingsBtn.addEventListener('click', loadBackupSystem, { once: true });
  }

  let searchInitialized = globalState.current.searchEnabled;
  let suggestionsBound = false;
  let decayScheduled = false;

  const initSearchFeatures = () => {
    applyEngineToForm(getSavedEngine());
    bindSearchForm();

    if (!decayScheduled) {
      decayScheduled = true;
      setTimeout(() => {
        import('./core/lazy/frequent-searches').then(({ decayFrequentSearches }) => decayFrequentSearches());
      }, 0);
    }

    const searchInput = document.getElementById('searchInput') as HTMLInputElement | null;
    if (searchInput && !suggestionsBound) {
      let loadingSuggestions = false;
      const loadSuggestions = () => {
        if (suggestionsBound || loadingSuggestions) return;
        loadingSuggestions = true;
        import('./core/lazy/search-suggestions')
          .then(({ bindSearchSuggestions }) => {
            suggestionsBound = true;
            bindSearchSuggestions();
          })
          .catch(() => {
            loadingSuggestions = false;
          });
      };
      searchInput.addEventListener('focus', loadSuggestions, { once: true });
      searchInput.addEventListener('input', loadSuggestions, { once: true });
    }
  };

  if (searchInitialized) {
    initSearchFeatures();
  }

  globalState.subscribe((state) => {
    if (state.searchEnabled && !searchInitialized) {
      searchInitialized = true;
      initSearchFeatures();
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

  const voiceSearchBtn = document.getElementById('voiceSearchBtn') as HTMLButtonElement | null;
  if (voiceSearchBtn) {
    const hasSpeechSupport = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    const updateVoiceVisibility = (enabled: boolean) => {
      voiceSearchBtn.style.display = enabled && hasSpeechSupport ? 'flex' : 'none';
    };
    updateVoiceVisibility(globalState.current.voiceSearchEnabled);

    globalState.subscribe((state) => {
      updateVoiceVisibility(state.voiceSearchEnabled);
    });

    let voiceLoaded = false;
    let initPromise: Promise<any> | null = null;

    const loadVoiceSearch = () => {
      if (!initPromise) {
        initPromise = import('./core/lazy/voice-search')
          .then(({ initVoiceSearch }) => {
            voiceLoaded = true;
            return initVoiceSearch({
              voiceSearchBtn,
              searchInput: document.getElementById('searchInput') as HTMLInputElement | null,
              searchForm: document.getElementById('searchForm') as HTMLFormElement | null,
            });
          })
          .catch((e) => {
            console.error('Failed to load voice search module', e);
            initPromise = null;
            voiceLoaded = false;
          });
      }
      return initPromise;
    };

    voiceSearchBtn.addEventListener('pointerenter', () => loadVoiceSearch(), { once: true });
    voiceSearchBtn.addEventListener('click', async () => {
      if (!voiceLoaded) {
        const handler = await loadVoiceSearch();
        if (handler && typeof handler.trigger === 'function') {
          handler.trigger();
        }
      }
    });
  }

  const askAiBtn = document.getElementById('askAiBtn') as HTMLButtonElement | null;
  if (askAiBtn) {
    const updateAskAiVisibility = (enabled: boolean) => {
      askAiBtn.style.display = enabled ? 'flex' : 'none';
    };
    updateAskAiVisibility(globalState.current.askAiEnabled);

    globalState.subscribe((state) => {
      updateAskAiVisibility(state.askAiEnabled);
    });

    let askAiLoaded = false;
    let askAiPromise: Promise<any> | null = null;

    const loadAskAi = () => {
      if (!askAiPromise) {
        askAiPromise = import('./core/lazy/ask-ai')
          .then(({ initAskAi }) => {
            askAiLoaded = true;
            return initAskAi({
              askAiBtn,
              searchInput: document.getElementById('searchInput') as HTMLInputElement | null,
              searchForm: document.getElementById('searchForm') as HTMLFormElement | null,
            });
          })
          .catch((e) => {
            console.error('Failed to load ask to AI module', e);
            askAiPromise = null;
            askAiLoaded = false;
          });
      }
      return askAiPromise;
    };

    askAiBtn.addEventListener('pointerenter', () => loadAskAi(), { once: true });
    askAiBtn.addEventListener('click', async () => {
      if (!askAiLoaded) {
        const handler = await loadAskAi();
        if (handler && typeof handler.trigger === 'function') {
          handler.trigger();
        }
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
          priority: 1,
          onAction: () => {
            window.open('https://github.com/snw-mint/md3-new-tab/releases', '_blank');
          },
        });
        chrome.storage.local.remove('extension_updated_version');
      }
    });
  }
});
