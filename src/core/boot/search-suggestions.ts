/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { globalState } from '../shared/state';
import { getFrequentSearches } from './frequent-searches';

const SEARCH_ICON = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M380-320q-109 0-184.5-75.5T120-580t75.5-184.5T380-840t184.5 75.5T640-580q0 44-14 83t-38 69l224 224q11 11 11 28t-11 28-28 11-28-11L532-372q-30 24-69 38t-83 14m0-80q75 0 127.5-52.5T560-580t-52.5-127.5T380-760t-127.5 52.5T200-580t52.5 127.5T380-400"/></svg>`;
const FREQUENT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M480-120q-126 0-223-76.5T131-392q-4-15 6-27.5t27-14.5q16-2 29 6t18 24q24 90 99 147t170 57q117 0 198.5-81.5T760-480t-81.5-198.5T480-760q-69 0-129 32t-101 88h70q17 0 28.5 11.5T360-600t-11.5 28.5T320-560H160q-17 0-28.5-11.5T120-600v-160q0-17 11.5-28.5T160-800t28.5 11.5T200-760v54q51-64 124.5-99T480-840q75 0 140.5 28.5t114 77 77 114T840-480t-28.5 140.5-77 114-114 77T480-120m40-376 100 100q11 11 11 28t-11 28-28 11-28-11L452-452q-6-6-9-13.5t-3-15.5v-159q0-17 11.5-28.5T480-680t28.5 11.5T520-640z"/></svg>`;

let debounceTimer: number | undefined;

interface SuggestionItem {
  phrase: string;
  isFrequent: boolean;
}

async function fetchSuggestions(query: string): Promise<string[]> {
  try {
    const response = await fetch(`https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=list`);
    if (!response.ok) return [];
    const data = await response.json();
    if (Array.isArray(data) && data.length > 1 && Array.isArray(data[1])) {
      return data[1] as string[];
    }

    if (Array.isArray(data)) {
      return data.map((item: any) => item.phrase || item).filter(Boolean);
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch suggestions', error);
    return [];
  }
}

function renderSuggestions(container: HTMLElement, items: SuggestionItem[], searchInput: HTMLInputElement) {
  container.innerHTML = '';
  if (items.length === 0) {
    container.classList.remove('active');
    return;
  }

  const list = document.createElement('div');
  list.className = 'suggestions-list';

  items.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'suggestion-item';
    div.innerHTML = `
      <div class="suggestion-icon ${item.isFrequent ? 'frequent' : ''}">
        ${item.isFrequent ? FREQUENT_ICON : SEARCH_ICON}
      </div>
      <span class="suggestion-text">${item.phrase}</span>
    `;

    div.addEventListener('click', () => {
      searchInput.value = item.phrase;
      container.classList.remove('active');
      const form = searchInput.closest('form');
      if (form) {
        if (typeof form.requestSubmit === 'function') {
          form.requestSubmit();
        } else {
          const event = new Event('submit', { cancelable: true });
          if (form.dispatchEvent(event)) {
            form.submit();
          }
        }
      }
    });

    list.appendChild(div);
  });

  container.appendChild(list);
  container.classList.add('active');
}

export function bindSearchSuggestions(): void {
  const searchInput = document.getElementById('searchInput') as HTMLInputElement;
  const suggestionsContainer = document.getElementById('suggestionsContainer');

  if (!searchInput || !suggestionsContainer) return;

  const handleInput = async () => {
    if (!globalState.current.searchSuggestionsEnabled) {
      suggestionsContainer.classList.remove('active');
      return;
    }

    const query = searchInput.value.trim().toLowerCase();

    const frequentList = getFrequentSearches();
    let matchingFrequent = frequentList;

    if (query.length > 0) {
      matchingFrequent = frequentList.filter((f) => f.toLowerCase().includes(query));
    }

    if (query.length < 3) {
      if (matchingFrequent.length > 0) {
        renderSuggestions(
          suggestionsContainer,
          matchingFrequent.map((phrase) => ({ phrase, isFrequent: true })),
          searchInput,
        );
      } else {
        suggestionsContainer.classList.remove('active');
      }
      return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(async () => {
      const apiSuggestions = await fetchSuggestions(query);

      const combined: SuggestionItem[] = [];
      const seen = new Set<string>();

      // Add frequent first (up to 2)
      for (const phrase of matchingFrequent) {
        if (!seen.has(phrase)) {
          seen.add(phrase);
          combined.push({ phrase, isFrequent: true });
        }
      }

      for (const phrase of apiSuggestions) {
        if (combined.length >= 6) break;
        if (!seen.has(phrase)) {
          seen.add(phrase);
          combined.push({ phrase, isFrequent: false });
        }
      }

      renderSuggestions(suggestionsContainer, combined, searchInput);
    }, 300);
  };

  searchInput.addEventListener('input', handleInput);

  searchInput.addEventListener('focus', () => {
    if (globalState.current.searchSuggestionsEnabled) {
      handleInput();
    }
  });

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target as Node) && !suggestionsContainer.contains(e.target as Node)) {
      suggestionsContainer.classList.remove('active');
    }
  });
}
