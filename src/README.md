# Source Structure

## Entry Points

These three files live at the root of `src/` because they are registered directly as build entry points — either referenced in `manifest.json` or `index.html`. Moving them inside `core/` would break the build.

| File | Role |
|---|---|
| `script.ts` | Main page entry point. Orchestrates boot sequence and registers all lazy loaders. |
| `background.ts` | Service worker entry point, registered in `manifest.json`. |
| `style.scss` | Global stylesheet entry point, imported by `index.html`. |

---

## Module Map

```
src/
├── script.ts
├── background.ts
├── style.scss
├── styles/
└── core/
    ├── shared/
    │   ├── types.ts
    │   ├── state.ts
    │   ├── dom-refs.ts
    │   └── dom-units.ts
    ├── boot/
    │   ├── display.ts
    │   ├── weather.ts
    │   ├── search.ts
    │   ├── shortcuts-render.ts
    │   └── event-bindings.ts
    ├── lazy/
    │   ├── drag-drop.ts
    │   ├── launcher.ts
    │   ├── launcher-data.ts
    │   ├── md3-select.ts
    │   ├── search-engine-data.ts
    │   └── search-engine-dropdown.ts
    └── ui/
        ├── palette.ts
        ├── sidebar.ts
        ├── snackbar.ts
        ├── modals.ts
        └── backup.ts
```

---

## core/shared

Stateless utilities and data structures with no side effects. Imported by every other layer.

| Module | Description |
|---|---|
| `types.ts` | All shared TypeScript interfaces (`AppSettings`, `CityData`, `WeatherApiResponse`, `LauncherApp`, `SnackbarOptions`, `WarningModalOptions`, etc.). |
| `state.ts` | Reactive global state powered by a `Proxy`. Persists to `localStorage` on every mutation and notifies all subscribers synchronously. |
| `dom-refs.ts` | Typed DOM getters grouped by section (`header`, `settings`). Always resolves fresh references to avoid stale element issues. |
| `dom-units.ts` | DOM helpers for animated collapsible groups (`syncExpandableGroup`, `syncWeatherGroup`). |

---

## core/boot

Modules loaded synchronously at `DOMContentLoaded`. Each one runs exactly once during startup, conditional only on feature flags from the reactive state.

| Module | Description |
|---|---|
| `display.ts` | Initializes the clock/greetings widget and starts the 1-second interval tick. Subscribes to state changes to switch between display styles. |
| `weather.ts` | Renders the weather widget on boot if enabled. Fetches weather data from the Open-Meteo API and maps weather codes to icon filenames. |
| `search.ts` | Applies the saved search engine to the form on boot (`applyEngineToForm`) and binds the native search fallback (`bindSearchForm`). Dropdown initialization is deferred to `lazy/`. |
| `shortcuts-render.ts` | Contains the `ShortcutsManager` class responsible for rendering, adding, editing, and removing shortcuts. Drag-and-drop is not initialized here — it is injected lazily via the public `initDragDrop()` method. |
| `event-bindings.ts` | Binds all settings panel controls (toggles, selects, inputs) to the reactive state. Also handles the weather city search flow and the permission modal for the weather feature. Geocoding fetch is handled inline here. |

---

## core/lazy

Modules loaded on demand, triggered by user interaction. Vite splits each of these into a separate chunk at build time.

| Module | Loaded when |
|---|---|
| `drag-drop.ts` | First `pointerover` on `#shortcutsGrid` or `#launcherGrid`. |
| `launcher.ts` | First `pointerenter` or `click` on the launcher button. Renders launcher apps and sets up the drag handler for the launcher grid. |
| `launcher-data.ts` | Loaded together with `launcher.ts`. Contains the static app lists for Google, Microsoft, and Proton providers. |
| `md3-select.ts` | First `pointerenter` or `click` on any `.md3-select-trigger`. Initializes the custom dropdown popup system. |
| `search-engine-data.ts` | Loaded together with `search-engine-dropdown.ts`. Contains SVG icons and URLs for all supported search engines. |
| `search-engine-dropdown.ts` | First `pointerenter` or `click` on `#engineBtn`. Binds click handlers to dropdown items. |

---

## core/ui

UI components that are always present and initialized at boot, but do not belong to any specific feature domain.

| Module | Description |
|---|---|
| `palette.ts` | Manages the Material You color palette. Reads the saved palette from `localStorage`, generates light and dark CSS custom properties via `@material/material-color-utilities`, and handles the custom hue picker modal. Self-initializes on `DOMContentLoaded`. |
| `sidebar.ts` | Toggles the `sidebar-open` class on `document.body` for the settings panel. Also manages the theme segmented button (light / dark / device). |
| `snackbar.ts` | Imperative snackbar controller. Exposes `showSnackbar()` and `hideSnackbar()`. Manages an internal timeout to auto-dismiss. |
| `modals.ts` | Imperative warning dialog controller. Exposes `showWarningModal()` and wires confirm/cancel button handlers dynamically on each call. |
| `backup.ts` | Export and import of all user settings as a JSON file. Validates the payload structure before restoring. Uses `showWarningModal` for confirmation and `showSnackbar` for feedback. |

---

## Post-build Output

After running `npm run build`, Vite emits the following chunks inside `dist/assets/`:

| Chunk | Content |
|---|---|
| `index.html.js` | Main bundle — all `boot/`, `shared/`, and `ui/` modules bundled together with `script.ts`. |
| `shortcuts-render.js` | Loaded when shortcuts are enabled and the grid is present. |
| `drag-drop.js` | Loaded on first pointer interaction with a sortable grid. |
| `launcher.js` | Loaded on first interaction with the launcher button. |
| `launcher-data.js` | Loaded together with `launcher.js`. |
| `md3-select.js` | Loaded on first interaction with any custom select trigger. |
| `search-engine-dropdown.js` | Loaded on first interaction with the engine button. |
| `background.ts.js` | Compiled service worker. |

The HTML, CSS, JSON, and JS output is minified as a post-build step defined in `vite.config.ts`.
