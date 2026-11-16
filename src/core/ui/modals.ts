import { WarningModalOptions } from '../shared/types';
import { mountTemplate } from '../shared/dom-units';

export function showWarningModal(options: WarningModalOptions) {
  if (!document.getElementById('warningModal')) {
    mountTemplate('tpl-warning-modal');
  }

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
  msgEl.innerHTML = options.messageHtml;
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
