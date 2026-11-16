import { DOM } from '../shared/dom-refs';
import { globalState } from '../shared/state';
import {
  bootWallpaper,
  clearWallpaper,
  extractDominantColor,
  setTrackedWallpaperObjectUrl,
  updateOverlay,
} from './wallpaper-render';

async function compressImageToWebP(file: File): Promise<{ blob: Blob; dominantColor: string }> {
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
      const dominantColor = extractDominantColor(img);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to encode image as WebP'));
            return;
          }
          resolve({ blob, dominantColor });
        },
        'image/webp',
        0.85,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for compression'));
    };

    img.src = url;
  });
}

export function initWallpaper(): void {
  const {
    wallpaperUploadBtn,
    wallpaperFileInput,
    wallpaperAddIcon,
    wallpaperRemoveIcon,
    wallpaperLayer,
    wallpaperUploadWrapper,
  } = DOM.settings;

  if (!wallpaperUploadBtn || !wallpaperFileInput || !wallpaperAddIcon || !wallpaperRemoveIcon || !wallpaperLayer) {
    return;
  }

  bootWallpaper(
    globalState.current.wallpaperEnabled,
    globalState.current.wallpaperProvider || 'upload',
    globalState.current.wallpaperImage,
    globalState.current.wallpaperOverlay,
    globalState.current.wallpaperOverlayInverted,
  );

  const initialIsUpload = (globalState.current.wallpaperProvider || 'upload') === 'upload';
  if (globalState.current.wallpaperEnabled && !initialIsUpload) {
    import('../lazy/wallpaper-engine').then(({ WallpaperEngine }) => {
      WallpaperEngine.render({
        enabled: true,
        provider: globalState.current.wallpaperProvider || 'upload',
        image: globalState.current.wallpaperImage,
        overlay: globalState.current.wallpaperOverlay,
        inverted: globalState.current.wallpaperOverlayInverted,
      });
    });
  }

  let lastProvider = globalState.current.wallpaperProvider || 'upload';
  let lastEnabled = globalState.current.wallpaperEnabled;

  const updateUI = (state: typeof globalState.current) => {
    const isUpload = (state.wallpaperProvider || 'upload') === 'upload';
    if (wallpaperUploadWrapper) {
      wallpaperUploadWrapper.style.display = isUpload ? '' : 'none';
    }

    if (isUpload) {
      if (state.wallpaperEnabled && state.wallpaperImage) {
        wallpaperUploadBtn.classList.add('active-state');
        wallpaperAddIcon.style.display = 'none';
        wallpaperRemoveIcon.style.display = '';

        if (state.wallpaperImage.startsWith('data:') || state.wallpaperImage.startsWith('blob:')) {
          wallpaperLayer.style.backgroundImage = `url(${state.wallpaperImage})`;
          document.body.classList.add('has-wallpaper');
        }
      } else {
        wallpaperUploadBtn.classList.remove('active-state');
        wallpaperAddIcon.style.display = '';
        wallpaperRemoveIcon.style.display = 'none';
        if (state.wallpaperEnabled && !state.wallpaperImage) {
          wallpaperLayer.style.backgroundImage = 'none';
          document.body.classList.remove('has-wallpaper');
        }
      }
    }

    if (state.wallpaperProvider !== lastProvider || state.wallpaperEnabled !== lastEnabled) {
      const enabledJustTurnedOn = !lastEnabled && state.wallpaperEnabled;
      const switchedToUpload = lastProvider !== 'upload' && isUpload;
      lastProvider = state.wallpaperProvider || 'upload';
      lastEnabled = state.wallpaperEnabled;

      if (!isUpload || !state.wallpaperEnabled) {
        import('../lazy/wallpaper-engine').then(({ WallpaperEngine }) => {
          WallpaperEngine.render({
            enabled: state.wallpaperEnabled,
            provider: state.wallpaperProvider || 'upload',
            image: state.wallpaperImage,
            overlay: state.wallpaperOverlay,
            inverted: state.wallpaperOverlayInverted,
          });
        });
      } else if (enabledJustTurnedOn || switchedToUpload) {
        bootWallpaper(
          state.wallpaperEnabled,
          'upload',
          state.wallpaperImage,
          state.wallpaperOverlay,
          state.wallpaperOverlayInverted,
        );
      }
    }

    updateOverlay(state.wallpaperOverlay, state.wallpaperEnabled, state.wallpaperOverlayInverted);
  };

  globalState.subscribe(updateUI);
  updateUI(globalState.current);

  const syncThemeOverlay = () => {
    const state = globalState.current;
    updateOverlay(state.wallpaperOverlay, state.wallpaperEnabled, state.wallpaperOverlayInverted);
  };

  window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', syncThemeOverlay);
  new MutationObserver(syncThemeOverlay).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  wallpaperUploadBtn.addEventListener('click', () => {
    if (globalState.current.wallpaperImage) {
      globalState.current.wallpaperImage = '';
      clearWallpaper();
      import('../lazy/wallpaper-storage').then(({ deleteWallpaperFromDB }) => deleteWallpaperFromDB());
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

      const { blob, dominantColor } = await compressImageToWebP(file);
      const { saveWallpaperToDB } = await import('../lazy/wallpaper-storage');
      await saveWallpaperToDB(blob);

      const blobUrl = URL.createObjectURL(blob);
      setTrackedWallpaperObjectUrl(blobUrl);
      wallpaperLayer.style.backgroundImage = `url('${blobUrl}')`;
      document.body.classList.add('has-wallpaper');

      globalState.current.wallpaperColor = dominantColor;
      globalState.current.wallpaperImage = 'idb';
    } catch (error) {
      console.error('Failed to compress and save wallpaper:', error);
      alert('Failed to process image. It might be too large or corrupted.');
    } finally {
      wallpaperUploadBtn.style.opacity = '';
      wallpaperUploadBtn.style.pointerEvents = '';
    }
  });
}
