/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { recordSearch } from '../boot/frequent-searches';
import { t } from '../shared/i18n';

interface AskAiOptions {
  askAiBtn: HTMLButtonElement | null;
  searchInput: HTMLInputElement | null;
  searchForm: HTMLFormElement | null;
}

export function initAskAi(options: AskAiOptions) {
  const { askAiBtn, searchInput, searchForm } = options;
  if (!askAiBtn || !searchInput || !searchForm) {
    return { trigger: () => { } };
  }

  let isAiActive = false;
  let glowTimer: number | null = null;

  const clearGlowTimer = () => {
    if (glowTimer !== null) {
      clearTimeout(glowTimer);
      glowTimer = null;
    }
  };

  const removeGlow = () => {
    clearGlowTimer();
    searchForm.classList.remove('ask-ai-glowing');
  };

  const updateAskAiUiState = (active: boolean) => {
    isAiActive = active;
    askAiBtn.classList.toggle('active', active);
    searchForm.classList.toggle('ask-ai-active', active);

    const inactiveIcon = askAiBtn.querySelector('.ask-ai-icon-inactive') as HTMLElement | null;
    const activeIcon = askAiBtn.querySelector('.ask-ai-icon-active') as HTMLElement | null;
    if (inactiveIcon) inactiveIcon.style.display = active ? 'none' : 'block';
    if (activeIcon) activeIcon.style.display = active ? 'block' : 'none';

    if (active) {
      searchForm.classList.add('ask-ai-glowing');
      clearGlowTimer();
      glowTimer = window.setTimeout(removeGlow, 2600);
      searchInput.placeholder = t('askAiOption', 'Ask to AI');
      searchInput.focus();
    } else {
      removeGlow();
      searchInput.placeholder = t('searchPlaceholder', 'Search the web');
    }
  };

  const toggleAi = () => {
    updateAskAiUiState(!isAiActive);
  };

  askAiBtn.addEventListener('click', toggleAi);

  searchForm.addEventListener(
    'submit',
    (e) => {
      if (isAiActive) {
        e.preventDefault();
        e.stopImmediatePropagation();
        const query = searchInput.value.trim();
        if (!query) return;
        recordSearch(query);
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}&udm=50`;
      }
    },
    { capture: true },
  );

  return {
    trigger: toggleAi,
  };
}
