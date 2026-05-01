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
  green: '#518242',
  sun: '#8F4E24',
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

    root.style.setProperty(
      '--sys-surface-variant-dark',
      hexFromArgb(Hct.from(baseHue, 12, 12).toInt()),
    );
    root.style.setProperty(
      '--sys-on-surface-variant-dark',
      hexFromArgb(darkScheme.onSurfaceVariant),
    );
    root.style.setProperty(
      '--sys-background-dark',
      hexFromArgb(Hct.from(baseHue, 12, 24).toInt()),
    );
    root.style.setProperty(
      '--sys-surface-dark',
      hexFromArgb(Hct.from(baseHue, 12, 24).toInt()),
    );

    root.setAttribute('data-palette', paletteId);
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
