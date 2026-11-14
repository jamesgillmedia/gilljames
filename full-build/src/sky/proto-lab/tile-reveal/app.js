/* Tile reveal — three proposals. Still is from Gill's 4:23 recording (site playback). */
(function () {
  var SRC = "../_shared/media/423-still.png";
  var mosaic = document.getElementById("mosaic");
  var notes = {
    A: "A — Mid-reveal: each tile has its own treatment (wash, wipe, star-punch, blur, delay, an incomplete ratio). Replay runs the sequence. For tap-in, not the main film door.",
    B: "B — Tap to open the next tile, in order, each with its own treatment. Replay starts over.",
    C: "C — Mixed ratios; some tiles stay incomplete. Tap any tile to open just that one. Replay resets."
  };
  var layouts = {
    A: [
      { kind: "wash", cls: "t0" },
      { kind: "stars", cls: "t1" },
      { kind: "delay", cls: "t2" },
      { kind: "wipe", cls: "t3" },
      { kind: "blur", cls: "t4" },
      { kind: "sliver", cls: "t5" }
    ],
    B: [
      { kind: "wash" },
      { kind: "stars" },
      { kind: "delay" },
      { kind: "wipe" },
      { kind: "open" },
      { kind: "blur" },
      { kind: "tealwash" },
      { kind: "sliver" }
    ],
    C: [
      { kind: "stars" },
      { kind: "wash" },
      { kind: "sliver" },
      { kind: "delay" },
      { kind: "wipe" },
      { kind: "blur" }
    ]
  };
  var tiles = [];
  var timer = [];
  var next = 0;

  function clearT() {
    timer.forEach(function (t) { clearTimeout(t); });
    timer = [];
  }
  function build(v) {
    clearT();
    document.body.setAttribute("data-layout", v);
    mosaic.innerHTML = "";
    tiles = layouts[v].map(function (spec, i) {
      var el = document.createElement("div");
      el.className = "tile" + (spec.cls ? " " + spec.cls : "");
      el.setAttribute("data-kind", spec.kind);
      el.setAttribute("data-state", "wait");
      el.innerHTML = '<div class="wash"></div><div class="img"></div><div class="lead"></div>';
      var img = el.querySelector(".img");
      img.style.backgroundImage = "url(" + SRC + ")";
      el.addEventListener("click", function () {
        if (Lab.variant === "B") step();
        else if (Lab.variant === "C") openOne(i);
      });
      mosaic.appendChild(el);
      return el;
    });
    next = 0;
    requestAnimationFrame(function () { placeBackgrounds(); });
    var mid = /(?:^|[?&])mid=1(?:&|$)/.test(location.search);
    if (mid && v === "A") {
      ["mid","mid","mid","mid","mid","mid"].forEach(function (s, i) { setState(i, s); });
    } else if (v === "A") playA();
    else if (v === "B") {
      /* start with first tile mid so it is obvious you can go on */
      setState(0, "mid");
    }
  }
  function setState(i, s) {
    if (tiles[i]) tiles[i].setAttribute("data-state", s);
  }
  function playA() {
    /* sequence: wait → mid (treatment) → some go open, sliver stays incomplete */
    tiles.forEach(function (el) { el.setAttribute("data-state", "wait"); });
    var order = [0, 1, 3, 2, 4, 5];
    order.forEach(function (i, k) {
      timer.push(setTimeout(function () { setState(i, "mid"); }, 280 + k * 420));
      if (layouts.A[i].kind !== "sliver") {
        timer.push(setTimeout(function () { setState(i, "open"); }, 280 + k * 420 + 700));
      }
    });
  }
  function step() {
    if (next >= tiles.length) return;
    var i = next++;
    setState(i, "mid");
    if (tiles[i].getAttribute("data-kind") !== "sliver") {
      timer.push(setTimeout(function () { setState(i, "open"); }, 600));
    }
    if (next < tiles.length) setState(next, "wait");
  }
  function openOne(i) {
    var kind = tiles[i].getAttribute("data-kind");
    var cur = tiles[i].getAttribute("data-state");
    if (cur === "wait") setState(i, "mid");
    else if (cur === "mid" && kind !== "sliver") setState(i, "open");
    else if (cur === "mid" && kind === "sliver") { /* stays incomplete */ }
    else if (cur === "open") setState(i, "wait");
  }
  function replay() {
    if (Lab.variant === "A") playA();
    else if (Lab.variant === "B") {
      clearT();
      tiles.forEach(function (el) { el.setAttribute("data-state", "wait"); });
      next = 0;
      setState(0, "mid");
    } else {
      clearT();
      tiles.forEach(function (el) { el.setAttribute("data-state", "wait"); });
    }
  }
  document.getElementById("replay").addEventListener("click", replay);
  document.addEventListener("lab-variant", function (e) { build(e.detail.v); });
    function placeBackgrounds() {
    var br = mosaic.getBoundingClientRect();
    tiles.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var img = el.querySelector(".img");
      img.style.backgroundSize = br.width + "px " + br.height + "px";
      img.style.backgroundPosition = (br.left - r.left) + "px " + (br.top - r.top) + "px";
    });
  }
  window.addEventListener("resize", function () { placeBackgrounds(); });
  Lab.stars(document.getElementById("sky"), 90, 23);
  Lab.init(notes);
})();
