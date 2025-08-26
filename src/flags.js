// Flags parsing and helpers
(function () {
  const NAME = 'flags';
  const mods = (window.__builderModules = window.__builderModules || {});
  if (mods[NAME]) return;

  function parseFromScriptTag() {
    if (window.__builderFlags && typeof window.__builderFlags === 'object') return window.__builderFlags;

    const script = document.currentScript;
    if (!script) return {};
    const raw = script.getAttribute('data-flags') || '';
    const pairs = raw.split(/\s*,\s*/).filter(Boolean);
    const out = {};
    for (const p of pairs) {
      const [k, v] = p.split('=');
      if (v === undefined) {
        out[k] = true;
        continue;
      }
      const lv = v.toLowerCase();
      if (lv === 'true') out[k] = true;
      else if (lv === 'false') out[k] = false;
      else if (!isNaN(Number(v))) out[k] = Number(v);
      else out[k] = v;
    }
    return out;
  }

  function getFlag(name, defaultValue) {
    const all = parseFromScriptTag();
    if (Object.prototype.hasOwnProperty.call(all, name)) return all[name];
    return defaultValue;
  }

  mods[NAME] = { parseFromScriptTag, getFlag };
})();
