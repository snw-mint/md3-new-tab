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
  clock12hFormat: boolean;
  clockShowDate: boolean;
  weatherEnabled: boolean;
  tempUnit: 'C' | 'F';
  weatherCity: string;
  searchEnabled: boolean;
  searchSuggestionsEnabled: boolean;
  shortcutsEnabled: boolean;
  shortcutsRows: string;
  launcherEnabled: boolean;
  launcherProvider: 'google' | 'microsoft' | 'proton';
  wallpaperEnabled: boolean;
  wallpaperImage: string;
  colorFromWallpaper: boolean;
  wallpaperColor: string;
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
  city: string;
  data: WeatherApiResponse;
}

export interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
  admin2?: string;
  admin3?: string;
}

export interface GeocodingResponse {
  results?: GeocodingResult[];
}

export interface LauncherApp {
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
  actionHtml?: string | null;
  duration?: number;
  onAction?: () => void;
}

export interface WarningModalOptions {
  title: string;
  messageHtml: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}
