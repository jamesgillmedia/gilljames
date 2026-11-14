/* Debug panel. Off unless the URL has ?debug=1 (remembered for this tab; ?debug=0 clears it).
 The readout only reads __u1 / GJ_DEPTH. Tune writes through GJ_TUNE, and only while this panel is on. */
(function () {
  var on = false, q = /[?&]debug=([^&]*)/.exec(location.search);
  try {
    if (q) { if (q[1] === '0') sessionStorage.removeItem('gjdbg'); else sessionStorage.setItem('gjdbg', '1'); }
    on = !!sessionStorage.getItem('gjdbg');
  } catch (e) { on = !!q && q[1] !== '0'; }
  if (!on) return;

  var css = '#gjdbg{position:fixed;z-index:70;right:0;bottom:0;pointer-events:none;font:300 11px/1.4 Poppins,system-ui,sans-serif;color:#dfe8f2}' +
    '#gjdbg .tab{position:fixed;right:8px;bottom:max(8px,env(safe-area-inset-bottom));width:30px;height:30px;border-radius:50%;pointer-events:auto;cursor:pointer;border:1px solid rgba(255,255,255,.28);background:rgba(10,16,24,.28);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:#cfe0f2;font:400 10px/28px "Julius Sans One",Poppins,sans-serif;text-align:center;transition:opacity .25s ease-out}' +
    '#gjdbg.open .tab{opacity:0;pointer-events:none}' +
    '#gjdbg .sheet{position:fixed;overflow:auto;overscroll-behavior:contain;background:rgba(10,16,24,.5);-webkit-backdrop-filter:blur(12px) saturate(1.1);backdrop-filter:blur(12px) saturate(1.1);border:1px solid rgba(255,255,255,.14);border-radius:14px;padding:10px 12px 12px;left:8px;right:8px;bottom:max(8px,env(safe-area-inset-bottom));max-height:72vh;transform:translateY(calc(100% + 24px));opacity:0;pointer-events:none;transition:transform .25s ease-out,opacity .25s ease-out}' +
    '#gjdbg.open .sheet{transform:none;opacity:1;pointer-events:auto}' +
    '@media (orientation:landscape) and (min-width:560px){#gjdbg .sheet{left:auto;right:max(8px,env(safe-area-inset-right));width:min(330px,42vw);max-height:80vh;transform:translateX(calc(100% + 24px))}}' +
    '#gjdbg h4{margin:0 0 6px;font:400 10px "Julius Sans One",Poppins,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#9fb6cc}' +
    '#gjdbg .r{display:flex;justify-content:space-between;gap:10px;padding:2px 0;border-bottom:1px solid rgba(255,255,255,.07)}' +
    '#gjdbg .r b{font-weight:300;color:#9fb6cc}#gjdbg .r span{text-align:right;word-break:break-word}' +
    '#gjdbg .tune{margin-top:12px}' +
    '#gjdbg label.sl{display:block;margin:0 0 8px;color:#9fb6cc;font-size:10px;letter-spacing:.03em}' +
    '#gjdbg label.sl b{float:right;color:#dfe8f2;font-weight:300}' +
    '#gjdbg label.sl input{display:block;width:100%;margin:4px 0 0;accent-color:#e8e4dc}' +
    '#gjdbg .acts{display:flex;gap:8px;margin-top:4px}' +
    '#gjdbg .acts button{flex:1;height:36px;border-radius:18px;border:1px solid rgba(255,255,255,.18);background:transparent;color:#dfe8f2;font:300 11px Poppins,sans-serif;letter-spacing:.04em}' +
    '#gjdbg a.go{display:block;margin-top:10px;padding:9px 12px;text-align:center;border-radius:16px;border:1px solid rgba(232,228,220,.55);color:#e8e4dc;text-decoration:none;background:rgba(232,228,220,.1);letter-spacing:.08em}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var root = document.createElement('div'); root.id = 'gjdbg';
  root.innerHTML = '<div class="tab" role="button" aria-label="debug">dbg</div><div class="sheet"><h4>m4 debug</h4><div id="gjdbgrows"></div><div class="tune"><h4>tune</h4><div id="gjdbgtune"></div><div class="acts"><button type="button" id="gjdbgcopy">copy values</button><button type="button" id="gjdbgreset">reset</button></div></div><a class="go" href="_versions/">builds</a></div>';
  document.body.appendChild(root);
  ['pointerdown', 'pointermove', 'touchstart', 'touchmove', 'mousedown', 'wheel', 'click'].forEach(function (t) {
    root.addEventListener(t, function (e) { e.stopPropagation(); });
  });

  var tab = root.querySelector('.tab'), rows = document.getElementById('gjdbgrows'), tm = 0, open = false, hold = 0;
  function arm() { clearTimeout(tm); tm = 0; if (open && hold === 0) tm = setTimeout(function () { set(false); }, 8000); }
  function set(v) { open = v; root.classList.toggle('open', v); if (!v) hold = 0; arm(); }
  tab.addEventListener('click', function () { set(true); });
  document.addEventListener('pointerdown', function (e) { if (open && !root.contains(e.target)) set(false); }, true);
  root.querySelector('.sheet').addEventListener('pointerdown', function () { hold++; clearTimeout(tm); tm = 0; });
  function release() { if (hold > 0) hold--; arm(); }
  window.addEventListener('pointerup', release, true);
  window.addEventListener('pointercancel', release, true);

  var SPECS = [
    { k: 'map', name: 'Constellation spread', min: 0.7, max: 1.8, step: 0.01, fmt: function (v) { return (+v).toFixed(2) + '\u00d7'; } },
    { k: 'stars', name: 'Star spread', min: 0.7, max: 1.8, step: 0.01, fmt: function (v) { return (+v).toFixed(2) + '\u00d7'; } },
    { k: 'lineA', name: 'Line opacity', min: 0.2, max: 1.8, step: 0.01, fmt: function (v) { return (+v).toFixed(2) + '\u00d7'; } },
    { k: 'lineW', name: 'Line width', min: 0.5, max: 3.5, step: 0.05, fmt: function (v) { return (+v).toFixed(2) + '\u00d7'; } },
    { k: 'starS', name: 'Star size', min: 0.5, max: 2.4, step: 0.01, fmt: function (v) { return (+v).toFixed(2) + '\u00d7'; } },
    { k: 'starG', name: 'Star glow', min: 0.4, max: 2.4, step: 0.01, fmt: function (v) { return (+v).toFixed(2) + '\u00d7'; } },
    { k: 'pinch', name: 'Pinch depth', min: 0.4, max: 2.2, step: 0.01, fmt: function (v) { return (+v).toFixed(2) + '\u00d7'; } },
    { k: 'far', name: 'Far zoom', min: 0.6, max: 1.8, step: 0.01, fmt: function (v) { return (+v).toFixed(2) + '\u00d7'; } },
    { k: 'mid', name: 'Mid zoom', min: 0.6, max: 1.8, step: 0.01, fmt: function (v) { return (+v).toFixed(2) + '\u00d7'; } },
    { k: 'board', name: 'Board zoom', min: 0.6, max: 1.8, step: 0.01, fmt: function (v) { return (+v).toFixed(2) + '\u00d7'; } },
    { k: 'delay', name: 'Open delay', min: 0.45, max: 2.2, step: 0.01, fmt: function (v) { return Math.round(1250 * v) + ' ms'; } },
    { k: 'open', name: 'Mark duration', min: 0.45, max: 2.2, step: 0.01, fmt: function (v) { return Math.round(1100 * v) + ' ms'; } },
    { k: 'fade', name: 'Sky fade', min: 0.45, max: 2.2, step: 0.01, fmt: function (v) { return Math.round(1680 * v) + ' ms'; } },
    { k: 'flash', name: 'Flash', min: 0, max: 1, step: 0.01, fmt: function (v) { return Math.round(v * 100) + '%'; } }
  ];
  var TKEY = 'gj-m4-tune';
  function tune() { return window.GJ_TUNE || null; }
  function readSaved() { try { var raw = sessionStorage.getItem(TKEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } }
  function persist() { var t = tune(); if (!t) return; try { sessionStorage.setItem(TKEY, JSON.stringify(t.values())); } catch (e) {} }
  function show(spec, v) { return spec.fmt ? spec.fmt(v) : (+v).toFixed(2) + '\u00d7'; }
  function syncSliders() {
    if (hold > 0) return;
    var t = tune(), vals = t ? t.values() : {};
    SPECS.forEach(function (spec) {
      var input = root.querySelector('input[data-k="' + spec.k + '"]');
      if (!input) return;
      var v = vals[spec.k];
      if (v == null) v = (t && t.defaults && t.defaults()[spec.k]) || +input.defaultValue;
      input.value = v;
      var b = input.parentNode.querySelector('b');
      if (b) b.textContent = show(spec, input.value);
    });
  }
  var saved = readSaved();
  if (saved && tune()) tune().set(saved);
  var box = document.getElementById('gjdbgtune');
  SPECS.forEach(function (spec) {
    var lab = document.createElement('label'); lab.className = 'sl';
    lab.appendChild(document.createTextNode(spec.name + ' '));
    var b = document.createElement('b'); lab.appendChild(b);
    var input = document.createElement('input');
    input.type = 'range'; input.min = spec.min; input.max = spec.max; input.step = spec.step;
    input.setAttribute('data-k', spec.k); input.setAttribute('aria-label', spec.name);
    input.addEventListener('input', function () {
      var t = tune(); if (!t) return;
      var patch = {}; patch[spec.k] = parseFloat(input.value);
      t.set(patch); b.textContent = show(spec, input.value); persist();
    });
    lab.appendChild(input); box.appendChild(lab);
  });
  syncSliders();
  var copyBtn = document.getElementById('gjdbgcopy');
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;left:-999px;top:0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    ta.remove();
  }
  copyBtn.addEventListener('click', function () {
    var text = tune() ? JSON.stringify(tune().values(), null, 2) : '{}';
    var done = function () { copyBtn.textContent = 'copied'; setTimeout(function () { copyBtn.textContent = 'copy values'; }, 1200); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    else { fallbackCopy(text); done(); }
  });
  document.getElementById('gjdbgreset').addEventListener('click', function () {
    if (tune()) tune().reset();
    try { sessionStorage.removeItem(TKEY); } catch (e) {}
    syncSliders();
  });

  var frames = 0, fps = 0, last = performance.now(), ft = 0;
  (function loop(t) { frames++; ft = t - (loop.p || t); loop.p = t; if (t - last > 500) { fps = frames * 1000 / (t - last); frames = 0; last = t; if (open) paint(); } requestAnimationFrame(loop); })(performance.now());

  function row(k, v) { return '<div class="r"><b>' + k + '</b><span>' + v + '</span></div>'; }
  function paint() {
    var u = window.__u1 || {}, d = {}, h = '';
    try { d = (window.GJ_DEPTH && GJ_DEPTH.state && GJ_DEPTH.state()) || {}; } catch (e) {}
    function pick(o, k) { try { var v = typeof o[k] === 'function' ? o[k]() : o[k]; return v == null ? '-' : (typeof v === 'object' ? JSON.stringify(v).slice(0, 80) : v); } catch (e) { return '-'; } }
    ['phase', 'cur', 'step', 'sel', 'ready'].forEach(function (k) { if (k in u) h += row(k, pick(u, k)); });
    Object.keys(d).slice(0, 14).forEach(function (k) { h += row('depth.' + k, pick(d, k)); });
    h += row('fps', fps.toFixed(0) + ' / ' + ft.toFixed(1) + ' ms');
    h += row('viewport', innerWidth + ' x ' + innerHeight + ' @' + (devicePixelRatio || 1));
    h += row('reduce motion', matchMedia('(prefers-reduced-motion: reduce)').matches ? 'on' : 'off');
    h += row('history', history.length);
    rows.innerHTML = h;
    syncSliders();
  }
  paint();
  new MutationObserver(function () { if (open) paint(); }).observe(root, { attributes: true, attributeFilter: ['class'] });
})();
