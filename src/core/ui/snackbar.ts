/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { SnackbarOptions } from '../shared/types';

let snackbarTimeout: number | null = null;

export function showSnackbar({ text, actionText, actionHtml, duration = 4000, onAction }: SnackbarOptions): void {
  const snackbar = document.getElementById('global-snackbar');
  const textEl = document.getElementById('snackbarText');
  const actionEl = document.getElementById('snackbarAction');

  if (!snackbar || !textEl || !actionEl) return;

  textEl.textContent = text;

  if (actionText || actionHtml) {
    if (actionHtml) {
      actionEl.innerHTML = actionHtml;
    } else if (actionText) {
      actionEl.textContent = actionText;
    }
    actionEl.style.display = '';
    actionEl.onclick = () => {
      if (onAction) onAction();
      hideSnackbar();
    };
  } else {
    actionEl.style.display = 'none';
    actionEl.onclick = null;
  }

  snackbar.classList.add('show');

  if (snackbarTimeout !== null) {
    clearTimeout(snackbarTimeout);
  }

  snackbarTimeout = window.setTimeout(() => {
    hideSnackbar();
  }, duration);
}

export function hideSnackbar(): void {
  const snackbar = document.getElementById('global-snackbar');
  if (snackbar) {
    snackbar.classList.remove('show');
  }
}
