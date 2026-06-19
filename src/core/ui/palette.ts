/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import {
  hexFromArgb,
  argbFromHex,
  Scheme,
  Hct,
} from '@material/material-color-utilities';

const PREDEFINED_SOURCES: Record<string, string> = {
  default: '#0B57D0',
  expressive: '#65558F',
  leaf: '#518242',
  gold: '#797A1E',
  sun: '#D87739',
  candy: '#B90063',
  love: '#C0001B',
};

class PaletteManager {
  private buttons: NodeListOf<HTMLButtonElement>;
  private storageKey: string = 'ent_selected_palette';
  private customColorKey: string = 'ent_custom_color';

  constructor() {
    this.buttons = document.querySelectorAll<HTMLButtonElement>(
      '.color-circle-btn[data-palette]',
    );
    this.init();
    this.initColorPicker();
  }

  private init(): void {
    const savedPalette = localStorage.getItem(this.storageKey) || 'default';
    const savedCustomColor =
      localStorage.getItem(this.customColorKey) ||
      PREDEFINED_SOURCES['default'];

    this.processTheme(savedPalette, savedCustomColor);
    this.updateActiveUI(savedPalette);

    this.buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        const palette = target.dataset.palette;

        if (palette && palette !== 'custom') {
          const customColor =
            localStorage.getItem(this.customColorKey) ||
            PREDEFINED_SOURCES['default'];
          this.processTheme(palette, customColor);
          this.updateActiveUI(palette);
          localStorage.setItem(this.storageKey, palette);
        }
      });
    });
  }

  private initColorPicker(): void {
    const modal = document.getElementById('customColorModal');
    const overlay = document.getElementById('colorPickerOverlay');
    const slider = document.getElementById('hueSlider') as HTMLInputElement;
    const closeBtn = document.getElementById('closeColorPickerBtn');
    const customBtn = document.getElementById('customColorPickerBtn');

    if (!modal || !overlay || !slider || !closeBtn || !customBtn) return;

    const toggleModal = (show: boolean) => {
      if (show) {
        modal.classList.add('active');
        overlay.classList.add('active');
      } else {
        modal.classList.remove('active');
        overlay.classList.remove('active');
      }
    };

    const applyHue = (save: boolean = false) => {
      const hue = parseFloat(slider.value);
      slider.style.setProperty('--current-hue', hue.toString());

      if (save) {
        const argb = Hct.from(hue, 100, 50).toInt();
        const hex = hexFromArgb(argb);
        localStorage.setItem(this.customColorKey, hex);
        localStorage.setItem(this.storageKey, 'custom');
        this.processTheme('custom', hex);
        this.updateActiveUI('custom');
      }
    };

    const savedCustomColor =
      localStorage.getItem(this.customColorKey) ||
      PREDEFINED_SOURCES['default'];
    const initialHct = Hct.fromInt(argbFromHex(savedCustomColor));
    slider.value = initialHct.hue.toString();
    slider.style.setProperty('--current-hue', initialHct.hue.toString());

    customBtn.addEventListener('click', () => toggleModal(true));

    closeBtn.addEventListener('click', () => {
      applyHue(true);
      toggleModal(false);
    });

    overlay.addEventListener('click', () => {
      applyHue(true);
      toggleModal(false);
    });

    slider.addEventListener('input', () => applyHue(false));
    slider.addEventListener('change', () => applyHue(true));
  }

  private processTheme(palette: string, customColorHex: string): void {
    let sourceHex = PREDEFINED_SOURCES[palette];

    if (!sourceHex && palette === 'custom') {
      sourceHex = customColorHex;
    } else if (!sourceHex) {
      sourceHex = PREDEFINED_SOURCES['default'];
      palette = 'default';
    }

    const argb = argbFromHex(sourceHex);
    this.applyDynamicRoles(argb, palette);
  }

  private applyDynamicRoles(argb: number, paletteId: string): void {
    const lightScheme = Scheme.light(argb);
    const darkScheme = Scheme.dark(argb);

    const hctSource = Hct.fromInt(argb);
    const baseHue = hctSource.hue;

    const root = document.documentElement;

    root.style.setProperty(
      '--sys-primary-light',
      hexFromArgb(lightScheme.primary),
    );
    root.style.setProperty(
      '--sys-on-primary-light',
      hexFromArgb(lightScheme.onPrimary),
    );
    root.style.setProperty(
      '--sys-primary-container-light',
      hexFromArgb(lightScheme.primaryContainer),
    );
    root.style.setProperty(
      '--sys-on-primary-container-light',
      hexFromArgb(lightScheme.onPrimaryContainer),
    );
    root.style.setProperty(
      '--sys-secondary-container-light',
      hexFromArgb(lightScheme.secondaryContainer),
    );
    root.style.setProperty(
      '--sys-on-secondary-container-light',
      hexFromArgb(lightScheme.onSecondaryContainer),
    );
    root.style.setProperty(
      '--sys-surface-variant-light',
      hexFromArgb(lightScheme.surfaceVariant),
    );
    root.style.setProperty(
      '--sys-on-surface-variant-light',
      hexFromArgb(lightScheme.onSurfaceVariant),
    );
    root.style.setProperty(
      '--sys-background-light',
      hexFromArgb(lightScheme.background),
    );
    root.style.setProperty(
      '--sys-surface-light',
      hexFromArgb(lightScheme.surface),
    );
    root.style.setProperty(
      '--sys-surface-container-light',
      hexFromArgb(Hct.from(baseHue, 4, 94).toInt()),
    );
    root.style.setProperty(
      '--sys-surface-container-highest-light',
      hexFromArgb(Hct.from(baseHue, 4, 90).toInt()),
    );

    root.style.setProperty(
      '--sys-primary-dark',
      hexFromArgb(darkScheme.primary),
    );
    root.style.setProperty(
      '--sys-on-primary-dark',
      hexFromArgb(darkScheme.onPrimary),
    );
    root.style.setProperty(
      '--sys-primary-container-dark',
      hexFromArgb(darkScheme.primaryContainer),
    );
    root.style.setProperty(
      '--sys-on-primary-container-dark',
      hexFromArgb(darkScheme.onPrimaryContainer),
    );
    root.style.setProperty(
      '--sys-secondary-container-dark',
      hexFromArgb(darkScheme.secondaryContainer),
    );
    root.style.setProperty(
      '--sys-on-secondary-container-dark',
      hexFromArgb(darkScheme.onSecondaryContainer),
    );

    const isDefault = paletteId === 'default';

    root.style.setProperty(
      '--sys-surface-variant-dark',
      isDefault ? '#444444' : hexFromArgb(darkScheme.surfaceVariant),
    );
    root.style.setProperty(
      '--sys-on-surface-variant-dark',
      hexFromArgb(darkScheme.onSurfaceVariant),
    );
    root.style.setProperty(
      '--sys-background-dark',
      isDefault ? '#282828' : hexFromArgb(darkScheme.background),
    );
    root.style.setProperty(
      '--sys-surface-dark',
      isDefault ? '#282828' : hexFromArgb(darkScheme.surface),
    );
    root.style.setProperty(
      '--sys-surface-container-dark',
      isDefault ? '#323232' : hexFromArgb(Hct.from(baseHue, 4, 12).toInt()),
    );
    root.style.setProperty(
      '--sys-surface-container-highest-dark',
      isDefault ? '#3c3c3c' : hexFromArgb(Hct.from(baseHue, 4, 22).toInt()),
    );

    root.setAttribute('data-palette', paletteId);

    const cssVarNames = [
      '--sys-primary-light', '--sys-on-primary-light',
      '--sys-primary-container-light', '--sys-on-primary-container-light',
      '--sys-secondary-container-light', '--sys-on-secondary-container-light',
      '--sys-surface-variant-light', '--sys-on-surface-variant-light',
      '--sys-background-light', '--sys-surface-light',
      '--sys-surface-container-light', '--sys-surface-container-highest-light',
      '--sys-primary-dark', '--sys-on-primary-dark',
      '--sys-primary-container-dark', '--sys-on-primary-container-dark',
      '--sys-secondary-container-dark', '--sys-on-secondary-container-dark',
      '--sys-surface-variant-dark', '--sys-on-surface-variant-dark',
      '--sys-background-dark', '--sys-surface-dark',
      '--sys-surface-container-dark', '--sys-surface-container-highest-dark',
    ];
    const cache: Record<string, string> = {};
    const computed = getComputedStyle(root);
    cssVarNames.forEach((name) => {
      const val = root.style.getPropertyValue(name) || computed.getPropertyValue(name).trim();
      if (val) cache[name] = val;
    });
    localStorage.setItem('ent_cached_palette_vars', JSON.stringify(cache));
  }

  private updateActiveUI(paletteId: string): void {
    this.buttons.forEach((btn) => btn.classList.remove('active'));
    const activeBtn = document.querySelector(
      `.color-circle-btn[data-palette="${paletteId}"]`,
    );
    if (activeBtn) activeBtn.classList.add('active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PaletteManager();
});
