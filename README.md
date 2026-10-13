# DevPocket — Developer Toolkit

**Privacy-first, offline-capable developer utilities.**
JSON formatter, Base64, URL, JWT decoder, UUID, SHA-256, timestamps, text stats, regex tester, and color converter — all running locally in your browser.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![No tracking](https://img.shields.io/badge/privacy-100%25%20local-brightgreen.svg)

## Features

| Tool | Description |
|------|-------------|
| **JSON** | Format, minify, and validate JSON with configurable indentation |
| **Base64** | Encode / decode with full Unicode (UTF-8) support |
| **URL** | `encodeURI` / `encodeURIComponent` and their decode counterparts |
| **JWT** | Decode header & payload locally — **does not verify signatures** |
| **UUID** | Generate UUID v4 using cryptographically secure randomness when available |
| **SHA-256** | Hash text via the Web Crypto API |
| **Timestamp** | Convert between Unix timestamps and human-readable / ISO dates |
| **Text Counter** | Characters, words, lines, UTF-8 bytes |
| **Regex** | Test patterns with match listing; bounded to reduce UI freezes |
| **Color** | Convert between HEX, RGB, and HSL with live preview |

### Design & UX

- Responsive dark / light themes (respects `prefers-color-scheme`)
- Sidebar navigation (desktop) + mobile-friendly drawer
- Accessible forms, visible focus indicators, ARIA live regions
- Copy / clear / swap actions and toast notifications
- Empty states and clear validation messages
- Keyboard-friendly (Escape closes mobile menu)

### Privacy model

- **All processing is local.** User inputs never leave the browser.
- No analytics, advertisements, or tracking scripts.
- No external API calls that transmit your data.
- Theme preference is stored only in `localStorage` (`devpocket-theme`).
- JWT contents and other inputs are not logged or persisted.
- A visible warning is shown on the JWT tool: do not paste production secrets into untrusted sites.

Fonts are loaded from Google Fonts for convenience. You can self-host or remove the `<link>` tags if you require a fully offline offline first load.

## Quick start

No build step is required for normal use.

```bash
# Clone or download the repository
cd devpocket

# Option A — open directly in a browser
# (some browsers restrict module loading from file://)
open index.html

# Option B — local static server (recommended)
npx serve . -l 3000
# then visit http://localhost:3000
```

Or with Python:

```bash
python3 -m http.server 3000
```

## Development

```bash
# Install optional test dependencies
npm install

# Run pure-Node unit tests (no install required)
npm run test:unit
# equivalent to: node tests/run-tests.js

# Run Jest suite (requires npm install)
npm test
```

## Testing

### Executed tests

The pure-Node runner (`node tests/run-tests.js`) covers:

- UUID v4 format & uniqueness
- JSON parse / stringify / minify (valid & invalid)
- SHA-256 (empty string and `"hello"`)
- Base64 round-trip (ASCII + Unicode) and invalid input
- JWT decode (valid structure) and invalid format
- Color parse (HEX, RGB) and conversion helpers
- Regex match, invalid pattern, and no-match cases
- HTML escaping

Run it with:

```bash
node tests/run-tests.js
```

### Optional Jest suite

`tests/utils.test.js` mirrors the above and can be run via `npm test` after `npm install`.
Jest is listed under `devDependencies` only.

### Manual QA checklist

- [ ] All 10 tools open and produce correct results for valid input
- [ ] Invalid JSON, Base64, JWT, colors, and regex show clear errors
- [ ] Copy buttons work (or show a failure toast)
- [ ] Theme toggle persists across reloads
- [ ] Mobile menu opens/closes; Escape closes it
- [ ] No console errors on load or during normal use
- [ ] Keyboard focus is visible on interactive controls

## Project structure

```
devpocket/
├── index.html              # Single-page application shell
├── css/styles.css          # Themes, layout, components
├── js/
│   ├── app.js              # Navigation, theme, bootstrap
│   ├── utils.js            # Shared helpers (crypto, clipboard, toast…)
│   └── tools/              # One module per tool
│       ├── json.js
│       ├── base64.js
│       ├── url.js
│       ├── jwt.js
│       ├── uuid.js
│       ├── hash.js
│       ├── timestamp.js
│       ├── textstats.js
│       ├── regex.js
│       └── color.js
├── tests/
│   ├── run-tests.js        # Zero-dependency Node runner
│   └── utils.test.js       # Jest tests
├── .github/
│   ├── workflows/ci.yml
│   └── ISSUE_TEMPLATE/
├── package.json
├── LICENSE                 # MIT
├── README.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
└── SECURITY.md
```

## Limitations

- JWT decoding does **not** verify signatures or validate claims (`exp`, `nbf`, etc.).
- SHA-256 requires the Web Crypto API (unavailable in very old browsers or insecure contexts).
- Regex matching is time- and iteration-bounded; extremely pathological patterns may still impact performance.
- Color picker (native `<input type="color">`) does not support alpha.
- Clipboard API requires a secure context (HTTPS or localhost) for the preferred path; a fallback is provided.
- No service worker / offline cache is bundled by default (static files work offline once loaded).

## License

MIT — see [LICENSE](LICENSE).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Security

See [SECURITY.md](SECURITY.md). Report vulnerabilities privately; do not open public issues for security-sensitive reports.

---

Built for developers who prefer simple, transparent tools that respect privacy.
