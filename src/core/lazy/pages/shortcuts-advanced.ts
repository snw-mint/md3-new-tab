import type { SidebarPageModule } from '../../ui/sidebar-router';
import { globalState } from '../../shared/state';
import { applyTranslations } from '../../shared/i18n';

export const template = `<div class="settings-inner-card">
    <div class="settings-back-card">
      <div class="back-card-header">
        <button type="button" class="back-chevron-btn" data-sidebar-back aria-label="Back to Shortcuts">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
            <path d="m432-480 156 156q11 11 11 28t-11 28q-11 11-28 11t-28-11L348-452q-6-6-8.5-13t-2.5-15q0-8 2.5-15t8.5-13l184-184q11-11 28-11t28 11q11 11 11 28t-11 28L432-480Z"/>
          </svg>
        </button>
        <span class="back-card-label" data-i18n="shortcutsTitle">Shortcuts</span>
      </div>
    </div>

    <div class="settings-group-card" id="advShortcutsSettingsCard">
      <h3 class="settings-group-title" data-i18n="shortcutsSettingsTitle">Shortcuts Settings</h3>

      <div class="md3-checkbox-group">
        <label class="md3-checkbox-label">
          <input type="checkbox" id="advHideShortcutNamesToggle" class="md3-checkbox-input" />
          <span class="md3-checkbox-box">
            <svg class="checkbox-inactive" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120zm0-80h560v-560H200z" /></svg>
            <svg class="checkbox-active" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="m424-424-86-86q-11-11-28-11t-28 11-11 28 11 28l114 114q12 12 28 12t28-12l226-226q11-11 11-28t-11-28-28-11-28 11zM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120z" /></svg>
          </span>
          <span class="checkbox-text" data-i18n="hideShortcutNamesLabel">Hide shortcuts name</span>
        </label>
      </div>
    </div>

    <div class="settings-group-card" id="advShortcutsShapesCard">
      <h3 class="settings-group-title" data-i18n="shortcutsShapesTitle">Shortcuts Shapes</h3>
    </div>
  </div>
`;

export function init(container: HTMLElement): void {
  const hideNamesToggle = container.querySelector<HTMLInputElement>('#advHideShortcutNamesToggle');

  const syncState = () => {
    const state = globalState.current;
    if (hideNamesToggle) {
      hideNamesToggle.checked = !!state.hideShortcutNames;
    }
  };

  syncState();
  globalState.subscribe(syncState);

  if (hideNamesToggle) {
    hideNamesToggle.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      globalState.current.hideShortcutNames = target.checked;
    });
  }

  applyTranslations(container);
}

export default { template, init } satisfies SidebarPageModule;
