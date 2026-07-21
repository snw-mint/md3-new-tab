/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

let activeSelectTrigger: HTMLButtonElement | null = null;
let _popup: HTMLElement | null = null;
let listContainer: HTMLDivElement | null = null;
import { t } from '../shared/i18n';

export function closeSelectPopup(): void {
  if (_popup) _popup.classList.remove('active');
  if (activeSelectTrigger) {
    activeSelectTrigger.classList.remove('popup-open');
    activeSelectTrigger = null;
  }
}

export function initCustomSelectSystem(): void {
  const popup = document.getElementById('md3-custom-select-popup');
  listContainer =
    popup?.querySelector<HTMLDivElement>('.md3-custom-select-list') || null;

  if (!popup || !listContainer) return;

  _popup = popup;

  function positionPopup(trigger: HTMLElement): void {
    const rect = trigger.getBoundingClientRect();

    const computedRadius =
      parseFloat(window.getComputedStyle(trigger).borderRadius) || 12;
    popup!.style.borderRadius = `${Math.min(computedRadius, 16)}px`;

    const popupWidth = Math.max(rect.width, 192);
    popup!.style.width = `${popupWidth}px`;

    let leftPos = rect.left;
    if (rect.left + popupWidth > window.innerWidth - 16) {
      leftPos = rect.right - popupWidth;
    }
    if (leftPos + popupWidth > window.innerWidth - 16) {
      leftPos = window.innerWidth - popupWidth - 16;
    }
    if (leftPos < 16) leftPos = 16;

    popup!.style.left = `${leftPos}px`;

    const popupHeight = Math.min(260, listContainer!.scrollHeight + 8);
    const checkOverflowBottom = rect.bottom + popupHeight > window.innerHeight;
    const checkOverflowTop = rect.top - popupHeight > 0;

    if (checkOverflowBottom && checkOverflowTop) {
      popup!.style.top = `${rect.top - 6 - popupHeight}px`;
    } else {
      popup!.style.top = `${rect.bottom + 6}px`;
    }
  }

  function openPopup(trigger: HTMLButtonElement): void {
    if (activeSelectTrigger === trigger) {
      closeSelectPopup();
      return;
    }

    closeSelectPopup();
    activeSelectTrigger = trigger;
    trigger.classList.add('popup-open');

    const template = trigger.querySelector<HTMLTemplateElement>(
      '.md3-select-options',
    );
    if (!template) {
      closeSelectPopup();
      return;
    }

    listContainer!.innerHTML = '';

    const options = Array.from(template.content.querySelectorAll('div'));

    options.forEach((optionData) => {
      const val = optionData.getAttribute('data-value') || '';
      const text = optionData.textContent || '';
      const i18nKey = optionData.getAttribute('data-i18n');

      const item = document.createElement('div');
      item.className = 'md3-custom-select-item';
      item.textContent = i18nKey ? (t(i18nKey) || text) : text;
      item.setAttribute('role', 'option');
      item.setAttribute('data-value', val);
      if (i18nKey) item.setAttribute('data-i18n', i18nKey);

      if (trigger.value === val) {
        item.classList.add('selected');
        item.setAttribute('aria-selected', 'true');
      }

      item.addEventListener('click', (e: MouseEvent) => {
        e.stopPropagation();
        trigger.value = val;
        trigger.dispatchEvent(new Event('change', { bubbles: true }));
        closeSelectPopup();
      });

      listContainer!.appendChild(item);
    });

    popup!.classList.add('active');
    positionPopup(trigger);

    const currentSelected = listContainer!.querySelector<HTMLElement>(
      '.md3-custom-select-item.selected',
    );
    if (currentSelected) {
      listContainer!.scrollTop =
        currentSelected.offsetTop - listContainer!.offsetTop;
    }
  }

  const triggers = document.querySelectorAll<HTMLButtonElement>(
    '.md3-select-trigger:not([data-initialized])',
  );

  triggers.forEach((trigger) => {
    trigger.setAttribute('data-initialized', 'true');
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'value'
        ) {
          syncTriggerText(trigger);
        }
      });
    });
    observer.observe(trigger, { attributes: true });

    trigger.addEventListener('click', (e: MouseEvent) => {
      e.stopPropagation();
      openPopup(trigger);
    });

    trigger.addEventListener('change', () => {
      syncTriggerText(trigger);
    });

    syncTriggerText(trigger);
  });

  popup.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', () => closeSelectPopup());

  window.addEventListener('resize', () => {
    if (activeSelectTrigger) positionPopup(activeSelectTrigger);
  });

  document.addEventListener('pointerdown', (e) => {
    if (activeSelectTrigger && popup) {
      if (
        !popup.contains(e.target as Node) &&
        !activeSelectTrigger.contains(e.target as Node)
      ) {
        closeSelectPopup();
      }
    }
  });

  window.addEventListener(
    'scroll',
    (e) => {
      if (activeSelectTrigger && popup) {
        if (popup.contains(e.target as Node)) return;
        closeSelectPopup();
      }
    },
    { capture: true }
  );

  document.addEventListener('i18nReady', () => {
    triggers.forEach(syncTriggerText);
  });
}

export function syncTriggerText(trigger: HTMLButtonElement): void {
  const template = trigger.querySelector<HTMLTemplateElement>(
    '.md3-select-options',
  );
  const valueDisplay = trigger.querySelector<HTMLElement>('.md3-select-value');

  if (!template || !valueDisplay) return;

  const currentVal = trigger.value;
  const options = Array.from(template.content.querySelectorAll('div'));

  let selectedOption = options.find(
    (opt) => opt.getAttribute('data-value') === currentVal,
  );
  if (!selectedOption && options.length > 0) selectedOption = options[0];

  if (selectedOption) {
    valueDisplay.textContent = selectedOption.textContent;
    const i18nKey = selectedOption.getAttribute('data-i18n');
    if (i18nKey) {
      valueDisplay.setAttribute('data-i18n', i18nKey);
      valueDisplay.textContent = t(i18nKey) || selectedOption.textContent;
    } else {
      valueDisplay.removeAttribute('data-i18n');
    }
  }
}
