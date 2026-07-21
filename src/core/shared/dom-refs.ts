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
    get wallpaperColorToggle(): HTMLInputElement | null {
      return document.getElementById('wallpaperColorToggle') as HTMLInputElement | null;
    },
    get wallpaperToggle(): HTMLInputElement | null {
      return document.getElementById('wallpaperToggle') as HTMLInputElement | null;
    },
    get wallpaperBlock(): HTMLElement | null {
      return document.getElementById('wallpaperSettingsBlock');
    },
    get wallpaperOverlaySlider(): HTMLInputElement | null {
      return document.getElementById('wallpaperOverlaySlider') as HTMLInputElement | null;
    },
    get wallpaperUploadBtn(): HTMLButtonElement | null {
      return document.getElementById('wallpaperUploadBtn') as HTMLButtonElement | null;
    },
    get wallpaperFileInput(): HTMLInputElement | null {
      return document.getElementById('wallpaperFileInput') as HTMLInputElement | null;
    },
    get wallpaperAddIcon(): HTMLElement | null {
      return document.getElementById('wallpaperAddIcon');
    },
    get wallpaperRemoveIcon(): HTMLElement | null {
      return document.getElementById('wallpaperRemoveIcon');
    },
    get wallpaperLayer(): HTMLElement | null {
      return document.getElementById('wallpaperLayer');
    },
    get displayToggle(): HTMLInputElement | null {
      return document.getElementById('displayToggle') as HTMLInputElement | null;
    },
    get displayBlock(): HTMLElement | null {
      return document.getElementById('displaySettingsBlock');
    },
    get displayStyleSelect(): HTMLButtonElement | null {
      return document.getElementById('displayStyleSelect') as HTMLButtonElement | null;
    },
    get weatherToggle(): HTMLInputElement | null {
      return document.getElementById('weatherToggle') as HTMLInputElement | null;
    },
    get weatherBlock(): HTMLElement | null {
      return document.getElementById('weatherSettingsBlock');
    },
    get shortcutsToggle(): HTMLInputElement | null {
      return document.getElementById('shortcutsToggle') as HTMLInputElement | null;
    },
    get shortcutsBlock(): HTMLElement | null {
      return document.getElementById('shortcutsSettingsBlock');
    },
    get searchToggle(): HTMLInputElement | null {
      return document.getElementById('searchToggle') as HTMLInputElement | null;
    },
    get searchSuggestionsToggle(): HTMLInputElement | null {
      return document.getElementById('searchSuggestionsToggle') as HTMLInputElement | null;
    },
    get searchBlock(): HTMLElement | null {
      return document.getElementById('searchSettingsBlock');
    },
    get launcherToggle(): HTMLInputElement | null {
      return document.getElementById('launcherToggle') as HTMLInputElement | null;
    },
    get launcherBlock(): HTMLElement | null {
      return document.getElementById('launcherSettingsBlock');
    },
  },
};
