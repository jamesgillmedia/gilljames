/* Depth inside an opened star. The home sky is untouched.
   Film pages keep the r3 credits and Watch; #frames, a tap on the
   stills, or a scroll at the bottom opens that film's frame library.
   Practice pages do the same with the Nov 9 picks. Inside the layer
   the names land as boards, then become the pictures. Pinch zooms
   deeper there only. Sound's deepest layer is the waveform player.
   ‹ closes one level. */
(function () {
  var script = document.currentScript;
  if (!script) return;
  var site = new URL("../", script.src);
  var HASH = "#frames";
  var WAVE = "https://jamesgillmedia.github.io/gilljames/sound-v2b/";
  var NOTES = {
    "stay-gold": "AXE · Stay Gold and the director’s cut of AXE · Golden Moment, the gold flares and the ropes from the reel.",
    "golden-moment-directors-cut": "AXE · Stay Gold and the director’s cut of AXE · Golden Moment, the gold flares and the ropes from the reel.",
    legends: "BMW Legends and BMW · Drift, plus the BMW Electrify the Night frames that open the middle of Reel 2026.",
    drift: "BMW Legends and BMW · Drift, plus the BMW Electrify the Night frames that open the middle of Reel 2026.",
    celebraciones: "Coca-Cola · Celebraciones, the commercial as it appears on the site: one still and the published film on Vimeo.",
    "reel-2026": "The 2026 reel: 73 seconds through the work, from the AXE, BMW and John Frieda frames to the ᑕᐣᓯ constellation itself."
  };

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

  function boardName(item) {
    if (item.caption) return item.caption;
    var title = document.querySelector("h1");
    return title ? title.textContent.trim() : "";
  }

  function cell(item, index) {
    var fig = document.createElement("figure");
    fig.style.setProperty("--i", String(index));
    fig.dataset.ar = String(item.ar || 1.5);
    var name = document.createElement("span");
    name.className = "board-name";
    name.textContent = boardName(item);
    fig.appendChild(name);
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
    el.style.aspectRatio = String(item.ar || 1.5);
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

  function scatter(box) {
    if (!box) return;
    var figs = Array.prototype.filter.call(box.children, function (node) {
      return node.tagName === "FIGURE";
    });
    if (!figs.length) return;
    var width = box.clientWidth || box.parentElement.clientWidth || 280;
    var gap = 12;
    var colW = Math.min(148, Math.floor((width - gap) / 2));
    if (colW < 72) colW = Math.max(72, Math.floor(width));
    var lanes = [0, 22];
    figs.forEach(function (fig, index) {
      var lane = index % 2;
      var ar = parseFloat(fig.dataset.ar) || 1.5;
      var tall = colW / ar;
      var x = lane === 0 ? 0 : width - colW;
      if (x < 0) x = 0;
      if (x + colW > width) x = Math.max(0, width - colW);
      var depth = Math.max(0.48, 1 - Math.floor(index / 2) * 0.045);
      fig.dataset.depth = depth.toFixed(2);
      fig.style.left = x + "px";
      fig.style.top = lanes[lane] + "px";
      fig.style.width = colW + "px";
      var media = fig.querySelector("img, video");
      if (media) media.style.filter = "brightness(" + depth.toFixed(2) + ")";
      fig.style.zIndex = String(2 + (index % 2));
      fig.style.animationDuration = (22 + (index % 4) * 2) + "s";
      fig.style.animationDelay = (-index * 0.6) + "s";
      lanes[lane] += Math.max(tall * 0.78, tall) + 16;
    });
    box.style.height = (Math.max(lanes[0], lanes[1]) + 36) + "px";
  }

  function layout(root) {
    scatter(root.querySelector(".depth-field"));
  }

  function parallax(scroller) {
    var top = scroller.scrollTop !== undefined && scroller !== document ? scroller.scrollTop : window.scrollY;
    var figs = (scroller.querySelectorAll ? scroller : document).querySelectorAll(".depth-field figure, .works figure");
    figs.forEach(function (fig) {
      var depth = parseFloat(fig.dataset.depth) || 1;
      fig.style.translate = "0 " + ((1 - depth) * top * 0.28).toFixed(1) + "px";
    });
  }

  function play(video) {
    video.muted = true;
    if (!video.getAttribute("src")) video.src = video.dataset.src;
    var pending = video.play();
    if (pending && pending.catch) pending.catch(function () {});
  }

  function watchVideos(root) {
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
  var near = null;
  var zoom = 1;
  var waveOn = false;
  var wavePushed = false;
  var waveEl = null;

  function setZoom(next, originX, originY) {
    zoom = Math.max(1, Math.min(2.8, next));
    var box = layer && layer.querySelector(".depth-field");
    if (!box) return;
    box.style.transform = zoom === 1 ? "" : "scale(" + zoom.toFixed(3) + ")";
    if (originX != null) box.style.transformOrigin = originX + "px " + originY + "px";
  }

  function clearNear() {
    if (!near) return;
    near.classList.remove("near");
    near = null;
  }

  function ensure() {
    if (layer) return layer;
    layer = document.createElement("div");
    layer.className = "depth";
    layer.hidden = true;
    layer.setAttribute("role", "region");
    layer.setAttribute("aria-label", "Frames");
    document.body.appendChild(layer);
    layer.addEventListener("scroll", function () { parallax(layer); }, { passive: true });
    layer.addEventListener("click", function (event) {
      var fig = event.target.closest("figure");
      if (!fig || !layer.contains(fig)) return;
      fig.classList.toggle("cap");
      var now = performance.now();
      if (fig === layer._fig && now - layer._figT < 450) {
        clearNear();
        fig.classList.add("near");
        near = fig;
      }
      layer._fig = fig;
      layer._figT = now;
    });
    return layer;
  }

  function note() {
    var text = NOTES[where.id];
    if (!text || !layer || layer.querySelector(".v5-note")) return;
    var p = document.createElement("p");
    p.className = "v5-note";
    p.textContent = text;
    var head = layer.querySelector(".depth-head");
    if (head) head.insertAdjacentElement("afterend", p);
    else layer.insertBefore(p, layer.firstChild);
  }

  function ensureHead(el) {
    if (el.querySelector(".depth-head")) return;
    var h1 = document.querySelector("main h1");
    if (!h1) return;
    var head = document.createElement("div");
    head.className = "depth-head";
    var title = document.createElement("p");
    title.className = "depth-title";
    title.textContent = h1.textContent.replace(/\s+/g, " ").trim();
    head.appendChild(title);
    var labels = [];
    document.querySelectorAll(".credits td.l").forEach(function (td) {
      var text = td.textContent.replace(/\s+/g, " ").trim();
      if (text) labels.push(text);
    });
    if (!labels.length) {
      var by = document.querySelector("main .by");
      if (by) labels.push(by.textContent.replace(/\s+/g, " ").trim());
    }
    if (labels.length) {
      var role = document.createElement("p");
      role.className = "depth-role";
      role.textContent = labels.join(" · ");
      head.appendChild(role);
    }
    el.insertBefore(head, el.firstChild);
  }

  function show() {
    var list = items();
    if (!list.length || open) return;
    var el = ensure();
    if (!el.querySelector(".depth-field")) {
      ensureHead(el);
      el.appendChild(field(list));
      watchVideos(el);
      note();
    }
    el.hidden = false;
    el.scrollTop = 0;
    document.body.classList.add("depth-open");
    var main = document.querySelector("main");
    if (main) main.setAttribute("aria-hidden", "true");
    open = true;
    requestAnimationFrame(function () { layout(el); });
    if (location.hash !== HASH && location.hash !== "#wave") {
      history.pushState({ depth: 1 }, "", HASH);
      pushed = true;
    }
  }

  function hide(fromPop) {
    if (!open) return;
    open = false;
    clearNear();
    setZoom(1);
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

  function openWave() {
    if (where.id !== "sound" || waveOn) return;
    if (!waveEl) {
      waveEl = document.createElement("div");
      waveEl.className = "wave-ov";
      waveEl.hidden = true;
      var frame = document.createElement("iframe");
      frame.title = "Sound";
      frame.setAttribute("allow", "autoplay");
      waveEl.appendChild(frame);
      document.body.appendChild(waveEl);
    }
    var frame = waveEl.querySelector("iframe");
    if (!frame.getAttribute("src") || frame.getAttribute("src") === "about:blank") frame.src = WAVE;
    waveEl.hidden = false;
    document.body.classList.add("wave-open");
    waveOn = true;
    if (location.hash !== "#wave") {
      history.pushState({ wave: 1 }, "", "#wave");
      wavePushed = true;
    }
  }

  function closeWave(fromPop) {
    if (!waveOn) return;
    waveOn = false;
    var frame = waveEl.querySelector("iframe");
    frame.src = "about:blank";
    waveEl.hidden = true;
    document.body.classList.remove("wave-open");
    if (!fromPop && wavePushed) {
      wavePushed = false;
      history.back();
    } else if (!fromPop && location.hash === "#wave") {
      history.replaceState({ depth: open ? 1 : 0 }, "", location.pathname + location.search + (open ? HASH : ""));
    }
  }

  function atBottom() {
    var doc = document.documentElement;
    return window.scrollY + window.innerHeight >= doc.scrollHeight - 16;
  }

  function depthAtBottom() {
    if (!layer) return false;
    return layer.scrollTop + layer.clientHeight >= layer.scrollHeight - 24;
  }

  function fillInline(node) {
    withCatalog(function () {
      var list = items();
      if (!list.length || node.querySelector(".depth-field")) return;
      node.appendChild(field(list));
      watchVideos(node);
      requestAnimationFrame(function () { layout(node); });
    });
  }

  var works = document.querySelector(".works");
  if (works) {
    requestAnimationFrame(function () { scatter(works); });
    window.addEventListener("resize", function () { scatter(works); });
  }
  window.addEventListener("scroll", function () { parallax(document); }, { passive: true });

  document.addEventListener("click", function (event) {
    var capFig = event.target.closest("#catalog figure, #depth-root figure");
    if (capFig) capFig.classList.toggle("cap");
  });

  var inline = document.getElementById("depth-root");
  if (inline) {
    fillInline(inline);
    window.addEventListener("resize", function () { layout(inline); });
    return;
  }

  var catalog = document.getElementById("catalog");
  if (catalog) {
    fillInline(catalog);
    window.addEventListener("resize", function () { layout(catalog); });
  }

  withCatalog(function () {
    if (location.hash === HASH || location.hash === "#wave") show();
    if (location.hash === "#wave" && where.id === "sound") openWave();
  });

  document.addEventListener("click", function (event) {
    if (event.target.closest("a, audio, video, button, input, textarea, .scope")) return;
    if (where.id === "sound" && event.target.closest(".track")) {
      event.preventDefault();
      openWave();
      return;
    }
    if (open) return;
    if (event.target.closest(".stills, .works, .track")) {
      event.preventDefault();
      withCatalog(show);
    }
  });

  window.addEventListener("wheel", function (event) {
    if (open && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      var rect = layer.getBoundingClientRect();
      setZoom(zoom * (event.deltaY < 0 ? 1.08 : 0.92), event.clientX - rect.left, event.clientY - rect.top + layer.scrollTop);
      return;
    }
    if (event.deltaY < 12) return;
    if (open && where.id === "sound" && depthAtBottom()) openWave();
    else if (!open && !waveOn && atBottom()) withCatalog(show);
  }, { passive: false });

  var touchY = null;
  var pinch = null;
  window.addEventListener("touchstart", function (event) {
    touchY = event.touches[0] ? event.touches[0].clientY : null;
    if (open && event.touches.length === 2) {
      var dx = event.touches[0].clientX - event.touches[1].clientX;
      var dy = event.touches[0].clientY - event.touches[1].clientY;
      pinch = { dist: Math.hypot(dx, dy), zoom: zoom };
    }
  }, { passive: true });
  window.addEventListener("touchmove", function (event) {
    if (!open || !pinch || event.touches.length < 2) return;
    var dx = event.touches[0].clientX - event.touches[1].clientX;
    var dy = event.touches[0].clientY - event.touches[1].clientY;
    setZoom(pinch.zoom * (Math.hypot(dx, dy) / pinch.dist));
  }, { passive: true });
  window.addEventListener("touchend", function (event) {
    if (event.touches.length < 2) pinch = null;
    if (touchY == null || !event.changedTouches[0]) return;
    var dy = touchY - event.changedTouches[0].clientY;
    touchY = null;
    if (dy < 40) return;
    if (open && where.id === "sound" && depthAtBottom()) openWave();
    else if (!open && !waveOn && atBottom()) withCatalog(show);
  }, { passive: true });

  var back = document.querySelector("a.back");
  if (back) {
    back.addEventListener("click", function (event) {
      if (near) {
        event.preventDefault();
        clearNear();
        return;
      }
      if (zoom > 1.02) {
        event.preventDefault();
        setZoom(1);
        return;
      }
      if (waveOn) {
        event.preventDefault();
        closeWave(false);
        return;
      }
      if (!open) return;
      event.preventDefault();
      hide(false);
    });
  }

  window.addEventListener("popstate", function () {
    if (waveOn && location.hash !== "#wave") closeWave(true);
    if (location.hash === "#wave" && where.id === "sound") {
      if (!open) withCatalog(show);
      openWave();
      return;
    }
    if (location.hash === HASH) {
      if (!open) withCatalog(show);
    } else if (open) {
      pushed = false;
      hide(true);
    }
  });

  window.addEventListener("resize", function () { if (layer) layout(layer); });
})();
