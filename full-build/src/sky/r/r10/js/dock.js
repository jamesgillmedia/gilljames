/* R10c · the docked sound player. One <audio> for the whole site: it never autoplays, and it keeps playing while you move
   through the sky and its layers. Site-styled, no native audio bars: play/pause, the track's waveform from data.json peaks
   (tap or drag to scrub), volume and flash. Ported from m4 player/ (vol + flash, beat glow on 60/bpm, commit 31ecf8e) and
   gill-sky night-listening/app.js (progress, volume, flash sliders); "flash" pulses the R10 sky's stars on the beat. */
let A = null, TR = null, UPf = p => p, root = null, cv = null, raf = 0, flash = .6;
const L = [];
export function mount(tracks, up) { UPf = up; root = document.getElementById('dock'); root.innerHTML =
  '<button type="button" class="pp" aria-label="play">▶</button><div class="tt"><b></b><i></i><canvas aria-label="waveform: tap or drag to move through the song"></canvas>' +
  '<div class="sl"><label>vol <input type="range" class="vol" min="0" max="100" value="80" aria-label="volume"></label><label>flash <input type="range" class="fl" min="0" max="100" value="60" aria-label="flash on the beat"></label></div></div>' +
  '<button type="button" class="x" aria-label="close the player">✕</button>';
  cv = root.querySelector('canvas'); root.querySelector('.pp').onclick = toggle; root.querySelector('.x').onclick = () => { if (A) A.pause(); root.hidden = true; document.documentElement.classList.remove('dockon') };
  root.querySelector('.vol').oninput = e => { if (A) A.volume = e.target.value / 100 }; root.querySelector('.fl').oninput = e => flash = e.target.value / 100;
  let drag = false; const seek = e => { if (!A || !A.duration) return; const r = cv.getBoundingClientRect(); A.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * A.duration; drawW() };
  cv.addEventListener('pointerdown', e => { drag = true; cv.setPointerCapture(e.pointerId); seek(e) }); cv.addEventListener('pointermove', e => drag && seek(e)); cv.addEventListener('pointerup', () => drag = false);
  tracks.forEach(t => L.push(t)) }
export function load(t, go) { if (!A) { A = new Audio(); A.preload = 'metadata'; A.addEventListener('play', sync); A.addEventListener('pause', sync); A.addEventListener('ended', sync); A.addEventListener('timeupdate', drawW) }
  if (TR !== t) { TR = t; A.src = UPf(t.file); root.querySelector('b').textContent = t.title; root.querySelector('i').textContent = t.artist }
  root.hidden = false; document.documentElement.classList.add('dockon'); requestAnimationFrame(drawW); if (go) { const q = A.play(); if (q && q.catch) q.catch(() => {}) } }
export function toggle() { if (!A) return; if (A.paused) { const q = A.play(); if (q && q.catch) q.catch(() => {}) } else A.pause() }
export function pause() { if (A && !A.paused) A.pause() }
export function playing() { return !!(A && !A.paused) }
export function current() { return TR && TR.k }
export function button(t, label) { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.dataset.track = t.k; b.textContent = label || ('▶ ' + t.title);
  b.addEventListener('click', () => { if (TR === t && A && !A.paused) A.pause(); else load(t, true) }); return b }
function sync() { const p = root.querySelector('.pp'); p.textContent = A && !A.paused ? '❚❚' : '▶'; p.setAttribute('aria-label', A && !A.paused ? 'pause' : 'play');
  document.querySelectorAll('[data-track]').forEach(b => b.setAttribute('aria-pressed', String(!!(A && !A.paused && b.dataset.track === (TR && TR.k)))));
  cancelAnimationFrame(raf); if (A && !A.paused) beat(); else if (window.GJ_SKY) { GJ_SKY.pulse = 0; window.__world && __world.req && __world.req() } }
function beat() { raf = requestAnimationFrame(beat); if (!TR || !window.GJ_SKY) return; const per = 60 / (TR.bpm || 90), ph = (A.currentTime % per) / per;
  GJ_SKY.pulse = flash * Math.pow(1 - ph, 3); if (window.__world && __world.req) __world.req() }
function drawW() { if (!cv || !TR) return; const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); cv.width = Math.max(1, r.width * d); cv.height = Math.max(1, r.height * d);
  const g = cv.getContext('2d'), P = TR.peaks || [], n = P.length, w = cv.width / n, pr = A && A.duration ? A.currentTime / A.duration : 0;
  P.forEach((v, i) => { const h = Math.max(2 * d, v * cv.height); g.fillStyle = i / n < pr ? '#55DAA1' : 'rgba(238,243,245,.35)'; g.fillRect(i * w + w * .15, (cv.height - h) / 2, w * .7, h) }) }
