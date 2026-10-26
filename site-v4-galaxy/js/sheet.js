/* gill james v3.1 · the constellation sheet. The whole site is one sky: ᑕᐣᓯ at the centre, five chapter constellations.
   One camera (canvas for the sky + a GPU-transformed DOM layer for near cards). Pinch drives the camera continuously,
   anchored under the fingers; release snaps to a level. Zooming into a chapter makes its stars travel and grow into
   thumbnails until they ARE the v3 grid (the column underneath is lined up, then the sheet hands over).
   Levels:  #sky (L-1, whole site) · #sky/film (one constellation, names) · #all (every work as one massive grid).
   One finger on the sheet pans; on the column it scrolls natively (the sheet is a separate full-screen layer). */
/* HYBRID-Y v1 (Oct 19, site-hybrid-y; Gill: "yesterday's with a hybrid approach"): yesterday's v3.5.1 sheet, byte-for-byte, except
   the release/settle rule: let go within x/÷1.15 of the whole-sky or a constellation's zoom = yesterday's eased snap onto that level;
   further from any level = the view rests where it is (pan on at that depth). Plus PINCH-ON-LABEL. Speeds, easing, gain, morph, handover unchanged. */
/* FLY-SITE v1 (Oct 19, site-v38; Gill: "a version of this could work, but integrated into the current system; the locks need to happen at
   key moments or you can scroll" + "closer to the site design ... more dimensional ... keeping the non-buggy nature").
   Built on HYBRID-Y v1 (= live v3.5.1 sheet + hybrid settle + PINCH-ON-LABEL). The look at rest is the live site: same framing, scale,
   distances, type. Added, all light:
   KEY MOMENTS  the whole sky · each constellation · that constellation "opened" (names grow + a detail line, its stars become small
     thumbnails in place) · the grid handover. Let go near one = yesterday's eased snap onto it; anywhere else the view rests where you let
     go (pan at any depth). While a pinch/wheel passes a key moment the zoom slows a little (a soft detent; it never stops or reverses).
     A pan that ends close to a locked view (same depth, within ~1/5 screen) eases back onto it; further = rests.
   SOUND  the Sound constellation goes straight to the player (sound/): tap its name or star in the sky, + from it, or pinch past it.
     Its works (and the waveform tile) are unchanged.
   v38b (Oct 20, QA fixes): a plain wheel notch skips the detent (rests or steps, never snaps back) · constellation/opened windows split at
     sqrt(1.25) ~ x1.118 · dust tilt settles by time (exp(-dt/150)) · tilt gain .035 (a brisk swipe ~1.3 deg, cap 1.5).
   DIMENSION  a sparse twinkling dust layer (own small canvas, its own parallax, a gentle turn of at most 1.5 deg while you swipe that
     settles back), a slight dim on the constellations you are not looking at, a faint glow on the one you are, 1:1 pan with a short
     (<=520 ms) ease-out. Reduced motion: no twinkle, no turn, no ease-out (locks still snap, instantly). */
/* SOUND-ONE v1 (Oct 20, site-sound-one; Gill: "the zoom integration and the effect are way too extreme between the sounds and main.
   Should feel one piece. I liked the way the zoom worked on the 3d sketch."). Built on site-v38 v38b, byte-for-byte, except:
   Sound has no page jump any more. The 3D player (sound-v2) lives in this page, in a transparent layer over this sky
   (js/sound-one.js), with its stars lined up exactly on Sound's stars. Zooming into Sound flies the one camera on through depth;
   Sound's sky stars hand over to the player's stars as you come close (strands, names and the song list grow in), and the
   player's 1x view IS Sound "opened". Zooming the player back out below 1x flies the same camera back out into the sky.
   Changes here: Sound's stars/lines/nebula/names fade by SNDA (set by sound-one.js), no thumbnails in place for Sound, toPlayer()
   and the pinch/wheel/pan release near Sound hand over to sound-one.js, the frame hook, and window.__sheetOne. */
/* v4b (Oct 22; Gill's v4 feedback): LOCK  one lock depth for every chapter, ~8.25 thumbnails across the screen (lockS), pan around
   at it (rests where you let go, clamped to the chapter: never lost) · IMAGE FIRST  thumbnails grow in on the approach, a near tile
   shows its real image or a tiny once-played clip (DOM layer .snear), names fade in only close to the lock · PINCH-THROUGH  past the
   lock a pinch/wheel keeps flying into the item under it and opens the work from that tile (INTO); pinch out goes back to the lock. */
/* v4c (Oct 22, site-v4-galaxy; Gill: "still feels flat as you navigate inward" -> "a light touch... borrow the visual language" of the
   previews board). v4b byte-for-byte in behaviour (LOCK ~8.25 across, IMAGE FIRST, PINCH-THROUGH, navigation, SOUND-ONE), plus:
   OPEN-K    each constellation opens with the zoom, eased over a longer stretch of the pinch (1-1.35x its view, was 1.05-1.25x) and
             weighted by how centred it is (previews openK): the one you are in opens fully (always full at the lock, as v4b); a neighbour
             opens partly as you pan towards it, so there is no pop when the nearest one switches.
   GROW      stars cross-fade into their thumbnails (no hard switch at 7 px); names rise ~4 px as they fade in late.
   LINKS     figure lines thin out as a constellation opens and faint time-line threads take over
             (each work to the next in time, short hops only, fading with length).
   FOCUS     the constellations you are not in fade a little further as you zoom deeper (to ~45%, never hidden).
   FLIGHT    the grid morph's ripple is a touch wider and each tile lifts ~6% mid-flight, landing exactly on the grid.
   SWELL     the existing star-field parallax (FIELD + dust) swells in depth during long flights (site-v3-3d DEP), cheap: transforms only.
   AGE       older work is only slightly dimmer: brightness floor .75 (veil <= .2), no size change, never hidden; fades out into the grid.
   SELECT    one press selects a work (mint frame + title), a press on the selected one opens it (see SELI/tap below; the column's
             tiles: js/select.js). Pinch and drag never count as a press.
   LAND      the move-in ends on site-v3's board: pinching on from the lock (or +) morphs the constellation into the grid and hands
             over to the real column (dive.js level 2, native scroll). v4b's pinch-through into a single work is cut for this.
   PICKS     any work listed in PICKS ('chapter/key', e.g. 'film/w24') or flagged "pick":true in its data-j is always full brightness. */
(function(){
'use strict';
var PICKS=[]; /* v4c PICKS: e.g. ['film/w24','photo/w5']. Empty for now: Gill names their picks. Or add "pick": true to an item's data-j. */
var D=document.documentElement,$=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
var sheet=$('.sheet');if(!sheet||!window.__dive)return;
var RM=matchMedia('(prefers-reduced-motion: reduce)');function anim(){return !RM.matches}
var SF=[],cv=$('canvas',sheet),ctx=cv.getContext('2d'),world=$('.sw',sheet),hud=$('.slabs',sheet),crumb=$('.crumb',sheet),hint=$('.shint',sheet);
var W=0,H=0,dpr=1,TOP=56;
/* ---------- the world: read the real chapters from the column ---------- */
var ORDER=['film','photo','objects','sound','about'],ANG={about:-90,photo:-18,objects:54,sound:126,film:198},R0=450; /* v4a: constellations closer together (was 560): the next one is always in view */
var C={},ITEMS=[];
/* v3.3 constellations: each chapter is its designed star cluster (x,y over a 2:1 box centred on the chapter star, b brightness, stray); works sit on the brightest points */
var SH={"film":{"t":"150,220,255","s":[[0.105,0.21,0.92,0],[0.89,0.13,0.74,0],[0.93,0.81,0.96,0],[0.065,0.86,0.68,0],[0.209,0.266,0.34,0],[0.33,0.252,0.44,0],[0.465,0.272,0.3,0],[0.685,0.23,0.4,0],[0.809,0.261,0.3,0],[0.201,0.781,0.4,0],[0.297,0.725,0.28,0],[0.431,0.764,0.44,0],[0.533,0.752,0.3,0],[0.679,0.775,0.38,0],[0.816,0.721,0.3,0],[0.075,0.53,0.36,0],[0.485,0.5,0.5,0],[0.98,0.44,0.22,1],[0.025,0.3,0.2,1],[0.58,0.04,0.2,1],[0.35,0.95,0.24,1]],"e":[[0,1],[1,2],[2,3],[3,15]]},"photo":{"t":"170,245,212","s":[[0.505,0.51,1.0,0],[0.521,0.164,0.82,0],[0.686,0.425,0.62,0],[0.654,0.71,0.9,0],[0.49,0.851,0.58,0],[0.33,0.64,0.78,0],[0.336,0.268,0.66,0],[0.586,0.449,0.3,0],[0.564,0.618,0.36,0],[0.486,0.667,0.28,0],[0.433,0.551,0.38,0],[0.447,0.42,0.3,0],[0.522,0.344,0.34,0],[0.15,0.2,0.24,1],[0.84,0.86,0.2,1],[0.88,0.22,0.3,1]],"e":[[1,2],[2,3],[3,4],[5,6],[6,1],[1,7],[2,8],[3,9],[4,10],[5,11],[6,12]]},"objects":{"t":"255,236,205","s":[[0.32,0.37,0.78,0],[0.585,0.33,0.98,0],[0.605,0.89,0.74,0],[0.305,0.92,0.6,0],[0.465,0.12,0.5,0],[0.735,0.09,0.7,0],[0.755,0.63,0.55,0],[0.45,0.64,0.2,0],[0.18,0.22,0.26,1],[0.89,0.4,0.22,1],[0.8,0.92,0.3,1],[0.31,0.65,0.3,0]],"e":[[0,1],[1,2],[2,3],[3,11],[11,0],[4,5],[5,6],[0,4],[1,5],[2,6]]},"sound":{"t":"255,182,176","s":[[0.058,0.493,0.35,0],[0.143,0.434,0.45,0],[0.195,0.295,0.63,0],[0.186,0.645,0.45,0],[0.282,0.392,0.53,0],[0.338,0.216,0.8,0],[0.347,0.763,0.55,0],[0.441,0.135,0.92,0],[0.442,0.812,0.62,0],[0.498,0.253,0.71,0],[0.567,0.183,0.86,0],[0.57,0.827,0.58,0],[0.659,0.355,0.57,0],[0.718,0.259,0.66,0],[0.719,0.711,0.47,0],[0.807,0.434,0.44,0],[0.886,0.419,0.5,0],[0.941,0.497,0.35,0],[0.26,0.93,0.2,1],[0.61,0.06,0.24,1],[0.9,0.88,0.26,1],[0.15,0.7,0.3,1]],"e":[[2,3],[5,6],[7,8],[10,11],[13,14],[0,1],[1,2],[2,4],[4,5],[5,7],[7,9],[9,10],[10,12],[12,13],[13,15],[15,16],[16,17]]},"about":{"t":"214,222,236","s":[[0.309,0.271,0.7,0],[0.209,0.272,0.45,0],[0.113,0.366,0.6,0],[0.067,0.587,0.85,0],[0.103,0.808,0.5,0],[0.202,0.903,0.6,0],[0.31,0.882,0.55,0],[0.361,0.254,0.5,0],[0.46,0.301,0.4,0],[0.475,0.408,0.7,0],[0.422,0.569,0.42,0],[0.362,0.556,0.5,0],[0.583,0.94,0.65,0],[0.589,0.61,0.55,0],[0.681,0.587,0.5,0],[0.738,0.451,0.45,0],[0.748,0.224,0.9,0],[0.932,0.127,0.5,0],[0.963,0.206,0.8,0],[0.956,0.305,0.55,0],[0.917,0.366,0.36,0],[0.88,0.28,0.2,0],[0.45,0.92,0.22,1],[0.5,0.1,0.2,1]],"e":[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[7,8],[8,9],[9,10],[10,11],[12,13],[13,14],[14,15],[15,16],[17,18],[18,19],[19,20]]}},SBW=380,SBH=190;
function rnd(i){var x=Math.sin(i*12.9898+78.233)*43758.5453;return x-Math.floor(x)}
ORDER.forEach(function(k,ci){var sec=document.getElementById(k);if(!sec)return;var a=ANG[k]*Math.PI/180,cx=Math.cos(a)*R0,cy=Math.sin(a)*R0;
  var els=$$('.it',sec),n=els.length,S=SH[k],spt=S.s.map(function(p,i){return i}).filter(function(i){return !S.s[i][3]}).sort(function(p,q){return S.s[q][2]-S.s[p][2]||p-q}),ring=Math.min(n,spt.length),sq=sec.classList.contains('g-sq'),imgh=sq?104:58.5,pitch=imgh+44+12;
  var c=C[k]={k:k,ci:ci,x:cx,y:cy,n:n,sq:sq,imgh:imgh,pitch:pitch,items:[],count:($('.head .ct',sec)||{}).textContent||(n+''),bx:(ci-2)*372-164,by:-260,rad:0,tint:S.t,node:[],dec:[]};
  els.forEach(function(el,i){var sx,sy,pb=-1;
    if(i<ring){var sp=S.s[spt[i]];sx=cx+(sp[0]-.5)*SBW;sy=cy+(sp[1]-.5)*SBH;pb=sp[2]}
    else{var j=i-ring,aa2=j*2.39996+ci,rr2=235+Math.sqrt(j)*20;sx=cx+Math.cos(aa2)*rr2;sy=cy+Math.sin(aa2)*rr2}
    var col=i%3,row=(i/3)|0,gx=c.bx+col*112,gy=c.by+row*pitch;/* gy is live: rows close up into a dense wall when far, open to the column's spacing when near */
    var it={k:k,i:i,ring:i<ring,w:el.dataset.k,el:el,lab:(($('.cap b',el)||{}).textContent||'').trim(),meta:(($('.cap small',el)||{}).textContent||'').trim(),
      row:row,pv:el.dataset.pv||'',sc:el.dataset.sc||'',thumb:(($('.vis img',el)||{}).dataset||{}).src||'',sx:sx,sy:sy,gx:gx,gy:gy,stg:n>1?i/(n-1):0,x:sx,y:sy,mi:0,card:null,b:pb};
    var pj=false;try{pj=!!JSON.parse(el.dataset.j||'{}').pick}catch(e){}it.pick=pj||PICKS.indexOf(k+'/'+it.w)>=0;it.lum=it.pick?1:1-.25*it.stg; /* v4c AGE: 1 newest .. .75 oldest */
    if(i<ring)c.node[spt[i]]=it;c.rad=Math.max(c.rad,Math.hypot(sx-cx,sy-cy));c.items.push(it);ITEMS.push(it)});
  c.box={x0:Math.min.apply(0,c.items.map(function(q){return q.sx}).concat(cx)),x1:Math.max.apply(0,c.items.map(function(q){return q.sx}).concat(cx)),y0:Math.min.apply(0,c.items.map(function(q){return q.sy}).concat(cy)),y1:Math.max.apply(0,c.items.map(function(q){return q.sy}).concat(cy))};
  S.s.forEach(function(p,i){if(c.node[i])return;var d={x:cx+(p[0]-.5)*SBW,y:cy+(p[1]-.5)*SBH,b:p[2],st:p[3]};c.node[i]=d;c.dec.push(d);c.rad=Math.max(c.rad,Math.hypot(d.x-cx,d.y-cy))})});
ORDER.forEach(function(k){var c=C[k];if(!c)return;var its=c.items,ring=its.filter(function(i){return i.ring}),ex=its.filter(function(i){return !i.ring});c.sky=[];c.arm=[];c.grid=[];
  SH[k].e.forEach(function(e){var p=c.node[e[0]],q=c.node[e[1]];if(p&&q)c.sky.push([p,q])});
  ex.forEach(function(it,j){var to=j>=8?ex[j-8]:null;if(!to){var bd=1e9;ring.forEach(function(r){var d=Math.hypot(r.sx-it.sx,r.sy-it.sy);if(d<bd){bd=d;to=r}})}if(to)c.arm.push([it,to])});
  for(var i=0;i+1<its.length;i++)c.grid.push([its[i],its[i+1]]);for(var j=0;j+4<its.length;j+=5)c.grid.push([its[j],its[j+4]])});
var BOUND={x0:-R0*.951-190,x1:R0*.951+190,y0:-R0-190,y1:R0*.81+230};
/* ---------- sprites: star field tiles, glow, atlas ---------- */
function mk(w,h){var c=document.createElement('canvas');c.width=w;c.height=h;return c}
var FIELD=[[900,.12,.9],[260,.35,1.6]].map(function(L,li){var T=512,c=mk(T,T),g=c.getContext('2d');
  for(var i=0;i<L[0];i++){var m=Math.pow(rnd(li*9000+i),2.6),b=.05+.9*m,t=rnd(li*7000+i*3);g.fillStyle='rgba('+Math.round(205+50*t)+','+Math.round(220+15*t)+','+Math.round(255-60*t)+','+b.toFixed(3)+')';
    var r=.4+m*L[2];g.beginPath();g.arc(rnd(li*5000+i*7)*T,rnd(li*3000+i*11)*T,r,0,7);g.fill()}
  return{pat:null,c:c,d:L[1]}});
function glow(rgb,sz){var c=mk(sz,sz),g=c.getContext('2d'),gr=g.createRadialGradient(sz/2,sz/2,0,sz/2,sz/2,sz/2);gr.addColorStop(0,'rgba('+rgb+',.95)');gr.addColorStop(.18,'rgba('+rgb+',.45)');gr.addColorStop(.5,'rgba('+rgb+',.10)');gr.addColorStop(1,'rgba('+rgb+',0)');g.fillStyle=gr;g.fillRect(0,0,sz,sz);return c}
var GLOW=glow('205,225,255',128),GLOWC=glow('160,190,240',256);
ORDER.forEach(function(k){if(C[k]){C[k].glow=glow(C[k].tint,128);C[k].lt=C[k].tint.split(',').map(function(v){return Math.round(v*.45+215*.55)}).join(',')}});
var ATL=null,ATI={},ATH=282;(function(){var im=new Image();im.decoding='async';im.onload=function(){ATL=im;req();portalDraw()};
  fetch('img/sky-atlas.json').then(function(r){return r.json()}).then(function(j){ATI=j.items;ATH=j.h;im.src='img/sky-atlas.webp'}).catch(function(){})})();
FIELD.forEach(function(L,i){var d=document.createElement('i');d.className='sf';d.setAttribute('aria-hidden','true');d.style.backgroundImage='url('+L.c.toDataURL('image/png')+')';sheet.insertBefore(d,cv);SF.push(d)});
/* FLY-SITE v1: sparse dust: ~64 stars (36 on low-end) on their own canvas between the star tiles and the sky; idle twinkle redraws only this */
var DC=document.createElement('canvas');DC.setAttribute('aria-hidden','true');DC.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none';sheet.insertBefore(DC,cv);var dctx=DC.getContext('2d');
var LOW=(navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=2,ROT=0,DUST=[];for(var di0=0;di0<(LOW?36:64);di0++){var dm=Math.pow(rnd(8100+di0),2);DUST.push({u:rnd(8200+di0*7),v:rnd(8300+di0*11),b:.3+.6*dm,z:.9+1.2*dm,d:[.16,.26,.4][di0%3],ph:rnd(8400+di0)*6.283,w:6.283/(2400+3600*rnd(8500+di0))})}
function dust(now){var w=W,h=H;if(!w||!h)return;var dd=Math.min(2,dpr),pw=Math.round(w*dd),ph=Math.round(h*dd);if(DC.width!==pw||DC.height!==ph){DC.width=pw;DC.height=ph}
  var g=dctx;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,pw,ph);var va=1-M;if(va<.02)return;g.setTransform(dd,0,0,dd,0,0);var T=Math.max(w,h)*1.4,cx=w/2,cy=h/2,co=Math.cos(ROT),si=Math.sin(ROT),tk=anim();g.fillStyle='#eef4ff';
  for(var i=0;i<DUST.length;i++){var q=DUST[i],ox=-cam.x*cam.s*q.d*DEP,oy=-cam.y*cam.s*q.d*DEP,x0=((q.u*T+ox)%T+T)%T-T/2,y0=((q.v*T+oy)%T+T)%T-T/2,x=cx+x0*co-y0*si,y=cy+x0*si+y0*co;if(x<-3||x>w+3||y<-3||y>h+3)continue;
    g.globalAlpha=va*q.b*(tk?.68+.32*Math.sin(now*q.w+q.ph):.85);var z=q.z;g.fillRect(x-z/2,y-z/2,z,z)}g.globalAlpha=1}
var DEP=1; /* v4c SWELL: 1 at rest; up to 1.35 mid-flight on long tweens (site-v3-3d) */
function field(){FIELD.forEach(function(L,i){var dd=L.d*DEP,sc=Math.max(.8,Math.min(1.75,Math.pow(cam.s/.3,dd)*.9)),T=512*sc,ox=-cam.x*cam.s*dd+W/2,oy=-cam.y*cam.s*dd+H/2,tx=((ox%T)+T)%T-T,ty=((oy%T)+T)%T-T;
  SF[i].style.transform='translate3d('+tx.toFixed(1)+'px,'+ty.toFixed(1)+'px,0) scale('+sc.toFixed(4)+')'})}
/* ---------- camera + morph state ---------- */
var cam={x:0,y:0,s:.3},M=0,FK=null; /* M: 0 = constellation, 1 = grid. FK: the chapter the morph is about */
var mode='sky',open=false,raf=0,tw=null,dirty=true;
function fitS(){return Math.min((W-24)/(BOUND.x1-BOUND.x0),(H-TOP-24)/(BOUND.y1-BOUND.y0))}
function fitCam(){var s=fitS();return{x:(BOUND.x0+BOUND.x1)/2,y:(BOUND.y0+BOUND.y1)/2-(TOP/2)/s,s:s}}
function chapCam(k){var c=C[k],r=c.rad+90,s=Math.min(W/(2*r),(H-TOP-30)/(2*r+30));return{x:c.x,y:c.y-(TOP/2)/s+10/s,s:s}}
function allS(){return Math.max(.26,Math.min(.5,31/104*Math.min(1.4,W/360)))}
var HAND=null; /* measured column grid for a handover: screen rect of the first tile */
function blockCam(k){var c=C[k],h=HAND&&HAND.k===k?HAND:null;var s=h?h.w/104:Math.min(2.4,(W-32)/328),left=h?h.x:16,top=h?h.y:132;
  return{x:c.bx+(W/2-left)/s,y:c.by+(H/2-top)/s,s:s}}
function sp(x,y){return[(x-cam.x)*cam.s+W/2,(y-cam.y)*cam.s+H/2]}
function wp(x,y){return[(x-W/2)/cam.s+cam.x,(y-H/2)/cam.s+cam.y]}
function ease(u){u=Math.max(0,Math.min(1,u));return u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2}
function lerp(a,b,u){return a+(b-a)*u}
function interp(a,b,u){return{x:lerp(a.x,b.x,u),y:lerp(a.y,b.y,u),s:a.s*Math.pow(b.s/a.s,u)}}
function tween(to,m1,dur,done){var c0={x:cam.x,y:cam.y,s:cam.s},m0=M;if(!anim()||!dur){cam={x:to.x,y:to.y,s:to.s};M=m1;tw=null;req();done&&done();return}
  tw={c0:c0,c1:to,m0:m0,m1:m1,t0:performance.now(),dur:dur*(window.__slow||1),done:done};req()}
/* per-item morph: stars leave in a ripple (by index), so the grid assembles rather than jumps */
function kAt(s){return Math.max(0,Math.min(1,(s*104-44)/30))}
function gyAt(it,s){var c=C[it.k];return c.by+it.row*(c.imgh+6+50*kAt(s))}
/* v4c OPEN-K: how open each constellation is (0..1): its zoom-driven opening (v4b thAt), weighted by how centred it is. The nearest is
   always 1 x its opening (= v4b); a neighbour gets a share only as the view nears the half-way line between them. */
var OK={},NN=2*R0*Math.sin(Math.PI/5);function cl1(u){return Math.max(0,Math.min(1,u))}
function openK(lk){var c=wp(W/2,(H+TOP)/2),d={};ORDER.forEach(function(k){if(C[k])d[k]=Math.hypot(C[k].x-c[0],C[k].y-c[1])});
  ORDER.forEach(function(k){if(!C[k])return;var w=k===lk?1:ease(cl1(1-(d[k]-d[lk])/(.35*NN)));OK[k]=(k==='sound'&&window.__soundOne?0:ease((cam.s/chapCam(k).s-1)/.35))*w})} /* a slightly longer, eased opening than v4b's thAt (1.05-1.25x): 1-1.35x the constellation view; full well before the lock */
var KN=1;function layout(){var any=false;KN=kAt(cam.s);var lk=FK||nearest();openK(lk); /* SOUND-ONE: Sound opens into the player, not thumbnails (OK.sound = 0) */ /* FLY-SITE v1: the opened constellation's stars are small thumbnails in place */
  ITEMS.forEach(function(it){it.gy=gyAt(it,cam.s);var mi=ease(Math.max(0,Math.min(1,M*1.45-it.stg*.45)));it.mi=mi;var b=TB*(OK[it.k]||0);it.mz=(b+(1-b)*(1-(1-mi)*(1-mi)))*(1+.06*Math.sin(Math.PI*mi)); /* v4c FLIGHT: wider ripple + a lift that lands flat */var mp=Math.pow(mi,1.4);it.x=lerp(it.sx,it.gx+52,mp);it.y=lerp(it.sy,it.gy+C[it.k].imgh/2,mp)})} /* FLY-SITE v1: size leads, travel follows */
/* FLY-SITE v1 key moments: the whole sky (fitS), a constellation (chapCam), that constellation opened (x EXS), the grid handover (morph p .3) */
var EXS=1.25,TB=.3;function thAt(r){return ease((r-1.05)/(EXS-1.05))}
/* v4b LOCK: the same depth for every chapter: a thumbnail (mz = TB) is 1/ACROSS of the screen width */
var ACROSS=8.25;function lockS(){return Math.max(.3,(Math.min(W,H*1.9)/ACROSS-3.5)/(104*TB))}
function expCam(k,at){var s2=lockS(),x=C[k].x,y=C[k].y-(TOP/2)/s2+10/s2;if(at){var b=C[k].box;x=Math.max(b.x0,Math.min(b.x1,at.x));y=Math.max(b.y0,Math.min(b.y1,at.y))}return{x:x,y:y,s:s2}}
function toExp(k,d,at){crumbFor('chap',k);tween(expCam(k,at),0,d||800,function(){settle('chap',k)})}
/* a soft detent: the zoom runs at 55% speed right on a key moment, back to full within ~5% of it (never stops, never reverses) */
var NODET=0;function detent(f){if(NODET||!anim())return f; /* v38b MED-2: never for a plain mouse-wheel notch */var s=cam.s,k=nearest(),cs=chapCam(k).s,ks=[fitS(),cs,lockS()],g=1;ks.forEach(function(q){var u=Math.log(s/q)/.05;g=Math.min(g,1-.45*Math.exp(-u*u))});return Math.exp(Math.log(f)*g)}
/* Sound goes straight to the player: the camera keeps falling into the constellation while sound-dive.js darkens the sky and leaves */
var SNDA=1,PL=0;function toPlayer(){if(window.__soundOne){__soundOne.enter();return} /* SOUND-ONE */if(PL)return;PL=1;crumb.textContent='sound · player';var c=chapCam('sound');tween({x:C.sound.x,y:C.sound.y,s:Math.max(cam.s,c.s)*1.9},0,anim()?900:0);
  try{history.pushState(history.state,'','#sound/wave')}catch(e){}if(!window.__soundDive)location.assign('sound/')}
addEventListener('pageshow',function(e){if(PL&&e.persisted){PL=0;if(open){tw=null;cam=chapCam('sound');M=0;settle('chap','sound',{replace:true})}}});
/* ---------- drawing ---------- */
function bg(g,w,h,c,full){if(!full){g.clearRect(0,0,w,h);return}g.fillStyle='#03050a';g.fillRect(0,0,w,h);var gr=g.createRadialGradient(w/2,h*.42,0,w/2,h*.42,Math.max(w,h)*.75);gr.addColorStop(0,'rgba(22,34,58,.85)');gr.addColorStop(.6,'rgba(10,17,32,.6)');gr.addColorStop(1,'rgba(3,5,10,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);
  FIELD.forEach(function(L){if(!L.pat)L.pat=g.createPattern(L.c,'repeat');var sc=Math.pow(c.s/.3,L.d)*.9,ox=-c.x*c.s*L.d+w/2,oy=-c.y*c.s*L.d+h/2;g.save();g.translate(ox,oy);g.scale(sc,sc);g.fillStyle=L.pat;g.fillRect(-ox/sc,-oy/sc,w/sc,h/sc);g.restore()})}
var tick=0,lastTick=0;
function frameOf(it){var r=ATI[it.k+'/'+it.w];if(!r||!r.length)return null;return r[0]}
var labRects=[];
function draw(g,w,h,c,opt){opt=opt||{};var P=function(x,y){return[(x-c.x)*c.s+w/2,(y-c.y)*c.s+h/2]};
  bg(g,w,h,c,opt.full);var sky=1-M,fitA=Math.max(0,Math.min(1,(c.s/fitS()-1.25)/.9)); /* extra stars + names fade in as you approach */
  var LK0=opt.full?null:(FK||nearest()),FP=LK0?cl1(Math.log(c.s/chapCam(LK0).s)/Math.log(Math.max(1.01,lockS()/chapCam(LK0).s))):0,DK=function(k){return (!LK0||k===LK0?1:1-.3*fitA-.25*FP*(1-(OK[k]||0)))*(k==='sound'?SNDA:1)}; /* v4c FOCUS: the others fade a little further as you go deeper */ /* SOUND-ONE: Sound hands over to the player */ /* FLY-SITE v1: slight depth dim on the others */
  /* lines: centre spokes + ring loops (constellation), chains through every work (persist into the grid) */
  g.lineWidth=1;g.lineCap='round';
  if(sky>0){g.strokeStyle='rgba(170,205,240,'+(.22*sky).toFixed(3)+')';g.beginPath();ORDER.forEach(function(k){if(!C[k])return;var a=P(0,0),b=P(C[k].x,C[k].y);g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1])});g.stroke();
}
  function links(key,alpha){if(alpha<.01)return;g.strokeStyle='rgba(185,215,248,'+alpha.toFixed(3)+')';g.beginPath();ORDER.forEach(function(k){var c2=C[k];if(!c2)return;
      c2[key].forEach(function(L){var a=P(L[0].x,L[0].y),b=L[1]?P(L[1].x,L[1].y):P(c2.x,c2.y);if((a[0]<-50&&b[0]<-50)||(a[0]>w+50&&b[0]>w+50)||(a[1]<-50&&b[1]<-50)||(a[1]>h+50&&b[1]>h+50))return;g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1])})});g.stroke()}
  /* v3.3 constellations: a faint tinted nebula behind each cluster, its hairlines tinted, its shape stars (not works) */
  var SF=Math.max(.7,Math.min(1.6,c.s/.3));
  if(sky>.01)ORDER.forEach(function(k){var c2=C[k];if(!c2)return;var p=P(c2.x,c2.y),nr=190*c.s;if(p[0]<-nr||p[0]>w+nr||p[1]<-nr||p[1]>h+nr)return;var gr=g.createRadialGradient(p[0],p[1],0,p[0],p[1],nr);gr.addColorStop(0,'rgba('+c2.tint+','+(.07*sky*DK(k)).toFixed(3)+')');gr.addColorStop(1,'rgba('+c2.tint+',0)');g.fillStyle=gr;g.fillRect(p[0]-nr,p[1]-nr,2*nr,2*nr);
    var ok=opt.full?0:(OK[k]||0),al=.5*sky*sky*DK(k)*(1-.5*ok);if(al>.01){ /* v4c LINKS: the figure thins as it opens */g.strokeStyle='rgba('+c2.lt+','+al.toFixed(3)+')';g.beginPath();c2.sky.forEach(function(L){var a=P(L[0].x,L[0].y),b=P(L[1].x,L[1].y);g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1])});g.stroke()}
    c2.dec.forEach(function(d){var q=P(d.x,d.y),gs=(6+30*d.b*d.b)*SF;if(q[0]<-30||q[0]>w+30||q[1]<-30||q[1]>h+30)return;g.globalAlpha=sky*(.35+.65*d.b)*(d.st?.8:1);g.globalAlpha*=DK(k);g.drawImage(c2.glow,q[0]-gs/2,q[1]-gs/2,gs,gs);g.globalAlpha=sky*(.45+.55*d.b)*(d.st?.8:1)*DK(k); /* FLY-SITE v1 */g.fillStyle='#fff';g.beginPath();g.arc(q[0],q[1],(.5+1.9*d.b)*SF*.85,0,7);g.fill()});g.globalAlpha=1});
links('arm',.32*fitA*sky*sky);links('grid',.3*M*M);
  /* v4c LINKS: as a constellation opens, its time-line (work to work: the grid's own chain) fades in between the thumbnails */
  if(!opt.full&&sky>.01)ORDER.forEach(function(k){var c2=C[k],tl=.16*cl1((OK[k]||0)*1.6)*sky*DK(k);if(!c2||tl<.01)return;var its=c2.items;g.save();g.lineWidth=1;
    for(var j=0;j+1<its.length;j++){var A=its[j],B=its[j+1],ln=Math.hypot(B.x-A.x,B.y-A.y),lf=1-ln/240;if(lf<=.05)continue; /* short threads only: neighbours in time that sit near each other */
      var a=P(A.x,A.y),b=P(B.x,B.y);if((a[0]<-50&&b[0]<-50)||(a[0]>w+50&&b[0]>w+50)||(a[1]<-50&&b[1]<-50)||(a[1]>h+50&&b[1]>h+50))continue;
      g.strokeStyle='rgba(185,215,248,'+(tl*lf).toFixed(3)+')';g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke()}g.restore()});
  /* ᑕᐣᓯ: the glowing centre */
  var GR=null;if(sky>0){var o=P(0,0),gs=Math.max(70,Math.min(420,260*c.s/.3))*1.0,gf=Math.round(Math.max(22,Math.min(84,48*c.s/.3)));
    g.font='700 '+gf+'px Syl, sans-serif';g.textAlign='center';g.textBaseline='middle';
    /* v3.5.1 QA O3: the centre mark keeps clear of the words: it fades as it slides under the title bar, and names never sit on it */
    var gw=g.measureText('ᑕᐣᓯ').width;GR={x:o[0]-gw/2-6,y:o[1]-gf*.62,w:gw+12,h:gf*1.24};var ga=1-.85*Math.max(0,Math.min(1,(TOP-GR.y)/(gf*.9)));
    g.globalAlpha=sky*ga;g.drawImage(GLOWC,o[0]-gs/2,o[1]-gs/2,gs,gs);
    g.fillStyle='rgba(10,189,240,.55)';g.fillText('ᑕᐣᓯ',o[0]-1.2,o[1]);g.fillStyle='rgba(254,1,1,.45)';g.fillText('ᑕᐣᓯ',o[0]+1.2,o[1]);g.fillStyle='#fff';g.fillText('ᑕᐣᓯ',o[0],o[1]);g.globalAlpha=1}
  /* chapter stars */
  if(sky>0)ORDER.forEach(function(k){var c2=C[k];if(!c2)return;var p=P(c2.x,c2.y),gs=Math.max(46,Math.min(150,110*c.s/.3));if(k===LK0&&fitA>.02){var bl=gs*2.2;g.globalAlpha=.18*fitA*sky;g.drawImage(c2.glow,p[0]-bl/2,p[1]-bl/2,bl,bl)} /* FLY-SITE v1: faint glow in focus */g.globalAlpha=sky*DK(k);g.drawImage(GLOW,p[0]-gs/2,p[1]-gs/2,gs,gs);g.fillStyle='#fff';g.beginPath();g.arc(p[0],p[1],Math.max(2.2,Math.min(5,3.2*c.s/.3)),0,7);g.fill();g.globalAlpha=1});
  /* works: a star (dot) that grows into its thumbnail as it travels into the grid */
  if(!opt.full)SELR=null;TR=[];ITEMS.forEach(function(it){var p=P(it.x,it.y);if(p[0]<-140||p[0]>w+140||p[1]<-140||p[1]>h+140)return;var a=(it.ring?1:Math.max(fitA,it.mi))*(it.mi<.02?DK(it.k):1);if(a<.02)return; /* FLY-SITE v1 */
    if(it.mi<.98||!opt.cards||!cardsOn()){var c2=C[it.k],cw=lerp(5/c.s,104,it.mz),chh=lerp(5/c.s,c2.imgh,it.mz) /* FLY-SITE v1 */,sw=cw*c.s,sh=chh*c.s;
      var xf=cl1((sw-5)/10),av=(1-it.lum)*.8*(1-M),sa0=a;a=sa0*(1-xf)*(.82+.18*it.lum); /* v4c GROW: the star fades out as its thumbnail fades in · AGE: a star is at most ~5% dimmer */
      if(xf<1&&a>.01){if(it.b>=0){var gb=(6+30*it.b*it.b)*SF;g.globalAlpha=a*(.4+.6*it.b);g.drawImage(c2.glow,p[0]-gb/2,p[1]-gb/2,gb,gb);g.globalAlpha=a;g.fillStyle='#fff';g.beginPath();g.arc(p[0],p[1],Math.max(1.1,(.6+1.9*it.b)*SF),0,7);g.fill()}
        else{var gs=Math.max(10,Math.min(26,16*c.s/.3));g.globalAlpha=a;if(it.ring||c.s>.5)g.drawImage(GLOW,p[0]-gs/2,p[1]-gs/2,gs,gs);g.fillStyle='#f4f8ff';g.beginPath();g.arc(p[0],p[1],Math.max(1.1,Math.min(2.6,1.6*c.s/.3)),0,7);g.fill()}}
      if(it===SELI&&!opt.full)SELR={x:p[0],y:p[1],w:sw,h:sh};if(xf>.5)TR.push({x:p[0]-sw/2-2,y:p[1]-sh/2-2,w:sw+4,h:sh+4,it:it}); /* v4c LOW-2: pictures that a name must not run under */
      if(xf>0){var f=ATL&&frameOf(it);g.globalAlpha=sa0*xf;if(f)g.drawImage(ATL,f[0],f[1],f[2],f[3],p[0]-sw/2,p[1]-sh/2,sw,sh);else{g.fillStyle='rgba(30,44,60,.9)';g.fillRect(p[0]-sw/2,p[1]-sh/2,sw,sh)}
        if(av>.005){g.fillStyle='rgba(3,5,10,'+av.toFixed(3)+')';g.fillRect(p[0]-sw/2,p[1]-sh/2,sw,sh)} /* v4c AGE: veil <= .2 */
        g.strokeStyle='rgba(200,225,255,.22)';g.strokeRect(p[0]-sw/2+.5,p[1]-sh/2+.5,sw-1,sh-1)}
      g.globalAlpha=1}});
  /* names, only where they help: work names once a constellation is big enough, decluttered (a name shows only if its box is free) */
  labRects=[];if(opt.hud)opt.hud.forEach(function(r){labRects.push(r)});if(GR&&GR.x<w&&GR.x+GR.w>0&&GR.y<h&&GR.y+GR.h>0)labRects.push(GR);
  /* v4c SELECT: the selected work: a mint frame and its title (with the player's own hint), names keep clear of it */
  if(SELI&&SELR&&!opt.full){var q=SELR,fw=Math.max(q.w,10),fh=Math.max(q.h,10);g.globalAlpha=1;g.strokeStyle='#55DAA1';g.lineWidth=2;g.strokeRect(q.x-fw/2-3,q.y-fh/2-3,fw+6,fh+6);g.lineWidth=1;
    var sl=SELI.lab.length>30?SELI.lab.slice(0,29)+'…':SELI.lab;g.font='300 12.5px Poppins, sans-serif';g.textAlign='left';g.textBaseline='middle';var hn=' · tap again to open',t1=g.measureText(sl).width;g.font='300 10.5px Poppins, sans-serif';var t2=g.measureText(hn).width,tw3=t1+t2+10;
    var sx2=Math.max(6,Math.min(w-tw3-6,q.x-tw3/2)),sy2=q.y+fh/2+16;if(sy2>h-16)sy2=q.y-fh/2-16;labRects.push({x:sx2-4,y:sy2-11,w:tw3+8,h:22});
    g.fillStyle='rgba(3,5,10,.72)';g.fillRect(sx2-4,sy2-11,tw3+8,22);g.font='300 12.5px Poppins, sans-serif';g.fillStyle='#55DAA1';g.fillText(sl,sx2+1,sy2);g.font='300 10.5px Poppins, sans-serif';g.fillStyle='rgba(230,237,240,.7)';g.fillText(hn,sx2+1+t1,sy2)}
  var LSN=lockS(),nameA=Math.max(0,Math.min(1,(c.s/LSN-.7)/.22))*(1-Math.min(1,M*3)); /* v4b IMAGE FIRST: names only close to the lock */
  var EX=Math.max(0,Math.min(1,(c.s/LSN-.92)/.08)),EF='300 '+(12+2*EX).toFixed(1)+'px Poppins, sans-serif'; /* FLY-SITE v1: 0 at the constellation (as live), 1 when opened */
  if(nameA>.02){g.font=EF;g.textAlign='left';g.textBaseline='middle';
    var lk=FK||nearest();if(lk==='sound')nameA*=SNDA; /* v3.5: only the chapter in view names its works (no labels from the neighbouring constellations) */
    var nL=0,LB={film:7,photo:3,objects:6,about:4,sound:6}[lk]||6;C[lk].items.slice().sort(function(a,b){var pa=P(a.x,a.y),pb=P(b.x,b.y);return Math.hypot(pa[0]-w/2,pa[1]-h/2)-Math.hypot(pb[0]-w/2,pb[1]-h/2)}).forEach(function(it){if(nL>=LB)return;var p=P(it.x,it.y);if(p[0]<0||p[0]>w-30||p[1]<TOP||p[1]>h-10)return;var lab=it.lab.length>24?it.lab.slice(0,23)+'…':it.lab,tw2=g.measureText(lab).width,mt=EX>.02&&it.meta?(it.meta.length>32?it.meta.slice(0,31)+'…':it.meta):'',mw=0;if(mt){g.font='300 10.5px Poppins, sans-serif';mw=g.measureText(mt).width*EX;g.font=EF}
      var hw=Math.max(7,lerp(5/c.s,104,it.mz)*c.s/2+5),r={x:p[0]+hw,y:p[1]-9-EX,w:Math.max(tw2,mw)+6,h:18+2*EX+(mt?14*EX:0)}; /* FLY-SITE v1 */
      var aR=w-4-(p[0]+hw),aL=p[0]-hw-4; /* v4c LOW-2: the label always sits fully inside the screen, beside its star (never under the edge or over its own picture) */
      if(r.w>aR&&r.w>aL){var av=Math.max(aR,aL);if(av<64)return;lab=clipT(g,lab,av-6);tw2=g.measureText(lab).width;if(mt){g.font='300 10.5px Poppins, sans-serif';mt=clipT(g,mt,av-6);mw=g.measureText(mt).width*EX;g.font=EF}r.w=Math.min(av,Math.max(tw2,mw)+6)}
      var rs=[];if(r.w<=aR)rs.push(p[0]+hw);if(r.w<=aL)rs.push(p[0]-hw-r.w);var ok=false;for(var ri=0;ri<rs.length&&!ok;ri++){var r2={x:rs[ri],y:r.y,w:r.w,h:r.h};if(clearOf(r2,it)&&free(r2)){r=r2;ok=true}}if(!ok)return;nL++;g.globalAlpha=nameA;g.fillStyle='rgba(3,5,10,.62)';g.fillRect(r.x-2,r.y,r.w+2,r.h);g.fillStyle='#e6edf0';g.fillText(lab,r.x+2,p[1]+4*(1-nameA)); /* v4c GROW: names rise as they fade in */
      if(mt){g.globalAlpha=nameA*EX;g.font='300 10.5px Poppins, sans-serif';g.fillStyle='#9fb6c4';g.fillText(mt,r.x+2,p[1]+10+5*EX);g.font=EF}g.globalAlpha=1})} /* FLY-SITE v1: the detail line */
  /* block headers in the grid */
  if(M>.6){g.textAlign='left';g.textBaseline='alphabetic';ORDER.forEach(function(k){var c2=C[k];if(!c2)return;var p=P(c2.bx,c2.by-14),fs=Math.max(11,Math.min(22,16*c.s));if(p[0]>w||p[0]+328*c.s<0)return;
    g.globalAlpha=(M-.6)/.4;g.font='400 '+fs.toFixed(0)+'px "Julius Sans One", sans-serif';g.fillStyle='#55DAA1';g.fillText(k.toUpperCase(),p[0],p[1]);var nw=g.measureText(k.toUpperCase()).width;
    g.font='300 '+(fs*.72).toFixed(0)+'px Poppins, sans-serif';g.fillStyle='#c9d3d6';g.fillText('  '+c2.count,p[0]+nw,p[1]);g.globalAlpha=1})}
  if(opt.labels){g.textAlign='center';g.textBaseline='alphabetic';ORDER.forEach(function(k){var c2=C[k];if(!c2)return;var p=P(c2.x,c2.y);g.font='400 11px "Julius Sans One", sans-serif';g.fillStyle='#e6edf0';g.fillText(k.toUpperCase(),p[0],p[1]+22)})}}
var TR=[];function clearOf(r,own){for(var i=0;i<TR.length;i++){var t=TR[i];if(t.it!==own&&r.x<t.x+t.w&&r.x+r.w>t.x&&r.y<t.y+t.h&&r.y+r.h>t.y)return false}return true} /* v4c LOW-2 */
var CT={},CTN=0;function clipT(g,t,mx){var ck=g.font+'|'+t+'|'+(mx>>4);if(CT[ck]!==undefined)return CT[ck];if(++CTN>400){CT={};CTN=0}return CT[ck]=clipT0(g,t,(mx>>4)<<4)} /* memo: no per-frame measuring */
function clipT0(g,t,mx){var W0=g.measureText(t).width;if(W0<=mx)return t;var n=Math.max(1,Math.floor(t.length*mx/W0)),u;for(var q=0;q<6;q++){u=t.slice(0,n).replace(/[\s·…]+$/,'')+'…';if(g.measureText(u).width<=mx||n<=2)break;n--}return u} /* v4c LOW-2: proportional cut, 2-3 measures */
function free(r){for(var i=0;i<labRects.length;i++){var t=labRects[i];if(r.x<t.x+t.w&&r.x+r.w>t.x&&r.y<t.y+t.h&&r.y+r.h>t.y)return false}labRects.push(r);return true}
function chapS(){var k=FK||nearest();return chapCam(k).s}
function nearest(px,py){var p=wp(px==null?W/2:px,py==null?(H+TOP)/2:py),best='film',bd=1e18;ORDER.forEach(function(k){var c=C[k];if(!c)return;var x=M>.5?c.bx+164:c.x,y=M>.5?c.by+Math.min(260,c.pitch*Math.ceil(c.n/3)/2):c.y,d=(x-p[0])*(x-p[0])+(y-p[1])*(y-p[1]);if(d<bd){bd=d;best=k}});return best}
/* ---------- HUD: chapter names are real buttons (44px+), placed under their star each frame ---------- */
var HB={};ORDER.forEach(function(k){var b=$('[data-sk="'+k+'"]',hud);if(b)HB[k]=b});
if(HB.sound){var sm=$('small',HB.sound);if(sm)sm.textContent='▶ the player · 6 songs';HB.sound.setAttribute('aria-label','sound: open the player (6 songs)')} /* FLY-SITE v1 */
var RB=46; /* bottom band kept for the hint pill (12px + its height + a gap) */
function placeHud(){var rects=[],vis=1-M,show=vis>.4&&mode!=='all';
  ORDER.forEach(function(k){var b=HB[k];if(!b||!C[k])return;var p=sp(C[k].x,C[k].y),bw=b.offsetWidth||96,bh=b.offsetHeight||44,x=p[0]-bw/2,y=p[1]+10*Math.min(2,cam.s/.3)+4;
    /* names never overlap: if the spot under the star is taken, try above it, then beside it */
    var cand=[[x,y],[x,p[1]-10*Math.min(2,cam.s/.3)-4-bh],[p[0]+14,p[1]-bh/2],[p[0]-14-bw,p[1]-bh/2]];
    /* v3.2 QA: a name stays inside the frame, clear of the hint pill at the bottom (RB) */
    var lo=TOP+2,hi=H-RB-bh,inF=function(q){return q[0]>=4&&q[0]+bw<=W-4&&q[1]>=lo&&q[1]<=hi},cl=function(q){return[Math.max(4,Math.min(W-4-bw,q[0])),Math.max(lo,Math.min(hi,q[1]))]},hitQ=function(q){return rects.some(function(r){return q[0]<r.x+r.w&&q[0]+bw>r.x&&q[1]<r.y+r.h&&q[1]+bh>r.y})},pick=null;
    for(var ci=0;ci<cand.length&&!pick;ci++)if(inF(cand[ci])&&!hitQ(cand[ci]))pick=cand[ci];
    for(ci=0;ci<cand.length&&!pick;ci++)if(!hitQ(cl(cand[ci])))pick=cl(cand[ci]);
    pick=pick||cl(cand[0]);x=pick[0];y=pick[1];
    var on=show&&p[0]>-40&&p[0]<W+40&&p[1]>TOP-20&&p[1]<H+20;b.style.transform='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0)';b.style.opacity=on?(Math.min(1,vis*1.4)*(k==='sound'?SNDA:1)).toFixed(2):'0';b.style.visibility=on?'':'hidden';b.tabIndex=on?0:-1;
    if(on)rects.push({x:x,y:y,w:bw,h:bh})});return rects}
/* ---------- near cards: real DOM images (and up to 4 muted previews) once a frame is big enough to read ---------- */
var CARDS=new Map(),pvT=0;
function cardsOn(){return M>.98&&cam.s*104>=24}
function cards(){var s=cam.s,on=cardsOn(),near=s*104>=66;world.style.transform='translate3d('+(W/2-cam.x*s).toFixed(2)+'px,'+(H/2-cam.y*s).toFixed(2)+'px,0) scale('+s.toFixed(4)+')';
  world.style.opacity=on?Math.min(1,(s*104-24)/5).toFixed(2):'0';world.classList.toggle('far',!near);world.classList.toggle('big',s*104>190);
  ITEMS.forEach(function(it){var c2=C[it.k],a=sp(it.gx,it.gy),b=sp(it.gx+104,it.gy+c2.imgh+44),vis=on&&b[0]>-20&&a[0]<W+20&&b[1]>TOP-20&&a[1]<H+20;
    var el=CARDS.get(it);if(vis&&!el){el=document.createElement('a');el.className='card'+(c2.sq?' sq':'');el.href=it.k+'/#'+it.w;el.tabIndex=-1;el.dataset.k=it.k;el.dataset.w=it.w;
        el._y=null;var f=ATI[it.k+'/'+it.w]&&ATI[it.k+'/'+it.w][0],bgc='';
        if(f){var sx=104/f[2],sy=c2.imgh/f[3];bgc=' style="background-image:url(img/sky-atlas.webp);background-size:'+(1536*sx).toFixed(1)+'px '+(ATH*sy).toFixed(1)+'px;background-position:'+(-f[0]*sx).toFixed(1)+'px '+(-f[1]*sy).toFixed(1)+'px"'}
        el.innerHTML=(it.thumb||f?'<span class="cv"'+bgc+'></span>':'<span class="cv tx">'+esc(it.lab)+'</span>')+'<span class="cc"><b>'+esc(it.lab)+'</b><small>'+esc(it.meta)+'</small></span>';
        world.appendChild(el);CARDS.set(it,el)}
    if(el){el.style.visibility=vis?'':'hidden';if(vis&&el._y!==it.gy){el._y=it.gy;el.style.transform='translate3d('+it.gx+'px,'+it.gy.toFixed(1)+'px,0)'}if(vis&&near&&it.thumb&&!el._img){el._img=1;var im=new Image();im.alt='';im.decoding='async';im.src=it.thumb;$('.cv',el).appendChild(im)}if(!vis)killPv(el)}});
  clearTimeout(pvT);if(on&&!tw&&!PT.size)pvT=setTimeout(clips,180)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function killPv(el){var v=$('video',el);if(v){v.pause();v.removeAttribute('src');v.load();v.remove()}el._done=0}
/* tiles are mostly moving: a tiny clip (a different moment from the work view's preview) plays ONCE when its tile is near the
   middle of the screen and holds its last frame. At most 6 at a time; photo/objects stay stills; nothing loops. */
function clips(){if(!anim()||(navigator.connection||{}).saveData)return;var list=[];CARDS.forEach(function(el,it){if(!it.pv||el.style.visibility==='hidden')return;var a=sp(it.gx+52,it.gy+C[it.k].imgh/2);
    if(a[0]>0&&a[0]<W&&a[1]>TOP&&a[1]<H)list.push([Math.hypot(a[0]-W/2,a[1]-H/2),el,it]);else killPv(el)});
  list.sort(function(a,b){return a[0]-b[0]});var live=0;list.forEach(function(x){var el=x[1],v=$('video',el);if(v&&!v.paused&&!v.ended)live++});
  list.forEach(function(x){var el=x[1],v=$('video',el);if(el._done||v||live>=6)return;live++;el._done=1;v=document.createElement('video');v.muted=true;v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('aria-hidden','true');v.preload='auto';v.src=x[2].sc;
    v.addEventListener('ended',function(){clips()});$('.cv',el).appendChild(v);v.play().catch(function(){})})}
/* v4b IMAGE FIRST: the nearest constellation tiles (>= 30 px) get their real image, and a tiny clip plays ONCE where one exists
   (max 4, holds its last frame; never on reduced motion / save-data; never Retail Revolution footage) */
var NL=document.createElement('div');NL.className='snear';NL.setAttribute('aria-hidden','true');NL.style.cssText='position:absolute;inset:0;pointer-events:none;overflow:hidden';cv.insertAdjacentElement('afterend',NL);
var NT=new Map(),NOCLIP=/retail\s*revolution/i;
function tileOf(it){var c2=C[it.k],p=sp(it.x,it.y);return{p:p,w:lerp(5/cam.s,104,it.mz)*cam.s,h:lerp(5/cam.s,c2.imgh,it.mz)*cam.s}}
function nearTiles(){var want=[],lk=open&&M<.02?(FK||nearest()):null;if(NL._top!==TOP){NL._top=TOP;NL.style.clipPath='inset('+TOP+'px 0 0 0)'} /* never over the top bar */
  if(lk&&lk!=='sound'&&C[lk])C[lk].items.forEach(function(it){if(!it.thumb)return;var t=tileOf(it);if(t.w<30)return;var p=t.p;if(p[0]+t.w/2<0||p[0]-t.w/2>W||p[1]+t.h/2<TOP||p[1]-t.h/2>H)return;t.it=it;t.d=Math.hypot(p[0]-W/2,p[1]-H/2);want.push(t)});
  want.sort(function(a,b){return a.d-b.d});want=want.slice(0,8);var keep=new Set(),nv=0;NT.forEach(function(el){if(el._v)nv++});
  want.forEach(function(q){var it=q.it,el=NT.get(it);if(!el){el=document.createElement('span');el.style.cssText='position:absolute;left:0;top:0;overflow:hidden;outline:1px solid rgba(200,225,255,.22);outline-offset:-1px;will-change:transform';
      var im=new Image();im.alt='';im.decoding='async';im.style.cssText='width:100%;height:100%;object-fit:cover;display:block';im.src=it.thumb;el.appendChild(im);NL.appendChild(el);NT.set(it,el)}
    if(!el._v&&it.sc&&nv<4&&anim()&&!(navigator.connection||{}).saveData&&!NOCLIP.test(it.lab)){nv++;var v=el._v=document.createElement('video');v.muted=true;v.playsInline=true;v.setAttribute('playsinline','');v.preload='auto';v.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:cover';v.src=it.sc;el.appendChild(v);v.play().catch(function(){})}
    el.style.width=q.w.toFixed(1)+'px';el.style.height=q.h.toFixed(1)+'px';el.style.transform='translate3d('+(q.p[0]-q.w/2).toFixed(1)+'px,'+(q.p[1]-q.h/2).toFixed(1)+'px,0)';el.style.opacity=Math.min(1,(q.w-30)/10).toFixed(2);var vq=(1-it.lum)*.8*(1-M)*(INTO&&INTO.it===it?1-Math.min(1,INTO.u||0):1),nf=vq>.004?'brightness('+(1-vq).toFixed(3)+')':''; /* fades out as it opens */if(el._f!==nf){el._f=nf;el.style.filter=nf}keep.add(it)}); /* v4c AGE: the same <= .2 veil on the real image */
  NT.forEach(function(el,it){if(keep.has(it))return;if(el._v){el._v.pause();el._v.removeAttribute('src');el._v.load()}el.remove();NT.delete(it)})}
/* v4b PINCH-THROUGH: past the lock the camera keeps flying into the item; it opens from its tile */
var INTO=null,RET=null;
function deepS(){return Math.max(lockS()*2.2,.62*W/(104*TB))}
function pickInto(k,x,y){var best=null,bd=1e9;C[k].items.forEach(function(it){var p=sp(it.x,it.y);if(p[0]<0||p[0]>W||p[1]<TOP||p[1]>H)return;var d=Math.hypot(p[0]-x,p[1]-y);if(d<bd){bd=d;best=it}});return best}
function intoAt(s){var I=INTO,L=lockS(),u=Math.max(0,Math.min(1,Math.log(s/L)/Math.log(deepS()/L))),e=1-(1-u)*(1-u),qx=lerp(I.q[0],W/2,e),qy=lerp(I.q[1],(H+TOP)/2,e);cam.s=s;cam.x=I.it.x-(qx-W/2)/s;cam.y=I.it.y-(qy-H/2)/s;I.u=u;return u}
function openItem(it){var t=tileOf(it),r={left:t.p[0]-t.w/2,top:t.p[1]-t.h/2,width:t.w,height:t.h};r.right=r.left+r.width;r.bottom=r.top+r.height;
  RET={k:it.k,deep:{x:cam.x,y:cam.y,s:cam.s},lock:expCam(it.k,{x:it.x,y:it.y})};INTO=null;tw=null;
  __dive.go({k:it.k,lv:3,w:it.w},{rect:r});setTimeout(function(){if(open)close({quick:1})},anim()?640:0)}
function flyInto(it){if(!it)return;INTO=null;FK=it.k;tween({x:it.x,y:it.y-(TOP/2)/deepS(),s:deepS()},0,anim()?720:0,function(){openItem(it)})}
/* ---------- render loop (only while something moves) ---------- */
function req(){if(!raf&&open)raf=requestAnimationFrame(frame)}
function frame(){var now=performance.now();raf=0; /* one clock for start and progress */DEP=1;if(tw){var u=Math.min(1,(now-tw.t0)/tw.dur),e=ease(u);var trv=Math.hypot((tw.c1.x-tw.c0.x)*tw.c1.s,(tw.c1.y-tw.c0.y)*tw.c1.s)+Math.abs(Math.log(tw.c1.s/tw.c0.s))*300;if(anim()&&trv>120)DEP=1+.35*Math.sin(Math.PI*u); /* v4c SWELL */cam=interp(tw.c0,tw.c1,e);M=lerp(tw.m0,tw.m1,e);if(u>=1){var d=tw.done;tw=null;d&&d()}}
  if(MP){cam=interp(MP.c0,MP.c1,MP.p);if(MP.pl){M=0;crumb.textContent='sound · player'}else{M=MP.p;crumbFor('dive',MP.k)}} /* FLY-SITE v1: Sound's morph is a fall into the player, not the grid */
  if(anim()&&now-lastTick>650){tick++;lastTick=now}
  if(CO&&!tw&&!MP&&!PT.size){var ce=now-CO.t0,k1=Math.exp(-ce/CO.tau),dd=(CO.k-k1)*CO.tau;CO.k=k1;cam.x-=CO.vx*dd/cam.s;cam.y-=CO.vy*dd/cam.s;clampCam();if(ce>=CO.end){CO=null;panRest()}}else if(CO&&(tw||MP))CO=null; /* FLY-SITE v1 ease-out */
  var rdt=Math.min(100,now-(LFT||now));LFT=now;if(!PT.size&&ROT){ROT*=Math.exp(-rdt/150);if(Math.abs(ROT)<.0004)ROT=0} /* v38b LOW-2: time-based settle */
  layout();field();dust(now);var hr=placeHud();ctx.setTransform(dpr,0,0,dpr,0,0);draw(ctx,W,H,cam,{cards:true,hud:hr});cards();nearTiles();selMark();if(window.__soundOne)__soundOne.sky(cam); /* SOUND-ONE */
  if(tw||MP||CO||(ROT&&!PT.size))req();else twk()}
/* FLY-SITE v1: idle twinkle: only the dust canvas redraws (~12 fps, 8 on low-end), only while the sky is open and nothing moves */
var CO=null,TWT=0,LFT=0;function twk(){if(TWT||!open||!anim())return;TWT=setTimeout(function(){TWT=0;if(!open||raf||tw||MP||CO)return;dust(performance.now());twk()},LOW?125:80)}
/* ---------- state ⇄ URL ---------- */
function hashOf(){return mode==='all'?'#all':mode==='chap'?'#sky/'+FK:'#sky'}
function crumbFor(m,k){crumb.textContent=m==='all'?'all work · '+ITEMS.length:m==='chap'?k+' · '+C[k].count:m==='dive'?k+' · '+C[k].count:'the whole sky'}
function settle(m,k,o){o=o||{};mode=m;FK=k||null;crumbFor(m,FK);
  if(o.push!==false){var u=location.pathname+location.search+hashOf();if(u!==location.pathname+location.search+location.hash)history[o.replace?'replaceState':'pushState']({gj:1},'',u)}ui();req()}
function ui(){var zd=$('.zoom .dots'),zn=$('.zoom .zn'),zb=$$('.zoom .zb');if(!zd)return;var n=mode==='sky'?0:mode==='chap'?1:2;
  zd.textContent=[0,1,2,3,4].map(function(i){return i<=n?'●':'○'}).join('');zn.textContent=mode==='sky'?'the whole sky':mode==='chap'?FK:'all work';zb[0].disabled=false;zb[1].disabled=false;
  $$('.tabs a').forEach(function(a){a.classList.toggle('here',mode==='chap'&&a.dataset.t===FK)})}
/* ---------- moves ---------- */
function toSky(){FK=null;crumbFor('sky');tween(fitCam(),0,M>.5?1300:750,function(){settle('sky')})}
function toChap(k){if(k!=='sound'){toExp(k,M>.5?1300:800);return}crumbFor('chap',k);tween(chapCam(k),0,M>.5?1300:800,function(){settle('chap',k)})}
function toAll(k,w){crumbFor('all');var it=w&&C[k]?C[k].items.filter(function(x){return x.w===w})[0]:null,s=allS(),cx=it?it.gx+52:C.photo.bx+164,cy=it?gyAt(it,s)+30:C.film.by+(H/2-TOP-40)/s;
  tween({x:cx,y:cy,s:s},1,1100,function(){settle('all')})}
/* the handover: line the column grid up under the sheet, fly the camera so the sheet grid lands exactly on it, then let go */
function prepHand(k){if(k==='about'){HAND=null;return}__dive.go({k:k,lv:2},{push:false,noAnim:true,quiet:true});var c=$('#'+k),first=$('.it .vis',c);if(!first){HAND=null;return}
  var wr=first.getBoundingClientRect(),want=TOP+76;scrollBy(0,wr.top-want);wr=first.getBoundingClientRect();HAND={k:k,x:wr.left,y:wr.top,w:wr.width}}
function dive(k,w){if(k==='about'){close({to:{k:'about',lv:1}});return}crumbFor('dive',k);prepHand(k);FK=k;
  tween(blockCam(k),1,(M<.5?1400:650),function(){close({to:w?{k:k,lv:3,w:w}:{k:k,lv:2},hand:1})})}
function step(dir){if(tw||MP)return;if(dir>0){if(mode==='sky')toChap(Math.abs(cam.s-fitS())<.02?'film':nearest());else if(mode==='chap'){if(FK==='sound')toPlayer();else dive(FK)} /* v4c LAND: + at the lock goes on to the board (was v4b: fly into the centred work) */else dive(nearest())} /* FLY-SITE v1 */
  else{if(mode==='chap'||mode==='all')toSky();else close()}}
/* ---------- open / close ---------- */
function size(){dpr=Math.min(1.5,devicePixelRatio||1);var r=sheet.getBoundingClientRect();W=r.width;H=r.height;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);TOP=Math.min(64,Math.max(52,H*.07))}
var from=null;
function show(o){o=o||{};var was=open;from=from||{y:scrollY};if(!was){sheet.hidden=false;D.classList.add('sheet-on');open=true;size();__dive.quiet(true)}
  if(o.rect&&anim()&&!was){var r=o.rect;sheet.animate([{clipPath:'inset('+r.top+'px '+(W-r.right)+'px '+(H-r.bottom)+'px '+r.left+'px round 18px)'},{clipPath:'inset(0 0 0 0 round 0)'}],{duration:620,easing:'cubic-bezier(.2,.8,.2,1)'})}
  else if(!was&&anim())sheet.animate([{opacity:0},{opacity:1}],{duration:260});
  if(!was)setTimeout(function(){try{$('.sx',sheet).focus({preventScroll:true})}catch(e){}},40);
  var push=o.push!==false;if(!push)quietNext=[1];
  if(o.mode==='all'){M=1;var it=o.w&&C[o.k]?C[o.k].items.filter(function(x){return x.w===o.w})[0]:null;
    if(it&&!was){var s0=Math.min(W,H*1.6)/104;cam={x:it.gx+52,y:gyAt(it,s0)+C[o.k].imgh/2,s:s0};layout()}else if(!was){cam={x:C.film.bx+164*3,y:C.film.by+300,s:allS()*2}}
    toAll(o.k,o.w)}
  else if(o.mode==='chap'){if(!was&&RET&&RET.k===o.k){var rt=RET;RET=null;M=0;cam={x:rt.deep.x,y:rt.deep.y,s:rt.deep.s};crumbFor('chap',o.k);tween(rt.lock,0,anim()?760:0,function(){settle('chap',o.k)})} /* v4b: back out of the work you flew into */
    else{if(!was){M=0;cam=fitCam()}toChap(o.k)}}
  else{if(!was){M=0;cam=o.k&&C[o.k]?(function(){var c=chapCam(o.k);c.s*=1.6;return c})():o.rect?fitCam():(function(){var f=fitCam();f.s*=.82;return f})()}toSky()}
  hint.hidden=false;clearTimeout(hint._t);hint._t=setTimeout(function(){hint.hidden=true},4200);req()}
var quietNext=null;
var _settle=settle;settle=function(m,k,o){if(quietNext){o=Object.assign({},o||{},{push:false});quietNext=null}_settle(m,k,o)};
function close(o){o=o||{};if(!open)return;tw=null;MP=null;INTO=null;var go=o.to;setTimeout(function(){if(!open)nearTiles()},o.quick?0:300);if(o.quick){sheet.hidden=true;D.classList.remove('sheet-on');open=false;CARDS.forEach(function(el){killPv(el)});__dive.quiet(false);from=null;HAND=null;return}
  function end(){sheet.hidden=true;D.classList.remove('sheet-on');open=false;CARDS.forEach(function(el){killPv(el)});__dive.quiet(false);from=null;HAND=null;
    if(go){if(go.lv===3)__dive.go(go,{replace:false});else __dive.go(go,{noAnim:true})}else __dive.sync();}
  if(o.hand){/* the column is already lined up underneath: the sheet just lets go */ if(anim()){sheet.animate([{opacity:1},{opacity:0}],{duration:320,easing:'ease-out'}).onfinish=end}else end();return}
  if(go&&go.k){__dive.go({k:go.k,lv:go.lv===3?2:go.lv},{push:false,noAnim:true,quiet:true});var c=document.getElementById(go.k);if(c)c.scrollIntoView({block:'start'})}
  else if(from)scrollTo(0,from.y);
  if(anim())sheet.animate([{opacity:1},{opacity:0}],{duration:260}).onfinish=end;else end()}
/* ---------- gestures on the sheet: one finger pans, two fingers drive the camera, tap zooms into what is under it ---------- */
var PT=new Map(),pd=0,pm=null,moved=0,t0=0,MP=null,lastTap=0,pinched=false,g0='sky'; /* g0: the level this two-finger gesture started at */
function zoomAt(f,x,y,cap){var p=wp(x,y);cam.s=Math.max(fitS()*.7,Math.min(cap||Math.max(3.2,deepS()),cam.s*f));cam.x=p[0]-(x-W/2)/cam.s;cam.y=p[1]-(y-H/2)/cam.s}
/* HYBRID-Y v1 PINCH-ON-LABEL: a finger that lands on a sky name is held back (it may be a tap on the name). A second finger turns both
   into a pinch and the name's click is ignored for 900 ms (yesterday could dive mid-pinch); a drag from a name pans; a lone tap still clicks it. */
var LBP=new Map(),lbSwallow=0;function lbPromote(){LBP.forEach(function(p,id){PT.set(id,p)});LBP.clear();lbSwallow=Date.now()}
sheet.addEventListener('pointerdown',function(e){if(e.target.closest('.sx,.shome'))return;
  if(e.target.closest('[data-sk]')&&!PT.size&&!LBP.size){LBP.set(e.pointerId,{x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY});t0=Date.now();return}
  if(LBP.size){lbPromote();moved=0;pinched=false}
  try{sheet.setPointerCapture(e.pointerId)}catch(x){}PT.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(PT.size===1){moved=0;t0=Date.now();pinched=false;PS={x:e.clientX,y:e.clientY};CO=null;VEL={x:0,y:0,t:0}}if(PT.size===2){GS0=cam.s;var a=[...PT.values()];pd=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);pm={x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2};moved=99;pinched=true;tw=null;g0=mode}});
sheet.addEventListener('pointermove',function(e){var lb=LBP.get(e.pointerId);if(lb){if(Math.abs(e.clientX-lb.x0)+Math.abs(e.clientY-lb.y0)<=10)return;lbPromote();moved=9;pinched=false;try{sheet.setPointerCapture(e.pointerId)}catch(x){}} /* HYBRID-Y v1 */
  if(!PT.has(e.pointerId))return;var o=PT.get(e.pointerId),n={x:e.clientX,y:e.clientY};PT.set(e.pointerId,n);
  if(PT.size===1&&!MP){var dx=n.x-o.x,dy=n.y-o.y;moved+=Math.abs(dx)+Math.abs(dy);if(moved>8){tw=null;if(PS){dx=n.x-PS.x;dy=n.y-PS.y;PS=null} /* FLY-SITE v1: the first 8 px are not lost */
    var nt=performance.now(),dt=Math.max(1,nt-VEL.t),a2=VEL.t&&dt<80?.4:1;VEL={x:VEL.x*(1-a2)+dx/dt*a2,y:VEL.y*(1-a2)+dy/dt*a2,t:nt};
    if(anim())ROT=Math.max(-.026,Math.min(.026,ROT+dx/(W||360)*.035)); /* v38b LOW-3: was .02 */ /* <= 1.5 deg turn of the dust while you swipe */
    cam.x-=dx/cam.s;cam.y-=dy/cam.s;clampCam();req()}}
  else if(PT.size===2){var a=[...PT.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),m={x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2};if(!pd){pd=d;pm=m;return}var f=d/pd;pd=d;pinch(f,m);pm=m;req()}});
function clampCam(){var b=M>.5?{x0:C.film.bx-200,x1:C.about.bx+530,y0:-400,y1:1800}:BOUND;cam.x=Math.max(b.x0,Math.min(b.x1,cam.x));cam.y=Math.max(b.y0,Math.min(b.y1,cam.y))}
/* continuous pinch. In the constellation, pinching past a chapter's own zoom starts the morph: the stars travel into its grid while you pinch */
function pinch(f,m){if(MP){MP.vs*=f;var p=Math.log(MP.vs/MP.s0)/Math.log(MP.R);if(p<0){var c0=MP.c0;MP=null;HAND=null;M=0;cam={x:c0.x,y:c0.y,s:c0.s};return}MP.p=Math.min(1,p);return}
  var px=pm?m.x-pm.x:0,py=pm?m.y-pm.y:0;cam.x-=px/cam.s;cam.y-=py/cam.s;
  if(INTO){var ns=INTO.s=INTO.s*f;if(ns<lockS()){INTO=null;cam.s=lockS();zoomAt(ns/cam.s,m.x,m.y);clampCam();return}if(intoAt(Math.min(ns,deepS()))>=1&&!INTO.done){INTO.done=1;openItem(INTO.it)}return} /* v4b PINCH-THROUGH */
  if(M<.02&&!(nearest(m.x,m.y)==='sound'&&window.__soundOne)){var k1=nearest(m.x,m.y),L=lockS(),cap1=k1==='about'||g0!=='chap'?L*1.03:L;zoomAt(detent(f),m.x,m.y,Math.max(cap1,chapCam(k1).s*1.3));clampCam();
    if(f>1&&cam.s>=L*.999&&k1!=='about'&&g0==='chap'){FK=k1;var c0={x:cam.x,y:cam.y,s:cam.s};prepHand(k1);var c1=blockCam(k1);MP={k:k1,c0:c0,c1:c1,s0:cam.s,vs:cam.s,p:0,R:Math.max(1.7,c1.s/cam.s)}}return} /* v4c LAND (Gill: the board should end up as in v3): pinching on from the lock morphs the opened constellation into the v3 grid and hands over to the real, natively scrolling column board (v3's MP morph, release() unchanged: past 30% it lands, else springs back to the lock). Replaces v4b's PINCH-THROUGH into one work; works open by select-then-open. */
  if(M<.02){var k=nearest(m.x,m.y),cap=k==='sound'&&window.__soundOne&&__soundOne.ready()?__soundOne.capS():chapCam(k).s*1.3; /* SOUND-ONE */zoomAt(detent(f),m.x,m.y,cap);clampCam(); /* FLY-SITE v1: detent */
    if(f>1&&cam.s>=cap*.995&&k==='sound'&&g0==='chap'&&!PL&&!window.__soundOne){FK=k;var c0={x:cam.x,y:cam.y,s:cam.s};MP={k:k,pl:1,c0:c0,c1:{x:C.sound.x,y:C.sound.y,s:cam.s*2},s0:cam.s,vs:cam.s,p:0,R:2}} /* FLY-SITE v1 */
    else if(f>1&&cam.s>=cap*.995&&k!=='about'&&g0==='chap'&&!(k==='sound'&&window.__soundOne)){FK=k; /* v3.2 QA HIGH: only from a constellation the gesture started in */var c0={x:cam.x,y:cam.y,s:cam.s};prepHand(k);var c1=blockCam(k);MP={k:k,c0:c0,c1:c1,s0:cam.s,vs:cam.s,p:0,R:Math.max(1.7,c1.s/cam.s)}}}
  else{zoomAt(f,m.x,m.y);clampCam()}}
function up(e){if(LBP.has(e.pointerId)){LBP.delete(e.pointerId);return} /* HYBRID-Y v1 */if(!PT.has(e.pointerId))return;var was=PT.size;PT.delete(e.pointerId);if(PT.size<2)pd=0;if(PT.size)return;if(pinched)lbSwallow=Date.now(); /* HYBRID-Y v1 */
  if(was===1&&moved<10&&Date.now()-t0<500){tap(e.clientX,e.clientY);return}if(pinched)release();else if(moved>8&&M<.02&&open&&!tw&&!MP)coast();else ui();PS=null} /* HYBRID-Y v1: was else ui() · FLY-SITE v1: coast() then panRest() */
/* FLY-SITE v1: let go of a pan = a short first-order ease-out (speed capped 1.4 px/ms, <= ~125 px, 520 ms, no overshoot); a finger that stopped does not coast */
var PS=null,VEL={x:0,y:0,t:0};function coast(){var v=Math.hypot(VEL.x,VEL.y),cap=Math.min(1,1.4/(v||1));if(!anim()||!VEL.t||performance.now()-VEL.t>100||v<.12){VEL.t=0;panRest();return}
  CO={vx:VEL.x*cap,vy:VEL.y*cap,tau:90,end:520,t0:performance.now(),k:1};VEL.t=0;req()}
/* after a pan: at a key moment's depth and within ~1/5 of the screen of its framing = ease back onto it; otherwise rest right here */
function panRest(){if(window.__soundOne&&__soundOne.release())return; /* SOUND-ONE */var k=nearest(),c=null,t=null;if(Math.abs(Math.log(cam.s/lockS()))<.06){var bx=C[k].box,inb=cam.x>=bx.x0&&cam.x<=bx.x1&&cam.y>=bx.y0&&cam.y<=bx.y1;if(inb){FK=k;settle('chap',k,{replace:true})}else toExp(k,420,{x:cam.x,y:cam.y});return} /* v4b: pan around at the lock; rests where you let go */
  rest()} /* v4c FREE REST: off the lock a pan rests where it is let go (v4a eased back onto sky / constellation / lock) */
sheet.addEventListener('pointerup',up);sheet.addEventListener('pointercancel',function(e){LBP.delete(e.pointerId); /* HYBRID-Y v1 */PT.delete(e.pointerId);if(!PT.size)release()});
/* release: snap to the nearest level */
function release(){if(INTO){var I=INTO;if(I.done)return;if(I.u>.3)flyInto(I.it);else{INTO=null;tween(expCam(I.it.k,{x:cam.x,y:cam.y}),0,420,function(){settle('chap',I.it.k)})}return} /* v4b PINCH-THROUGH: past ~1/3 = open it, else back to the lock */
  if(window.__soundOne&&!MP&&M<.02&&__soundOne.release())return; /* SOUND-ONE */if(MP&&MP.pl){var mq=MP;MP=null;cam=interp(mq.c0,mq.c1,mq.p);M=0;if(mq.p>.3)toPlayer();else toExp('sound',360);return} /* FLY-SITE v1 */
  if(MP){var mp=MP;MP=null;cam=interp(mp.c0,mp.c1,mp.p);M=mp.p;if(mp.p>.3){FK=mp.k;tween(mp.c1,1,Math.max(260,700*(1-mp.p)),function(){close({to:{k:mp.k,lv:2},hand:1})})}
    else{HAND=null;tween(expCam(mp.k),0,360,function(){settle('chap',mp.k)})}return} /* FLY-SITE v1: springs back to the opened constellation (was chapCam) */
  var s=cam.s;if(M>.5){var a=allS();if(s>a*1.7)dive(nearest());else if(s<a*.62)toSky();else{req();if(mode!=='all')settle('all')}return} /* v3.2 QA: reduced motion moved synchronously; no swallowed pinch */
  var f=fitS(),k=nearest(),cs=chapCam(k).s,L=Math.log(NEAR); /* HYBRID-Y v1: was if(s<Math.sqrt(f*cs))toSky();else toChap(k) (always snap) */
  var de=Math.log(s/(cs*EXS)),dc=Math.log(s/cs); /* FLY-SITE v1: + the opened constellation (from x EXS/1.1 up to the cap) */
  rest()} /* v4c FREE REST (Gill, ZOOM-STAY Oct 19): a released pinch rests where the fingers left it, no ease to the lock (was: rr<cut ? toSky() : toExp(k)) */ /* v4a: always settle on a main screen, the direction of the pinch decides */ /* v38b LOW-1: constellation | opened split at sqrt(EXS) ~ x1.118 */
/* HYBRID-Y v1: near a level = yesterday's snap; otherwise rest here (no camera move), naming the level by depth */
/* v4c FREE REST: name the level by depth and stay put (no camera move); the address is pushed, v4.js turns it into a replace inside one chapter */
function rest(){var s=cam.s,f=fitS(),k=nearest(),cs=chapCam(k).s,m=s<Math.sqrt(f*cs)?'sky':'chap';if(m==='sky'){FK=null;settle('sky')}else{FK=k;settle('chap',k)}req()}
var NEAR=1.15,GS0=0;function stay(){var s=cam.s,f=fitS(),k=nearest(),cs=chapCam(k).s,m=s<Math.sqrt(f*cs)?'sky':'chap';settle(m,m==='chap'?k:null,{replace:true});req()}
/* v4c SELECT (Gill: the sound player's press-to-select, on the boards): one press selects a work (mint frame + its title),
   a press on the selected one opens it exactly as v4b did, a press on another moves the selection. Only a clean single-finger
   press counts (up(): one pointer, moved < 10 px, < 500 ms); pinch, drag and the pinch-through never select or open. */
var SELI=null,SELR=null;function selTile(it){SELI=it;req()}function selOpen(it){if(SELI!==it){selTile(it);return false}SELI=null;return true}
function selMark(){CARDS.forEach(function(el,it){var on=it===SELI;if(!!el._sel!==on){el._sel=on;el.classList.toggle('v4c-sel',on)}});NT.forEach(function(el,it){var on=it===SELI;if(!!el._sel!==on){el._sel=on;el.classList.toggle('v4c-sel',on)}})}
var DT={t:0,x:0,y:0};function tap(x,y){var t=document.elementFromPoint(x,y);if(t&&t.closest('[data-sk]'))return; /* the name buttons handle their own click */
  if(M>.5){var hit=null,hd=1e9;ITEMS.forEach(function(it){var a=sp(it.gx,it.gy),b=sp(it.gx+104,it.gy+C[it.k].imgh);b[1]+=14; /* v3.2 QA: >= 44px tap target */
      var px=Math.max(0,(44-(b[0]-a[0]))/2),py=Math.max(0,(44-(b[1]-a[1]))/2);if(x>=a[0]-px&&x<=b[0]+px&&y>=a[1]-py&&y<=b[1]+py){var d=Math.hypot(x-(a[0]+b[0])/2,y-(a[1]+b[1])/2);if(d<hd){hd=d;hit=it}}});
    /* tiles smaller than a fingertip: the first tap magnifies the grid around the finger until tiles are >= 44px; the next tap opens one */
    if(hit){var ta=sp(hit.gx,hit.gy),tb=sp(hit.gx+104,hit.gy+C[hit.k].imgh+14),tm=Math.min(tb[0]-ta[0],tb[1]-ta[1]);if(tm<43.5&&cam.s<allS()*1.68){selTile(hit);var s2=Math.min(allS()*1.69,cam.s*46/tm),q=wp(x,y);tween({x:q[0]-(x-W/2)/s2,y:q[1]-(y-H/2)/s2,s:s2},1,320);return}}if(hit&&selOpen(hit))dive(hit.k,hit.k==='about'?null:hit.w);return}
  var best=null,bd=30;ORDER.forEach(function(k){var p=sp(C[k].x,C[k].y),d=Math.hypot(p[0]-x,p[1]-y);if(d<bd){bd=d;best={k:k}}});
  var fa=(cam.s/fitS()-1.25)/.9;ITEMS.forEach(function(it){if(!it.ring&&fa<.3)return;var p=sp(it.x,it.y),d=Math.hypot(p[0]-x,p[1]-y),hr=Math.max(24,tileOf(it).w*.55);if(d<Math.min(Math.max(bd,hr),hr)){bd=d;best={k:it.k,w:it.w}}});
  if(!best){if(SELI){SELI=null;req()}var o=sp(0,0),nt=performance.now();if(Math.hypot(o[0]-x,o[1]-y)<50){toSky();return}if(nt-DT.t<380&&Math.hypot(x-DT.x,y-DT.y)<40){DT.t=0;home();return}DT={t:nt,x:x,y:y};return} /* v4a: double-tap the sky = home */
  if(best.k==='sound'&&!best.w){toPlayer();return} /* FLY-SITE v1: the Sound star = the player */
  if(best.w&&mode==='chap'){var bi=C[best.k].items.filter(function(x){return x.w===best.w})[0];if(bi&&!selOpen(bi))return} /* v4c SELECT */
  if(best.w&&mode==='chap'&&best.k!=='about'&&best.k!=='sound'){flyInto(C[best.k].items.filter(function(x){return x.w===best.w})[0]);return} /* v4b: tap = fly into it */
  if(best.w&&mode==='chap')dive(best.k,best.k==='about'?null:best.w);else if(mode==='sky')(best.k==='about'?toChap('about'):dive(best.k));else dive(best.k)}
hud.addEventListener('click',function(e){var b=e.target.closest('[data-sk]');if(!b)return;e.preventDefault();if(Date.now()-lbSwallow<900)return; /* HYBRID-Y v1 */var k=b.dataset.sk;if(k==='sound'){toPlayer();return} /* FLY-SITE v1 */if(k==='about'&&mode!=='chap')toChap(k);else dive(k)});
sheet.addEventListener('wheel',function(e){e.preventDefault();tw=null;CO=null;var f=Math.exp(-e.deltaY*(e.ctrlKey?.01:.0022));if(M<.02&&!MP){if(!sheet._w){g0=mode;GS0=cam.s}pm=null;NODET=!e.ctrlKey;pinch(f,{x:e.clientX,y:e.clientY});NODET=0;pm=null;req();clearTimeout(sheet._w);sheet._w=setTimeout(function(){sheet._w=0;release()},260)} /* FLY-SITE v1: was zoomAt(f) (no cap, no detent, no morph) */
  else{pinch(f,{x:e.clientX,y:e.clientY});pm=null;req();clearTimeout(sheet._w);sheet._w=setTimeout(function(){sheet._w=0;release()},260)}},{passive:false});
$('.sx',sheet).addEventListener('click',function(e){e.preventDefault();if(window.__soundOne&&__soundOne.state().state==='player'){__soundOne.leave();return}if(mode==='sky'&&!tw)close();else step(-1)});
$('.shome',sheet).addEventListener('click',function(e){e.preventDefault();home()});
function home(){if(window.__soundOne&&__soundOne.state().state==='player'){__soundOne.leave();return}tw=null;MP=null;FK=null;crumbFor('sky');tween(fitCam(),0,M>.5?1100:700,function(){settle('sky')})} /* v4a */
addEventListener('keydown',function(e){if(!open)return;if(e.key==='Escape'){if(mode==='sky')close();else step(-1)}if(e.key==='+'||e.key==='='){e.stopImmediatePropagation();step(1)}if(e.key==='-'){e.stopImmediatePropagation();step(-1)}},true);
addEventListener('resize',function(){if(open){size();if(!tw&&!MP){if(mode==='sky')cam=fitCam();else if(mode==='chap')cam=FK==='sound'?chapCam(FK):expCam(FK,{x:cam.x,y:cam.y})}req()}portalDraw()});
addEventListener('popstate',function(){var h=location.hash,m=h.match(/^#(sky|all)(?:\/(\w+))?/);if(m){show({mode:m[1]==='all'?'all':m[2]&&C[m[2]]?'chap':'sky',k:m[2],push:false})}else if(open){close({to:null,nopush:1})}});
/* ---------- the portal: the Dive ends in this view of the whole sky (tap or pinch it to fly in) ---------- */
var portal=$('.portal'),pcv=portal&&$('canvas',portal),pio=null,pvis=false;
function portalDraw(){if(!pcv||!pvis)return;var r=pcv.getBoundingClientRect();if(!r.width)return;var d=Math.min(2,devicePixelRatio||1);pcv.width=Math.round(r.width*d);pcv.height=Math.round(r.height*d);var g=pcv.getContext('2d');g.setTransform(d,0,0,d,0,0);
  var s=Math.min((r.width-16)/(BOUND.x1-BOUND.x0),(r.height-16)/(BOUND.y1-BOUND.y0)),sM=M,sc=cam;M=0;layout();draw(g,r.width,r.height,{x:(BOUND.x0+BOUND.x1)/2,y:(BOUND.y0+BOUND.y1)/2,s:s},{labels:true,full:true});M=sM;layout()}
if(portal){if('IntersectionObserver' in window){pio=new IntersectionObserver(function(es){pvis=es[0].isIntersecting;if(pvis)portalDraw()},{rootMargin:'200px 0px'});pio.observe(portal)}else{pvis=true;portalDraw()}
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(portalDraw);
  portal.addEventListener('click',function(e){e.preventDefault();show({rect:portal.getBoundingClientRect()})})}
/* SOUND-ONE: what sound-one.js needs from the sky */
window.__sheetOne={cam:function(){return{x:cam.x,y:cam.y,s:cam.s}},setCam:function(c){cam={x:c.x,y:c.y,s:c.s};tw=null;CO=null;MP=null;req()},sound:function(){return{x:C.sound.x,y:C.sound.y}},
  chap:function(){return chapCam('sound')},nearest:function(){return nearest()},rect:function(){return{w:W,h:H}},open:function(){return open},moving:function(){return !!(tw||MP||PT.size)},
  setA:function(a){if(a!==SNDA){SNDA=a;req()}},settleChap:function(o){FK='sound';settle('chap','sound',o||{replace:true})},
  show:function(o){show(o)},crumb:function(t){crumb.textContent=t||'';},redraw:function(){req()}};
window.__sheet={keys:function(){var k=nearest(),c=chapCam(k);return{k:k,fit:fitS(),chap:c.s,exp:lockS(),lock:lockS(),deep:deepS(),into:INTO?{w:INTO.it.w,u:INTO.u}:null,near:NL.children.length,clips:NL.querySelectorAll('video').length,rot:ROT,pl:PL,v4c:{ok:Object.keys(OK).reduce(function(o,k){o[k]=+OK[k].toFixed(3);return o},{}),dep:+DEP.toFixed(3),cs:+chapCam(k).s.toFixed(4),sel:SELI?SELI.k+'/'+SELI.w:null,picks:ITEMS.filter(function(i){return i.pick}).map(function(i){return i.k+'/'+i.w})}}},bench:function(n){var t=performance.now();for(var i=0;i<n;i++){layout();ctx.setTransform(dpr,0,0,dpr,0,0);draw(ctx,W,H,cam,{cards:true,hud:[]})}return (performance.now()-t)/n},open:function(o){show(o||{})},close:close,step:step,isOpen:function(){return open},ui:ui,
  state:function(){return{open:open,mode:mode,k:FK,m:+M.toFixed(3),s:+cam.s.toFixed(4),fit:+fitS().toFixed(4),all:+allS().toFixed(4),moving:!!(tw||MP),
    chapters:ORDER.map(function(k){var p=sp(C[k].x,C[k].y);return{k:k,x:+p[0].toFixed(1),y:+p[1].toFixed(1)}}),w:W,h:H,top:TOP,cards:[].slice.call(world.querySelectorAll('.card')).filter(function(c){var r=c.getBoundingClientRect();return r.bottom>0&&r.top<H&&r.right>0&&r.left<W&&+getComputedStyle(world).opacity>.5}).length,labels:labRects.length}},
  cell:function(k,w){var it=C[k].items.filter(function(x){return x.w===w})[0];var a=sp(it.x,it.y);return a}};
/* deep link */
(function(){var m=location.hash.match(/^#(sky|all)(?:\/(\w+))?/);if(m){var a=anim;show({mode:m[1]==='all'?'all':m[2]&&C[m[2]]?'chap':'sky',k:m[2],push:false})}})();
})();
