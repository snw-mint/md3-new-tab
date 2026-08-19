import { WallpaperProvider, WallpaperCacheEntry } from '../../shared/types';
import { getWallpaperCache, setWallpaperCache } from '../../shared/state';
import { fetchRandomBing, fetchRandomWikimedia } from './wallpaper-refresh';

export const WALLPAPER_HOST_PERMISSIONS: Record<string, string[]> = {
  bing: ['https://peapix.com/*', 'https://img.peapix.com/*'],
  media_commons: ['https://commons.wikimedia.org/*', 'https://upload.wikimedia.org/*'],
  unsplash: ['https://unsplash.snw-mint.workers.dev/*'],
  pexels: ['https://pexels.snw-mint.workers.dev/*'],
};

async function checkHostPermission(origins: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    const chromeApi = (window as any).chrome;
    if (!chromeApi?.permissions?.contains) return resolve(false);
    chromeApi.permissions.contains({ origins }, (result: boolean) => {
      resolve(Boolean(result));
    });
  });
}

export async function fetchDailyWallpaper(
  source: WallpaperProvider,
  random = false,
): Promise<string | null> {
  const origins = WALLPAPER_HOST_PERMISSIONS[source];
  if (origins) {
    const hasPerm = await checkHostPermission(origins);
    if (!hasPerm) return null;
  }

  const today = new Date().toISOString().slice(0, 10);
  const cacheKey = `wallpaper_cache_${source}`;

  if (!random) {
    try {
      const cached = getWallpaperCache(cacheKey) as WallpaperCacheEntry | null;
      if (
        cached &&
        cached.url &&
        cached.date === today &&
        'creditUrl' in cached
      ) {
        return cached.url;
      }
    } catch (e) {
      console.error('Error reading cache', e);
    }
  }

  let imageUrl = '';
  let creditText = '';
  let creditUrl = '';
  let creditHtml = '';

  try {
    if (source === 'bing') {
      if (random) {
        imageUrl = (await fetchRandomBing()) || '';
        creditText = 'Bing Daily Image';
        creditUrl = 'https://www.bing.com';
      } else {
        const res = await fetch('https://peapix.com/bing/feed?country=us');
        if (!res.ok) throw new Error(`Bing Error: ${res.status}`);
        const data = (await res.json()) as any[];

        if (data && data.length > 0) {
          const img = data[0];
          imageUrl = img.fullUrl || img.imageUrl || img.url || '';
          let rawCredit = `Bing: ${img.copyright || 'Daily Image'}`;
          if (rawCredit.length > 30) {
            rawCredit = rawCredit.substring(0, 30).trim() + '...';
          }
          creditText = rawCredit;
          creditUrl = img.copyrightLink || img.copyrightlink || img.url || '';
        }
      }
    } else if (source === 'media_commons') {
      if (random) {
        const result = await fetchRandomWikimedia();
        if (result) {
          imageUrl = result.url;
          creditText = result.credit;
          creditUrl = result.creditUrl;
        }
      } else {
        const fetchWiki = async (date: string): Promise<any> => {
          const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=images&titles=Template:Potd/${date}&prop=imageinfo&iiprop=url|thumburl|extmetadata|descriptionurl&iiurlwidth=3840&format=json&origin=*`;
          const response = await fetch(url);
          return await response.json();
        };

        let data = await fetchWiki(today);
        let pages = data.query?.pages;

        if (!pages) {
          const yesterday = new Date(Date.now() - 86400000)
            .toISOString()
            .slice(0, 10);
          data = await fetchWiki(yesterday);
          pages = data.query?.pages;
        }

        if (pages) {
          for (const page of Object.values<any>(pages)) {
            if (page?.imageinfo?.[0]) {
              imageUrl = page.imageinfo[0].thumburl || page.imageinfo[0].url;
              creditUrl = page.imageinfo[0].descriptionurl || '';

              const meta = page.imageinfo[0].extmetadata;
              creditText = meta?.Artist?.value || 'Wikimedia Commons';
              creditText = creditText.replace(/<[^>]*>?/gm, '');

              const maxCreditLength = 30;
              if (creditText.length > maxCreditLength) {
                creditText =
                  creditText.substring(0, maxCreditLength).trim() + '...';
              }
              break;
            }
          }
        }
      }
    } else if (source === 'unsplash') {
      const url =
        'https://unsplash.snw-mint.workers.dev/photos/random?topics=textures-patterns&orientation=landscape';
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Unsplash Worker Error: ${res.status}`);
      }
      const data = await res.json();
      if (data && data.urls && data.urls.raw) {
        let screenWidth = window.screen.width * (window.devicePixelRatio || 1);
        screenWidth = Math.max(screenWidth, 1920);
        screenWidth = Math.min(screenWidth, 3840);
        screenWidth = Math.ceil(screenWidth / 240) * 240;

        const joiner = data.urls.raw.includes('?') ? '&' : '?';
        imageUrl = `${data.urls.raw}${joiner}w=${screenWidth}&q=80&fm=webp`;

        let photographerName = data.user?.name || 'Photographer';
        if (photographerName.length > 20) {
          photographerName = photographerName.substring(0, 20).trim() + '...';
        }
        const photographerUrl = data.user?.links?.html
          ? `${data.user.links.html}?utm_source=md3_new_tab&utm_medium=referral`
          : 'https://unsplash.com/?utm_source=md3_new_tab&utm_medium=referral';
        const unsplashUrl = `https://unsplash.com/?utm_source=md3_new_tab&utm_medium=referral`;

        creditHtml = `Photo by <a href="${photographerUrl}" target="_blank" class="wallpaper-credit-link" style="color: inherit; text-decoration: none; pointer-events: auto;">${photographerName}</a> on <a href="${unsplashUrl}" target="_blank" class="wallpaper-credit-link" style="color: inherit; text-decoration: none; pointer-events: auto;">Unsplash</a>`;
        creditText = `Photo by ${photographerName} on Unsplash`;
        creditUrl = photographerUrl;
      }
    } else if (source === 'pexels') {
      const randomPage = Math.floor(Math.random() * 100) + 1;
      const url = `https://pexels.snw-mint.workers.dev/curated?per_page=1&page=${randomPage}&orientation=landscape`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Pexels Worker Error: ${res.status}`);
      }
      const data = await res.json();
      if (data && data.photos && data.photos.length > 0) {
        const photo = data.photos[0];
        let pexelsUrl = photo?.src?.original || photo?.src?.landscape || '';

        if (pexelsUrl && photo?.src?.original) {
          let screenWidth =
            window.screen.width * (window.devicePixelRatio || 1);
          screenWidth = Math.max(screenWidth, 1920);
          screenWidth = Math.min(screenWidth, 3840);
          screenWidth = Math.ceil(screenWidth / 240) * 240;

          const joiner = pexelsUrl.includes('?') ? '&' : '?';
          imageUrl = `${pexelsUrl}${joiner}auto=compress&cs=tinysrgb&w=${screenWidth}&q=80`;
        } else {
          imageUrl = pexelsUrl;
        }

        let photographer = photo?.photographer || 'Photographer';
        if (photographer.length > 20) {
          photographer = photographer.substring(0, 20).trim() + '...';
        }
        creditText = `Pexels: ${photographer}`;
        creditUrl = photo?.url || 'https://pexels.com/';
      }
    }

    if (imageUrl) {
      setWallpaperCache(cacheKey, {
        url: imageUrl,
        date: today,
        credit: creditText,
        creditUrl: creditUrl,
        ...(creditHtml ? { creditHtml } : {}),
      });
      return imageUrl;
    }

    throw new Error('No image URL found in the API response.');
  } catch (error) {
    console.error(`Error while searching ${source}:`, error);
    return null;
  }
}
