// Simple API client with a fallback to embedded data
(function () {
  const NAME = 'apiClient';
  const mods = (window.__builderModules = window.__builderModules || {});
  if (mods[NAME]) return;

  async function fetchConfig() {
    const embeddedConfig = window.__embeddedData && window.__embeddedData['data/config.json'];
    if (embeddedConfig) return embeddedConfig;
    try {
      const res = await fetch('/data/config.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch config');
      return await res.json();
    } catch (e) {
      return { apiBase: 'http://localhost:3000', endpoints: { games: '/data/games.json' } };
    }
  }

  async function fetchGames() {
    const cfg = await fetchConfig();
    const base = cfg.apiBase || 'http://localhost:3000';
    const path = (cfg.endpoints && cfg.endpoints.games) || '/data/games.json';
    const url = base.replace(/\/$/, '') + path;
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('Network response was not ok');
      return await res.json();
    } catch (e) {
      const embedded = (window.__embeddedData && window.__embeddedData['data/games.json']);
      if (embedded) return embedded;
      throw e;
    }
  }

  mods[NAME] = { fetchGames };
})();
