// Simple Window Manager: make elements draggable and provide a window-style fullscreen toggle
(function(){
  const NAME = 'window.manager';
  const mods = (window.__builderModules = window.__builderModules || {});
  if (mods[NAME]) return;

  function makeDraggable(el, handle) {
    if (!el || !handle) return () => {};
    handle.style.cursor = 'move';
    let dragging = false;
    let startX = 0, startY = 0, origX = 0, origY = 0;

    function onDown(e) {
      e = e || window.event;
      dragging = true;
      startX = (e.touches ? e.touches[0].clientX : e.clientX);
      startY = (e.touches ? e.touches[0].clientY : e.clientY);
      const rect = el.getBoundingClientRect();
      origX = rect.left;
      origY = rect.top;
      document.addEventListener('mousemove', onMove);
      document.addEventListener('touchmove', onMove, {passive:false});
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchend', onUp);
      e.preventDefault && e.preventDefault();
    }

    function onMove(e) {
      if (!dragging) return;
      const cx = (e.touches ? e.touches[0].clientX : e.clientX);
      const cy = (e.touches ? e.touches[0].clientY : e.clientY);
      const dx = cx - startX;
      const dy = cy - startY;
      try {
        el.style.left = Math.max(0, Math.round(origX + dx)) + 'px';
        el.style.top = Math.max(0, Math.round(origY + dy)) + 'px';
        el.style.right = 'auto';
        el.style.bottom = 'auto';
      } catch (err) {}
      e.preventDefault && e.preventDefault();
    }

    function onUp() {
      dragging = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchend', onUp);
    }

    handle.addEventListener('mousedown', onDown);
    handle.addEventListener('touchstart', onDown, {passive:false});

    return function destroy() {
      handle.removeEventListener('mousedown', onDown);
      handle.removeEventListener('touchstart', onDown);
      onUp();
    };
  }

  function registerWindow(el, opts) {
    opts = opts || {};
    const handle = opts.handle || el;
    try {
      const cs = window.getComputedStyle(el);
      if (cs.position === 'static') el.style.position = 'fixed';
    } catch (e) { el.style.position = 'fixed'; }
    el.style.left = el.style.left || (opts.left ? String(opts.left) : '76px');
    el.style.top = el.style.top || (opts.top ? String(opts.top) : '84px');
    el.style.width = el.style.width || (opts.width ? String(opts.width) : '420px');
    el.style.height = el.style.height || (opts.height ? String(opts.height) : '300px');
    el.style.zIndex = opts.zIndex || 100001;

    const destroyDrag = makeDraggable(el, handle);

    let isFullscreen = false;
    const state = {};

    function toggleFullscreen() {
      try {
        if (!isFullscreen) {
          state.left = el.style.left; state.top = el.style.top; state.width = el.style.width; state.height = el.style.height; state.position = el.style.position; state.zIndex = el.style.zIndex;
          el.style.left = '0'; el.style.top = '0'; el.style.width = '100vw'; el.style.height = '100vh'; el.style.position = 'fixed'; el.style.zIndex = 200000;
          el.__wm_fullscreen = true;
        } else {
          el.style.left = state.left || '';
          el.style.top = state.top || '';
          el.style.width = state.width || '';
          el.style.height = state.height || '';
          el.style.position = state.position || 'fixed';
          el.style.zIndex = state.zIndex || 100001;
          el.__wm_fullscreen = false;
        }
        isFullscreen = !isFullscreen;
      } catch (e) {}
      return isFullscreen;
    }

    return { destroy: destroyDrag, toggleFullscreen, isFullscreen: () => !!el.__wm_fullscreen };
  }

  mods[NAME] = { makeDraggable, registerWindow };
  window.WindowManager = mods[NAME];
})();
