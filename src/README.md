# Source Structure

## Entry Points

| File | Role |
|---|---|
| `script.ts` | Main page entry point. Runs two-stage startup (`bootCritical()` and `bootInteractive()`) and registers lazy loaders. |
| `background.ts` | Service worker entry point, registered in `manifest.json`. |
| `style.scss` | Global stylesheet entry point, imported by `index.html`. |
| `public/scripts/theme-loader.js` | Pre-paint `<head>` script restoring cached theme colors, wallpaper preview, and search engine icon. |

---

## Module Map

```
src/
├── script.ts
├── background.ts
├── style.scss
├── styles/
├── icons/
│   └── symbols.html
├── html/
│   ├── components/
│   │   ├── header.html
│   │   └── settings-sidebar.html
│   └── templates/
│       └── modals.html
└── core/
    ├── shared/
    │   ├── dom-refs.ts
    │   ├── dom-units.ts
    │   ├── i18n.ts
    │   ├── icons.ts
    │   ├── permissions.ts
    │   ├── state.ts
    │   └── types.ts
    ├── boot/
    │   ├── display.ts
    │   ├── event-bindings.ts
    │   ├── search.ts
    │   ├── shortcuts-render.ts
    │   ├── wallpaper.ts
    │   ├── wallpaper-render.ts
    │   └── weather.ts
    ├── ui/
    │   ├── modals.ts
    │   ├── palette.ts
    │   ├── sidebar-router.ts
    │   ├── sidebar.ts
    │   └── snackbar.ts
    └── lazy/
        ├── ask-ai.ts
        ├── backup.ts
        ├── drag-drop.ts
        ├── frequent-searches.ts
        ├── launcher-data.ts
        ├── launcher.ts
        ├── md3-select.ts
        ├── palette-engine.ts
        ├── search-engine-data.ts
        ├── search-engine-dropdown.ts
        ├── search-suggestions.ts
        ├── shortcuts-modals.ts
        ├── voice-search.ts
        ├── wallpaper-engine.ts
        ├── wallpaper-storage.ts
        ├── pages/
        │   ├── appearance-advanced.ts
        │   ├── display-advanced.ts
        │   └── wallpaper-advanced.ts
        └── providers/
            ├── wallpaper-apis.ts
            ├── wallpaper-refresh.ts
            └── weather-api.ts
```

---

## HTML Partials & SVG Symbols

Built-in HTML composition handled by `htmlPartials()` in `vite.config.ts`:

| File | Purpose |
|---|---|
| `icons/symbols.html` | Unified SVG `<symbol>` sprite referenced via `<use href="#icon-..." />`. |
| `html/components/header.html` | Top bar, weather widget, app launcher popup shell, and settings trigger. |
| `html/components/settings-sidebar.html` | Root settings panel markup. |
| `html/templates/modals.html` | `<template>` definitions cloned lazily via `mountTemplate()` when dialogs are opened. |

---

## core/shared

Stateless helpers, constants, and core state imported across layers.

| Module | Description |
|---|---|
| `dom-refs.ts` | Fresh typed DOM getters grouped by section (`header`, `settings`). |
| `dom-units.ts` | Collapsible group sync helpers (`syncExpandableGroup`, `syncWeatherGroup`) and `<template>` cloning (`mountTemplate`). |
| `i18n.ts` | Async translation loader (`loadTranslations`, `applyTranslations`, `t`). |
| `icons.ts` | Shared `<svg><use ... /></svg>` HTML strings referencing `icons/symbols.html`. |
| `permissions.ts` | Chrome optional host permission checks and prompts. |
| `state.ts` | Reactive `Proxy` state syncing mutations to `localStorage` and notifying subscribers. |
| `types.ts` | Shared TypeScript interfaces (`AppSettings`, `CityData`, `WeatherApiResponse`, `GeocodingResult`, etc.). |

---

## core/boot

Critical startup modules executed synchronously during initialization.

| Module | Description |
|---|---|
| `display.ts` | Clock/greetings widget and 1-second timer tick. |
| `event-bindings.ts` | Settings controls bindings, weather permission flow, and city search wiring (loads `weather-api.ts` lazily). |
| `search.ts` | Applies saved search engine form action/icon and binds submit fallback. |
| `shortcuts-render.ts` | Renders shortcuts grid using cached DOM `cloneNode(true)` templates and `DocumentFragment`; delegates modals/drag-drop lazily. |
| `wallpaper.ts` | Orchestrates boot wallpaper display and delegates refresh/engine work lazily. |
| `wallpaper-render.ts` | Minimal DOM layer applier for instant wallpaper rendering. |
| `weather.ts` | Reads fresh cached weather synchronously and only imports `providers/weather-api.ts` when needed. |

---

## core/ui

Persistent chrome and overlay controllers initialized on demand or at startup.

| Module | Description |
|---|---|
| `modals.ts` | Imperative confirmation/warning modal cloned from `<template>` on first use. |
| `palette.ts` | Applies cached palette vars immediately and loads `palette-engine.ts` lazily for color generation. |
| `sidebar.ts` | Opens/closes settings drawer and binds theme segmented controls. |
| `sidebar-router.ts` | Navigates between main settings and lazy-loaded subpages (`lazy/pages/`). |
| `snackbar.ts` | Toast notification controller (`showSnackbar`, `hideSnackbar`). |

---

## core/lazy

On-demand chunks split by Vite and loaded upon interaction or cache miss:

- **Interactions & Inputs**: `ask-ai.ts`, `drag-drop.ts`, `launcher.ts` (+ `launcher-data.ts`), `md3-select.ts`, `search-engine-dropdown.ts` (+ `search-engine-data.ts`), `search-suggestions.ts` (+ `frequent-searches.ts`), `shortcuts-modals.ts`, `voice-search.ts`, `backup.ts`.
- **Engines & Storage**: `palette-engine.ts` (`@material/material-color-utilities`), `wallpaper-engine.ts`, `wallpaper-storage.ts` (IndexedDB).
- **Subpages (`pages/`)**: `appearance-advanced.ts`, `display-advanced.ts`, `wallpaper-advanced.ts`.
- **Network Providers (`providers/`)**: `wallpaper-apis.ts`, `wallpaper-refresh.ts`, `weather-api.ts` (Open-Meteo weather forecast & geocoding).

`vite.config.ts` resolves `<include>` partials during HTML transform and minifies emitted HTML, CSS, JSON, and `dist/scripts/` assets in `closeBundle()`.
