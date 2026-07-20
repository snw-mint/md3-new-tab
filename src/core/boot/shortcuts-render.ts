/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { globalState } from '../shared/state';
import { t } from '../shared/i18n';

export interface ShortcutItem {
  id: string;
  name: string;
  url: string;
  iconUrl?: string;
}

export class ShortcutsManager {
  private container!: HTMLElement;
  private shortcuts: ShortcutItem[] = [];
  private maxItems = 10;
  private editingIndex: number | null = null;
  private modal: HTMLElement | null = null;
  private form: HTMLFormElement | null = null;
  private inputName: HTMLInputElement | null = null;
  private inputUrl: HTMLInputElement | null = null;
  private inputIconUrl: HTMLInputElement | null = null;
  private modalTitle: HTMLElement | null = null;

  constructor() {
    this.container = document.getElementById('shortcutsGrid') as HTMLElement;
    this.modal = document.getElementById('shortcutModal');
    this.form = document.getElementById('shortcutForm') as HTMLFormElement;
    this.inputName = document.getElementById('shortcutName') as HTMLInputElement;
    this.inputUrl = document.getElementById('shortcutUrl') as HTMLInputElement;
    this.inputIconUrl = document.getElementById('shortcutIconUrl') as HTMLInputElement;
    this.modalTitle = document.getElementById('shortcut-modal-title');

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
    this.setupModalEvents();
  }

  public initDragDrop(initVanillaDragAndDrop: (options: {
    gridContainer: HTMLElement;
    onReorder: (oldIndex: number, newIndex: number) => void;
  }) => void): void {
    if (!this.container) return;
    initVanillaDragAndDrop({
      gridContainer: this.container,
      onReorder: (oldIndex: number, newIndex: number) => {
        const item = this.shortcuts.splice(oldIndex, 1)[0];
        this.shortcuts.splice(newIndex, 0, item);
        this.saveShortcuts();
        this.render();
      }
    });
  }

  private setupModalEvents() {
    if (!this.modal || !this.form) return;

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveShortcutData();
    });

    const closeBtn = document.getElementById('shortcut-btn-cancel');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    this.form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.saveShortcutData();
      }
    });

    const clearBtns = this.form.querySelectorAll('.clear-input-btn');
    clearBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const wrapper = (e.currentTarget as HTMLElement).closest(
          '.md3-filled-input-wrapper',
        );
        const input = wrapper?.querySelector(
          '.md3-filled-input',
        ) as HTMLInputElement;
        if (input) {
          input.value = '';
          input.focus();
          wrapper?.classList.remove('has-error');
        }
      });
    });

    if (this.inputUrl) {
      this.inputUrl.addEventListener('focus', () => {
        this.inputUrl!.closest('.md3-filled-input-wrapper')?.classList.remove(
          'has-error',
        );
      });
      this.inputUrl.addEventListener('blur', () =>
        this.handleUrlValidation(this.inputUrl!, false),
      );
    }

    if (this.inputIconUrl) {
      this.inputIconUrl.addEventListener('focus', () => {
        this.inputIconUrl!.closest(
          '.md3-filled-input-wrapper',
        )?.classList.remove('has-error');
      });
      this.inputIconUrl.addEventListener('blur', () =>
        this.handleUrlValidation(this.inputIconUrl!, true),
      );
    }
  }

  private handleUrlValidation(
    input: HTMLInputElement,
    isOptional: boolean,
  ): boolean {
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
    if (
      !this.modal ||
      !this.inputName ||
      !this.inputUrl ||
      !this.inputIconUrl ||
      !this.modalTitle
    )
      return;

    this.editingIndex = index;

    if (index !== null && this.shortcuts[index]) {
      const item = this.shortcuts[index];
      this.modalTitle.textContent = t('shortcutEditTitle');
      this.inputName.value = item.name;
      this.inputUrl.value = item.url;
      this.inputIconUrl.value = item.iconUrl || '';
    } else {
      this.modalTitle.textContent = t('shortcutAddTitle');
      this.inputName.value = '';
      this.inputUrl.value = '';
      this.inputIconUrl.value = '';
    }

    this.inputName
      .closest('.md3-filled-input-wrapper')
      ?.classList.remove('has-error');
    this.inputUrl
      .closest('.md3-filled-input-wrapper')
      ?.classList.remove('has-error');
    this.inputIconUrl
      .closest('.md3-filled-input-wrapper')
      ?.classList.remove('has-error');

    this.modal.classList.add('active');
    setTimeout(() => this.inputUrl?.focus(), 100);
  }

  private closeModal() {
    if (this.modal) {
      this.modal.classList.remove('active');
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
        let generatedName = urlObj.hostname.replace(/^www\./, '');
        generatedName =
          generatedName.charAt(0).toUpperCase() + generatedName.slice(1);
        nameStr = generatedName.split('.')[0];
      } catch {
        nameStr = 'New Shortcut';
      }
    }

    if (this.editingIndex !== null && this.shortcuts[this.editingIndex]) {
      this.shortcuts[this.editingIndex].name = nameStr;
      this.shortcuts[this.editingIndex].url = urlStr;
      this.shortcuts[this.editingIndex].iconUrl = iconUrlStr;
    } else {
      this.shortcuts.push({
        id: 'shortcut_' + Date.now(),
        name: nameStr,
        url: urlStr,
        iconUrl: iconUrlStr,
      });
    }

    this.saveShortcuts();
    this.render();
    this.closeModal();
  }

  private handleDocumentClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (
      !target.closest('.shortcut-dropdown') &&
      !target.closest('.menu-btn')
    ) {
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

      const isCurrentlyActive = dropdown?.classList.contains('active');
      this.closeAllDropdowns();

      if (dropdown && !isCurrentlyActive) {
        dropdown.classList.add('active');
      }
      return;
    }

    const addBtn = target.closest('.add-card-wrapper');
    if (addBtn) {
      e.preventDefault();
      this.openModal(null);
      return;
    }

    const editBtn = target.closest('.edit-option');
    if (editBtn) {
      e.preventDefault();
      const index = parseInt((editBtn as HTMLElement).dataset.index || '-1', 10);
      if (index >= 0) this.openModal(index);
      return;
    }

    const removeBtn = target.closest('.remove-option');
    if (removeBtn) {
      e.preventDefault();
      const index = parseInt(
        (removeBtn as HTMLElement).dataset.index || '-1',
        10,
      );
      if (index >= 0) this.removeShortcut(index);
      return;
    }
  }

  private closeAllDropdowns() {
    const dropdowns = this.container.querySelectorAll(
      '.shortcut-dropdown.active',
    );
    dropdowns.forEach((d) => d.classList.remove('active'));
  }

  private removeShortcut(index: number) {
    this.shortcuts.splice(index, 1);
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
        { id: 'shortcut_1781923170642', name: 'MD3', url: 'https://m3.material.io/' },
        { id: 'shortcut_1781923240189', name: 'Youtube', url: 'https://youtube.com' },
        { id: 'shortcut_1781923227005', name: 'GitHub', url: 'https://github.com/snw-mint/md3-new-tab' },
        { id: 'shortcut_1781923256701', name: 'BMC', url: 'https://buymeacoffee.com/snw.mint' },
        { id: 'shortcut_1781923301038', name: 'Gemini', url: 'https://gemini.google.com' },
        { id: 'shortcut_1781923355670', name: 'Reddit', url: 'https://reddit.com', iconUrl: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/reddit-icon.png' },
        { id: 'shortcut_1781923629158', name: 'Spotify', url: 'https://spotify.com' }
      ];
    }
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

    const itemsToRender = this.shortcuts.slice(0, this.maxItems);

    itemsToRender.forEach((shortcut, index) => {
      this.container.appendChild(this.createShortcutElement(shortcut, index));
    });

    if (this.shortcuts.length < this.maxItems) {
      this.container.appendChild(this.createAddShortcutButton());
    }

    const totalRenderedItems = this.container.children.length;
    const actualRows = Math.ceil(totalRenderedItems / 10) || 1;
    document.documentElement.style.setProperty('--shortcuts-reserved-rows', String(actualRows));

    if (totalRenderedItems <= 10) {
      this.container.classList.add('single-row');
    } else {
      this.container.classList.remove('single-row');
    }
    this.container.style.setProperty(
      '--shortcut-count',
      String(totalRenderedItems),
    );
  }

  private createShortcutElement(
    shortcut: ShortcutItem,
    index: number,
  ): HTMLElement {
    const wrapper = document.createElement('a');
    wrapper.className = 'shortcut-item';
    wrapper.href = shortcut.url;
    wrapper.draggable = true;
    wrapper.dataset.index = index.toString();

    const card = document.createElement('div');
    card.className = 'shortcut-card';
    card.draggable = false;

    let iconEl: HTMLElement;
    let finalIconUrl = shortcut.iconUrl;

    if (!finalIconUrl) {
      try {
        const urlObj = new URL(shortcut.url);
        finalIconUrl = `https://favicon.vemetric.com/${urlObj.hostname}?size=64`;
      } catch (e) {
      }
    }

    if (finalIconUrl) {
      const img = document.createElement('img');
      img.className = 'shortcut-icon loaded';
      img.src = finalIconUrl;
      img.draggable = false;
      img.onerror = () => {
        img.replaceWith(this.createFallbackIcon());
      };
      iconEl = img;
    } else {
      iconEl = this.createFallbackIcon();
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
      <span>Edit</span>
    `;

    const removeOption = document.createElement('div');
    removeOption.className = 'menu-option remove-option';
    removeOption.dataset.index = index.toString();
    removeOption.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
      <span>Remove</span>
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

  private createFallbackIcon(): HTMLElement {
    const span = document.createElement('span');
    span.className = 'shortcut-icon loaded fallback-icon';
    span.draggable = false;
    span.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M480-80q-83 0-156-31.5T197-197t-85.5-127T80-480t31.5-156T197-763t127-85.5T480-880t156 31.5T763-763t85.5 127T880-480t-31.5 156T763-197t-127 85.5T480-80m0-80q134 0 227-93t93-227q0-7-.5-14.5T799-507q-5 29-27 48t-52 19h-80q-33 0-56.5-23.5T560-520v-40H400v-80q0-33 23.5-56.5T480-720h40q0-23 12.5-40.5T563-789q-20-5-40.5-8t-42.5-3q-134 0-227 93t-93 227h200q66 0 113 47t47 113v40H400v110q20 5 39.5 7.5T480-160"/></svg>`;
    return span;
  }

  private createAddShortcutButton(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'shortcut-item add-card-wrapper';
    wrapper.draggable = false;

    const card = document.createElement('div');
    card.className = 'shortcut-card';

    const icon = document.createElement('span');
    icon.className = 'add-icon-svg';
    icon.innerHTML = `
      <svg class="add-icon-bg" width="380" height="380" viewBox="0 0 380 380" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M338.584 190c0 39.407-15.654 77.2-43.519 105.065c-27.865 27.865-65.658 43.519-105.065 43.519c-39.407 0-77.2-15.654-105.065-43.519c-27.865-27.865-43.519-65.658-43.519-105.065c0-39.407 15.654-77.2 43.519-105.065c27.865-27.865 65.658-43.519 105.065-43.519c39.407 0 77.2 15.654 105.065 43.519c27.865 27.865 43.519 65.658 43.519 105.065" fill="currentColor"/></svg>
      <svg class="add-icon-plus" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>
    `;

    card.appendChild(icon);

    const title = document.createElement('span');
    title.className = 'shortcut-title';
    title.textContent = t('shortcutAddTitle');

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
