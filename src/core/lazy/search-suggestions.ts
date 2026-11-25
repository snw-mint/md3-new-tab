/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { globalState } from '../shared/state';
import { SEARCH_ICON, FREQUENT_ICON } from '../shared/icons';
import { getFrequentSearches } from './frequent-searches';

let debounceTimer: number | undefined;

const MAX_CACHE_SIZE = 100;
const suggestionsCache = new Map<string, string[]>();

function setInCache(key: string, value: string[]): void {
  if (suggestionsCache.has(key)) {
    suggestionsCache.delete(key);
  } else if (suggestionsCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = suggestionsCache.keys().next().value;
    if (oldestKey !== undefined) {
      suggestionsCache.delete(oldestKey);
    }
  }
  suggestionsCache.set(key, value);
}

function getFromCache(key: string): string[] | undefined {
  if (!suggestionsCache.has(key)) return undefined;
  const value = suggestionsCache.get(key)!;
  suggestionsCache.delete(key);
  suggestionsCache.set(key, value);
  return value;
}

function clearSuggestionsCache(): void {
  suggestionsCache.clear();
}

function capitalizeFirstLetter(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

interface SuggestionItem {
  phrase: string;
  isFrequent: boolean;
}

async function fetchSuggestions(query: string): Promise<string[]> {
  const cached = getFromCache(query);
  if (cached !== undefined) {
    return cached;
  }

  try {
    const response = await fetch(`https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=list`);
    if (!response.ok) return [];
    const data = await response.json();
    let suggestions: string[] = [];

    if (Array.isArray(data) && data.length > 1 && Array.isArray(data[1])) {
      suggestions = data[1] as string[];
    } else if (Array.isArray(data)) {
      suggestions = data.map((item: any) => item.phrase || item).filter(Boolean);
    }

    setInCache(query, suggestions);
    return suggestions;
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

    const iconDiv = document.createElement('div');
    iconDiv.className = `suggestion-icon ${item.isFrequent ? 'frequent' : ''}`;
    iconDiv.innerHTML = item.isFrequent ? FREQUENT_ICON : SEARCH_ICON;

    const textSpan = document.createElement('span');
    textSpan.className = 'suggestion-text';
    const displayPhrase = capitalizeFirstLetter(item.phrase);
    textSpan.textContent = displayPhrase;

    div.appendChild(iconDiv);
    div.appendChild(textSpan);

    div.addEventListener('click', () => {
      searchInput.value = displayPhrase;
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
  const autocompleteGhost = document.getElementById('searchAutocompleteGhost');

  if (!searchInput || !suggestionsContainer) return;

  let currentCompletion = '';

  const clearGhost = () => {
    currentCompletion = '';
    if (autocompleteGhost) {
      autocompleteGhost.textContent = '';
    }
  };

  const updateGhost = (rawValue: string, items: SuggestionItem[]) => {
    if (!autocompleteGhost || !rawValue || document.activeElement !== searchInput) {
      clearGhost();
      return;
    }

    const lowerRaw = rawValue.toLowerCase();
    const match = items.find((item) => {
      const lowerPhrase = item.phrase.toLowerCase();
      return lowerPhrase.startsWith(lowerRaw) && item.phrase.length > rawValue.length;
    });

    if (!match) {
      clearGhost();
      return;
    }

    const suffix = match.phrase.slice(rawValue.length);
    currentCompletion = rawValue + suffix;

    autocompleteGhost.textContent = '';
    const typedSpan = document.createElement('span');
    typedSpan.className = 'ghost-typed';
    typedSpan.textContent = rawValue;

    const completionSpan = document.createElement('span');
    completionSpan.className = 'ghost-completion';
    completionSpan.textContent = suffix;

    autocompleteGhost.appendChild(typedSpan);
    autocompleteGhost.appendChild(completionSpan);
  };

  const handleInput = async () => {
    if (!globalState.current.searchSuggestionsEnabled) {
      suggestionsContainer.classList.remove('active');
      clearGhost();
      return;
    }

    const rawValue = searchInput.value;
    const query = rawValue.trim().toLowerCase();

    const frequentList = getFrequentSearches();
    let matchingFrequent = frequentList;

    if (query.length > 0) {
      matchingFrequent = frequentList.filter((f) => f.toLowerCase().includes(query));
    }

    const frequentItems = matchingFrequent.map((phrase) => ({
      phrase: capitalizeFirstLetter(phrase),
      isFrequent: true,
    }));

    updateGhost(rawValue, frequentItems);

    if (query.length < 3) {
      if (frequentItems.length > 0) {
        renderSuggestions(suggestionsContainer, frequentItems, searchInput);
      } else {
        suggestionsContainer.classList.remove('active');
      }
      return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(async () => {
      const apiSuggestions = await fetchSuggestions(query);
      if (searchInput.value !== rawValue) return;

      const combined: SuggestionItem[] = [];
      const seen = new Set<string>();

      for (const item of frequentItems) {
        const key = item.phrase.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          combined.push(item);
        }
      }

      for (const phrase of apiSuggestions) {
        if (combined.length >= 6) break;
        const formatted = capitalizeFirstLetter(phrase);
        const key = formatted.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          combined.push({ phrase: formatted, isFrequent: false });
        }
      }

      updateGhost(rawValue, combined);
      renderSuggestions(suggestionsContainer, combined, searchInput);
    }, 300);
  };

  if (globalState.current.searchSuggestionsEnabled) {
    handleInput();
  }

  searchInput.addEventListener('input', handleInput);

  searchInput.addEventListener('keydown', (e) => {
    if (!currentCompletion) {
      if (e.key === 'Escape') {
        suggestionsContainer.classList.remove('active');
      }
      return;
    }

    const atEnd =
      searchInput.selectionStart === searchInput.value.length &&
      searchInput.selectionEnd === searchInput.value.length;

    if (e.key === 'Tab' || (e.key === 'ArrowRight' && atEnd)) {
      e.preventDefault();
      searchInput.value = capitalizeFirstLetter(currentCompletion);
      clearGhost();
      handleInput();
    } else if (e.key === 'Escape') {
      clearGhost();
      suggestionsContainer.classList.remove('active');
    }
  });

  searchInput.addEventListener('focus', () => {
    if (globalState.current.searchSuggestionsEnabled) {
      handleInput();
    }
  });

  searchInput.addEventListener('blur', () => {
    clearGhost();
  });

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target as Node) && !suggestionsContainer.contains(e.target as Node)) {
      suggestionsContainer.classList.remove('active');
      clearGhost();
    }
  });
}
