import { globalState } from '../shared/state';
import { t } from '../shared/i18n';
import { ShortcutItem } from '../shared/types';
import { FOLDER_ICON, SHORTCUT_ICON } from '../shared/icons';

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

  if (lower.startsWith('data:') && !lower.startsWith('data:image/')) {
    return '';
  }

  return tr;
}

let shortcutItemTemplate: HTMLAnchorElement | null = null;

function getShortcutItemTemplate(): HTMLAnchorElement {
  if (!shortcutItemTemplate) {
    const wrapper = document.createElement('a');
    wrapper.className = 'shortcut-item';
    wrapper.draggable = true;

    const card = document.createElement('div');
    card.className = 'shortcut-card';
    card.draggable = false;

    const menuWrapper = document.createElement('div');
    menuWrapper.className = 'menu-wrapper';

    const menuBtn = document.createElement('button');
    menuBtn.className = 'menu-btn';
    menuBtn.title = 'More options';
    menuBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><use href="#icon-more-vert" /></svg>`;

    const dropdown = document.createElement('div');
    dropdown.className = 'shortcut-dropdown';

    const editOption = document.createElement('div');
    editOption.className = 'menu-option edit-option';
    editOption.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><use href="#icon-edit" /></svg><span>${t('editLabel', 'Edit')}</span>`;

    const removeOption = document.createElement('div');
    removeOption.className = 'menu-option remove-option';
    removeOption.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><use href="#icon-delete" /></svg><span>${t('removeLabel', 'Remove')}</span>`;

    dropdown.appendChild(editOption);
    dropdown.appendChild(removeOption);
    menuWrapper.appendChild(menuBtn);
    menuWrapper.appendChild(dropdown);

    const title = document.createElement('span');
    title.className = 'shortcut-title';
    title.draggable = false;

    wrapper.appendChild(card);
    wrapper.appendChild(menuWrapper);
    wrapper.appendChild(title);

    shortcutItemTemplate = wrapper;
  }
  return shortcutItemTemplate;
}

export class ShortcutsManager {
  private container!: HTMLElement;
  private folderBackWrapper: HTMLElement | null = null;
  private folderBackBtn: HTMLElement | null = null;
  private currentFolderId: string | null = null;
  private shortcuts: ShortcutItem[] = [];
  private maxItems = 10;

  constructor() {
    this.container = document.getElementById('shortcutsGrid') as HTMLElement;
    this.folderBackWrapper = document.getElementById('folderBackWrapper');
    this.folderBackBtn = document.getElementById('folderBackBtn');

    this.loadShortcuts();
    this.init();

    globalState.subscribe((state) => {
      this.updateRows(state.shortcutsRows);
    });
  }

  private init(): void {
    if (!this.container) return;
    this.render();

    this.container.addEventListener('click', this.handleGridClick.bind(this));
    document.addEventListener('click', this.handleDocumentClick.bind(this));
    document.addEventListener('i18nReady', () => {
      shortcutItemTemplate = null;
      this.render();
    });

    if (this.folderBackBtn) {
      this.folderBackBtn.addEventListener('click', () => {
        this.currentFolderId = null;
        this.render();
        this.triggerTransition();
      });
    }
  }

  private triggerTransition(): void {
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

  private handleDocumentClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (!target.closest('.shortcut-dropdown') && !target.closest('.menu-btn') && !target.closest('.add-card-wrapper')) {
      this.closeAllDropdowns();
    }
  }

  private handleGridClick(e: MouseEvent): void {
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
      import('../lazy/shortcuts-modals').then(({ openFolderModal }) => {
        openFolderModal(null, () => this.getActiveList(), () => {
          this.saveShortcuts();
          this.render();
        });
      });
      return;
    }

    const addOpt = target.closest('.add-link-option');
    if (addOpt) {
      e.preventDefault();
      e.stopPropagation();
      this.closeAllDropdowns();
      import('../lazy/shortcuts-modals').then(({ openShortcutModal }) => {
        openShortcutModal(null, () => this.getActiveList(), () => {
          this.saveShortcuts();
          this.render();
        });
      });
      return;
    }

    const addCard = target.closest('.add-card-wrapper');
    if (addCard) {
      e.preventDefault();
      e.stopPropagation();
      if (this.currentFolderId) {
        this.closeAllDropdowns();
        import('../lazy/shortcuts-modals').then(({ openShortcutModal }) => {
          openShortcutModal(null, () => this.getActiveList(), () => {
            this.saveShortcuts();
            this.render();
          });
        });
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
        const isFolder = list[index]?.type === 'folder';
        import('../lazy/shortcuts-modals').then(({ openFolderModal, openShortcutModal }) => {
          const onSave = () => {
            this.saveShortcuts();
            this.render();
          };
          if (isFolder) {
            openFolderModal(index, () => this.getActiveList(), onSave);
          } else {
            openShortcutModal(index, () => this.getActiveList(), onSave);
          }
        });
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

  private closeAllDropdowns(): void {
    const dropdowns = this.container.querySelectorAll('.shortcut-dropdown.active');
    dropdowns.forEach((d) => d.classList.remove('active'));

    const addWrappers = this.container.querySelectorAll('.add-card-wrapper.active');
    addWrappers.forEach((w) => w.classList.remove('active'));
  }

  private removeShortcut(index: number): void {
    const list = this.getActiveList();
    list.splice(index, 1);
    this.saveShortcuts();
    this.render();
  }

  private saveShortcuts(): void {
    localStorage.setItem('ent_shortcuts', JSON.stringify(this.shortcuts));
  }

  private loadShortcuts(): void {
    const saved = localStorage.getItem('ent_shortcuts');
    if (saved) {
      try {
        this.shortcuts = JSON.parse(saved);
      } catch {
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
        { id: 'shortcut_1781923629158', type: 'link', name: 'Spotify', url: 'https://spotify.com' },
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

  private updateRows(rowsStr: string): void {
    if (!this.container) return;
    const rows = parseInt(rowsStr, 10) || 1;
    this.maxItems = rows * 10;
    this.render();
  }

  public render(): void {
    if (!this.container) return;

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

    const fragment = document.createDocumentFragment();
    const itemsToRender = list.slice(0, limit);

    for (let index = 0; index < itemsToRender.length; index++) {
      fragment.appendChild(this.createShortcutElement(itemsToRender[index], index));
    }

    if (list.length < limit) {
      fragment.appendChild(this.createAddShortcutButton());
    }

    this.container.replaceChildren(fragment);

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
    const wrapper = getShortcutItemTemplate().cloneNode(true) as HTMLAnchorElement;
    wrapper.href = isFolder ? '#' : sanitizeUrl(shortcut.url);
    wrapper.dataset.index = index.toString();
    wrapper.dataset.type = isFolder ? 'folder' : 'link';
    if (shortcut.id) wrapper.dataset.id = shortcut.id;

    const card = wrapper.querySelector('.shortcut-card') as HTMLDivElement;

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
        } catch {}
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

    const editOption = wrapper.querySelector('.edit-option') as HTMLElement | null;
    const removeOption = wrapper.querySelector('.remove-option') as HTMLElement | null;
    if (editOption) editOption.dataset.index = index.toString();
    if (removeOption) removeOption.dataset.index = index.toString();

    const title = wrapper.querySelector('.shortcut-title') as HTMLElement | null;
    if (title) title.textContent = shortcut.name;

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
      <svg class="add-icon-plus" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
        <use href="#icon-add" />
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
