Welcome to MD3: Expressive New Tab Contributing Guide

Thank you for your interest in contributing to **MD3: Expressive New Tab**! We are thrilled to have you here.

This project is built with **Vanilla HTML + TypeScript + SCSS** to ensure maximum performance and privacy without the overhead of heavy frameworks. We value clean, readable code and a strict adherence to **Google's Material Design** principles (Mica effects, rounded corners, and smooth animations).

---

## Development Setup

Since this is a browser extension, the dev flow is still simple, but now includes a build step.

1.  **Fork and Clone** the repository to your local machine.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Build the extension:
    ```bash
    npm run build
    ```
4.  Open **Microsoft Edge** and navigate to `edge://extensions`.
5.  Enable **"Developer Mode"**.
6.  Click **"Load Unpacked"** and select the `dist/` folder.
7.  Open a **New Tab** to see your changes in action.

> **Tip:** After source changes, run `npm run build` again and click **Reload** on the extension card.

---

## Project Structure

Here is an overview of the project's file organization:

```text
fluent-new-tab/
├── src/
│   ├── core/
│   ├── styles/
│   ├── script.ts            # Main app flow and feature orchestration
│   └── style.scss           # Main SCSS entrypoint that imports partials
├── dist/                    # Build output loaded as unpacked extension
├── tools/
│   └── build.mjs            # Copies static extension files to dist
├── assets/                  # Core assets (Favicons, UI icons)
│   └── apps/                # Ecosystem icons organized by provider
│   └── search-engines/      # Search engine icons
│   └── emojis/              # Fluent emojis for greetings
│   └── greetings/           # Outline icons for greetings
│   └── sfx/                 # Sound effects
│   └── weather/             # Animated Weather icons
├── index.html               # Main entry point (Structure)
└── manifest.json            # Extension configuration
```

---

## Coding Guidelines

### TypeScript

- **Syntax:** Use modern **ES6+** syntax (Arrow functions, `const`/`let`, Async/Await).
- **Modularity:** Keep functions small and focused.
- **No Frameworks:** Do not introduce libraries like jQuery, React, or Vue. We want to keep the extension lightweight.

### Icons

- We use **SVGs** for almost all UI elements to ensure crisp rendering on high-DPI screens.
- If adding a new app to the launcher, place the SVG in `assets/apps/{provider}/`.

---

## Submitting a Pull Request

Ready to contribute? Follow these standard steps:

1.  Create a new **Branch** for your feature or fix:
    ```bash
    git checkout -b feature/my-awesome-feature
    ```
2.  **Commit** your changes with clear messages.
3.  **Push** your branch to your fork.
4.  Open a **Pull Request (PR)** against the `main` branch.

**Pre-submission Checklist:**

- [ ] Did you test your changes in **Light Mode**?
- [ ] Did you test your changes in **Dark Mode**?

We look forward to your code! Happy coding!
