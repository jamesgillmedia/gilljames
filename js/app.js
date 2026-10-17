(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const toast=(m)=>{const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>t.hidden=true,1800)};
const fmtMB=b=>(b/1e6).toFixed(1)+' MB';

// ---------- reel: 720p by default (phones), 1080p on wide screens or via the HD toggle
$$('.reel[data-hd]').forEach(r=>{
  const v=$('video',r), btn=$('[data-hdtoggle]',r), q=$('.q',r);
  const set=(hd)=>{
    const want=hd?r.dataset.hd:r.dataset.sd; if(v.getAttribute('src')===want) return;
    const t=v.currentTime, playing=!v.paused;
    v.setAttribute('src',want); if(hd&&v.dataset.posterHd) v.poster=v.dataset.posterHd;
    v.load(); if(t) v.addEventListener('loadedmetadata',()=>{v.currentTime=t; if(playing) v.play().catch(()=>{});},{once:true});
    btn.classList.toggle('on',hd); btn.setAttribute('aria-label',hd?'Play in 720p':'Play in 1080p'); q.textContent=hd?'1080p':'720p';
  };
  if(matchMedia('(min-width:1000px)').matches && !(navigator.connection&&navigator.connection.saveData)) set(true);
  btn.addEventListener('click',()=>set(v.getAttribute('src')!==r.dataset.hd));
});
$$('[data-copy]').forEach(b=>b.addEventListener('click',async()=>{
  const u=new URL(b.dataset.copy,location.href).href;
  try{ if(navigator.share&&matchMedia('(pointer:coarse)').matches){await navigator.share({url:u,title:'gill james reel'});return;}
       await navigator.clipboard.writeText(u); toast('Link copied'); }catch(e){ prompt('Link',u); }
}));

// hero play button: scroll to the reel and start it (tap = user gesture, so sound is allowed)
$('.hero .btn-round.big').addEventListener('click',e=>{e.preventDefault(); $('#reels').scrollIntoView({behavior:'smooth'}); $('#v2026').play().catch(()=>{});});

// ---------- optional slot: Demo Reel 2025 (appears only when the file exists)
(async()=>{
  const r=$('#reel-2025'); if(!r) return;
  try{ const res=await fetch(r.dataset.file,{method:'HEAD',cache:'no-store'});
    if(res.ok&&(res.headers.get('content-type')||'').includes('video')){
      const v=$('video',r); v.poster=v.dataset.poster; v.src=r.dataset.file; const n=+res.headers.get('content-length'); if(n) $('.sz',r).textContent=fmtMB(n);
      r.hidden=false; $('#reel-2025-empty').hidden=true; }
  }catch(e){}
})();

// ---------- studio targets: "coming soon" when missing
$$('[data-check]').forEach(async a=>{
  const st=$('.st',a);
  try{ const res=await fetch(a.dataset.check,{method:'HEAD',cache:'no-store'});
    if(res.ok){ st.textContent='open'; } else throw 0;
  }catch(e){ a.classList.add('soon'); a.removeAttribute('href'); a.setAttribute('aria-disabled','true'); st.textContent='coming soon'; }
});

// ---------- data-driven parts
const pic=(s,alt,sizes)=>`<picture><source type="image/webp" srcset="${s.webp}"><img src="${s.jpg}" alt="${esc(alt)}" width="${s.w}" height="${s.h}" loading="lazy" decoding="async"></picture>`;
fetch('data.json').then(r=>r.json()).then(d=>{
  $('#poem').textContent=d.poem; $('#bio').textContent=d.bio;

  // films
  const fg=$('#films');
  fg.innerHTML=d.films.map(f=>`<a class="film" data-cat="${f.cat}" href="${esc(f.url)}" target="_blank" rel="noopener">
    <div class="th">${f.thumb?pic(f.thumb,f.title):''}${f.duration?`<span class="du">${esc(f.duration.replace(/^00:/,'0:'))}</span>`:''}
    <span class="pl">${esc(f.platform)}<svg><use href="#i-out"/></svg></span></div>
    <div class="tx"><div class="t">${esc(f.title)}</div>${f.client?`<div class="c">${esc(f.client)}</div>`:''}</div></a>`).join('');
  chips('#film-chips',f=>$$('.film',fg).forEach(el=>el.hidden=!(f==='all'||el.dataset.cat===f)));

  // galleries
  const gal=(el,items)=>{ el.innerHTML=items.map((p,i)=>`<button data-i="${i}" data-kind="${p.kind}" aria-label="Open image ${i+1}">${pic(p.src.t,'')}</button>`).join('');
    el.addEventListener('click',e=>{const b=e.target.closest('button[data-i]'); if(b) openLB(items,+b.dataset.i,el);}); };
  gal($('#photos'),d.photos); gal($('#joio'),d.joio);
  chips('#photo-chips',f=>$$('#photos button').forEach(el=>el.hidden=!(f==='all'||el.dataset.kind===f)));
}).catch(e=>console.error('data.json',e));

function chips(sel,fn){ const c=$(sel); c.addEventListener('click',e=>{const b=e.target.closest('button'); if(!b) return;
  $$('button',c).forEach(x=>x.classList.toggle('on',x===b)); fn(b.dataset.f);}); }

// tabs
$$('.seg button').forEach(b=>b.addEventListener('click',()=>{
  $$('.seg button').forEach(x=>x.setAttribute('aria-selected',x===b));
  $$('.tab').forEach(t=>t.hidden=t.id!=='tab-'+b.dataset.tab);
}));

// ---------- lightbox
const lb=$('#lb'), lbImg=$('img',lb), lbSrc=$('source',lb); let cur=[], ci=0;
function visible(items,el){ return items.map((p,i)=>i).filter(i=>{const b=el.querySelector(`button[data-i="${i}"]`); return b&&!b.hidden;}); }
function openLB(items,i,el){ cur=visible(items,el).map(k=>items[k]); ci=cur.indexOf(items[i]); show(); lb.hidden=false; document.body.style.overflow='hidden'; history.pushState({lb:1},''); }
function show(){ const p=cur[ci].src.l; lbSrc.srcset=p.webp; lbImg.src=p.jpg; $('.lb-c',lb).textContent=`${ci+1} / ${cur.length}`; }
function close(){ if(lb.hidden) return; lb.hidden=true; document.body.style.overflow=''; lbImg.removeAttribute('src'); }
const step=n=>{ci=(ci+n+cur.length)%cur.length; show();};
$('.lb-x',lb).onclick=()=>history.back(); $('.lb-p',lb).onclick=()=>step(-1); $('.lb-n',lb).onclick=()=>step(1);
lb.addEventListener('click',e=>{if(e.target===lb) history.back();});
addEventListener('popstate',close);
addEventListener('keydown',e=>{ if(lb.hidden) return; if(e.key==='Escape') history.back(); if(e.key==='ArrowLeft') step(-1); if(e.key==='ArrowRight') step(1); });
let sx=null; lb.addEventListener('touchstart',e=>sx=e.touches[0].clientX,{passive:true});
lb.addEventListener('touchend',e=>{ if(sx===null) return; const dx=e.changedTouches[0].clientX-sx; if(Math.abs(dx)>45) step(dx<0?1:-1); sx=null; });

// ---------- dock highlight
const secs=$$('main .sec'), links=$$('.dock a');
const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting) links.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id)); }),{rootMargin:'-45% 0px -50% 0px'});
secs.forEach(s=>io.observe(s));

// ---------- PWA
if('serviceWorker' in navigator) addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
})();
