/* Wayfinding for every room in the full-build preview.
   The syllabics mark returns to the field. Escape does the same when the room
   has not already claimed it. Toggles live in this drawer and are remembered. */
(function () {
  if (window.__gjChrome) return;
  window.__gjChrome = 1;
  var s = document.currentScript;
  if (s && s.src && document.head && !document.querySelector('link[rel="icon"]')) {
    var icon = document.createElement("link");
    icon.rel = "icon";
    icon.href = new URL("src/b33/site-v3-pro2/img/favicon-32.png", s.src).href;
    document.head.appendChild(icon);
  }
  var HUB = (s && s.getAttribute("data-hub")) || "index.html";
  var ROOMS = (s && s.getAttribute("data-rooms")) || "rooms.json";
  var hubPage = document.body.classList.contains("gj-hub");

  var TOGS = [
    { k: "gj-tog-moon", label: "crescent moon", def: "1", kind: "bool" },
    { k: "gj-tog-density", label: "mark density", def: "sparse", kind: "choice",
      opts: [["sparse", "fewer stars"], ["spread", "spread"], ["shallow", "shallow"], ["sketch", "220 stars"]] },
    { k: "gj-tog-depth", label: "depth", def: "rest", kind: "choice",
      opts: [["rest", "flat, then 3D"], ["flat", "stay flat"], ["hold", "hold the depth"]] },
    { k: "gj-tog-reflect", label: "shelf reflections", def: "1", kind: "bool" },
    { k: "gj-tog-water", label: "opener water", def: "1", kind: "bool" },
    { k: "gj-tog-markphotos", label: "mark", def: "mark", kind: "choice",
      opts: [["mark", "mark only"], ["photos", "with object photos"]] },
    { k: "gj-tog-flatdeep", label: "mark field", def: "flat", kind: "choice",
      opts: [["flat", "nearly flat"], ["deep", "deep starfield"]] },
    { k: "gj-tog-name", label: "film names", def: "0", kind: "bool" }
  ];

  function get(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} apply(); window.dispatchEvent(new CustomEvent("gj-tog", { detail: { k: k, v: v } })); }

  function apply() {
    document.documentElement.classList.toggle("rm", get("gj-red", "0") === "1");
    document.documentElement.classList.toggle("gj-noreflect", get("gj-tog-reflect", "1") !== "1");
    document.documentElement.classList.toggle("gj-nowater", get("gj-tog-water", "1") !== "1");
    document.documentElement.classList.toggle("gj-nomoon", get("gj-tog-moon", "1") !== "1");
    var red = document.querySelector("#gj-red");
    if (red) red.setAttribute("aria-pressed", get("gj-red", "0") === "1" ? "true" : "false");
  }

  function goHub() { location.href = HUB; }

  var back = document.createElement("a");
  back.id = "gj-back"; back.href = HUB;
  back.setAttribute("aria-label", "back to the field");
  back.innerHTML = "‹ <b lang=\"cr\">ᑕᐣᓯ</b>";
  document.body.appendChild(back);

  var dial = document.createElement("button");
  dial.id = "gj-dial"; dial.type = "button"; dial.textContent = "tune";
  dial.setAttribute("aria-expanded", "false");
  dial.setAttribute("aria-controls", "gj-drawer");
  document.body.appendChild(dial);

  var red = document.createElement("button");
  red.id = "gj-red"; red.type = "button";
  red.setAttribute("aria-label", "red mode");
  red.innerHTML = "<i></i>";
  red.addEventListener("click", function () { set("gj-red", get("gj-red", "0") === "1" ? "0" : "1"); });
  document.body.appendChild(red);

  var drawer = document.createElement("aside");
  drawer.id = "gj-drawer";
  drawer.setAttribute("aria-label", "tuning");
  drawer.innerHTML = "<h2>toggles</h2><div id=\"gj-togs\"></div><h2>rooms</h2><nav id=\"gj-rooms\"></nav><p id=\"gj-onward\"></p>";
  document.body.appendChild(drawer);

  function openDrawer(on) {
    drawer.classList.toggle("on", on);
    dial.setAttribute("aria-expanded", on ? "true" : "false");
  }
  dial.addEventListener("click", function () { openDrawer(!drawer.classList.contains("on")); });

  var host = drawer.querySelector("#gj-togs");
  TOGS.forEach(function (t) {
    var row = document.createElement("label");
    row.className = "row";
    var name = document.createElement("span");
    name.textContent = t.label;
    row.appendChild(name);
    if (t.kind === "bool") {
      var b = document.createElement("button");
      b.type = "button"; b.className = "tog";
      function paint() { var on = get(t.k, t.def) === "1"; b.textContent = on ? "on" : "off"; b.setAttribute("aria-pressed", on ? "true" : "false"); }
      b.addEventListener("click", function () { set(t.k, get(t.k, t.def) === "1" ? "0" : "1"); paint(); });
      paint(); row.appendChild(b);
    } else {
      var sel = document.createElement("select");
      sel.setAttribute("aria-label", t.label);
      t.opts.forEach(function (o) {
        var op = document.createElement("option"); op.value = o[0]; op.textContent = o[1]; sel.appendChild(op);
      });
      sel.value = get(t.k, t.def);
      if (sel.value !== get(t.k, t.def)) sel.value = t.def;
      sel.addEventListener("change", function () { set(t.k, sel.value); });
      row.appendChild(sel);
    }
    host.appendChild(row);
  });

  fetch(ROOMS).then(function (r) { return r.json(); }).then(function (list) {
    var nav = drawer.querySelector("#gj-rooms");
    var here = location.pathname + location.search + location.hash;
    list.forEach(function (room) {
      if (room.hidden) return;
      var a = document.createElement("a");
      a.className = "row";
      a.href = new URL(room.href, new URL(HUB, location.href)).href;
      a.innerHTML = "<span>" + room.label + "</span><span>" + (room.badge || "") + "</span>";
      nav.appendChild(a);
      if (!hubPage && room.next && here.indexOf(room.href.split("#")[0].split("/").slice(-2).join("/")) >= 0) {
        var p = drawer.querySelector("#gj-onward");
        if (p && !p.firstChild) {
          var n = document.createElement("a");
          n.href = new URL(room.next, new URL(HUB, location.href)).href;
          n.textContent = "onward · " + (room.nextLabel || "next");
          p.appendChild(n);
        }
      }
    });
  }).catch(function () {});

  addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (drawer.classList.contains("on")) { openDrawer(false); e.preventDefault(); return; }
    if (e.defaultPrevented || hubPage) return;
    e.preventDefault();
    goHub();
  });

  apply();
  window.GJ = window.GJ || {};
  window.GJ.get = get;
  window.GJ.set = set;
  window.GJ.hub = HUB;
  if (s && s.src) {
    var rf = document.createElement("script");
    rf.src = new URL("js/reframe.js", s.src).href;
    document.body.appendChild(rf);
  }
})();
