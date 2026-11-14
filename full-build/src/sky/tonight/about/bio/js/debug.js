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
    '#gjdbg label.sl input{display:block;width:100%;margin:4px 0 0;accent-color:#55DAA1}' +
    '#gjdbg .acts{display:flex;gap:8px;margin-top:4px}' +
    '#gjdbg .acts button{flex:1;height:36px;border-radius:18px;border:1px solid rgba(255,255,255,.18);background:transparent;color:#dfe8f2;font:300 11px Poppins,sans-serif;letter-spacing:.04em}' +
    '#gjdbg a.go{display:block;margin-top:10px;padding:9px 12px;text-align:center;border-radius:16px;border:1px solid rgba(85,218,161,.55);color:#55DAA1;text-decoration:none;background:rgba(85,218,161,.1);letter-spacing:.08em}' +
    '#gjdbg .faces{margin-top:12px}' +
    '#gjdbg label.tog{display:flex;align-items:center;gap:8px;margin:0 0 8px;color:#9fb6cc;font-size:10px;letter-spacing:.03em;cursor:pointer}' +
    '#gjdbg label.tog input{accent-color:#55DAA1;width:16px;height:16px;margin:0}' +
    '#gjdbg .faces .acts{margin-top:8px}' +
    '#gjfacemarks{position:fixed;inset:0;z-index:60;pointer-events:none}' +
    '#gjfacemarks .mk{position:absolute;width:24px;height:24px;margin:-12px 0 0 -12px;pointer-events:auto;cursor:grab;touch-action:none}' +
    '#gjfacemarks .mk .ring{position:absolute;inset:0;border:1.5px solid #55DAA1;border-radius:50%;box-shadow:0 0 0 1px rgba(4,7,11,.55),0 0 8px rgba(85,218,161,.45)}' +
    '#gjfacemarks .mk .hx,#gjfacemarks .mk .hy{position:absolute;background:#55DAA1;box-shadow:0 0 0 1px rgba(4,7,11,.55)}' +
    '#gjfacemarks .mk .hx{left:4px;right:4px;top:50%;height:1.5px;margin-top:-0.75px}' +
    '#gjfacemarks .mk .hy{top:4px;bottom:4px;left:50%;width:1.5px;margin-left:-0.75px}' +
    '#gjfacemarks .mk.drag{cursor:grabbing;z-index:1}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var root = document.createElement('div'); root.id = 'gjdbg';
  root.innerHTML = '<div class="tab" role="button" aria-label="debug">dbg</div><div class="sheet"><h4>m4 debug</h4><div id="gjdbgrows"></div><div class="faces"><h4>faces</h4><label class="tog"><input type="checkbox" id="gjfaceshow"> Show face points</label><div id="gjfaceread"></div><div class="acts"><button type="button" id="gjfacecopy">copy</button></div></div><div class="tune"><h4>tune</h4><div id="gjdbgtune"></div><div class="acts"><button type="button" id="gjdbgcopy">copy values</button><button type="button" id="gjdbgreset">reset</button></div></div><a class="go" href="_versions/">builds</a></div>';
  document.body.appendChild(root);
  var marksRoot = document.createElement('div'); marksRoot.id = 'gjfacemarks'; marksRoot.hidden = true;
  document.body.appendChild(marksRoot);
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
  (function () {
    var flashInput = box.querySelector('input[data-k="flash"]');
    var host = flashInput ? flashInput.parentNode : box;
    var wrap = document.createElement('div');
    wrap.className = 'flashctl';
    wrap.style.margin = '8px 0 10px';
    wrap.innerHTML = '<label class="tog"><input type="checkbox" id="gjdnoflash"> Stop flashing</label>' +
      '<label class="sl">Glitch <b id="gjdglitchv">full</b><input type="range" id="gjdglitch" min="0" max="100" step="1" aria-label="Glitch intensity"></label>';
    if (flashInput) host.parentNode.insertBefore(wrap, host.nextSibling);
    else box.insertBefore(wrap, box.firstChild);
    function ctl() { return window.GJ_BIOCTL || null; }
    function glabel(v) {
      v = Math.max(0, Math.min(1, +v || 0));
      if (v <= 0) return 'off';
      if (Math.abs(v - 1) < 0.005) return 'full';
      return Math.round(v * 100) + '%';
    }
    function syncFlashCtl() {
      var c = ctl();
      var nf = document.getElementById('gjdnoflash');
      var sl = document.getElementById('gjdglitch');
      var lb = document.getElementById('gjdglitchv');
      if (nf && document.activeElement !== nf) nf.checked = !!(c && c.noflash());
      var gv = c ? c.glitch() : 1;
      if (sl && document.activeElement !== sl) sl.value = String(Math.round(gv * 100));
      if (lb) lb.textContent = glabel(gv);
    }
    var nf = document.getElementById('gjdnoflash');
    var sl = document.getElementById('gjdglitch');
    if (nf) nf.addEventListener('change', function () { if (ctl()) ctl().setNoflash(nf.checked); });
    if (sl) sl.addEventListener('input', function () { if (ctl()) ctl().setGlitch(sl.value / 100); var lb = document.getElementById('gjdglitchv'); if (lb) lb.textContent = glabel(sl.value / 100); });
    wrap._sync = syncFlashCtl;
    window._gjSyncFlashCtl = syncFlashCtl;
    syncFlashCtl();
  })();
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

  var FACEKEY = 'gj-m4-faces-show';
  var faceShow = document.getElementById('gjfaceshow');
  var faceRead = document.getElementById('gjfaceread');
  var faceCopy = document.getElementById('gjfacecopy');
  var facePick = null, faceDrag = null;
  try { if (sessionStorage.getItem(FACEKEY) === '1') faceShow.checked = true; } catch (e) {}
  function facesApi() { return window.GJ_FACES || null; }
  function faceFile(src) { return (facesApi() && GJ_FACES.base(src)) || String(src || '').split('/').pop(); }
  function setFaceShow(on) {
    if (facesApi()) GJ_FACES.setShow(on);
    marksRoot.hidden = !on;
    if (!on) { marksRoot.innerHTML = ''; faceDrag = null; }
    try { if (on) sessionStorage.setItem(FACEKEY, '1'); else sessionStorage.removeItem(FACEKEY); } catch (e) {}
  }
  faceShow.addEventListener('change', function () { setFaceShow(faceShow.checked); });
  setFaceShow(faceShow.checked);

  function currentFace() {
    if (facePick) {
      var a = facesApi() && GJ_FACES.of(facePick.file || facePick.src);
      if (a) return a;
    }
    var hash = location.hash || '';
    var img = document.querySelector('#layer .heroframe img, #layer .herobleed img, #layer .stillframe img, #layer .enterframe.in img, #layer .cutgrid figure.on img, #layer img');
    var src = img && facesApi() ? GJ_FACES.srcOf(img) : '';
    var f = src && facesApi() ? GJ_FACES.of(src) : null;
    if (f) return f;
    return null;
  }
  function faceReadout() {
    var f = currentFace();
    if (!f) {
      faceRead.innerHTML = row('shot', '—') + row('focal', '—');
      return;
    }
    faceRead.innerHTML = row('shot', f.file) + row('focal', (+f.x).toFixed(3) + ', ' + (+f.y).toFixed(3));
  }
  function htmlFaceMarks() {
    var out = [], nodes = document.querySelectorAll('#layer img, #layer video, .enterframe img, .enterframe video');
    var api = facesApi();
    if (!api) return out;
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i], src = GJ_FACES.srcOf(el), f = GJ_FACES.of(src);
      if (!f || !el.clientWidth) continue;
      var r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 8) continue;
      var iw = el.naturalWidth || el.videoWidth, ih = el.naturalHeight || el.videoHeight;
      if (!iw || !ih) continue;
      var d = GJ_FACES.coverDest(iw, ih, 0, 0, r.width, r.height, f.x, f.y);
      out.push({
        src: src, file: f.file, kind: 'html', el: el,
        dx: d.dx, dy: d.dy, dw: d.dw, dh: d.dh, fx: f.x, fy: f.y,
        mx: r.left + d.dx + f.x * d.dw, my: r.top + d.dy + f.y * d.dh
      });
    }
    return out;
  }
  function allFaceMarks() {
    var api = facesApi(), list = (api && GJ_FACES.marks()) ? GJ_FACES.marks().slice() : [];
    return list.concat(htmlFaceMarks());
  }
  function paintMarks() {
    if (!faceShow.checked) { marksRoot.hidden = true; return; }
    marksRoot.hidden = false;
    var list = allFaceMarks(), html = '', i, m;
    for (i = 0; i < list.length; i++) {
      m = list[i];
      if (faceDrag && faceDrag.file === m.file) {
        html += '<div class="mk drag" data-i="' + i + '" style="left:' + faceDrag.px + 'px;top:' + faceDrag.py + 'px"><i class="ring"></i><i class="hx"></i><i class="hy"></i></div>';
      } else {
        html += '<div class="mk" data-i="' + i + '" style="left:' + m.mx.toFixed(1) + 'px;top:' + m.my.toFixed(1) + 'px"><i class="ring"></i><i class="hx"></i><i class="hy"></i></div>';
      }
    }
    marksRoot.innerHTML = html;
    marksRoot._list = list;
  }
  function pointToFocal(m, cx, cy) {
    var api = facesApi();
    if (!api) return null;
    if (m.kind === 'html' && m.el) {
      var r = m.el.getBoundingClientRect();
      var fx = (cx - r.left - m.dx) / m.dw;
      var fy = (cy - r.top - m.dy) / m.dh;
      return { x: Math.max(0, Math.min(1, fx)), y: Math.max(0, Math.min(1, fy)) };
    }
    var sc = 1, og = { x: 0, y: 0 };
    try { if (window.GJ_DEPTH) { sc = GJ_DEPTH.viewScale() || 1; og = GJ_DEPTH.origin() || og; } } catch (e) {}
    var ux = sc !== 1 ? og.x + (cx - og.x) / sc : cx;
    var uy = sc !== 1 ? og.y + (cy - og.y) / sc : cy;
    return {
      x: Math.max(0, Math.min(1, (ux - m.dx) / m.dw)),
      y: Math.max(0, Math.min(1, (uy - m.dy) / m.dh))
    };
  }
  marksRoot.addEventListener('pointerdown', function (e) {
    var mk = e.target.closest && e.target.closest('.mk');
    if (!mk) return;
    var list = marksRoot._list || [], m = list[+mk.getAttribute('data-i')];
    if (!m || !facesApi()) return;
    e.preventDefault(); e.stopPropagation();
    try { mk.setPointerCapture(e.pointerId); } catch (err) {}
    if (m.el) m.el._gjFaceDrag = 1;
    facePick = m;
    faceDrag = { file: m.file, src: m.src, el: m.el, frozen: m, px: e.clientX, py: e.clientY };
    mk.classList.add('drag');
    hold++;
  });
  window.addEventListener('pointermove', function (e) {
    if (!faceDrag || !facesApi()) return;
    var pt = pointToFocal(faceDrag.frozen, e.clientX, e.clientY);
    if (!pt) return;
    GJ_FACES.set(faceDrag.src || faceDrag.file, pt.x, pt.y);
    faceDrag.px = e.clientX; faceDrag.py = e.clientY;
    if (faceDrag.el) { /* keep crop frozen while dragging */ }
    faceReadout();
  }, true);
  window.addEventListener('pointerup', function () {
    if (!faceDrag) return;
    if (faceDrag.el) { faceDrag.el._gjFaceDrag = 0; if (facesApi()) GJ_FACES.applyTo(faceDrag.el); }
    faceDrag = null;
    if (facesApi()) GJ_FACES.apply(document);
  }, true);
  faceCopy.addEventListener('click', function () {
    var text = JSON.stringify(facesApi() ? GJ_FACES.values() : {}, null, 2);
    var done = function () { faceCopy.textContent = 'copied'; setTimeout(function () { faceCopy.textContent = 'copy'; }, 1200); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    else { fallbackCopy(text); done(); }
  });

  var frames = 0, fps = 0, last = performance.now(), ft = 0;
  (function loop(t) { frames++; ft = t - (loop.p || t); loop.p = t; if (t - last > 500) { fps = frames * 1000 / (t - last); frames = 0; last = t; if (open) paint(); } if (faceShow.checked) paintMarks(); requestAnimationFrame(loop); })(performance.now());

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
    if (window._gjSyncFlashCtl) window._gjSyncFlashCtl();
    faceReadout();
    if (faceShow.checked) paintMarks();
  }
  paint();
  new MutationObserver(function () { if (open) paint(); }).observe(root, { attributes: true, attributeFilter: ['class'] });
})();
