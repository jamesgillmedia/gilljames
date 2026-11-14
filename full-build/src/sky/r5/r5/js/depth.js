/* Depth inside an opened star. The home sky is untouched.
   Film pages keep the r3 credits and Watch; #frames, a tap on the
   stills, or a scroll at the bottom opens that film's frame library.
   Practice pages do the same with the Nov 9 picks. ‹ closes one level. */
(function () {
  var script = document.currentScript;
  if (!script) return;
  var site = new URL("../", script.src);
  var HASH = "#frames";

  function abs(rel) {
    return new URL(rel, site).href;
  }

  function place() {
    var parts = location.pathname.split("/").filter(Boolean);
    var i = parts.lastIndexOf("film");
    if (i >= 0 && parts[i + 1]) return { kind: "film", id: decodeURIComponent(parts[i + 1]) };
    i = parts.lastIndexOf("practice");
    if (i >= 0 && parts[i + 1]) return { kind: "practice", id: decodeURIComponent(parts[i + 1]) };
    if (parts[parts.length - 1] === "stills") return { kind: "stills", id: "stills" };
    return null;
  }

  var where = place();
  if (!where) return;

  function filmItems() {
    var layers = (window.GJ_LAYERS && window.GJ_LAYERS[where.id]) || [];
    if (layers.length) {
      return layers.map(function (frame) {
        return { src: abs("../r4/" + frame.src), ar: frame.ar || 1.78, caption: "" };
      });
    }
    return Array.prototype.map.call(document.querySelectorAll(".stills img"), function (img) {
      var ar = img.getAttribute("width") && img.getAttribute("height")
        ? Number(img.getAttribute("width")) / Number(img.getAttribute("height"))
        : 1.78;
      return { src: img.getAttribute("src"), ar: ar, caption: "" };
    });
  }

  function pickItems() {
    var list = (window.GJ_PICKS && window.GJ_PICKS[where.id]) || [];
    return list.map(function (item) {
      return {
        src: abs(item.src),
        poster: item.poster ? abs(item.poster) : "",
        video: !!item.video,
        ar: item.ar || 0.75,
        caption: item.caption || ""
      };
    });
  }

  function items() {
    return where.kind === "film" ? filmItems() : pickItems();
  }

  function withCatalog(done) {
    if (where.kind !== "film" || window.GJ_LAYERS) {
      done();
      return;
    }
    var s = document.createElement("script");
    s.src = abs("../r4/js/field-layers.js");
    s.onload = done;
    s.onerror = done;
    document.head.appendChild(s);
  }

  function cell(item, index) {
    var fig = document.createElement("figure");
    fig.style.setProperty("--i", String(index));
    var el;
    if (item.video) {
      el = document.createElement("video");
      el.muted = true;
      el.defaultMuted = true;
      el.loop = true;
      el.playsInline = true;
      el.setAttribute("muted", "");
      el.setAttribute("playsinline", "");
      el.setAttribute("webkit-playsinline", "");
      el.setAttribute("loop", "");
      el.preload = "none";
      el.dataset.src = item.src;
      if (item.poster) el.poster = item.poster;
      if (item.caption) el.setAttribute("aria-label", item.caption);
    } else {
      el = document.createElement("img");
      el.src = item.src;
      el.alt = item.caption || "";
      el.decoding = "async";
      if (index > 5) el.loading = "lazy";
    }
    if (item.ar) el.style.aspectRatio = String(item.ar);
    fig.appendChild(el);
    if (item.caption) {
      var cap = document.createElement("figcaption");
      cap.textContent = item.caption;
      fig.appendChild(cap);
    }
    return fig;
  }

  function field(list) {
    var root = document.createElement("div");
    root.className = "depth-field";
    list.forEach(function (item, i) { root.appendChild(cell(item, i)); });
    return root;
  }

  function play(video) {
    video.muted = true;
    if (!video.getAttribute("src")) video.src = video.dataset.src;
    var pending = video.play();
    if (pending && pending.catch) pending.catch(function () {});
  }

  function watch(root) {
    var videos = root.querySelectorAll("video");
    if (!videos.length) return;
    if (!("IntersectionObserver" in window)) {
      videos.forEach(play);
      return;
    }
    var scrollRoot = root.classList.contains("depth") ? root : null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) play(entry.target);
        else entry.target.pause();
      });
    }, { root: scrollRoot, threshold: [0, 0.35, 0.75] });
    videos.forEach(function (video) { io.observe(video); });
  }

  var open = false;
  var pushed = false;
  var layer = null;

  function ensure() {
    if (layer) return layer;
    layer = document.createElement("div");
    layer.className = "depth";
    layer.hidden = true;
    layer.setAttribute("role", "region");
    layer.setAttribute("aria-label", "Frames");
    document.body.appendChild(layer);
    return layer;
  }

  function show() {
    var list = items();
    if (!list.length || open) return;
    var el = ensure();
    if (!el.firstChild) {
      el.appendChild(field(list));
      watch(el);
    }
    el.hidden = false;
    el.scrollTop = 0;
    document.body.classList.add("depth-open");
    var main = document.querySelector("main");
    if (main) main.setAttribute("aria-hidden", "true");
    open = true;
    if (location.hash !== HASH) {
      history.pushState({ depth: 1 }, "", HASH);
      pushed = true;
    }
  }

  function hide(fromPop) {
    if (!open) return;
    open = false;
    if (layer) {
      layer.hidden = true;
      layer.querySelectorAll("video").forEach(function (video) { video.pause(); });
    }
    document.body.classList.remove("depth-open");
    var main = document.querySelector("main");
    if (main) main.removeAttribute("aria-hidden");
    if (!fromPop && pushed) {
      pushed = false;
      history.back();
    } else if (!fromPop && location.hash === HASH) {
      history.replaceState({ depth: 0 }, "", location.pathname + location.search);
    }
  }

  function atBottom() {
    var doc = document.documentElement;
    return window.scrollY + window.innerHeight >= doc.scrollHeight - 16;
  }

  var inline = document.getElementById("depth-root");
  if (inline) {
    withCatalog(function () {
      var list = items();
      if (!list.length) return;
      inline.appendChild(field(list));
      watch(inline);
    });
    return;
  }

  withCatalog(function () {
    if (location.hash === HASH) show();
  });

  document.addEventListener("click", function (event) {
    if (open) return;
    if (event.target.closest("a, audio, video, button, input, textarea")) return;
    if (event.target.closest(".stills, .works, .track")) {
      event.preventDefault();
      withCatalog(show);
    }
  });

  window.addEventListener("wheel", function (event) {
    if (open || event.deltaY < 12) return;
    if (atBottom()) withCatalog(show);
  }, { passive: true });

  var touchY = null;
  window.addEventListener("touchstart", function (event) {
    touchY = event.touches[0] ? event.touches[0].clientY : null;
  }, { passive: true });
  window.addEventListener("touchend", function (event) {
    if (open || touchY == null || !event.changedTouches[0]) return;
    var dy = touchY - event.changedTouches[0].clientY;
    touchY = null;
    if (dy > 40 && atBottom()) withCatalog(show);
  }, { passive: true });

  var back = document.querySelector("a.back");
  if (back) {
    back.addEventListener("click", function (event) {
      if (!open) return;
      event.preventDefault();
      hide(false);
    });
  }

  window.addEventListener("popstate", function () {
    if (location.hash === HASH) {
      if (!open) withCatalog(show);
    } else if (open) {
      pushed = false;
      hide(true);
    }
  });
})();
