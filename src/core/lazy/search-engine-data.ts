/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

interface EngineConfig {
  url: string;
  icon: string;
}

export const engines: Record<string, EngineConfig> = {
  system: {
    url: '',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><use href="#icon-search" /></svg>',
  },
  bing: {
    url: 'https://www.bing.com/search',
    icon: '<svg fill="currentColor" fill-rule="evenodd" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><use href="#icon-engine-bing" /></svg>',
  },
  google: {
    url: 'https://www.google.com/search',
    icon: '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><use href="#icon-engine-google" /></svg>',
  },
  brave: {
    url: 'https://search.brave.com/search',
    icon: '<svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><use href="#icon-engine-brave" /></svg>',
  },
  duck: {
    url: 'https://duckduckgo.com/',
    icon: '<svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><use href="#icon-engine-duck" /></svg>',
  },
  ecosia: {
    url: 'https://www.ecosia.org/search',
    icon: '<svg viewBox="0 0 224.23 221" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><use href="#icon-engine-ecosia" /></svg>',
  },
  startpage: {
    url: 'https://www.startpage.com/sp/search',
    icon: '<svg viewBox="0 0 501 501" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><use href="#icon-engine-startpage" /></svg>',
  },
  kagi: {
    url: 'https://kagi.com/search',
    icon: '<svg fill="currentColor" height="500" width="500" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><use href="#icon-engine-kagi" /></svg>',
  },
};
