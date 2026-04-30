/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import {
  Hct,
  hexFromArgb,
  argbFromHex,
} from '@material/material-color-utilities';

const PREDEFINED_SOURCES: Record<string, string> = {
  default: '#0B57D0',
  expressive: '#65558F',
  green: '#518242',
  sun: '#8F4E24',
};

class PaletteManager {
  private buttons: NodeListOf<HTMLButtonElement>;
  private colorInput: HTMLInputElement | null;
  private storageKey: string = 'ent_selected_palette';
  private customColorKey: string = 'ent_custom_color';

  constructor() {
    this.buttons = document.querySelectorAll<HTMLButtonElement>(
      '.color-circle-btn[data-palette]',
    );
    this.colorInput =
      document.querySelector<HTMLInputElement>('#customColorInput');
    this.init();
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

        if (palette) {
          const customColor =
            localStorage.getItem(this.customColorKey) ||
            PREDEFINED_SOURCES['default'];
          this.processTheme(palette, customColor);
          this.updateActiveUI(palette);
          localStorage.setItem(this.storageKey, palette);
        }
      });
    });

    if (this.colorInput) {
      this.colorInput.value = savedCustomColor;
      this.colorInput.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const hex = target.value;

        localStorage.setItem(this.customColorKey, hex);
        localStorage.setItem(this.storageKey, 'custom');
        this.processTheme('custom', hex);
        this.updateActiveUI('custom');
      });
    }
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
    const hct = Hct.fromInt(argb);
    const hue = hct.hue;
    const chroma = Math.max(48, hct.chroma);
    const root = document.documentElement;

    root.style.setProperty(
      '--sys-primary-light',
      hexFromArgb(Hct.from(hue, chroma, 40).toInt()),
    );
    root.style.setProperty(
      '--sys-on-primary-light',
      hexFromArgb(Hct.from(hue, chroma, 100).toInt()),
    );
    root.style.setProperty(
      '--sys-primary-container-light',
      hexFromArgb(Hct.from(hue, chroma, 90).toInt()),
    );
    root.style.setProperty(
      '--sys-on-primary-container-light',
      hexFromArgb(Hct.from(hue, chroma, 10).toInt()),
    );

    root.style.setProperty(
      '--sys-primary-dark',
      hexFromArgb(Hct.from(hue, chroma, 80).toInt()),
    );
    root.style.setProperty(
      '--sys-on-primary-dark',
      hexFromArgb(Hct.from(hue, chroma, 20).toInt()),
    );
    root.style.setProperty(
      '--sys-primary-container-dark',
      hexFromArgb(Hct.from(hue, chroma, 30).toInt()),
    );
    root.style.setProperty(
      '--sys-on-primary-container-dark',
      hexFromArgb(Hct.from(hue, chroma, 90).toInt()),
    );

    root.style.setProperty(
      '--sys-secondary-container-light',
      hexFromArgb(Hct.from(hue, 16, 90).toInt()),
    );
    root.style.setProperty(
      '--sys-on-secondary-container-light',
      hexFromArgb(Hct.from(hue, 16, 10).toInt()),
    );
    root.style.setProperty(
      '--sys-secondary-container-dark',
      hexFromArgb(Hct.from(hue, 16, 30).toInt()),
    );
    root.style.setProperty(
      '--sys-on-secondary-container-dark',
      hexFromArgb(Hct.from(hue, 16, 90).toInt()),
    );

    root.style.setProperty(
      '--sys-surface-variant-light',
      hexFromArgb(Hct.from(hue, 8, 90).toInt()),
    );
    root.style.setProperty(
      '--sys-on-surface-variant-light',
      hexFromArgb(Hct.from(hue, 8, 30).toInt()),
    );
    root.style.setProperty(
      '--sys-surface-variant-dark',
      hexFromArgb(Hct.from(hue, 8, 30).toInt()),
    );
    root.style.setProperty(
      '--sys-on-surface-variant-dark',
      hexFromArgb(Hct.from(hue, 8, 90).toInt()),
    );

    root.style.setProperty(
      '--sys-surface-light',
      hexFromArgb(Hct.from(hue, 8, 100).toInt()),
    );
    root.style.setProperty(
      '--sys-surface-container-light',
      hexFromArgb(Hct.from(hue, 8, 98).toInt()),
    );

    root.style.setProperty(
      '--sys-surface-dark',
      hexFromArgb(Hct.from(hue, 8, 24).toInt()),
    );
    root.style.setProperty(
      '--sys-surface-container-dark',
      hexFromArgb(Hct.from(hue, 8, 16).toInt()),
    );

    root.setAttribute('data-palette', paletteId);
  }

  private updateActiveUI(paletteId: string): void {
    this.buttons.forEach((btn) => btn.classList.remove('active'));

    if (paletteId !== 'custom') {
      const activeBtn = document.querySelector(
        `.color-circle-btn[data-palette="${paletteId}"]`,
      );
      if (activeBtn) activeBtn.classList.add('active');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PaletteManager();
});
