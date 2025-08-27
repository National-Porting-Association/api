// Dev panel UI (floating button + menu)
(function () {
    const NAME = 'ui.panel';
    const mods = (window.__builderModules = window.__builderModules || {});
    if (mods[NAME] && mods[NAME].initPanel) return;
    mods[NAME] = mods[NAME] || {};

    function initPanel(Builder) {
        (function injectUiFixes(){
            try{
                if (document.getElementById('builder-ui-fixes')) return;
                const style = document.createElement('style');
                style.id = 'builder-ui-fixes';
                style.textContent = `
button, a, [role="button"] { cursor: pointer !important; }
.builder-dev-btn, .builder-dev-menu, .builder-mini-header { pointer-events: auto !important; z-index: 300000 !important; }
.builder-dev-btn { z-index: 300001 !important; }
.builder-mini-resizer { cursor: nwse-resize !important; }
`;
                document.head.appendChild(style);
            }catch(e){}
        })();
        const modalMod = window.__builderModules['ui.modal'];
        const showModal = modalMod ? modalMod.showModal : (t) => alert(typeof t === 'string' ? t : JSON.stringify(t));

        function safeParseEmbedded(key) {
            try {
                return window.__embeddedData && (window.__embeddedData[key] || window.__embeddedData[key.toString()]);
            } catch (e) {
                return null;
            }
        }

        function makeBtn(text, cb, opts) {
            const b = document.createElement('button');
            b.textContent = text;
            b.style.display = 'block';
            b.style.width = '100%';
            b.style.padding = '8px';
            b.style.border = 'none';
            b.style.borderRadius = '6px';
            b.style.marginBottom = '6px';
            b.style.background = opts && opts.bg || '#222';
            b.style.color = 'white';
            b.style.cursor = 'pointer';
            b.addEventListener('click', (e) => {
                e.stopPropagation();
                cb(e);
            });
            return b;
        }

        const icon = window.__builderIconDataUrl || 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" rx="8" fill="#111"/><text x="50%" y="54%" font-size="20" text-anchor="middle" fill="#fff" font-family="Arial">B</text></svg>');
    const btn = document.createElement('button');
    btn.className = 'builder-dev-btn';
        btn.style.position = 'fixed';
        btn.style.left = '12px';
        btn.style.bottom = '12px';
        btn.style.width = '56px';
        btn.style.height = '56px';
        btn.style.borderRadius = '10px';
        btn.style.border = 'none';
        btn.style.padding = '4px';
        btn.style.background = 'rgba(0,0,0,0.6)';
        btn.style.cursor = 'pointer';
        btn.title = 'Open Builder dev menu (Ctrl+Shift+B)';
        btn.style.zIndex = 100000;
        const img = document.createElement('img');
        img.src = icon;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.display = 'block';
        img.style.borderRadius = '6px';
        btn.appendChild(img);

    const menu = document.createElement('div');
    menu.className = 'builder-dev-menu';
        menu.style.position = 'fixed';
        menu.style.left = '76px';
        menu.style.bottom = '12px';
        menu.style.minWidth = '260px';
        menu.style.background = 'rgba(12,12,12,0.98)';
        menu.style.color = 'white';
        menu.style.borderRadius = '8px';
        menu.style.padding = '10px';
        menu.style.boxShadow = '0 8px 30px rgba(0,0,0,0.45)';
        menu.style.display = 'none';
        menu.style.zIndex = 100000;

        const title = document.createElement('div');
        title.style.fontWeight = '700';
        title.style.marginBottom = '8px';
        title.textContent = 'Builder — Dev Menu';
        menu.appendChild(title);

        const cfg = safeParseEmbedded('data/config.json') || null;
        const summary = document.createElement('div');
        summary.style.fontSize = '12px';
        summary.style.marginBottom = '8px';
        summary.textContent = cfg ? ('apiBase: ' + (cfg.apiBase || '')) : 'No embedded config';
        menu.appendChild(summary);

        const openDocsBtn = makeBtn('Open Documentation', () => {
            try {
                window.open('https://npa.lol/docs', '_blank');
            } catch (e) {
                window.location.href = 'https://npa.lol/docs';
            }
            try {
                menu.style.display = 'none';
            } catch (e) {}
        }, {
            bg: '#2563eb'
        });
        menu.appendChild(openDocsBtn);

        const showFlags = makeBtn('Show Flags', () => {
            try {
                const flags = (window.__builderModules && window.__builderModules.flags) ? window.__builderModules.flags.parseFromScriptTag() : window.__builderFlags || {};
                showModal(flags);
            } catch (e) {
                showModal({
                    error: String(e)
                });
            }
        });
        menu.appendChild(showFlags);

        const embeddedListBtn = makeBtn('List Embedded Keys', () => {
            try {
                showModal(Object.keys(window.__embeddedData || {}));
            } catch (e) {
                showModal({
                    error: String(e)
                });
            }
        });
        menu.appendChild(embeddedListBtn);

        const previewGames = makeBtn('Preview games ', async () => {
            try {
                const net = await Builder.fetchGames('/data/games.json');
                showModal(net || 'No games returned from network');
                return;
            } catch (e) {
                const g = safeParseEmbedded('data/games.json') || safeParseEmbedded('data/games.sample.json');
                showModal(g || 'No embedded games found');
            }
        });
        menu.appendChild(previewGames);

        const miniPlayers = [];
        function createMiniPlayer(titleText) {
            const p = document.createElement('div');
            p.style.position = 'fixed';
            p.style.left = '76px';
            p.style.bottom = '84px';
            p.style.width = '420px';
            p.style.height = '300px';
            p.style.background = '#000';
            p.style.border = '1px solid rgba(255,255,255,0.06)';
            p.style.borderRadius = '8px';
            p.style.overflow = 'hidden';
            p.style.zIndex = 100001;

            const header = document.createElement('div');
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.alignItems = 'center';
            header.style.padding = '6px 8px';
            header.style.background = 'rgba(0,0,0,0.6)';
            header.style.color = 'white';
            header.className = 'builder-mini-header';
            header.style.cursor = 'move';
            header.style.zIndex = 100003;

            const title = document.createElement('div');
            title.textContent = titleText || 'Mini Player';
            title.style.fontSize = '12px';
            title.style.fontWeight = '600';

            const controls = document.createElement('div');
            controls.style.display = 'flex';
            controls.style.gap = '6px';

            const fsBtn = document.createElement('button');
            fsBtn.textContent = '⛶';
            fsBtn.title = 'Toggle window fullscreen';
            fsBtn.style.border = 'none';
            fsBtn.style.background = 'transparent';
            fsBtn.style.color = 'white';
            fsBtn.style.cursor = 'pointer';
            fsBtn.className = 'builder-mini-fs';

            const statsBtnMini = document.createElement('button');
            statsBtnMini.textContent = 'Stats';
            statsBtnMini.title = 'Toggle stats overlay';
            statsBtnMini.style.border = 'none';
            statsBtnMini.style.background = 'transparent';
            statsBtnMini.style.color = 'white';
            statsBtnMini.style.cursor = 'pointer';

            const close = document.createElement('button');
            close.textContent = '✕';
            close.style.border = 'none';
            close.style.background = 'transparent';
            close.style.color = 'white';
            close.style.cursor = 'pointer';
            close.addEventListener('click', () => {
                try { if (p._wm && p._wm.destroy) p._wm.destroy(); } catch (e) {}
                try { p.remove(); } catch (e) {}
                try { const idx = miniPlayers.indexOf(p); if (idx >= 0) miniPlayers.splice(idx, 1); } catch (e) {}
            });

            controls.appendChild(fsBtn);
            controls.appendChild(statsBtnMini);
            controls.appendChild(close);

            header.appendChild(title);
            header.appendChild(controls);

            const iframe = document.createElement('iframe');
            iframe.style.width = '100%';
            iframe.style.height = 'calc(100% - 36px)';
            iframe.style.border = 'none';

            p.appendChild(header);
            p.appendChild(iframe);
            p._iframe = iframe;
            const resizer = document.createElement('div');
            resizer.className = 'builder-mini-resizer';
            resizer.style.position = 'absolute';
            resizer.style.right = '6px';
            resizer.style.bottom = '6px';
            resizer.style.width = '12px';
            resizer.style.height = '12px';
            resizer.style.background = 'transparent';
            resizer.style.cursor = 'nwse-resize';
            resizer.style.borderRadius = '2px';
            p.appendChild(resizer);

            // resizer logic
            (function () {
                let dragging = false; let startX = 0, startY = 0, startW = 0, startH = 0;
                function onDown(e) {
                    e = e || window.event; dragging = true;
                    startX = e.touches ? e.touches[0].clientX : e.clientX;
                    startY = e.touches ? e.touches[0].clientY : e.clientY;
                    const rect = p.getBoundingClientRect(); startW = rect.width; startH = rect.height;
                    document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
                    document.addEventListener('touchmove', onMove, { passive: false }); document.addEventListener('touchend', onUp);
                    e.preventDefault && e.preventDefault();
                }
                function onMove(e) {
                    if (!dragging) return; const cx = e.touches ? e.touches[0].clientX : e.clientX; const cy = e.touches ? e.touches[0].clientY : e.clientY;
                    const dx = cx - startX; const dy = cy - startY; const nw = Math.max(200, Math.round(startW + dx)); const nh = Math.max(120, Math.round(startH + dy));
                    p.style.width = nw + 'px'; p.style.height = nh + 'px';
                }
                function onUp() { dragging = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); document.removeEventListener('touchmove', onMove); document.removeEventListener('touchend', onUp); }
                resizer.addEventListener('mousedown', onDown); resizer.addEventListener('touchstart', onDown, { passive: false });
            })();
            return p;
        }

    const playInPanelBtn = makeBtn('Play in panel', async () => {
            try {
                let data = null;
                try { data = await Builder.fetchGames('/data/games.json'); } catch (e) { data = safeParseEmbedded('data/games.json') || safeParseEmbedded('data/games.sample.json'); }
                let first = null;
                if (Array.isArray(data)) first = data[0];
                else if (data && data.games) first = data.games[0];
                let url = first && (first.playUrl || first.url || first.play);
                if (!url) { showModal('No playUrl found for first game'); return; }
                try {
                    const isAbs = typeof url === 'string' && /^(https?:)?\/\//.test(url);
                    if (!isAbs) {
                        const cfg = safeParseEmbedded('data/config.json') || {};
                        const apiBase = (cfg && cfg.apiBase) || (window.__builderFlags && window.__builderFlags.apiBase) || '';
                        if (apiBase) url = apiBase.replace(/\/+$/, '') + '/' + (String(url).replace(/^\/+/, ''));
                    }
                } catch (e) {}
                const titleText = (first && (first.title || first.name || first.id)) ? (first.title || first.name || String(first.id)) : 'Mini Player';
                const p = createMiniPlayer(titleText);
                try { document.body.appendChild(p); } catch (e) {}
                try {
                    const headerEl = p.querySelector && p.querySelector('.builder-mini-header');
                    const fsEl = p.querySelector && p.querySelector('.builder-mini-fs');
                    if (window.WindowManager && window.WindowManager.registerWindow) {
                        const reg = window.WindowManager.registerWindow(p, { handle: headerEl || p, left: p.style.left, top: p.style.top, width: p.style.width, height: p.style.height });
                        p._wm = reg;
                        if (fsEl && typeof reg.toggleFullscreen === 'function') fsEl.addEventListener('click', (ev) => { ev.stopPropagation(); try { reg.toggleFullscreen(); } catch (e) {} });
                        try {
                            const statsMod = window.__builderModules && window.__builderModules['stats'];
                            const btn = p.querySelector && p.querySelector('button[title="Toggle stats overlay"]');
                            if (btn) btn.addEventListener('click', (ev) => {
                                ev.stopPropagation();
                                try {
                                    if (!statsMod) return;
                                    if (statsMod.isRunning()) statsMod.stop(); else statsMod.start();
                                } catch (e) {}
                            });
                        } catch (e) {}
                    } else {
                        (function () {
                            function makeDraggableLocal(el, handle) {
                                if (!el || !handle) return () => {};
                                handle.style.cursor = 'move';
                                let dragging = false; let startX = 0, startY = 0, origX = 0, origY = 0;
                                function onDown(e) { e = e || window.event; dragging = true; startX = (e.touches ? e.touches[0].clientX : e.clientX); startY = (e.touches ? e.touches[0].clientY : e.clientY); const rect = el.getBoundingClientRect(); origX = rect.left; origY = rect.top; document.addEventListener('mousemove', onMove); document.addEventListener('touchmove', onMove, { passive: false }); document.addEventListener('mouseup', onUp); document.addEventListener('touchend', onUp); e.preventDefault && e.preventDefault(); }
                                function onMove(e) { if (!dragging) return; const cx = (e.touches ? e.touches[0].clientX : e.clientX); const cy = (e.touches ? e.touches[0].clientY : e.clientY); const dx = cx - startX; const dy = cy - startY; try { el.style.left = Math.max(0, Math.round(origX + dx)) + 'px'; el.style.top = Math.max(0, Math.round(origY + dy)) + 'px'; el.style.right = 'auto'; el.style.bottom = 'auto'; } catch (err) {} e.preventDefault && e.preventDefault(); }
                                function onUp() { dragging = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('touchmove', onMove); document.removeEventListener('mouseup', onUp); document.removeEventListener('touchend', onUp); }
                                handle.addEventListener('mousedown', onDown); handle.addEventListener('touchstart', onDown, { passive: false });
                                return function destroy() { handle.removeEventListener('mousedown', onDown); handle.removeEventListener('touchstart', onDown); onUp(); };
                            }
                            let localState = {}; let localIsFs = false;
                            function toggleLocalFs() { try { if (!localIsFs) { localState.left = p.style.left; localState.top = p.style.top; localState.width = p.style.width; localState.height = p.style.height; localState.position = p.style.position; localState.zIndex = p.style.zIndex; p.style.left = '0'; p.style.top = '0'; p.style.width = '100vw'; p.style.height = '100vh'; p.style.position = 'fixed'; p.style.zIndex = 200000; p.__local_full = true; } else { p.style.left = localState.left || ''; p.style.top = localState.top || ''; p.style.width = localState.width || ''; p.style.height = localState.height || ''; p.style.position = localState.position || 'fixed'; p.style.zIndex = localState.zIndex || 100001; p.__local_full = false; } } catch (e) {} localIsFs = !localIsFs; return localIsFs; }
                            const destroyLocal = makeDraggableLocal(p, headerEl || p);
                            p._wm = { destroy: destroyLocal, toggleFullscreen: toggleLocalFs, isFullscreen: () => !!p.__local_full };
                            if (fsEl) fsEl.addEventListener('click', (ev) => { ev.stopPropagation(); try { p._wm.toggleFullscreen(); } catch (e) {} });
                            try {
                                const statsMod = window.__builderModules && window.__builderModules['stats'];
                                const btn = p.querySelector && p.querySelector('button[title="Toggle stats overlay"]');
                                if (btn) btn.addEventListener('click', (ev) => {
                                    ev.stopPropagation();
                                    try {
                                        if (!statsMod) return;
                                        if (statsMod.isRunning()) statsMod.stop(); else statsMod.start();
                                    } catch (e) {}
                                });
                            } catch (e) {}
                        })();
                    }
                } catch (e) {}
                p._iframe.src = url;
                miniPlayers.push(p);
            } catch (e) { showModal({ error: String(e) }); }
        });
        menu.appendChild(playInPanelBtn);

        mods[NAME].openMiniPlayer = async function (arg) {
            try {
                let url = null;
                let titleText = 'Mini Player';
                if (!arg) {
                    let data = null;
                    try { data = await Builder.fetchGames('/data/games.json'); } catch (e) { data = safeParseEmbedded('data/games.json') || safeParseEmbedded('data/games.sample.json'); }
                    let first = null;
                    if (Array.isArray(data)) first = data[0];
                    else if (data && data.games) first = data.games[0];
                    if (!first) throw new Error('No games available');
                    url = first.playUrl || first.url || first.play;
                    titleText = (first && (first.title || first.name || first.id)) ? (first.title || first.name || String(first.id)) : titleText;
                } else if (typeof arg === 'string') {
                    const isAbs = /^(https?:)?\/\//.test(arg);
                    if (isAbs) {
                        url = arg;
                    } else {
                        let data = null;
                        try { data = await Builder.fetchGames('/data/games.json'); } catch (e) { data = safeParseEmbedded('data/games.json') || safeParseEmbedded('data/games.sample.json'); }
                        let found = null;
                        if (Array.isArray(data)) found = data.find(g => String(g.id) === arg || String(g.slug) === arg || String(g.name) === arg || String(g.title) === arg);
                        else if (data && data.games) found = data.games.find(g => String(g.id) === arg || String(g.slug) === arg || String(g.name) === arg || String(g.title) === arg);
                        if (found) {
                            url = found.playUrl || found.url || found.play;
                            titleText = (found && (found.title || found.name || found.id)) ? (found.title || found.name || String(found.id)) : titleText;
                        } else {
                            url = arg;
                        }
                    }
                } else if (typeof arg === 'object' && arg !== null) {
                    url = arg.playUrl || arg.url || arg.play || null;
                    titleText = arg.title || arg.name || titleText;
                }

                if (!url) throw new Error('No playable url resolved');
                try {
                    const isAbs = typeof url === 'string' && /^(https?:)?\/\//.test(url);
                    if (!isAbs) {
                        const cfg = safeParseEmbedded('data/config.json') || {};
                        const apiBase = (cfg && cfg.apiBase) || (window.__builderFlags && window.__builderFlags.apiBase) || '';
                        if (apiBase) url = apiBase.replace(/\/+$/, '') + '/' + (String(url).replace(/^\/+/, ''));
                    }
                } catch (e) {}

                const p = createMiniPlayer(titleText);
                try { document.body.appendChild(p); } catch (e) {}
                try {
                    const headerEl = p.querySelector && p.querySelector('.builder-mini-header');
                    const fsEl = p.querySelector && p.querySelector('.builder-mini-fs');
                    if (window.WindowManager && window.WindowManager.registerWindow) {
                        const reg = window.WindowManager.registerWindow(p, { handle: headerEl || p, left: p.style.left, top: p.style.top, width: p.style.width, height: p.style.height });
                        p._wm = reg;
                        if (fsEl && typeof reg.toggleFullscreen === 'function') fsEl.addEventListener('click', (ev) => { ev.stopPropagation(); try { reg.toggleFullscreen(); } catch (e) {} });
                        try {
                            const statsMod = window.__builderModules && window.__builderModules['stats'];
                            const btn = p.querySelector && p.querySelector('button[title="Toggle stats overlay"]');
                            if (btn) btn.addEventListener('click', (ev) => {
                                ev.stopPropagation();
                                try {
                                    if (!statsMod) return;
                                    if (statsMod.isRunning()) statsMod.stop(); else statsMod.start();
                                } catch (e) {}
                            });
                        } catch (e) {}
                    } else {
                        (function () {
                            function makeDraggableLocal(el, handle) {
                                if (!el || !handle) return () => {};
                                handle.style.cursor = 'move';
                                let dragging = false; let startX = 0, startY = 0, origX = 0, origY = 0;
                                function onDown(e) { e = e || window.event; dragging = true; startX = (e.touches ? e.touches[0].clientX : e.clientX); startY = (e.touches ? e.touches[0].clientY : e.clientY); const rect = el.getBoundingClientRect(); origX = rect.left; origY = rect.top; document.addEventListener('mousemove', onMove); document.addEventListener('touchmove', onMove, { passive: false }); document.addEventListener('mouseup', onUp); document.addEventListener('touchend', onUp); e.preventDefault && e.preventDefault(); }
                                function onMove(e) { if (!dragging) return; const cx = (e.touches ? e.touches[0].clientX : e.clientX); const cy = (e.touches ? e.touches[0].clientY : e.clientY); const dx = cx - startX; const dy = cy - startY; try { el.style.left = Math.max(0, Math.round(origX + dx)) + 'px'; el.style.top = Math.max(0, Math.round(origY + dy)) + 'px'; el.style.right = 'auto'; el.style.bottom = 'auto'; } catch (err) {} e.preventDefault && e.preventDefault(); }
                                function onUp() { dragging = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('touchmove', onMove); document.removeEventListener('mouseup', onUp); document.removeEventListener('touchend', onUp); }
                                handle.addEventListener('mousedown', onDown); handle.addEventListener('touchstart', onDown, { passive: false });
                                return function destroy() { handle.removeEventListener('mousedown', onDown); handle.removeEventListener('touchstart', onDown); onUp(); };
                            }
                            let localState = {}; let localIsFs = false;
                            function toggleLocalFs() { try { if (!localIsFs) { localState.left = p.style.left; localState.top = p.style.top; localState.width = p.style.width; localState.height = p.style.height; localState.position = p.style.position; localState.zIndex = p.style.zIndex; p.style.left = '0'; p.style.top = '0'; p.style.width = '100vw'; p.style.height = '100vh'; p.style.position = 'fixed'; p.style.zIndex = 200000; p.__local_full = true; } else { p.style.left = localState.left || ''; p.style.top = localState.top || ''; p.style.width = localState.width || ''; p.style.height = localState.height || ''; p.style.position = localState.position || 'fixed'; p.style.zIndex = localState.zIndex || 100001; p.__local_full = false; } } catch (e) {} localIsFs = !localIsFs; return localIsFs; }
                            const destroyLocal = makeDraggableLocal(p, headerEl || p);
                            p._wm = { destroy: destroyLocal, toggleFullscreen: toggleLocalFs, isFullscreen: () => !!p.__local_full };
                            if (fsEl) fsEl.addEventListener('click', (ev) => { ev.stopPropagation(); try { p._wm.toggleFullscreen(); } catch (e) {} });
                            try {
                                const statsMod = window.__builderModules && window.__builderModules['stats'];
                                const btn = p.querySelector && p.querySelector('button[title="Toggle stats overlay"]');
                                if (btn) btn.addEventListener('click', (ev) => {
                                    ev.stopPropagation();
                                    try {
                                        if (!statsMod) return;
                                        if (statsMod.isRunning()) statsMod.stop(); else statsMod.start();
                                    } catch (e) {}
                                });
                            } catch (e) {}
                        })();
                    }
                } catch (e) {}
                p._iframe.src = url;
                miniPlayers.push(p);
                return p;
            } catch (err) {
                try { showModal({ error: String(err) }); } catch (e) {}
                return null;
            }
        };

        const fullscreenPlayerBtn = makeBtn('Fullscreen player', async () => {
            try {
                // open first game using Play.open by id or url
                let data = null;
                try { data = await Builder.fetchGames('/data/games.json'); } catch (e) { data = safeParseEmbedded('data/games.json') || safeParseEmbedded('data/games.sample.json'); }
                let first = null;
                if (Array.isArray(data)) first = data[0];
                else if (data && data.games) first = data.games[0];
                if (!first) { showModal('No games available'); return; }
                const id = first.id != null ? String(first.id) : null;
                const ok = id ? await (window.Play && window.Play.open ? window.Play.open(id) : false) : false;
                if (!ok) {
                    const url = first.playUrl || first.url || first.play;
                    if (!url) { showModal('No playable url found for first game'); return; }
                    if (window.Play && window.Play.open) await window.Play.open(url);
                    else window.open(url, '_blank');
                }
                try { menu.style.display = 'none'; } catch (e) {}
            } catch (e) { showModal({ error: String(e) }); }
        }, { bg: '#111827' });
        menu.appendChild(fullscreenPlayerBtn);

        const copyGames = makeBtn('Copy games JSON ', async () => {
            try {
                const net = await Builder.fetchGames('/data/games.json');
                const txt = JSON.stringify(net, null, 2);
                if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(txt);
                else {
                    const ta = document.createElement('textarea');
                    ta.value = txt;
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    ta.remove();
                }
                showModal({
                    ok: true,
                    note: 'Copied network response'
                });
                return;
            } catch (e) {
                const ok = (function () {
                    try {
                        const v = safeParseEmbedded('data/games.json') || safeParseEmbedded('data/games.sample.json');
                        if (!v) return false;
                        const t = typeof v === 'string' ? v : JSON.stringify(v, null, 2);
                        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).catch(() => {});
                        else {
                            const ta = document.createElement('textarea');
                            ta.value = t;
                            document.body.appendChild(ta);
                            ta.select();
                            document.execCommand('copy');
                            ta.remove();
                        }
                        return true;
                    } catch (e) {
                        return false;
                    }
                })();
                showModal({
                    ok: !!ok,
                    note: 'Copied embedded fallback'
                });
            }
        });
        menu.appendChild(copyGames);

        const downloadGames = makeBtn('Download games JSON ', async () => {
            try {
                const net = await Builder.fetchGames('/data/games.json');
                const blob = new Blob([JSON.stringify(net, null, 2)], {
                    type: 'application/json'
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'games.json';
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => URL.revokeObjectURL(url), 5000);
                showModal({
                    ok: true,
                    note: 'Downloaded network response'
                });
                return;
            } catch (e) {
                const v = safeParseEmbedded('data/games.json') || safeParseEmbedded('data/games.sample.json');
                if (v) {
                    const blob = new Blob([typeof v === 'string' ? v : JSON.stringify(v, null, 2)], {
                        type: 'application/json'
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'games.json';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    setTimeout(() => URL.revokeObjectURL(url), 5000);
                    showModal({
                        ok: true,
                        note: 'Downloaded embedded fallback'
                    });
                } else showModal({
                    ok: false,
                    note: 'No embedded fallback'
                });
            }
        });
        menu.appendChild(downloadGames);

        const fetchTest = makeBtn('Fetch games ', async () => {
            try {
                const res = await Builder.fetchGames('/data/games.json');
                showModal({
                    ok: true,
                    count: Array.isArray(res) ? res.length : 'unknown'
                });
            } catch (e) {
                showModal({
                    ok: false,
                    error: String(e)
                });
            }
        });
        menu.appendChild(fetchTest);

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        });

        function ensureAttachedPanel() {
            try {
                try {
                    const hide = (window.Builder && typeof window.Builder.getFlag === 'function')
                        ? !!window.Builder.getFlag('hideDevButton')
                        : !!(window.__builderFlags && window.__builderFlags.hideDevButton);
                    if (hide) {
                        try { if (document.body.contains(menu)) menu.remove(); } catch (e) {}
                        try { if (document.body.contains(btn)) btn.remove(); } catch (e) {}
                        return;
                    }
                } catch (e) {}
                if (!document.body.contains(btn)) document.body.appendChild(btn);
                if (!document.body.contains(menu)) document.body.appendChild(menu);
            } catch (e) {}
        }
        if (document.readyState === 'complete' || document.readyState === 'interactive') ensureAttachedPanel();
        else document.addEventListener('DOMContentLoaded', ensureAttachedPanel);

        document.addEventListener('click', (e) => {
            if (!btn.contains(e.target) && !menu.contains(e.target)) {
                menu.style.display = 'none';
            }
        });
        document.addEventListener('keydown', (ev) => {
            try {
                if (ev.ctrlKey && ev.shiftKey && (ev.key === 'B' || ev.key === 'b')) {
                    ev.preventDefault();
                    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
                }
            } catch (e) {}
        });
    }
    mods[NAME] = Object.assign(mods[NAME] || {}, {
        initPanel
    });
})();
