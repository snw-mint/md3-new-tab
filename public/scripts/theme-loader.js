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
    var shortcutsCount = 7;
    if (shortcutsStr) {
      try {
        shortcutsCount = JSON.parse(shortcutsStr).length;
      } catch (e) {}
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

    if (settings.searchEnabled === false) {
      root.setAttribute('data-search-enabled', 'false');
    }

    if (settings.hideGoogleShortcuts === true) {
      root.setAttribute('data-hide-google-shortcuts', 'true');
    }

    if (settings.wallpaperEnabled === true) {
      var rawOverlay = Number(settings.wallpaperOverlay);
      if (isNaN(rawOverlay)) rawOverlay = 0.3;
      if (rawOverlay > 1) rawOverlay = rawOverlay / 100;
      root.style.setProperty('--wallpaper-overlay', String(rawOverlay));
      if (settings.wallpaperOverlayInverted) {
        root.classList.add('invert-overlay');
      }

      var applyEarlyWallpaper = function (url) {
        if (!url) return Promise.resolve(null);
        var img = new Image();
        img.src = url;
        var finalize = function () {
          var applyDom = function () {
            var layer = document.getElementById('wallpaperLayer');
            if (layer) {
              layer.style.backgroundImage = "url('" + url + "')";
            }
            if (document.body) {
              document.body.classList.add('has-wallpaper');
            }
          };
          if (document.body && document.getElementById('wallpaperLayer')) {
            applyDom();
          } else {
            document.addEventListener('DOMContentLoaded', applyDom, { once: true });
          }
          return { url: url };
        };
        return (img.decode ? img.decode() : Promise.resolve()).then(finalize, finalize);
      };

      var provider = settings.wallpaperProvider || 'upload';
      if (provider === 'upload' && settings.wallpaperImage) {
        window.__earlyWallpaperPromise = new Promise(function (resolve) {
          try {
            var req = indexedDB.open('MD3NewTabDB', 1);
            req.onerror = function () {
              resolve(null);
            };
            req.onsuccess = function (e) {
              var db = e.target.result;
              if (!db.objectStoreNames.contains('wallpapers')) {
                resolve(null);
                return;
              }
              var tx = db.transaction(['wallpapers'], 'readonly');
              var store = tx.objectStore('wallpapers');
              var getReq = store.get('custom_wallpaper');
              getReq.onerror = function () {
                resolve(null);
              };
              getReq.onsuccess = function () {
                var blob = getReq.result;
                if (blob) {
                  applyEarlyWallpaper(URL.createObjectURL(blob)).then(resolve);
                } else {
                  resolve(null);
                }
              };
            };
          } catch (err) {
            resolve(null);
          }
        });
      } else if (provider !== 'upload') {
        try {
          var queue = JSON.parse(localStorage.getItem('wallpaper_cache_' + provider) || 'null');
          var today = new Date().toISOString().slice(0, 10);
          if (
            queue &&
            queue.date === today &&
            Array.isArray(queue.items) &&
            queue.currentIndex >= 0 &&
            queue.items[queue.currentIndex] &&
            queue.items[queue.currentIndex].url
          ) {
            window.__earlyWallpaperPromise = applyEarlyWallpaper(queue.items[queue.currentIndex].url);
          }
        } catch (err) {}
      }
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
