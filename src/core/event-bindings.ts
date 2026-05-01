/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { DOM } from './dom-references';
import { DOMUnits } from './dom-units';
import { globalState } from './state';

export function bindGlobalEvents(): void {
  const { weatherToggle, weatherBlock } = DOM.settings;

  globalState.subscribe((state) => {
    DOMUnits.syncWeatherGroup(
      { toggle: weatherToggle, block: weatherBlock },
      state,
    );
  });

  if (weatherToggle) {
    weatherToggle.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      globalState.current.weatherEnabled = target.checked;
    });
  }
}
