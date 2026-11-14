/* tonight: service worker disabled in the integrated preview (never touches any cache). */
self.addEventListener('install',function(){self.skipWaiting()});
self.addEventListener('activate',function(e){e.waitUntil(self.clients.claim())});
