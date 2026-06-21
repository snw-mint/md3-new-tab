/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

(function () {
  var root = document.documentElement;

  var theme = localStorage.getItem('theme') || 'device';
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else if (theme === 'auto' || theme === 'device') {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.setAttribute('data-theme', 'dark');
    }
  } else {
    root.setAttribute('data-theme', theme);
  }

  var paletteId = localStorage.getItem('ent_selected_palette') || 'expressive';
  root.setAttribute('data-palette', paletteId);

  try {
    var cachedVars = localStorage.getItem('ent_cached_palette_vars');
    if (cachedVars) {
      var vars = JSON.parse(cachedVars);
      for (var key in vars) {
        if (Object.prototype.hasOwnProperty.call(vars, key)) {
          root.style.setProperty(key, vars[key]);
        }
      }
    }
  } catch (e) {}

  try {
    var settings = JSON.parse(localStorage.getItem('ent_global_settings') || '{}');
    var maxRows = parseInt(settings.shortcutsRows || '1', 10) || 1;
    
    var shortcutsStr = localStorage.getItem('ent_shortcuts');
    var shortcutsCount = 7; // default
    if (shortcutsStr) {
      try {
        shortcutsCount = JSON.parse(shortcutsStr).length;
      } catch(e) {}
    }
    
    var totalRenderedItems = shortcutsCount < maxRows * 10 ? shortcutsCount + 1 : maxRows * 10;
    var actualRows = Math.ceil(totalRenderedItems / 10) || 1;
    
    root.style.setProperty('--shortcuts-reserved-rows', String(actualRows));

    if (settings.shortcutsEnabled === false) {
      root.style.setProperty('--shortcuts-grid-display', 'none');
    }

    var displayStyle = settings.displayStyle || 'greetings';
    root.setAttribute('data-display-style', displayStyle);
    if (settings.displayEnabled === false) {
      root.setAttribute('data-display-enabled', 'false');
    }
  } catch (e) {}

  try {
    var engineIcon = localStorage.getItem('ent_engine_icon_cache');
    if (engineIcon) {
      document.addEventListener(
        'DOMContentLoaded',
        function () {
          var el = document.getElementById('currentEngineIcon');
          if (el && !el.hasChildNodes()) {
            el.innerHTML = engineIcon;
          }
        },
        { once: true },
      );
    }
  } catch (e) {}
})();
