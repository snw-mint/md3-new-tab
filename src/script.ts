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
  initSidebarControls();
  initThemeControls();
});
