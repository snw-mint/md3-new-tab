/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

export function initSidebarControls(): void {
  const settingsBtn = document.getElementById(
    'settingsBtn',
  ) as HTMLButtonElement | null;
  const closeSettingsBtn = document.getElementById(
    'closeSettingsBtn',
  ) as HTMLButtonElement | null;
  const body = document.body;
  const toggleSidebar = () => {
    body.classList.toggle('sidebar-open');
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
    });
  });
}
