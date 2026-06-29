/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('setup/setup.html') });
  } else if (details.reason === 'update') {
    const manifest = chrome.runtime.getManifest();
    chrome.storage.local.set({ 
      extension_updated_version: manifest.version,
      new_features_version: manifest.version
    });
  }
});

chrome.runtime.setUninstallURL('https://snw-mint.github.io/md3-new-tab/uninstall.html');
