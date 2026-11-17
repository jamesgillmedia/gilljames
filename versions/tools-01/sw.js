/* Offline shell. Everything the prototype needs is these few files; state lives in localStorage and is never touched here.
   Cache first, so a dead network changes nothing. Bump the name when a file changes. */
var NAME = "gj-tools-v1";
var FILES = ["./", "index.html", "app.css", "store.js", "sky.js", "app.js", "manifest.webmanifest",
  "fonts/poppins-200.woff2", "fonts/poppins-300.woff2", "fonts/julius-sans-one.woff2", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png"];
self.addEventListener("install", function (e) { e.waitUntil(caches.open(NAME).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k.indexOf("gj-tools-") === 0 && k !== NAME; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
    return hit || fetch(e.request).then(function (res) { return res; }).catch(function () { return caches.match("index.html"); });
  }));
});
