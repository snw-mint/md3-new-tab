/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

(function () {
  const savedTheme = localStorage.getItem('ent_selected_theme') || 'device';
  if (savedTheme !== 'device') {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  const savedPalette =
    localStorage.getItem('ent_selected_palette') || 'default';
  if (savedPalette !== 'default') {
    document.documentElement.setAttribute('data-palette', savedPalette);
  }
})();
