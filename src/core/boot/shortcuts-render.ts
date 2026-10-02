/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { globalState } from '../shared/state';
import { t } from '../shared/i18n';
import { ShortcutItem } from '../shared/types';

function sanitizeUrl(url: string | undefined | null): string {
  if (!url) return 'about:blank';
  const tr = url.trim();

  const clean = tr.replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, '');
  const lower = clean.toLowerCase();

  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return 'about:blank';
  }

  return tr;
}

function sanitizeIconUrl(url: string | undefined | null): string {
  if (!url) return '';
  const tr = url.trim();

  const clean = tr.replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, '');
  const lower = clean.toLowerCase();

  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return '';
  }

  if (lower.startsWith('data:')) {
    if (!lower.startsWith('data:image/')) {
      return '';
    }
  }

  return tr;
}

const FOLDER_ICON = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h207q16 0 30.5 6t25.5 17l57 57h320q33 0 56.5 23.5T880-640v400q0 33-23.5 56.5T800-160z"/></svg>`;
const SHORTCUT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M318-120q-82 0-140-58t-58-140q0-40 15-76t43-64l105-105q12-12 28.5-12t28.5 12 12 28-12 28L234-401q-17 17-25.5 38.5T200-318q0 49 34.5 83.5T318-200q23 0 45-8.5t39-25.5l105-106q12-11 28-11t28 12 12 28-12 28L458-178q-28 28-64 43t-76 15m50-248q-12-12-12-28.5t12-28.5l167-167q12-12 28.5-12t28.5 12 12 28.5-12 28.5L425-368q-12 12-28.5 12T368-368m252-29q-12-12-12-28t12-28l106-105q17-17 25-38t8-44q0-50-34-85t-84-35q-23 0-44.5 8.5T558-726L453-620q-12 12-28 12t-28-12-12-28.5 12-28.5l105-105q28-28 64-43t76-15q82 0 139.5 58T839-641q0 39-14.5 75T782-502L677-397q-12 12-28.5 12T620-397"/></svg>`;

export class ShortcutsManager {
  private container!: HTMLElement;
  private folderBackWrapper: HTMLElement | null = null;
  private folderBackBtn: HTMLElement | null = null;
  private currentFolderId: string | null = null;
  private shortcuts: ShortcutItem[] = [];
  private maxItems = 10;
  private editingIndex: number | null = null;
  private modal: HTMLElement | null = null;
  private form: HTMLFormElement | null = null;
  private inputName: HTMLInputElement | null = null;
  private inputUrl: HTMLInputElement | null = null;
  private inputIconUrl: HTMLInputElement | null = null;
  private modalTitle: HTMLElement | null = null;
  private folderModal: HTMLElement | null = null;
  private folderForm: HTMLFormElement | null = null;
  private inputFolderName: HTMLInputElement | null = null;
  private inputFolderIconUrl: HTMLInputElement | null = null;
  private folderModalTitle: HTMLElement | null = null;

  constructor() {
    this.container = document.getElementById('shortcutsGrid') as HTMLElement;
    this.folderBackWrapper = document.getElementById('folderBackWrapper');
    this.folderBackBtn = document.getElementById('folderBackBtn');
    this.modal = document.getElementById('shortcutModal');
    this.form = document.getElementById('shortcutForm') as HTMLFormElement;
    this.inputName = document.getElementById('shortcutName') as HTMLInputElement;
    this.inputUrl = document.getElementById('shortcutUrl') as HTMLInputElement;
    this.inputIconUrl = document.getElementById('shortcutIconUrl') as HTMLInputElement;
    this.modalTitle = document.getElementById('shortcut-modal-title');
    this.folderModal = document.getElementById('folderModal');
    this.folderForm = document.getElementById('folderForm') as HTMLFormElement;
    this.inputFolderName = document.getElementById('folderName') as HTMLInputElement;
    this.inputFolderIconUrl = document.getElementById('folderIconUrl') as HTMLInputElement;
    this.folderModalTitle = document.getElementById('folder-modal-title');

    this.loadShortcuts();
    this.init();

    globalState.subscribe((state) => {
      this.updateRows(state.shortcutsRows);
    });
  }

  private init() {
    if (!this.container) return;
    this.render();

    this.container.addEventListener('click', this.handleGridClick.bind(this));
    document.addEventListener('click', this.handleDocumentClick.bind(this));

    if (this.folderBackBtn) {
      this.folderBackBtn.addEventListener('click', () => {
        this.currentFolderId = null;
        this.render();
        this.triggerTransition();
      });
    }

    this.setupModalEvents();
  }

  private triggerTransition() {
    this.container.classList.remove('folder-transition');
    void this.container.offsetWidth;
    this.container.classList.add('folder-transition');
  }

  public initDragDrop(initVanillaDragAndDrop: (options: {
    gridContainer: HTMLElement;
    onReorder: (oldIndex: number, newIndex: number) => void;
    onMoveToFolder?: (itemIndex: number, folderId: string) => void;
    onMoveOutFolder?: (itemIndex: number) => boolean | void;
  }) => void): void {
    if (!this.container) return;
    initVanillaDragAndDrop({
      gridContainer: this.container,
      onReorder: (oldIndex: number, newIndex: number) => {
        const list = this.getActiveList();
        const item = list.splice(oldIndex, 1)[0];
        list.splice(newIndex, 0, item);
        this.saveShortcuts();
        this.render();
      },
      onMoveToFolder: (itemIndex: number, folderId: string) => {
        const list = this.getActiveList();
        const target = this.shortcuts.find((s) => s.id === folderId && s.type === 'folder');
        if (target && list[itemIndex]) {
          if (!target.children) target.children = [];
          const item = list.splice(itemIndex, 1)[0];
          target.children.push(item);
          this.saveShortcuts();
          this.render();
        }
      },
      onMoveOutFolder: (itemIndex: number) => {
        if (!this.currentFolderId) return;
        const list = this.getActiveList();
        if (list[itemIndex]) {
          const item = list.splice(itemIndex, 1)[0];
          this.shortcuts.push(item);
          this.saveShortcuts();
          this.render();
          return true;
        }
      },
    });
  }

  private setupModalEvents() {
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveShortcutData();
      });

      this.form.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.saveShortcutData();
        }
      });
    }

    if (this.folderForm) {
      this.folderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveFolderData();
      });

      this.folderForm.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.saveFolderData();
        }
      });
    }

    const closeBtn = document.getElementById('shortcut-btn-cancel');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    const folderCloseBtn = document.getElementById('folder-btn-cancel');
    if (folderCloseBtn) {
      folderCloseBtn.addEventListener('click', () => this.closeFolderModal());
    }

    const clearBtns = document.querySelectorAll('.shortcut-form .clear-input-btn');
    clearBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const wrapper = (e.currentTarget as HTMLElement).closest('.md3-filled-input-wrapper');
        const input = wrapper?.querySelector('.md3-filled-input') as HTMLInputElement;
        if (input) {
          input.value = '';
          input.focus();
          wrapper?.classList.remove('has-error');
        }
      });
    });

    if (this.inputUrl) {
      this.inputUrl.addEventListener('focus', () => {
        this.inputUrl!.closest('.md3-filled-input-wrapper')?.classList.remove('has-error');
      });
      this.inputUrl.addEventListener('blur', () => this.handleUrlValidation(this.inputUrl!, false));
    }

    if (this.inputIconUrl) {
      this.inputIconUrl.addEventListener('focus', () => {
        this.inputIconUrl!.closest('.md3-filled-input-wrapper')?.classList.remove('has-error');
      });
      this.inputIconUrl.addEventListener('blur', () => this.handleUrlValidation(this.inputIconUrl!, true));
    }

    if (this.inputFolderIconUrl) {
      this.inputFolderIconUrl.addEventListener('focus', () => {
        this.inputFolderIconUrl!.closest('.md3-filled-input-wrapper')?.classList.remove('has-error');
      });
      this.inputFolderIconUrl.addEventListener('blur', () => this.handleUrlValidation(this.inputFolderIconUrl!, true));
    }
  }

  private handleUrlValidation(input: HTMLInputElement, isOptional: boolean): boolean {
    const wrapper = input.closest('.md3-filled-input-wrapper');
    if (!wrapper) return true;

    const val = input.value.trim();

    if (!val) {
      if (isOptional) {
        wrapper.classList.remove('has-error');
        return true;
      } else {
        wrapper.classList.add('has-error');
        return false;
      }
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
    } catch (e) {
      wrapper.classList.add('has-error');
      return false;
    }
  }

  private openModal(index: number | null) {
    if (!this.modal || !this.inputName || !this.inputUrl || !this.inputIconUrl || !this.modalTitle) return;

    this.editingIndex = index;
    const list = this.getActiveList();

    if (index !== null && list[index]) {
      const item = list[index];
      this.modalTitle.textContent = t('shortcutEditTitle', 'Edit Shortcut');
      this.inputName.value = item.name;
      this.inputUrl.value = item.url || '';
      this.inputIconUrl.value = item.customIcon || item.iconUrl || '';
    } else {
      this.modalTitle.textContent = t('shortcutAddTitle', 'Add Shortcut');
      this.inputName.value = '';
      this.inputUrl.value = '';
      this.inputIconUrl.value = '';
    }

    this.inputName.closest('.md3-filled-input-wrapper')?.classList.remove('has-error');
    this.inputUrl.closest('.md3-filled-input-wrapper')?.classList.remove('has-error');
    this.inputIconUrl.closest('.md3-filled-input-wrapper')?.classList.remove('has-error');

    this.modal.classList.add('active');
    setTimeout(() => this.inputUrl?.focus(), 100);
  }

  private closeModal() {
    if (this.modal) {
      this.modal.classList.remove('active');
    }
    this.editingIndex = null;
  }

  private openFolderModal(index: number | null) {
    if (!this.folderModal || !this.inputFolderName || !this.inputFolderIconUrl || !this.folderModalTitle) return;

    this.editingIndex = index;
    const list = this.getActiveList();

    if (index !== null && list[index]) {
      const item = list[index];
      this.folderModalTitle.textContent = t('editFolderTitle', 'Edit Folder');
      this.inputFolderName.value = item.name;
      this.inputFolderIconUrl.value = item.customIcon || item.iconUrl || '';
    } else {
      this.folderModalTitle.textContent = t('addFolderTitle', 'Add Folder');
      this.inputFolderName.value = '';
      this.inputFolderIconUrl.value = '';
    }

    this.inputFolderName.closest('.md3-filled-input-wrapper')?.classList.remove('has-error');
    this.inputFolderIconUrl.closest('.md3-filled-input-wrapper')?.classList.remove('has-error');

    this.folderModal.classList.add('active');
    setTimeout(() => this.inputFolderName?.focus(), 100);
  }

  private closeFolderModal() {
    if (this.folderModal) {
      this.folderModal.classList.remove('active');
    }
    this.editingIndex = null;
  }

  private saveShortcutData() {
    if (!this.inputName || !this.inputUrl || !this.inputIconUrl) return;

    const isUrlValid = this.handleUrlValidation(this.inputUrl, false);
    const isIconUrlValid = this.handleUrlValidation(this.inputIconUrl, true);
    if (!isUrlValid || !isIconUrlValid) return;

    const urlStr = this.inputUrl.value.trim();
    let nameStr = this.inputName.value.trim();
    const iconUrlStr = this.inputIconUrl.value.trim() || undefined;

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

    const list = this.getActiveList();

    if (this.editingIndex !== null && list[this.editingIndex]) {
      list[this.editingIndex].name = nameStr;
      list[this.editingIndex].url = urlStr;
      list[this.editingIndex].iconUrl = iconUrlStr;
      list[this.editingIndex].customIcon = iconUrlStr;
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

    this.saveShortcuts();
    this.render();
    this.closeModal();
  }

  private saveFolderData() {
    if (!this.inputFolderName || !this.inputFolderIconUrl) return;

    const isIconValid = this.handleUrlValidation(this.inputFolderIconUrl, true);
    if (!isIconValid) return;

    const nameStr = this.inputFolderName.value.trim() || 'New Folder';
    const iconUrlStr = this.inputFolderIconUrl.value.trim() || undefined;

    const list = this.getActiveList();

    if (this.editingIndex !== null && list[this.editingIndex]) {
      list[this.editingIndex].name = nameStr;
      list[this.editingIndex].iconUrl = iconUrlStr;
      list[this.editingIndex].customIcon = iconUrlStr;
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

    this.saveShortcuts();
    this.render();
    this.closeFolderModal();
  }

  private handleDocumentClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('.shortcut-dropdown') && !target.closest('.menu-btn') && !target.closest('.add-card-wrapper')) {
      this.closeAllDropdowns();
    }
  }

  private handleGridClick(e: MouseEvent) {
    const target = e.target as HTMLElement;

    if (target.closest('.menu-btn')) {
      e.preventDefault();
      e.stopPropagation();

      const wrapper = target.closest('.menu-wrapper');
      const dropdown = wrapper?.querySelector('.shortcut-dropdown');

      const isActive = dropdown?.classList.contains('active');
      this.closeAllDropdowns();

      if (dropdown && !isActive) {
        dropdown.classList.add('active');
      }
      return;
    }

    const addFolderOpt = target.closest('.add-folder-option');
    if (addFolderOpt) {
      e.preventDefault();
      e.stopPropagation();
      this.closeAllDropdowns();
      this.openFolderModal(null);
      return;
    }

    const addOpt = target.closest('.add-link-option');
    if (addOpt) {
      e.preventDefault();
      e.stopPropagation();
      this.closeAllDropdowns();
      this.openModal(null);
      return;
    }

    const addCard = target.closest('.add-card-wrapper');
    if (addCard) {
      e.preventDefault();
      e.stopPropagation();
      if (this.currentFolderId) {
        this.closeAllDropdowns();
        this.openModal(null);
        return;
      }
      const isActive = addCard.classList.contains('active');
      this.closeAllDropdowns();
      if (!isActive) addCard.classList.add('active');
      return;
    }

    const editBtn = target.closest('.edit-option');
    if (editBtn) {
      e.preventDefault();
      const index = parseInt((editBtn as HTMLElement).dataset.index || '-1', 10);
      if (index >= 0) {
        const list = this.getActiveList();
        if (list[index]?.type === 'folder') {
          this.openFolderModal(index);
        } else {
          this.openModal(index);
        }
      }
      return;
    }

    const removeBtn = target.closest('.remove-option');
    if (removeBtn) {
      e.preventDefault();
      const index = parseInt((removeBtn as HTMLElement).dataset.index || '-1', 10);
      if (index >= 0) this.removeShortcut(index);
      return;
    }

    const folderCard = target.closest('.shortcut-item[data-type="folder"]');
    if (folderCard && !target.closest('.menu-wrapper')) {
      e.preventDefault();
      const id = (folderCard as HTMLElement).dataset.id;
      if (id) {
        this.currentFolderId = id;
        this.render();
        this.triggerTransition();
      }
      return;
    }
  }

  private closeAllDropdowns() {
    const dropdowns = this.container.querySelectorAll('.shortcut-dropdown.active');
    dropdowns.forEach((d) => d.classList.remove('active'));

    const addWrappers = this.container.querySelectorAll('.add-card-wrapper.active');
    addWrappers.forEach((w) => w.classList.remove('active'));
  }

  private removeShortcut(index: number) {
    const list = this.getActiveList();
    list.splice(index, 1);
    this.saveShortcuts();
    this.render();
  }

  private saveShortcuts() {
    localStorage.setItem('ent_shortcuts', JSON.stringify(this.shortcuts));
  }

  private loadShortcuts() {
    const saved = localStorage.getItem('ent_shortcuts');
    if (saved) {
      try {
        this.shortcuts = JSON.parse(saved);
      } catch (e) {
        this.shortcuts = [];
      }
    } else {
      this.shortcuts = [
        { id: 'shortcut_1781923170642', type: 'link', name: 'MD3', url: 'https://m3.material.io/' },
        { id: 'shortcut_1781923240189', type: 'link', name: 'Youtube', url: 'https://youtube.com' },
        { id: 'shortcut_1781923227005', type: 'link', name: 'GitHub', url: 'https://github.com/snw-mint/md3-new-tab' },
        { id: 'shortcut_1781923256701', type: 'link', name: 'BMC', url: 'https://buymeacoffee.com/snw.mint' },
        { id: 'shortcut_1781923301038', type: 'link', name: 'Gemini', url: 'https://gemini.google.com' },
        { id: 'shortcut_1781923355670', type: 'link', name: 'Reddit', url: 'https://reddit.com', iconUrl: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/reddit-icon.png' },
        { id: 'shortcut_1781923629158', type: 'link', name: 'Spotify', url: 'https://spotify.com' }
      ];
    }
  }

  private getActiveList(): ShortcutItem[] {
    if (this.currentFolderId) {
      const folder = this.shortcuts.find((s) => s.id === this.currentFolderId && s.type === 'folder');
      if (folder) {
        if (!folder.children) folder.children = [];
        return folder.children;
      }
    }
    return this.shortcuts;
  }

  private updateRows(rowsStr: string) {
    if (!this.container) return;
    const rows = parseInt(rowsStr, 10) || 1;
    this.maxItems = rows * 10;
    this.render();
  }

  public render() {
    if (!this.container) return;
    this.container.innerHTML = '';

    const list = this.getActiveList();
    const limit = this.currentFolderId ? 40 : this.maxItems;
    const isInside = Boolean(this.currentFolderId);

    if (this.folderBackWrapper) {
      if (isInside) {
        this.folderBackWrapper.classList.add('visible');
        const label = this.folderBackWrapper.querySelector('.folder-back-label');
        if (label) label.textContent = t('backLabel', 'Back');
      } else {
        this.folderBackWrapper.classList.remove('visible');
      }
    }

    const itemsToRender = list.slice(0, limit);

    itemsToRender.forEach((shortcut, index) => {
      this.container.appendChild(this.createShortcutElement(shortcut, index));
    });

    if (list.length < limit) {
      this.container.appendChild(this.createAddShortcutButton());
    }

    const total = this.container.children.length;
    const rows = Math.ceil(total / 10) || 1;
    document.documentElement.style.setProperty('--shortcuts-reserved-rows', String(rows));

    if (total <= 10) {
      this.container.classList.add('single-row');
      if (this.folderBackWrapper) this.folderBackWrapper.classList.add('single-row');
    } else {
      this.container.classList.remove('single-row');
      if (this.folderBackWrapper) this.folderBackWrapper.classList.remove('single-row');
    }

    if (globalState.current.hideShortcutNames) {
      this.container.setAttribute('data-hide-names', 'true');
    } else {
      this.container.removeAttribute('data-hide-names');
    }

    this.container.style.setProperty('--shortcut-count', String(total));
    if (this.folderBackWrapper) this.folderBackWrapper.style.setProperty('--shortcut-count', String(total));
  }

  private createShortcutElement(shortcut: ShortcutItem, index: number): HTMLElement {
    const isFolder = shortcut.type === 'folder';
    const wrapper = document.createElement('a');
    wrapper.className = 'shortcut-item';
    wrapper.href = isFolder ? '#' : sanitizeUrl(shortcut.url);
    wrapper.draggable = true;
    wrapper.dataset.index = index.toString();
    wrapper.dataset.type = isFolder ? 'folder' : 'link';
    if (shortcut.id) wrapper.dataset.id = shortcut.id;

    const card = document.createElement('div');
    card.className = 'shortcut-card';
    card.draggable = false;

    let iconEl: HTMLElement;
    const finalIcon = shortcut.customIcon || shortcut.iconUrl;

    if (isFolder) {
      if (finalIcon) {
        const img = document.createElement('img');
        img.className = 'shortcut-icon loaded';
        img.src = sanitizeIconUrl(finalIcon);
        img.draggable = false;
        img.onerror = () => {
          img.replaceWith(this.createFolderFallbackIcon());
        };
        iconEl = img;
      } else {
        iconEl = this.createFolderFallbackIcon();
      }
    } else {
      let finalUrl = finalIcon;
      if (!finalUrl && shortcut.url) {
        try {
          const urlObj = new URL(shortcut.url);
          finalUrl = `https://favicon.vemetric.com/${urlObj.hostname}?size=64`;
        } catch (e) { }
      }

      const sanitized = sanitizeIconUrl(finalUrl);
      if (sanitized) {
        const img = document.createElement('img');
        img.className = 'shortcut-icon loaded';
        img.src = sanitized;
        img.draggable = false;
        img.onerror = () => {
          img.replaceWith(this.createFallbackIcon());
        };
        iconEl = img;
      } else {
        iconEl = this.createFallbackIcon();
      }
    }

    card.appendChild(iconEl);

    const menuWrapper = document.createElement('div');
    menuWrapper.className = 'menu-wrapper';

    const menuBtn = document.createElement('button');
    menuBtn.className = 'menu-btn';
    menuBtn.title = 'More options';
    menuBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z"/></svg>`;

    const dropdown = document.createElement('div');
    dropdown.className = 'shortcut-dropdown';

    const editOption = document.createElement('div');
    editOption.className = 'menu-option edit-option';
    editOption.dataset.index = index.toString();
    editOption.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
      <span>${t('editLabel', 'Edit')}</span>
    `;

    const removeOption = document.createElement('div');
    removeOption.className = 'menu-option remove-option';
    removeOption.dataset.index = index.toString();
    removeOption.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
      <span>${t('removeLabel', 'Remove')}</span>
    `;

    dropdown.appendChild(editOption);
    dropdown.appendChild(removeOption);

    menuWrapper.appendChild(menuBtn);
    menuWrapper.appendChild(dropdown);

    const title = document.createElement('span');
    title.className = 'shortcut-title';
    title.textContent = shortcut.name;
    title.draggable = false;

    wrapper.appendChild(card);
    wrapper.appendChild(menuWrapper);
    wrapper.appendChild(title);

    return wrapper;
  }

  private createFolderFallbackIcon(): HTMLElement {
    const span = document.createElement('span');
    span.className = 'shortcut-icon loaded fallback-icon';
    span.draggable = false;
    span.innerHTML = FOLDER_ICON;
    return span;
  }

  private createFallbackIcon(): HTMLElement {
    const span = document.createElement('span');
    span.className = 'shortcut-icon loaded fallback-icon';
    span.draggable = false;
    span.innerHTML = SHORTCUT_ICON;
    return span;
  }

  private createAddShortcutButton(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'shortcut-item add-card-wrapper';
    wrapper.draggable = false;

    const speedDial = document.createElement('div');
    speedDial.className = 'add-fab-speed-dial';

    const folderPill = document.createElement('button');
    folderPill.type = 'button';
    folderPill.className = 'add-fab-pill add-folder-option';
    folderPill.innerHTML = `
      <span class="pill-icon">${FOLDER_ICON}</span>
      <span class="pill-label">${t('addFolderTitle', 'Add Folder')}</span>
    `;

    const linkPill = document.createElement('button');
    linkPill.type = 'button';
    linkPill.className = 'add-fab-pill add-link-option';
    linkPill.innerHTML = `
      <span class="pill-icon">${SHORTCUT_ICON}</span>
      <span class="pill-label">${t('addShortcutTitle', 'Add Shortcut')}</span>
    `;

    if (!this.currentFolderId) {
      speedDial.appendChild(folderPill);
    }
    speedDial.appendChild(linkPill);

    const card = document.createElement('div');
    card.className = 'shortcut-card add-card-btn';
    card.innerHTML = `
      <svg class="add-icon-plus" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
        <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>
      </svg>
    `;

    const title = document.createElement('span');
    title.className = 'shortcut-title';
    title.setAttribute('data-i18n', 'shortcutAddTitle');
    title.textContent = t('shortcutAddTitle', 'Add Shortcut');

    wrapper.appendChild(speedDial);
    wrapper.appendChild(card);
    wrapper.appendChild(title);

    return wrapper;
  }
}

let instance: ShortcutsManager | null = null;

export function initShortcuts(): ShortcutsManager {
  if (!instance) {
    instance = new ShortcutsManager();
  }
  return instance;
}
