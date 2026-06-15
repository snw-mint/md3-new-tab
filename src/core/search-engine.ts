/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { engines } from './search-engine-data';

export function getSavedEngine(): string {
  return localStorage.getItem('searchEngine') || 'google';
}

export function setSavedEngine(engineKey: string): void {
  localStorage.setItem('searchEngine', engineKey);
}

export function applyEngineToForm(engineKey: string): void {
  const engine = engines[engineKey];
  if (!engine) return;

  const searchForm = document.getElementById('searchForm') as HTMLFormElement;
  const currentEngineIcon = document.getElementById('currentEngineIcon');

  if (searchForm) {
    if (engineKey === 'system') {
      searchForm.action = '';
    } else {
      searchForm.action = engine.url;
    }
  }

  if (currentEngineIcon) {
    currentEngineIcon.innerHTML = engine.icon;
  }
}

export function bindSearchForm(): void {
  const searchForm = document.getElementById('searchForm') as HTMLFormElement;
  if (!searchForm) return;

  searchForm.addEventListener('submit', (e) => {
    const currentEngine = getSavedEngine();
    if (currentEngine === 'system') {
      e.preventDefault();
      const input = searchForm.querySelector('input[name="q"]') as HTMLInputElement;
      const query = input?.value || '';
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

export function initSearchEngineDropdown(): void {
  const engineBtn = document.getElementById('engineBtn');
  const engineDropdown = document.getElementById('engineDropdown');
  const dropdownItems = engineDropdown?.querySelectorAll('.dropdown-item');

  if (!engineBtn || !engineDropdown || !dropdownItems) return;

  dropdownItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      const engineKey = target.getAttribute('data-engine');
      if (engineKey && engines[engineKey]) {
        setSavedEngine(engineKey);
        applyEngineToForm(engineKey);
        engineDropdown.classList.remove('active');
      }
    });
  });
}
