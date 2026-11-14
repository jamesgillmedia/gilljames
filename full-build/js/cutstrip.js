/* G1 cut-out strip ported onto the objects orbit.
   Spread across the full width (space-evenly) so the cups and paddles do not sit bunched on the left.
   The photographs themselves are not graded. */
(function () {
  function boot() {
    var cuts = window.OBJ_CUTS;
    if (!cuts || !cuts.length) return;
    var bar = document.createElement("div");
    bar.id = "gj-cutstrip";
    bar.setAttribute("role", "list");
    bar.setAttribute("aria-label", "cups and paddles, cut from the photographs");
    bar.style.cssText = "position:fixed;z-index:20;left:0;right:0;bottom:0;display:flex;justify-content:space-evenly;align-items:flex-end;gap:8px;padding:0 3vw calc(env(safe-area-inset-bottom) + 10px);pointer-events:none;box-sizing:border-box";
    cuts.forEach(function (o) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "listitem");
      b.setAttribute("aria-label", o.label);
      b.style.cssText = "pointer-events:auto;background:none;border:0;padding:0;cursor:pointer;flex:1 1 0;max-width:120px;min-width:44px";
      var img = document.createElement("img");
      img.alt = "";
      img.draggable = false;
      img.src = "media/cut/" + o.k + ".webp";
      img.style.cssText = "display:block;height:min(16vh,120px);width:auto;max-width:100%;margin:0 auto";
      b.appendChild(img);
      bar.appendChild(b);
    });
    document.body.appendChild(bar);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
