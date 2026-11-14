/* Mark tune across every room. Existing hooks first. Photographs are never graded. Values on this device. */
(function () {
  var ROOMS = {
    FILM: [
      { id: "spill", label: "Spill", def: 100 },
      { id: "filmsound", label: "Film sound", def: 100 },
      { id: "snap", label: "Snap density", def: 100, neu: true },
      { id: "gap", label: "Frame gap", def: 100, neu: true },
      { id: "grain", label: "Grain", def: 0, neu: true }
    ],
    SOUND: [
      { id: "invert", label: "Invert", def: 0 },
      { id: "vol", label: "Volume", def: 80 },
      { id: "flash", label: "Flash", def: 60 },
      { id: "sens", label: "Sensitivity", def: 100 },
      { id: "dot", label: "Dot size", def: 100, neu: true },
      { id: "line", label: "Line glow", def: 100, neu: true }
    ],
    OBJECTS: [
      { id: "allrings", label: "All rings", def: 100 },
      { id: "thisring", label: "This ring", def: 80 },
      { id: "ohaze", label: "Haze", def: 100 },
      { id: "ostars", label: "Stars", def: 100 },
      { id: "lamp", label: "Lamp", def: 100 }
    ],
    SPACES: [
      { id: "daynight", label: "Day–night", def: 70 },
      { id: "sstars", label: "Stars", def: 100 },
      { id: "glow", label: "Glow", def: 100 },
      { id: "shaze", label: "Haze", def: 80 }
    ],
    PHOTO: [
      { id: "room", label: "Room light", def: 100 },
      { id: "safe", label: "Safelight", def: 1, kind: "switch" },
      { id: "lampg", label: "Lamp glow", def: 100 },
      { id: "wrip", label: "Water ripple", def: 100 }
    ]
  };
  var KEY = "gj.tune.1112.";
  var notes = {
    A: "A — Room tabs. The open room shows only its sliders. Reset returns to the defaults, on this device.",
    B: "B — The mark menu (tune · list · contact) stays in view. Changing room morphs the sliders in the same panel.",
    C: "C — Every room at once (columns on a wide screen, stacked on a phone). Same values, same Reset. Photographs are not graded."
  };
  var room = "SOUND";
  var vals = {};

  function load() {
    Object.keys(ROOMS).forEach(function (r) {
      ROOMS[r].forEach(function (s) {
        var v = s.def;
        try {
          var raw = localStorage.getItem(KEY + s.id);
          if (raw != null && isFinite(parseFloat(raw))) v = parseFloat(raw);
        } catch (e) {}
        vals[s.id] = v;
      });
    });
  }
  function save(id, v) {
    vals[id] = v;
    try { localStorage.setItem(KEY + id, String(v)); } catch (e) {}
  }
  function reset() {
    Object.keys(ROOMS).forEach(function (r) {
      ROOMS[r].forEach(function (s) { save(s.id, s.def); });
    });
    render();
  }

  var tabs = document.getElementById("tabs");
  var roomsEl = document.getElementById("rooms");
  Object.keys(ROOMS).forEach(function (r) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = r;
    b.setAttribute("data-room", r);
    b.addEventListener("click", function () { room = r; render(); });
    tabs.appendChild(b);
  });

  function sliderRow(s) {
    var row = document.createElement("div");
    row.className = "row";
    if (s.kind === "switch") {
      row.innerHTML = "<label>" + s.label + (s.neu ? ' <span class="new">new</span>' : "") + "</label>";
      var sw = document.createElement("div");
      sw.className = "sw";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-label", s.label);
      btn.setAttribute("aria-pressed", vals[s.id] >= 0.5 ? "true" : "false");
      btn.innerHTML = "<i></i>";
      btn.addEventListener("click", function () {
        save(s.id, vals[s.id] >= 0.5 ? 0 : 1);
        btn.setAttribute("aria-pressed", vals[s.id] >= 0.5 ? "true" : "false");
      });
      sw.appendChild(btn);
      row.appendChild(sw);
      return row;
    }
    row.innerHTML = "<label><span>" + s.label + (s.neu ? ' <span class="new">new</span>' : "") + "</span><span class='val'></span></label>";
    var inp = document.createElement("input");
    inp.type = "range"; inp.min = 0; inp.max = 100; inp.step = 1;
    inp.value = vals[s.id];
    inp.setAttribute("aria-label", s.label);
    function paint() {
      inp.style.setProperty("--p", inp.value + "%");
      row.querySelector(".val").textContent = inp.value;
    }
    inp.addEventListener("input", function () { save(s.id, +inp.value); paint(); });
    row.appendChild(inp);
    paint();
    return row;
  }

  function panel(name, hidden) {
    var p = document.createElement("section");
    p.className = "panel";
    if (hidden) p.setAttribute("data-hidden", "");
    p.innerHTML = "<h2>" + name + "</h2>";
    ROOMS[name].forEach(function (s) { p.appendChild(sliderRow(s)); });
    return p;
  }

  function render() {
    tabs.querySelectorAll("button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-room") === room ? "true" : "false");
    });
    var v = Lab.variant;
    if (v === "C") {
      roomsEl.innerHTML = "";
      Object.keys(ROOMS).forEach(function (r) {
        roomsEl.appendChild(panel(r, r !== room));
      });
      return;
    }
    var next = panel(room, false);
    if (v === "B") {
      next.style.opacity = "0";
      next.style.transform = "translateY(10px)";
      next.style.transition = "opacity .38s ease, transform .38s ease";
    }
    roomsEl.innerHTML = "";
    roomsEl.appendChild(next);
    if (v === "B") {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          next.style.opacity = "1";
          next.style.transform = "none";
        });
      });
    }
  }

  document.getElementById("reset").addEventListener("click", reset);
  document.addEventListener("lab-variant", render);
  Lab.stars(document.getElementById("sky"), 120, 4);
  load();
  Lab.init(notes);
})();
