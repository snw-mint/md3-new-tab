/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { AppSettings } from './types';

export const DOMUnits = {
  syncExpandableGroup(
    elements: { toggle: HTMLInputElement | null; block: HTMLElement | null },
    isEnabled: boolean,
  ): void {
    const { toggle, block } = elements;

    if (toggle && toggle.checked !== isEnabled) {
      toggle.checked = isEnabled;
    }

    if (block) {
      const card = block.closest('.settings-group-card');
      if (isEnabled) {
        block.classList.remove('collapsed');
        if (card) card.classList.remove('collapsed-card');
        block.style.maxHeight = block.scrollHeight + 'px';
        setTimeout(() => {
          if (toggle?.checked) block.style.maxHeight = 'none';
        }, 300);
      } else {
        block.style.maxHeight = block.scrollHeight + 'px';
        void block.offsetHeight;
        block.classList.add('collapsed');
        if (card) card.classList.add('collapsed-card');
        block.style.maxHeight = '0px';
      }
    }
  },

  syncWeatherGroup(
    elements: { toggle: HTMLInputElement | null; block: HTMLElement | null },
    state: AppSettings,
  ): void {
    this.syncExpandableGroup(elements, state.weatherEnabled);
  },
};
