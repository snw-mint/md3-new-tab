import { WallpaperProvider, WallpaperCacheEntry } from '../shared/types';
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
    const cached = getWallpaperCache(cacheKey) as WallpaperCacheEntry | null;
    return !!(
      cached &&
      cached.url &&
      cached.date === today &&
      'creditUrl' in cached
    );
  } catch {
    return false;
  }
}

export function clearWallpaper(): void {
  const wallpaperLayer = document.getElementById('wallpaperLayer');
  if (wallpaperLayer) {
    wallpaperLayer.style.backgroundImage = 'none';
  }
  document.body.classList.remove('has-wallpaper');
  updateOverlay(0, false);
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
      const cached = getWallpaperCache(cacheKey) as WallpaperCacheEntry | null;
      const today = new Date().toISOString().slice(0, 10);
      if (cached && cached.url && cached.date === today) {
        url = cached.url;
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
  } else if (provider === 'upload') {
    clearWallpaper();
  }
}
