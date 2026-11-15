/* Quiet offline cache for the full-build preview.
   Versioned: a new VERSION drops old caches on activate.
   Paths are resolved from registration.scope so the preview subfolder stays valid. */
var VERSION = "gj-offline-v1";
var SHELL = VERSION + "-shell";
var MEDIA = VERSION + "-media";
var MEDIA_MAX = 48;
var MEDIA_BYTES = 28 * 1024 * 1024;
var MEDIA_FILE_MAX = 4 * 1024 * 1024;

var PRECACHE = [
  "./",
  "./index.html",
  "./chrome.js",
  "./chrome.css",
  "./blend.js",
  "./blend.css",
  "./data.js",
  "./rooms.json",
  "./manifest.webmanifest",
  "./icons/mark-192.png",
  "./icons/mark-512.png",
  "./fonts/noto-canadian-aboriginal-subset.woff2",
  "./fonts/julius-sans-one.woff2",
  "./fonts/poppins-300.woff2",
  "./modules/camera-dial/camera-dial.js"
];

function abs(u) { return new URL(u, self.registration.scope).href; }

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(SHELL).then(function (cache) {
      return Promise.all(PRECACHE.map(function (u) {
        return cache.add(abs(u)).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k.indexOf(VERSION) !== 0; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function isMedia(url) {
  return /\.(png|jpe?g|gif|webp|avif|svg|mp3|wav|m4a|ogg|mp4|webm|woff2?|ttf|otf)(\?|$)/i.test(url);
}
function isCode(url) {
  return /\.(js|css|json|webmanifest|html)(\?|$)/i.test(url) || /\/(index\.html)?$/.test(new URL(url).pathname);
}

function trimMedia(cache) {
  return cache.keys().then(function (reqs) {
    if (reqs.length <= MEDIA_MAX) return;
    return Promise.all(reqs.slice(0, reqs.length - MEDIA_MAX).map(function (r) { return cache.delete(r); }));
  });
}

function putMedia(req, res) {
  if (!res || !res.ok || res.status !== 200 || res.type === "opaque") return Promise.resolve();
  var len = parseInt(res.headers.get("content-length") || "0", 10);
  if (len > MEDIA_FILE_MAX) return Promise.resolve();
  var copy = res.clone();
  return caches.open(MEDIA).then(function (cache) {
    return cache.put(req, copy).then(function () { return trimMedia(cache); });
  }).catch(function () {});
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;

  /* navigations: network first, then the cached page or the field shell */
  if (req.mode === "navigate" || (req.destination === "document")) {
    e.respondWith(
      fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(SHELL).then(function (c) { c.put(req, copy); }).catch(function () {});
        }
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) {
          return hit || caches.match(abs("./index.html")) || caches.match(abs("./"));
        });
      })
    );
    return;
  }

  if (isCode(url.href)) {
    e.respondWith(
      caches.match(req).then(function (hit) {
        var net = fetch(req).then(function (res) {
          if (res && res.ok) {
            var copy = res.clone();
            caches.open(SHELL).then(function (c) { c.put(req, copy); }).catch(function () {});
          }
          return res;
        });
        return hit || net.catch(function () { return hit; });
      })
    );
    return;
  }

  if (isMedia(url.href)) {
    e.respondWith(
      caches.match(req).then(function (hit) {
        if (hit) return hit;
        return fetch(req).then(function (res) {
          putMedia(req, res);
          return res;
        });
      })
    );
  }
});
