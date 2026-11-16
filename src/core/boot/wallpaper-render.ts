import { WallpaperProvider, WallpaperCacheQueue } from '../shared/types';
import { globalState, getWallpaperCache } from '../shared/state';

export const WALLPAPER_DB_NAME = 'MD3NewTabDB';
const WALLPAPER_DB_VERSION = 1;
export const WALLPAPER_STORE_NAME = 'wallpapers';

let dbPromise: Promise<IDBDatabase> | null = null;
let currentWallpaperObjectUrl: string | null = null;

export function setTrackedWallpaperObjectUrl(nextUrl: string | null): void {
  if (currentWallpaperObjectUrl && currentWallpaperObjectUrl !== nextUrl) {
    URL.revokeObjectURL(currentWallpaperObjectUrl);
  }
  currentWallpaperObjectUrl = nextUrl && nextUrl.startsWith('blob:') ? nextUrl : null;
}

export function openWallpaperDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(WALLPAPER_DB_NAME, WALLPAPER_DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(WALLPAPER_STORE_NAME)) {
        db.createObjectStore(WALLPAPER_STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.onclose = () => {
        dbPromise = null;
      };
      resolve(db);
    };

    request.onerror = (event) => {
      dbPromise = null;
      const errorMsg = (event.target as IDBOpenDBRequest).error?.name || 'UnknownError';
      reject('Error opening database: ' + errorMsg);
    };
  });
  return dbPromise;
}

export async function getWallpaperFromDB(keyName = 'custom_wallpaper'): Promise<Blob | null> {
  try {
    const db = await openWallpaperDB();

    const blob = await new Promise<Blob | null>((resolve, reject) => {
      const transaction = db.transaction([WALLPAPER_STORE_NAME], 'readonly');
      const store = transaction.objectStore(WALLPAPER_STORE_NAME);
      const request = store.get(keyName);

      request.onsuccess = (event) => resolve((event.target as IDBRequest<Blob | undefined>).result ?? null);
      request.onerror = () => reject(new Error('Error reading from DB'));
    });

    if (blob) {
      return blob;
    }

    if (keyName === 'custom_wallpaper') {
      const legacyBase64 = globalState.current.wallpaperImage;
      if (legacyBase64 && legacyBase64.startsWith('data:image/')) {
        const res = await fetch(legacyBase64);
        const migratedBlob = await res.blob();
        await new Promise<void>((resolve) => {
          const tx = db.transaction([WALLPAPER_STORE_NAME], 'readwrite');
          tx.objectStore(WALLPAPER_STORE_NAME).put(migratedBlob, 'custom_wallpaper');
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        });
        globalState.current.wallpaperImage = 'idb';
        return migratedBlob;
      }
    }

    return null;
  } catch {
    return null;
  }
}

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

export function isDarkModeActive(): boolean {
  const theme = document.documentElement.getAttribute('data-theme');
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

export function updateOverlay(sliderValue: number, isEnabled: boolean, inverted: boolean = false): void {
  let val = Number(sliderValue);
  if (isNaN(val)) val = 0.3;
  if (val > 1) val = val / 100;
  const overlayOpacity = isEnabled ? val : 0;
  document.documentElement.style.setProperty(
    '--wallpaper-overlay',
    String(overlayOpacity),
  );
  if (inverted && !isDarkModeActive()) {
    document.documentElement.classList.add('invert-overlay');
  } else {
    document.documentElement.classList.remove('invert-overlay');
  }
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
  setTrackedWallpaperObjectUrl(null);
  const wallpaperLayer = document.getElementById('wallpaperLayer');
  if (wallpaperLayer) {
    wallpaperLayer.style.backgroundImage = 'none';
  }
  document.body.classList.remove('has-wallpaper');
  const earlyStyle = document.getElementById('early-wallpaper-style');
  if (earlyStyle) earlyStyle.remove();
  updateOverlay(0, false, false);
  hideCredits();
}

export async function bootWallpaper(
  enabled: boolean,
  provider: WallpaperProvider,
  image: string,
  overlay: number,
  inverted: boolean = false,
): Promise<void> {
  if (!enabled) {
    clearWallpaper();
    return;
  }

  let url = '';
  let appliedEarly = false;

  const earlyPromise = (window as any).__earlyWallpaperPromise as Promise<{ url: string } | null> | undefined;
  if (earlyPromise) {
    try {
      const earlyResult = await earlyPromise;
      if (earlyResult && earlyResult.url) {
        url = earlyResult.url;
        appliedEarly = true;
        setTrackedWallpaperObjectUrl(url);
      }
    } catch {}
    delete (window as any).__earlyWallpaperPromise;
  }

  if (!url) {
    if (provider === 'upload') {
      if (image) {
        const blob = await getWallpaperFromDB('custom_wallpaper');
        if (blob) {
          url = URL.createObjectURL(blob);
          setTrackedWallpaperObjectUrl(url);
        }
      }
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
  }

  if (url) {
    updateOverlay(overlay, true, inverted);
    if (!appliedEarly) {
      const wallpaperLayer = document.getElementById('wallpaperLayer');
      if (wallpaperLayer) {
        wallpaperLayer.style.backgroundImage = `url('${url}')`;
      }
      document.body.classList.add('has-wallpaper');
    }

    if (provider !== 'upload') {
      showCredits(provider);
    } else {
      hideCredits();
    }
  } else if (provider === 'upload') {
    clearWallpaper();
  }
}
