/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { WallpaperProvider, WallpaperCacheQueue, WallpaperCacheItem } from '../shared/types';
import { globalState, getWallpaperCache, setWallpaperCache } from '../shared/state';
import {
  updateOverlay,
  clearWallpaper,
  extractDominantColorFromUrl,
  showCredits,
  hideCredits,
  getWallpaperFromDB,
  setTrackedWallpaperObjectUrl,
} from '../boot/wallpaper-render';
import { fetchDailyWallpaper } from './providers/wallpaper-apis';
import {
  isIntervalExpired,
  setLastRefreshTs,
  getIntervalMs,
  getLastRefreshTs,
  invalidateCache,
} from './providers/wallpaper-refresh';
import { showSnackbar, hideSnackbar } from '../ui/snackbar';
import { t } from '../shared/i18n';

interface WallpaperConfig {
  enabled: boolean;
  provider: WallpaperProvider;
  image?: string;
  overlay?: number;
  inverted?: boolean;
}

export class WallpaperEngine {
  private static _refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private static _actionTimer: ReturnType<typeof setTimeout> | null = null;
  private static _lastConfig: WallpaperConfig | null = null;

  private static _getQueue(provider: WallpaperProvider): WallpaperCacheQueue {
    const today = new Date().toISOString().slice(0, 10);
    const cacheKey = `wallpaper_cache_${provider}`;
    try {
      const cached = getWallpaperCache(cacheKey) as WallpaperCacheQueue | null;
      if (cached && cached.date === today && Array.isArray(cached.items)) {
        return cached;
      }
    } catch {}

    try {
      const oldCached = getWallpaperCache(cacheKey) as any;
      if (oldCached && oldCached.date === today && oldCached.url && !Array.isArray(oldCached.items)) {
        return {
          date: today,
          items: [{
            url: oldCached.url,
            credit: oldCached.credit,
            creditUrl: oldCached.creditUrl,
            creditHtml: oldCached.creditHtml,
            dominantColor: oldCached.dominantColor,
          }],
          currentIndex: 0
        };
      }
    } catch {}

    try {
      const oldCached = getWallpaperCache(cacheKey) as any;
      if (oldCached && Array.isArray(oldCached.items) && oldCached.items.length > 0 && oldCached.currentIndex >= 0) {
        const currentItem = oldCached.items[oldCached.currentIndex];
        if (currentItem) {
          return {
            date: today,
            items: [currentItem],
            currentIndex: 0
          };
        }
      }
    } catch {}

    return {
      date: today,
      items: [],
      currentIndex: -1
    };
  }

  private static _saveQueue(provider: WallpaperProvider, queue: WallpaperCacheQueue): void {
    const cacheKey = `wallpaper_cache_${provider}`;
    setWallpaperCache(cacheKey, queue);
  }

  public static updateOverlay(opacity: number, enabled: boolean): void {
    updateOverlay(opacity, enabled);
  }

  public static scheduleRefresh(config: WallpaperConfig): void {
    if (WallpaperEngine._refreshTimer !== null) {
      clearTimeout(WallpaperEngine._refreshTimer);
      WallpaperEngine._refreshTimer = null;
    }

    const interval = globalState.current.wallpaperRefreshInterval || 'daily';
    const ms = getIntervalMs(interval);
    if (!ms || !config.enabled || config.provider === 'upload') return;

    const elapsed = Date.now() - getLastRefreshTs();
    const remaining = Math.max(ms - elapsed, 0);

    WallpaperEngine._refreshTimer = setTimeout(() => {
      invalidateCache(config.provider);
      setLastRefreshTs(Date.now());
      WallpaperEngine.render({ ...config }, true);
    }, remaining);
  }

  public static async render(config: WallpaperConfig, fromTimer = false): Promise<void> {
    if (!config.enabled) {
      hideSnackbar();
      clearWallpaper();
      hideCredits();
      return;
    }

    if (WallpaperEngine._lastConfig && WallpaperEngine._lastConfig.provider !== config.provider && WallpaperEngine._lastConfig.provider !== 'upload') {
      const oldProvider = WallpaperEngine._lastConfig.provider;
      setWallpaperCache(`wallpaper_cache_${oldProvider}`, null);
    }

    const interval = globalState.current.wallpaperRefreshInterval || 'daily';
    const isApi = config.provider !== 'upload';
    const intervalExpired = isApi && isIntervalExpired(interval);

    if (isApi && intervalExpired && !fromTimer) {
      invalidateCache(config.provider);
      setLastRefreshTs(Date.now());
    }

    let targetItem: WallpaperCacheItem | null = null;
    let isNewFetch = false;

    try {
      if (config.provider === 'upload') {
        const img = config.image || globalState.current.wallpaperImage || null;
        if (img === 'idb') {
          const blob = await getWallpaperFromDB('custom_wallpaper');
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            setTrackedWallpaperObjectUrl(blobUrl);
            targetItem = { url: blobUrl };
          }
        } else if (img) {
          targetItem = { url: img };
        }
      } else {
        const queue = WallpaperEngine._getQueue(config.provider);
        const needsApiFetch = queue.items.length === 0 || intervalExpired || fromTimer;
        const random = (needsApiFetch && interval !== 'daily') || fromTimer;

        if (needsApiFetch) {
          if (interval === 'daily') {
            const providerNames: Record<string, string> = {
              bing: 'Bing',
              media_commons: 'Media Commons',
              pexels: 'Pexels',
            };
            const sourceName = providerNames[config.provider] || config.provider;
            let msg = t('fetchingImagePlaceholder', `Fetching ${sourceName} image...`);
            if (msg.includes('$SOURCE$')) {
              msg = msg.replace(/\$SOURCE\$/g, sourceName);
            }
            showSnackbar({ text: msg, duration: 0 });
          }

          const fetched = await fetchDailyWallpaper(config.provider, random);
          if (fetched) {
            targetItem = fetched;
            isNewFetch = true;
          }
        } else if (queue.items.length > 0 && queue.currentIndex >= 0) {
          targetItem = queue.items[queue.currentIndex];
        } else {
          const fetched = await fetchDailyWallpaper(config.provider, true);
          if (fetched) {
            targetItem = fetched;
            isNewFetch = true;
          }
        }
      }
    } catch (err) {
      console.error('Wallpaper Engine Error:', err);
      hideSnackbar();
    }

    if (targetItem) {
      WallpaperEngine._lastConfig = config;
      this.applyWallpaper(targetItem, config, isNewFetch);
      if (interval !== 'daily') WallpaperEngine.scheduleRefresh(config);
    } else {
      hideSnackbar();
      clearWallpaper();
      hideCredits();
    }
  }

  private static applyWallpaper(
    item: WallpaperCacheItem,
    config: WallpaperConfig,
    pushToQueue = true,
  ): void {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = item.url;

    img.onload = () => {
      hideSnackbar();
      const wallpaperLayer = document.getElementById('wallpaperLayer');
      if (wallpaperLayer) {
        wallpaperLayer.style.backgroundImage = `url('${item.url}')`;
      }
      document.body.classList.add('has-wallpaper');

      const overlay = config.overlay ?? globalState.current.wallpaperOverlay;
      const inverted = config.inverted ?? globalState.current.wallpaperOverlayInverted;
      updateOverlay(overlay, config.enabled, inverted);

      if (config.provider !== 'upload') {
        if (pushToQueue) {
          const today = new Date().toISOString().slice(0, 10);
          WallpaperEngine._saveQueue(config.provider, {
            date: today,
            items: [item],
            currentIndex: 0,
          });
        }
        showCredits(config.provider);
      } else {
        hideCredits();
      }

      WallpaperEngine._lastConfig = config;

      extractDominantColorFromUrl(item.url).then((color) => {
        if (color) {
          globalState.current.wallpaperColor = color;

          if (config.provider !== 'upload') {
            const queue = WallpaperEngine._getQueue(config.provider);
            const currentItem = queue.items[queue.currentIndex];
            if (currentItem && currentItem.url === item.url) {
              currentItem.dominantColor = color;
              WallpaperEngine._saveQueue(config.provider, queue);
            }
          }
        }
      });
    };

    img.onerror = () => {
      hideSnackbar();
      clearWallpaper();
      hideCredits();
    };
  }

  public static async shuffle(): Promise<void> {
    if (WallpaperEngine._actionTimer) return;
    const config = WallpaperEngine._lastConfig;
    if (!config || config.provider === 'upload' || config.provider === 'bing') return;

    const interval = globalState.current.wallpaperRefreshInterval || 'daily';

    if (interval === 'daily') {
      const providerNames: Record<string, string> = {
        media_commons: 'Media Commons',
        pexels: 'Pexels',
      };
      const sourceName = providerNames[config.provider] || config.provider;
      let msg = t('fetchingImagePlaceholder', `Fetching ${sourceName} image...`);
      if (msg.includes('$SOURCE$')) msg = msg.replace(/\$SOURCE\$/g, sourceName);
      showSnackbar({ text: msg, duration: 0 });
    }

    WallpaperEngine._actionTimer = setTimeout(() => { WallpaperEngine._actionTimer = null; }, 30000);

    try {
      const fetched = await fetchDailyWallpaper(config.provider, true);
      if (fetched) {
        WallpaperEngine.applyWallpaper(fetched, config, true);
        setLastRefreshTs(Date.now());
        WallpaperEngine.scheduleRefresh(config);
      } else {
        hideSnackbar();
        showSnackbar({ text: t('wallpaperFetchFailed', 'Failed to fetch new image.'), duration: 3000 });
      }
    } catch {
      hideSnackbar();
      showSnackbar({ text: t('wallpaperFetchFailed', 'Failed to fetch new image.'), duration: 3000 });
    } finally {
      if (WallpaperEngine._actionTimer) {
        clearTimeout(WallpaperEngine._actionTimer);
      }
      WallpaperEngine._actionTimer = setTimeout(() => { WallpaperEngine._actionTimer = null; }, 1000);
    }
  }
}
