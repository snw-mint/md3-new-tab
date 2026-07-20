/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { globalState } from '../shared/state';
import { showSnackbar } from './snackbar';
import { showWarningModal } from './modals';

function isValidBackupPayload(data: unknown): boolean {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = (data as Record<string, unknown>)[key];
      if (typeof value !== 'string') {
        return false;
      }
    }
  }
  return true;
}

export function initBackupSystem(): void {
  if (sessionStorage.getItem('md3_settings_restored') === 'true') {
    showSnackbar({ text: chrome.i18n.getMessage('snackbarSettingsRestored'), duration: 4000 });
    sessionStorage.removeItem('md3_settings_restored');
  }

  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importInput = document.getElementById('importInput') as HTMLInputElement | null;

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const backupData: Record<string, string> = {};
      const state = globalState.current;

      backupData['shortcuts'] = localStorage.getItem('ent_shortcuts') || '[]';
      backupData['theme'] = localStorage.getItem('theme') || 'device';
      backupData['searchEngine'] = localStorage.getItem('searchEngine') || 'system';
      backupData['ent_selected_palette'] = localStorage.getItem('ent_selected_palette') || 'default';
      backupData['ent_custom_color'] = localStorage.getItem('ent_custom_color') || '#0B57D0';

      backupData['weatherUnit'] = state.tempUnit;
      backupData['fluent_city_data'] = JSON.stringify({ name: state.weatherCity });
      backupData['weatherCity'] = state.weatherCity;

      backupData['shortcutsRows'] = String(state.shortcutsRows);
      backupData['launcherEnabled'] = String(state.launcherEnabled);
      backupData['searchEnabled'] = String(state.searchEnabled);
      backupData['launcherProvider'] = state.launcherProvider;
      backupData['greetingName'] = state.greetingName;
      backupData['displayEnabled'] = String(state.displayEnabled);
      backupData['use12Hour'] = String(state.clock12hFormat);

      backupData._backupDate = new Date().toISOString();

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `md3-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showSnackbar({ text: chrome.i18n.getMessage('snackbarSettingsExported'), duration: 4000 });
    });
  }

  if (importBtn && importInput) {
    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      const file = target?.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsedData = JSON.parse(
            String((event.target as FileReader).result || '{}'),
          );
          if (!isValidBackupPayload(parsedData)) {
            throw new Error('Invalid backup data format');
          }

          const data = parsedData as Record<string, string>;

          showWarningModal({
            title: 'Restore Backup?',
            messageHtml: 'This will replace your current settings and shortcuts with the backup file data.',
            confirmText: 'Restore',
            cancelText: 'Cancel',
            onConfirm: () => {
              if (data['shortcuts']) {
                localStorage.setItem('ent_shortcuts', data['shortcuts']);
              }

              if (data['theme']) localStorage.setItem('theme', data['theme']);
              if (data['searchEngine']) localStorage.setItem('searchEngine', data['searchEngine']);
              if (data['ent_selected_palette']) localStorage.setItem('ent_selected_palette', data['ent_selected_palette']);
              if (data['ent_custom_color']) localStorage.setItem('ent_custom_color', data['ent_custom_color']);

              const state = globalState.current;
              const newState = { ...state };

              if (data['weatherUnit']) newState.tempUnit = data['weatherUnit'] as 'C' | 'F';

              if (data['weatherCity']) {
                newState.weatherCity = data['weatherCity'];
              } else if (data['fluent_city_data']) {
                try {
                  const cityData = JSON.parse(data['fluent_city_data']);
                  if (cityData.name) {
                    newState.weatherCity = cityData.name;
                  }
                } catch (e) {
                }
              }

              if (data['shortcutsRows']) newState.shortcutsRows = data['shortcutsRows'];
              if (data['launcherEnabled']) newState.launcherEnabled = data['launcherEnabled'] === 'true';
              if (data['searchEnabled']) newState.searchEnabled = data['searchEnabled'] === 'true';
              if (data['launcherProvider']) newState.launcherProvider = data['launcherProvider'] as any;
              if (data['greetingName']) newState.greetingName = data['greetingName'];
              if (data['displayEnabled']) newState.displayEnabled = data['displayEnabled'] === 'true';
              if (data['use12Hour']) newState.clock12hFormat = data['use12Hour'] === 'true';

              localStorage.setItem('ent_global_settings', JSON.stringify(newState));

              sessionStorage.setItem('md3_settings_restored', 'true');
              location.reload();
            }
          });
        } catch (error) {
          showSnackbar({
            text: chrome.i18n.getMessage('snackbarBackupInvalid'),
            actionText: 'Close',
            duration: 10000
          });
        }
        importInput.value = '';
      };
      reader.readAsText(file);
    });
  }
}
