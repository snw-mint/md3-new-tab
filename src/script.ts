/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import './core/palette';
import { initSidebarControls, initThemeControls } from './core/sidebar';

document.addEventListener('DOMContentLoaded', () => {
  // Inicializa a UI do painel
  initSidebarControls();
  initThemeControls();

  // Inicializa o motor reativo (Weather, etc)
  bindGlobalEvents();
});

import { bindGlobalEvents } from './core/event-bindings';
document.addEventListener('DOMContentLoaded', () => {
  bindGlobalEvents();
});
