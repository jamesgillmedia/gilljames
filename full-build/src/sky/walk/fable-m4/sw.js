/* Shell only. Video and audio are never stored; everything else off this origin streams.
   The cache name follows this folder, so a copy (u4 beside u3) does not share a shell. */
var SHELL_REV = '107';
var FOLDER = new URL('./', self.location).pathname.replace(/\/+$/, '') || '/';
var CACHE = 'shell-' + FOLDER + '-' + SHELL_REV;
var SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/sky.css',
  './css/page.css',
  './js/sky.js',
  './js/opening.js',
  './js/reelshots.js',
  './js/reelview.js',
  './js/joio.js',
  './js/copy.js',
  './js/frames.js',
  './js/layers.js',
  './js/nov9.js',
  './js/inner.js',
  './js/framing.js',
  './js/depth.js',
  './js/debug.js',
  './js/songtap.js',
  './data.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) {
    return cache.addAll(SHELL);
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('shell-' + FOLDER + '-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

/* fable-m4: objects-3d/ is its own page; the shell never caches it. */
var OWN = ['objects-3d/'].map(function (p) { return new URL(p, self.location).pathname; });

function isMedia(url) {
  return /\.(mp4|webm|m4v|mov|ogv|mp3|m4a|ogg|wav|aac)(\?|$)/i.test(url.pathname);
}

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (OWN.some(function (p) { return url.pathname.indexOf(p) === 0; })) return;
  if (isMedia(url)) return;
  if (req.headers.get('range')) return;
  event.respondWith(caches.open(CACHE).then(function (cache) {
    return cache.match(req).then(function (hit) {
      var fresh = fetch(req).then(function (res) {
        if (res && res.ok && SHELL.some(function (p) { return url.pathname.endsWith(p.replace('./', '/')) || url.pathname.endsWith(p.slice(1)); })) {
          cache.put(req, res.clone());
        }
        return res;
      }).catch(function () { return hit; });
      return hit || fresh;
    });
  }));
});
