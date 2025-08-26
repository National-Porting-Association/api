// Small modal utility for the dev UI
(function () {
  const NAME = 'ui.modal';
  const mods = (window.__builderModules = window.__builderModules || {});
  if (mods[NAME]) return;

  function createModal() {
    const modal = document.createElement('div');
  modal.className = 'builder-modal-overlay';
    modal.style.position = 'fixed';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.display = 'none';
  modal.style.pointerEvents = 'none';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = 100001;
    modal.style.background = 'rgba(0,0,0,0.45)';

    const box = document.createElement('div');
  box.className = 'builder-modal-box';
    box.style.background = '#0b0b0b';
    box.style.color = 'white';
    box.style.padding = '18px';
    box.style.borderRadius = '8px';
    box.style.maxWidth = '90%';
    box.style.maxHeight = '80%';
    box.style.overflow = 'auto';
  box.style.pointerEvents = 'auto';

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

    function ensureAttached() {
      try { if (!document.body.contains(modal)) document.body.appendChild(modal); } catch (e) {}
    }
    if (document.readyState === 'complete' || document.readyState === 'interactive') ensureAttached();
    else document.addEventListener('DOMContentLoaded', ensureAttached);

    return modal;
  }

  const _modal = createModal();

  function showModal(text) {
    _modal._content.textContent = typeof text === 'string' ? text : JSON.stringify(text, null, 2);
  _modal.style.display = 'flex';
  _modal.style.pointerEvents = 'auto';
  }

  function hideModal() {
  _modal.style.display = 'none';
  _modal.style.pointerEvents = 'none';
  }

  mods[NAME] = { createModal, showModal, hideModal };
})();
