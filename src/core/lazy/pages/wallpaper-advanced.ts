/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import type { SidebarPageModule } from '../../ui/sidebar-router';
import { globalState, setWallpaperCache } from '../../shared/state';
import { PAUSE_SVG, PLAY_SVG } from '../../shared/icons';
import { applyTranslations } from '../../shared/i18n';
import { WallpaperEngine } from '../wallpaper-engine';
import { setLastRefreshTs } from '../providers/wallpaper-refresh';

export const template = `<div class="settings-inner-card">
    <div class="settings-back-card">
      <div class="back-card-header">
        <button type="button" class="back-chevron-btn" data-sidebar-back aria-label="Back to Wallpaper">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
            <use href="#icon-chevron-left" />
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
        <div class="md3-checkbox-group" style="margin-top: 1rem;">
          <label class="md3-checkbox-label">
            <input type="checkbox" id="advWallpaperOverlayInverted" class="md3-checkbox-input" />
            <span class="md3-checkbox-box">
              <svg class="checkbox-inactive" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><use href="#icon-checkbox-off" /></svg>
              <svg class="checkbox-active" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><use href="#icon-checkbox-on" /></svg>
            </span>
            <span style="position: relative; display: inline-flex; align-items: center">
              <span class="checkbox-text" data-i18n="wallpaperOverlayInvertedTitle">Inverted overlay (White)</span>
              <span class="new-feature-badge" data-i18n="newFeatureBadge">NEW</span>
            </span>
          </label>
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
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><use href="#icon-arrow-back" /></svg>
          </span>
        </button>

        <button type="button" id="advWallpaperPause" class="wallpaper-ctrl-btn wallpaper-ctrl-btn--pause" aria-label="Keep current wallpaper">
          <span class="wallpaper-ctrl-bg wallpaper-ctrl-bg--spin">
            <svg width="380" height="380" viewBox="0 0 380 380" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M338.584 189.998c25.843 48.166 6.318 91.773-43.518 105.063-13.295 49.841-56.902 69.361-105.068 43.523-48.167 25.843-91.773 6.318-105.064-43.518-49.836-13.295-69.361-56.902-43.518-105.068-25.843-48.167-6.318-91.773 43.518-105.064 13.29-49.836 56.897-69.361 105.064-43.518 48.166-25.843 91.773-6.318 105.063 43.518 49.841 13.29 69.361 56.897 43.523 105.064" fill="currentColor"/></svg>
          </span>
          <span class="wallpaper-ctrl-icon" id="advWallpaperPauseIcon">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><use href="#icon-pause" /></svg>
          </span>
        </button>

        <button type="button" id="advWallpaperNext" class="wallpaper-ctrl-btn" aria-label="Next wallpaper">
          <span class="wallpaper-ctrl-bg wallpaper-ctrl-bg--tilt">
            <svg width="380" height="380" viewBox="0 0 380 380" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M230.389 50.473c62.72-27.24 126.378 36.418 99.138 99.138l-4.504 10.37a75.36 75.36 0 0 0 0 60.038l4.504 10.37c27.24 62.72-36.418 126.378-99.138 99.138l-10.37-4.504a75.36 75.36 0 0 0-60.038 0l-10.37 4.504c-62.72 27.24-126.378-36.418-99.138-99.138l4.504-10.37a75.36 75.36 0 0 0 0-60.038l-4.504-10.37c-27.24-62.72 36.418-126.378 99.138-99.138l10.37 4.504a75.36 75.36 0 0 0 60.038 0z" fill="currentColor"/></svg>
          </span>
          <span class="wallpaper-ctrl-icon">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><use href="#icon-arrow-forward" /></svg>
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
          <use href="#icon-dropdown-arrow" />
        </svg>
      </div>
    </div>

    <div class="settings-group-card" id="advWallpaperCountryCard">
      <h3 class="settings-group-title" data-i18n="wallpaperCountryTitle" style="margin-bottom: 1.5rem;">Country</h3>

      <div class="md3-outlined-select-wrapper">
        <button type="button" id="advWallpaperCountrySelect" class="md3-outlined-select md3-select-trigger" aria-label="Country" value="us">
          <span class="md3-select-value" data-i18n="countryUS">United States</span>
          <template class="md3-select-options">
            <div data-value="us" data-i18n="countryUS">United States</div>
            <div data-value="br" data-i18n="countryBR">Brazil</div>
            <div data-value="jp" data-i18n="countryJP">Japan</div>
            <div data-value="it" data-i18n="countryIT">Italy</div>
            <div data-value="es" data-i18n="countryES">Spain</div>
          </template>
        </button>
        <label for="advWallpaperCountrySelect" class="md3-select-label" data-i18n="wallpaperCountryLabel">Country</label>
        <svg class="dropdown-icon" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
          <use href="#icon-dropdown-arrow" />
        </svg>
      </div>
    </div>
  </div>
`;

export function init(container: HTMLElement): void {
  const wallpaperOverlaySlider = container.querySelector<HTMLInputElement>('#advWallpaperOverlaySlider');
  const wallpaperOverlayInverted = container.querySelector<HTMLInputElement>('#advWallpaperOverlayInverted');
  const wallpaperIntervalSelect = container.querySelector<HTMLButtonElement>('#advWallpaperIntervalSelect');
  const wallpaperCountrySelect = container.querySelector<HTMLButtonElement>('#advWallpaperCountrySelect');

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

  if (wallpaperOverlayInverted) {
    wallpaperOverlayInverted.checked = globalState.current.wallpaperOverlayInverted;
    wallpaperOverlayInverted.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      globalState.current.wallpaperOverlayInverted = target.checked;
    });
  }

  import('../md3-select').then(({ initCustomSelectSystem }) => {
    initCustomSelectSystem();
  });

  if (wallpaperIntervalSelect) {
    const currentVal = globalState.current.wallpaperRefreshInterval || 'daily';
    wallpaperIntervalSelect.value = currentVal;
    wallpaperIntervalSelect.setAttribute('value', currentVal);

    wallpaperIntervalSelect.addEventListener('change', (e) => {
      const target = e.target as HTMLButtonElement;
      globalState.current.wallpaperRefreshInterval = target.value as any;
    });
  }

  if (wallpaperCountrySelect) {
    const currentVal = globalState.current.bingCountry || 'us';
    wallpaperCountrySelect.value = currentVal;
    wallpaperCountrySelect.setAttribute('value', currentVal);

    wallpaperCountrySelect.addEventListener('change', (e) => {
      const target = e.target as HTMLButtonElement;
      const val = target.value;
      if (globalState.current.bingCountry !== val) {
        globalState.current.bingCountry = val;
        setWallpaperCache('wallpaper_cache_bing', null);
        setLastRefreshTs(Date.now());
        if (globalState.current.wallpaperEnabled && globalState.current.wallpaperProvider === 'bing') {
          WallpaperEngine.render({
            enabled: true,
            provider: 'bing',
            overlay: globalState.current.wallpaperOverlay,
          }, true);
        }
      }
    });
  }

  const controlsCard = container.querySelector<HTMLElement>('#advWallpaperControlsCard');
  const backBtn = container.querySelector<HTMLButtonElement>('#advWallpaperBack');
  const pauseBtn = container.querySelector<HTMLButtonElement>('#advWallpaperPause');
  const nextBtn = container.querySelector<HTMLButtonElement>('#advWallpaperNext');
  const pauseIcon = container.querySelector<HTMLElement>('#advWallpaperPauseIcon');

  const updatePauseIcon = () => {
    if (!pauseIcon) return;
    const isPaused = WallpaperEngine.isPaused();
    pauseIcon.innerHTML = isPaused ? PLAY_SVG : PAUSE_SVG;
    pauseBtn?.classList.toggle('is-paused', isPaused);
    pauseBtn?.setAttribute('aria-label', isPaused ? 'Resume wallpaper' : 'Keep current wallpaper');
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

    if (wallpaperOverlayInverted) {
      if (wallpaperOverlayInverted.checked !== state.wallpaperOverlayInverted) {
        wallpaperOverlayInverted.checked = state.wallpaperOverlayInverted;
      }
    }

    if (wallpaperIntervalSelect) {
      const currentInterval = state.wallpaperRefreshInterval || 'daily';
      if (wallpaperIntervalSelect.value !== currentInterval) {
        wallpaperIntervalSelect.value = currentInterval;
        wallpaperIntervalSelect.setAttribute('value', currentInterval);
      }
    }

    if (wallpaperCountrySelect) {
      const currentCountry = state.bingCountry || 'us';
      if (wallpaperCountrySelect.value !== currentCountry) {
        wallpaperCountrySelect.value = currentCountry;
        wallpaperCountrySelect.setAttribute('value', currentCountry);
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

    const countryCard = container.querySelector<HTMLElement>('#advWallpaperCountryCard');
    if (countryCard) {
      countryCard.style.display = (state.wallpaperEnabled && state.wallpaperProvider === 'bing') ? '' : 'none';
    }

    const hideNavigation = state.wallpaperProvider === 'bing';

    if (backBtn) {
      backBtn.style.display = hideNavigation ? 'none' : '';
      backBtn.disabled = paused || !WallpaperEngine.canGoBack();
    }
    if (nextBtn) {
      nextBtn.style.display = hideNavigation ? 'none' : '';
      nextBtn.disabled = paused;
    }

    updatePauseIcon();
  };

  syncState();
  globalState.subscribe(syncState);

  applyTranslations(container);
}

export default { template, init } satisfies SidebarPageModule;
