import { showWarningModal } from '../ui/modals';
import { t } from './i18n';

export const HOST_PERMISSIONS: Record<string, string[]> = {
  weather: ['https://geocoding-api.open-meteo.com/*', 'https://api.open-meteo.com/*'],
  suggestions: ['https://duckduckgo.com/*'],
  pexels: ['https://pexels.snw-mint.workers.dev/*'],
  media_commons: ['https://commons.wikimedia.org/*', 'https://upload.wikimedia.org/*'],
  bing: ['https://peapix.com/*', 'https://img.peapix.com/*'],
};

export const WALLPAPER_PROVIDER_CONFIGS: Record<string, { origins: string[]; name: string }> = {
  pexels: {
    origins: HOST_PERMISSIONS.pexels,
    name: 'Pexels API',
  },
  media_commons: {
    origins: HOST_PERMISSIONS.media_commons,
    name: 'Wikimedia Commons API',
  },
  bing: {
    origins: HOST_PERMISSIONS.bing,
    name: 'Bing Wallpaper API',
  },
};

export async function checkPermission(origins: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    const chromeApi = (window as any).chrome;
    if (!chromeApi?.permissions?.contains) return resolve(false);
    chromeApi.permissions.contains({ origins }, (result: boolean) => {
      resolve(Boolean(result));
    });
  });
}

export async function requestPermission(origins: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    const chromeApi = (window as any).chrome;
    if (!chromeApi?.permissions?.request) return resolve(false);
    chromeApi.permissions.request({ origins }, (granted: boolean) => {
      resolve(Boolean(granted));
    });
  });
}

export function showWeatherPermissionModal(onGranted: () => void, onDenied: () => void): void {
  const privacyLink = `<a href="https://snw-mint.github.io/md3-new-tab/privacy.html" target="_blank" rel="noopener noreferrer">${t('readPrivacyPolicy', 'Read privacy policy')}</a>`;
  showWarningModal({
    title: t('warningPermissionTitle', 'Permission Required'),
    messageHtml: `${t('warningPermissionMessage', 'This feature requires permissions to access $API_LINK$.').replace('$API_LINK$', 'Open-Meteo API')} ${privacyLink}`,
    confirmText: t('warningAgree', 'Allow'),
    cancelText: t('btnCancel', 'Cancel'),
    onConfirm: async () => {
      const granted = await requestPermission(HOST_PERMISSIONS.weather);
      if (granted) onGranted();
      else onDenied();
    },
    onCancel: () => {
      onDenied();
    },
  });
}

export function showWallpaperPermissionModal(
  provider: string,
  onGranted: () => void,
  onDenied: () => void,
): void {
  const config = WALLPAPER_PROVIDER_CONFIGS[provider];
  if (!config) {
    onGranted();
    return;
  }

  const privacyLink = `<a href="https://snw-mint.github.io/md3-new-tab/privacy.html" target="_blank" rel="noopener noreferrer">${t('readPrivacyPolicy', 'Read privacy policy')}</a>`;
  showWarningModal({
    title: t('warningPermissionTitle', 'Permission Required'),
    messageHtml: `${t('warningPermissionMessage', 'This feature requires permissions to access $API_LINK$. This ensures your privacy and security.').replace('$API_LINK$', config.name)} ${privacyLink}`,
    confirmText: t('warningAgree', 'Allow'),
    cancelText: t('btnCancel', 'Cancel'),
    onConfirm: async () => {
      const granted = await requestPermission(config.origins);
      if (granted) onGranted();
      else onDenied();
    },
    onCancel: () => {
      onDenied();
    },
  });
}

export function showSearchSuggestionsPermissionModal(onGranted: () => void, onDenied: () => void): void {
  showWarningModal({
    title: t('warningPermissionTitle', 'Permission Required'),
    messageHtml: t('warningPermissionMessage', 'This feature requires permissions to access $API_LINK$.').replace(
      '$API_LINK$',
      '<a href="https://duckduckgo.com" target="_blank">DuckDuckGo API</a>',
    ),
    confirmText: t('warningAgree', 'Allow'),
    cancelText: t('btnCancel', 'Cancel'),
    onConfirm: async () => {
      const granted = await requestPermission(HOST_PERMISSIONS.suggestions);
      if (granted) onGranted();
      else onDenied();
    },
    onCancel: () => {
      onDenied();
    },
  });
}
