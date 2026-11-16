import { SEARCH_ICON } from '../shared/icons';

const ENGINE_URLS: Record<string, string> = {
  system: '',
  bing: 'https://www.bing.com/search',
  google: 'https://www.google.com/search',
  brave: 'https://search.brave.com/search',
  duck: 'https://duckduckgo.com/',
  ecosia: 'https://www.ecosia.org/search',
  startpage: 'https://www.startpage.com/sp/search',
  kagi: 'https://kagi.com/search',
};

const SYSTEM_ENGINE_ICON = SEARCH_ICON;

export function getSavedEngine(): string {
  return localStorage.getItem('searchEngine') || 'system';
}

export function setSavedEngine(engineKey: string): void {
  localStorage.setItem('searchEngine', engineKey);
}

export function applyEngineToForm(engineKey: string, iconSvg?: string): void {
  if (!(engineKey in ENGINE_URLS)) return;

  const searchForm = document.getElementById('searchForm') as HTMLFormElement | null;
  const currentEngineIcon = document.getElementById('currentEngineIcon');

  if (searchForm) {
    searchForm.action = ENGINE_URLS[engineKey];
  }

  if (currentEngineIcon) {
    if (iconSvg) {
      currentEngineIcon.innerHTML = iconSvg;
      try {
        localStorage.setItem('ent_engine_icon_cache', iconSvg);
      } catch {}
    } else {
      const cachedIcon = localStorage.getItem('ent_engine_icon_cache');
      if (cachedIcon) {
        if (!currentEngineIcon.hasChildNodes()) {
          currentEngineIcon.innerHTML = cachedIcon;
        }
      } else if (engineKey === 'system') {
        currentEngineIcon.innerHTML = SYSTEM_ENGINE_ICON;
        try {
          localStorage.setItem('ent_engine_icon_cache', SYSTEM_ENGINE_ICON);
        } catch {}
      } else {
        import('../lazy/search-engine-data').then(({ engines }) => {
          const engine = engines[engineKey];
          if (!engine) return;
          currentEngineIcon.innerHTML = engine.icon;
          try {
            localStorage.setItem('ent_engine_icon_cache', engine.icon);
          } catch {}
        });
      }
    }
  }
}

export function bindSearchForm(): void {
  const searchForm = document.getElementById('searchForm') as HTMLFormElement | null;
  if (!searchForm) return;

  searchForm.addEventListener('submit', (e) => {
    const currentEngine = getSavedEngine();
    const input = searchForm.querySelector('input[name="q"]') as HTMLInputElement | null;
    const query = input?.value || '';

    if (query.trim()) {
      import('../lazy/frequent-searches').then(({ recordSearch }) => recordSearch(query));
    }

    if (currentEngine === 'system') {
      e.preventDefault();
      if (!query.trim()) return;

      try {
        const win = window as any;
        if (win.browser?.search?.search) {
          win.browser.search.search({ query: query });
        } else if (win.chrome?.search?.query) {
          win.chrome.search.query({ text: query, disposition: 'CURRENT_TAB' });
        } else if (win.browser?.search?.query) {
          win.browser.search.query({ text: query });
        } else {
          throw new Error('Native search API not supported in this browser.');
        }
      } catch (error) {
        console.warn('Native search failed, triggering fallback:', error);
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      }
    }
  });
}
