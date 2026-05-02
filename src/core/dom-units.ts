/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { AppSettings } from './types';

export const DOMUnits = {
  syncWeatherGroup(
    elements: { toggle: HTMLInputElement | null; block: HTMLElement | null },
    state: AppSettings,
  ): void {
    const { toggle, block } = elements;

    if (toggle && toggle.checked !== state.weatherEnabled) {
      toggle.checked = state.weatherEnabled;
    }

    if (block) {
      if (state.weatherEnabled) {
        block.classList.remove('collapsed');
        block.style.maxHeight = block.scrollHeight + 'px';
        setTimeout(() => {
          if (toggle?.checked) block.style.maxHeight = 'none';
        }, 300);
      } else {
        block.style.maxHeight = block.scrollHeight + 'px';
        void block.offsetHeight;
        block.classList.add('collapsed');
        block.style.maxHeight = '0px';
      }
    }
  },
};
