/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { AppSettings } from './types';

type StateListener = (state: AppSettings) => void;

class ReactiveState {
  private state: AppSettings;
  private listeners: Set<StateListener> = new Set();
  private storageKey = 'ent_global_settings';

  constructor() {
    const defaultState: AppSettings = {
      displayEnabled: true,
      displayStyle: 'greetings',
      greetingName: '',
      greetingHighlightName: false,
      greetingScale: 1.7,
      clock12hFormat: false,
      clockShowDate: true,
      clockExpressiveColor: false,
      clockStyle: 'Expressive Clock',
      clockScale: 6,
      weatherEnabled: false,
      tempUnit: 'C',
      weatherCity: '',
      searchEnabled: true,
      searchSuggestionsEnabled: false,
      shortcutsEnabled: true,
      shortcutsRows: '1',
      hideShortcutNames: false,
      launcherEnabled: true,
      launcherProvider: 'google',
      wallpaperEnabled: false,
      wallpaperProvider: 'upload',
      wallpaperImage: '',
      colorFromWallpaper: false,
      wallpaperColor: '',
      wallpaperOverlay: 0.3,
      wallpaperRefreshInterval: 'daily',
      bingCountry: 'us',
      customTabName: '',
      customFavicon: true,
      hideGoogleShortcuts: false,
    };

    const validClockStyles = [
      'Expressive Clock',
      'Playful Clock',
      'Round Clock',
      'Ultra Clock',
      'Retro Clock',
    ];

    const savedState = localStorage.getItem(this.storageKey);
    const initialState = savedState
      ? { ...defaultState, ...JSON.parse(savedState) }
      : defaultState;

    if ((initialState.wallpaperProvider as any) === 'unsplash') {
      initialState.wallpaperProvider = 'upload';
    }

    if (!validClockStyles.includes(initialState.clockStyle)) {
      initialState.clockStyle = 'Expressive Clock';
    }

    if (typeof initialState.greetingScale !== 'number' || isNaN(initialState.greetingScale)) {
      initialState.greetingScale = 1.7;
    }

    if (typeof initialState.clockScale !== 'number' || isNaN(initialState.clockScale)) {
      initialState.clockScale = 6;
    }

    if (!initialState.bingCountry) {
      initialState.bingCountry = 'us';
    }

    this.state = new Proxy(initialState, {
      set: (target, property, value) => {
        target[property as keyof AppSettings] = value;
        localStorage.setItem(this.storageKey, JSON.stringify(target));
        this.notify();
        return true;
      },
    });
  }

  public get current(): AppSettings {
    return this.state;
  }

  public subscribe(listener: StateListener): void {
    this.listeners.add(listener);
    listener(this.state);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }
}

export const globalState = new ReactiveState();

const wallpaperMemoryCache = new Map<string, any>();

export function getWallpaperCache(cacheKey: string): any {
  if (wallpaperMemoryCache.has(cacheKey)) {
    return wallpaperMemoryCache.get(cacheKey) || null;
  }
  try {
    const cached = JSON.parse(
      localStorage.getItem(cacheKey) || 'null',
    );
    wallpaperMemoryCache.set(cacheKey, cached);
    return cached;
  } catch (e) {
    console.error('Error reading cache', e);
    return null;
  }
}

export function setWallpaperCache(
  cacheKey: string,
  entry: any,
): void {
  wallpaperMemoryCache.set(cacheKey, entry);
  try {
    localStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (e) {
    console.error('Error writing cache', e);
  }
}
