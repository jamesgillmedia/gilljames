// Service worker: caches the app shell + images for quick re-opening. Video files and the
// cedar-studio folder are never cached here (they stream with Range requests from the server).
const V='gj-v3';
const SHELL=['./','index.html','css/app.css','css/fonts.css','js/app.js','data.json','manifest.webmanifest',
 'fonts/JuliusSansOne-400-latin.woff2','fonts/Poppins-200-latin.woff2','fonts/Poppins-300-latin.woff2','fonts/Poppins-400-latin.woff2','fonts/NotoSansCanAb-subset.woff2',
 'icons/icon-192.png','media/all-in-one-2026-preview-poster.jpg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request, u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin||r.headers.has('range')||/\.mp4$/.test(u.pathname)||u.pathname.includes('/cedar-studio/')||u.pathname.includes('/gilljames-v1/')||u.search.includes('dl=1')) return;
  if(r.mode==='navigate'||/\.(html|json|js|css|webmanifest)$/.test(u.pathname)){   // network first
    e.respondWith(fetch(r).then(res=>{const c=res.clone(); caches.open(V).then(x=>x.put(r,c)); return res;}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))));
    return;
  }
  if(/\/(img|fonts|icons|media)\//.test(u.pathname)){   // cache first for images/fonts
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{ if(res.ok){const c=res.clone(); caches.open(V).then(x=>x.put(r,c));} return res;})));
  }
});
