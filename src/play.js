// Play overlay: fullscreen iframe with header and stats integration
(function () {
  const NAME = 'ui.play';
  const mods = (window.__builderModules = window.__builderModules || {});
  if (mods[NAME]) return;

  function createPlayOverlay() {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'black';
    overlay.style.zIndex = 150000;
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';

  const iframe = document.createElement('iframe');
  iframe.style.flex = '1 1 auto';
  iframe.style.border = 'none';
  iframe.style.width = '100%';
  iframe.style.height = '100%';

  overlay._iframe = iframe;
  overlay.appendChild(iframe);
    return overlay;
  }

  let overlay = null;
  let headerEl = null;
  let currentUrl = '';

  async function open(input) {
    if (!input) return false;
    const isUrl = (s) => typeof s === 'string' && /^(https?:)?\/\//.test(s);
    let playUrl = null;

    if (isUrl(input)) {
      playUrl = input;
    } else {
      let games = null;
      try {
        if (window.Builder && typeof window.Builder.fetchGames === 'function') {
          games = await window.Builder.fetchGames();
          try { if (Array.isArray(games)) window.__lastFetchedGames = games; else if (games && Array.isArray(games.games)) window.__lastFetchedGames = games.games; } catch (e) {}
        } else if (window.__builderModules && window.__builderModules.apiClient && typeof window.__builderModules.apiClient.fetchGames === 'function') {
          games = await window.__builderModules.apiClient.fetchGames();
          try { if (Array.isArray(games)) window.__lastFetchedGames = games; else if (games && Array.isArray(games.games)) window.__lastFetchedGames = games.games; } catch (e) {}
        }
      } catch (e) {
        games = null;
      }

      try {
        if (games && typeof games === 'object' && Array.isArray(games.games)) games = games.games;
      } catch (e) {}

      if (!games) {
        try {
          const embedded = window.__embeddedData && (window.__embeddedData['data/games.json'] || window.__embeddedData['data/games.sample.json']);
          if (embedded) games = embedded.games || embedded;
        } catch (e) {}
      }

  if (games && Array.isArray(games)) {
        // try numeric id match first
        const asNum = Number(input);
        let game = null;
        if (!Number.isNaN(asNum)) {
          game = games.find(g => Number(g.id) === asNum);
        }
        // fallback to title match (case-insensitive)
        if (!game && typeof input === 'string') {
          const q = input.toLowerCase();
          game = games.find(g => (g.title || '').toLowerCase() === q);
        }
        if (game && game.playUrl) playUrl = game.playUrl;
        else if (game && !game.playUrl) {
          try {
            const modal = window.__builderModules && window.__builderModules['ui.modal'];
            if (modal && typeof modal.showModal === 'function') modal.showModal({ error: 'No playUrl for game', game: game });
          } catch (e) {}
          try { console.warn('Play.open: found game but no playUrl', game); } catch (e) {}
        }
      }
    }

    try {
      const isAbs = typeof playUrl === 'string' && /^(https?:)?\/\//.test(playUrl);
      if (!isAbs) {
        // collect candidate bases: Builder flag, global flags, embedded config, embedded urls.json
        let candidates = [];
        try {
          const b = (window.Builder && typeof window.Builder.getFlag === 'function') ? window.Builder.getFlag('apiBase') : null;
          if (b) candidates.push(String(b));
        } catch (e) {}
        try { if (window.__builderFlags && window.__builderFlags.apiBase) candidates.push(String(window.__builderFlags.apiBase)); } catch (e) {}
        try {
          const cfg = window.__embeddedData && window.__embeddedData['data/config.json'];
          if (cfg && cfg.apiBase) candidates.push(String(cfg.apiBase));
        } catch (e) {}

        try {
          const urlsEmbedded = window.__embeddedData && window.__embeddedData['data/urls.json'];
          if (Array.isArray(urlsEmbedded)) candidates = candidates.concat(urlsEmbedded.map(String));
          else if (urlsEmbedded && Array.isArray(urlsEmbedded.urls)) candidates = candidates.concat(urlsEmbedded.urls.map(String));
        } catch (e) {}

        // attempt to fetch external /data/urls.json to supplement candidates
        try {
          if (typeof fetch === 'function') {
            const res = await fetch('/data/urls.json', { cache: 'no-store' }).catch(() => null);
            if (res && res.ok) {
              try {
                const json = await res.json().catch(() => null);
                if (json) {
                  if (Array.isArray(json)) candidates = candidates.concat(json.map(String));
                  else if (Array.isArray(json.urls)) candidates = candidates.concat(json.urls.map(String));
                }
              } catch (e) {}
            }
          }
        } catch (e) {}

        // normalize unique
        candidates = (candidates || []).filter(Boolean).map(s => String(s));
        const uniq = [];
        for (let i = 0; i < candidates.length; i++) if (uniq.indexOf(candidates[i]) === -1) uniq.push(candidates[i]);
        candidates = uniq;

        const loadingMod = window.__builderModules && window.__builderModules['ui.loading'];

        // probe each candidate for a responsive /api/games endpoint (3s each)
        for (let i = 0; i < candidates.length; i++) {
          const base = (candidates[i] || '').replace(/\/+$/, '');
          if (!base) continue;
          try { if (loadingMod && typeof loadingMod.show === 'function') loadingMod.show(base); } catch (e) {}

          const probeUrl = base + '/api/games';
          let ok = false;
          try {
            const controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
            const timer = controller ? setTimeout(() => { try { controller.abort(); } catch (e) {} }, 3000) : null;
            try {
              const resp = await (typeof fetch === 'function' ? fetch(probeUrl, { method: 'GET', signal: controller ? controller.signal : undefined, cache: 'no-store' }) : null).catch(() => null);
              if (resp && resp.ok) ok = true;
            } catch (e) {}
            try { if (timer) clearTimeout(timer); } catch (e) {}
          } catch (e) {}

          try { if (loadingMod && typeof loadingMod.hide === 'function') loadingMod.hide(); } catch (e) {}

          if (ok) {
            if (typeof playUrl === 'string') playUrl = base + '/' + String(playUrl).replace(/^\/+/, '');
            break;
          }
        }
      }
    } catch (e) {}

    if (!playUrl) return false;

    const headerMod = window.__builderModules && window.__builderModules['ui.header'];
    const statsMod = window.__builderModules && window.__builderModules['stats'];

    if (!overlay) {
      overlay = createPlayOverlay();
      try { document.body.appendChild(overlay); } catch (e) {}
    }

    function onClose() {
      try { if (overlay) overlay.remove(); overlay = null; } catch (e) {}
      try { if (headerEl) headerEl.remove(); headerEl = null; } catch (e) {}
      try { statsMod && statsMod.stop(); } catch (e) {}
    }

    function onToggleStats() {
      try { if (statsMod) { if (statsMod.isRunning()) statsMod.stop(); else statsMod.start(); } }
      catch (e) {}
    }

    function onFullscreen() {
      try {
        const el = overlay;
        if (el.requestFullscreen) el.requestFullscreen(); else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      } catch (e) {}
    }

    function onOpenNew() {
      try { window.open(playUrl, '_blank'); } catch (e) {}
    }

    (function () {
      const gameTitle = (typeof input === 'string' && !/^(https?:)?\/\//.test(input)) ? (function(){
        try {
          const asNum = Number(input);
          let game = null;
          if (!Number.isNaN(asNum) && Array.isArray(window.__lastFetchedGames)) game = window.__lastFetchedGames.find(g => Number(g.id) === asNum);
          if (!game && Array.isArray(window.__lastFetchedGames)) {
            const q = String(input).toLowerCase();
            game = window.__lastFetchedGames.find(g => (g.title||'').toLowerCase() === q);
          }
          return game ? (game.title || '') : '';
        } catch (e) { return ''; }
      })() : '';

      try {
        const h = document.createElement('div');
        h.className = 'builder-mini-header';
        h.style.display = 'flex';
        h.style.justifyContent = 'space-between';
        h.style.alignItems = 'center';
        h.style.padding = '6px 8px';
        h.style.background = 'rgba(0,0,0,0.6)';
        h.style.color = 'white';
        h.style.width = '100%';
        h.style.boxSizing = 'border-box';

        const left = document.createElement('div'); left.style.display = 'flex'; left.style.alignItems = 'center';
        const title = document.createElement('div'); title.textContent = gameTitle || 'Play'; title.style.fontSize = '14px'; title.style.fontWeight = '700'; title.style.marginRight = '12px';
        left.appendChild(title);

        const right = document.createElement('div'); right.style.display = 'flex'; right.style.gap = '8px'; right.style.flexShrink = '0'; right.style.alignItems = 'center';

        function makeBtn(text, cb) { const b = document.createElement('button'); b.textContent = text; b.style.padding = '6px 8px'; b.style.borderRadius = '6px'; b.style.border = 'none'; b.style.cursor = 'pointer'; b.style.background = 'rgba(255,255,255,0.06)'; b.style.color = 'white'; b.addEventListener('click', cb); return b; }

        const fsBtn = makeBtn('⛶', onFullscreen);
        const statsBtn = makeBtn('Stats', onToggleStats);
        const closeBtn = makeBtn('✕', onClose);

        right.appendChild(fsBtn);
        right.appendChild(statsBtn);
        right.appendChild(closeBtn);

        h.appendChild(left);
        h.appendChild(right);

        headerEl = h;
        try { overlay.insertBefore(headerEl, overlay.firstChild); } catch (e) {}
        try { document.body.appendChild(overlay); } catch (e) {}
      } catch (e) {}
    })();

  overlay._iframe.src = playUrl;
  currentUrl = playUrl;
  return true;
  }

  mods[NAME] = { open };
  window.Play = { open: (u) => (mods[NAME].open(u)) };
})();
