/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { WallpaperProvider, WallpaperCacheQueue } from '../shared/types';
import { getWallpaperCache } from '../shared/state';

export function extractDominantColor(img: HTMLImageElement): string {
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

export async function extractDominantColorFromUrl(imageUrl: string): Promise<string> {
  let blobUrl: string | null = null;
  let srcToLoad = imageUrl;

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    try {
      const res = await fetch(imageUrl);
      if (res.ok) {
        const blob = await res.blob();
        blobUrl = URL.createObjectURL(blob);
        srcToLoad = blobUrl;
      }
    } catch (e) {}
  }

  return new Promise((resolve) => {
    const img = new Image();
    if (!blobUrl && !imageUrl.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }

    const cleanup = () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };

    img.onload = () => {
      try {
        const color = extractDominantColor(img);
        cleanup();
        resolve(color);
      } catch (error) {
        cleanup();
        resolve('#0B57D0');
      }
    };

    img.onerror = () => {
      cleanup();
      resolve('#0B57D0');
    };

    img.src = srcToLoad;
  });
}

export function updateOverlay(sliderValue: number, isEnabled: boolean): void {
  let val = Number(sliderValue);
  if (isNaN(val)) val = 0.3;
  if (val > 1) val = val / 100;
  const overlayOpacity = isEnabled ? val : 0;
  document.documentElement.style.setProperty(
    '--wallpaper-overlay',
    String(overlayOpacity),
  );
}

export function isWallpaperCacheValid(type: string): boolean {
  const cacheKey = `wallpaper_cache_${type}`;
  const today = new Date().toISOString().slice(0, 10);
  try {
    const cached = getWallpaperCache(cacheKey) as WallpaperCacheQueue | null;
    return !!(
      cached &&
      cached.date === today &&
      Array.isArray(cached.items) &&
      cached.items.length > 0 &&
      cached.currentIndex >= 0 &&
      cached.items[cached.currentIndex] &&
      cached.items[cached.currentIndex].url
    );
  } catch {
    return false;
  }
}

export function hideCredits(): void {
  const creditsDiv = document.getElementById('wallpaperCredits');
  if (creditsDiv) {
    creditsDiv.style.display = 'none';
  }
}

function safeRenderCreditHtml(
  container: HTMLElement,
  htmlString: string,
): void {
  container.textContent = '';
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const nodes = doc.body.childNodes;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.nodeType === Node.TEXT_NODE) {
        container.appendChild(document.createTextNode(node.textContent || ''));
      } else if (
        node.nodeType === Node.ELEMENT_NODE &&
        node.nodeName.toLowerCase() === 'a'
      ) {
        const anchorNode = node as HTMLAnchorElement;
        const href = anchorNode.getAttribute('href') || '';

        if (/^https?:\/\//i.test(href)) {
          const a = document.createElement('a');
          a.href = href;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.className = 'wallpaper-credit-link';
          a.textContent = anchorNode.textContent || '';
          container.appendChild(a);
        } else {
          container.appendChild(
            document.createTextNode(anchorNode.textContent || ''),
          );
        }
      }
    }
  } catch (e) {
    container.textContent = htmlString.replace(/<[^>]*>?/gm, '');
  }
}

export function showCredits(provider: WallpaperProvider): void {
  const creditsDiv = document.getElementById('wallpaperCredits');
  const creditTextSpan = document.getElementById('wallpaperCreditText');
  if (!creditsDiv || !creditTextSpan) return;

  const cacheKey = `wallpaper_cache_${provider}`;
  try {
    const queue = getWallpaperCache(cacheKey) as WallpaperCacheQueue | null;
    let cached = null;
    if (queue && Array.isArray(queue.items) && queue.currentIndex >= 0) {
      cached = queue.items[queue.currentIndex];
    }
    if (cached && (cached.creditHtml || cached.credit || cached.creditUrl)) {
      if (cached.creditHtml) {
        safeRenderCreditHtml(creditTextSpan, cached.creditHtml);
      } else {
        let text = cached.credit || 'Daily Wallpaper';
        if (text.length > 30) {
          text = text.substring(0, 30).trim() + '...';
        }
        const url = cached.creditUrl || '';

        if (url) {
          creditTextSpan.textContent = '';
          const a = document.createElement('a');
          a.href = url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.className = 'wallpaper-credit-link';
          a.textContent = text;
          creditTextSpan.appendChild(a);
        } else {
          creditTextSpan.textContent = text;
        }
      }
      creditsDiv.style.display = 'flex';
    } else {
      creditsDiv.style.display = 'none';
    }
  } catch (e) {
    creditsDiv.style.display = 'none';
  }
}

export function clearWallpaper(): void {
  const wallpaperLayer = document.getElementById('wallpaperLayer');
  if (wallpaperLayer) {
    wallpaperLayer.style.backgroundImage = 'none';
  }
  document.body.classList.remove('has-wallpaper');
  updateOverlay(0, false);
  hideCredits();
}

export async function bootWallpaper(
  enabled: boolean,
  provider: WallpaperProvider,
  image: string,
  overlay: number,
): Promise<void> {
  if (!enabled) {
    clearWallpaper();
    return;
  }

  let url = '';
  if (provider === 'upload') {
    url = image || '';
  } else {
    const cacheKey = `wallpaper_cache_${provider}`;
    try {
      const queue = getWallpaperCache(cacheKey) as WallpaperCacheQueue | null;
      const today = new Date().toISOString().slice(0, 10);
      if (queue && queue.date === today && Array.isArray(queue.items) && queue.currentIndex >= 0) {
        const item = queue.items[queue.currentIndex];
        if (item && item.url) url = item.url;
      }
    } catch {}
  }

  if (url) {
    updateOverlay(overlay, true);
    const wallpaperLayer = document.getElementById('wallpaperLayer');
    if (wallpaperLayer) {
      wallpaperLayer.style.backgroundImage = `url('${url}')`;
    }
    document.body.classList.add('has-wallpaper');

    if (provider !== 'upload') {
      showCredits(provider);
    } else {
      hideCredits();
    }
  } else if (provider === 'upload') {
    clearWallpaper();
  }
}
