# Locales

This folder contains the translation files for MD3: Expressive New Tab.
For contribution instructions, see [TRANSLATING.md](TRANSLATING.md).

---

## File Structure

```
_locales/
  en_US/
    messages.json   ← source (do not edit)
  pt_BR/
    messages.json   ← Portuguese (Brazil)
  ...
```

Each entry in `messages.json` follows this shape:

```jsonc
"keyName": {
  "message": "Translated string here"
}
```

Keys with dynamic content also include a `placeholders` block — copy it verbatim, translate only `"message"`.

---

## Available Languages

| Locale | Language | Translator |
|--------|----------|-----------|
| `en_US` | English | [@snw-mint](https://github.com/snw-mint) |
| `pt_BR` | Português (BR) | [@snw-mint](https://github.com/snw-mint) |

---

## String Key Groups

| Prefix | Area |
|--------|------|
| `greet*` | Greeting messages (display widget) |
| `weekday_*` | Weekday names (0 = Sunday … 6 = Saturday) |
| `warning*` | Warning / confirmation modals |
| `wizard*` | Setup wizard pages |
| `shortcut*` | Shortcuts panel |
| `weather*` | Weather widget |
| `launcher*` | App launcher |
| `search*` | Search bar |
| `display*` | Display widget settings |
| `appearance*` | Appearance settings |
| `language*` | Language settings |
| `btn*` | Buttons (generic) |
| `data*` / `backup*` | Data & Backup section |
| `adv*` | Advanced appearance options |

> Keys for proper nouns (e.g. search engine names, ecosystems) and footer links are intentionally **not translated**.
