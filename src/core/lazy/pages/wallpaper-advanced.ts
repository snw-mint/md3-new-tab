/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

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

    <div class="settings-group-card" id="advWallpaperIntervalCard">
      <h3 class="settings-group-title" data-i18n="refreshIntervalTitle" style="margin-bottom: 1.5rem;">Refresh interval</h3>

      <div class="md3-outlined-select-wrapper">
        <button type="button" id="advWallpaperIntervalSelect" class="md3-outlined-select md3-select-trigger" aria-label="Refresh interval" value="daily">
          <span class="md3-select-value" data-i18n="intervalDaily">Every Day</span>
          <template class="md3-select-options">
            <div data-value="daily" data-i18n="intervalDaily">Every Day</div>
            <div data-value="hourly" data-i18n="intervalHourly">Every Hour</div>
            <div data-value="15m" data-i18n="interval15m">Every 15 Minutes</div>
            <div data-value="5m" data-i18n="interval5m">Every 5 Minutes</div>
          </template>
        </button>
        <label for="advWallpaperIntervalSelect" class="md3-select-label" data-i18n="refreshIntervalLabel">Refresh interval</label>
        <svg class="dropdown-icon" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
          <path d="M459-381 314-526q-3-3-4.5-6.5T308-540q0-8 5.5-14t14.5-6h304q9 0 14.5 6t5.5 14q0 2-6 14L501-381q-5 5-10 7t-11 2-11-2-10-7" />
        </svg>
      </div>
    </div>
  </div>
`;

export function init(container: HTMLElement): void {
  const wallpaperOverlaySlider = container.querySelector<HTMLInputElement>('#advWallpaperOverlaySlider');
  const wallpaperIntervalSelect = container.querySelector<HTMLButtonElement>('#advWallpaperIntervalSelect');

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
  }

  if (wallpaperIntervalSelect) {
    import('../md3-select').then(({ initCustomSelectSystem }) => {
      initCustomSelectSystem();
    });

    const currentVal = globalState.current.wallpaperRefreshInterval || 'daily';
    wallpaperIntervalSelect.value = currentVal;
    wallpaperIntervalSelect.setAttribute('value', currentVal);

    wallpaperIntervalSelect.addEventListener('change', (e) => {
      const target = e.target as HTMLButtonElement;
      globalState.current.wallpaperRefreshInterval = target.value as any;
    });
  }

  const syncState = () => {
    const state = globalState.current;

    if (wallpaperOverlaySlider) {
      const isDisabled = !state.wallpaperEnabled || (state.wallpaperProvider === 'upload' && !state.wallpaperImage);
      wallpaperOverlaySlider.disabled = isDisabled;

      const sliderGroup = wallpaperOverlaySlider.closest('.slider-group');
      if (sliderGroup) {
        sliderGroup.classList.toggle('disabled', isDisabled);
      }

      if (wallpaperOverlaySlider.value !== state.wallpaperOverlay.toString()) {
        wallpaperOverlaySlider.value = state.wallpaperOverlay.toString();
        const progress = (state.wallpaperOverlay / 0.8) * 100;
        wallpaperOverlaySlider.style.setProperty('--slider-progress', `${progress}%`);
      }
    }

    if (wallpaperIntervalSelect) {
      const currentInterval = state.wallpaperRefreshInterval || 'daily';
      if (wallpaperIntervalSelect.value !== currentInterval) {
        wallpaperIntervalSelect.value = currentInterval;
        wallpaperIntervalSelect.setAttribute('value', currentInterval);
      }
    }
  };

  syncState();
  globalState.subscribe(syncState);

  applyTranslations(container);
}

export default { template, init } satisfies SidebarPageModule;
