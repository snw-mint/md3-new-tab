import type { SidebarPageModule } from '../../ui/sidebar-router';
import { globalState } from '../../shared/state';
import { applyTranslations } from '../../shared/i18n';

export const template = `<div class="settings-inner-card">
    <div class="settings-back-card">
      <div class="back-card-header">
        <button type="button" class="back-chevron-btn" data-sidebar-back aria-label="Back to Wallpaper">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
            <path d="m432-480 156 156q11 11 11 28t-11 28q-11 11-28 11t-28-11L348-452q-6-6-8.5-13t-2.5-15q0-8 2.5-15t8.5-13l184-184q11-11 28-11t28 11q11 11 11 28t-11 28L432-480Z"/>
          </svg>
        </button>
        <span class="back-card-label" data-i18n="wallpaperTitle">Wallpaper</span>
      </div>
    </div>

    <div class="settings-group-card">
      <h3 class="settings-group-title" data-i18n="visibilityTitle">Visibility</h3>

      <div class="slider-group" style="margin-top: 1.5rem;">
        <div class="slider-header" style="margin-bottom: 0.5rem">
          <span style="position: relative; display: inline-flex; align-items: center">
            <span class="slider-label" style="font-size: 0.875rem; color: var(--color-on-surface); font-weight: 500" data-i18n="wallpaperOverlayTitle">Wallpaper overlay</span>
          </span>
        </div>
        <div class="md3-slider-wrapper">
          <input type="range" id="advWallpaperOverlaySlider" class="md3-custom-slider" min="0" max="0.8" step="0.01" value="0.3" />
        </div>
      </div>
    </div>
  </div>
`;

export function init(container: HTMLElement): void {
  const wallpaperOverlaySlider = container.querySelector<HTMLInputElement>('#advWallpaperOverlaySlider');

  if (wallpaperOverlaySlider) {
    const updateSliderProgress = (value: number) => {
      const progress = (value / 0.8) * 100;
      wallpaperOverlaySlider.style.setProperty('--slider-progress', `${progress}%`);
    };

    wallpaperOverlaySlider.value = globalState.current.wallpaperOverlay.toString();
    updateSliderProgress(globalState.current.wallpaperOverlay);

    wallpaperOverlaySlider.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const val = parseFloat(target.value);
      globalState.current.wallpaperOverlay = val;
      updateSliderProgress(val);
    });

    const syncState = () => {
      const state = globalState.current;
      const isDisabled = !state.wallpaperEnabled || !state.wallpaperImage;
      wallpaperOverlaySlider.disabled = isDisabled;

      const sliderGroup = wallpaperOverlaySlider.closest('.slider-group');
      if (sliderGroup) {
        sliderGroup.classList.toggle('disabled', isDisabled);
      }

      if (wallpaperOverlaySlider.value !== state.wallpaperOverlay.toString()) {
        wallpaperOverlaySlider.value = state.wallpaperOverlay.toString();
        updateSliderProgress(state.wallpaperOverlay);
      }
    };

    syncState();
    globalState.subscribe(syncState);
  }

  applyTranslations(container);
}

export default { template, init } satisfies SidebarPageModule;
