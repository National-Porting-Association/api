**National Porting Association (NPA)** — client library for embedding and serving NPA ported games on your website.  
Docs: https://npa.lol/docs

This repo contains a small client bundle and a build script (`build.py`) used to produce a single `dist/bundle.js` that exposes runtime helpers on `window.Builder` and embeds fallback assets on `window.__embeddedData`. Use the client to fetch the NPA catalog, show metadata, and embed playable ports into your pages — with automatic fallback to embedded data when the network is unavailable.

---

# Table of contents

- [Quick overview](#quick-overview)  
- [Features](#features)  
- [Installation](#installation)  
- [Quick start (HTML)](#quick-start-html)  
- [Use client (React)](#use-client-react)  
- [Programmatic usage (JS)](#programmatic-usage-js)  
- [Build system (`build.py`)](#build-system-buildpy)  
- [Manifest & embedded data](#manifest--embedded-data)  
- [Contributing](#contributing)  
- [Where to find docs & support](#where-to-find-docs--support)  
- [License](#license)

---

# Quick overview

The bundle provides:

- `window.Builder` — runtime helpers for fetching catalogs and creating embed UI.  
- `window.__embeddedData` — JSON and small assets embedded at build time for offline fallback.  
- `window.Play` — play overlay and mini-player helpers.  
- A small Python build script (`build.py`) that concatenates JavaScript files and embeds JSON/images into the bundle.
- Learn more about what this bundle provides at https://npa.lol/docs.

The API is for adding and serving NPA ported games so other sites can embed those ports and let visitors play them in-place.

---

# Features

- Single-file bundle (`dist/bundle.js`) — easy to include on any static site.  
- Embedded assets fallback — bundle contains JSON/images so your site can still show games if the API is unreachable.  
- Minimal runtime API (`window.Builder.*`, `window.Play.*`) for fetching catalogs and mounting players.  
- Small dev UI with quick actions (inspect flags, preview embedded assets, open mini-player).  
- Simple build pipeline (Python) to generate the bundle and `dist/manifest.json`.

---

# Installation

Script tag
Include the built bundle on any page:

```html
<script>
  // optional: set flags before the bundle initializes
  window.__builderFlags = { hideDevButton: true, env: 'prod' };
</script>
<script src="/path/to/dist/bundle.js" data-flags="env=dev"></script>
```


---

# Quick start (HTML)

This example loads the bundle, fetches the games catalog, and inserts a playable iframe for the first game.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NPA API Play Demo</title>

  <!-- Inline flags -->
  <script>
    window.__builderFlags = {
      hideDevButton: false,
      env: 'dev'
    };
  </script>

  <!-- Load built bundle -->
  <script src="bundle.js"></script>

  <style>
    body {
      font-family: system-ui, sans-serif;
      margin: 0;
      padding: 0;
      background: #121212;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      color: #eee;
    }

    .container {
      background: #1e1e1e;
      padding: 1rem;
      width: 100%;
      max-width: 400px;
    }

    header {
      margin-bottom: 1.5rem;
      text-align: center;
    }
    header h1 {
      font-size: 1.4rem;
      margin: 0 0 0.25rem;
      color: #fff;
    }
    header p {
      margin: 0;
      font-size: 0.9rem;
      color: #aaa;
    }

    .controls {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    button {
      padding: 0.6rem 1rem;
      border: none;
      border-radius: 8px;
      background: #000000;
      color: #fff;
      font-size: 0.95rem;
      cursor: pointer;
      transition: background 0.2s ease;
    }
    button:hover {
      background: #131313;
    }

    .output {
      background: #111;
      border: 1px solid #2a2a2a;
      border-radius: 8px;
      padding: 0.75rem;
      font-family: monospace;
      font-size: 0.85rem;
      min-height: 60px;
      white-space: pre-wrap;
      color: rgb(82, 81, 81);
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>NPA API Demo</h1>
      <p>Play overlay & mini-player test</p>
    </header>

    <main class="controls">
      <button id="overlayById">Open Overlay (ID "1")</button>
      <button id="miniById">Open Mini-player (ID "1")</button>
    </main>

    <div class="output" id="output">Logs will appear here...</div>
  </div>

  <script>
    const log = msg => {
      const out = document.getElementById('output');
      out.textContent += msg + "\n";
      out.scrollTop = out.scrollHeight;
    };

    document.getElementById('overlayById').addEventListener('click', () => {
      if (window.Play) {
        window.Play.open('1');
        log("Opened overlay by ID = '1'");
      } else {
        log("window.Play not available (bundle not loaded?)");
      }
    });

    document.getElementById('miniById').addEventListener('click', () => {
      if (window.Builder) {
        window.Builder.openMiniPlayer('1');
        log("Opened mini-player by ID = '1'");
      } else {
        log("window.Builder not available (bundle not loaded?)");
      }
    });
  </script>
</body>
</html>
```

---

# Programmatic usage (JS)

Examples of common tasks using the `window.Builder` helpers that the bundle provides.

### Fetch catalog (with embedded fallback)
```js
// logs the game list to the console
window.Builder.fetchGames().then(games => console.log(games)).catch(err => console.error(err))
```

### Use embedded data directly
```js
const embeddedCatalog = window.__embeddedData && window.__embeddedData['data/games.json'];
```

### Mounting a simple player
```js
function mountGame(container, game) {
  if (game.embed_url) {
    const iframe = document.createElement('iframe');
    iframe.src = game.embed_url;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    container.appendChild(iframe);
    return iframe;
  }
  container.textContent = 'This game cannot be embedded directly.';
}
```

### Play helpers
- `window.Play.open(url)` — opens the fullscreen overlay for the given play URL (or game id resolved against the games list).  
- `window.Builder.openMiniPlayer(arg)` — open a compact mini-player; `arg` can be no arg (first game), id/slug/title, absolute/relative URL, or `{ playUrl, title }`.

---

# Build system (`build.py`)

A small Python script (`build.py`) concatenates `.js` files and embeds `.json`, `.txt`, and small images into the bundle.

**Usage**
```bash
python build.py
# outputs: dist/bundle.js and dist/manifest.json
```

**files.txt**
- `files.txt` lists each source file (relative paths). Each `.js` in that list gets appended to the final bundle in order.
- `.json` and `.txt` files listed are parsed and embedded under `window.__embeddedData['path/to/file.json']`.
- small images (`.png`, `.jpg`, `.jpeg`, `.ico`) are embedded as data URLs and assigned into `window.__embeddedData` (and `window.__builderIconDataUrl` in the special `*icon.png` case).

**Output**
- `dist/bundle.js` — single JS file that sets embedded data then appends all JS parts.
- `dist/manifest.json` — lists files included and which keys were embedded.

**Key behaviour**
- The build script will ensure `window.__embeddedData` exists and assign each embedded asset with its normalized path as the key.
- If a key ends with `icon.png`, the script sets `window.__builderIconDataUrl` to that data URL (convenience for UIs).

---

# Manifest & embedded data

`dist/manifest.json` contains:
```json
{
  "files": [ "lib/part1.js", "data/games.json", "assets/icon.png" ],
  "embedded_keys": [ "data/games.json", "assets/icon.png" ],
  "bundle": "bundle.js"
}
```

At runtime:
- `window.__embeddedData['data/games.json']` contains the parsed JSON content embedded during the build.  
- `window.__builderIconDataUrl` (if present) contains a base64 `data:` URL for a small icon.

This lets the client code attempt network fetches first, and fall back to `window.__embeddedData` when the fetch fails.

---

# Contributing

Contributions are welcome.

- Open issues on the repository with clear reproduction steps.
- For code changes, follow these steps:
  1. Create a branch (`git checkout -b feat/your-feature`).
  2. Edit source files and `files.txt` as needed.
  3. Run `python build.py` and verify `dist/bundle.js` behaves as expected.
  4. Submit a PR with an explanation and screenshots where appropriate.

If you add large binary assets, consider tracking them with Git LFS.

---

# Where to find docs & support

Full API and field-level documentation: **https://npa.lol/docs**

For issues, feature requests, or support: open an issue in this repo.

---

# License
```
MIT © National Porting Association
```

---
