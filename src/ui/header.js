// Header bar for play overlay
(function () {
  const NAME = 'ui.header';
  const mods = (window.__builderModules = window.__builderModules || {});
  if (mods[NAME]) return;

  function createHeader({ titleText, onClose, onToggleStats, onFullscreen, onOpenNew, showOpen = true, position = 'relative' } = {}) {
    const header = document.createElement('div');
    // position is configurable so header can be placed inside overlays (non-fixed)
    header.style.position = position;
    header.style.left = '0';
    header.style.top = '0';
    header.style.width = '100%';
    header.style.height = '44px';
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'space-between';
    header.style.padding = '6px 12px';
    // match mini-player theme: semi-transparent dark background
    header.style.background = 'rgba(0,0,0,0.6)';
    header.style.color = 'white';
    header.style.zIndex = 200000;

  const left = document.createElement('div'); left.style.display = 'flex'; left.style.alignItems = 'center';
  const title = document.createElement('div'); title.textContent = titleText || 'Play'; title.style.fontWeight = '700'; title.style.marginRight = '12px';
    left.appendChild(title);

    const right = document.createElement('div'); right.style.display = 'flex'; right.style.gap = '8px';

    function make(btnText, cb) {
      const b = document.createElement('button');
      b.textContent = btnText;
      b.style.padding = '6px 8px';
      b.style.borderRadius = '6px';
      b.style.border = 'none';
      b.style.cursor = 'pointer';
      b.style.background = 'rgba(255,255,255,0.06)';
      b.style.color = 'white';
      b.addEventListener('click', cb);
      return b;
    }

    const fsBtn = make('⛶', onFullscreen);
    const statsBtn = make('Stats', onToggleStats);
    const newBtn = make('Open', onOpenNew);
    const closeBtn = make('Close', (e) => { try { if (typeof onClose === 'function') onClose(); } catch (err) {} });

    right.appendChild(fsBtn);
    right.appendChild(statsBtn);
    // showOpen controls whether 'Open' is shown (hide for fullscreen overlay per request)
    if (showOpen !== false) right.appendChild(newBtn);
    right.appendChild(closeBtn);

    header.appendChild(left);
    header.appendChild(right);
    return header;
  }

  mods[NAME] = { createHeader };
})();
