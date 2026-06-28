/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { hexFromArgb, argbFromHex, Scheme, Hct } from '@material/material-color-utilities';

export function updateFavicon(): void {
  const root = document.documentElement;
  const computed = getComputedStyle(root);
  const primary = computed.getPropertyValue('--color-primary').trim() || '#0b57d0';

  const svg = `<svg width="380" height="380" viewBox="0 0 380 380" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M303.126 76.863c-11.875-11.875-38.932-6.003-71.579 12.818C221.771 53.286 206.79 30 189.996 30c-16.793 0-31.773 23.284-41.549 59.678-32.645-18.82-59.7-24.69-71.575-12.817-11.875 11.876-6.002 38.935 12.823 71.585C53.29 158.222 30 173.204 30 190c0 16.793 23.283 31.773 59.675 41.549-18.825 32.651-24.7 59.712-12.824 71.588s38.939 6.001 71.593-12.827c9.776 36.401 24.757 59.69 41.552 59.69 16.796 0 31.778-23.291 41.554-59.693 32.655 18.829 59.72 24.705 71.596 12.829s6.002-38.936-12.823-71.587C326.716 221.773 350 206.793 350 190c0-16.796-23.292-31.778-59.696-41.554 18.824-32.649 24.697-59.708 12.822-71.583" fill="${primary}"/></svg>`;

  const svgDataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = svgDataUri;
}

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
    this.buttons = document.querySelectorAll<HTMLButtonElement>('.color-circle-btn[data-palette]');
    this.init();
    this.initColorPicker();
  }

  private init(): void {
    const savedPalette = localStorage.getItem(this.storageKey) || 'expressive';
    const savedCustomColor = localStorage.getItem(this.customColorKey) || PREDEFINED_SOURCES['expressive'];

    this.processTheme(savedPalette, savedCustomColor);
    this.updateActiveUI(savedPalette);

    this.buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        const palette = target.dataset.palette;

        if (palette && palette !== 'custom') {
          const customColor = localStorage.getItem(this.customColorKey) || PREDEFINED_SOURCES['expressive'];
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

    const savedCustomColor = localStorage.getItem(this.customColorKey) || PREDEFINED_SOURCES['default'];
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
    const isDefault = paletteId === 'default';
    const lightScheme = Scheme.light(argb);
    const darkScheme = Scheme.dark(argb);

    const hctSource = Hct.fromInt(argb);
    const baseHue = hctSource.hue;

    const root = document.documentElement;

    root.style.setProperty('--sys-primary-light', hexFromArgb(lightScheme.primary));
    root.style.setProperty('--sys-on-primary-light', hexFromArgb(lightScheme.onPrimary));
    root.style.setProperty('--sys-primary-container-light', hexFromArgb(lightScheme.primaryContainer));
    root.style.setProperty('--sys-on-primary-container-light', hexFromArgb(lightScheme.onPrimaryContainer));
    root.style.setProperty('--sys-secondary-container-light', hexFromArgb(lightScheme.secondaryContainer));
    root.style.setProperty('--sys-on-secondary-container-light', hexFromArgb(lightScheme.onSecondaryContainer));
    root.style.setProperty('--sys-tertiary-light', hexFromArgb(lightScheme.tertiary));
    root.style.setProperty('--sys-on-tertiary-light', hexFromArgb(lightScheme.onTertiary));
    root.style.setProperty('--sys-tertiary-container-light', hexFromArgb(lightScheme.tertiaryContainer));
    root.style.setProperty('--sys-on-tertiary-container-light', hexFromArgb(lightScheme.onTertiaryContainer));
    root.style.setProperty('--sys-surface-variant-light', hexFromArgb(lightScheme.surfaceVariant));
    root.style.setProperty('--sys-on-surface-variant-light', hexFromArgb(lightScheme.onSurfaceVariant));
    root.style.setProperty('--sys-background-light', isDefault ? '#ffffff' : hexFromArgb(lightScheme.background));
    root.style.setProperty(
      '--sys-surface-light',
      isDefault ? '#ffffff' : hexFromArgb(Hct.from(baseHue, 4, 98).toInt()),
    );
    root.style.setProperty(
      '--sys-surface-container-light',
      isDefault ? '#ffffff' : hexFromArgb(Hct.from(baseHue, 4, 94).toInt()),
    );
    root.style.setProperty(
      '--sys-surface-container-highest-light',
      isDefault ? '#ffffff' : hexFromArgb(Hct.from(baseHue, 4, 90).toInt()),
    );

    root.style.setProperty('--sys-primary-dark', hexFromArgb(darkScheme.primary));
    root.style.setProperty('--sys-on-primary-dark', hexFromArgb(darkScheme.onPrimary));
    root.style.setProperty('--sys-primary-container-dark', hexFromArgb(darkScheme.primaryContainer));
    root.style.setProperty('--sys-on-primary-container-dark', hexFromArgb(darkScheme.onPrimaryContainer));
    root.style.setProperty('--sys-secondary-container-dark', hexFromArgb(darkScheme.secondaryContainer));
    root.style.setProperty('--sys-on-secondary-container-dark', hexFromArgb(darkScheme.onSecondaryContainer));
    root.style.setProperty('--sys-tertiary-dark', hexFromArgb(darkScheme.tertiary));
    root.style.setProperty('--sys-on-tertiary-dark', hexFromArgb(darkScheme.onTertiary));
    root.style.setProperty('--sys-tertiary-container-dark', hexFromArgb(darkScheme.tertiaryContainer));
    root.style.setProperty('--sys-on-tertiary-container-dark', hexFromArgb(darkScheme.onTertiaryContainer));

    root.style.setProperty(
      '--sys-surface-variant-dark',
      isDefault ? '#444444' : hexFromArgb(darkScheme.surfaceVariant),
    );
    root.style.setProperty('--sys-on-surface-variant-dark', hexFromArgb(darkScheme.onSurfaceVariant));
    root.style.setProperty('--sys-background-dark', isDefault ? '#282828' : hexFromArgb(darkScheme.background));
    root.style.setProperty('--sys-surface-dark', isDefault ? '#282828' : hexFromArgb(darkScheme.surface));
    root.style.setProperty(
      '--sys-surface-container-dark',
      isDefault ? '#323232' : hexFromArgb(Hct.from(baseHue, 4, 12).toInt()),
    );
    root.style.setProperty(
      '--sys-surface-container-highest-dark',
      isDefault ? '#3c3c3c' : hexFromArgb(Hct.from(baseHue, 4, 22).toInt()),
    );

    root.setAttribute('data-palette', paletteId);
    setTimeout(() => updateFavicon(), 0);

    const cssVarNames = [
      '--sys-primary-light',
      '--sys-on-primary-light',
      '--sys-primary-container-light',
      '--sys-on-primary-container-light',
      '--sys-secondary-container-light',
      '--sys-on-secondary-container-light',
      '--sys-tertiary-light',
      '--sys-on-tertiary-light',
      '--sys-tertiary-container-light',
      '--sys-on-tertiary-container-light',
      '--sys-surface-variant-light',
      '--sys-on-surface-variant-light',
      '--sys-background-light',
      '--sys-surface-light',
      '--sys-surface-container-light',
      '--sys-surface-container-highest-light',
      '--sys-primary-dark',
      '--sys-on-primary-dark',
      '--sys-primary-container-dark',
      '--sys-on-primary-container-dark',
      '--sys-secondary-container-dark',
      '--sys-on-secondary-container-dark',
      '--sys-tertiary-dark',
      '--sys-on-tertiary-dark',
      '--sys-tertiary-container-dark',
      '--sys-on-tertiary-container-dark',
      '--sys-surface-variant-dark',
      '--sys-on-surface-variant-dark',
      '--sys-background-dark',
      '--sys-surface-dark',
      '--sys-surface-container-dark',
      '--sys-surface-container-highest-dark',
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
    const activeBtn = document.querySelector(`.color-circle-btn[data-palette="${paletteId}"]`);
    if (activeBtn) activeBtn.classList.add('active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PaletteManager();
  updateFavicon();
});
