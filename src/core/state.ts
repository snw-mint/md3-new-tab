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
      weatherEnabled: false,
      tempUnit: 'C',
      weatherCity: '',
      shortcutsEnabled: true,
      shortcutsRows: '1',
      launcherEnabled: true,
      launcherProvider: 'google',
    };

    const savedState = localStorage.getItem(this.storageKey);
    const initialState = savedState
      ? { ...defaultState, ...JSON.parse(savedState) }
      : defaultState;

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
