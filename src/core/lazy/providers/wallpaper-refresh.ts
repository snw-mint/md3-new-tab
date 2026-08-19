/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { WallpaperProvider } from '../../shared/types';
import { getWallpaperCache, setWallpaperCache } from '../../shared/state';
import { WallpaperCacheEntry } from '../../shared/types';

const INTERVAL_MS: Record<string, number> = {
  daily: 0,
  hourly: 60 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '5m': 5 * 60 * 1000,
};

const REFRESH_TS_KEY = 'wallpaper_refresh_ts';

export function getIntervalMs(interval: string): number {
  return INTERVAL_MS[interval] ?? 0;
}

export function getLastRefreshTs(): number {
  try {
    return parseInt(localStorage.getItem(REFRESH_TS_KEY) || '0', 10) || 0;
  } catch {
    return 0;
  }
}

export function setLastRefreshTs(ts: number): void {
  try {
    localStorage.setItem(REFRESH_TS_KEY, String(ts));
  } catch {}
}

export function isIntervalExpired(interval: string): boolean {
  if (interval === 'daily' || !interval) return false;
  const ms = getIntervalMs(interval);
  if (!ms) return false;
  return Date.now() - getLastRefreshTs() >= ms;
}

export function invalidateCache(provider: WallpaperProvider): void {
  const cacheKey = `wallpaper_cache_${provider}`;
  const cached = getWallpaperCache(cacheKey) as WallpaperCacheEntry | null;
  if (cached) {
    setWallpaperCache(cacheKey, { ...cached, date: '' });
  }
}

export async function fetchRandomBing(): Promise<string | null> {
  try {
    const randomId = Math.floor(Math.random() * 55000) + 10000;
    const res = await fetch(`https://peapix.com/${randomId}`);
    if (!res.ok) throw new Error(`Bing random error: ${res.status}`);
    const text = await res.text();
    const match = text.match(/https?:\/\/img\.peapix\.com\/[^"'\s]+/);
    return match ? match[0] : null;
  } catch {
    return null;
  }
}

export async function fetchRandomWikimedia(): Promise<{ url: string; credit: string; creditUrl: string } | null> {
  try {
    const res = await fetch(
      'https://commons.wikimedia.org/w/api.php?action=query&generator=random&grnnamespace=6&prop=imageinfo&iiprop=url|thumburl|extmetadata|descriptionurl&iiurlwidth=3840&format=json&origin=*',
    );
    if (!res.ok) throw new Error(`Wikimedia random error: ${res.status}`);
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return null;

    for (const page of Object.values<any>(pages)) {
      const info = page?.imageinfo?.[0];
      if (!info) continue;

      const url = info.thumburl || info.url;
      if (!url) continue;

      const meta = info.extmetadata;
      let credit = meta?.Artist?.value || 'Wikimedia Commons';
      credit = credit.replace(/<[^>]*>?/gm, '');
      if (credit.length > 120) credit = credit.substring(0, 120).trim() + '...';

      return { url, credit, creditUrl: info.descriptionurl || '' };
    }
    return null;
  } catch {
    return null;
  }
}
