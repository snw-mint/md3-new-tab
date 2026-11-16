import { ShortcutItem } from '../shared/types';
import { mountTemplate } from '../shared/dom-units';
import { t } from '../shared/i18n';

let modalsInitialized = false;
let editingIndex: number | null = null;
let activeListGetter: (() => ShortcutItem[]) | null = null;
let activeSaveCallback: (() => void) | null = null;

let modal: HTMLElement | null = null;
let form: HTMLFormElement | null = null;
let inputName: HTMLInputElement | null = null;
let inputUrl: HTMLInputElement | null = null;
let inputIconUrl: HTMLInputElement | null = null;
let modalTitle: HTMLElement | null = null;

let folderModal: HTMLElement | null = null;
let folderForm: HTMLFormElement | null = null;
let inputFolderName: HTMLInputElement | null = null;
let inputFolderIconUrl: HTMLInputElement | null = null;
let folderModalTitle: HTMLElement | null = null;

function handleUrlValidation(input: HTMLInputElement, isOptional: boolean): boolean {
  const wrapper = input.closest('.md3-filled-input-wrapper');
  if (!wrapper) return true;

  const val = input.value.trim();

  if (!val) {
    if (isOptional) {
      wrapper.classList.remove('has-error');
      return true;
    }
    wrapper.classList.add('has-error');
    return false;
  }

  let urlStr = val;
  if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
    urlStr = 'https://' + urlStr;
  }

  try {
    const urlObj = new URL(urlStr);
    if (!urlObj.hostname.includes('.') && urlObj.hostname !== 'localhost') {
      throw new Error('Invalid domain structure');
    }

    input.value = urlStr;
    wrapper.classList.remove('has-error');
    return true;
  } catch {
    wrapper.classList.add('has-error');
    return false;
  }
}

function closeModal(): void {
  if (modal) {
    modal.classList.remove('active');
  }
  editingIndex = null;
}

function closeFolderModal(): void {
  if (folderModal) {
    folderModal.classList.remove('active');
  }
  editingIndex = null;
}

function saveShortcutData(): void {
  if (!inputName || !inputUrl || !inputIconUrl || !activeListGetter || !activeSaveCallback) return;

  const isUrlValid = handleUrlValidation(inputUrl, false);
  const isIconUrlValid = handleUrlValidation(inputIconUrl, true);
  if (!isUrlValid || !isIconUrlValid) return;

  const urlStr = inputUrl.value.trim();
  let nameStr = inputName.value.trim();
  const iconUrlStr = inputIconUrl.value.trim() || undefined;

  if (!nameStr) {
    try {
      const urlObj = new URL(urlStr);
      let gen = urlObj.hostname.replace(/^www\./, '');
      gen = gen.charAt(0).toUpperCase() + gen.slice(1);
      nameStr = gen.split('.')[0];
    } catch {
      nameStr = 'New Shortcut';
    }
  }

  const list = activeListGetter();

  if (editingIndex !== null && list[editingIndex]) {
    list[editingIndex].name = nameStr;
    list[editingIndex].url = urlStr;
    list[editingIndex].iconUrl = iconUrlStr;
    list[editingIndex].customIcon = iconUrlStr;
  } else {
    list.push({
      id: 'shortcut_' + Date.now(),
      type: 'link',
      name: nameStr,
      url: urlStr,
      iconUrl: iconUrlStr,
      customIcon: iconUrlStr,
    });
  }

  activeSaveCallback();
  closeModal();
}

function saveFolderData(): void {
  if (!inputFolderName || !inputFolderIconUrl || !activeListGetter || !activeSaveCallback) return;

  const isIconValid = handleUrlValidation(inputFolderIconUrl, true);
  if (!isIconValid) return;

  const nameStr = inputFolderName.value.trim() || 'New Folder';
  const iconUrlStr = inputFolderIconUrl.value.trim() || undefined;

  const list = activeListGetter();

  if (editingIndex !== null && list[editingIndex]) {
    list[editingIndex].name = nameStr;
    list[editingIndex].iconUrl = iconUrlStr;
    list[editingIndex].customIcon = iconUrlStr;
  } else {
    list.push({
      id: 'folder_' + Date.now(),
      type: 'folder',
      name: nameStr,
      iconUrl: iconUrlStr,
      customIcon: iconUrlStr,
      children: [],
    });
  }

  activeSaveCallback();
  closeFolderModal();
}

function setupModalEvents(): void {
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      saveShortcutData();
    });

    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveShortcutData();
      }
    });
  }

  if (folderForm) {
    folderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveFolderData();
    });

    folderForm.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveFolderData();
      }
    });
  }

  document.getElementById('shortcut-btn-cancel')?.addEventListener('click', closeModal);
  document.getElementById('folder-btn-cancel')?.addEventListener('click', closeFolderModal);

  document.querySelectorAll('.shortcut-form .clear-input-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const wrapper = (e.currentTarget as HTMLElement).closest('.md3-filled-input-wrapper');
      const input = wrapper?.querySelector('.md3-filled-input') as HTMLInputElement | null;
      if (input) {
        input.value = '';
        input.focus();
        wrapper?.classList.remove('has-error');
      }
    });
  });

  if (inputUrl) {
    inputUrl.addEventListener('focus', () => {
      inputUrl?.closest('.md3-filled-input-wrapper')?.classList.remove('has-error');
    });
    inputUrl.addEventListener('blur', () => inputUrl && handleUrlValidation(inputUrl, false));
  }

  if (inputIconUrl) {
    inputIconUrl.addEventListener('focus', () => {
      inputIconUrl?.closest('.md3-filled-input-wrapper')?.classList.remove('has-error');
    });
    inputIconUrl.addEventListener('blur', () => inputIconUrl && handleUrlValidation(inputIconUrl, true));
  }

  if (inputFolderIconUrl) {
    inputFolderIconUrl.addEventListener('focus', () => {
      inputFolderIconUrl?.closest('.md3-filled-input-wrapper')?.classList.remove('has-error');
    });
    inputFolderIconUrl.addEventListener('blur', () => inputFolderIconUrl && handleUrlValidation(inputFolderIconUrl, true));
  }
}

function ensureModalsMounted(): void {
  if (modalsInitialized) return;
  modalsInitialized = true;

  if (!document.getElementById('shortcutModal')) {
    mountTemplate('tpl-shortcut-modal');
  }
  if (!document.getElementById('folderModal')) {
    mountTemplate('tpl-folder-modal');
  }

  modal = document.getElementById('shortcutModal');
  form = document.getElementById('shortcutForm') as HTMLFormElement | null;
  inputName = document.getElementById('shortcutName') as HTMLInputElement | null;
  inputUrl = document.getElementById('shortcutUrl') as HTMLInputElement | null;
  inputIconUrl = document.getElementById('shortcutIconUrl') as HTMLInputElement | null;
  modalTitle = document.getElementById('shortcut-modal-title');

  folderModal = document.getElementById('folderModal');
  folderForm = document.getElementById('folderForm') as HTMLFormElement | null;
  inputFolderName = document.getElementById('folderName') as HTMLInputElement | null;
  inputFolderIconUrl = document.getElementById('folderIconUrl') as HTMLInputElement | null;
  folderModalTitle = document.getElementById('folder-modal-title');

  setupModalEvents();
}

export function openShortcutModal(
  index: number | null,
  getActiveList: () => ShortcutItem[],
  onSave: () => void,
): void {
  ensureModalsMounted();
  if (!modal || !inputName || !inputUrl || !inputIconUrl || !modalTitle) return;

  activeListGetter = getActiveList;
  activeSaveCallback = onSave;
  editingIndex = index;
  const list = getActiveList();

  if (index !== null && list[index]) {
    const item = list[index];
    modalTitle.textContent = t('shortcutEditTitle', 'Edit Shortcut');
    inputName.value = item.name;
    inputUrl.value = item.url || '';
    inputIconUrl.value = item.customIcon || item.iconUrl || '';
  } else {
    modalTitle.textContent = t('shortcutAddTitle', 'Add Shortcut');
    inputName.value = '';
    inputUrl.value = '';
    inputIconUrl.value = '';
  }

  inputName.closest('.md3-filled-input-wrapper')?.classList.remove('has-error');
  inputUrl.closest('.md3-filled-input-wrapper')?.classList.remove('has-error');
  inputIconUrl.closest('.md3-filled-input-wrapper')?.classList.remove('has-error');

  modal.classList.add('active');
  setTimeout(() => inputUrl?.focus(), 100);
}

export function openFolderModal(
  index: number | null,
  getActiveList: () => ShortcutItem[],
  onSave: () => void,
): void {
  ensureModalsMounted();
  if (!folderModal || !inputFolderName || !inputFolderIconUrl || !folderModalTitle) return;

  activeListGetter = getActiveList;
  activeSaveCallback = onSave;
  editingIndex = index;
  const list = getActiveList();

  if (index !== null && list[index]) {
    const item = list[index];
    folderModalTitle.textContent = t('editFolderTitle', 'Edit Folder');
    inputFolderName.value = item.name;
    inputFolderIconUrl.value = item.customIcon || item.iconUrl || '';
  } else {
    folderModalTitle.textContent = t('addFolderTitle', 'Add Folder');
    inputFolderName.value = '';
    inputFolderIconUrl.value = '';
  }

  inputFolderName.closest('.md3-filled-input-wrapper')?.classList.remove('has-error');
  inputFolderIconUrl.closest('.md3-filled-input-wrapper')?.classList.remove('has-error');

  folderModal.classList.add('active');
  setTimeout(() => inputFolderName?.focus(), 100);
}
