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
  private static _actionTimer: ReturnType<typeof setTimeout> | null = null;
  private static _paused = localStorage.getItem('wallpaper_paused') === '1';
  private static _history: string[] = [];
  private static _historyIndex = -1;
  private static _lastConfig: WallpaperConfig | null = null;

  private static _pushHistory(url: string): void {
    if (WallpaperEngine._history[WallpaperEngine._historyIndex] === url) return;
    WallpaperEngine._history = WallpaperEngine._history.slice(0, WallpaperEngine._historyIndex + 1);
    WallpaperEngine._history.push(url);
    if (WallpaperEngine._history.length > 20) WallpaperEngine._history.shift();
    WallpaperEngine._historyIndex = WallpaperEngine._history.length - 1;
  }

  public static isPaused(): boolean {
    return WallpaperEngine._paused;
  }

  public static updateOverlay(opacity: number, enabled: boolean): void {
    updateOverlay(opacity, enabled);
  }

  public static scheduleRefresh(config: WallpaperConfig): void {
    if (WallpaperEngine._paused) return;
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
    const paused = WallpaperEngine._paused;
    const needsApiFetch = !paused && isApi && (!isWallpaperCacheValid(config.provider) || intervalExpired || fromTimer);
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
      WallpaperEngine._lastConfig = config;
      this.applyWallpaper(targetUrl, config);
      if (!paused && interval !== 'daily') WallpaperEngine.scheduleRefresh(config);
    } else {
      hideSnackbar();
      clearWallpaper();
      hideCredits();
    }
  }

  private static applyWallpaper(
    url: string,
    config: WallpaperConfig,
    pushToHistory = true,
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

      if (pushToHistory) WallpaperEngine._pushHistory(url);
      WallpaperEngine._lastConfig = config;
      WallpaperEngine._dispatchControlsUpdate();

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

  public static togglePause(): void {
    WallpaperEngine._paused = !WallpaperEngine._paused;
    localStorage.setItem('wallpaper_paused', WallpaperEngine._paused ? '1' : '0');
    const config = WallpaperEngine._lastConfig;
    if (!WallpaperEngine._paused && config) {
      WallpaperEngine.scheduleRefresh(config);
    } else if (WallpaperEngine._refreshTimer !== null) {
      clearTimeout(WallpaperEngine._refreshTimer);
      WallpaperEngine._refreshTimer = null;
    }
    WallpaperEngine._dispatchControlsUpdate();
  }

  public static async prevWallpaper(): Promise<void> {
    if (WallpaperEngine._paused || WallpaperEngine._actionTimer) return;
    if (WallpaperEngine._historyIndex <= 0) return;
    WallpaperEngine._historyIndex--;
    const url = WallpaperEngine._history[WallpaperEngine._historyIndex];
    const config = WallpaperEngine._lastConfig;
    if (url && config) {
      WallpaperEngine.applyWallpaper(url, config, false);
      WallpaperEngine._actionTimer = setTimeout(() => { WallpaperEngine._actionTimer = null; }, 800);
    }
  }

  public static async nextWallpaper(): Promise<void> {
    if (WallpaperEngine._paused || WallpaperEngine._actionTimer) return;
    const config = WallpaperEngine._lastConfig;
    if (!config) return;

    if (WallpaperEngine._historyIndex < WallpaperEngine._history.length - 1) {
      WallpaperEngine._historyIndex++;
      const url = WallpaperEngine._history[WallpaperEngine._historyIndex];
      WallpaperEngine.applyWallpaper(url, config, false);
      WallpaperEngine._actionTimer = setTimeout(() => { WallpaperEngine._actionTimer = null; }, 800);
      return;
    }

    const interval = globalState.current.wallpaperRefreshInterval || 'daily';
    const random = interval !== 'daily';
    const providerNames: Record<string, string> = {
      bing: 'Bing',
      media_commons: 'Media Commons',
      unsplash: 'Unsplash',
      pexels: 'Pexels',
    };
    const sourceName = providerNames[config.provider] || config.provider;
    let msg = t('fetchingImagePlaceholder', `Fetching ${sourceName} image...`);
    if (msg.includes('$SOURCE$')) msg = msg.replace(/\$SOURCE\$/g, sourceName);
    showSnackbar({ text: msg, duration: 0 });

    WallpaperEngine._actionTimer = setTimeout(() => { WallpaperEngine._actionTimer = null; }, 30000);

    try {
      invalidateCache(config.provider);
      const url = await fetchDailyWallpaper(config.provider, random || true);
      if (url) {
        WallpaperEngine.applyWallpaper(url, config, true);
        setLastRefreshTs(Date.now());
        if (!WallpaperEngine._paused) WallpaperEngine.scheduleRefresh(config);
      } else {
        hideSnackbar();
      }
    } catch {
      hideSnackbar();
    } finally {
      WallpaperEngine._actionTimer = null;
    }
  }

  private static _dispatchControlsUpdate(): void {
    window.dispatchEvent(new CustomEvent('wallpaper-controls-update'));
  }
}
