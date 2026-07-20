/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

const DEFAULT_LOCALE = 'en_US';

const APP_KEYS = [
  'ent_shortcuts',
  'theme',
  'ent_selected_palette',
  'ent_custom_color',
  'weatherUnit',
  'fluent_city_data',
  'weatherCity',
  'shortcutsRows',
  'launcherEnabled',
  'launcherProvider',
  'greetingName',
  'displayEnabled',
  'use12Hour',
];

const SHORTCUTS_TREE_KEY = 'shortcutsTree';
let translations = {};

async function loadTranslations() {
  const lang = localStorage.getItem('userLanguage') || 'en_US';
  const cacheKey = `i18n_cache_${lang}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    try {
      translations = JSON.parse(cached);
      applyTranslations();
      return;
    } catch {
      localStorage.removeItem(cacheKey);
    }
  }

  let messages = null;

  try {
    const url = chrome.runtime.getURL(`_locales/${lang}/messages.json`);
    const res = await fetch(url);
    if (res.ok) messages = await res.json();
  } catch {}

  if (!messages) {
    try {
      const url = chrome.runtime.getURL('crowdin/messages.json');
      const res = await fetch(url);
      if (res.ok) messages = await res.json();
    } catch {}
  }

  if (messages) {
    translations = messages;
    localStorage.setItem(cacheKey, JSON.stringify(translations));
  }

  applyTranslations();
}

function t(key) {
  return translations[key] ? translations[key].message : key;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const value = t(key);
    if (!value || value === key) return;

    if (el.tagName === 'INPUT') {
      el.placeholder = value;
    } else if (el.tagName === 'OPTION') {
      el.textContent = value;
    } else {
      el.textContent = value;
    }
  });
}

function applyTheme(theme) {
  const html = document.documentElement;
  html.removeAttribute('data-theme');
  if (theme === 'dark') {
    html.setAttribute('data-theme', 'dark');
  } else if (theme === 'auto' || theme === 'device') {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      html.setAttribute('data-theme', 'dark');
    }
  }
}

function getCurrentTheme() {
  return localStorage.getItem('theme') || 'auto';
}

function getCurrentAccent() {
  return localStorage.getItem('ent_selected_palette') || 'expressive';
}

function saveAppearance() {
  const theme = document.querySelector('.theme-circle-big.active')?.dataset.theme || 'auto';
  const palette = document.querySelector('.color-circle-btn.active')?.dataset.palette || 'expressive';
  const name = document.getElementById('input-name')?.value.trim() || '';
  const langSelect = document.getElementById('select-language');
  if (langSelect) {
    localStorage.setItem('userLanguage', langSelect.value);
  }
  localStorage.setItem('theme', theme);
  localStorage.setItem('ent_selected_palette', palette);

  const settingsStr = localStorage.getItem('ent_global_settings');
  const settings = settingsStr ? JSON.parse(settingsStr) : {};
  settings.greetingName = name;
  localStorage.setItem('ent_global_settings', JSON.stringify(settings));
}

function saveWidgets() {
  const toggleDisplay = document.getElementById('toggle-display');
  const selectDisplay = document.getElementById('select-display');
  const displayEnabled = toggleDisplay ? toggleDisplay.checked : true;
  const displayType = selectDisplay ? selectDisplay.value : 'greeting';
  const toggleShortcuts = document.getElementById('toggle-shortcuts');
  const selectShortcuts = document.getElementById('select-shortcuts');
  const shortcutsEnabled = toggleShortcuts ? toggleShortcuts.checked : true;
  const shortcutsRows = selectShortcuts ? selectShortcuts.value : '1';
  const toggleLauncher = document.getElementById('toggle-launcher');
  const selectLauncher = document.getElementById('select-launcher');
  const launcherEnabled = toggleLauncher ? toggleLauncher.checked : true;
  const launcherProvider = selectLauncher ? selectLauncher.value : 'microsoft';

  const toggleSearch = document.getElementById('toggle-search');
  const selectSearch = document.getElementById('select-search');
  const searchEnabled = toggleSearch ? toggleSearch.checked : true;

  const settingsStr = localStorage.getItem('ent_global_settings');
  const settings = settingsStr ? JSON.parse(settingsStr) : {};

  settings.displayEnabled = displayEnabled;
  settings.displayStyle = displayType;
  settings.shortcutsEnabled = shortcutsEnabled;
  settings.shortcutsRows = shortcutsRows;
  settings.launcherEnabled = launcherEnabled;
  settings.launcherProvider = launcherProvider;
  settings.searchEnabled = searchEnabled;

  if (selectSearch) {
    localStorage.setItem('searchEngine', selectSearch.value);
  }

  localStorage.setItem('ent_global_settings', JSON.stringify(settings));
}

const STEPS_ORDER = ['welcome', 'appearance', 'widgets', 'final'];

function showStep(stepId) {
  const current = document.querySelector('.step.active');
  const next = document.getElementById(`step-${stepId}`);
  if (!next) return;

  if (current) {
    const currentId = current.id.replace('step-', '');
    const currentIndex = STEPS_ORDER.indexOf(currentId);
    const nextIndex = STEPS_ORDER.indexOf(stepId);

    if (currentIndex !== -1 && nextIndex !== -1) {
      const directionClass = nextIndex > currentIndex ? 'slide-next' : 'slide-prev';

      document.body.classList.remove('slide-next', 'slide-prev');
      void document.body.offsetWidth;
      document.body.classList.add(directionClass);
    }
    current.classList.remove('active');
  } else {
    document.body.classList.add('slide-next');
  }

  next.classList.add('active');
  localStorage.setItem('setup_current_step', stepId);
}

function initThemePicker() {
  const saved = getCurrentTheme();
  const buttons = document.querySelectorAll('.theme-circle-big');
  buttons.forEach((btn) => {
    if (btn.dataset.theme === saved) btn.classList.add('active');
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const theme = btn.dataset.theme;
      localStorage.setItem('theme', theme);
      applyTheme(theme);
    });
  });
}

const PALETTE_COLORS = {
  default: {
    lightPrimary: '#0b57d0',
    lightOnPrimary: '#ffffff',
    darkPrimary: '#b2c5ff',
    darkOnPrimary: '#002b72',
    darkSurface: '#1b1b1f',
  },
  expressive: {
    lightPrimary: '#65558f',
    lightOnPrimary: '#ffffff',
    darkPrimary: '#ccb6ff',
    darkOnPrimary: '#1d064a',
    darkSurface: '#1c1b1e',
  },
  leaf: {
    lightPrimary: '#518242',
    lightOnPrimary: '#ffffff',
    darkPrimary: '#98d782',
    darkOnPrimary: '#053900',
    darkSurface: '#1a1c18',
  },
  gold: {
    lightPrimary: '#797a1e',
    lightOnPrimary: '#ffffff',
    darkPrimary: '#cbcc57',
    darkOnPrimary: '#323200',
    darkSurface: '#1c1c17',
  },
  sun: {
    lightPrimary: '#d87739',
    lightOnPrimary: '#ffffff',
    darkPrimary: '#ffb68d',
    darkOnPrimary: '#532200',
    darkSurface: '#201a17',
  },
  candy: {
    lightPrimary: '#b90063',
    lightOnPrimary: '#ffffff',
    darkPrimary: '#ffb1c8',
    darkOnPrimary: '#650033',
    darkSurface: '#201a1b',
  },
};

function applyPalettePreview(palette) {
  const colors = PALETTE_COLORS[palette] || PALETTE_COLORS.default;
  const root = document.documentElement;
  
  root.style.setProperty('--sys-color-primary-light', colors.lightPrimary);
  root.style.setProperty('--sys-color-on-primary-light', colors.lightOnPrimary);
  root.style.setProperty('--sys-color-primary-dark', colors.darkPrimary);
  root.style.setProperty('--sys-color-on-primary-dark', colors.darkOnPrimary);
  root.style.setProperty('--sys-color-surface-dark', colors.darkSurface);
  
  // Set fallback accent variables
  root.style.setProperty('--accent-color', 'var(--sys-color-primary)');
  root.style.setProperty('--accent-contrast', 'var(--sys-color-on-primary)');
}

function initAccentPicker() {
  const saved = getCurrentAccent();
  const buttons = document.querySelectorAll('.color-circle-btn');

  applyPalettePreview(saved);

  buttons.forEach((btn) => {
    if (btn.dataset.palette === saved) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const palette = btn.dataset.palette;
      localStorage.setItem('ent_selected_palette', palette);
      applyPalettePreview(palette);
    });
  });
}

function initNameInput() {
  const input = document.getElementById('input-name');
  if (!input) return;
  const settingsStr = localStorage.getItem('ent_global_settings');
  const settings = settingsStr ? JSON.parse(settingsStr) : {};
  input.value = settings.greetingName || '';
}

function initLanguageSelect() {
  const select = document.getElementById('select-language');
  if (!select) return;
  const savedLang = localStorage.getItem('userLanguage') || 'en';
  select.value = savedLang;

  select.addEventListener('change', () => {
    const newLang = select.value;
    localStorage.setItem('userLanguage', newLang);
    const cacheKey = `i18n_cache_${newLang}`;
    localStorage.removeItem(cacheKey);
    loadTranslations();
  });
}

function initWidgetToggles() {
  const settingsStr = localStorage.getItem('ent_global_settings');
  const settings = settingsStr
    ? JSON.parse(settingsStr)
    : {
        displayEnabled: true,
        shortcutsEnabled: true,
        launcherEnabled: true,
      };

  const pairs = [
    {
      toggle: 'toggle-display',
      select: 'select-display',
      isEnabled: settings.displayEnabled,
    },
    {
      toggle: 'toggle-shortcuts',
      select: 'select-shortcuts',
      isEnabled: settings.shortcutsEnabled,
    },
    {
      toggle: 'toggle-launcher',
      select: 'select-launcher',
      isEnabled: settings.launcherEnabled,
    },
    {
      toggle: 'toggle-search',
      select: 'select-search',
      isEnabled: settings.searchEnabled,
    },
  ];

  pairs.forEach(({ toggle, select, isEnabled }) => {
    const toggleEl = document.getElementById(toggle);
    const selectEl = document.getElementById(select);
    if (!toggleEl || !selectEl) return;

    toggleEl.checked = isEnabled !== false;
    selectEl.disabled = !toggleEl.checked;

    const block = toggleEl.closest('.setting-block');
    if (block) {
      if (!toggleEl.checked) block.classList.add('is-disabled');
      else block.classList.remove('is-disabled');
    }

    toggleEl.addEventListener('change', () => {
      selectEl.disabled = !toggleEl.checked;
      if (block) {
        if (!toggleEl.checked) block.classList.add('is-disabled');
        else block.classList.remove('is-disabled');
      }
    });
  });

  const btnAppearanceBack = document.getElementById('btnBack');
  if (btnAppearanceBack) {
    btnAppearanceBack.addEventListener('click', () => showStep('welcome'));
  }

  const btnWidgetsBack = document.getElementById('btn-widgets-back');
  if (btnWidgetsBack) {
    btnWidgetsBack.addEventListener('click', () => showStep('appearance'));
  }

  const savedDisplayType = settings.displayStyle || 'greetings';
  const displaySelect = document.getElementById('select-display');
  if (displaySelect) displaySelect.value = savedDisplayType;

  const savedRows = settings.shortcutsRows || '1';
  const shortcutsSelect = document.getElementById('select-shortcuts');
  if (shortcutsSelect) shortcutsSelect.value = savedRows;

  const savedLauncher = settings.launcherProvider || 'google';
  const launcherSelect = document.getElementById('select-launcher');
  if (launcherSelect) launcherSelect.value = savedLauncher;

  const savedSearchEngine = localStorage.getItem('searchEngine') || 'system';
  const searchSelect = document.getElementById('select-search');
  if (searchSelect) searchSelect.value = savedSearchEngine;
}

function showPopupError(message) {
  const overlay = document.getElementById('warningModal');
  const msgEl = document.getElementById('warning-modal-message');
  if (!overlay || !msgEl) return;
  msgEl.textContent = message;
  overlay.classList.add('active');
}

function hidePopup() {
  const overlay = document.getElementById('warningModal');
  if (overlay) overlay.classList.remove('active');
}

function handleRestoreFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(String(e.target.result || '{}'));
      const hasValidKey = APP_KEYS.some((key) => typeof data[key] === 'string');

      if (!hasValidKey) {
        showPopupError(t('wizardRestoreError'));
        return;
      }

      if (data['shortcuts']) {
        localStorage.setItem('ent_shortcuts', data['shortcuts']);
      }

      if (data['theme']) localStorage.setItem('theme', data['theme']);
      if (data['ent_selected_palette']) localStorage.setItem('ent_selected_palette', data['ent_selected_palette']);
      if (data['ent_custom_color']) localStorage.setItem('ent_custom_color', data['ent_custom_color']);

      const settingsStr = localStorage.getItem('ent_global_settings');
      const newState = settingsStr ? JSON.parse(settingsStr) : {};

      if (data['weatherUnit']) newState.tempUnit = data['weatherUnit'];

      if (data['weatherCity']) {
        newState.weatherCity = data['weatherCity'];
      } else if (data['fluent_city_data']) {
        try {
          const cityData = JSON.parse(data['fluent_city_data']);
          if (cityData.name) {
            newState.weatherCity = cityData.name;
          }
        } catch (err) {}
      }

      if (data['shortcutsRows']) newState.shortcutsRows = data['shortcutsRows'];
      if (data['launcherEnabled']) newState.launcherEnabled = data['launcherEnabled'] === 'true';
      if (data['launcherProvider']) newState.launcherProvider = data['launcherProvider'];
      if (data['greetingName']) newState.greetingName = data['greetingName'];
      if (data['displayEnabled']) newState.displayEnabled = data['displayEnabled'] === 'true';
      if (data['use12Hour']) newState.clock12hFormat = data['use12Hour'] === 'true';

      localStorage.setItem('ent_global_settings', JSON.stringify(newState));
      sessionStorage.setItem('md3_settings_restored', 'true');

      showStep('final');
    } catch {
      showPopupError(t('wizardRestoreError'));
    }
  };
  reader.readAsText(file);
}

let activeSelectTrigger = null;
let selectPopupEl = null;
let selectListContainer = null;

function closeSelectPopup() {
  if (selectPopupEl) selectPopupEl.classList.remove('active');
  if (activeSelectTrigger) {
    activeSelectTrigger.classList.remove('popup-open');
    activeSelectTrigger = null;
  }
}

function syncTriggerText(trigger) {
  const template = trigger.querySelector('.md3-select-options');
  const valueDisplay = trigger.querySelector('.md3-select-value');

  if (!template || !valueDisplay) return;

  const currentVal = trigger.value;
  const options = Array.from(template.content.querySelectorAll('div'));

  let selectedOption = options.find((opt) => opt.getAttribute('data-value') === currentVal);
  if (!selectedOption && options.length > 0) selectedOption = options[0];

  if (selectedOption) {
    valueDisplay.textContent = selectedOption.textContent;
    const i18nKey = selectedOption.getAttribute('data-i18n');
    if (i18nKey) {
      valueDisplay.setAttribute('data-i18n', i18nKey);
      valueDisplay.textContent = t(i18nKey) || selectedOption.textContent;
    } else {
      valueDisplay.removeAttribute('data-i18n');
    }
  }
}

function initCustomSelectSystem() {
  const popup = document.getElementById('md3-custom-select-popup');
  selectPopupEl = popup;
  selectListContainer = popup?.querySelector('.md3-custom-select-list');

  if (!popup || !selectListContainer) return;

  function positionPopup(trigger) {
    const rect = trigger.getBoundingClientRect();

    const computedRadius = parseFloat(window.getComputedStyle(trigger).borderRadius) || 12;
    popup.style.borderRadius = `${Math.min(computedRadius, 16)}px`;

    const popupWidth = Math.max(rect.width, 192);
    popup.style.width = `${popupWidth}px`;

    let leftPos = rect.left;
    if (rect.left + popupWidth > window.innerWidth - 16) {
      leftPos = rect.right - popupWidth;
    }
    if (leftPos + popupWidth > window.innerWidth - 16) {
      leftPos = window.innerWidth - popupWidth - 16;
    }
    if (leftPos < 16) leftPos = 16;

    popup.style.left = `${leftPos}px`;

    const popupHeight = Math.min(260, selectListContainer.scrollHeight + 8);
    const checkOverflowBottom = rect.bottom + popupHeight > window.innerHeight;
    const checkOverflowTop = rect.top - popupHeight > 0;

    if (checkOverflowBottom && checkOverflowTop) {
      popup.style.top = `${rect.top - 6 - popupHeight}px`;
    } else {
      popup.style.top = `${rect.bottom + 6}px`;
    }
  }

  function openPopup(trigger) {
    if (activeSelectTrigger === trigger) {
      closeSelectPopup();
      return;
    }

    closeSelectPopup();
    if (trigger.disabled) return;

    activeSelectTrigger = trigger;
    trigger.classList.add('popup-open');

    const template = trigger.querySelector('.md3-select-options');
    if (!template) {
      closeSelectPopup();
      return;
    }

    selectListContainer.innerHTML = '';

    const options = Array.from(template.content.querySelectorAll('div'));

    options.forEach((optionData) => {
      const val = optionData.getAttribute('data-value') || '';
      const text = optionData.textContent || '';
      const i18nKey = optionData.getAttribute('data-i18n');

      const item = document.createElement('div');
      item.className = 'md3-custom-select-item';
      item.textContent = i18nKey ? (t(i18nKey) || text) : text;
      item.setAttribute('role', 'option');
      item.setAttribute('data-value', val);
      if (i18nKey) item.setAttribute('data-i18n', i18nKey);

      if (trigger.value === val) {
        item.classList.add('selected');
        item.setAttribute('aria-selected', 'true');
      }

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        trigger.value = val;
        trigger.dispatchEvent(new Event('change', { bubbles: true }));
        closeSelectPopup();
      });

      selectListContainer.appendChild(item);
    });

    popup.classList.add('active');
    positionPopup(trigger);

    const currentSelected = selectListContainer.querySelector('.md3-custom-select-item.selected');
    if (currentSelected) {
      selectListContainer.scrollTop = currentSelected.offsetTop - selectListContainer.offsetTop;
    }
  }

  const triggers = document.querySelectorAll('.md3-select-trigger');

  triggers.forEach((trigger) => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
          syncTriggerText(trigger);
        }
      });
    });
    observer.observe(trigger, { attributes: true });

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      openPopup(trigger);
    });

    trigger.addEventListener('change', () => {
      syncTriggerText(trigger);
    });

    syncTriggerText(trigger);
  });

  popup.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', () => closeSelectPopup());

  window.addEventListener('resize', () => {
    if (activeSelectTrigger) positionPopup(activeSelectTrigger);
  });

  document.querySelectorAll('.split-main').forEach((container) => {
    container.addEventListener('scroll', () => {
      if (activeSelectTrigger) {
        closeSelectPopup();
      }
    });
  });
}

function init() {
  loadTranslations();

  chrome.storage.local.get('fluent_persistent_backup_v1', (data) => {
    const backup = data.fluent_persistent_backup_v1;
    if (backup) {
      APP_KEYS.forEach((key) => {
        if (localStorage.getItem(key) === null && backup[key] !== undefined) {
          localStorage.setItem(key, backup[key]);
        }
      });
      if (localStorage.getItem(SHORTCUTS_TREE_KEY) === null && backup[SHORTCUTS_TREE_KEY] !== undefined) {
        localStorage.setItem(SHORTCUTS_TREE_KEY, backup[SHORTCUTS_TREE_KEY]);
      }
    }
  });

  const savedTheme = getCurrentTheme();
  applyTheme(savedTheme);

  const savedStep = localStorage.getItem('setup_current_step') || 'welcome';
  if (savedStep === 'final') {
    showStep('welcome');
  } else {
    showStep(savedStep);
  }

  initThemePicker();
  initAccentPicker();
  initNameInput();
  initLanguageSelect();
  initWidgetToggles();
  initCustomSelectSystem();

  const btnSkip = document.getElementById('btn-skip');
  if (btnSkip) {
    btnSkip.addEventListener('click', () => {
      showStep('final');
    });
  }

  const btnRestore = document.getElementById('btn-restore');
  const restoreInput = document.getElementById('restore-file-input');

  if (btnRestore && restoreInput) {
    btnRestore.addEventListener('click', () => restoreInput.click());
    restoreInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) handleRestoreFile(file);
      restoreInput.value = '';
    });
  }

  const btnStart = document.getElementById('btn-start');
  if (btnStart) {
    btnStart.addEventListener('click', () => showStep('appearance'));
  }

  const btnAppearanceNext = document.getElementById('btnNext');
  if (btnAppearanceNext) {
    btnAppearanceNext.addEventListener('click', () => {
      saveAppearance();
      showStep('widgets');
    });
  }

  const btnWarningCancel = document.getElementById('warning-btn-cancel');
  if (btnWarningCancel) {
    btnWarningCancel.addEventListener('click', hidePopup);
  }

  const warningOverlay = document.getElementById('warningModal');
  if (warningOverlay) {
    warningOverlay.addEventListener('click', (e) => {
      if (e.target === warningOverlay) hidePopup();
    });
  }

  const btnWidgetsNext = document.getElementById('btn-widgets-next');
  if (btnWidgetsNext) {
    btnWidgetsNext.addEventListener('click', () => {
      saveWidgets();
      showStep('final');
    });
  }

  const btnFinalStart = document.getElementById('btn-final-start');
  if (btnFinalStart) {
    btnFinalStart.addEventListener('click', () => {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.update) {
        chrome.tabs.update({ url: chrome.runtime.getURL('index.html') });
      } else {
        window.location.href = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL ? chrome.runtime.getURL('index.html') : '/index.html';
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
