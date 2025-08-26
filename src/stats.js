// FPS / frame timing monitor
(function () {
  const NAME = 'stats';
  const mods = (window.__builderModules = window.__builderModules || {});
  if (mods[NAME]) return;

  let running = false;
  let rafId = null;
  let last = 0;
  let frames = 0;
  let fps = 0;
  let overlay = null;

  function createOverlay() {
    const o = document.createElement('div');
  o.style.position = 'fixed';
  o.style.left = '12px';
  o.style.top = '12px';
    o.style.width = '72px';
    o.style.height = '28px';
    o.style.background = 'rgba(0,0,0,0.6)';
    o.style.color = 'white';
    o.style.padding = '6px 8px';
    o.style.borderRadius = '6px';
    o.style.fontFamily = 'monospace';
    o.style.fontSize = '12px';
    o.style.zIndex = 200000;
  o.style.pointerEvents = 'none';
    o.style.display = 'flex';
    o.style.alignItems = 'center';
    o.style.justifyContent = 'center';
    o.textContent = 'FPS: 0';
  o.className = 'builder-stats-widget';
  o.classList.add('builder-stats-overlay');
    return o;
  }

  function step(ts) {
    if (!last) last = ts;
    const delta = ts - last;
    frames++;
    if (delta >= 500) {
      fps = Math.round((frames * 1000) / delta);
      frames = 0;
      last = ts;
      if (overlay) overlay.textContent = `FPS: ${fps}`;
    }
    rafId = requestAnimationFrame(step);
  }
  function start(container) {
    if (running) return overlay || null;
    running = true;
    overlay = createOverlay();
    try {
      if (container && container.appendChild) container.appendChild(overlay);
      else document.body.appendChild(overlay);
    } catch (e) { try { document.body.appendChild(overlay); } catch (e) {} }
    last = 0; frames = 0;
    rafId = requestAnimationFrame(step);
    return overlay;
  }

  function stop() {
    if (!running) return;
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    try { overlay && overlay.remove(); } catch (e) {}
    overlay = null;
  }

  function createWidget() {
    return createOverlay();
  }

  mods[NAME] = { start, stop, isRunning: () => running, createWidget };
})();
