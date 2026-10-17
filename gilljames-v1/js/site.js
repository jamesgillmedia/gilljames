// gill james v1 · shared behaviour: compact header on scroll (with hysteresis so it never flickers)
(function () {
  var body = document.body, compact = false, ticking = false;
  function update() {
    var y = window.scrollY || 0;
    if (!compact && y > 120) { compact = true; body.classList.add('is-compact'); }
    else if (compact && y < 30) { compact = false; body.classList.remove('is-compact'); }
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
})();
