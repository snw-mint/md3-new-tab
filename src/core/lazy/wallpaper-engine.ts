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
import { showSnackbar, hideSnackbar } from '../ui/snackbar';
import { t } from '../shared/i18n';

export interface WallpaperConfig {
  enabled: boolean;
  provider: WallpaperProvider;
  image?: string;
  overlay?: number;
}

export class WallpaperEngine {
  public static updateOverlay(opacity: number, enabled: boolean): void {
    updateOverlay(opacity, enabled);
  }

  public static async render(config: WallpaperConfig): Promise<void> {
    if (!config.enabled) {
      hideSnackbar();
      clearWallpaper();
      hideCredits();
      return;
    }

    let targetUrl: string | null = null;

    try {
      if (config.provider === 'upload') {
        targetUrl = config.image || globalState.current.wallpaperImage || null;
      } else {
        if (!isWallpaperCacheValid(config.provider)) {
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

        targetUrl = await fetchDailyWallpaper(config.provider);
      }
    } catch (err) {
      console.error('Wallpaper Engine Error:', err);
      hideSnackbar();
    }

    if (targetUrl) {
      this.applyWallpaper(targetUrl, config);
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
