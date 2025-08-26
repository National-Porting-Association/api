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
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Embed NPA Game</title>
  <script src="/dist/bundle.js"></script>
  <script>
    // Optional flags for runtime behaviour:
    window.__builderFlags = { env: 'prod', hideDevButton: true };
  </script>
</head>
<body>
  <div id="games-list"></div>
  <div id="play-area" style="width:800px;height:600px;border:1px solid #222"></div>

  <script>
    (async function(){
      try {
        const catalog = await window.Builder.fetch('/data/games.json');
        const first = catalog && catalog[0];
        document.getElementById('games-list').textContent = 'Found ' + (catalog ? catalog.length : 0) + ' games';
        if (first && first.embed_url) {
          const iframe = document.createElement('iframe');
          iframe.src = first.embed_url;
          iframe.width = '800';
          iframe.height = '600';
          iframe.style.border = 'none';
          document.getElementById('play-area').appendChild(iframe);
        } else {
          document.getElementById('play-area').textContent = 'No playable URL provided';
        }
      } catch (err) {
        console.error('Failed to load catalog', err);
        document.getElementById('games-list').textContent = 'Failed to load game catalog.';
      }
    })();
  </script>
</body>
</html>
```

---


## Notes
- Only call these APIs on the client (inside `useEffect` or guarded by `typeof window !== 'undefined'`).
- `window.Builder.flags()` is preferred because it returns parsed values; `window.__builderFlags` is a raw object that may be present before the bundle initializes.
- The docs page includes an interactive "flags" inspector and visual helpers — you can copy that pattern (flag table + visual bars) into your dev console.

---

# Programmatic usage (JS)

Examples of common tasks using the `window.Builder` helpers that the bundle provides.

### Fetch catalog (with embedded fallback)
```js
// returns JSON (array or object) — will try network first, then window.__embeddedData
const catalog = await window.Builder.fetch('/data/games.json');
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
