/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { DOM } from '../shared/dom-refs';
import { globalState } from '../shared/state';

function extractDominantColor(img: HTMLImageElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = 10;
  canvas.height = 10;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '#0B57D0';

  ctx.drawImage(img, 0, 0, 10, 10);
  const data = ctx.getImageData(0, 0, 10, 10).data;

  let r = 0,
    g = 0,
    b = 0;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  const count = data.length / 4;
  r = Math.floor(r / count);
  g = Math.floor(g / count);
  b = Math.floor(b / count);

  const hex =
    '#' +
    [r, g, b]
      .map((x) => {
        const hexStr = x.toString(16);
        return hexStr.length === 1 ? '0' + hexStr : hexStr;
      })
      .join('');

  return hex;
}

async function compressImageToWebP(file: File): Promise<{ dataUrl: string; dominantColor: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      let { width, height } = img;

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

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/webp', 0.85);
      const dominantColor = extractDominantColor(img);
      resolve({ dataUrl, dominantColor });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for compression'));
    };

    img.src = url;
  });
}

export function initWallpaper(): void {
  const { wallpaperUploadBtn, wallpaperFileInput, wallpaperAddIcon, wallpaperRemoveIcon, wallpaperLayer } =
    DOM.settings;

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
      document.body.classList.remove('has-wallpaper');
    }

    document.documentElement.style.setProperty('--wallpaper-overlay', state.wallpaperOverlay.toString());
  };

  globalState.subscribe(updateUI);
  updateUI(globalState.current);

  wallpaperUploadBtn.addEventListener('click', () => {
    if (globalState.current.wallpaperImage) {
      globalState.current.wallpaperImage = '';
    } else {
      wallpaperFileInput.click();
    }
  });

  wallpaperFileInput.addEventListener('change', async (event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;
    target.value = '';

    try {
      wallpaperUploadBtn.style.opacity = '0.7';
      wallpaperUploadBtn.style.pointerEvents = 'none';

      const { dataUrl, dominantColor } = await compressImageToWebP(file);
      globalState.current.wallpaperImage = dataUrl;
      globalState.current.wallpaperColor = dominantColor;
    } catch (error) {
      console.error('Failed to compress and save wallpaper:', error);
      alert('Failed to process image. It might be too large or corrupted.');
    } finally {
      wallpaperUploadBtn.style.opacity = '';
      wallpaperUploadBtn.style.pointerEvents = '';
    }
  });
}
