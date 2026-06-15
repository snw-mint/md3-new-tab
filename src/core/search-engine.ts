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
      searchForm.action = engine.url;
    } else {
      searchForm.action = engine.url;
    }
  }

  if (currentEngineIcon) {
    currentEngineIcon.innerHTML = engine.icon;
  }
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
