let translations: Record<string, { message: string }> = {};

export function normalizeLang(lang?: string | null): string {
  if (!lang) return 'en_US';
  const clean = lang.replace('-', '_');
  if (clean.toLowerCase().startsWith('pt')) return 'pt_BR';
  if (clean.toLowerCase().startsWith('en')) return 'en_US';
  if (clean === 'pt_BR' || clean === 'en_US') return clean;
  return 'en_US';
}

export function t(key: string, fallback?: string): string {
  if (translations[key] && translations[key].message) {
    return translations[key].message;
  }
  if (typeof chrome !== 'undefined' && chrome.i18n && typeof chrome.i18n.getMessage === 'function') {
    const msg = chrome.i18n.getMessage(key, ['$WEEK$', '$USER$']);
    if (msg) return msg;
  }
  return fallback !== undefined ? fallback : key;
}

export function applyTranslations(root: Document | HTMLElement = document) {
  root.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (!key) return;
    const value = t(key);
    if (!value || value === key) return;

    if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
      (el as HTMLInputElement).placeholder = value;
    } else {
      el.textContent = value;
    }
  });
}

export async function loadTranslations() {
  const rawLang = localStorage.getItem('userLanguage') || (typeof navigator !== 'undefined' ? navigator.language : 'en_US');
  const lang = normalizeLang(rawLang);
  localStorage.setItem('userLanguage', lang);

  const cacheKey = `i18n_cache_${lang}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    try {
      translations = JSON.parse(cached);
      applyTranslations();
      document.dispatchEvent(new CustomEvent('i18nReady'));
    } catch {
      localStorage.removeItem(cacheKey);
    }
  }

  let messages = null;
  try {
    let relPath = `_locales/${lang}/messages.json`;
    if (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function') {
      relPath = chrome.runtime.getURL(relPath);
    }
    const res = await fetch(relPath);
    if (res.ok) {
      messages = await res.json();
    }
  } catch (e) {
    console.warn('Failed to load locale:', lang, e);
  }

  if (!messages && lang !== 'en_US') {
    try {
      let fallbackPath = `_locales/en_US/messages.json`;
      if (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function') {
        fallbackPath = chrome.runtime.getURL(fallbackPath);
      }
      const res = await fetch(fallbackPath);
      if (res.ok) {
        messages = await res.json();
      }
    } catch (e) {
      console.warn('Failed to load fallback locale en_US:', e);
    }
  }

  if (messages) {
    translations = messages;
    localStorage.setItem(cacheKey, JSON.stringify(translations));
    applyTranslations();
    document.dispatchEvent(new CustomEvent('i18nReady'));
  }
}
