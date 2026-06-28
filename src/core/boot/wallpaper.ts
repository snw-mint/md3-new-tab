/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { DOM } from '../shared/dom-refs';
import { globalState } from '../shared/state';

async function compressImageToWebP(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      let { width, height } = img;

      // Max dimensions to balance quality and storage limits (local storage max 5MB)
      // 2560x1440 is standard 1440p, sufficient for high DPI without blowing up size
      const MAX_WIDTH = 2560;
      const MAX_HEIGHT = 1440;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Fill background to avoid transparent issues in webp conversion if the image has alpha
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Compress to WebP with 85% quality to keep it under local storage quota
      const dataUrl = canvas.toDataURL('image/webp', 0.85);
      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for compression'));
    };

    img.src = url;
  });
}

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
  wallpaperFileInput.addEventListener('change', async (event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    // Reset input so the same file can be selected again
    target.value = '';

    try {
      // Add a loading state visually if needed (optional)
      wallpaperUploadBtn.style.opacity = '0.7';
      wallpaperUploadBtn.style.pointerEvents = 'none';

      const compressedBase64 = await compressImageToWebP(file);
      globalState.current.wallpaperImage = compressedBase64;
    } catch (error) {
      console.error('Failed to compress and save wallpaper:', error);
      alert('Failed to process image. It might be too large or corrupted.');
    } finally {
      wallpaperUploadBtn.style.opacity = '';
      wallpaperUploadBtn.style.pointerEvents = '';
    }
  });
}
