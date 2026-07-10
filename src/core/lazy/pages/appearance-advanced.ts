/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import type { SidebarPageModule } from '../../ui/sidebar-router';
import { globalState } from '../../shared/state';

export const template = `<div class="settings-inner-card">
    <div class="settings-back-card">
      <div class="back-card-header">
        <button type="button" class="back-chevron-btn" data-sidebar-back aria-label="Back to Appearance">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
            <path d="m432-480 156 156q11 11 11 28t-11 28q-11 11-28 11t-28-11L348-452q-6-6-8.5-13t-2.5-15q0-8 2.5-15t8.5-13l184-184q11-11 28-11t28 11q11 11 11 28t-11 28L432-480Z"/>
          </svg>
        </button>
        <span class="back-card-label">Appearance</span>
      </div>
      <div class="mockup-card">
        <div class="chrome-corner-card">
          <div class="window-header">
            <div class="chrome-chevron-button" title="Menu">
              <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                <path d="M465-363.5q-7-2.5-13-8.5L268-556q-11-11-11-28t11-28q11-11 28-11t28 11l156 156 156-156q11-11 28-11t28 11q11 11 11 28t-11 28L508-372q-6 6-13 8.5t-15 2.5q-8 0-15-2.5Z" />
              </svg>
            </div>

            <div class="chrome-tab">
              <div class="tab-favicon"></div>
              <span class="tab-title">New Tab</span>
              <div class="tab-close-btn" title="Fechar">
                <svg class="close-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                  <path d="M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="browser-viewport-band"></div>
        </div>
      </div>
    </div>

    <div class="settings-group-card">
      <h3 class="settings-group-title">Advanced option</h3>

      <div class="input-with-action-row" style="margin-bottom: 1.25rem;">
        <div class="md3-outlined-text-field" id="advTabNameFieldWrapper">
          <input type="text" id="advTabNameInput" class="md3-input" placeholder=" " autocomplete="off" />
          <label for="advTabNameInput" class="md3-label">Tab name</label>
        </div>
      </div>

      <div class="md3-checkbox-group" id="advWallpaperColorGroup">
        <label class="md3-checkbox-label">
          <input type="checkbox" id="advWallpaperColorToggle" class="md3-checkbox-input" />
          <span class="md3-checkbox-box">
            <svg class="checkbox-inactive" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120zm0-80h560v-560H200z" /></svg>
            <svg class="checkbox-active" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="m424-424-86-86q-11-11-28-11t-28 11-11 28 11 28l114 114q12 12 28 12t28-12l226-226q11-11 11-28t-11-28-28-11-28 11zM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120z" /></svg>
          </span>
          <span class="checkbox-text">Color from wallpaper</span>
        </label>
      </div>
    </div>
  </div>
`;

export function init(container: HTMLElement): void {
  const toggle = container.querySelector<HTMLInputElement>('#advWallpaperColorToggle');
  const group = container.querySelector<HTMLElement>('#advWallpaperColorGroup');
  const tabNameInput = container.querySelector<HTMLInputElement>('#advTabNameInput');
  const tabTitle = container.querySelector<HTMLElement>('.tab-title');

  if (!toggle || !group) return;

  const syncState = () => {
    const state = globalState.current;
    const canEnable = state.wallpaperEnabled && !!state.wallpaperImage;
    toggle.disabled = !canEnable;
    toggle.checked = canEnable ? state.colorFromWallpaper : false;
    group.classList.toggle('disabled', !canEnable);

    if (tabNameInput && tabTitle) {
      tabNameInput.value = state.customTabName || '';
      tabTitle.textContent = state.customTabName || 'New Tab';
    }
  };

  syncState();
  globalState.subscribe(syncState);

  toggle.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    globalState.current.colorFromWallpaper = target.checked;
  });

  if (tabNameInput) {
    tabNameInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      globalState.current.customTabName = target.value;
    });
  }
}

export default { template, init } satisfies SidebarPageModule;
