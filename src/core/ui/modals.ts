/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { WarningModalOptions } from '../shared/types';

export function showWarningModal(options: WarningModalOptions) {
  const overlay = document.getElementById('warningModal');
  const titleEl = document.getElementById('warning-modal-title');
  const msgEl = document.getElementById('warning-modal-message');
  const btnConfirm = document.getElementById('warning-btn-confirm');
  const btnCancel = document.getElementById('warning-btn-cancel');

  if (!overlay || !titleEl || !msgEl || !btnConfirm || !btnCancel) {
    if (options.onCancel) options.onCancel();
    return;
  }

  titleEl.textContent = options.title;
  msgEl.innerHTML = '';
  if (typeof options.message === 'string') {
    msgEl.textContent = options.message;
  } else if (options.message instanceof Node) {
    msgEl.appendChild(options.message);
  }
  btnConfirm.textContent = options.confirmText || 'Agree';
  btnCancel.textContent = options.cancelText || 'Cancel';

  overlay.classList.add('active');

  const closeModal = () => overlay.classList.remove('active');

  btnConfirm.onclick = () => {
    closeModal();
    options.onConfirm();
  };

  btnCancel.onclick = () => {
    closeModal();
    if (options.onCancel) options.onCancel();
  };
}
