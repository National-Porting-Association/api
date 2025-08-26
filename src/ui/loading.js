// Simple loading probe UI (non-blocking) — shows a small top bar with the current base being tried
(function () {
  const NAME = 'ui.loading';
  const mods = (window.__builderModules = window.__builderModules || {});
  if (mods[NAME]) return;

  function createEl() {
    const wrap = document.createElement('div');
    wrap.className = 'builder-loading-bar';
    wrap.style.position = 'fixed';
    wrap.style.top = '10px';
    wrap.style.left = '50%';
    wrap.style.transform = 'translateX(-50%)';
    wrap.style.zIndex = 400000;
    wrap.style.pointerEvents = 'none';
    wrap.style.maxWidth = '80%';
    wrap.style.width = 'min(800px, 80%)';

    const bg = document.createElement('div');
    bg.style.background = 'rgba(0,0,0,0.7)';
    bg.style.color = 'white';
    bg.style.padding = '8px 12px';
    bg.style.borderRadius = '8px';
    bg.style.display = 'flex';
    bg.style.alignItems = 'center';
    bg.style.gap = '10px';

    const label = document.createElement('div');
    label.style.fontSize = '13px';
    label.style.opacity = '0.95';
    label.textContent = '';

    const barWrap = document.createElement('div');
    barWrap.style.flex = '1';
    barWrap.style.background = 'rgba(255,255,255,0.06)';
    barWrap.style.borderRadius = '6px';
    barWrap.style.height = '8px';
    barWrap.style.overflow = 'hidden';

    const bar = document.createElement('div');
    bar.style.height = '100%';
    bar.style.width = '0%';
    bar.style.background = 'linear-gradient(90deg,#06b6d4,#3b82f6)';
    bar.style.transition = 'width 250ms linear';

    barWrap.appendChild(bar);
    bg.appendChild(label);
    bg.appendChild(barWrap);
    wrap.appendChild(bg);

    wrap._label = label;
    wrap._bar = bar;
    return wrap;
  }

  let el = null;
  let animIv = null;

  function show(base) {
    try {
      // respect runtime flag
      const hide = (window.Builder && typeof window.Builder.getFlag === 'function') ? window.Builder.getFlag('hideLoadingBar') : (window.__builderFlags && window.__builderFlags.hideLoadingBar);
      if (hide) return;
    } catch (e) {}
    try {
      if (!el) {
        el = createEl();
        document.body.appendChild(el);
      }
      el._label.textContent = 'Probing: ' + (base || 'unknown');
      el.style.display = 'block';
      el._bar.style.width = '0%';
      let pct = 0;
      if (animIv) clearInterval(animIv);
      animIv = setInterval(() => {
        pct = Math.min(95, pct + Math.random() * 10);
        el._bar.style.width = pct + '%';
      }, 350);
    } catch (e) {}
  }

  function hide() {
    try {
      if (animIv) { clearInterval(animIv); animIv = null; }
      if (el) {
        el._bar.style.width = '100%';
        setTimeout(() => { try { el.style.display = 'none'; el._bar.style.width = '0%'; } catch (e) {} }, 220);
      }
    } catch (e) {}
  }

  mods[NAME] = { show, hide };
})();
