// The individual modules (apiClient, flags, ui) are concatenated into the bundle by build.py
(function () {
  const Builder = {};
  const mods = (window.__builderModules = window.__builderModules || {});

  // simple in-memory cache for fetches
  const _cache = {};

  function safeParseEmbedded(key) {
    try {
      return window.__embeddedData && (window.__embeddedData[key] || window.__embeddedData[key.toString()]);
    } catch (e) {
      return null;
    }
  }

  async function fetchWithFallback(url = '/data/games.json') {
    const key = url || '/data/games.json';
    if (_cache[key]) return _cache[key];
    try {
      if (window.__builderModules && window.__builderModules.apiClient && typeof window.__builderModules.apiClient.fetchGames === 'function') {
        const data = await window.__builderModules.apiClient.fetchGames(key);
        _cache[key] = data;
        return data;
      }
      if (typeof fetch === 'function') {
        const res = await fetch(key, { cache: 'no-store' });
        if (!res.ok) throw new Error('Network response was not ok: ' + res.status);
        const json = await res.json();
        _cache[key] = json;
        return json;
      }
    } catch (e) {
    }
    const embedded = safeParseEmbedded('data/games.json') || safeParseEmbedded('data/games.sample.json');
    if (embedded) {
      _cache[key] = embedded;
      return embedded;
    }
    throw new Error('Unable to fetch games and no embedded fallback found');
  }

  function createModal() {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.display = 'none';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = 100001;
    modal.style.background = 'rgba(0,0,0,0.45)';

    const box = document.createElement('div');
    box.style.background = '#0b0b0b';
    box.style.color = 'white';
    box.style.padding = '18px';
    box.style.borderRadius = '8px';
    box.style.maxWidth = '90%';
    box.style.maxHeight = '80%';
    box.style.overflow = 'auto';

    const close = document.createElement('button');
    close.textContent = 'Close';
    close.style.marginBottom = '12px';
    close.style.background = '#111';
    close.style.color = 'white';
    close.style.border = '1px solid #222';
    close.style.padding = '6px 10px';
    close.style.borderRadius = '6px';
    close.addEventListener('click', () => modal.style.display = 'none');

  const content = document.createElement('pre');
  content.style.whiteSpace = 'pre';
  content.style.fontFamily = 'monospace';
  content.style.fontSize = '13px';
  content.style.margin = '0';
  content.style.padding = '10px';
  content.style.background = '#040404';
  content.style.border = '1px solid rgba(255,255,255,0.04)';
  content.style.borderRadius = '6px';
  content.style.maxHeight = 'calc(80vh - 80px)';
  content.style.overflow = 'auto';

    box.appendChild(close);
    box.appendChild(content);
    modal.appendChild(box);
    modal._content = content;
    return modal;
  }

  const modal = createModal();

  function showModal(text, options) {
  modal._content.textContent = typeof text === 'string' ? text : JSON.stringify(text, null, 2);
    modal.style.display = 'flex';
    if (options && options.onclick) modal.onclick = options.onclick;
  }

  function listEmbeddedKeys() {
    try {
      return Object.keys(window.__embeddedData || {});
    } catch (e) { return [] }
  }

  function downloadEmbedded(key) {
    const v = safeParseEmbedded(key);
    if (!v) return false;
    const blob = new Blob([typeof v === 'string' ? v : JSON.stringify(v, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = key.split('/').pop();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return true;
  }

  function copyEmbedded(key) {
    const v = safeParseEmbedded(key);
    if (!v) return false;
    const txt = typeof v === 'string' ? v : JSON.stringify(v, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).catch(()=>{});
      return true;
    }
    // fallback
    const ta = document.createElement('textarea');
    ta.value = txt;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch(e) {}
    ta.remove();
    return true;
  }

  Builder.fetchGames = fetchWithFallback;
  Builder.flags = () => (mods.flags ? mods.flags.parseFromScriptTag() : (window.__builderFlags || {}));
  Builder.getFlag = (name, def) => (mods.flags ? mods.flags.getFlag(name, def) : (Builder.flags()[name] ?? def));
  Builder.listEmbeddedKeys = listEmbeddedKeys;
  Builder.downloadEmbedded = downloadEmbedded;
  Builder.copyEmbedded = copyEmbedded;
  Builder.openDocsModal = function (text) {
    try {
      const m = window.__builderModules && window.__builderModules['ui.modal'];
      if (m && typeof m.showModal === 'function') return m.showModal(text);
    } catch (e) {}
    return showModal(text);
  };

  Builder.openMiniPlayer = async function (arg) {
    try {
      const pmod = window.__builderModules && (window.__builderModules['ui.panel'] || window.__builderModules['ui.panel']);
      if (pmod && typeof pmod.openMiniPlayer === 'function') return await pmod.openMiniPlayer(arg);
      if (window.Play && typeof window.Play.open === 'function') return await window.Play.open(arg);
    } catch (e) {}
    return false;
  };
  Builder.toggleTheme = function () {
    const el = document.documentElement;
    if (el.getAttribute('data-theme') === 'light') el.setAttribute('data-theme', 'dark');
    else el.setAttribute('data-theme', 'light');
  };

  window.Builder = Builder;
  if (typeof console !== 'undefined') console.info('Builder loaded — call window.Builder for usage.');

  try {
    function tryInitPanel() {
      try {
        const p = window.__builderModules && window.__builderModules['ui.panel'];
        if (p && typeof p.initPanel === 'function') {
          p.initPanel(Builder);
          return true;
        }
      } catch (e) { /* ignore */ }
      return false;
    }

    if (!tryInitPanel()) {
      function onReady() {
        if (tryInitPanel()) return;
        let attempts = 0;
        const iv = setInterval(() => {
          attempts++;
          if (tryInitPanel() || attempts > 8) clearInterval(iv);
        }, 120);
      }

      if (document.readyState === 'complete' || document.readyState === 'interactive') onReady();
      else document.addEventListener('DOMContentLoaded', onReady);
    }
  } catch (e) { console.warn('Failed to initialize ui.panel', e); }

})();
