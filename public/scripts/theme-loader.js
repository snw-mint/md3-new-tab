(function () {
  var root = document.documentElement;

  var theme = localStorage.getItem('theme') || 'device';
  if (theme !== 'device') {
    root.setAttribute('data-theme', theme);
  }

  var paletteId = localStorage.getItem('ent_selected_palette') || 'default';
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
    var rows = parseInt(settings.shortcutsRows || '1', 10) || 1;
    root.style.setProperty('--shortcuts-reserved-rows', String(rows));
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
      document.addEventListener('DOMContentLoaded', function () {
        var el = document.getElementById('currentEngineIcon');
        if (el && !el.hasChildNodes()) {
          el.innerHTML = engineIcon;
        }
      }, { once: true });
    }
  } catch (e) {}
})();
