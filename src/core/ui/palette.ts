import { globalState } from '../shared/state';

const DEFAULT_PALETTE = 'expressive';
const DEFAULT_COLOR = '#65558F';

export function updateFavicon(): void {
  const root = document.documentElement;
  const computed = getComputedStyle(root);
  const primary = computed.getPropertyValue('--color-primary').trim() || '#0b57d0';

  let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }

  if (globalState.current.customFavicon) {
    const svg = `<svg width="380" height="380" viewBox="0 0 380 380" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M303.126 76.863c-11.875-11.875-38.932-6.003-71.579 12.818C221.771 53.286 206.79 30 189.996 30c-16.793 0-31.773 23.284-41.549 59.678-32.645-18.82-59.7-24.69-71.575-12.817-11.875 11.876-6.002 38.935 12.823 71.585C53.29 158.222 30 173.204 30 190c0 16.793 23.283 31.773 59.675 41.549-18.825 32.651-24.7 59.712-12.824 71.588s38.939 6.001 71.593-12.827c9.776 36.401 24.757 59.69 41.552 59.69 16.796 0 31.778-23.291 41.554-59.693 32.655 18.829 59.72 24.705 71.596 12.829s6.002-38.936-12.823-71.587C326.716 221.773 350 206.793 350 190c0-16.796-23.292-31.778-59.696-41.554 18.824-32.649 24.697-59.708 12.822-71.583" fill="${primary}"/></svg>`;
    const svgDataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    link.href = svgDataUri;
  } else {
    link.href = '/assets/icon-128.png';
  }
}

class PaletteManager {
  private buttons: NodeListOf<HTMLButtonElement>;
  private storageKey = 'ent_selected_palette';
  private customColorKey = 'ent_custom_color';
  private lastAppliedSig: string | null = null;
  private pickerInitialized = false;

  constructor() {
    this.buttons = document.querySelectorAll<HTMLButtonElement>('.color-circle-btn[data-palette]');
    this.init();
    this.initColorPickerTrigger();
  }

  private getSignature(paletteId: string, color: string): string {
    const surfaceTint = localStorage.getItem('ent_surface_tint') ?? 'm3';
    return `${paletteId}:${paletteId === 'wallpaper' || paletteId === 'custom' ? color : ''}:${surfaceTint}`;
  }

  private isCacheValid(sig: string): boolean {
    return (
      Boolean(localStorage.getItem('ent_cached_palette_vars')) &&
      localStorage.getItem('ent_cached_palette_sig') === sig
    );
  }

  private async applyTheme(paletteId: string, customColorHex: string): Promise<void> {
    const sig = this.getSignature(paletteId, customColorHex);
    this.updateActiveUI(paletteId);

    if (this.lastAppliedSig === sig || this.isCacheValid(sig)) {
      this.lastAppliedSig = sig;
      document.documentElement.setAttribute('data-palette', paletteId);
      updateFavicon();
      return;
    }

    const { applyDynamicPalette } = await import('../lazy/palette-engine');
    applyDynamicPalette(paletteId, customColorHex, sig);
    this.lastAppliedSig = sig;
    setTimeout(() => updateFavicon(), 0);
  }

  private init(): void {
    globalState.subscribe((state) => {
      if (state.colorFromWallpaper && state.wallpaperEnabled && state.wallpaperColor) {
        void this.applyTheme('wallpaper', state.wallpaperColor);
      } else {
        const savedPalette = localStorage.getItem(this.storageKey) || DEFAULT_PALETTE;
        const savedCustomColor = localStorage.getItem(this.customColorKey) || DEFAULT_COLOR;
        void this.applyTheme(savedPalette, savedCustomColor);
      }
    });

    this.buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        const palette = target.dataset.palette;

        if (palette && palette !== 'custom') {
          globalState.current.colorFromWallpaper = false;
          const customColor = localStorage.getItem(this.customColorKey) || DEFAULT_COLOR;
          localStorage.setItem(this.storageKey, palette);
          void this.applyTheme(palette, customColor);
        }
      });
    });
  }

  private initColorPickerTrigger(): void {
    const customBtn = document.getElementById('customColorPickerBtn');
    if (!customBtn) return;

    const setupColorPicker = async () => {
      if (this.pickerInitialized) return;
      this.pickerInitialized = true;

      const modal = document.getElementById('customColorModal');
      const overlay = document.getElementById('colorPickerOverlay');
      const slider = document.getElementById('hueSlider') as HTMLInputElement | null;
      const closeBtn = document.getElementById('closeColorPickerBtn');
      if (!modal || !overlay || !slider || !closeBtn) return;

      const { getHueFromHex, getHexFromHue } = await import('../lazy/palette-engine');

      const toggleModal = (show: boolean) => {
        modal.classList.toggle('active', show);
        overlay.classList.toggle('active', show);
      };

      const applyHue = (save = false) => {
        const hue = parseFloat(slider.value);
        slider.style.setProperty('--current-hue', hue.toString());

        if (save) {
          const hex = getHexFromHue(hue);
          localStorage.setItem(this.customColorKey, hex);
          localStorage.setItem(this.storageKey, 'custom');
          globalState.current.colorFromWallpaper = false;
          void this.applyTheme('custom', hex);
        }
      };

      const savedCustomColor = localStorage.getItem(this.customColorKey) || '#0B57D0';
      const initialHue = getHueFromHex(savedCustomColor);
      slider.value = initialHue.toString();
      slider.style.setProperty('--current-hue', initialHue.toString());

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

      toggleModal(true);
    };

    customBtn.addEventListener('click', () => {
      if (!this.pickerInitialized) {
        void setupColorPicker();
      } else {
        document.getElementById('customColorModal')?.classList.add('active');
        document.getElementById('colorPickerOverlay')?.classList.add('active');
      }
    });
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
