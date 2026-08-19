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
import { WallpaperEngine } from '../wallpaper-engine';

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

    <div class="settings-group-card" id="advWallpaperControlsCard">
      <div class="wallpaper-controls-row">
        <h3 class="settings-group-title" data-i18n="wallpaperControlsTitle" style="margin-bottom: 0; flex: 1;">Playback controls</h3>
        <button type="button" id="advWallpaperBack" class="wallpaper-ctrl-btn" aria-label="Previous wallpaper">
          <span class="wallpaper-ctrl-bg wallpaper-ctrl-bg--tilt">
            <svg width="380" height="380" viewBox="0 0 380 380" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M230.389 50.473c62.72-27.24 126.378 36.418 99.138 99.138l-4.504 10.37a75.36 75.36 0 0 0 0 60.038l4.504 10.37c27.24 62.72-36.418 126.378-99.138 99.138l-10.37-4.504a75.36 75.36 0 0 0-60.038 0l-10.37 4.504c-62.72 27.24-126.378-36.418-99.138-99.138l4.504-10.37a75.36 75.36 0 0 0 0-60.038l-4.504-10.37c-27.24-62.72 36.418-126.378 99.138-99.138l10.37 4.504a75.36 75.36 0 0 0 60.038 0z" fill="currentColor"/></svg>
          </span>
          <span class="wallpaper-ctrl-icon">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="m313-440 196 196q12 12 11.5 28T508-188q-12 11-28 11.5T452-188L188-452q-6-6-8.5-13t-2.5-15 2.5-15 8.5-13l264-264q11-11 27.5-11t28.5 11q12 12 12 28.5T508-715L313-520h447q17 0 28.5 11.5T800-480t-11.5 28.5T760-440z"/></svg>
          </span>
        </button>

        <button type="button" id="advWallpaperPause" class="wallpaper-ctrl-btn wallpaper-ctrl-btn--pause" aria-label="Pause/Play wallpaper">
          <span class="wallpaper-ctrl-bg wallpaper-ctrl-bg--spin">
            <svg width="380" height="380" viewBox="0 0 380 380" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M338.584 189.998c25.843 48.166 6.318 91.773-43.518 105.063-13.295 49.841-56.902 69.361-105.068 43.523-48.167 25.843-91.773 6.318-105.064-43.518-49.836-13.295-69.361-56.902-43.518-105.068-25.843-48.167-6.318-91.773 43.518-105.064 13.29-49.836 56.897-69.361 105.064-43.518 48.166-25.843 91.773-6.318 105.063 43.518 49.841 13.29 69.361 56.897 43.523 105.064" fill="currentColor"/></svg>
          </span>
          <span class="wallpaper-ctrl-icon" id="advWallpaperPauseIcon">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M600-200q-33 0-56.5-23.5T520-280v-400q0-33 23.5-56.5T600-760h80q33 0 56.5 23.5T760-680v400q0 33-23.5 56.5T680-200zm-320 0q-33 0-56.5-23.5T200-280v-400q0-33 23.5-56.5T280-760h80q33 0 56.5 23.5T440-680v400q0 33-23.5 56.5T360-200zm320-80h80v-400h-80zm-320 0h80v-400h-80zm0-400v400zm320 0v400z"/></svg>
          </span>
        </button>

        <button type="button" id="advWallpaperNext" class="wallpaper-ctrl-btn" aria-label="Next wallpaper">
          <span class="wallpaper-ctrl-bg wallpaper-ctrl-bg--tilt">
            <svg width="380" height="380" viewBox="0 0 380 380" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M230.389 50.473c62.72-27.24 126.378 36.418 99.138 99.138l-4.504 10.37a75.36 75.36 0 0 0 0 60.038l4.504 10.37c27.24 62.72-36.418 126.378-99.138 99.138l-10.37-4.504a75.36 75.36 0 0 0-60.038 0l-10.37 4.504c-62.72 27.24-126.378-36.418-99.138-99.138l4.504-10.37a75.36 75.36 0 0 0 0-60.038l-4.504-10.37c-27.24-62.72 36.418-126.378 99.138-99.138l10.37 4.504a75.36 75.36 0 0 0 60.038 0z" fill="currentColor"/></svg>
          </span>
          <span class="wallpaper-ctrl-icon">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M647-440H200q-17 0-28.5-11.5T160-480t11.5-28.5T200-520h447L451-716q-12-12-11.5-28t12.5-28q12-11 28-11.5t28 11.5l264 264q6 6 8.5 13t2.5 15-2.5 15-8.5 13L508-188q-11 11-27.5 11T452-188q-12-12-12-28.5t12-28.5z"/></svg>
          </span>
        </button>
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
        <label for="advWallpaperIntervalSelect" class="md3-select-label" data-i18n="refreshIntervalLabel">Time</label>
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

  const controlsCard = container.querySelector<HTMLElement>('#advWallpaperControlsCard');
  const backBtn = container.querySelector<HTMLButtonElement>('#advWallpaperBack');
  const pauseBtn = container.querySelector<HTMLButtonElement>('#advWallpaperPause');
  const nextBtn = container.querySelector<HTMLButtonElement>('#advWallpaperNext');
  const pauseIcon = container.querySelector<HTMLElement>('#advWallpaperPauseIcon');

  const PAUSE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M600-200q-33 0-56.5-23.5T520-280v-400q0-33 23.5-56.5T600-760h80q33 0 56.5 23.5T760-680v400q0 33-23.5 56.5T680-200zm-320 0q-33 0-56.5-23.5T200-280v-400q0-33 23.5-56.5T280-760h80q33 0 56.5 23.5T440-680v400q0 33-23.5 56.5T360-200zm320-80h80v-400h-80zm-320 0h80v-400h-80zm0-400v400zm320 0v400z"/></svg>`;
  const PLAY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M320-273v-414q0-17 12-28.5t28-11.5q5 0 10.5 1.5T381-721l326 207q9 6 13.5 15t4.5 19-4.5 19-13.5 15L381-239q-5 3-10.5 4.5T360-233q-16 0-28-11.5T320-273m80-73 210-134-210-134z"/></svg>`;

  const updatePauseIcon = () => {
    if (!pauseIcon) return;
    pauseIcon.innerHTML = WallpaperEngine.isPaused() ? PLAY_SVG : PAUSE_SVG;
    pauseBtn?.classList.toggle('is-paused', WallpaperEngine.isPaused());
  };

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      const bg = backBtn.querySelector<HTMLElement>('.wallpaper-ctrl-bg--tilt');
      bg?.classList.add('tilt-once');
      bg?.addEventListener('animationend', () => bg.classList.remove('tilt-once'), { once: true });
      WallpaperEngine.prevWallpaper();
    });
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      const bg = pauseBtn.querySelector<HTMLElement>('.wallpaper-ctrl-bg--spin');
      bg?.classList.add('spin-once');
      bg?.addEventListener('animationend', () => bg.classList.remove('spin-once'), { once: true });
      WallpaperEngine.togglePause();
      updatePauseIcon();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const bg = nextBtn.querySelector<HTMLElement>('.wallpaper-ctrl-bg--tilt');
      bg?.classList.add('tilt-once');
      bg?.addEventListener('animationend', () => bg.classList.remove('tilt-once'), { once: true });
      WallpaperEngine.nextWallpaper();
    });
  }

  window.addEventListener('wallpaper-controls-update', () => syncState && syncState());

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

    const isApi = state.wallpaperEnabled && state.wallpaperProvider !== 'upload';
    if (controlsCard) controlsCard.style.display = isApi ? '' : 'none';

    const paused = WallpaperEngine.isPaused();

    const intervalCard = container.querySelector<HTMLElement>('#advWallpaperIntervalCard');
    if (intervalCard) {
      intervalCard.style.display = isApi ? '' : 'none';
      intervalCard.classList.toggle('disabled', paused);
      intervalCard.style.pointerEvents = paused ? 'none' : '';
      intervalCard.style.opacity = paused ? '0.45' : '';
    }

    if (backBtn) backBtn.disabled = paused || !WallpaperEngine.canGoBack();
    if (nextBtn) nextBtn.disabled = paused;

    updatePauseIcon();
  };

  syncState();
  globalState.subscribe(syncState);

  applyTranslations(container);
}

export default { template, init } satisfies SidebarPageModule;
