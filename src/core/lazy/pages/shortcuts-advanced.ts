import type { SidebarPageModule } from '../../ui/sidebar-router';
import { globalState } from '../../shared/state';
import { applyTranslations } from '../../shared/i18n';
import type { ShortcutShape } from '../../shared/types';

export const template = `<div class="settings-inner-card">
    <div class="settings-back-card">
      <div class="back-card-header">
        <button type="button" class="back-chevron-btn" data-sidebar-back aria-label="Back to Shortcuts">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
            <use href="#icon-chevron-left" />
          </svg>
        </button>
        <span class="back-card-label" data-i18n="shortcutsTitle">Shortcuts</span>
      </div>
    </div>

    <div class="settings-group-card">
      <h3 class="settings-group-title" data-i18n="advancedOptionsTitle">Advanced options</h3>

      <div class="md3-checkbox-group" style="margin-top: 1rem;">
        <label class="md3-checkbox-label">
          <input type="checkbox" id="advHideShortcutNamesToggle" class="md3-checkbox-input" />
          <span class="md3-checkbox-box">
            <svg class="checkbox-inactive" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><use href="#icon-checkbox-off" /></svg>
            <svg class="checkbox-active" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><use href="#icon-checkbox-on" /></svg>
          </span>
          <span class="checkbox-text" data-i18n="hideShortcutNamesLabel">Hide shortcuts name</span>
        </label>
      </div>

      <div class="md3-outlined-select-wrapper" style="margin-top: 1.5rem;">
        <button type="button" id="advShortcutShapeSelect" class="md3-outlined-select md3-select-trigger" aria-label="Shortcut shape" value="circle">
          <span class="md3-select-value" data-i18n="shapeCircle">Circle</span>
          <template class="md3-select-options">
            <div data-value="circle" data-i18n="shapeCircle">
              <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg>
              Circle
            </div>
            <div data-value="squircle" data-i18n="shapeSquircle">
              <svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="20" height="20" rx="6" /></svg>
              Squircle
            </div>
            <div data-value="cookie" data-i18n="shapeCookie">
              <svg viewBox="30 30 320 320" fill="currentColor"><path d="M166.697 39.846c.541-.53.811-.795 1.046-1.016 12.503-11.773 32.011-11.773 44.514 0 .235.22.505.486 1.046 1.016.325.318.487.477.642.624a32.47 32.47 0 0 0 30.083 8.061c.207-.05.428-.107.868-.22.734-.189 1.1-.283 1.414-.357 16.714-3.944 33.609 5.81 38.55 22.257.093.309.195.674.398 1.403.122.438.184.657.244.862a32.47 32.47 0 0 0 22.022 22.023c.205.06.424.12.862.243a77 77 0 0 1 1.403.398c16.447 4.941 26.201 21.836 22.257 38.55-.074.314-.168.681-.357 1.414-.113.44-.17.661-.22.868a32.46 32.46 0 0 0 8.061 30.083c.147.155.306.317.624.642.53.541.795.811 1.016 1.046 11.773 12.503 11.773 32.011 0 44.514-.221.235-.486.505-1.016 1.046-.318.325-.477.487-.624.642a32.46 32.46 0 0 0-8.061 30.083c.05.207.107.428.22.868.189.733.283 1.1.357 1.414 3.944 16.714-5.81 33.609-22.257 38.55a77 77 0 0 1-1.403.398c-.438.123-.657.184-.862.244a32.47 32.47 0 0 0-22.022 22.022c-.06.205-.121.424-.244.862a77 77 0 0 1-.398 1.403c-4.941 16.447-21.836 26.201-38.55 22.257a75 75 0 0 1-1.414-.357c-.44-.113-.661-.17-.868-.22a32.46 32.46 0 0 0-30.083 8.061c-.155.147-.317.306-.642.624-.541.53-.811.795-1.046 1.016-12.503 11.773-32.011 11.773-44.514 0-.235-.221-.505-.486-1.046-1.016-.325-.318-.487-.477-.642-.624a32.46 32.46 0 0 0-30.083-8.061c-.207.05-.428.107-.868.22-.733.189-1.1.283-1.414.357-16.714 3.944-33.609-5.81-38.55-22.257a77 77 0 0 1-.398-1.403c-.123-.438-.184-.657-.243-.862a32.47 32.47 0 0 0-22.023-22.022c-.205-.06-.424-.122-.862-.244a74 74 0 0 1-1.403-.398c-16.447-4.941-26.201-21.836-22.257-38.55.074-.314.168-.68.357-1.414.113-.44.17-.661.22-.868a32.47 32.47 0 0 0-8.06-30.083c-.148-.155-.307-.317-.625-.642-.53-.541-.795-.811-1.016-1.046-11.773-12.503-11.773-32.011 0-44.514.22-.235.486-.505 1.016-1.046.318-.325.477-.487.624-.642a32.47 32.47 0 0 0 8.061-30.083 71 71 0 0 0-.22-.868c-.189-.733-.283-1.1-.357-1.414-3.944-16.714 5.81-33.609 22.257-38.55a77 77 0 0 1 1.403-.398c.438-.123.657-.184.862-.243a32.47 32.47 0 0 0 22.023-22.023c.06-.205.12-.424.243-.862.203-.73.305-1.094.398-1.403 4.941-16.447 21.836-26.201 38.55-22.257.314.074.681.168 1.414.357.44.113.661.17.868.22a32.47 32.47 0 0 0 30.083-8.06c.155-.148.317-.307.642-.625" /></svg>
              Cookie
            </div>
            <div data-value="clover" data-i18n="shapeClover">
              <svg viewBox="42 42 296 296" fill="currentColor"><path d="M63.001 190C49.895 174.339 42 154.126 42 132.06 42 82.321 82.113 42 131.595 42c22.395 0 42.871 8.26 58.578 21.913C205.843 50.26 226.271 42 248.614 42 297.981 42 338 82.321 338 132.06c0 22.066-7.877 42.279-20.952 57.94C330.123 205.661 338 225.874 338 247.94c0 49.739-40.019 90.06-89.386 90.06-22.343 0-42.771-8.259-58.441-21.913C174.466 329.741 153.99 338 131.595 338 82.113 338 42 297.679 42 247.94c0-22.066 7.895-42.279 21.001-57.94" /></svg>
              Leaf Clover
            </div>
            <div data-value="sided_cookie" data-i18n="shapeSidedCookie">
              <svg viewBox="41 41 298 298" fill="currentColor"><path d="M230.389 50.473c62.72-27.24 126.378 36.418 99.138 99.138l-4.504 10.37a75.36 75.36 0 0 0 0 60.038l4.504 10.37c27.24 62.72-36.418 126.378-99.138 99.138l-10.37-4.504a75.36 75.36 0 0 0-60.038 0l-10.37 4.504c-62.72 27.24-126.378-36.418-99.138-99.138l4.504-10.37a75.36 75.36 0 0 0 0-60.038l-4.504-10.37c-27.24-62.72 36.418-126.378 99.138-99.138l10.37 4.504a75.36 75.36 0 0 0 60.038 0z" /></svg>
              Sided Cookie
            </div>
            <div data-value="sunny" data-i18n="shapeSunny">
              <svg viewBox="28 28 324 324" fill="currentColor"><path d="M276.453 68.812c9.952.676 14.928 1.014 18.951 2.773a25.24 25.24 0 0 1 13.011 13.012c1.759 4.022 2.097 8.998 2.773 18.95l1.544 22.712c.273 4.025.41 6.037.847 7.96a25.3 25.3 0 0 0 3.248 7.84c1.05 1.669 2.376 3.189 5.029 6.229l14.968 17.15c6.56 7.516 9.839 11.274 11.439 15.362a25.23 25.23 0 0 1 0 18.4c-1.6 4.088-4.879 7.846-11.439 15.362l-14.968 17.15c-2.653 3.04-3.979 4.56-5.029 6.229a25.3 25.3 0 0 0-3.248 7.84c-.437 1.923-.574 3.935-.847 7.96l-1.544 22.712c-.676 9.952-1.014 14.928-2.773 18.951a25.24 25.24 0 0 1-13.011 13.011c-4.023 1.759-8.999 2.097-18.951 2.773l-22.712 1.544c-4.025.273-6.037.41-7.96.847a25.3 25.3 0 0 0-7.84 3.248c-1.669 1.05-3.189 2.376-6.229 5.029l-17.15 14.968c-7.516 6.56-11.274 9.839-15.362 11.439a25.23 25.23 0 0 1-18.4 0c-4.088-1.6-7.846-4.879-15.362-11.439l-17.15-14.968c-3.04-2.653-4.56-3.979-6.229-5.029a25.3 25.3 0 0 0-7.84-3.248c-1.923-.437-3.935-.574-7.96-.847l-22.712-1.544c-9.952-.676-14.928-1.014-18.95-2.773a25.24 25.24 0 0 1-13.012-13.011c-1.759-4.023-2.097-8.999-2.773-18.951l-1.544-22.712c-.273-4.025-.41-6.037-.847-7.96a25.2 25.2 0 0 0-3.248-7.84c-1.05-1.669-2.376-3.189-5.03-6.229l-14.967-17.15c-6.56-7.516-9.84-11.274-11.44-15.362a25.24 25.24 0 0 1 0-18.4c1.6-4.088 4.88-7.846 11.44-15.362l14.968-17.15c2.653-3.04 3.979-4.56 5.029-6.229a25.2 25.2 0 0 0 3.248-7.84c.437-1.923.574-3.935.847-7.96l1.544-22.712c.676-9.952 1.014-14.928 2.773-18.95a25.24 25.24 0 0 1 13.012-13.012c4.022-1.759 8.998-2.097 18.95-2.773l22.712-1.544c4.025-.273 6.037-.41 7.96-.847a25.2 25.2 0 0 0 7.84-3.248c1.669-1.05 3.189-2.376 6.229-5.03l17.15-14.967c7.516-6.56 11.274-9.84 15.362-11.44a25.24 25.24 0 0 1 18.4 0c4.088 1.6 7.846 4.88 15.362 11.44l17.15 14.968c3.04 2.653 4.56 3.979 6.229 5.029a25.2 25.2 0 0 0 7.84 3.248c1.923.437 3.935.574 7.96.847z" /></svg>
              Sunny
            </div>
            <div data-value="very_sunny" data-i18n="shapeVerySunny">
              <svg viewBox="29 29 322 322" fill="currentColor"><path d="M166.725 43.187c10.536-17.583 36.014-17.583 46.55 0l11.849 19.773a27.13 27.13 0 0 0 29.871 12.373l22.36-5.604c19.882-4.982 37.898 13.034 32.916 32.916l-5.604 22.36a27.135 27.135 0 0 0 12.373 29.871l19.773 11.849c17.583 10.536 17.583 36.014 0 46.55l-19.773 11.849a27.135 27.135 0 0 0-12.373 29.871l5.604 22.36c4.982 19.882-13.034 37.898-32.916 32.916l-22.36-5.604a27.135 27.135 0 0 0-29.871 12.373l-11.849 19.773c-10.536 17.583-36.014 17.583-46.55 0l-11.849-19.773a27.135 27.135 0 0 0-29.871-12.373l-22.359 5.604c-19.883 4.982-37.9-13.034-32.917-32.916l5.604-22.36a27.13 27.13 0 0 0-12.373-29.871l-19.773-11.849c-17.583-10.536-17.583-36.014 0-46.55l19.773-11.849a27.13 27.13 0 0 0 12.373-29.871l-5.604-22.359c-4.982-19.883 13.034-37.9 32.916-32.917l22.36 5.604a27.13 27.13 0 0 0 29.871-12.373z" /></svg>
              Very Sunny
            </div>
          </template>
        </button>
        <label for="advShortcutShapeSelect" class="md3-select-label" data-i18n="shortcutShapeLabel">Shape</label>
        <svg class="dropdown-icon" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
          <use href="#icon-dropdown-arrow" />
        </svg>
      </div>
    </div>
  </div>
`;

export function init(container: HTMLElement): void {
  const hideNamesToggle = container.querySelector<HTMLInputElement>('#advHideShortcutNamesToggle');
  const shapeSelect = container.querySelector<HTMLButtonElement>('#advShortcutShapeSelect');

  import('../md3-select').then(({ initCustomSelectSystem }) => {
    initCustomSelectSystem();
  });

  if (hideNamesToggle) {
    hideNamesToggle.checked = !!globalState.current.hideShortcutNames;
    hideNamesToggle.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      globalState.current.hideShortcutNames = target.checked;
    });
  }

  if (shapeSelect) {
    const currentShape = globalState.current.shortcutShape || 'circle';
    shapeSelect.value = currentShape;
    shapeSelect.setAttribute('value', currentShape);

    shapeSelect.addEventListener('change', (e) => {
      const target = e.target as HTMLButtonElement;
      globalState.current.shortcutShape = target.value as ShortcutShape;
    });
  }

  const syncState = () => {
    const state = globalState.current;
    if (hideNamesToggle && hideNamesToggle.checked !== !!state.hideShortcutNames) {
      hideNamesToggle.checked = !!state.hideShortcutNames;
    }
    if (!shapeSelect) return;
    const currentShape = state.shortcutShape || 'circle';
    if (shapeSelect.value !== currentShape) {
      shapeSelect.value = currentShape;
      shapeSelect.setAttribute('value', currentShape);
    }
  };

  syncState();
  globalState.subscribe(syncState);
  applyTranslations(container);
}

export default { template, init } satisfies SidebarPageModule;
