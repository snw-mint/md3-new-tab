/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

function initSidebarControls(): void {
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
