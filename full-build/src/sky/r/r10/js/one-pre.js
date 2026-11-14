/* R10c · set before world.js runs: the sky tune (live from the sky panel), room for the chapter ring, DOM entry labels on. */
window.GJ_SKY = { spread: 1, sspread: 1, lineA: 1, lineW: 1, starS: 1, starG: 1, pulse: 0 };
try { var t = JSON.parse(sessionStorage.getItem('gj-r10-sky') || 'null'); if (t) for (var k in t) if (k in window.GJ_SKY && k !== 'pulse') window.GJ_SKY[k] = +t[k] } catch (e) {}
window.__oneBot = -4; /* R10's own bottom rail is hidden; the ring (56 px) takes its place */ window.__oneEntries = 1; window.TRACKS = {};
/* routes that belong to R10c's own layers (the brief), not to the sky: world.js leaves these to one.js */
window.__oneBootHash = location.hash;
window.__oneOwns = function (h) { return /^#spirit-eye(\/|$)/.test(h || '') };
window.__oneFarF = function (w, h) { return h < 520 ? 0 : w < 600 ? 122 : 150 };
