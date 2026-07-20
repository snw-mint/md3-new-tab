let translations: Record<string, { message: string }> = {};

export function t(key: string): string {
  return translations[key] ? translations[key].message : key;
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
  const lang = localStorage.getItem('userLanguage') || 'en_US';
  const cacheKey = `i18n_cache_${lang}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    try {
      translations = JSON.parse(cached);
      applyTranslations();
      // Still fetch in background to ensure it's up to date
    } catch {
      localStorage.removeItem(cacheKey);
    }
  }

  let messages = null;
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
      const url = chrome.runtime.getURL(`_locales/${lang}/messages.json`);
      const res = await fetch(url);
      if (res.ok) messages = await res.json();
    } else {
      const res = await fetch(`_locales/${lang}/messages.json`);
      if (res.ok) messages = await res.json();
    }
  } catch (e) {
    console.warn('Failed to load locale:', lang, e);
  }

  if (messages) {
    translations = messages;
    localStorage.setItem(cacheKey, JSON.stringify(translations));
    applyTranslations();
  }
}
