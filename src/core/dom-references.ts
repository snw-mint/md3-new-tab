/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

export const DOM = {
  header: {
    get appLauncherBtn(): HTMLButtonElement | null {
      return document.getElementById('appLauncherBtn') as HTMLButtonElement | null;
    },
  },
  settings: {
    get weatherToggle(): HTMLInputElement | null {
      return document.getElementById(
        'weatherToggle',
      ) as HTMLInputElement | null;
    },
    get weatherBlock(): HTMLElement | null {
      return document.getElementById('weatherSettingsBlock');
    },
    get shortcutsToggle(): HTMLInputElement | null {
      return document.getElementById(
        'shortcutsToggle',
      ) as HTMLInputElement | null;
    },
    get shortcutsBlock(): HTMLElement | null {
      return document.getElementById('shortcutsSettingsBlock');
    },
    get launcherToggle(): HTMLInputElement | null {
      return document.getElementById('launcherToggle') as HTMLInputElement | null;
    },
    get launcherBlock(): HTMLElement | null {
      return document.getElementById('launcherSettingsBlock');
    },
  },
};
