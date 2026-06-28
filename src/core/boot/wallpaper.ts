/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { DOM } from '../shared/dom-refs';
import { globalState } from '../shared/state';

export function initWallpaper(): void {
  const { wallpaperUploadBtn, wallpaperFileInput, wallpaperAddIcon, wallpaperRemoveIcon, wallpaperLayer } = DOM.settings;

  if (!wallpaperUploadBtn || !wallpaperFileInput || !wallpaperAddIcon || !wallpaperRemoveIcon || !wallpaperLayer) {
    return;
  }

  const updateUI = (state: typeof globalState.current) => {
    // If the wallpaper is enabled and an image exists
    if (state.wallpaperEnabled && state.wallpaperImage) {
      wallpaperUploadBtn.classList.add('active-state');
      wallpaperAddIcon.style.display = 'none';
      wallpaperRemoveIcon.style.display = '';

      wallpaperLayer.style.backgroundImage = `url(${state.wallpaperImage})`;
      document.body.classList.add('has-wallpaper');
    } else {
      wallpaperUploadBtn.classList.remove('active-state');
      wallpaperAddIcon.style.display = '';
      wallpaperRemoveIcon.style.display = 'none';

      // We don't clear the backgroundImage so the fade out animation works smoothly
      document.body.classList.remove('has-wallpaper');
    }
  };

  // Subscribe to state changes
  globalState.subscribe(updateUI);
  updateUI(globalState.current);

  // Handle button click
  wallpaperUploadBtn.addEventListener('click', () => {
    if (globalState.current.wallpaperImage) {
      // Remove wallpaper
      globalState.current.wallpaperImage = '';
    } else {
      // Add wallpaper
      wallpaperFileInput.click();
    }
  });

  // Handle file selection
  wallpaperFileInput.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    // Reset input so the same file can be selected again
    target.value = '';

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        globalState.current.wallpaperImage = result;
      }
    };
    reader.readAsDataURL(file);
  });
}
