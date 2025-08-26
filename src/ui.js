// Minimal UI helpers exposed on window for dev convenience
(function () {
  const NAME = 'ui';
  const mods = (window.__builderModules = window.__builderModules || {});
  if (mods[NAME]) return;

  function info(msg) {
    console.info('[builder ui]', msg);
  }

  function toast(msg) {
    const el = document.createElement('div');
    el.textContent = msg;
    el.style.position = 'fixed';
    el.style.right = '12px';
    el.style.bottom = '12px';
    el.style.padding = '8px 12px';
    el.style.background = 'rgba(0,0,0,0.7)';
    el.style.color = 'white';
    el.style.borderRadius = '6px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }

  mods[NAME] = { info, toast };
})();
