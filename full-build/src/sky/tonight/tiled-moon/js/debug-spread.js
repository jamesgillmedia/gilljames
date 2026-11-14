/* Debug panel for the tiled moon-and-water copy. Hidden unless ?debug=1 (tiled-moon-v3).
 ?debug=0 hides it for this tab; ?debug=1 turns it back on. Tune writes through __sheet.tune only. */
(function () {
  var q = /[?&]debug=([^&]*)/.exec(location.search);
  /* tiled-moon-v3: hidden by default; ?debug=1 turns the panel (and the ripple compare switch) on for this tab, ?debug=0 off */
  var on = false;
  try {
    if (q) { on = q[1] === '1'; sessionStorage.setItem('gjdbg', on ? '1' : '0'); }
    else on = sessionStorage.getItem('gjdbg') === '1';
  } catch (e) { on = !!(q && q[1] === '1'); }
  if (!on) return;
  document.documentElement.classList.add('gjdbg-on');

  var css = '#gjdbg{position:fixed;z-index:80;right:0;bottom:0;pointer-events:none;font:300 11px/1.4 Poppins,system-ui,sans-serif;color:#dfe8f2}' +
    '#gjdbg .tab{position:fixed;right:8px;bottom:calc(var(--dock, 104px) + var(--sb, env(safe-area-inset-bottom, 0px)) + 8px);min-width:44px;min-height:44px;padding:0;border-radius:22px;pointer-events:auto;cursor:pointer;border:1px solid rgba(255,255,255,.28);background:rgba(10,16,24,.45);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:#cfe0f2;font:400 11px/44px "Julius Sans One",Poppins,sans-serif;letter-spacing:.12em;text-align:center;transition:opacity .25s ease-out}' +
    '#gjdbg.open .tab{opacity:0;pointer-events:none}' +
    '#gjdbg .pane{position:fixed;overflow:auto;overscroll-behavior:contain;height:auto;background:rgba(10,16,24,.62);-webkit-backdrop-filter:blur(12px) saturate(1.1);backdrop-filter:blur(12px) saturate(1.1);border:1px solid rgba(255,255,255,.14);border-radius:14px;padding:12px 14px 14px;left:8px;right:8px;bottom:calc(var(--dock, 104px) + var(--sb, env(safe-area-inset-bottom, 0px)) + 8px);max-height:min(52vh, 360px);transform:translateY(calc(100% + 24px));opacity:0;pointer-events:none;transition:transform .25s ease-out,opacity .25s ease-out}' +
    '#gjdbg.open .pane{transform:none;opacity:1;pointer-events:auto}' +
    '@media (orientation:landscape) and (min-width:560px){#gjdbg .pane{left:auto;right:max(8px,env(safe-area-inset-right));width:min(330px,42vw);max-height:calc(100dvh - var(--dock, 104px) - var(--sb, env(safe-area-inset-bottom, 0px)) - 16px);transform:translateX(calc(100% + 24px))}}' +
    '@media (orientation:landscape) and (max-height:500px){#gjdbg .pane{padding:8px 12px 10px}#gjdbg h4{margin:0 0 4px}#gjdbg label.gjrow{margin:0 0 4px}#gjdbg label.gjrow input{height:28px;margin:3px 0 0}#gjdbg .gjacts button{min-height:40px}#gjdbg .gjnote{display:none}}' +
    '#gjdbg h4{margin:0 0 8px;font:400 10px "Julius Sans One",Poppins,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#9fb6cc}' +
    '#gjdbg label.gjrow{display:block;position:relative;float:none;margin:0 0 10px;color:#9fb6cc;font-size:10px;letter-spacing:.03em;width:100%;box-sizing:border-box}' +
    '#gjdbg label.gjrow b{float:right;color:#dfe8f2;font-weight:300}' +
    '#gjdbg label.gjrow input{display:block;width:100%;height:32px;margin:6px 0 0;accent-color:#55DAA1}' +
    '#gjdbg .gjacts{display:flex;gap:8px;margin-top:6px}' +
    '#gjdbg .gjacts button{flex:1;min-height:44px;border-radius:22px;border:1px solid rgba(255,255,255,.18);background:transparent;color:#dfe8f2;font:300 11px Poppins,sans-serif;letter-spacing:.04em}' +
    '#gjdbg .gjnote{margin:8px 0 0;font-size:10px;color:#8aa0b4;letter-spacing:.02em}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var root = document.createElement('div'); root.id = 'gjdbg';
  root.innerHTML = '<button type="button" class="tab" aria-expanded="false" aria-controls="gjdbgpane" aria-label="debug">dbg</button>' +
    '<div class="pane" id="gjdbgpane" role="dialog" aria-label="constellation tune">' +
    '<h4>constellation</h4>' +
    '<div class="gjtune" id="gjdbgtune"></div>' +
    '<div class="gjacts"><button type="button" id="gjdbgcopy">copy values</button><button type="button" id="gjdbgreset">reset</button></div>' +
    '<p class="gjnote">star count, spread and depth of the sky at the bottom. pinch still only moves when you do.</p>' +
    '</div>';
  document.body.appendChild(root);
  ['pointerdown', 'pointermove', 'touchstart', 'touchmove', 'mousedown', 'wheel', 'click'].forEach(function (t) {
    root.addEventListener(t, function (e) { e.stopPropagation(); });
  });

  var tab = root.querySelector('.tab'), open = false, hold = 0, tm = 0;
  function arm() { clearTimeout(tm); tm = 0; if (open && hold === 0) tm = setTimeout(function () { set(false); }, 12000); }
  function set(v) { open = v; root.classList.toggle('open', v); tab.setAttribute('aria-expanded', String(v)); if (!v) hold = 0; arm(); }
  tab.addEventListener('click', function () { set(!open); });
  document.addEventListener('pointerdown', function (e) { if (open && !root.contains(e.target)) set(false); }, true);
  root.querySelector('.pane').addEventListener('pointerdown', function () { hold++; clearTimeout(tm); tm = 0; });
  function release() { if (hold > 0) hold--; arm(); }
  window.addEventListener('pointerup', release, true);
  window.addEventListener('pointercancel', release, true);

  var SPECS = [
    { k: 'stars', name: 'Star count', min: 0.15, max: 2.5, step: 0.01, fmt: function (v) { return Math.round(1160 * v) + '  (' + (+v).toFixed(2) + '\u00d7)'; } },
    { k: 'spread', name: 'Spread', min: 0.55, max: 1.8, step: 0.01, fmt: function (v) { return (+v).toFixed(2) + '\u00d7'; } },
    { k: 'depth', name: 'Depth', min: 0.25, max: 2.2, step: 0.01, fmt: function (v) { return (+v).toFixed(2) + '\u00d7'; } }
  ];
  var TKEY = 'gj-tiled-moon-tune';
  function api() { return window.__sheet && window.__sheet.tune; }
  function readSaved() { try { var raw = sessionStorage.getItem(TKEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } }
  function persist(vals) { try { sessionStorage.setItem(TKEY, JSON.stringify(vals)); } catch (e) {} }
  function show(spec, v) { return spec.fmt ? spec.fmt(v) : (+v).toFixed(2) + '\u00d7'; }

  var box = document.getElementById('gjdbgtune');
  SPECS.forEach(function (spec) {
    var lab = document.createElement('label'); lab.className = 'gjrow';
    lab.innerHTML = spec.name + ' <b></b>';
    var input = document.createElement('input');
    input.type = 'range'; input.min = spec.min; input.max = spec.max; input.step = spec.step;
    input.value = 1; input.dataset.k = spec.k; input.setAttribute('aria-label', spec.name);
    lab.appendChild(input); box.appendChild(lab);
    lab.querySelector('b').textContent = show(spec, input.value);
    input.addEventListener('input', function () {
      lab.querySelector('b').textContent = show(spec, input.value);
      applyNow();
    });
  });

  function current() {
    var o = {};
    SPECS.forEach(function (spec) {
      var input = root.querySelector('input[data-k="' + spec.k + '"]');
      o[spec.k] = input ? +input.value : 1;
    });
    return o;
  }
  function applyNow() {
    var a = api(), vals = current();
    if (a && a.set) a.set(vals);
    persist(vals);
  }
  function setSliders(vals) {
    SPECS.forEach(function (spec) {
      var input = root.querySelector('input[data-k="' + spec.k + '"]');
      if (!input) return;
      var v = vals && vals[spec.k] != null ? vals[spec.k] : 1;
      input.value = v;
      var b = input.parentNode.querySelector('b');
      if (b) b.textContent = show(spec, input.value);
    });
  }

  document.getElementById('gjdbgreset').addEventListener('click', function () {
    var a = api(), d = a && a.defaults ? a.defaults() : { stars: 1, spread: 1, depth: 1 };
    setSliders(d);
    if (a && a.reset) a.reset();
    persist(d);
  });
  document.getElementById('gjdbgcopy').addEventListener('click', function () {
    var vals = current(), text = JSON.stringify(vals, null, 2);
    var btn = document.getElementById('gjdbgcopy');
    function done(ok) { btn.textContent = ok ? 'copied' : 'copy failed'; setTimeout(function () { btn.textContent = 'copy values'; }, 1400); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }).catch(function () { done(fallback(text)); });
    } else done(fallback(text));
  });
  function fallback(text) {
    try {
      var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.appendChild(ta); ta.select();
      var ok = document.execCommand('copy'); ta.remove(); return ok;
    } catch (e) { return false; }
  }

  function boot() {
    var a = api();
    if (!a) { setTimeout(boot, 80); return; }
    var saved = readSaved();
    if (saved) { setSliders(saved); a.set(saved); }
    else { setSliders(a.values ? a.values() : { stars: 1, spread: 1, depth: 1 }); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
