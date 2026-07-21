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
        <button type="button" class="back-chevron-btn" data-sidebar-back aria-label="Back to Display">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
            <path d="m432-480 156 156q11 11 11 28t-11 28q-11 11-28 11t-28-11L348-452q-6-6-8.5-13t-2.5-15q0-8 2.5-15t8.5-13l184-184q11-11 28-11t28 11q11 11 11 28t-11 28L432-480Z"/>
          </svg>
        </button>
        <span class="back-card-label" data-i18n="displayTitle">Display</span>
      </div>
    </div>

    <div class="settings-group-card">
      <h3 class="settings-group-title" data-i18n="greetingSettingTitle" style="margin-bottom: 1.5rem;">Greeting setting</h3>

      <div id="advGreetingNameInputWrapper">
        <div class="input-with-action-row" style="margin-top: 0.25rem; margin-bottom: 1.25rem;">
          <div class="md3-outlined-text-field" id="advGreetingNameFieldWrapper">
            <input type="text" id="advGreetingNameInput" class="md3-input" placeholder=" " autocomplete="off" />
            <label for="advGreetingNameInput" class="md3-label" data-i18n="namePlaceholder">Your Name (optional)</label>
          </div>
        </div>
        <div class="md3-checkbox-group">
          <label class="md3-checkbox-label">
            <input type="checkbox" id="advGreetingHighlightNameCheckbox" class="md3-checkbox-input" />
            <span class="md3-checkbox-box">
              <svg class="checkbox-inactive" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120zm0-80h560v-560H200z" /></svg>
              <svg class="checkbox-active" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="m424-424-86-86q-11-11-28-11t-28 11-11 28 11 28l114 114q12 12 28 12t28-12l226-226q11-11 11-28t-11-28-28-11-28 11zM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120z" /></svg>
            </span>
            <span class="checkbox-text" data-i18n="highlightNameLabel">Highlight name</span>
          </label>
        </div>
      </div>
    </div>

    <div class="settings-group-card">
      <h3 class="settings-group-title" data-i18n="clockTitle" style="margin-bottom: 1.5rem;">Clock Settings</h3>

      <div class="md3-outlined-select-wrapper" style="margin-bottom: 1.25rem;">
        <button type="button" id="advClockStyleSelect" class="md3-outlined-select md3-select-trigger" aria-label="Clock Style" value="Alatsi">
          <span class="md3-select-value">Sharp Clock</span>
          <template class="md3-select-options">
            <div data-value="Alatsi">Sharp Clock</div>
            <div data-value="Capriola">Playful Clock</div>
            <div data-value="Modak">Bold Clock</div>
            <div data-value="Abril Fatface">Serif Clock</div>
            <div data-value="Monoton">Retro Clock</div>
          </template>
        </button>
        <label for="advClockStyleSelect" class="md3-select-label" data-i18n="clockStyleLabel">Clock Style</label>
        <svg class="dropdown-icon" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
          <path d="M459-381 314-526q-3-3-4.5-6.5T308-540q0-8 5.5-14t14.5-6h304q9 0 14.5 6t5.5 14q0 2-6 14L501-381q-5 5-10 7t-11 2-11-2-10-7" />
        </svg>
      </div>

      <div class="md3-checkbox-group" id="advDisplayClockOptions" style="margin-top: 0.75rem; gap: 0.5rem;">
        <label class="md3-checkbox-label">
          <input type="checkbox" id="advClock12hFormat" class="md3-checkbox-input" />
          <span class="md3-checkbox-box">
            <svg class="checkbox-inactive" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120zm0-80h560v-560H200z" /></svg>
            <svg class="checkbox-active" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="m424-424-86-86q-11-11-28-11t-28 11-11 28 11 28l114 114q12 12 28 12t28-12l226-226q11-11 11-28t-11-28-28-11-28 11zM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120z" /></svg>
          </span>
          <span class="checkbox-text" data-i18n="clock12hLabel">12h Format</span>
        </label>

        <label class="md3-checkbox-label">
          <input type="checkbox" id="advClockShowDate" class="md3-checkbox-input" checked />
          <span class="md3-checkbox-box">
            <svg class="checkbox-inactive" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120zm0-80h560v-560H200z" /></svg>
            <svg class="checkbox-active" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="m424-424-86-86q-11-11-28-11t-28 11-11 28 11 28l114 114q12 12 28 12t28-12l226-226q11-11 11-28t-11-28-28-11-28 11zM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120z" /></svg>
          </span>
          <span class="checkbox-text" data-i18n="clockShowDateLabel">Show Date</span>
        </label>

        <label class="md3-checkbox-label">
          <input type="checkbox" id="advClockExpressiveColor" class="md3-checkbox-input" />
          <span class="md3-checkbox-box">
            <svg class="checkbox-inactive" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120zm0-80h560v-560H200z" /></svg>
            <svg class="checkbox-active" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="m424-424-86-86q-11-11-28-11t-28 11-11 28 11 28l114 114q12 12 28 12t28-12l226-226q11-11 11-28t-11-28-28-11-28 11zM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120z" /></svg>
          </span>
          <span class="checkbox-text" data-i18n="clockExpressiveColorLabel">Expressive Color</span>
        </label>
      </div>
    </div>
  </div>
`;

export function init(container: HTMLElement): void {
  const greetingNameInput = container.querySelector<HTMLInputElement>('#advGreetingNameInput');
  const greetingHighlightNameCheckbox = container.querySelector<HTMLInputElement>('#advGreetingHighlightNameCheckbox');
  const clockStyleSelect = container.querySelector<HTMLButtonElement>('#advClockStyleSelect');
  const clock12hFormat = container.querySelector<HTMLInputElement>('#advClock12hFormat');
  const clockShowDate = container.querySelector<HTMLInputElement>('#advClockShowDate');
  const clockExpressiveColor = container.querySelector<HTMLInputElement>('#advClockExpressiveColor');

  const syncState = () => {
    const state = globalState.current;
    
    if (greetingNameInput) {
      greetingNameInput.value = state.greetingName || '';
    }

    if (greetingHighlightNameCheckbox) {
      const hasName = state.greetingName.trim().length > 0;
      greetingHighlightNameCheckbox.disabled = !hasName;
      greetingHighlightNameCheckbox.checked = state.greetingHighlightName;
    }

    if (clockStyleSelect) {
      if (clockStyleSelect.value !== state.clockStyle) {
        clockStyleSelect.value = state.clockStyle;
      }
      if (clockStyleSelect.getAttribute('value') !== state.clockStyle) {
        clockStyleSelect.setAttribute('value', state.clockStyle);
      }
      const valEl = clockStyleSelect.querySelector('.md3-select-value');
      const optEl = clockStyleSelect.querySelector(`[data-value="${state.clockStyle}"]`);
      if (valEl && optEl) {
        valEl.textContent = optEl.textContent;
      }
    }

    if (clock12hFormat) {
      clock12hFormat.checked = state.clock12hFormat;
    }

    if (clockShowDate) {
      clockShowDate.checked = state.clockShowDate;
    }

    if (clockExpressiveColor) {
      clockExpressiveColor.checked = state.clockExpressiveColor;
    }
  };

  syncState();
  globalState.subscribe(syncState);

  if (greetingNameInput) {
    greetingNameInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      globalState.current.greetingName = target.value;
    });
  }

  if (greetingHighlightNameCheckbox) {
    greetingHighlightNameCheckbox.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      globalState.current.greetingHighlightName = target.checked;
    });
  }

  if (clockStyleSelect) {
    import('../md3-select').then(({ initCustomSelectSystem }) => {
      initCustomSelectSystem();
    });

    clockStyleSelect.addEventListener('change', (e) => {
      const target = e.target as HTMLButtonElement;
      globalState.current.clockStyle = target.value;
    });
  }

  if (clock12hFormat) {
    clock12hFormat.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      globalState.current.clock12hFormat = target.checked;
    });
  }

  if (clockShowDate) {
    clockShowDate.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      globalState.current.clockShowDate = target.checked;
    });
  }

  if (clockExpressiveColor) {
    clockExpressiveColor.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      globalState.current.clockExpressiveColor = target.checked;
    });
  }

  applyTranslations(container);
}

export default { template, init } satisfies SidebarPageModule;
