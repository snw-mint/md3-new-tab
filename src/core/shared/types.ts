/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

export interface AppSettings {
  displayEnabled: boolean;
  displayStyle: string;
  greetingName: string;
  greetingHighlightName: boolean;
  greetingScale: number;
  clock12hFormat: boolean;
  clockShowDate: boolean;
  clockExpressiveColor: boolean;
  clockStyle: string;
  clockScale: number;
  weatherEnabled: boolean;
  tempUnit: 'C' | 'F';
  weatherCity: string;
  searchEnabled: boolean;
  searchSuggestionsEnabled: boolean;
  voiceSearchEnabled: boolean;
  askAiEnabled: boolean;
  shortcutsEnabled: boolean;
  shortcutsRows: string;
  hideShortcutNames: boolean;
  launcherEnabled: boolean;
  launcherProvider: 'google' | 'microsoft' | 'proton';
  wallpaperEnabled: boolean;
  wallpaperProvider: 'upload' | 'pexels' | 'media_commons' | 'bing';
  wallpaperImage: string;
  colorFromWallpaper: boolean;
  wallpaperColor: string;
  wallpaperOverlay: number;
  wallpaperRefreshInterval: 'daily' | 'hourly' | '15m' | '5m';
  bingCountry: string;
  customTabName: string;
  customFavicon: boolean;
  hideGoogleShortcuts: boolean;
}

export type WallpaperProvider = 'upload' | 'pexels' | 'media_commons' | 'bing';

export interface WallpaperCacheItem {
  url: string;
  credit?: string;
  creditUrl?: string;
  creditHtml?: string;
  dominantColor?: string;
}

export interface WallpaperCacheQueue {
  date: string;
  items: WallpaperCacheItem[];
  currentIndex: number;
}

export interface CityData {
  name: string;
  lat: number;
  lon: number;
  country?: string;
}

export interface WeatherApiResponse {
  current_weather: {
    temperature: number;
    weathercode: number;
    is_day: number | boolean;
  };
}

export interface WeatherCache {
  timestamp: number;
  lat: number;
  lon: number;
  data: WeatherApiResponse;
}

interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
  admin2?: string;
  admin3?: string;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

interface LauncherApp {
  name: string;
  url: string;
  icon: string;
}

export interface LauncherProviderData {
  apps: LauncherApp[];
  allAppsLink: string;
}

export interface SnackbarOptions {
  text: string;
  actionText?: string | null;
  duration?: number;
  onAction?: () => void;
  priority?: number;
}

export interface WarningModalOptions {
  title: string;
  messageHtml: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

type ShortcutItemType = 'link' | 'folder';

export interface ShortcutItem {
  id: string;
  type?: ShortcutItemType;
  name: string;
  url?: string;
  iconUrl?: string;
  customIcon?: string | null;
  children?: ShortcutItem[];
}

