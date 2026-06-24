/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

interface SearchTermHistory {
  term: string;
  points: number;
  lastSearchedAt: number;
  searchMoments: number[];
  frequent: boolean;
}

const STORAGE_KEY = 'ent_search_history';
const COOLDOWN_MS = 10 * 1000;
const DECAY_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function getHistory(): Record<string, SearchTermHistory> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

function saveHistory(history: Record<string, SearchTermHistory>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function recordSearch(query: string): void {
  if (!query || !query.trim()) return;
  const term = query.trim().toLowerCase();
  const history = getHistory();
  const now = Date.now();

  if (!history[term]) {
    history[term] = {
      term,
      points: 1,
      lastSearchedAt: now,
      searchMoments: [now],
      frequent: false,
    };
  } else {
    const entry = history[term];
    entry.points += 1;
    entry.lastSearchedAt = now;

    const lastMoment = entry.searchMoments[entry.searchMoments.length - 1];
    if (now - lastMoment > COOLDOWN_MS) {
      entry.searchMoments.push(now);
    }

    if (entry.searchMoments.length >= 3 && !entry.frequent) {
      entry.frequent = true;
    }
  }

  saveHistory(history);
}

export function decayFrequentSearches(): void {
  const history = getHistory();
  const now = Date.now();
  let changed = false;

  for (const term in history) {
    const entry = history[term];
    if (now - entry.lastSearchedAt > DECAY_DAYS_MS) {
      entry.points = Math.max(0, entry.points - 1);
      if (entry.searchMoments.length > 0) {
        entry.searchMoments.shift();
      }

      if (entry.searchMoments.length < 3) {
        entry.frequent = false;
      }

      if (entry.points === 0) {
        delete history[term];
      } else {
        entry.lastSearchedAt = now;
      }
      changed = true;
    }
  }

  if (changed) {
    saveHistory(history);
  }
}

export function getFrequentSearches(): string[] {
  const history = getHistory();
  const frequentList = Object.values(history)
    .filter((entry) => entry.frequent)
    .sort((a, b) => b.points - a.points)
    .map((entry) => entry.term);

  return frequentList.slice(0, 2);
}
