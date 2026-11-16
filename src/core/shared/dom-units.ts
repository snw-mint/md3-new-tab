import { AppSettings } from './types';
import { applyTranslations } from './i18n';

export function mountTemplate(templateId: string, container: HTMLElement = document.body): HTMLElement | null {
  const tpl = document.getElementById(templateId) as HTMLTemplateElement | null;
  if (!tpl) return null;
  const clone = tpl.content.cloneNode(true) as DocumentFragment;
  applyTranslations(clone);
  const firstChild = clone.firstElementChild as HTMLElement | null;
  container.appendChild(clone);
  tpl.remove();
  return firstChild;
}

export const DOMUnits = {
  syncExpandableGroup(
    elements: { toggle: HTMLInputElement | null; block: HTMLElement | null },
    isEnabled: boolean,
  ): void {
    const { toggle, block } = elements;

    if (toggle && toggle.checked !== isEnabled) {
      toggle.checked = isEnabled;
    }

    if (block) {
      const card = block.closest('.settings-group-card');
      if (isEnabled) {
        block.classList.remove('collapsed');
        if (card) card.classList.remove('collapsed-card');
        block.style.maxHeight = block.scrollHeight + 'px';
        setTimeout(() => {
          if (toggle?.checked) block.style.maxHeight = 'none';
        }, 300);
      } else {
        block.style.maxHeight = block.scrollHeight + 'px';
        void block.offsetHeight;
        block.classList.add('collapsed');
        if (card) card.classList.add('collapsed-card');
        block.style.maxHeight = '0px';
      }
    }
  },

  syncWeatherGroup(
    elements: { toggle: HTMLInputElement | null; block: HTMLElement | null },
    state: AppSettings,
  ): void {
    this.syncExpandableGroup(elements, state.weatherEnabled);
  },
};
