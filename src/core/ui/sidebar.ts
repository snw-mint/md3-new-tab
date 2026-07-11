/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { SidebarRouter } from './sidebar-router';

let router: SidebarRouter | null = null;

export function initSidebarControls(): void {
  const settingsBtn = document.getElementById('settingsBtn') as HTMLButtonElement | null;
  const closeSettingsBtn = document.getElementById('closeSettingsBtn') as HTMLButtonElement | null;
  const body = document.body;

  const toggleSidebar = () => {
    const isOpening = !body.classList.contains('sidebar-open');
    body.classList.toggle('sidebar-open');

    if (isOpening) {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.runtime) {
        chrome.storage.local.get(['new_features_version'], (result) => {
          const manifest = chrome.runtime.getManifest();
          if (result.new_features_version === manifest.version) {
            body.classList.add('show-new-features');
          }
        });
      }
    } else {
      router?.reset();

      if (body.classList.contains('show-new-features')) {
        setTimeout(() => {
          body.classList.remove('show-new-features');
          if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.remove(['new_features_version']);
          }
        }, 300);
      }
    }
  };

  if (settingsBtn) {
    settingsBtn.addEventListener('click', toggleSidebar);
  }
  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', toggleSidebar);
  }
}

export function initThemeControls(): void {
  const buttons = document.querySelectorAll('.segmented-btn');
  const html = document.documentElement;
  if (buttons.length === 0) return;
  const applyTheme = (theme: string) => {
    if (theme === 'device') {
      html.removeAttribute('data-theme');
    } else {
      html.setAttribute('data-theme', theme);
    }
  };
  const savedTheme = localStorage.getItem('theme') || 'device';
  applyTheme(savedTheme);
  buttons.forEach((btn) => {
    if (btn.getAttribute('data-theme-value') === savedTheme) {
      btn.classList.add('active');
    }
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLButtonElement;
      const theme = target.getAttribute('data-theme-value');
      if (!theme) return;
      buttons.forEach((b) => b.classList.remove('active'));
      target.classList.add('active');
      localStorage.setItem('theme', theme);
      applyTheme(theme);
      setTimeout(() => {
        import('./palette').then((module) => {
          module.updateFavicon();
        });
      }, 0);
    });
  });
}

export function initSidebarRouter(): void {
  const viewport = document.getElementById('sidebarNavViewport');
  const rootPage = document.getElementById('sidebarRootPage');

  if (!viewport || !rootPage) {
    console.warn('[SidebarRouter] Required DOM elements not found. Router not initialized.');
    return;
  }

  router = new SidebarRouter({ viewport, rootPage });
  router.register({
    id: 'appearance-advanced',
    keepAlive: true,
    load: () =>
      import('../lazy/pages/appearance-advanced').then((m) => ({
        template: m.template,
        init: m.init,
      })),
  });
  document.getElementById('advancedOptionsBtn')?.addEventListener('click', () => {
    router!.push('appearance-advanced');
  });
}
