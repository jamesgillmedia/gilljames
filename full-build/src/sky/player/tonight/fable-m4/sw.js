/* fable-m4 · the offline service worker (rebuild port 3).
   What it keeps: the sky's own shell (this page, its styles and scripts, data.json, the fonts, the Mark icons), every page of
   this folder you have opened, and the pictures you have already seen. With no connection the sky still opens from the home
   screen and every place you have been still draws.
   What it never does: serve an old copy while you are online. Pages, scripts and styles are asked from the network first and
   the kept copy is only the fallback, so a new build shows on the next load. Film and sound are streamed and are not kept.
   Paths are resolved from the worker's own folder, so the build can sit at any address. */
var VERSION='gj-m4-v4',SHELL=VERSION+'-shell',SEEN=VERSION+'-seen';
var SEEN_MAX=600,FILE_MAX=4*1024*1024;
var PRECACHE=[
  './',
  './index.html',
  './manifest.webmanifest',
  './data.json',
  './beyond-index.json',
  './css/sky.css',
  './css/aboutcalc.css',
  './css/dial.css',
  './css/drawer.css',
  './css/framerail.css',
  './css/filmplayer.css',
  './css/gallery-gap.css',
  './../_tn/back.css',
  './css/beyond.css',
  './../../../../../chrome.css',
  './js/theme.js',
  './../_tn/back.js',
  './js/reelshots.js',
  './js/reelframes.js',
  './js/framerail.js',
  './js/reelview.js',
  './js/joio.js',
  './js/copy.js',
  './js/frames.js',
  './js/nov9.js',
  './js/inner.js',
  './js/framing.js',
  './js/variants.js',
  './js/loopframes.js',
  './js/filmplayer.js',
  './js/depth.js',
  './js/layers.js',
  './js/opening.js',
  './js/sky.js',
  './js/beyond.js',
  './js/beyonddial.js',
  './js/playback.js',
  './js/debug.js',
  './js/aboutcalc.js',
  './js/dial.js',
  './js/tune.js',
  './../_tn/swipe.js',
  './../../../../../chrome.js',
  './../../../../../graph.js',
  './js/scope.js',
  './js/markplayer.js',
  './css/markplayer.css',
  './media/mark/frames.json',
  './media/mark/atlas.webp',
  './js/filmpage.js',
  './css/scope.css',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './media/pro2/fonts/julius-sans-one.woff2',
  './media/pro2/fonts/noto-canadian-aboriginal-subset.woff2',
  './media/pro2/fonts/poppins-200.woff2',
  './media/pro2/fonts/poppins-300.woff2',
  './list/',
  './contact/'
];
function abs(u){return new URL(u,self.registration.scope).href}
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(SHELL).then(function(c){
    return Promise.all(PRECACHE.map(function(u){return c.add(new Request(abs(u),{cache:'reload'})).catch(function(){})}));
  }).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k.indexOf('gj-m4-')===0&&k.indexOf(VERSION)!==0}).map(function(k){return caches.delete(k)}));
  }).then(function(){return self.clients.claim()}));
});
function isPicture(p){return /\.(png|jpe?g|gif|webp|avif|svg|ico|woff2?)$/i.test(p)}
function isStream(p){return /\.(mp4|webm|mov|m4v|mp3|m4a|wav|ogg|aac)$/i.test(p)}
function keep(name,req,res){
  if(!res||res.status!==200||res.type==='opaque')return;
  var len=+(res.headers.get('content-length')||0);if(len>FILE_MAX)return;
  var copy=res.clone();
  caches.open(name).then(function(c){return c.put(req,copy).then(function(){
    if(name!==SEEN)return;
    return c.keys().then(function(ks){if(ks.length>SEEN_MAX)return Promise.all(ks.slice(0,ks.length-SEEN_MAX).map(function(k){return c.delete(k)}))});
  })}).catch(function(){});
}
self.addEventListener('fetch',function(e){
  var req=e.request;if(req.method!=='GET'||req.headers.has('range'))return;
  var url;try{url=new URL(req.url)}catch(err){return}
  if(url.origin!==self.location.origin||isStream(url.pathname))return;
  /* pictures and fonts never change under the same name: the kept copy first */
  if(isPicture(url.pathname)){
    e.respondWith(caches.match(req).then(function(hit){
      return hit||fetch(req).then(function(res){keep(SEEN,req,res);return res});
    }));
    return;
  }
  /* pages, scripts, styles, data: the network first; the kept copy only when there is no connection */
  var page=req.mode==='navigate'||req.destination==='document';
  e.respondWith(fetch(req).then(function(res){keep(SHELL,req,res);return res}).catch(function(){
    return caches.match(req).then(function(hit){
      if(hit)return hit;
      return caches.match(req,{ignoreSearch:true}).then(function(h2){
        if(h2||!page)return h2||Response.error();
        /* a page of the sky that was never opened on its own (index.html?sky=1, a deep link): the sky itself */
        return caches.match(abs('./index.html')).then(function(h3){return h3||caches.match(abs('./'))}).then(function(h4){return h4||Response.error()});
      });
    });
  }));
});
