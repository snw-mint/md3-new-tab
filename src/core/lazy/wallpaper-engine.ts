/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { WallpaperProvider } from '../shared/types';
import { globalState } from '../shared/state';
import {
  updateOverlay,
  clearWallpaper,
  extractDominantColorFromUrl,
  showCredits,
  hideCredits,
  isWallpaperCacheValid,
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

export interface WallpaperConfig {
  enabled: boolean;
  provider: WallpaperProvider;
  image?: string;
  overlay?: number;
}

export class WallpaperEngine {
  private static _refreshTimer: ReturnType<typeof setTimeout> | null = null;

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

    const interval = globalState.current.wallpaperRefreshInterval || 'daily';
    const isApi = config.provider !== 'upload';
    const intervalExpired = isApi && isIntervalExpired(interval);

    if (isApi && intervalExpired && !fromTimer) {
      invalidateCache(config.provider);
      setLastRefreshTs(Date.now());
    }

    let targetUrl: string | null = null;
    const needsApiFetch = isApi && (!isWallpaperCacheValid(config.provider) || intervalExpired || fromTimer);
    const random = needsApiFetch && interval !== 'daily';

    try {
      if (config.provider === 'upload') {
        targetUrl = config.image || globalState.current.wallpaperImage || null;
      } else {
        if (needsApiFetch) {
          const providerNames: Record<string, string> = {
            bing: 'Bing',
            media_commons: 'Media Commons',
            unsplash: 'Unsplash',
            pexels: 'Pexels',
          };
          const sourceName = providerNames[config.provider] || config.provider;
          let msg = t('fetchingImagePlaceholder', `Fetching ${sourceName} image...`);
          if (msg.includes('$SOURCE$')) {
            msg = msg.replace(/\$SOURCE\$/g, sourceName);
          }
          showSnackbar({ text: msg, duration: 0 });
        }

        targetUrl = await fetchDailyWallpaper(config.provider, random);
      }
    } catch (err) {
      console.error('Wallpaper Engine Error:', err);
      hideSnackbar();
    }

    if (targetUrl) {
      this.applyWallpaper(targetUrl, config);
      if (interval !== 'daily') WallpaperEngine.scheduleRefresh(config);
    } else {
      hideSnackbar();
      clearWallpaper();
      hideCredits();
    }
  }

  private static applyWallpaper(
    url: string,
    config: WallpaperConfig,
  ): void {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;

    img.onload = () => {
      hideSnackbar();
      const wallpaperLayer = document.getElementById('wallpaperLayer');
      if (wallpaperLayer) {
        wallpaperLayer.style.backgroundImage = `url('${url}')`;
      }
      document.body.classList.add('has-wallpaper');

      const overlay = config.overlay ?? globalState.current.wallpaperOverlay;
      updateOverlay(overlay, config.enabled);

      if (config.provider !== 'upload') {
        showCredits(config.provider);
      } else {
        hideCredits();
      }

      extractDominantColorFromUrl(url).then((color) => {
        if (color) {
          globalState.current.wallpaperColor = color;
        }
      });
    };

    img.onerror = () => {
      hideSnackbar();
      clearWallpaper();
      hideCredits();
    };
  }
}
