import { WallpaperProvider } from '../../shared/types';
import { globalState, getWallpaperCache, setWallpaperCache } from '../../shared/state';
import { fetchRandomBing, fetchRandomWikimedia } from './wallpaper-refresh';

export const WALLPAPER_HOST_PERMISSIONS: Record<string, string[]> = {
  bing: ['https://peapix.com/*', 'https://img.peapix.com/*'],
  media_commons: ['https://commons.wikimedia.org/*', 'https://upload.wikimedia.org/*'],
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
): Promise<{ url: string; credit?: string; creditUrl?: string; creditHtml?: string } | null> {
  const origins = WALLPAPER_HOST_PERMISSIONS[source];
  if (origins) {
    const hasPerm = await checkHostPermission(origins);
    if (!hasPerm) return null;
  }

  const today = new Date().toISOString().slice(0, 10);

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
      }
      if (!imageUrl) {
        const country = globalState.current.bingCountry || 'us';
        const res = await fetch(`https://peapix.com/bing/feed?country=${country}&n=1`, { cache: 'no-store' });
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
    } else if (source === 'pexels') {
      const randomPage = Math.floor(Math.random() * 100) + 1;
      const url = `https://pexels.snw-mint.workers.dev/curated?per_page=1&page=${randomPage}&orientation=landscape&_cb=${Date.now()}`;
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
      return {
        url: imageUrl,
        credit: creditText,
        creditUrl: creditUrl,
        ...(creditHtml ? { creditHtml } : {}),
      };
    }

    throw new Error('No image URL found in the API response.');
  } catch (error) {
    console.error(`Error while searching ${source}:`, error);
    return null;
  }
}
