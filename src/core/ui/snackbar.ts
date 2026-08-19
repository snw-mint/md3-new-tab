/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { SnackbarOptions } from '../shared/types';

let snackbarTimeout: number | null = null;
let activePriority = 0;

export function showSnackbar({ text, actionText, duration = 4000, onAction, priority = 0 }: SnackbarOptions): void {
  const snackbar = document.getElementById('global-snackbar');
  const textEl = document.getElementById('snackbarText');
  const actionEl = document.getElementById('snackbarAction');

  if (!snackbar || !textEl || !actionEl) return;

  if (snackbar.classList.contains('show') && priority < activePriority) {
    return;
  }

  activePriority = priority;
  textEl.textContent = text;

  if (actionText) {
    actionEl.textContent = actionText;
    actionEl.style.display = '';
    actionEl.onclick = () => {
      if (onAction) onAction();
      hideSnackbar(priority, true);
    };
  } else {
    actionEl.style.display = 'none';
    actionEl.onclick = null;
  }

  snackbar.classList.add('show');

  if (snackbarTimeout !== null) {
    clearTimeout(snackbarTimeout);
    snackbarTimeout = null;
  }

  if (duration > 0) {
    snackbarTimeout = window.setTimeout(() => {
      hideSnackbar(priority, true);
    }, duration);
  }
}

export function hideSnackbar(priority = 0, force = false): void {
  const snackbar = document.getElementById('global-snackbar');
  if (!snackbar) return;

  if (!force && priority < activePriority && snackbar.classList.contains('show')) {
    return;
  }

  activePriority = 0;
  if (snackbarTimeout !== null) {
    clearTimeout(snackbarTimeout);
    snackbarTimeout = null;
  }
  snackbar.classList.remove('show');
}
