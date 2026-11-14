/* u1 · one sky.
 Far: five constellations around ᑕᐣᓯ, lit by the work, no counts.
 Then a chapter board (stars bloom into titled thumbnails).
 Then the piece: Scope, the filmstrip, the waveform, the feed.
 Drag looks a little. Tap chooses. Tap again opens. Back is one level. */
(function(){
'use strict';
var Q = new URLSearchParams(location.search);
var PROOF = true;
var PRO2 = 'media/pro2/';
var REELB = PRO2 + 'reel/';
var JOIOB = PRO2 + 'joio/';
var ORDER = ['film','photo','objects','sound','about'];
var ANG = {about:-90,photo:-18,objects:54,sound:126,film:198};
var ANGP = {about:-90,photo:-36,objects:36,sound:144,film:216};
var MINT = '85,218,161';
var SH = {"film":{"t":"150,220,255","s":[[0.105,0.21,0.92,0],[0.89,0.13,0.74,0],[0.93,0.81,0.96,0],[0.065,0.86,0.68,0],[0.209,0.266,0.34,0],[0.33,0.252,0.44,0],[0.465,0.272,0.3,0],[0.685,0.23,0.4,0],[0.809,0.261,0.3,0],[0.201,0.781,0.4,0],[0.297,0.725,0.28,0],[0.431,0.764,0.44,0],[0.533,0.752,0.3,0],[0.679,0.775,0.38,0],[0.816,0.721,0.3,0],[0.075,0.53,0.36,0],[0.485,0.5,0.5,0],[0.98,0.44,0.22,1],[0.025,0.3,0.2,1],[0.58,0.04,0.2,1],[0.35,0.95,0.24,1]],"e":[[0,1],[1,2],[2,3],[3,15]]},"photo":{"t":"170,245,212","s":[[0.505,0.51,1,0],[0.521,0.164,0.82,0],[0.686,0.425,0.62,0],[0.654,0.71,0.9,0],[0.49,0.851,0.58,0],[0.33,0.64,0.78,0],[0.336,0.268,0.66,0],[0.586,0.449,0.3,0],[0.564,0.618,0.36,0],[0.486,0.667,0.28,0],[0.433,0.551,0.38,0],[0.447,0.42,0.3,0],[0.522,0.344,0.34,0],[0.15,0.2,0.24,1],[0.84,0.86,0.2,1],[0.88,0.22,0.3,1]],"e":[[1,2],[2,3],[3,4],[5,6],[6,1],[1,7],[2,8],[3,9],[4,10],[5,11],[6,12]]},"objects":{"t":"255,236,205","s":[[0.32,0.37,0.78,0],[0.585,0.33,0.98,0],[0.605,0.89,0.74,0],[0.305,0.92,0.6,0],[0.465,0.12,0.5,0],[0.735,0.09,0.7,0],[0.755,0.63,0.55,0],[0.45,0.64,0.2,0],[0.18,0.22,0.26,1],[0.89,0.4,0.22,1],[0.8,0.92,0.3,1],[0.31,0.65,0.3,0]],"e":[[0,1],[1,2],[2,3],[3,11],[11,0],[4,5],[5,6],[0,4],[1,5],[2,6]]},"sound":{"t":"255,182,176","s":[[0.058,0.493,0.35,0],[0.143,0.434,0.45,0],[0.195,0.295,0.63,0],[0.186,0.645,0.45,0],[0.282,0.392,0.53,0],[0.338,0.216,0.8,0],[0.347,0.763,0.55,0],[0.441,0.135,0.92,0],[0.442,0.812,0.62,0],[0.498,0.253,0.71,0],[0.567,0.183,0.86,0],[0.57,0.827,0.58,0],[0.659,0.355,0.57,0],[0.718,0.259,0.66,0],[0.719,0.711,0.47,0],[0.807,0.434,0.44,0],[0.886,0.419,0.5,0],[0.941,0.497,0.35,0],[0.26,0.93,0.2,1],[0.61,0.06,0.24,1],[0.9,0.88,0.26,1],[0.15,0.7,0.3,1]],"e":[[2,3],[5,6],[7,8],[10,11],[13,14],[0,1],[1,2],[2,4],[4,5],[5,7],[7,9],[9,10],[10,12],[12,13],[13,15],[15,16],[16,17]]},"about":{"t":"214,222,236","s":[[0.309,0.271,0.7,0],[0.209,0.272,0.45,0],[0.113,0.366,0.6,0],[0.067,0.587,0.85,0],[0.103,0.808,0.5,0],[0.202,0.903,0.6,0],[0.31,0.882,0.55,0],[0.361,0.254,0.5,0],[0.46,0.301,0.4,0],[0.475,0.408,0.7,0],[0.422,0.569,0.42,0],[0.362,0.556,0.5,0],[0.583,0.94,0.65,0],[0.589,0.61,0.55,0],[0.681,0.587,0.5,0],[0.738,0.451,0.45,0],[0.748,0.224,0.9,0],[0.932,0.127,0.5,0],[0.963,0.206,0.8,0],[0.956,0.305,0.55,0],[0.917,0.366,0.36,0],[0.88,0.28,0.2,0],[0.45,0.92,0.22,1],[0.5,0.1,0.2,1]],"e":[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[7,8],[8,9],[9,10],[10,11],[12,13],[13,14],[14,15],[15,16],[17,18],[18,19],[19,20]]}};
var STROKES = [[[-58.5,-96],[-156.5,-95],[-203.5,-61],[-213.5,1],[-203.5,63],[-156.5,97],[-58.5,97]],[[-26.5,-97],[25.5,-94],[44.5,-51],[25.5,-8],[-26.5,-5]],[[99.5,105],[99.5,20],[149.5,15],[191.5,-11],[211.5,-55],[214.5,-105]]];
var $=function(id){return document.getElementById(id)};
var cv=$('cv'),g=cv.getContext('2d'),stage=$('stage');
var W=0,H=0,DPR=1,PORT=false;
var data=null,CH={},byId={},progress=[],cluster=[];
/* site-3d's critically damped spring (sstep). Level changes use its glide
 weight, so a board arrives and settles instead of easing like a button.
 Drag never yaws the camera. */
function S(x,w){return{x:x,v:0,t:x,w:w}}
function sstep(s,dt){var w=s.w,e=s.x-s.t,k=Math.exp(-w*dt),c=s.v+w*e;s.x=s.t+(e+c*dt)*k;s.v=(s.v-w*c*dt)*k}
var W_GLIDE=4.8,W_LOOK=9.5;
var cxS=S(0,W_GLIDE),cyS=S(0,W_GLIDE),csS=S(.3,W_GLIDE);
var bxS=S(0,W_GLIDE),pxS=S(0,W_GLIDE),lxS=S(0,W_LOOK),lyS=S(0,W_LOOK),scr=S(0,10);
var rest={x:0,y:0,s:.3},look={x:0,y:0},FAR={x:0,y:0,s:.3};
var bloom=0,bloomK=null,pbloom=0,scrK=null;
var cur={lv:0,k:null,id:null},sel=null,phase='boot';
var cardsStar=null;
var flyU=1,flyT=0,markPts=[],markTo=[];
var landI=0,landT=0,lands=[];
var drag=null,pinch=null,moved=false,PT={};
function lsr(k,d){try{var v=parseFloat(localStorage.getItem(k));return isFinite(v)?Math.max(0,Math.min(1,v)):d}catch(x){return d}}
var GVOL=lsr('gj.vol',1),GFL=lsr('gj.flash',.6);
function lsOn(k){try{var v=localStorage.getItem(k);return v==='1'||v==='true'||v==='yes'}catch(x){return false}}
var GNOFLASH=lsOn('gj.noflash'),GGL=lsr('gj.glitch',1);
function applyCtl(){document.documentElement.style.setProperty('--flash',GFL);if(au)au.volume=GVOL}
addEventListener('storage',function(e){
  if(e.key==='gj.vol'){GVOL=lsr('gj.vol',1);applyCtl()}
  if(e.key==='gj.flash'){GFL=lsr('gj.flash',.6);applyCtl()}
  if(e.key==='gj.noflash'){GNOFLASH=lsOn('gj.noflash');applyNoflash()}
  if(e.key==='gj.glitch'){GGL=lsr('gj.glitch',1);applyGlitch()}
});
var song=null,playing=false,au=null,AC=null,AN=null,FD=null,TD=null,L={rms:0,beat:0};
var CHIMES=[],reelCtl=null,lastT=0,ready=false;
var GLOW={};

function rnd(i){var x=Math.sin(i*12.9898+78.233)*43758.5453;return x-Math.floor(x)}
function clamp(v,a,b){return v<a?a:v>b?b:v}
/* Debug tune. Each default is the sky as written. Only the debug panel writes these. */
var TDEF={map:1.3,stars:1.2,lineA:1,lineW:1,starS:1,starG:1,pinch:1,far:1,mid:1,board:1,delay:1,open:1,fade:1,flash:.6};
var TUNE={map:1.3,stars:1.2,lineA:1,lineW:1,starS:1,starG:1,pinch:1,far:1,mid:1,board:1,delay:1,open:1,fade:1,flash:.6};
var SPATIAL={map:1,stars:1,far:1,mid:1,board:1};
function tk(k){var v=TUNE[k];return (v==null||!isFinite(+v))?1:+v}
function lerp(a,b,u){return a+(b-a)*u}
function ease(u){u=clamp(u,0,1);return u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2}
function now(){return performance.now()}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

function boot(d){
  data=d;
  d.chapters.forEach(function(ch){
    var c=CH[ch.k]={k:ch.k,tint:ch.tint,items:[],skyItems:[],node:[],dec:[],sky:[],arm:[],x:0,y:0};
    ch.cards.forEach(function(card){
      var it=Object.assign({ox:0,oy:0,sx:0,sy:0,gx:0,gy:0,cx:0,cy:0,px:0,py:0,b:.6,sh:0,tw:52,th:29},card);
      c.items.push(it);byId[it.id]=it;
      if(it.in_progress)progress.push(it);else c.skyItems.push(it);
    });
  });
  /* In progress sits by the mark: the carve, the three boards, and the Lost Coffee songs. */
  if(byId['sound/to-go']&&progress.indexOf(byId['sound/to-go'])<0)progress.push(byId['sound/to-go']);
  d.tracks.forEach(function(t){
    t._i=0;
    if(t.artist!=='Lost Coffee'||t.k==='togo')return;
    var it={id:'sound/track/'+t.k,chapter:'sound',k:t.k,slug:t.k,title:t.title,role:'Lost Coffee',year:null,meta:'Lost Coffee',kind:'track',track:t,media:{},credits:[],related:[],also:[],in_progress:true,body:'',isNew:false,ox:0,oy:0,sx:0,sy:0,gx:0,gy:0,cx:0,cy:0,px:0,py:0,b:.6,sh:0,tw:52,th:29};
    byId[it.id]=it;progress.push(it);
  });
  cluster=['objects/hand-carved-piece','objects/design-board','objects/wireframe-board','objects/materials-board','sound/to-go','sound/track/noproblem','sound/track/lostintime','sound/track/equals','sound/track/ii'].map(function(id){return byId[id]}).filter(Boolean);
  cluster.forEach(function(it){var c=CH[it.chapter];if(c)c.skyItems=c.skyItems.filter(function(x){return x!==it})});
  addNov9();
  d.tracks.forEach(function(t){
    var id='sound/track/'+t.k;if(byId[id])return;
    byId[id]={id:id,chapter:'sound',k:t.k,slug:t.k,title:t.title,role:t.artist,year:null,meta:t.artist,kind:'track',track:t,media:{},credits:[],related:[],also:[],in_progress:false,body:'',isNew:false,ox:0,oy:0,sx:0,sy:0,gx:0,gy:0,cx:0,cy:0,px:0,py:0,b:.6,sh:0,tw:52,th:29};
  });
  if(window.GJ_INNER)GJ_INNER.build({PRO2:PRO2,JOIOB:JOIOB,CH:CH,byId:byId});
  mergeCredits();
  song=d.tracks[0];
  buildGlow();buildField();layout();
  fillPoem();dust();
  lands=landFrames();
  if(window.GJ_OPEN)GJ_OPEN.mount(openCards()); /* fable-m4: Film cards board only */
  bind();
  decide();
  ready=true;
  requestAnimationFrame(frame);
}

/* Gill's Nov 9 media live on the boards and in pieces only, never in the sky layout. */
var NOV9I={};
function addNov9(){
  (window.NOV9||[]).forEach(function(f){
    if(!CH[f.k])return;
    var slug='nov9-'+f.name.toLowerCase();
    var it={id:f.k+'/'+slug,chapter:f.k,k:'nov9',slug:slug,title:'',role:'',year:null,meta:'',kind:f.k==='film'?'still':(f.k==='photo'?'photo':'object'),of:f.of||'',nov9:1,
      media:{thumb:f.thumb,big:f.big,w:f.w,h:f.h},shots:[{src:f.big,clip:f.clip||'',nov9:1}],credits:[],related:[],also:[],in_progress:false,body:'',isNew:false,ox:0,oy:0,sx:0,sy:0,gx:0,gy:0,cx:0,cy:0,px:0,py:0,b:.6,sh:0,tw:52,th:29};
    byId[it.id]=it;(NOV9I[f.k]=NOV9I[f.k]||[]).push(it);
  });
}
/* Sound board: every song as one stretch of a single dotted waveform, then the player and the streaming rows. */
/* Text links under the Sound waveform: [text, isLink]. Lost Coffee's two services share one line. */
function soundSegs(it){
  if(it.id==='sound/lost-coffee-apple-music')return [[' · ',0],['Apple Music',1]];
  if(it.kind==='player'||it.id==='sound/waveform')return [[it.title||'',1],[' · '+(it.meta||''),0]];
  return [[it.title||'',0],[' · ',0],[it.meta||'',1]];
}
function soundBoard(){
  var out=(data.tracks||[]).map(function(t){return byId['sound/track/'+t.k]}).filter(Boolean);
  return out.concat(CH.sound.items.filter(function(it){return it.id!=='sound/to-go'}));
}
function mergeCredits(){
  var C=window.GJ_COPY&&GJ_COPY.credits;if(!C)return;
  Object.keys(byId).forEach(function(id){
    var it=byId[id];if(!it||it.chapter!=='film')return;
    var row=C[it.k];if(!row)return;
    var bits=(it.credits||[]).slice();
    function add(s){if(s&&bits.indexOf(s)<0)bits.push(s)}
    if(row.dir)add('dir. '+row.dir);
    if(row.cam)add(row.cam);
    if(row.prod)add(row.prod);
    if(row.agency)add(row.agency);
    if(row.b)add(row.b);
    it.credits=bits;
  });
}
function buildGlow(){
  function glow(rgb){var c=document.createElement('canvas');c.width=c.height=128;var q=c.getContext('2d'),gr=q.createRadialGradient(64,64,0,64,64,64);
    gr.addColorStop(0,'rgba('+rgb+',.95)');gr.addColorStop(.18,'rgba('+rgb+',.4)');gr.addColorStop(.55,'rgba('+rgb+',.08)');gr.addColorStop(1,'rgba('+rgb+',0)');
    q.fillStyle=gr;q.fillRect(0,0,128,128);return c}
  GLOW.w=glow('205,225,255');GLOW.m=glow(MINT);GLOW.c=glow('160,190,240');
  ORDER.forEach(function(k){CH[k].glow=glow(CH[k].tint)});
}
/* Depth field: 4 layers, 378 stars. Each star has a home on a torus a margin
 wider than the screen (pans wrap off-screen, never on it) and a phase in a
 zoom cycle: zoom pushes it out from the screen centre by up to DZ.E, nearer
 layers faster, and it fades at both ends of its cycle so nothing pops.
 Pans slide by f*sqrt(z), not f*z, so a pan at sound zoom never moves a star
 past the margin in one frame. Size grows only by 1+DZ.g*f*ln(z).
 Every length is a share of the short side. */
var FIELD=[],HOP=0,FN=0,FDT=1/60,POPW=0,POPA=0;
var DZ={E:2.4,K:.36,slide:.85,g:.16,cap:1.45,streak:.06,tau:.05,dimR:.075,fin:.35};
/* v1r2: a star's drawn alpha rises toward its target with time constant DZ.fin (s), driven by the frame dt
 (FDT, already capped at 50 ms by the loop), and falls at once. A dropped frame therefore cannot take a
 star from unseen to bright in one step; a star that wraps restarts from 0. Settled frames are unchanged. */
function buildField(){
  [[0,150,.22,.42,.42],[1,110,.48,.58,.72],[2,78,.86,.74,.9],[3,40,1.25,.9,1.05]].forEach(function(L){
    var pts=[];for(var i=0;i<L[1];i++)pts.push({u:rnd(L[0]*1000+i),v:rnd(L[0]*3000+i),ph:rnd(L[0]*5100+i),b:.15+.85*Math.pow(rnd(L[0]*700+i),2),r:.4+L[4]*rnd(L[0]*90+i),px:0,py:0,pn:-9});
    FIELD.push({i:L[0],f:L[2],a:L[3],near:L[0]>=2,pts:pts});
  });
}
var SOFT=null;
function softDot(){
  if(SOFT)return SOFT;
  var c=document.createElement('canvas');c.width=c.height=32;var q=c.getContext('2d'),gr=q.createRadialGradient(16,16,0,16,16,16);
  gr.addColorStop(0,'rgba(228,236,248,1)');gr.addColorStop(.28,'rgba(220,230,245,.7)');gr.addColorStop(.6,'rgba(210,224,242,.18)');gr.addColorStop(1,'rgba(210,224,242,0)');
  q.fillStyle=gr;q.fillRect(0,0,32,32);return SOFT=c;
}
function depthZoom(){return rest.s/Math.max(1e-4,FAR.s)}
function fieldUnit(){return Math.min(W,H)||390}
function smooth(a,b,v){v=clamp((v-a)/(b-a),0,1);return v*v*(3-2*v)}
function layerView(L){
  var z=Math.max(1e-3,depthZoom()),lz=Math.log(z),m=fieldUnit();
  var sc=clamp(1+DZ.g*L.f*lz,.8,DZ.cap);
  /* nearer layers thin a little as the camera closes in, instead of growing */
  var na=L.near?clamp(1-.1*L.f*Math.max(0,lz),.62,1):1;
  return {f:L.f,n:L.pts.length,cyc:DZ.K*L.f*lz,scale:sc,slide:L.f*DZ.slide,alpha:na,
    su:clamp(Math.sqrt(m/900),.72,1.1),M:m*(.16+DZ.streak),ox:-rest.x*FAR.s*Math.sqrt(z)*L.f*DZ.slide-look.x*L.f*140,oy:-rest.y*FAR.s*Math.sqrt(z)*L.f*DZ.slide-look.y*L.f*140};
}
function depthStep(dt){
  var m=fieldUnit(),pan=Math.hypot(cxS.v,cyS.v)*rest.s,zr=Math.abs(csS.v)/Math.max(.02,csS.x);
  var target=clamp(pan/(.9*m)+zr*.5,0,1);
  HOP+=(target-HOP)*(1-Math.exp(-dt*14));
  FDT=dt||FDT;
}
/* Screen points the near dust keeps clear of: the mark, constellation nodes, names. */
function fieldMask(){
  var out=[],pad=fieldUnit()*DZ.dimR;
  function add(p){if(p[0]>-pad&&p[0]<W+pad&&p[1]>-pad&&p[1]<H+pad)out.push(p)}
  if(cur.lv===0)add(sp(0,0));
  ORDER.forEach(function(k){
    var c=CH[k];if(!c)return;
    if(cur.lv===0)add([sp(c.x,c.y+c.ex.y1)[0],sp(c.x,c.y+c.ex.y1)[1]+16]);
    (c.skyItems||[]).forEach(function(it){if(it.sh)add(sp(it.sx,it.sy))});
  });
  cluster.forEach(function(it){add(sp(it.cx,it.cy))});
  return out;
}
function drawField(fa){
  var m=fieldUnit(),cx=W/2,cy=H/2,mask=null,dimR=m*DZ.dimR,lnE=Math.log(DZ.E);
  var cap=m*DZ.streak,streak=HOP>.04,spr=softDot();FN++;
  FIELD.forEach(function(L){
    var lv=layerView(L),M=lv.M,TW=W+2*M,TH=H+2*M;
    var base=L.a*(.35+.65*Math.min(1,fa+.4))*lv.alpha;
    if(L.near&&!mask)mask=fieldMask();
    L.pts.forEach(function(p){
      var rx=p.u*TW+lv.ox,ry=p.v*TH+lv.oy,wi=Math.floor(rx/TW)*7919+Math.floor(ry/TH);
      var qx=rx-Math.floor(rx/TW)*TW-M,qy=ry-Math.floor(ry/TH)*TH-M;
      var c=p.ph+lv.cyc,ci=Math.floor(c);c-=ci;
      var e=Math.exp(lnE*c),x=cx+(qx-cx)*e,y=cy+(qy-cy)*e;
      var a=smooth(.02,.32,c)*(1-smooth(.6,.97,c));
      var cont=p.pn===FN-1,ok=cont,dx=x-p.px,dy=y-p.py,pa=ok?p.pa:0,jump=ok&&(wi!==p.wi||ci!==p.ci);
      if(jump&&p.pon)POPW++;
      p.px=x;p.py=y;p.pn=FN;p.pa=0;p.wi=wi;p.ci=ci;p.pon=0;
      if(jump){ok=false;pa=0}
      if(x<-M||x>W+M||y<-M||y>H+M||a<.01)return;
      var rr=p.r*lv.su*lv.scale,al=base*(.25+p.b*.6)*a;
      if(L.near&&mask.length){
        var dmin=1e9;for(var j=0;j<mask.length;j++){var mx=mask[j][0]-x,my=mask[j][1]-y,d=mx*mx+my*my;if(d<dmin)dmin=d}
        al*=.2+.8*smooth(dimR*.45,dimR,Math.sqrt(dmin));
      }
      if(cont&&al>pa)al=pa+(al-pa)*(1-Math.exp(-FDT/DZ.fin));
      if(al<.01){if(cont&&al>0){p.pa=al}return}
      var on=x>=-rr&&x<=W+rr&&y>=-rr&&y<=H+rr;
      p.pa=al;p.pon=on&&al>.02?1:0;
      if(jump&&on&&al>.02)POPW++;
      if(ok&&on&&pa<.01&&al>.12)POPA++;
      if(L.near){
        if(streak&&ok){
          var k=DZ.tau/Math.max(1/240,FDT),sx=dx*k,sy=dy*k,sl=Math.hypot(sx,sy);
          if(sl<M){
            if(sl>cap){sx*=cap/sl;sy*=cap/sl;sl=cap}
            if(sl>rr*1.5){
              g.globalAlpha=al*HOP*.85;g.strokeStyle='rgb(220,230,245)';g.lineWidth=Math.max(.6,rr*.9);g.lineCap='round';
              g.beginPath();g.moveTo(x-sx,y-sy);g.lineTo(x,y);g.stroke();
            }
          }
        }
        g.globalAlpha=al;var d2=rr*4.4;g.drawImage(spr,x-d2/2,y-d2/2,d2,d2);
      }else{
        g.globalAlpha=1;g.fillStyle='rgba(220,230,245,'+al.toFixed(3)+')';
        g.beginPath();g.arc(x,y,rr,0,7);g.fill();
      }
    });
  });
  g.globalAlpha=1;
}

function placeChapter(c){
  var S=SH[c.k],items=c.skyItems,cw=c.k==='photo'||c.k==='objects'?60:74,chh=c.k==='photo'||c.k==='objects'?78:56;
  if(c.k==='about'){cw=120;chh=40}
  var n=Math.max(items.length,1),A=Math.max(n*cw*chh*1.35,380*190),q=PORT?.92:.5;
  var bw=Math.sqrt(A/q),bh=bw*q;if(c.k==='about')bw=Math.max(bw,PORT?300:420);
  c.bw=bw;c.bh=bh;c.cell=[cw,chh];
  var P=S.s.map(function(p,i){return{i:i,ox:(p[0]-.5)*bw,oy:(p[1]-.5)*bh,b:p[2],st:p[3]}});
  var order=P.filter(function(p){return !p.st}).sort(function(a,b){return b.b-a.b||a.i-b.i});
  var list=items.slice().sort(function(a,b){return (b.isNew-a.isNew)||(a.i-b.i)});
  var placed=[],ii=0;c.node=[];
  function ok(x,y){for(var i=0;i<placed.length;i++){var p=placed[i];if(Math.abs(p.ox-x)<cw*.92&&Math.abs(p.oy-y)<chh*.92)return false}return true}
  order.forEach(function(p){if(ii>=list.length)return;if(ok(p.ox,p.oy)){var it=list[ii++];it.ox=p.ox;it.oy=p.oy;it.b=p.b;it.sh=1;placed.push(it);c.node[p.i]=it}});
  var cand=[];
  for(var r=-8;r<=8;r++)for(var qq=-8;qq<=8;qq++){var x=(qq+((r&1)?.5:0))*cw,y=r*chh;cand.push({x:x,y:y,d:Math.pow(x/(bw/2),2)+Math.pow(y/(bh/2),2)})}
  cand.sort(function(a,b){return a.d-b.d});
  for(var ci=0;ii<list.length&&ci<cand.length;ci++){var p=cand[ci];if(ok(p.x,p.y)){var it2=list[ii++];it2.ox=p.x;it2.oy=p.y;it2.b=.35;it2.sh=0;placed.push(it2)}}
  P.forEach(function(p){if(c.node[p.i])return;c.node[p.i]={ox:p.ox,oy:p.oy,b:p.b,st:p.st,dec:1,x:0,y:0}});
  c.dec=c.node.filter(function(n){return n&&n.dec});
  c.sky=[];S.e.forEach(function(e){var a=c.node[e[0]],b=c.node[e[1]];if(a&&b)c.sky.push([a,b])});
  var x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  function inc(x,y){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
  items.forEach(function(it){inc(it.ox,it.oy)});c.dec.forEach(function(d){inc(d.ox,d.oy)});
  c.ex={x0:x0-16,y0:y0-16,x1:x1+16,y1:y1+16};
}
function chapterAt(k,rx,ry){var a=(PORT?ANGP:ANG)[k]*Math.PI/180;return{x:Math.cos(a)*rx,y:Math.sin(a)*ry}}
function layout(){
  DPR=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;PORT=H>W*1.05;
  markLayout();
  cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);cv.style.width=W+'px';cv.style.height=H+'px';
  ORDER.forEach(function(k){placeChapter(CH[k])});
  var rx=PORT?300:500,ry=PORT?460:380,scale=1,box;
  for(var n=0;n<28;n++){
    ORDER.forEach(function(k){var c=CH[k],p=chapterAt(k,rx,ry);c.x=p.x;c.y=p.y});
    box=bbox();
    var centre={x0:-70,y0:-80,x1:70,y1:160};
    var hitC=false;
    ORDER.forEach(function(k){var c=CH[k],x0=c.x+c.ex.x0,x1=c.x+c.ex.x1,y0=c.y+c.ex.y0,y1=c.y+c.ex.y1;
      if(x0<centre.x1&&centre.x0<x1&&y0<centre.y1&&centre.y0<y1)hitC=true});
    if(hitC){rx*=1.06;ry*=1.06;continue}
    scale=Math.min((W-28)/(box.x1-box.x0),(H-78-36)/(box.y1-box.y0));
    var label=40/scale;
    var overlap=false;
    var rects=ORDER.map(function(k){var c=CH[k];return{x0:c.x+c.ex.x0,x1:c.x+c.ex.x1,y0:c.y+c.ex.y0,y1:c.y+c.ex.y1+label}});
    for(var i=0;i<rects.length;i++)for(var j=i+1;j<rects.length;j++){var a=rects[i],b=rects[j];
      if(a.x0<b.x1&&b.x0<a.x1&&a.y0<b.y1&&b.y0<a.y1)overlap=true}
    if(overlap){rx*=1.05;ry*=1.05;continue}
    break;
  }
  /* Spread the five centres after the fit, and keep FAR at the fitted scale,
 so a multiplier of 1 is this map and any other value actually moves them apart. */
  var mapK=tk('map');
  if(mapK!==1){ORDER.forEach(function(k){var c=CH[k],p=chapterAt(k,rx*mapK,ry*mapK);c.x=p.x;c.y=p.y})}
  ORDER.forEach(function(k){var c=CH[k];
    c.skyItems.forEach(function(it){it.sx=c.x+it.ox;it.sy=c.y+it.oy});
    c.dec.forEach(function(d){d.x=c.x+d.ox;d.y=c.y+d.oy});
    c.node.forEach(function(nd){if(nd&&nd.dec){nd.x=c.x+nd.ox;nd.y=c.y+nd.oy}else if(nd&&nd.sx!=null){nd.x=nd.sx;nd.y=nd.sy}});
  });
  /* Star spread scales each constellation about its own centre, after the fit,
 so 1 leaves the stars where placeChapter put them and the camera does not refit it away. */
  var starK=tk('stars');
  if(starK!==1){
    ORDER.forEach(function(k){
      var c=CH[k];
      c.skyItems.forEach(function(it){it.ox*=starK;it.oy*=starK;it.sx=c.x+it.ox;it.sy=c.y+it.oy});
      c.dec.forEach(function(d){d.ox*=starK;d.oy*=starK;d.x=c.x+d.ox;d.y=c.y+d.oy});
      c.node.forEach(function(nd){
        if(!nd)return;
        if(nd.dec){nd.x=c.x+nd.ox;nd.y=c.y+nd.oy}
        else if(nd.sx!=null){nd.x=nd.sx;nd.y=nd.sy}
      });
      c.ex={x0:c.ex.x0*starK,y0:c.ex.y0*starK,x1:c.ex.x1*starK,y1:c.ex.y1*starK};
    });
  }
  /* Wider spacing makes a wider sky, so FAR refits and all five still sit on screen. At 1 and 1 the fit above stands untouched. */
  if(mapK!==1||starK!==1){
    box=bbox();
    ORDER.forEach(function(k){var c=CH[k],hw=c.bw*.5;box.x0=Math.min(box.x0,c.x-hw);box.x1=Math.max(box.x1,c.x+hw)});
    scale=Math.min((W-28)/(box.x1-box.x0),(H-78-36)/(box.y1-box.y0));
  }
  /* In progress sits beside ᑕᐣᓯ, a small cluster in the inner sky, clear of the five chapters. */
  var nC=Math.max(cluster.length,1);
  cluster.forEach(function(it,i){
    var a=-Math.PI/2+i/nC*Math.PI*2;
    it.cx=280+Math.cos(a)*78;
    it.cy=36+Math.sin(a)*56;
    it._cluster=1;
  });
  progress.forEach(function(it){if(!it._cluster){it.cx=0;it.cy=120}});
  boards();
  FAR={x:0,y:0,s:scale};
  if(!ready){cxS.x=cxS.t=0;cyS.x=cyS.t=0;csS.x=csS.t=scale;rest.s=scale}
  markPair();
}
function bbox(){
  var b={x0:1e9,y0:1e9,x1:-1e9,y1:-1e9};
  ORDER.forEach(function(k){var c=CH[k];b.x0=Math.min(b.x0,c.x+c.ex.x0);b.x1=Math.max(b.x1,c.x+c.ex.x1);b.y0=Math.min(b.y0,c.y+c.ex.y0-20);b.y1=Math.max(b.y1,c.y+c.ex.y1+36)});
  b.x0=Math.min(b.x0,-80);b.x1=Math.max(b.x1,80);b.y0=Math.min(b.y0,-90);b.y1=Math.max(b.y1,200);
  return b;
}
function boards(){
  var s=boardScale();
  ORDER.forEach(function(k){
    var c=CH[k],cols=W<520?2:W<900?3:4,gap=8,side=12,cap=34;
    var tw=(W-side*2-(cols-1)*gap)/cols,th=k==='about'?42:(k==='photo'||k==='objects'?tw:tw*9/16);
    var pitch=th+cap+10,n=c.items.length,rows=Math.ceil(n/cols);
    var bw=cols*tw+(cols-1)*gap,bh=rows*pitch;
    c.items.forEach(function(it,i){
      var r=Math.floor(i/cols),q=i%cols;
      it.tw=tw/s;it.th=th/s;
      it.gx=c.x+((q+.5)*tw+q*gap-bw/2)/s;
      it.gy=c.y+((r)*pitch+th/2-bh/2)/s;
    });
    c.bex={x0:c.x-bw/2/s-8,x1:c.x+bw/2/s+8,y0:c.y-bh/2/s-8,y1:c.y+bh/2/s+8};
  });
  var s2=boardScale(),cols2=2,gap2=10,tw2=(Math.min(W,520)-36)/2,th2=tw2*9/16,cap2=32,pitch2=th2+cap2+12;
  var bw2=cols2*tw2+gap2,bh2=2*pitch2;
  progress.forEach(function(it,i){
    var r=Math.floor(i/2),q=i%2;
    it.tw=tw2/s2;it.th=th2/s2;
    it.px=((q+.5)*tw2+q*gap2-bw2/2)/s2;
    it.py=(168)+((r)*pitch2+th2/2-bh2/2)/s2;
  });
}
function boardScale(){return clamp(W/280,1.15,2.4)}
function fitBox(b,top,bot){
  var s=Math.min((W-24)/(b.x1-b.x0),(H-top-bot)/(b.y1-b.y0));
  var cy=(top+(H-bot))/2;
  return {x:(b.x0+b.x1)/2,y:(b.y0+b.y1)/2-(cy-H/2)/s,s:s};
}
function camFor(st){
  if(!st||st.lv===0){var fs=tk('far');return fs===1?FAR:{x:FAR.x,y:FAR.y,s:FAR.s*fs}}
  if(st.lv===2&&st.id&&byId[st.id]&&byId[st.id].kind==='player'){
    var c=CH.sound,e=c.ex;return fitBox({x0:c.x+e.x0,y0:c.y+e.y0,x1:c.x+e.x1,y1:c.y+e.y1},70,160);
  }
  /* Dive into the constellation. The scale is past a snug fit, so the outer nodes leave the screen, and the spring eases to a stop. The work window still takes the phone. */
  if(st.k==='progress')return {x:0,y:36,s:Math.max(FAR.s*2.6,0.85)};
  if(CH[st.k]){
    var ch=CH[st.k],ex=ch.ex;
    var fit=fitBox({x0:ch.x+ex.x0,y0:ch.y+ex.y0,x1:ch.x+ex.x1,y1:ch.y+ex.y1},36,28);
    if(st.lv>=1&&st.b){
      var tx=fit.x,ty=fit.y;
      if(BTOUCH&&BTOUCH.k===st.k){tx+=(BTOUCH.x-fit.x)*.35;ty+=(BTOUCH.y-fit.y)*.35}
      return {x:tx,y:ty,s:fit.s*1.45*1.3*tk('board')};
    }
    return {x:fit.x,y:fit.y,s:fit.s*1.45*tk('mid')};
  }
  return FAR;
}
function aim(s,t,instant){s.t=t;s.w=instant?40:W_GLIDE;if(instant){s.x=t;s.v=0}}

function cam(){return {x:rest.x+look.x,y:rest.y+look.y,s:rest.s}}
function sp(x,y){var c=cam();return [(x-c.x)*c.s+W/2,(y-c.y)*c.s+H/2]}
function wp(x,y){var c=cam();return [(x-W/2)/c.s+c.x,(y-H/2)/c.s+c.y]}

function stepSprings(dt){
  if(!drag){sstep(lxS,dt);sstep(lyS,dt)}
  sstep(cxS,dt);sstep(cyS,dt);sstep(csS,dt);sstep(bxS,dt);sstep(pxS,dt);
  if(!drag||cur.lv<1)sstep(scr,dt);
  rest.x=cxS.x;rest.y=cyS.x;rest.s=Math.max(.02,csS.x);
  look.x=lxS.x;look.y=lyS.x;
  bloom=bxS.x;pbloom=pxS.x;
  if(bxS.t===0&&bloom<.02&&pxS.t===0&&pbloom<.02)bloomK=null;
}
function arriveAt(st,instant){
  var to=camFor(st);
  var player=st.lv===2&&st.id&&byId[st.id]&&byId[st.id].kind==='player';
  var b1=(st.lv>=1&&st.k&&st.k!=='progress'&&!player)?1:0;
  var p1=(st.k==='progress')?1:0;
  if(b1>0||p1>0)bloomK=st.k;
  aim(cxS,to.x,instant);aim(cyS,to.y,instant);aim(csS,to.s,instant);
  aim(bxS,b1,instant);aim(pxS,p1,instant);
  aim(lxS,0,instant);aim(lyS,0,instant);
  if(st.k!==scrK||st.lv===0){aim(scr,0,instant);scrK=st.lv===0?null:st.k}
  if(instant){rest.x=to.x;rest.y=to.y;rest.s=to.s;bloom=b1;pbloom=p1;look.x=look.y=0;if(!b1&&!p1)bloomK=st.k}
  renderLayer();syncBio();ui();
  if(st.k&&CH[st.k])want(st.k);
  if(st.k==='progress')progress.forEach(loadImg);
  syncCardsBoard();
}

function posOf(it){
  if(it.in_progress)return [it.cx,it.cy];
  return [it.sx,it.sy];
}
function screenOf(it){
  if(onBoard()&&(cur.k==='progress'?pbloom:bloom)>.65){
    var items=boardItems(),i=items.indexOf(it);
    if(i>=0){var rc=tileRect(gridSpec(boardKey()),i,scr.x);return [rc.x+rc.w/2,rc.y+rc.h/2]}
  }
  var p=posOf(it);return sp(p[0],p[1]);
}

function want(k){var c=CH[k];if(!c||c._w)return;c._w=1;c.items.forEach(loadImg)}
function loadImg(it){
  if(!it||it._im)return;var src=(it.media&&(it.media.thumb||it.media.big))||'';if(!src)return;
  var im=new Image();im.decoding='async';
  im.onload=function(){it.ld=1};
  im.onerror=function(){if(!it._x){it._x=1;im.crossOrigin=null;im.src=src}};
  try{im.crossOrigin='anonymous'}catch(e){}
  im.src=src;it._im=im;
}
function washImgs(k){
  var c=CH[k];if(k==='about')return [];
  var prefer={film:['one-with-the-devil','weird-kid','legends'],objects:['hand-carved-piece','joio'],sound:['waveform','to-go','lost-coffee'],photo:[]};
  var ids=prefer[k]||[];
  var list=[];
  ids.forEach(function(sl){var it=c.items.filter(function(i){return i.slug===sl})[0];if(it){loadImg(it);if(it._im)list.push(it._im)}});
  if(list.length<2)c.skyItems.slice(0,3).forEach(function(it){loadImg(it);if(it._im&&list.indexOf(it._im)<0)list.push(it._im)});
  return list.filter(function(im){return im.complete&&im.naturalWidth});
}

function frame(t){
  var dt=Math.min(.05,(t-(lastT||t))/1000);lastT=t;
  if(phase==='fly'&&!OP.on){flyU=clamp((t-flyT)/(1680*tk('fade')),0,1);if(flyU>=1){phase='land';landI=0;landT=t;showLand();setChrome();if(window.GJ_DEPTH&&GJ_DEPTH.hush)GJ_DEPTH.hush()}}
  if(phase==='land'&&!OP.on&&Q.get('land')!=='1'&&t-landT>3600)nextLand();
  if(OP.used)opLayers(dt);
  stepSprings(dt);depthStep(dt);if(playing)listen();
  if(CHIMES.length)chStep(dt);
  bStep(dt);
  if(window.GJ_DEPTH){
    try{
      GJ_DEPTH.tick(t);
      if(phase==='fly'&&typeof GJ_DEPTH.fly==='function')GJ_DEPTH.fly(flyU);
      var psc=GJ_DEPTH.viewScale(),pel=$('layer'),psnd=$('snd'),og=GJ_DEPTH.origin();
      var org=(og.x||W/2)+'px '+(og.y||H*0.46)+'px';
      if(pel){pel.style.transformOrigin=org;pel.style.transform=psc!==1?'scale('+psc.toFixed(3)+')':''}
      if(psnd){psnd.style.transformOrigin=org;psnd.style.transform=psc!==1?'scale('+psc.toFixed(3)+')':''}
    }catch(err){}
  }
  draw(t);
  drawGlitch(t);
  syncExtras();
  placeHint();
  if(window.GJ_DEPTH&&GJ_DEPTH.state().film>=3)GJ_DEPTH.paintField();
  if(window.GJ_INNER&&GJ_INNER.active())GJ_INNER.tick(t);
  requestAnimationFrame(frame);
}

/* Mark-first opening: when the sky is reached from the opening, the centre mark appears alone on the dark, holds, then the rest of the sky fades in over it. A touch skips the wait. */
var SKYIN={t0:0,on:0};
function skyIntro(){
  if(!SKYIN.t0)return null;
  var t=now()-SKYIN.t0,o=tk('open'),m=clamp(t/(450*o),0,1),k=clamp((t-1350*o)/(1300*tk('fade')),0,1);
  if(k>=1){skyIntroEnd();return null}
  return {m:m,s:k*k*(3-2*k)};
}
function skyIntroEnd(){
  SKYIN.t0=0;
  if(SKYIN.on){SKYIN.on=0;cv.style.opacity='';document.documentElement.classList.remove('skyin');document.documentElement.style.removeProperty('--skyin')}
}
function skyIntroPaint(SI){
  if(!SI){if(SKYIN.on)skyIntroEnd();return}
  SKYIN.on=1;
  cv.style.opacity=SI.s.toFixed(3);
  document.documentElement.classList.add('skyin');
  document.documentElement.style.setProperty('--skyin',SI.s.toFixed(3));
}
function farA(){var z=rest.s/Math.max(1e-4,FAR.s);return clamp(1-(z-1.15)/1.5,0,1)}
function draw(t){
  if(window.GJ_FACES)GJ_FACES.beginFrame();
  var sc=window.GJ_DEPTH?GJ_DEPTH.viewScale():1;
  var og=window.GJ_DEPTH?GJ_DEPTH.origin():{x:W/2,y:H*0.46};
  g.setTransform(DPR,0,0,DPR,0,0);
  if(sc!==1){g.translate(og.x,og.y);g.scale(sc,sc);g.translate(-og.x,-og.y)}
  g.clearRect(-W,-H,W*3,H*3);
  if(phase==='arrive'||phase==='fly'){drawMark(phase==='fly'?ease(flyU):0);drawGlow();paintFx();return}
  if(phase==='land'){drawGlow();paintFx();return}
  var fa=farA(),lk=look,SI=skyIntro();
  skyIntroPaint(SI);
  drawField(fa);
  /* spokes */
  if(fa>.05&&cur.lv===0){g.strokeStyle='rgba(170,200,235,'+(0.13*fa)+')';g.beginPath();
    ORDER.forEach(function(k){var a=sp(0,0),b=sp(CH[k].x,CH[k].y);g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1])});g.stroke()}
  ORDER.forEach(function(k){drawChapter(k,t,fa)});
  drawCluster(fa);
  drawThreads(fa);
  var cA=fa*(cur.lv===0?1:0);
  if(!SI)drawCentre(cA);
  if(fa>.25&&cur.lv===0)drawNames(fa);
  drawWindow();
  drawRelated();
  if(cur.lv===2&&cur.id&&byId[cur.id]&&byId[cur.id].kind==='player'&&!(window.GJ_DEPTH&&GJ_DEPTH.soundOn()))drawSound(t);
  if(sc!==1)g.setTransform(DPR,0,0,DPR,0,0);
  paintFx();
  if(SI&&cA>.04){
    var fxc=document.getElementById('fx');
    if(fxc){var fg2=fxc.getContext('2d'),gs=g;fg2.setTransform(DPR,0,0,DPR,0,0);g=fg2;try{drawCentre(cA*SI.m)}finally{g=gs}}
  }
  /* The opening pinch keeps its own marks off the sky. Other pinches still show the two fingers. */
  if(pinch&&PT&&!OP.hold){
    var ids=Object.keys(PT),dotA=OP.used?Math.max(0,1-OP.p):0.85;
    if(dotA>0.03){
      g.globalAlpha=dotA;g.fillStyle='#fff';
      ids.forEach(function(id){var p=PT[id];g.beginPath();g.arc(p.x,p.y,7,0,7);g.fill()});
      g.globalAlpha=1;
    }
  }
  drawGlow();
}
function paintFx(){
  var fx=document.getElementById('fx');
  if(!fx||!window.GJ_DEPTH)return;
  if(fx.width!==cv.width||fx.height!==cv.height){fx.width=cv.width;fx.height=cv.height}
  var fg=fx.getContext('2d');fg.setTransform(DPR,0,0,DPR,0,0);fg.clearRect(0,0,W,H);
  GJ_DEPTH.drawFx(fg,W,H);
}
var glow=null;
function noteTouch(x,y){
  var snd=$('snd');
  glow={x:x,y:y,t:now(),mint:(cur&&cur.k==='sound')||!!(snd&&!snd.hidden)};
}
function drawGlow(){
  if(!glow)return;
  var age=(now()-glow.t)/1100;
  if(age>=1){glow=null;return}
  var a=(1-age)*(1-age)*0.2;
  var col=glow.mint?'85,218,161':'228,221,210';
  g.save();
  g.setTransform(DPR,0,0,DPR,0,0);
  g.globalCompositeOperation='lighter';
  var rad=g.createRadialGradient(glow.x,glow.y,0,glow.x,glow.y,128);
  rad.addColorStop(0,'rgba('+col+','+a.toFixed(3)+')');
  rad.addColorStop(1,'rgba('+col+',0)');
  g.fillStyle=rad;
  g.beginPath();
  g.arc(glow.x,glow.y,128,0,6.3);
  g.fill();
  g.restore();
}

function drawChapter(k,t,fa){
  var c=CH[k],focus=(cur.lv===0||cur.k===k||cur.k==='progress')?1:.28;
  var bl=(bloomK===k)?bloom:0;
  var cp=sp(c.x,c.y),R=Math.max(c.bw,c.bh)*.6*rest.s;
  if(cp[0]<-R-240||cp[0]>W+R+240||cp[1]<-R-240||cp[1]>H+R+240)return;
  var imgs=washImgs(k),showWash=fa>.2&&bl<.35&&imgs.length;
  if(showWash){
    var i=Math.floor(t/4200)%imgs.length,u=(t%4200)/4200,im=imgs[i],im2=imgs[(i+1)%imgs.length];
    var rad=Math.max(64,Math.max(c.bw,c.bh)*.48*rest.s);
    g.save();g.beginPath();g.ellipse(cp[0],cp[1],rad,rad*.78,0,0,7);g.clip();
    g.globalAlpha=.2*(1-u)*focus;cover(im,cp[0]-rad,cp[1]-rad*.78,rad*2,rad*1.56);
    g.globalAlpha=.2*u*focus;cover(im2,cp[0]-rad,cp[1]-rad*.78,rad*2,rad*1.56);
    g.restore();
    var vg=g.createRadialGradient(cp[0],cp[1],rad*.2,cp[0],cp[1],rad);
    vg.addColorStop(0,'rgba(4,7,11,0)');vg.addColorStop(1,'rgba(4,7,11,.55)');
    g.fillStyle=vg;g.beginPath();g.ellipse(cp[0],cp[1],rad,rad*.78,0,0,7);g.fill();
  }
  var nr=Math.max(c.bw,c.bh)*.55*rest.s;
  if(nr>8){var gr=g.createRadialGradient(cp[0],cp[1],0,cp[0],cp[1],nr);
    gr.addColorStop(0,'rgba('+c.tint+','+(0.06*focus)+')');gr.addColorStop(1,'rgba('+c.tint+',0)');
    g.fillStyle=gr;g.fillRect(cp[0]-nr,cp[1]-nr,nr*2,nr*2)}
  var la=((isMid()&&cur.k===k)?.3:focus*(1-bl)*.55*Math.max(fa,.35))*tk('lineA');
  if(la>1)la=1;
  if(la>.02){g.strokeStyle='rgba('+c.tint+','+la+')';g.lineWidth=tk('lineW');g.beginPath();
    c.sky.forEach(function(L){var pa=nodePos(L[0]),pb=nodePos(L[1]),a=sp(pa[0],pa[1]),b=sp(pb[0],pb[1]);g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1])});g.stroke()}
  if(k==='sound'&&bl<.85)c.dec.forEach(function(d){var q=sp(d.x,d.y);star(q,(d.b||.4),c,false,focus*(1-bl),t)});
  var list=(k==='objects')?c.items:c.skyItems;
  if(cur.k==='progress'&&k==='objects')list=c.skyItems;
  var midK=isMid()&&cur.k===k;
  list.forEach(function(it){it._mr=null;it._ml=null;if(it.in_progress&&!(k==='objects'&&bl>.02&&!midK))return;drawItem(it,bl,focus)});
  if(midK&&bl>.62)midLabels(list,bl);
  if(midK&&k==='film')drawCardsStar(bl,focus);
}
function isMid(){return cur.lv===1&&!onBoard()}

/* fable-m4: the cards star (ported to the morning sky). Film only, never the home sky. Placed in screen space
 each frame in a free spot above, beside or below the Film strips; tap it (or pinch in on it) to open #film/cards. */
function cardsBoardOn(){return !!(cur.cards||(window.GJ_OPEN&&GJ_OPEN.board))}
function isCardsHit(x,y){
  if(cur.k!=='film')return false;
  var h=typeof x==='number'?midHit(x,y):null;
  return !!(h&&h.id==='film/cards')||(sel&&sel.id==='film/cards');
}
function openFromCard(c){
  if(!c||!c.id)return;
  var it=byId[c.id];if(!it)return;
  go({lv:2,k:it.chapter,id:it.id});
}
function syncCardsBoard(){
  if(!window.GJ_OPEN)return;
  if(cur.cards)GJ_OPEN.show({board:true,stay:true,pick:openFromCard});
  else if(GJ_OPEN.board)GJ_OPEN.hide();
}
function cardsStarObj(){
  if(!cardsStar){
    cardsStar={id:'film/cards',chapter:'film',k:'film',slug:'cards',title:'cards',role:'',kind:'cards',
      media:{},credits:[],related:[],also:[],in_progress:false,isNew:false,sx:0,sy:0,_mr:null,_ml:null};
  }
  return cardsStar;
}
function drawCardsStar(bl,focus){
  var cs=cardsStarObj(),c=CH.film;if(!c||focus<.05){cs._mr=cs._ml=null;return}
  var T=70,B=H-56,Lm=16,Rm=W-16,boxes=[],x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
  c.skyItems.forEach(function(it){
    if(it.in_progress)return;
    var r=it._mr,q;
    if(!r){q=sp(posOf(it)[0],posOf(it)[1]);r=[q[0]-12,q[1]-12,24,24]}
    boxes.push(r);if(it._ml)boxes.push(it._ml);
    x0=Math.min(x0,r[0]);x1=Math.max(x1,r[0]+r[2]);y0=Math.min(y0,r[1]);y1=Math.max(y1,r[1]+r[3]);
  });
  if(x0>x1){x0=W/2-20;x1=W/2+20;y0=H/2-20;y1=H/2+20}
  var cx=(x0+x1)/2,cands=[[cx,y0-34],[cx,y1+40],[x0-34,(y0+y1)/2],[x1+34,(y0+y1)/2],[cx,T+20],[cx,B-20]];
  for(var yy=T+18;yy<=B-18;yy+=14)for(var xx=Lm+24;xx<=Rm-24;xx+=18)cands.push([xx,yy]);
  function free(p){
    var bx=[p[0]-22,p[1]-18,44,48];
    if(bx[0]<Lm||bx[0]+bx[2]>Rm||bx[1]<T||bx[1]+bx[3]>B)return false;
    for(var i=0;i<boxes.length;i++){var b=boxes[i];if(bx[0]<b[0]+b[2]+6&&b[0]<bx[0]+bx[2]+6&&bx[1]<b[1]+b[3]+6&&b[1]<bx[1]+bx[3]+6)return false}
    return true;
  }
  var pick=null;for(var i=0;i<cands.length;i++)if(free(cands[i])){pick=cands[i];break}
  if(!pick)pick=[cx,Math.max(T+18,y0-34)];
  var cm=cam();cs.sx=(pick[0]-W/2)/cm.s+cm.x;cs.sy=(pick[1]-H/2)/cm.s+cm.y;
  var q=sp(cs.sx,cs.sy),selOn=sel&&sel.id==='film/cards';
  star(q,1.25,c,false,focus);
  if(selOn){g.strokeStyle='rgba('+MINT+',.9)';g.lineWidth=1.2;g.beginPath();g.arc(q[0],q[1],14,0,7);g.stroke()}
  var r=18;cs._mr=[q[0]-r,q[1]-r,r*2,r*2];
  g.font='400 11px "Julius Sans One",Poppins,sans-serif';g.textAlign='left';g.textBaseline='top';
  var txt='cards',lw=g.measureText(txt).width,lx=clamp(q[0]-lw/2,8,W-8-lw),ly=q[1]+r+3;
  cs._ml=[lx,ly,lw,13];
  g.globalAlpha=focus;g.fillStyle=selOn?'rgb('+MINT+')':'#f7f4ee';
  g.shadowColor='rgba(4,7,11,.92)';g.shadowBlur=8;g.shadowOffsetY=1;
  g.fillText(txt,lx,ly);
  g.shadowBlur=0;g.shadowOffsetY=0;g.globalAlpha=1;g.textBaseline='alphabetic';
}
var MIDW={film:46,photo:34,objects:40,sound:0,about:58};
/* MID titles: one line each, kept inside the safe width, never on another star's thumbnail or title. */
function midLabels(list,bl){
  var boxes=[],placed=[];
  list.forEach(function(it){if(it._mr)boxes.push(it._mr)});
  function hits(r,own){
    for(var i=0;i<boxes.length;i++){var b=boxes[i];if(b===own)continue;if(r[0]<b[0]+b[2]+2&&b[0]<r[0]+r[2]+2&&r[1]<b[1]+b[3]+1&&b[1]<r[1]+r[3]+1)return true}
    for(i=0;i<placed.length;i++){b=placed[i];if(r[0]<b[0]+b[2]+4&&b[0]<r[0]+r[2]+4&&r[1]<b[1]+b[3]+1&&b[1]<r[1]+r[3]+1)return true}
    return false;
  }
  g.font='300 9.5px Poppins,sans-serif';g.textAlign='left';g.textBaseline='top';
  var seen={};
  list.forEach(function(it){if(it._mr&&it.title){var c0=cut(it.title,Math.max(it._mr[2]+16,64));seen[c0]=(seen[c0]||0)+1}});
  list.forEach(function(it){
    var r=it._mr;if(!r)return;
    var t=it.title||'';if(!t||/^photograph\s+\d+$/i.test(t)||t==='untitled')return;
    if(seen[cut(t,Math.max(r[2]+16,64))]>1&&t.indexOf(' · ')>0)t=t.slice(t.lastIndexOf(' · ')+3);
    var cx=r[0]+r[2]/2;
    if(cx<4||cx>W-4||r[1]+r[3]<64||r[1]>H-12)return;
    var txt=cut(t,Math.max(r[2]+16,64)),lw=g.measureText(txt).width;
    var lx=clamp(cx-lw/2,8,W-8-lw);
    var opts=[r[1]+r[3]+3,r[1]-14],j;
    for(j=0;j<opts.length;j++){
      var R=[lx,opts[j],lw,11];
      if(R[1]<64||R[1]+R[3]>H-6||hits(R,r))continue;
      placed.push(R);it._ml=R;
      g.globalAlpha=Math.min(1,(bl-.62)/.3);g.fillStyle=it.isNew?'rgb('+MINT+')':'#eef3f5';g.fillText(txt,lx,R[1]);
      break;
    }
  });
  g.globalAlpha=1;
}
function nodePos(n){if(n.id)return posOf(n);return [n.x,n.y]}
function star(q,b,c,mint,a,t){
  if(a<.02||q[0]<-20||q[0]>W+20||q[1]<-20||q[1]>H+20)return;
  var pulse=t?(1+.07*Math.sin(t/900+(q[0]+q[1])*.01)):1;
  var ss=tk('starS'),sg=tk('starG');
  var gs=(5+16*b)*pulse*(mint?1.3:1)*sg;g.globalAlpha=a*(.45+.5*b);
  g.drawImage(mint?GLOW.m:c.glow,q[0]-gs,q[1]-gs,gs*2,gs*2);
  g.globalAlpha=a;g.fillStyle=mint?'rgb('+MINT+')':'#fff';
  g.beginPath();g.arc(q[0],q[1],Math.max(1.1,(1+b*1.6)*ss),0,7);g.fill();g.globalAlpha=1;
}
function drawItem(it,bl,focus){
  var p=posOf(it),q=sp(p[0],p[1]);if(q[0]<-160||q[0]>W+160||q[1]<-160||q[1]>H+160)return;
  var c=CH[it.chapter],mint=it.isNew,selOn=sel&&sel.id===it.id;
  var e=ease(clamp(it.in_progress&&cur.k==='progress'?pbloom:bl,0,1));
  var inWin=onBoard()&&((it.in_progress&&cur.k==='progress')||(bloomK===it.chapter&&cur.k!=='progress'));
  if(it.chapter==='objects'&&!inWin&&e<0.5){
    loadImg(it);
    if(it._im&&it.ld){
      var rad=Math.max(11,18*focus);
      g.save();g.beginPath();g.arc(q[0],q[1],rad,0,7);g.clip();
      cover(it._im,q[0]-rad,q[1]-rad,rad*2,rad*2);g.restore();
    }
    return;
  }
  var midI=isMid()&&cur.k===it.chapter&&!inWin;
  if(it.chapter==='sound'&&!inWin&&(e<0.5||midI)){
    loadImg(it);
    var peaks=waveFor(it);
    if(midI){star(q,it.b||.5,c,mint,focus);it._mr=[q[0]-18,q[1]-10,36,32]}
    else if(it._im&&it.ld){
      var cr=14;
      g.save();g.beginPath();g.arc(q[0],q[1],cr,0,7);g.clip();
      cover(it._im,q[0]-cr,q[1]-cr,cr*2,cr*2);g.restore();
    }else star(q,it.b||.5,c,mint,focus*(selOn?1:0.9));
    if(peaks&&peaks.length){
      var n=Math.min(8,peaks.length),pi;
      for(pi=0;pi<n;pi++){
        var pk=peaks[Math.min(peaks.length-1,Math.floor(pi*peaks.length/n))];
        g.fillStyle='rgba(85,218,161,.92)';
        g.beginPath();g.arc(q[0]-14+pi*4,q[1]+18-pk*12,1.7,0,7);g.fill();
      }
    }
    return;
  }
  if(e<.98&&it.chapter!=='objects')star(q,it.b||.5,c,mint,focus*(1-e)*(selOn?1:0.9)*(inWin?.35:1));
  if(selOn&&e<.5&&!inWin){g.strokeStyle='rgba('+MINT+',.9)';g.lineWidth=1.2;g.beginPath();g.arc(q[0],q[1],11,0,7);g.stroke()}
  if(inWin)return;
  if(e>.02){
    var tw0=it.tw*rest.s,th0=it.th*rest.s;
    if(midI&&MIDW[it.chapter]){var ar=it.chapter==='film'?1/2.39:(it.tw?it.th/it.tw:1);tw0=MIDW[it.chapter];th0=tw0*ar;if(it.chapter==='about')th0=18}
    var w=lerp(6,tw0,e),h=lerp(6,th0,e),x=q[0]-w/2,y=q[1]-h/2;
    if(midI)it._mr=[x,y,w,h];
    g.globalAlpha=focus*Math.min(1,e*1.3);
    if(it._im&&it.ld)cover(it._im,x,y,w,h);
    else{g.fillStyle='rgba('+c.tint+',.16)';g.fillRect(x,y,w,h)}
    g.strokeStyle=selOn?'rgba('+MINT+',.95)':'rgba(220,230,240,.28)';g.lineWidth=selOn?1.6:1;
    g.strokeRect(x+.5,y+.5,w-1,h-1);g.globalAlpha=1;
    if(e>.62&&!midI){
      var cap=it.title||'',role=it.role||it.meta||'';
      g.font='300 11px Poppins,sans-serif';g.textAlign='left';g.textBaseline='top';
      g.fillStyle='#eef3f5';g.fillText(cut(cap,w-2),x,y+h+3);
      if(role){g.font='300 10px Poppins,sans-serif';g.fillStyle=it.role?'rgb('+MINT+')':'rgba(201,211,214,.8)';g.fillText(cut(role,w-2),x,y+h+16)}
    }
  }
}
/* Shortens to whole words only. A single word that is too wide shrinks the current font instead of breaking. */
function cut(s,max){var o=cut0(s,max);if(window.__capLog)__capLog.push([String(s==null?'':s),o]);return o}
function cut0(s,max){
  s=String(s==null?'':s);if(g.measureText(s).width<=max)return s;
  var ws=s.split(' ');
  while(ws.length>1){ws.pop();var t=ws.join(' ').replace(/[\s·—–,:&+-]+$/,'');if(t&&g.measureText(t+'…').width<=max)return t+'…'}
  var w=ws[0],f=g.font,m=f.match(/([\d.]+)px/),px=m?+m[1]:10;
  while(px>6.5&&g.measureText(w).width>max){px-=.5;g.font=f.replace(m[0],px+'px')}
  return w;
}
function cover(im,x,y,w,h,crop){
  var iw=im.naturalWidth,ih=im.naturalHeight;if(!iw||!ih)return;
  g.save();g.beginPath();g.rect(x,y,w,h);g.clip();
  if(crop){g.drawImage(im,crop[0]*iw,crop[1]*ih,crop[2]*iw,crop[3]*ih,x,y,w,h)}
  else{
    var s=Math.max(w/iw,h/ih),dw=iw*s,dh=ih*s,dx=x+(w-dw)/2,dy=y+(h-dh)/2;
    var f=window.GJ_FACES&&GJ_FACES.of(im.src);
    if(f){var d=GJ_FACES.coverDest(iw,ih,x,y,w,h,f.x,f.y);dx=d.dx;dy=d.dy;dw=d.dw;dh=d.dh}
    g.drawImage(im,dx,dy,dw,dh);
    if(f)GJ_FACES.record(im.src,x,y,dx,dy,dw,dh,f.x,f.y);
  }
  g.restore();
}
function drawCluster(fa){
  if(cur.k==='progress'&&pbloom>.85)return;
  if(cur.k==='objects'&&bloom>.5)return;
  if(!cluster.length)return;
  var on=!!(sel&&sel.prog),fade=(cur.k==='progress'?1-pbloom:1);
  var pts=cluster.map(function(it){return sp(it.cx,it.cy)});
  if(cur.lv===0&&fade>.2&&pts.length>1){
    g.strokeStyle='rgba(232,238,246,'+(0.55*fade)+')';g.lineWidth=1.4;g.beginPath();
    pts.forEach(function(p,i){if(i)g.lineTo(p[0],p[1]);else g.moveTo(p[0],p[1])});
    g.closePath();g.stroke();
  }
  cluster.forEach(function(it,i){
    if(cur.k==='objects'&&bloom>.15&&it.chapter==='objects')return;
    var q=pts[i];if(!q)return;
    star(q,1.15,CH[it.chapter]||CH.objects,false,(on?1:.95)*fade);
    if(sel&&sel.id===it.id){g.strokeStyle='rgba('+MINT+',.9)';g.beginPath();g.arc(q[0],q[1],14,0,7);g.stroke()}
  });
  if(cur.lv===0&&fade>.35&&pts.length){
    var cx=0,cy=0,i;
    for(i=0;i<pts.length;i++){cx+=pts[i][0];cy+=pts[i][1]}
    cx/=pts.length;cy/=pts.length;
    var o=sp(0,0),minX=pts[0][0],maxX=pts[0][0],minY=pts[0][1],maxY=pts[0][1],pi;
    for(pi=1;pi<pts.length;pi++){
      minX=Math.min(minX,pts[pi][0]);maxX=Math.max(maxX,pts[pi][0]);
      minY=Math.min(minY,pts[pi][1]);maxY=Math.max(maxY,pts[pi][1]);
    }
    var lx=cx,ly=maxY+14,align='center',base='top';
    var inPoem=lx>o[0]-118&&lx<o[0]+118&&ly>o[1]-36&&ly<o[1]+108;
    if(inPoem){
      if(cx>=o[0]){lx=maxX+10;align='left'}else{lx=minX-10;align='right'}
      ly=(minY+maxY)/2;base='middle';
    }
    g.globalAlpha=0.9*fade;g.font='300 11px Poppins,sans-serif';g.textAlign=align;g.textBaseline=base;
    g.fillStyle='#e4ecf4';g.fillText('in progress',lx,ly);g.globalAlpha=1;g.textAlign='left';
  }
}
function drawCentre(a){
  if(a<.04||(cur.lv===2&&cur.id&&byId[cur.id]&&byId[cur.id].kind==='player'))return;
  var o=sp(0,0),gf=clamp(26*Math.sqrt(rest.s/Math.max(.2,FAR.s)),22,48);
  g.globalAlpha=a*.9;g.drawImage(GLOW.c,o[0]-gf*2.2,o[1]-gf*2.2,gf*4.4,gf*4.4);
  g.font='700 '+gf+'px Syl,sans-serif';g.textAlign='center';g.textBaseline='middle';g.globalAlpha=a;
  g.fillStyle='rgba(10,189,240,.55)';g.fillText('ᑕᐣᓯ',o[0]-1.1,o[1]);
  g.fillStyle='rgba(254,1,1,.45)';g.fillText('ᑕᐣᓯ',o[0]+1.1,o[1]);
  g.fillStyle='#fff';g.fillText('ᑕᐣᓯ',o[0],o[1]);
  if(cur.lv===0){
    g.font='400 13px "Julius Sans One",sans-serif';g.textBaseline='top';
    g.fillStyle='rgba(10,189,240,.8)';g.fillText('gill james',o[0]-1.6,o[1]+gf*.62);
    g.fillStyle='rgba(254,1,1,.7)';g.fillText('gill james',o[0]+1.6,o[1]+gf*.62);
    g.fillStyle='rgba(244,247,251,.92)';g.fillText('gill james',o[0],o[1]+gf*.62);
    var lines=['I am an artist','All my relations,'];
    g.font='200 12.5px Poppins,sans-serif';g.fillStyle='rgba(238,243,245,.86)';
    lines.forEach(function(ln,i){g.fillText(ln,o[0],o[1]+gf*.62+18+i*16)});
    g.textBaseline='alphabetic';
  }
  g.globalAlpha=1;
}
function drawNames(fa){
  g.textAlign='center';g.textBaseline='alphabetic';
  ORDER.forEach(function(k){
    var c=CH[k],p=sp(c.x,c.y+c.ex.y1),y=p[1]+20;
    if(y<48||y>H-8)return;
    var on=sel&&sel.type==='ch'&&sel.k===k;
    g.globalAlpha=1;
    g.font='400 13px "Julius Sans One",Poppins,sans-serif';
    g.shadowColor='rgba(4,7,11,.92)';g.shadowBlur=8;g.shadowOffsetY=1;
    g.fillStyle=on?'rgb('+MINT+')':'#f7f4ee';
    g.letterSpacing='2.5px';
    g.fillText(k.toUpperCase(),p[0],y);
    g.letterSpacing='0px';g.shadowBlur=0;g.shadowOffsetY=0;
    g.globalAlpha=1;
  });
}
function boardKey(){return cur.k==='progress'?'progress':cur.k}
function boardItems(){
  var b=window.GJ_DEPTH&&GJ_DEPTH.board();
  if(b&&b.items)return b.items;
  if(cur.k==='progress')return progress;
  var c=CH[cur.k];return c?c.items:[];
}
function gridSpec(key){
  var b=window.GJ_DEPTH&&GJ_DEPTH.board();
  var items=(b&&b.items&&(key===b.k||key===boardKey()))?b.items:(key==='progress'?progress:(CH[key]?CH[key].items:[]));
  var n=items.length||1;
  var fine=!!(b&&b.fine);
  if(!fine&&CH[key])return boardSpec(key,items);
  var cols=n<=4?2:n<=9?3:(W<520?4:W<860?5:6);
  if(key==='about'&&n<=4)cols=1;
  var hero=!fine&&(key==='film'||key==='photo'||key==='objects');
  if(key==='film'&&!fine)cols=1;
  if(key==='sound'&&!fine)cols=1;
  if(hero)cols=1;
  var gap=hero?10:((key==='photo'||key==='objects')&&!fine?16:4),pad=hero?8:10,head=key==='about'?16:44;
  var room=boardRoom();
  var maxW=Math.min(hero?Math.min(W-28,760):Math.min(W-28,680),room.w);
  var tw=(maxW-pad*2-gap*(cols-1))/cols;
  var sq=key==='progress'||((key==='photo'||key==='objects')&&fine);
  var th=key==='about'?40:hero?Math.min(tw*1.12,Math.max(320,H*.62)):sq?tw:(key==='sound'&&!fine?96:tw*9/16);
  var cap=key==='about'?0:12;
  var pitch=th+cap+6,rows=Math.ceil(n/cols);
  var contentH=head+rows*pitch+6;
  var maxH=(b&&b.fine)?Math.min(H-92,H*.84):(hero?Math.min(H-78,H*.9):Math.min(H-118,H*.74));
  maxH=Math.min(maxH,room.bottom-room.top);
  var winH=Math.min(maxH,contentH);
  var y0=Math.min(Math.max(room.top,(H-winH)/2),room.bottom-winH);
  return {key:key,cols:cols,gap:gap,pad:pad,head:head,tw:tw,th:th,cap:cap,pitch:pitch,contentH:contentH,winH:winH,x0:Math.max(14,Math.min(W-14-maxW,room.x+(room.w-maxW)/2)),y0:y0,w:maxW,maxSc:Math.max(0,contentH-winH),n:n};
}
/* The chapter board: pro2's grid of thumbnails, titles and captions. Each medium keeps a small difference of its own. */
var BSPEC=null;
function boardSpec(key,items){
  var room=boardRoom(),n=items.length||1,sig=key+'|'+W+'|'+H+'|'+n+'|'+room.m+'|'+(document.fonts?document.fonts.status:'');
  if(BSPEC&&BSPEC.sig===sig)return BSPEC;
  var maxW=Math.min(W-28,680,room.w),pad=10,gap=8,head=44,AW=maxW+28;
  if(key==='film'||key==='objects'){pad=8;gap=6}
  if(key==='film')gap=14;
  var cols=key==='about'?(AW<520?1:2):key==='film'?(AW<520?2:3):(AW<520?3:AW<860?4:6);
  if(key==='photo')gap=14;
  var tw=(maxW-pad*2-gap*(cols-1))/cols;
  var cap=(key==='film'||key==='objects'||key==='sound')?26:0;
  var th=key==='about'?46:(key==='objects'||key==='sound')?tw:key==='film'?tw/2.39:tw*9/16;
  var rects=[],bottom=0,i;
  if(key==='photo'){
    var colH=[];for(i=0;i<cols;i++)colH.push(0);
    items.forEach(function(it){
      var m=it.media||{},ar=(m.w&&m.h)?m.h/m.w:1,h=tw*Math.max(.62,Math.min(1.5,ar)),c=0;
      for(i=1;i<cols;i++)if(colH[i]<colH[c]-1)c=i;
      rects.push({x:c*(tw+gap),y:colH[c],w:tw,h:h});colH[c]+=h+gap;
    });
    bottom=Math.max.apply(null,colH);
  }else if(key==='sound'){
    var segW=(maxW-pad*2)/3,rowS=128,nt=0;
    cap=0;
    items.forEach(function(it,j){
      if(it.kind==='track'){var r=Math.floor(nt/3),c=nt%3;rects.push({x:c*segW,y:r*rowS,w:segW,h:rowS});nt++;return}
      var y0s=Math.ceil(nt/3)*rowS+24,prev=rects[rects.length-1],segs=soundSegs(it),lw=0;
      g.font='300 10.5px Poppins,sans-serif';
      segs.forEach(function(sg){lw+=g.measureText(sg[0]).width});
      if(it.id==='sound/lost-coffee-apple-music'&&prev&&prev.text)rects.push({x:prev.x+prev.w,y:prev.y,w:lw,h:18,text:1});
      else rects.push({x:0,y:prev&&prev.text?prev.y+22:y0s,w:lw,h:18,text:1});
    });
    rects.forEach(function(r){bottom=Math.max(bottom,r.y+r.h)});
  }else if(key==='film'){
    /* Straight rows: every tile in a row shares one top, one title line and one role line under it, so a row is as tall as a tile plus its caption. */
    var chh=12+12+6,rowF=th+chh+FILM_ROWGAP;
    items.forEach(function(it,j){
      var r=Math.floor(j/cols),c=j%cols,cl=capLines(it,tw),y=r*rowF;
      rects.push({x:c*(tw+gap),y:y,w:tw,h:th,cl:cl,ch:chh});
      bottom=Math.max(bottom,y+th+chh);
    });
  }else{
    var taken={},rowH=th+cap+gap;
    function free(r,c,cs,rs){for(var a=0;a<rs;a++)for(var q=0;q<cs;q++)if(c+q>=cols||taken[(r+a)+':'+(c+q)])return false;return true}
    items.forEach(function(it,j){
      var cs=1,rs=1;
      if(key==='objects'&&cols>=3&&j%9===0){cs=2;rs=2}
      var r=0,c=0;
      for(;;r++){var ok=false;for(c=0;c<cols;c++)if(free(r,c,cs,rs)){ok=true;break}if(ok)break}
      for(var a=0;a<rs;a++)for(var q=0;q<cs;q++)taken[(r+a)+':'+(c+q)]=1;
      var w=cs*tw+(cs-1)*gap,h=rs*th+(rs-1)*(cap+gap);
      rects.push({x:c*(tw+gap),y:r*rowH,w:w,h:h});
      bottom=Math.max(bottom,r*rowH+h+cap);
    });
  }
  var contentH=head+bottom+10;
  var floor=room.bottom;
  var winH=Math.min(Math.min(floor-room.top,H*.86),contentH);
  var y0=Math.min(Math.max(room.top,(H-winH)/2),floor-winH);
  BSPEC={sig:sig,key:key,cols:cols,gap:gap,pad:pad,head:head,tw:tw,th:th,cap:cap,pitch:th+cap+gap,contentH:contentH,winH:winH,x0:Math.max(14,Math.min(W-14-maxW,room.x+(room.w-maxW)/2)),y0:y0,w:maxW,maxSc:Math.max(0,contentH-winH),n:n,rects:rects,board:1};
  return BSPEC;
}
function boardCount(key,items){
  var n=0;
  items.forEach(function(it){if(key==='sound'?it.kind==='track':true)n++});
  var noun={film:'works',photo:'photographs',objects:'pieces',sound:'songs'}[key];
  return noun&&n?n+' '+noun:'';
}
function realTitle(it){
  var t=it&&(it._cap||it.title)||'';
  if(!t||t==='untitled'||/^photograph\s+\d+$/i.test(t))return '';
  return t;
}
var FILM_ROWGAP=18;
function capLines(it,w){
  var t=realTitle(it);
  var m=it.role||it.meta||'';
  g.font='300 10.5px Poppins,sans-serif';
  return {t:t?[cut(t,w-2)]:[],m:m};
}
function tileRect(spec,i,scroll){
  if(spec.rects){var t=spec.rects[i]||{x:0,y:0,w:0,h:0};return {x:spec.x0+spec.pad+t.x,y:spec.y0+spec.head+t.y-scroll,w:t.w,h:t.h}}
  var r=Math.floor(i/spec.cols),q=i%spec.cols;
  return {x:spec.x0+spec.pad+q*(spec.tw+spec.gap),y:spec.y0+spec.head+r*spec.pitch-scroll,w:spec.tw,h:spec.th};
}
var WAVES={"togo":[0.413,0.602,0.426,0.446,0.753,0.682,0.753,0.928,0.841,1,0.92,0.898,0.997,0.89,0.929,0.994,0.908,0.843],"gone":[0.744,0.749,0.896,0.879,0.875,0.874,0.877,0.871,0.887,0.89,0.896,0.918,0.94,0.922,0.987,0.968,1,0.687],"noproblem":[1,0.948,0.907,0.763,0.762,0.693,0.546,0.186,0.324,0.321,0.253,0.329,0.419,0.317,0.144,0.169,0.176,0.142],"lostintime":[0.496,0.651,1,0.724,0.496,0.663,0.961,0.756,0.443,0.649,0.967,0.749,0.667,0.579,0.955,0.564,0.646,0.598],"equals":[0.407,0.665,0.823,1,0.282,0.563,0.862,0.399,0.61,0.573,0.875,0.727,0.911,0.714,0.858,0.526,0.575,0.813],"ii":[0.697,0.897,0.689,0.92,0.804,0.749,0.904,0.698,0.669,0.658,0.924,1,0.7,0.909,0.731,0.926,0.839,0.736],"player":[0.602,1,0.908,0.749,0.89,1,0.948,0.321,0.176,0.651,0.649,0.646,0.665,0.573,0.575,0.897,0.658,0.839]};
var SONG_DUR={
  togo:80.04,gone:80.04,noproblem:80.04,lostintime:90.048,equals:90.048,ii:69.744,
  'sound/to-go':80.04,'sound/mothers-moniker':80.04,'sound/lost-coffee':90.048,
  'sound/lost-coffee-apple-music':80.04
};
function songDur(it){
  if(!it)return 0;
  if(it.track&&SONG_DUR[it.track.k])return SONG_DUR[it.track.k];
  return SONG_DUR[it.id]||0;
}
function wavePts(it,x,y,w,h){
  var pk=waveFor(it)||[],n=pk.length,out=[],k;
  for(k=0;k<n;k++)out.push([x+8+(k+.5)*(w-16)/n,y+h*.9-pk[k]*h*.42]);
  return out;
}
function wrap2(t,max){
  g.font='300 10.5px Poppins,sans-serif';
  if(g.measureText(t).width<=max)return [t];
  var ws=t.split(' '),a='',k;
  for(k=0;k<ws.length;k++){var tryA=a?a+' '+ws[k]:ws[k];if(g.measureText(tryA).width>max&&a)break;a=tryA}
  return [a,cut(ws.slice(k).join(' '),max)];
}
/* The minimap box; boards keep clear of it: above it on a tall screen, beside it on a wide one. */
var MAPBOX=null;
function mapBox(){
  var tm=Date.now();
  if(MAPBOX&&MAPBOX.h===H&&MAPBOX.w===W&&tm-MAPBOX.at<400)return MAPBOX;
  var bt=$('mmap'),r=bt&&!bt.hidden?bt.getBoundingClientRect():null;
  if(r&&r.height){MAPBOX={w:W,h:H,l:Math.round(r.left),t:Math.round(r.top),at:tm};return MAPBOX}
  return {w:W,h:H,l:W-84,t:H-124,tmp:1};
}
function mapTop(){return mapBox().t}
function boardRoom(){
  var m=mapBox(),top=62,cr=$('wcrumb');
  if(cr&&!cr.hidden){var cb=cr.getBoundingClientRect();if(cb.height)top=Math.max(top,Math.round(cb.bottom)+2)}
  var rail=$('wrail'),rb=rail&&!rail.hidden?36:0;
  /* Photo prints are tall and the right column runs into the map's corner. Stop the
 grid above the map and left of it, with a clear band, so a print never sits under it. */
  if(boardKey()==='photo'){
    var gap=36,right=m.l-30;
    if(right>=220&&m.t-gap-top>=H*.5)return {x:0,w:right,top:top,bottom:m.t-gap,m:m.l+':'+m.t+':'+top+':p'};
  }
  if(m.t-8-top>=H*.55)return {x:0,w:W,top:top,bottom:m.t-8,m:m.l+':'+m.t+':'+top};
  return {x:14,w:Math.max(200,m.l-22),top:top,bottom:H-8-rb,m:m.l+':'+m.t+':'+top};
}
function roundRect(g,x,y,w,h,r){
  g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);
}
function waveFor(it){
  var key=it.track&&it.track.k;
  if(!key){
    if(it.id==='sound/to-go')key='togo';
    else if(it.id==='sound/mothers-moniker')key='gone';
    else if(it.id==='sound/lost-coffee')key='lostintime';
    else if(it.id==='sound/lost-coffee-apple-music')key='noproblem';
    else if(it.id==='sound/waveform'||it.kind==='player')key='player';
  }
  var p=key&&WAVES[key];
  return p&&p.length?p:null;
}
function drawWindow(){
  if(window.GJ_DEPTH&&GJ_DEPTH.soundOn())return;
  if(isBio())return;
  var b=cur.k==='progress'?pbloom:bloom;
  if(cur.lv!==1||!onBoard()||b<.02||!boardKey()||(cur.k!=='progress'&&!CH[cur.k]))return;
  var spec=gridSpec(boardKey()),items=boardItems();
  var db=window.GJ_DEPTH&&GJ_DEPTH.board();
  var title=db&&db.title?db.title:(cur.k==='progress'?'IN PROGRESS':String(cur.k).toUpperCase());
  var air=spec.key==='film'||spec.key==='photo'||spec.key==='objects'||spec.key==='sound';
  g.globalAlpha=Math.min(1,b*1.2)*(air?.96:.9);
  if(spec.board){g.shadowColor='rgba(120,160,220,.22)';g.shadowBlur=22}
  g.fillStyle=air?'rgba(4,7,11,.74)':'#080c16';g.fillRect(spec.x0,spec.y0,spec.w,spec.winH);
  g.shadowBlur=0;g.shadowColor='transparent';
  if(!air){g.strokeStyle='rgba(207,216,230,.32)';g.lineWidth=1;g.strokeRect(spec.x0+.5,spec.y0+.5,spec.w-1,spec.winH-1)}
  g.globalAlpha=b;g.textAlign='center';g.textBaseline='middle';
  g.font='400 15px "Julius Sans One",sans-serif';g.fillStyle='#e4ebf5';g.letterSpacing='6px';
  if(title.length>16)g.letterSpacing='1px';
  g.fillText(cut(title,spec.w-24),spec.x0+spec.w/2,spec.y0+22);
  g.letterSpacing='0px';
  var sl=sel&&sel.id&&byId[sel.id];
  var name=sl?realTitle(sl):'';
  if(sl&&(name||sl.role)&&b>.55){
    var line=name+(sl.role?(name?' — ':'')+sl.role:'');
    g.font='300 11px Poppins,sans-serif';g.fillStyle=sl.role?'rgb('+MINT+')':'rgba(233,239,248,.8)';
    g.fillText(cut(line,spec.w-28),spec.x0+spec.w/2,spec.y0+40);
  }else if(spec.board&&spec.key!=='about'&&b>.55){
    var cn=(db&&db.fine)?0:boardCount(spec.key,items);
    if(cn){g.font='300 10px Poppins,sans-serif';g.fillStyle='rgba(228,235,245,.55)';g.fillText(cn,spec.x0+spec.w/2,spec.y0+33)}
  }
  g.save();
  g.beginPath();g.rect(spec.x0+1,spec.y0+(spec.head-6),spec.w-2,spec.winH-(spec.head-6));g.clip();
  if(spec.board&&spec.key==='film'&&items.length>1){
    /* Straight rows: a short thread across the gutter joins each tile to its partner, clear of the titles. */
    g.globalAlpha=.2*b;g.strokeStyle='rgba(207,216,230,1)';g.lineWidth=1;g.beginPath();
    for(var fi=0;fi<items.length;fi++){
      var fr=tileRect(spec,fi,scr.x),fcy=fr.y+fr.h/2;
      if(fi%spec.cols<spec.cols-1&&fi+1<items.length){g.moveTo(fr.x+fr.w,fcy);g.lineTo(fr.x+fr.w+spec.gap,fcy)}
    }
    g.stroke();
  }else if(spec.board&&spec.key==='objects'&&items.length>1){
    g.globalAlpha=.2*b;g.strokeStyle='rgba(207,216,230,1)';g.lineWidth=1;g.beginPath();
    for(var ti=0;ti<items.length;ti++){var tr=tileRect(spec,ti,scr.x),cx0=tr.x+tr.w/2,cy0=tr.y+tr.h/2;if(ti)g.lineTo(cx0,cy0);else g.moveTo(cx0,cy0)}
    g.stroke();
  }
  items.forEach(function(it,i){
    var rc=tileRect(spec,i,scr.x);
    var home=(it._cluster||it.in_progress)?[it.cx,it.cy]:[it.sx,it.sy];
    var hx=home[0]==null?0:home[0],hy=home[1]==null?0:home[1];
    var sp0=sp(hx,hy);
    var w=lerp(4,rc.w,b),h=lerp(4,rc.h,b);
    var x=lerp(sp0[0],rc.x+rc.w/2,b)-w/2,y=lerp(sp0[1],rc.y+rc.h/2,b)-h/2;
    if(spec.key==='objects'&&spec.board)y+=(i%3)*3;
    if(y>spec.y0+spec.winH||y+h<spec.y0)return;
    g.globalAlpha=Math.min(1,b*1.4);
    if(spec.key==='photo'&&!(db&&db.fine)&&it._im&&it.ld){
      g.save();g.translate(x+w/2,y+h/2);g.rotate(((i%5)-2)*0.025);
      g.fillStyle='#e4ddd2';g.fillRect(-w/2,-h/2,w,h);
      cover(it._im,-w/2+3,-h/2+3,w-6,h-6,it._crop);g.restore();
    }else if(spec.key==='objects'&&!(db&&db.fine)){
      loadImg(it);
      if(it._im&&it.ld)cover(it._im,x,y,w,h,it._crop);
      else if(!(it.media&&(it.media.thumb||it.media.big))){
        g.fillStyle='rgba(8,14,22,.72)';g.fillRect(x,y,w,h);
        g.font='300 11px Poppins,sans-serif';g.textAlign='center';g.textBaseline='middle';
        g.fillStyle='rgba(228,236,244,.72)';g.fillText('no picture of this piece',x+w/2,y+h/2);
      }
    }else if(spec.key==='sound'&&!(db&&db.fine)&&it.kind==='track'){
      var pts=wavePts(it,x,y,w,h),lit=sel&&sel.id===it.id,pi,top=0,bs=BST[it.id];
      if(bs&&(bs.th||bs.fl>.01))pts.forEach(function(p){p[0]+=bs.th*(p[1]-(y+4))});
      g.strokeStyle='rgba(85,218,161,.32)';g.lineWidth=1;g.beginPath();
      pts.forEach(function(p,n){if(n)g.lineTo(p[0],p[1]);else g.moveTo(p[0],p[1])});
      var nx=(items[i+1]&&items[i+1].kind==='track'&&i%3!==2)?i+1:-1;
      if(nx>0){var rn=tileRect(spec,nx,scr.x),pn=wavePts(items[nx],rn.x,rn.y,rn.w,rn.h)[0];if(pn)g.lineTo(pn[0],pn[1])}
      g.stroke();
      for(pi=0;pi<pts.length;pi++)if(pts[pi][1]<pts[top][1])top=pi;
      pts.forEach(function(p,n){
        var pk=n===top;
        if(pk){var fk=bs?bs.fl:0,gz=18+9*fk;g.globalAlpha=Math.min(1,.5+.3*fk);g.drawImage(GLOW.m,p[0]-gz/2,p[1]-gz/2,gz,gz);g.globalAlpha=Math.min(1,b*1.4)}
        g.fillStyle=lit||pk?'#e7f6c8':'rgba(85,218,161,.92)';
        g.beginPath();g.arc(p[0],p[1],(pk?3:2.1)*(1+.5*(bs&&pk?bs.fl:0)),0,7);g.fill();
      });
      var pkp=pts[top];
      if(pkp){
        g.strokeStyle='rgba(231,246,200,.35)';g.beginPath();g.moveTo(pkp[0],pkp[1]-5);g.lineTo(pkp[0],y+40);g.stroke();
        var lines=wrap2(it.title||'',w-10),dur=songDur(it),ln=0;
        g.font='300 10.5px Poppins,sans-serif';g.textBaseline='top';
        var lw0=Math.max.apply(null,lines.map(function(L){return g.measureText(L).width}));
        var lx=clamp(pkp[0]-lw0/2,x+4,x+w-4-lw0);
        g.textAlign='left';g.fillStyle=lit?'rgb('+MINT+')':'#e4ddd2';
        lines.forEach(function(L){g.fillText(L,lx,y+4+ln*12);ln++});
        var sub=(dur?mmss(dur):'')+(it.track&&it.track.artist&&it.track.artist!=='Lost Coffee'?' · '+it.track.artist:'');
        if(sub){g.font='300 10px Poppins,sans-serif';g.fillStyle='rgba(228,221,210,.78)';g.fillText(cut(sub,w-8),lx,y+4+ln*12+1)}
      }
      if(i===spec.n-1||!(items[i+1]&&items[i+1].kind==='track')){
        g.font='300 9px Poppins,sans-serif';g.textAlign='left';g.textBaseline='top';g.fillStyle='rgba(228,221,210,.45)';
        g.fillText('cover art: gap',spec.x0+spec.pad,y+h+6);
      }
    }else if(spec.key==='sound'&&!(db&&db.fine)){
      g.textAlign='left';g.textBaseline='middle';g.font='300 10.5px Poppins,sans-serif';
      var tx=x,on=sel&&sel.id===it.id;
      soundSegs(it).forEach(function(sg){
        g.fillStyle=sg[1]?(on?'rgb('+MINT+')':'#e4ddd2'):'rgba(228,221,210,.62)';
        g.fillText(sg[0],tx,y+h/2);tx+=g.measureText(sg[0]).width;
      });
    }else if(spec.key==='about'&&spec.board){
      g.fillStyle='rgba(12,18,28,.9)';g.fillRect(x,y,w,h);
      g.textAlign='left';g.textBaseline='middle';
      g.font='400 13px "Julius Sans One",sans-serif';g.fillStyle=sel&&sel.id===it.id?'rgb('+MINT+')':'#e4ddd2';
      g.fillText(cut(it.title,w-24),x+12,y+h*.38);
      g.font='300 10px Poppins,sans-serif';g.fillStyle='rgba(228,221,210,.62)';
      g.fillText(cut(it.meta||'',w-24),x+12,y+h*.7);
    }else if(spec.board&&(loadImg(it),it._im&&it.ld))cover(it._im,x,y,w,h,it._crop);
    else if(it._im&&it.ld)cover(it._im,x,y,w,h,it._crop);
    else if(it._text||it.kind==='bio'||it.kind==='poem'||it.kind==='contact'||it.kind==='link'||it.kind==='track'){
      g.fillStyle='rgba(12,18,28,.9)';g.fillRect(x,y,w,h);
      g.font='300 12px Poppins,sans-serif';g.fillStyle='#e8eef5';g.textAlign='center';g.textBaseline='middle';
      g.fillText(cut(it._text||it.title,w-8),x+w/2,y+h/2);
    }else{var tint=CH[it.chapter]?CH[it.chapter].tint:'160,176,196';g.fillStyle='rgba('+tint+',.18)';g.fillRect(x,y,w,h);
      if(!it._im){g.font='300 11px Poppins,sans-serif';g.fillStyle='rgba(233,239,248,.82)';g.textAlign='center';g.textBaseline='middle';g.fillText(cut(it.title,w-12),x+w/2,y+h/2)}}
    if(sel&&sel.id===it.id&&!(spec.key==='sound'&&it.kind!=='track')){g.strokeStyle='rgba('+MINT+',.95)';g.lineWidth=1.5;g.strokeRect(x-1,y-1,w+2,h+2);g.lineWidth=1}
    var capText=it._cap||it.title;
    if(/^photograph\s+\d+$/i.test(capText||'')||capText==='untitled')capText='';
    var rr=spec.rects&&spec.rects[i];
    if(b>.72&&spec.board&&spec.key==='film'&&rr&&rr.cl){
      g.globalAlpha=b;g.textAlign='left';g.textBaseline='top';
      g.font='300 10.5px Poppins,sans-serif';g.fillStyle='#e4ddd2';
      rr.cl.t.forEach(function(L,li){g.fillText(L,x,y+h+3+li*12)});
      if(rr.cl.m){
        g.font='300 9px Poppins,sans-serif';
        g.fillStyle=it.role?'rgba('+MINT+',.85)':'rgba(228,221,210,.6)';
        g.fillText(cut(rr.cl.m,w),x,y+h+3+13);
      }
    }else if(b>.72&&spec.board&&spec.cap>=20&&capText){
      g.globalAlpha=b;g.textAlign='left';g.textBaseline='top';
      g.font='300 10.5px Poppins,sans-serif';g.fillStyle='#e4ddd2';g.fillText(cut(capText,w),x,y+h+3);
      var ml=spec.key==='sound'?(songDur(it)?mmss(songDur(it)):(it.meta||'')):(it.role||it.meta||'');
      if(ml){
        var len=spec.key==='sound'&&/^\d+:\d\d$/.test(ml);
        g.font=len?'300 10.5px Poppins,sans-serif':'300 9px Poppins,sans-serif';
        g.fillStyle=it.role?'rgba('+MINT+',.85)':(len?'rgba(228,221,210,.85)':'rgba(228,221,210,.6)');
        g.fillText(len?ml:cut(ml,w),x,y+h+15);
      }
    }else if(b>.72&&spec.cap&&capText&&it.kind!=='track'&&spec.key!=='sound'){
      g.globalAlpha=b;g.font='300 9px Poppins,sans-serif';g.textAlign='left';g.textBaseline='top';
      g.fillStyle='rgba(233,239,248,.78)';g.fillText(cut(capText,w),x,y+h+1);
    }
  });
  g.restore();g.globalAlpha=1;g.textAlign='left';
}
function anchor(it){
  if(it._cluster)return sp(it.cx,it.cy);
  return sp(it.sx,it.sy);
}
function drawThreads(fa){
  if(cur.lv!==0||fa<.08)return;
  var pairs=[['film/legends','photo/photograph-23'],['objects/latte-in-a-joio-co-cup','sound/to-go'],['objects/carved-spoon','photo/photograph-12']];
  g.setLineDash([1,7]);g.lineWidth=1;
  pairs.forEach(function(p){
    var a=byId[p[0]],b=byId[p[1]];if(!a||!b)return;
    var A=anchor(a),B=anchor(b);
    g.strokeStyle='rgba(214,226,236,'+(0.45*fa)+')';
    g.beginPath();g.moveTo(A[0],A[1]);g.lineTo(B[0],B[1]);g.stroke();
  });
  g.setLineDash([]);
}
function drawRelated(){
  if(cur.lv!==2||!cur.id||!byId[cur.id])return;
  var it=byId[cur.id],rels=it.related||[];if(!rels.length)return;
  var a=screenOf(it);
  g.setLineDash([2,7]);g.lineWidth=1;
  rels.forEach(function(id){
    var o=byId[id];if(!o)return;
    var b=screenOf(o);
    g.strokeStyle='rgba('+MINT+',.55)';g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();
  });
  g.setLineDash([]);
}

/* ---------- mark ---------- */
function markPair(){
  var nodes=[];
  ORDER.forEach(function(k){CH[k].node.forEach(function(n){if(n)nodes.push(n)})});
  var N=nodes.length,pts=[],segs=[],tot=0;
  STROKES.forEach(function(s){s.forEach(function(q,j){pts.push(q);if(j){var a=s[j-1],l=Math.hypot(q[0]-a[0],q[1]-a[1]);segs.push({a:a,b:q,l:l});tot+=l}})});
  var extra=Math.max(0,N-pts.length),left=extra,P=pts.slice();
  segs.forEach(function(sg,i){var n=i===segs.length-1?left:Math.round(extra*sg.l/tot);n=Math.min(n,left);left-=n;
    for(var j=1;j<=n;j++){var f=j/(n+1);P.push([sg.a[0]+(sg.b[0]-sg.a[0])*f,sg.a[1]+(sg.b[1]-sg.a[1])*f])}});
  markPts=P.slice(0,N);
  markTo=nodes.slice(0,N);
}
/* The mark sits in the top third in portrait (poem below it) and in the left column in landscape (poem in the right column). */
var MG={sc:1,ox:0,oy:0};
function markLayout(){
  var de=document.documentElement;
  if(PORT){
    var pad=Math.max(24,W*.06),sc=Math.min(W*.84/428,(W-2*pad)/432,H*.17/210),top=H*.135;
    MG={sc:sc,ox:Math.max(pad+214*sc,Math.min(W-pad-215*sc,W*.52)),oy:top+105*sc};
    de.style.setProperty('--ptop',Math.round(MG.oy+105*sc+H*.025)+'px');
  }else{
    MG={sc:Math.min(Math.min(W,H)*.46/250,W*.4/428),ox:W*.27,oy:H*.47};
    de.style.removeProperty('--ptop');
  }
  de.classList.toggle('port',PORT);
}
/* Arrival order: water and moon fade in (1.0 s / 1.2 s), then the mark draws and dims to 35%, then the poem block and the moon path settle, then the signature.
 The clock starts when both opacity transitions end (transitionend, with their longest known duration as a fallback). */
var MP={t0:0},MS=null,ARR={on:0,done:0,wd:0,md:0,tm:0,hook:0};
function markProg(){
  if(MP.t0<0)return {d:1,a:.35};
  if(!MP.t0)return {d:0,a:1};
  var draw=1100*tk('open'),dim=600*tk('open');
  var t=now()-MP.t0,d=clamp(t/draw,0,1);
  return {d:1-Math.pow(1-d,2),a:1-.65*clamp((t-draw)/dim,0,1)};
}
function armArrival(){
  if(ARR.on)return;
  ARR.on=1;
  var po=$('poem'),pa=$('path');
  if(!ARR.hook){
    ARR.hook=1;
    [['water','wd'],['moon','md']].forEach(function(p){
      var el=$(p[0]);
      el.addEventListener('transitionend',function(e){if(e.target===el&&e.propertyName==='opacity'&&ARR.on){ARR[p[1]]=1;arrBegin()}});
    });
  }
  if(ARR.done){MP.t0=-1;po.classList.add('seq','again');pa.classList.add('seq','again');$('dive').classList.add('show');return}
  ARR.wd=ARR.md=0;MP.t0=0;
  clearTimeout(ARR.tm);ARR.tm=setTimeout(function(){ARR.wd=ARR.md=1;arrBegin()},1250*tk('delay'));
}
function arrBegin(){
  if(!ARR.on||ARR.done||!(ARR.wd&&ARR.md))return;
  ARR.done=1;clearTimeout(ARR.tm);
  MP.t0=now();
  $('poem').classList.add('seq');$('path').classList.add('seq');$('dive').classList.add('show');
}
function disarmArrival(){
  if(!ARR.on)return;
  ARR.on=0;clearTimeout(ARR.tm);
  ['poem','path'].forEach(function(id){$(id).classList.remove('seq','again')});$('dive').classList.remove('show');
}
function markScreen(p){return [MG.ox+p[0]*MG.sc,MG.oy+p[1]*MG.sc]}
function markArc(){
  var lens=[],tot=0;
  STROKES.forEach(function(st){var c=[0];for(var j=1;j<st.length;j++)c.push(c[j-1]+Math.hypot(st[j][0]-st[j-1][0],st[j][1]-st[j-1][1]));lens.push(c);tot+=c[c.length-1]});
  var s=markPts.map(function(p){
    var best=1e9,at=0,off=0;
    STROKES.forEach(function(st,i){
      for(var j=1;j<st.length;j++){
        var ax=st[j-1][0],ay=st[j-1][1],bx=st[j][0],by=st[j][1],dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy||1,
            t=clamp(((p[0]-ax)*dx+(p[1]-ay)*dy)/l2,0,1),d=Math.hypot(p[0]-(ax+dx*t),p[1]-(ay+dy*t));
        if(d<best){best=d;at=off+lens[i][j-1]+t*(lens[i][j]-lens[i][j-1])}
      }
      off+=lens[i][lens[i].length-1];
    });
    return at/tot;
  });
  return {lens:lens,tot:tot,s:s};
}
function drawMark(u){
  var sc=MG.sc,ox=MG.ox,oy=MG.oy,P=u>0?{d:1,a:.35}:markProg(),al=lerp(P.a,1,u);
  if(u<=0&&P.d<=0)return;
  if(!MS||MS.n!==markPts.length){MS=markArc();MS.n=markPts.length}
  g.lineWidth=1;g.strokeStyle='rgba(200,220,240,'+(0.28*(1-u)*al)+')';g.beginPath();
  var left=P.d*MS.tot;
  STROKES.forEach(function(st,i){
    var c=MS.lens[i];
    for(var j=0;j<st.length;j++){
      var x=ox+st[j][0]*sc,y=oy+st[j][1]*sc;
      if(!j){g.moveTo(x,y);continue}
      var seg=c[j]-c[j-1];
      if(left>=seg){g.lineTo(x,y);left-=seg}
      else{if(left>0){var f=left/seg,px=ox+st[j-1][0]*sc,py=oy+st[j-1][1]*sc;g.lineTo(px+(x-px)*f,py+(y-py)*f)}left=0;break}
    }
    g.stroke();g.beginPath();
  });
  markPts.forEach(function(p,i){
    var gi=u>0?1:clamp((P.d-MS.s[i])/.05,0,1);
    if(gi<=0)return;
    var a=markScreen(p),b;
    if(u>0&&markTo[i]){var np=nodePos(markTo[i]);b=sp(np[0],np[1])}else b=a;
    /* The mark stays whole, then eases apart. The glow shrinks and fades with that same progress, so no orb is left at the end. */
    var tr=u<=0?0:u<.4?0:(u-.4)/.6;tr=tr*tr*(3-2*tr);
    var fade=u>0?1-u:1;
    var q=[lerp(a[0],b[0],tr),lerp(a[1],b[1],tr)];
    var gs=10*fade;
    if(gs>.4){g.globalAlpha=.8*gi*al*fade;g.drawImage(GLOW.w,q[0]-gs,q[1]-gs,gs*2,gs*2)}
    g.globalAlpha=gi*al*fade;g.fillStyle='#fff';g.beginPath();g.arc(q[0],q[1],1.8*Math.max(.15,fade),0,7);g.fill();
  });
  g.globalAlpha=1;
}
/* ---------- sound layer (waveform, chimes, stars that listen) ---------- */
var PENT=[523.25,587.33,659.25,783.99,880],songAt={};
function drawSound(t){
  var c=CH.sound;if(!songAt._b){data.tracks.forEach(function(tr){songAt[tr.star]=tr});songAt._b=1}
  ensureChimes();chimesDraw();
  c.node.forEach(function(n,i){if(!n)return;var tr=songAt[i];if(!tr)return;
    var p=nodePos(n),q=sp(p[0],p[1]);
    var on=song&&song.k===tr.k;star(q,on?.9:.55,c,on,1);
    if(playing&&on){var fr=L.rms,dm=.35+.65*GFL,pulse=1+fr*1.8;g.globalAlpha=(.35+fr*.5)*dm;g.strokeStyle='rgba('+MINT+','+(0.4+fr)+')';g.beginPath();g.arc(q[0],q[1],8+10*fr*pulse,0,7);g.stroke();g.globalAlpha=1}
    if(on){g.font='300 10px Poppins,sans-serif';g.textAlign='center';g.fillStyle='rgb('+MINT+')';g.fillText(tr.title,q[0],q[1]-14)}
  });
  if(playing){
    var o=sp(c.x,c.y),peaks=song.peaks||[],head=(au&&song.dur)?au.currentTime/song.dur:0;
    for(var i=0;i<18;i++){
      var pi=Math.floor(((head*peaks.length+i*3)%peaks.length+peaks.length)%peaks.length);
      var rad=18+(peaks[pi]||.2)*70+L.rms*26;
      g.strokeStyle='rgba(255,182,176,'+((0.08+0.25*(1-i/18))*(.35+.65*GFL))+')';g.beginPath();g.arc(o[0],o[1],rad+i*7,0,7);g.stroke();
    }
  }
  drawWF();
}
function ensureChimes(){
  if(CHIMES.length)return;
  [[2,3],[5,6],[7,8],[10,11],[13,14]].forEach(function(e,i){CHIMES.push({a:e[0],b:e[1],th:0,w:0,fl:0,f:PENT[i],v:i,lc:-1})});
}
function chGeo(){
  var c=CH.sound;
  CHIMES.forEach(function(ch){
    var A=c.node[ch.a],B=c.node[ch.b];if(!A||!B)return;
    var pa=nodePos(A),pb=nodePos(B),as=sp(pa[0],pa[1]),bs=sp(pb[0],pb[1]);
    ch.px=as[0];ch.py=as[1];ch.rx=bs[0];ch.ry=bs[1];ch.L=Math.max(28,Math.hypot(bs[0]-as[0],bs[1]-as[1]));
    ch.a0=Math.atan2(bs[0]-as[0],bs[1]-as[1]);
  });
}
function bob(c){return [c.px+c.L*Math.sin(c.a0+c.th),c.py+c.L*Math.cos(c.a0+c.th)]}
function chStep(dt){
  if(!(cur.lv===2&&cur.id&&byId[cur.id]&&byId[cur.id].kind==='player'))return;
  chGeo();var h=1/90,n=Math.min(6,Math.ceil(dt/h));h=dt/Math.max(1,n);
  for(var s=0;s<n;s++){
    for(var i=0;i<CHIMES.length;i++){var c=CHIMES[i];c.w+=(-(820/c.L)*Math.sin(c.th)-.65*c.w)*h;c.th+=c.w*h}
    for(var i=0;i<CHIMES.length-1;i++){var A=CHIMES[i],B=CHIMES[i+1],xa=bob(A)[0],xb=bob(B)[0],ct=(B.rx-A.rx)-8;
      if(xb-xa<ct){var rel=A.w*A.L-B.w*B.L;if(rel>8){chime(A.f,.4,A.v);A.fl=.8;B.fl=.5}A.th-=2/A.L;B.th+=2/B.L}}
  }
  CHIMES.forEach(function(c){c.fl*=Math.exp(-dt*3)});
}
var BST={},PENT5=[523.25,587.33,659.25,783.99,880],BRING=0;
function soundBoardOn(){return cur.k==='sound'&&onBoard()&&bloom>.55}
function bstOf(it){
  var b=BST[it.id];
  if(!b){var n=0,k;for(k in BST)n++;b=BST[it.id]={th:0,w:0,fl:0,f:PENT5[n%5],lc:0}}
  return b;
}
function bStep(dt){
  var k,b;
  for(k in BST){
    b=BST[k];
    b.w+=(-70*b.th-2.4*b.w)*dt;b.w=clamp(b.w,-5,5);
    b.th=clamp(b.th+b.w*dt,-.5,.5);
    b.fl*=Math.exp(-dt*3);
    if(Math.abs(b.th)<2e-4&&Math.abs(b.w)<2e-3){b.th=0;b.w=0}
  }
}
function ringStar(it,vel,dl){
  var b=bstOf(it),tn=now();
  b.fl=Math.max(b.fl,vel);
  if(tn-b.lc<120)return;
  b.lc=tn;
  if(dl)setTimeout(function(){chime(b.f,vel)},dl);else chime(b.f,vel);
}
function breeze(vx){
  if(!soundBoardOn()||!vx)return;
  var items=boardItems(),n=0,sgn=vx>0?1:-1,ord=[];
  items.forEach(function(it){if(it.kind==='track')ord.push(it)});
  if(sgn<0)ord.reverse();
  ord.forEach(function(it,i){
    var b=bstOf(it);
    b.w=clamp(b.w+sgn*Math.min(1.4,Math.abs(vx)*.07)*(.6+.8*rnd(i*7.1+now()*3)),-5,5);
    if(Math.abs(b.w)>1.1&&now()-b.lc>350){ringStar(it,Math.min(1,Math.abs(b.w)/3),n*70);n++}
  });
}
function chimesDraw(){
  g.lineWidth=1.2;CHIMES.forEach(function(c){
    if(c.px==null)return;var b=bob(c);
    g.strokeStyle='rgba(255,220,210,'+(0.35+c.fl*.6)+')';g.beginPath();g.moveTo(c.px,c.py);g.lineTo(b[0],b[1]);g.stroke();
    g.fillStyle=c.fl>.2?'rgb('+MINT+')':'#f2e6e2';g.beginPath();g.arc(b[0],b[1],3.2,0,7);g.fill();
  });
}
function chime(f,vel){
  try{
    if(!AC){var C=window.AudioContext||window.webkitAudioContext;if(!C)return;AC=new C()}
    if(AC.state==='suspended')AC.resume();
    var t=AC.currentTime,g1=AC.createGain();g1.gain.setValueAtTime(.0001,t);g1.gain.exponentialRampToValueAtTime(.03+.06*(vel==null?1:vel),t+.01);g1.gain.exponentialRampToValueAtTime(.0001,t+1.6);g1.connect(AC.destination);
    [1,2.76,5.4].forEach(function(part,i){var o=AC.createOscillator();o.type='sine';o.frequency.value=f*part;o.connect(g1);o.start(t);o.stop(t+1.5)});
  }catch(e){}
}
function listen(){
  if(!AN||!au||au.paused){L.rms*=.9;return}
  AN.getByteFrequencyData(FD);AN.getByteTimeDomainData(TD);
  var s=0;for(var i=0;i<TD.length;i++){var v=(TD[i]-128)/128;s+=v*v}
  L.rms=L.rms*.6+.4*Math.min(1,Math.sqrt(s/TD.length)*3.2);
}
function audioGraph(){
  if(AC&&AN)return;
  try{var C=window.AudioContext||window.webkitAudioContext;AC=AC||new C();if(!au)return;
    var src=AC.createMediaElementSource(au);AN=AC.createAnalyser();AN.fftSize=512;src.connect(AN);AN.connect(AC.destination);
    FD=new Uint8Array(AN.frequencyBinCount);TD=new Uint8Array(AN.fftSize);
  }catch(e){}
}
function drawWF(){
  var wf=$('wf');if(!wf||!song)return;var c=wf.getContext('2d'),dpr=DPR,w=wf.width,h=wf.height;
  if(wf._w!==wf.clientWidth){wf.width=Math.max(1,wf.clientWidth*dpr);wf.height=Math.max(1,42*dpr);wf._w=wf.clientWidth;w=wf.width;h=wf.height}
  c.clearRect(0,0,w,h);var peaks=song.peaks||[],n=peaks.length,head=(au&&song.dur)?au.currentTime/song.dur:0;
  for(var i=0;i<n;i++){var x=(i+.5)/n*w,y=Math.max(1,peaks[i]*h*.42),on=i/n<head;
    c.fillStyle=on?'rgba(85,218,161,.85)':'rgba(220,230,240,.35)';c.fillRect(x-dpr*.4,h/2-y,dpr,y*2)}
  c.fillStyle='#fff';c.fillRect(head*w,6,1,h-12);
  var tc=$('tc');if(tc&&au)tc.textContent=mmss(au.currentTime)+' / '+mmss(song.dur||0);
}
function mmss(s){s=Math.max(0,s|0);return (s/60|0)+':'+(s%60<10?'0':'')+(s%60|0)}

/* ---------- layers ---------- */
function renderLayer(){
  var el=$('layer');
  if(reelCtl){
    var same=reelCtl.id&&cur.lv===2&&cur.id===reelCtl.id&&!(window.GJ_DEPTH&&GJ_DEPTH.owns())&&el.firstChild&&el.firstChild.className==='rl';
    if(same)return;
    reelCtl.stop();reelCtl=null;
  }
  if(window.GJ_DEPTH&&GJ_DEPTH.owns()){GJ_DEPTH.paintLayer(el);return}
  if(window.GJ_DEPTH&&GJ_DEPTH.soundOn()){el.classList.remove('on');el.innerHTML='';return}
  if(cur.lv!==2||!cur.id||!byId[cur.id]){el.classList.remove('on');el.innerHTML='';pauseAu();return}
  var it=byId[cur.id];el.classList.add('on');
  if(it.kind==='reel')renderReel(el,it);
  else if(it.kind==='player')renderPlayer(el,it);
  else if(it.kind==='joio')renderJoio(el,it);
  else renderSheet(el,it);
}
function renderSheet(el,it){
  var m=it.media||{},frame='',play='';
  if(it.kind==='film'&&m.clip){
    frame='<div class="frame239"><video id="fv" playsinline preload="metadata" poster="'+esc(m.big)+'" src="'+esc(m.clip)+'"></video></div>';
    play='<button type="button" class="play" id="play">play</button>';
  }else if(m.big||m.thumb){
    frame='<div class="'+(it.kind==='film'?'frame239':'')+'"><img class="'+(it.kind==='film'?'':'stillbig')+'" src="'+esc(m.big||m.thumb)+'" alt="'+esc(it.title)+'"></div>';
  }
  var rail=it.kind==='film'?'<div class="rail" id="rail"><canvas id="rc"></canvas><i class="head" id="rhead"></i></div>':'';
  var strip='';
  if(m.frames&&m.frames.length){
    strip='<div class="strip">'+m.frames.map(function(src,i){return '<button type="button" data-f="'+i+'"><img src="'+esc(src)+'" alt=""></button>'}).join('')+'</div>';
  }
  var body='';
  if(it.kind==='bio')body='<div class="prose">'+esc(it.body).split('\n\n').map(function(p){return '<p>'+p+'</p>'}).join('')+'</div>';
  if(it.kind==='poem')body='<p class="poemcard">'+esc(it.body).split('\n').map(function(l){return '<span>'+l+'</span>'}).join('')+'<span class="sig" lang="cr">ᑕᐣᓯ</span></p>';
  if(it.kind==='contact')body='<p><a href="mailto:'+esc(data.email)+'">'+esc(data.email)+'</a></p>';
  if(it.kind==='link')body='<p><a href="https://www.joioco.com">joio.co ↗</a></p>';
  var cred=(it.credits||[]).map(function(c){return '<li>'+esc(c)+'</li>'}).join('');
  var rel=(it.related||[]).map(function(id){
    var o=byId[id];if(!o)return '';
    var name=o.title||'';
    if(/^photograph\s+\d+$/i.test(name)||name==='untitled')return '';
    return '<a href="'+o.chapter+'/'+o.slug+'/">'+esc(name)+'</a>';
  }).filter(Boolean).join(' · ');
  rel=rel?'<p class="rel">'+rel+'</p>':'';
  var watch=(m.url&&/^https:\/\/(open\.spotify\.com|music\.apple\.com)\//i.test(m.url)) /* listen links only; never an off-site video host */?'<p class="rel"><a href="'+esc(m.url)+'">'+esc(it.title)+'</a></p>':'';
  if(it.body&&!body)body='<div class="prose"><p>'+esc(it.body).split('\n\n').map(function(p){return p}).join('</p><p>')+'</p></div>';
  var role=it.role||'';
  if(role==='Director · Director of Photography'&&(it.credits||[]).length)role='';
  var meta=it.meta||'';
  if(/^(portrait|landscape|square)$/i.test(meta)||/moving filmstrip/i.test(meta))meta='';
  var title=it.title||'';
  if(/^photograph\s+\d+$/i.test(title)||title==='untitled')title='';
  el.innerHTML='<div class="sheet'+(it.kind==='film'?'':' full')+'">'+frame+play+rail+
    '<p class="meta" id="tc"></p>'+strip+(title?'<h2>'+esc(title)+'</h2>':'')+
    (role?'<p class="role">'+esc(role)+'</p>':'')+(meta?'<p class="meta">'+esc(meta)+'</p>':'')+
    body+(cred?'<ul class="credits">'+cred+'</ul>':'')+watch+rel+'</div>';
  var v=$('fv'),railEl=$('rail');
  var btn=$('play');
  if(btn)btn.onclick=function(){
    if(v){if(v.paused){var p=v.play();if(p&&p.catch)p.catch(function(){})}else v.pause()}
  };
  if(railEl&&v){
    paintRail(0);
    function seek(ev){var r=railEl.getBoundingClientRect(),t=clamp((ev.clientX-r.left)/r.width,0,1);
      if(v.duration)v.currentTime=t*v.duration;paintRail(t)}
    railEl.addEventListener('pointerdown',function(ev){seek(ev);railEl.setPointerCapture(ev.pointerId)});
    railEl.addEventListener('pointermove',function(ev){if(ev.buttons)seek(ev)});
    v.addEventListener('timeupdate',function(){var t=v.duration?v.currentTime/v.duration:0;paintRail(t);
      var tc=$('tc');if(tc)tc.textContent=mmss(v.currentTime)+' / '+mmss(v.duration||0)});
  }
  el.onclick=function(ev){
    var b=ev.target.closest('[data-f]');if(!b)return;
    [].forEach.call(el.querySelectorAll('[data-f]'),function(x){x.classList.toggle('on',x===b)});
    if(v&&v.duration){var n=m.frames.length,i=+b.dataset.f;v.currentTime=v.duration*(i/(n||1))}
  };
}
function paintRail(t){
  var c=$('rc');if(!c)return;var dpr=DPR;c.width=c.clientWidth*dpr;c.height=c.clientHeight*dpr;
  var q=c.getContext('2d'),w=c.width,h=c.height;q.clearRect(0,0,w,h);
  q.fillStyle='rgba(255,255,255,.18)';q.fillRect(0,h/2,w,1);
  q.fillStyle='rgba(85,218,161,.8)';q.fillRect(0,h/2,w*t,1);
  var n=12;q.fillStyle='rgba(230,236,240,.8)';
  for(var i=0;i<n;i++){var x=i/(n-1)*w;q.fillRect(x,h*.3,dpr,h*.4)}
  var head=$('rhead');if(head)head.style.left=(t*100)+'%';
}
function renderPlayer(el){
  pauseAu();
  if(!au){au=document.createElement('audio');au.volume=GVOL;au.preload='none';au.crossOrigin='anonymous';document.body.appendChild(au);
    au.addEventListener('ended',function(){playing=false});
    au.addEventListener('timeupdate',drawWF)}
  el.innerHTML='<div class="snd"><div class="row"><button type="button" class="play" id="splay">play</button><div class="who"><b id="sttl"></b><small id="sart"></small></div><span id="tc"></span></div><canvas class="wf" id="wf"></canvas><p class="lic"><a href="mailto:'+esc(data.email)+'?subject=music%20licensing">licensing · '+esc(data.email)+'</a></p></div>';
  $('splay').onclick=function(){if(!song)return;if(playing){au.pause();playing=false;this.textContent='play'}else startSong(song)};
  showSong();
}
function showSong(){
  var a=$('sttl'),b=$('sart');if(a&&song){a.textContent=song.title;b.textContent=song.artist}
  var btn=$('splay');if(btn)btn.textContent=playing?'pause':'play';
}
function startSong(tr){
  if(!au)return;if(au.src!==tr.file){au.src=tr.file;au.load()}
  audioGraph();try{if(AC&&AC.state==='suspended')AC.resume()}catch(e){}
  var p=au.play();if(p&&p.catch)p.catch(function(){});
  playing=true;song=tr;showSong();
}
function pauseAu(){if(au&&!au.paused)au.pause();playing=false}
function renderJoio(el){
  var clips=(window.GJ_JOIO||[]).filter(function(c){return c.k==='v'});
  var hero=clips[0];
  if(!hero){renderSheet(el,byId['objects/joio']);return}
  el.innerHTML='<div class="sheet full"><div class="joio-stage"><video id="jv" muted loop playsinline autoplay poster="'+esc(JOIOB+hero.f)+'" src="'+esc(JOIOB+hero.v)+'"></video></div><h2>joio</h2><p class="meta">cups and paddles</p><p class="rel"><a href="https://www.joioco.com">joio.co</a></p></div>';
}
var REELBOX=null;
function filmByL(l){return CH.film?CH.film.items.filter(function(it){return it.k==='w'+l})[0]:null}
function renderReel(el,it){
  if(!window.GJ_REELVIEW){el.innerHTML='<div class="sheet full"><p>The reel is missing.</p></div>';return}
  var ctl=GJ_REELVIEW.mount(el,{
    base:REELB,
    title:it.title||'Demo Reel',
    film:filmByL,
    viewFilm:function(l){var f=filmByL(l);if(f)go({lv:2,k:'film',id:f.id})},
    box:function(){var b=REELBOX;REELBOX=null;return b}
  });
  reelCtl={id:it.id,stop:ctl.stop,state:ctl.state};
}

/* ---------- input ---------- */
function bind(){
  wireBioCtl();
  stage.addEventListener('pointerdown',function(){if(!HINTSEEN&&levelOf(cur)===1)seenHint()},true);
  window.addEventListener('pointerdown',function(){if(SKYIN.t0)skyIntroEnd()},true);
  var wc=$('wcrumb'),wr=$('wrail');
  function wjump(e){var b=e.target.closest('[data-lv]');if(!b)return;e.preventDefault();e.stopPropagation();jumpLevel(+b.getAttribute('data-lv'))}
  if(wc)wc.addEventListener('click',wjump);
  if(wr){wr.addEventListener('click',wjump);wr.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' ')wjump(e)})}
  $('layer').addEventListener('click',layerTap);
  /* The seven layers step deeper from a click or tap (a mouse has no pinch), unless the click is picking text or a link. */
  $('layers').addEventListener('click',function(e){
    if(phase!=='sky'||!bioOn||bioExit||bioMoon)return;
    if(e.target.closest&&e.target.closest('a,button,input,label,#bioctl'))return;
    var sel=window.getSelection&&window.getSelection();
    if(sel&&String(sel).length)return;
    deeper(e.clientX,e.clientY);
  });
  stage.addEventListener('pointerdown',onDown);
  stage.addEventListener('pointermove',onMove);
  stage.addEventListener('pointerup',onUp);
  stage.addEventListener('pointercancel',onUp);
  stage.addEventListener('touchstart',onTouch,{passive:false});
  stage.addEventListener('touchmove',onTouchMove,{passive:false});
  stage.addEventListener('touchend',function(){pinchLetGo();pinch=null},{passive:true});
  window.addEventListener('pointerdown',onPtrDown,true);
  window.addEventListener('pointermove',onPtrMove,true);
  window.addEventListener('pointerup',onPtrUp,true);
  window.addEventListener('pointercancel',onPtrUp,true);
  window.addEventListener('message',function(e){if(e.data==='sound-out')back()});
  $('dive').addEventListener('click',function(e){e.stopPropagation();skipToSky()});
  $('back').addEventListener('click',function(e){e.stopPropagation();back()});
  $('crumb').querySelector('.sig').addEventListener('click',function(e){e.preventDefault();e.stopPropagation();farHome()});
  addEventListener('keydown',function(e){
    var c=$('hirecard');
    if(e.key==='Escape'&&c&&!c.hidden){e.preventDefault();e.stopPropagation();hireOpen(false);return}
    if(e.key==='Escape'){e.preventDefault();back()}
    if(bioOn&&!bioExit&&isBio()&&!(e.target&&/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))){
      if(e.key==='ArrowRight'){e.preventDefault();deeper(innerWidth/2,innerHeight/2)}
      else if(e.key==='ArrowLeft'){e.preventDefault();back()}
    }
  });
  var hireBtn=$('hire'),hireX=$('hirex');
  if(hireBtn)hireBtn.addEventListener('click',function(e){e.stopPropagation();hireOpen($('hirecard').hidden)});
  if(hireX)hireX.addEventListener('click',function(e){e.stopPropagation();hireOpen(false)});
  var reelBtn=$('reel');
  if(reelBtn)reelBtn.addEventListener('click',function(e){e.stopPropagation();openReel()});
  document.querySelectorAll('.chips button').forEach(function(b){
    b.addEventListener('click',function(e){
      e.stopPropagation();
      var jump=b.getAttribute('data-jump');
      if(jump==='poem'){go({lv:2,k:'about',id:'about/poem'});return}
      if(jump==='joio'){go({lv:2,k:'objects',id:'objects/joio'});return}
      var k=b.getAttribute('data-ch');if(k)go({lv:1,k:k,id:null});
    });
  });
  var mapBtn=$('mmap');
  if(mapBtn)mapBtn.addEventListener('click',function(e){e.stopPropagation();jumpMap(e)});
  var ax=$('aprox');
  if(ax)ax.addEventListener('click',function(e){e.stopPropagation();back()});
  addEventListener('resize',function(){layout();arriveAt(cur,true)});
  addEventListener('popstate',onPop);
}
function onDown(e){
  if(e.target.closest('#hirecard'))return;
  noteTouch(e.clientX,e.clientY);
  var card=$('hirecard');
  if(card&&!card.hidden&&!e.target.closest('#hire')){hireOpen(false);return}
  if(e.target.closest('#bar,#wcrumb,#wrail,.gdoor,#layer,#layers,#bioctl,#dive,.snd,.reel,.sheet,#mmap,#reel,#apro'))return;
  if(phase==='arrive'||phase==='land'){rippleAt(e.clientX,e.clientY);drag={x:e.clientX,y:e.clientY,id:e.pointerId,t:now()};moved=false;return}
  if(phase!=='sky')return;
  var over=false;
  if(cur.lv===1&&boardKey()){
    var spec=gridSpec(boardKey());
    over=spec.maxSc>4&&e.clientX>=spec.x0&&e.clientX<=spec.x0+spec.w&&e.clientY>=spec.y0&&e.clientY<=spec.y0+spec.winH;
  }
  drag={x:e.clientX,y:e.clientY,lx:lxS.x,ly:lyS.x,s0:scr.x,over:over,id:e.pointerId,t:now(),chime:chimeAt(e.clientX,e.clientY)};
  moved=false;
}
function onMove(e){
  if(!drag||e.pointerId!==drag.id)return;
  noteTouch(e.clientX,e.clientY);
  var dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(Math.hypot(dx,dy)>8)moved=true;
  if(phase!=='sky')return;
  if(drag.chime&&cur.id&&byId[cur.id]&&byId[cur.id].kind==='player'){
    CHIMES.forEach(function(c){c.w+=(dx>0?1:-1)*.02});return}
  if(!moved)return;
  if(drag.over){
    var spec=gridSpec(boardKey());
    var t=clamp(drag.s0-(e.clientY-drag.y),0,spec.maxSc);
    scr.x=scr.t=t;scr.v=0;
    var tl=34/Math.max(.2,rest.s);
    lyS.x=lyS.t=clamp((t-drag.s0)*.1/rest.s,-tl,tl);lyS.v=0;
    return;
  }
  if(soundBoardOn()){breeze(e.clientX-(drag.px==null?drag.x:drag.px));drag.px=e.clientX}
  var lim=34/Math.max(.2,rest.s);
  lxS.x=lxS.t=clamp(drag.lx-dx/rest.s,-lim,lim);
  lyS.x=lyS.t=clamp(drag.ly-dy/rest.s,-lim,lim);
  lxS.v=lyS.v=0;
}
var LASTTAP={t:0,x:0,y:0,hit:null};
function onUp(e){
  if(!drag||e.pointerId!==drag.id)return;
  var was=drag;drag=null;
  if(phase==='arrive'){skipToSky();return}
  if(phase==='land'){if(!moved)nextLand();return}
  if(phase!=='sky')return;
  if(moved){
    if(was.chime){var c=was.chime;chime(c.f);c.fl=1}
    lxS.t=0;lyS.t=0;lxS.w=W_LOOK;lyS.w=W_LOOK;
    return;
  }
  var tn=now(),dbl=tn-LASTTAP.t<360&&Math.hypot(e.clientX-LASTTAP.x,e.clientY-LASTTAP.y)<40;
  LASTTAP={t:tn,x:e.clientX,y:e.clientY,hit:LASTTAP.hit};
  if(dbl&&!LASTTAP.hit&&cur.lv>=1&&phase==='sky'&&!(window.GJ_DEPTH&&GJ_DEPTH.soundOn())&&!isBio()){LASTTAP={t:0,x:0,y:0,hit:null};back();return}
  LASTTAP.hit=hit(e.clientX,e.clientY);
  tap(e.clientX,e.clientY);
}
/* A real click only ever follows a tap (never a scroll or a pinch), so the HTML sheets open their next level from it. */
function layerTap(e){
  if(phase!=='sky'||!e.target||!e.target.closest)return;
  if(e.target.closest('a,button,input,label,video[controls],[data-open],.rail,.snd,.rl'))return;
  var im=e.target.closest('.contact img,.framewall img[data-hi="1"],.series img,.heroframe,.cutgrid img,.cutgrid video,.graincrops img');
  if(!im)return;
  var r=im.getBoundingClientRect();
  if(cur.k==='sound'&&!songTapOpens(im))return;
  deeper(r.left+r.width/2,r.top+r.height/2);
}
/* Songs open on the second tap: the first tap highlights the song and shows its title, a tap on another song moves the selection. */
var SONGSEL='';
function songTapOpens(im){
  var key=cur.id+'|'+(im.getAttribute('src')||im.tagName);
  if(SONGSEL===key)return true;
  var old=document.querySelector('#layer .songsel');if(old)old.classList.remove('songsel');
  SONGSEL=key;im.classList.add('songsel');
  var w=byId[cur.id],lab=$('songtitle');
  if(!lab){lab=document.createElement('div');lab.id='songtitle';lab.setAttribute('aria-live','polite');document.body.appendChild(lab)}
  lab.textContent=(w&&w.title||'')+' \u00b7 tap again to open';lab.classList.add('on');
  clearTimeout(songTapOpens.t);songTapOpens.t=setTimeout(function(){lab.classList.remove('on')},2600);
  return false;
}
function onPtrDown(e){
  if(e.target&&e.target.closest&&e.target.closest('#gjdbg,#bioctl'))return;
  if(e.pointerType==='mouse'&&!e.buttons)return;
  PT[e.pointerId]={x:e.clientX,y:e.clientY};
  var ids=Object.keys(PT);
  if(ids.length===2){
    var a=PT[ids[0]],b=PT[ids[1]];
    pinch={d:Math.hypot(a.x-b.x,a.y-b.y),done:0,x:(a.x+b.x)/2,y:(a.y+b.y)/2};
    drag=null;
    if(opening())opEngage(pinch);
  }
}
function onPtrMove(e){
  if(!PT[e.pointerId])return;
  PT[e.pointerId]={x:e.clientX,y:e.clientY};
  var ids=Object.keys(PT);
  if(ids.length<2||!pinch||(pinch.done&&!OP.on))return;
  var a=PT[ids[0]],b=PT[ids[1]];
  var d=Math.hypot(a.x-b.x,a.y-b.y),r=d/(pinch.d||1);
  pinch.x=(a.x+b.x)/2;pinch.y=(a.y+b.y)/2;
  if(OP.on){opMove(d,pinch.x,pinch.y);return}
  if(cardsBoardOn()){if(r<.84){pinch.done=1;back()}return}
  if(r>1.18){pinch.done=1;if(window.GJ_DEPTH)GJ_DEPTH.followEnd();deeper(pinch.x,pinch.y)}
  else if(r<.84){pinch.done=1;pinchBack(0)}
  else if(window.GJ_DEPTH)GJ_DEPTH.follow(Math.min(1,r));
}
/* A pinch-out never lands twice: it waits for a still that is still opening, and is ignored just after a still has closed. */
function pinchBack(n){
  if(window.GJ_DEPTH){
    if(GJ_DEPTH.holdOut()){GJ_DEPTH.followEnd();return}
    if(GJ_DEPTH.busy()&&n<30){setTimeout(function(){pinchBack(n+1)},60);return}
  }
  back();
}
function pinchLetGo(){if(pinch&&!pinch.done&&window.GJ_DEPTH)GJ_DEPTH.followEnd()}
function onPtrUp(e){
  delete PT[e.pointerId];
  if(Object.keys(PT).length<2){if(OP.on)opRelease();pinchLetGo();pinch=null;OP.hold=0}
}
/* Opening pinch: two fingers drive the opening itself (p 0..1 = mark, fly, land frames, sky) and the layers follow them. */
var OP={on:0,used:0,hold:0,p:0,p0:0,d0:1,d:1,x:0,y:0,z:0,ox:0,oy:0},OFEND=.4,OSPAN=2.8;
function opening(){return phase==='arrive'||phase==='fly'||phase==='land'}
function opP(){
  if(phase==='arrive')return 0;
  if(phase==='fly')return flyU*OFEND;
  if(phase==='land')return OFEND+(1-OFEND)*(landI/Math.max(1,lands.length));
  return 1;
}
function opEngage(pz){
  OP.on=1;OP.hold=1;OP.p0=OP.p=opP();OP.d0=pz.d||1;OP.d=OP.d0;OP.x=pz.x;OP.y=pz.y;
  if(!OP.used){OP.used=1;OP.z=OP.p;OP.ox=pz.x;OP.oy=pz.y}
  pz.done=1;
  try{sessionStorage.setItem(seenKey(),'1')}catch(e){}
}
function opMove(d,x,y){
  OP.d=d;OP.x=x;OP.y=y;
  var p=clamp(OP.p0+Math.log(d/OP.d0)/Math.log(OSPAN),0,1);
  OP.p=p;
  if(p>=1){if(window.GJ_DEPTH&&GJ_DEPTH.hush)GJ_DEPTH.hush();opCommit();return}
  if(p<=0){if(phase!=='arrive'){phase='arrive';flyU=0;landTok++;setChrome()}return}
  if(p<OFEND){
    if(phase!=='fly'){phase='fly';landTok++;setChrome()}
    flyU=p/OFEND;return;
  }
  var i=Math.min(lands.length-1,Math.floor((p-OFEND)/(1-OFEND)*lands.length));
  flyU=1;
  if(window.GJ_DEPTH&&GJ_DEPTH.hush)GJ_DEPTH.hush();
  if(phase!=='land'){phase='land';landI=i;landT=now();showLand();setChrome()}
  else if(landI!==i){landI=i;landT=now();showLand()}
}
function opCommit(){
  var d=OP.d,x=OP.x,y=OP.y;
  OP.on=0;OP.used=0;opClear();
  enterSky(true);
  if(Object.keys(PT).length>=2)pinch={d:d,done:1,x:x,y:y};
}
function opRelease(){
  OP.on=0;
  if(phase==='fly'){
    if(flyU<.3){phase='arrive';flyU=0;setChrome()}
    else flyT=now()-flyU*1680*tk('fade');
  }else if(phase==='land')landT=now();
}
var OPL=['water','path','horizon','dust','poem','moon'],OPK={water:1.4,path:1.7,horizon:1.0,dust:1.15,poem:.7,moon:.35};
function opClear(){
  OPL.forEach(function(id){var el=$(id);if(el)el.style.transform=''});
  var im=$('landimg');if(im)im.style.transform='';
  var dust=$('dust');if(dust&&!OP.on){dust.style.transition='';dust.style.opacity=''}
}
function opLayers(dt){
  var tgt=OP.on?OP.p:opP(),k=1-Math.exp(-dt*22);
  OP.z+=(tgt-OP.z)*k;OP.ox+=(OP.x-OP.ox)*k;
  if(!OP.on){OP.ox=OP.x}
  if(!OP.on&&phase==='arrive'&&OP.z<.003){OP.used=0;opClear();return}
  var ox=OP.ox||W/2,oy=OP.on?OP.y:(OP.y||H*.46),z=OP.z;
  var dust=$('dust');
  if(dust){
    if(OP.on){dust.style.transition='none';dust.style.opacity=(Math.max(0,1-OP.p/OFEND)*.7).toFixed(3)}
    else if(dust.style.opacity){dust.style.transition='';dust.style.opacity=''}
  }
  OPL.forEach(function(id){
    var el=$(id);if(!el)return;
    var sc=1+z*OPK[id];
    el.style.transformOrigin=ox+'px '+oy+'px';
    el.style.transform='scale('+sc.toFixed(4)+')';
  });
  var im=$('landimg');
  if(im){
    var f=phase==='land'?clamp((z-OFEND)/(1-OFEND)*lands.length-landI,0,1):0;
    im.style.transformOrigin=ox+'px '+oy+'px';
    im.style.transform=f>0?'scale('+(1+.3*f).toFixed(4)+')':'';
  }
}
function onTouch(e){
  if(e.touches.length===2){drag=null;if(e.cancelable)e.preventDefault()}
}
function onTouchMove(e){
  if(e.touches.length>=2&&e.cancelable)e.preventDefault();
}
function tap(x,y){
  if(window.GJ_DEPTH&&GJ_DEPTH.soundOn())return;
  if(cur.lv===2&&cur.id&&byId[cur.id]&&byId[cur.id].kind==='player'){
    var hitS=songHit(x,y);
    if(hitS){
      if(sel&&sel.type==='song'&&sel.k===hitS.k)startSong(hitS);
      else {sel={type:'song',k:hitS.k};song=hitS;if(au){au.src=hitS.file}showSong()}
      return;
    }
    var chh=chimeAt(x,y);if(chh){chime(chh.f);chh.fl=1;chh.w+=.4;return}
    return;
  }
  var h=hit(x,y);
  if(!h||h.type==='panel'){if(!h)sel=null;return}
  var again=!!sel&&selKey(sel)===selKey(h),star=soundBoardOn()&&h.type==='work'&&byId[h.id]&&byId[h.id].kind==='track'?byId[h.id]:null;
  sel=h;
  if(star){
    bstOf(star).w+=(x<W/2?1:-1)*1.2;
    ringStar(star,.9,0);
  }
  if(again)deeper(x,y);
}
function selKey(h){return h.type+':'+(h.id||h.k||'')}
function tileAt(x,y){
  if(cur.lv<1||!onBoard())return null;
  var b=cur.k==='progress'?pbloom:bloom;
  if(b<.55)return null;
  var spec=gridSpec(boardKey()),items=boardItems();
  if(x<spec.x0||x>spec.x0+spec.w||y<spec.y0||y>spec.y0+spec.winH)return null;
  for(var i=0;i<items.length;i++){
    var rc=tileRect(spec,i,scr.x);
    if(x>=rc.x-2&&x<=rc.x+rc.w+2&&y>=rc.y-2&&y<=rc.y+rc.h+spec.cap+2)return items[i];
  }
  return null;
}
function depthApi(){
  return {
    cur:function(){return cur},
    byId:function(id){return byId[id]},
    ch:function(k){return CH[k]},
    progress:function(){return progress},
    nov9:function(k){return NOV9I[k]||[]},
    soundBoard:soundBoard,
    hit:hit,
    tileAt:tileAt,
    reelFrom:function(b){REELBOX=b},
    tileBox:function(it){
      var items=boardItems(),i;
      for(i=0;i<items.length;i++)if(items[i]===it||items[i].id===it.id){
        var rc=tileRect(gridSpec(boardKey()),i,scr.x);
        return {l:rc.x,t:rc.y,w:rc.w,h:rc.h};
      }
      return null;
    },
    wave:function(it){return waveFor(it)},
    setCur:function(c){cur=c},
    push:function(){pushStep()},
    arrive:function(){arriveAt(cur,false)},
    paint:function(){renderLayer();ui()},
    load:loadImg,
    openId:function(id){var it=byId[id];if(!it)return;go({lv:2,k:it.chapter,id:it.id})},
    backHist:function(){
      if(history.state&&history.state.u1&&cur.lv>0)history.back();
      else {cur={lv:0,k:null,id:null};if(window.GJ_DEPTH)GJ_DEPTH.sync(cur,depthApi());arriveAt(cur,false);ui()}
    }
  };
}
function hit(x,y){
  if(cur.lv===1&&!onBoard())return midHit(x,y);
  if(cur.lv===1){
    var b=cur.k==='progress'?pbloom:bloom;
    if(b>.55){
      var spec=gridSpec(boardKey()),items=boardItems();
      if(x>=spec.x0&&x<=spec.x0+spec.w&&y>=spec.y0&&y<=spec.y0+spec.winH){
        for(var i=0;i<items.length;i++){
          var rc=tileRect(spec,i,scr.x);
          if(x>=rc.x-2&&x<=rc.x+rc.w+2&&y>=rc.y-2&&y<=rc.y+rc.h+spec.cap+2)
            return {type:'work',k:cur.k,id:items[i].id,prog:cur.k==='progress'?1:0};
        }
        return {type:'panel'};
      }
    }
  }
  if(cur.lv===0){
    var c=wp(x,y);
    if(Math.hypot(c[0],c[1])<46)return {type:'poem',k:'about',id:'about/poem'};
    var best=null,bd=26;
    cluster.forEach(function(it){var q=sp(it.cx,it.cy),d=Math.hypot(q[0]-x,q[1]-y);if(d<bd){bd=d;best={type:'work',k:'progress',id:it.id,prog:1}}});
    if(best)return best;
    ORDER.forEach(function(k){
      var ch=CH[k];ch.skyItems.forEach(function(it){var q=sp(it.sx,it.sy),d=Math.hypot(q[0]-x,q[1]-y);if(d<bd){bd=d;best={type:'ch',k:k}}});
      var q=sp(ch.x,ch.y),d=Math.hypot(q[0]-x,q[1]-y);if(d<Math.max(ch.bw,ch.bh)*.35*rest.s&&d<bd+40)best={type:'ch',k:k};
    });
    return best;
  }
  return null;
}
function songHit(x,y){
  var c=CH.sound,best=null,bd=30;
  c.node.forEach(function(n,i){var tr=songAt[i];if(!tr||!n)return;var p=nodePos(n),q=sp(p[0],p[1]),d=Math.hypot(q[0]-x,q[1]-y);if(d<bd){bd=d;best=tr}});
  return best;
}
function chimeAt(x,y){
  if(!(cur.lv===2&&cur.id&&byId[cur.id]&&byId[cur.id].kind==='player'))return null;
  var best=null,bd=28;CHIMES.forEach(function(c){if(c.px==null)return;var b=bob(c),d=Math.hypot(b[0]-x,b[1]-y);if(d<bd){bd=d;best=c}});return best;
}
function openSel(){
  if(!sel)return;
  if(sel.type==='ch')go({lv:1,k:sel.k,id:null});
  else if(sel.type==='poem')go({lv:2,k:'about',id:'about/poem'});
  else if(sel.type==='work'&&sel.prog&&cur.lv===0)go({lv:1,k:'progress',id:null});
  else if(sel.type==='work'&&sel.id==='film/cards'){go({lv:1,k:'film',id:null,cards:1})}
  else if(sel.type==='work'&&cur.lv>=1){
    var it=byId[sel.id];
    if(it&&it.kind==='track'){song=it.track;if(au)au.src=song.file;go({lv:2,k:'sound',id:'sound/waveform'})}
    else go({lv:2,k:sel.prog?'progress':sel.k,id:sel.id});
  }
  sel=null;
}
var bioOn=0,bioLv=1,bioExit=0,bioMoon=0,grainOn=0;
function isBio(){return phase==='sky'&&cur.k==='about'&&cur.lv===2&&cur.id==='about/bio'}
function bioActive(){return isBio()&&!bioExit}
function paintGrain(){
  var c=$('grain');if(!c||grainOn)return;
  var w=180,h=320;c.width=w;c.height=h;
  var g=c.getContext('2d'),im=g.createImageData(w,h),d=im.data,i;
  for(i=0;i<d.length;i+=4){var n=(Math.random()*255)|0;d[i]=d[i+1]=d[i+2]=n;d[i+3]=70}
  g.putImageData(im,0,0);grainOn=1;
}
var GL={bands:[],burst:0,w:0,h:0,frame:null,prev:null};
function calcCrop(v,W,H){
  var vw=v.videoWidth,vh=v.videoHeight;
  var bx=0,by=vh*0.045,bw=vw,bh=vh*0.88;
  var dar=W/Math.max(1,H),sw,sh;
  if(bw/bh>dar){sh=bh;sw=sh*dar}else{sw=bw;sh=sw/dar}
  var sx=Math.max(0,Math.min(vw-sw,bx+(bw-sw)/2));
  var sy=Math.max(0,Math.min(vh-sh,by+(bh-sh)*0.22));
  var fx=vw*0.58,fy=vh*0.40;
  return {sx:sx,sy:sy,sw:sw,sh:sh,lx:(fx-sx)/sw,ly:(fy-sy)/sh};
}
function layoutCalc(){
  var stage=$('calcstage'),zoom=$('calczoom'),v=$('calc');
  if(!stage||!zoom)return;
  var z=1+(Math.max(1,Math.min(7,bioLv))-1)*0.30;
  var ox=52,oy=66,crop=null;
  if(v&&v.videoWidth&&stage.clientWidth){
    crop=calcCrop(v,stage.clientWidth,stage.clientHeight);
    ox=crop.lx*100;oy=crop.ly*100;
  }
  zoom._crop=crop;
  zoom.style.transformOrigin=ox.toFixed(2)+'% '+oy.toFixed(2)+'%';
  zoom.style.transform='scale('+z.toFixed(3)+')';
}
function drawGlitch(t){
  if(!bioOn||bioMoon)return;
  var v=$('calc'),c=$('glitch'),zoom=$('calczoom');
  if(!v||!c||!zoom||v.readyState<2||!v.videoWidth)return;
  var amt=clamp(GGL,0,1);
  var freeze=!!GNOFLASH;
  var tt=freeze&&GL.holdT!=null?GL.holdT:t;
  if(freeze&&GL.holdT==null)GL.holdT=t;
  if(!freeze)GL.holdT=null;
  if(freeze&&GL.still&&!GL.needStill&&GL.stillW===c.width&&GL.stillH===c.height&&GL.stillAmt===amt)return;
  var W=zoom.clientWidth||innerWidth,H=zoom.clientHeight||innerHeight;
  if(W<2||H<2)return;
  var bw=Math.max(2,Math.min(W,520)),bh=Math.max(2,Math.round(bw*H/W));
  if(c.width!==bw||c.height!==bh){c.width=bw;c.height=bh;GL.frame=null;GL.prev=null;GL.still=0}
  if(!zoom._crop)layoutCalc();
  var crop=zoom._crop;if(!crop)return;
  var g=c.getContext('2d',{willReadFrequently:true});
  g.drawImage(v,crop.sx,crop.sy,crop.sw,crop.sh,0,0,bw,bh);
  if(amt<=0){
    GL.needStill=0;GL.still=freeze?1:0;GL.stillW=c.width;GL.stillH=c.height;GL.stillAmt=amt;
    return;
  }
  var img=g.getImageData(0,0,bw,bh),d=img.data;
  if(!GL.frame||GL.frame.length!==d.length){GL.frame=new Uint8ClampedArray(d.length);GL.prev=new Uint8ClampedArray(d.length)}
  var src=GL.frame,prev=GL.prev,i;
  src.set(d);
  var depth=(Math.max(1,Math.min(7,bioLv))-1)/6;
  var shift=Math.round((1+depth*16+(GL.burst>0?2+depth*8:0))*amt);
  var mix=(0.16+depth*0.84)*amt;
  var dim=(0.28+depth*0.42)*amt;
  var scan=depth>0.55?2:3;
  var flick=(0.78-depth*0.5)+(0.28+depth*0.85)*(0.5+0.5*Math.sin(tt*(0.05*amt)));
  if(depth>0.35&&Math.sin(tt*(0.021*amt))>0.8)flick*=0.35;
  if(amt<1)flick=1+(flick-1)*amt;
  var yBand=(Math.sin(tt*(0.0023*amt))*0.5+0.5);
  var standY=(yBand*(bh-8))|0;
  var standDx=Math.round(Math.sin(tt*(0.0031*amt))*(depth*26)*amt);
  var standH=Math.round(2+depth*20);
  var standY2=((standY+((bh*0.37)|0))%bh);
  var standDx2=Math.round(Math.cos(tt*(0.0027*amt))*(depth*20)*amt);
  if(!freeze&&Math.random()<((0.12+depth*0.28+(GL.burst>0?0.55:0))*amt)){
    GL.bands.push({y:(Math.random()*bh)|0,hh:Math.round(3+Math.random()*(6+depth*22)),dx:Math.round((Math.random()*2-1)*(2+depth*26)*amt),life:3+((Math.random()*(4+depth*10))|0),mosh:Math.random()<0.45+depth*0.4});
  }
  var live,bi;
  if(!freeze){
    if(GL.burst>0)GL.burst--;
    live=[];
    for(bi=0;bi<GL.bands.length;bi++){GL.bands[bi].life--;if(GL.bands[bi].life>0)live.push(GL.bands[bi])}
    GL.bands=live.slice(-8);
  }else{
    live=GL.bands;
  }
  for(var y=0;y<bh;y++){
    var dx=0,mosh=0;
    if(y>=standY&&y<standY+standH)dx=standDx;
    if(y>=standY2&&y<standY2+Math.max(2,standH-2))dx=standDx2;
    for(bi=0;bi<live.length;bi++){
      var b=live[bi];
      if(y>=b.y&&y<b.y+b.hh){dx=b.dx;if(b.mosh&&GL.seen)mosh=1}
    }
    var row=mosh&&GL.prev?prev:src;
    var scanOn=(y%scan)===0;
    var o=y*bw*4;
    for(var x=0;x<bw;x++){
      var xr=x-shift+dx;if(xr<0)xr=0;else if(xr>=bw)xr=bw-1;
      var xb=x+shift+dx;if(xb<0)xb=0;else if(xb>=bw)xb=bw-1;
      var xg=x+dx;if(xg<0)xg=0;else if(xg>=bw)xg=bw-1;
      var ir=o+xr*4,ig=o+xg*4,ib=o+xb*4,ip=o+x*4;
      var r0=src[ip],g0=src[ip+1],b0=src[ip+2];
      var r=(r0*(1-mix)+row[ir]*mix)*0.76;
      var gc=(g0*(1-mix)+row[ig+1]*mix)*0.76;
      var bch=(b0*(1-mix)+row[ib+2]*mix)*0.76;
      if(scanOn){var s=1-dim;r*=s;gc*=s;bch*=s}
      if(g0>70&&g0>r0*1.25&&g0>b0*1.1)gc=Math.max(0,Math.min(255,g0*flick));
      d[ip]=r;d[ip+1]=gc;d[ip+2]=bch;d[ip+3]=255;
    }
  }
  g.putImageData(img,0,0);
  if(!freeze)prev.set(src);
  GL.seen=1;
  GL.needStill=0;GL.still=freeze?1:0;GL.stillW=c.width;GL.stillH=c.height;GL.stillAmt=amt;
}
function paintBio(flick){
  var texts=(window.GJ_BIO&&GJ_BIO.layers)||[];
  var text=texts[bioLv-1]||'';
  var box=$('laytext');
  if(box){
    box.className='copy lv'+bioLv+(bioLv===7?' sel':'');
    box.innerHTML=text.split('\n').map(function(line){return line?'<span>'+esc(line)+'</span>':'<br>'}).join('');
    if(flick&&!GNOFLASH){
      box.classList.add('flick');
      GL.burst=8;
      setTimeout(function(){box.classList.remove('flick')},40);
    }
  }
  var rail=$('lrail');
  if(rail){
    var dots='',i;for(i=1;i<=7;i++)dots+='<i'+(i===bioLv?' class="on"':'')+'></i>';
    rail.innerHTML=dots+'<b>'+bioLv+'</b>';
  }
  var v=$('calc');
  if(v){
    v.muted=true;
    if(GNOFLASH){try{v.pause()}catch(e){}}
    else{var p=v.play();if(p&&p.catch)p.catch(function(){})}
  }
  layoutCalc();
  syncBioCtl();
}
function syncBio(){
  var el=$('layers');if(!el)return;
  if(bioExit)return;
  var active=isBio();
  if(!active){el.hidden=true;el.classList.remove('on','exit','moonfade');bioOn=0;bioMoon=0;return}
  if(!bioOn)bioLv=1;
  bioOn=1;if(bioLv<1)bioLv=1;if(bioLv>7)bioLv=7;
  el.hidden=false;el.classList.add('on');
  if(bioMoon){el.classList.add('exit');el.classList.remove('moonfade');return}
  el.classList.remove('exit','moonfade');
  paintGrain();paintBio(false);
  applyNoflash();
}
function enterMoon(){
  bioMoon=1;
  var el=$('layers');if(!el)return;
  var moon=$('moons');
  if(moon){
    moon.muted=true;
    if(!moon._slot){
      moon._slot=1;
      moon.addEventListener('error',function(){
        if(document.getElementById('moonempty'))return;
        var slot=document.createElement('div');
        slot.id='moonempty';slot.className='empty-slot';
        slot.textContent='no picture of the moon grid';
        el.appendChild(slot);
      });
    }
    var p=moon.play();if(p&&p.catch)p.catch(function(){});
  }
  el.classList.add('exit');
  el.classList.remove('moonfade');
  ui();
}
function bioDeeper(){
  if(bioExit)return true;
  if(!isBio())return false;
  if(bioMoon)return true;
  if(bioLv>=7){enterMoon();return true}
  bioLv++;paintBio(true);ui();return true;
}
function startMoonExit(){
  if(bioExit)return;
  bioExit=1;bioMoon=0;
  var el=$('layers');if(!el){bioExit=0;return}
  var moon=$('moons');
  if(moon){moon.muted=true;var p=moon.play();if(p&&p.catch)p.catch(function(){})}
  el.classList.add('exit');
  setTimeout(function(){el.classList.add('moonfade')},760);
  setTimeout(function(){
    bioExit=0;bioOn=0;bioLv=1;bioMoon=0;
    el.hidden=true;el.classList.remove('on','exit','moonfade');
    cur={lv:1,k:'about',id:null,b:1};
    if(window.GJ_DEPTH)GJ_DEPTH.sync(cur,depthApi());
    arriveAt(cur,false);
  },760+1200);
}
function bioBack(){
  if(bioExit)return true;
  if(!(bioOn&&isBio()))return false;
  if(bioMoon){
    bioMoon=0;
    var el=$('layers');
    if(el)el.classList.remove('exit','moonfade');
    paintBio(true);ui();
    return true;
  }
  if(bioLv>1){bioLv--;paintBio(true);ui();return true}
  startMoonExit();return true;
}
function deeper(x,y){
  if(phase!=='sky')return;
  if(cur.lv===1&&!onBoard()&&CH[cur.k]){
    if(cur.cards)return;
    if(isCardsHit(x,y)){sel=null;go({lv:1,k:'film',id:null,cards:1});return}
    openBoardAt(x,y);return
  }
  var s0=STEP,b0=bioSig();
  if(bioDeeper()){if(STEP===s0&&bioSig()!==b0)pushStep();return}
  if(!window.GJ_DEPTH||GJ_DEPTH.busy())return;
  var d0=depthSig(),c0=JSON.stringify(snap(cur)),snd=GJ_DEPTH.soundOn();
  if(GJ_DEPTH.pinchIn(x,y,depthApi())){
    if(STEP!==s0)return;
    if(GJ_DEPTH.busy()&&depthSig()===d0&&JSON.stringify(snap(cur))===c0){PEND={s:s0,d:d0,c:c0};return}
    if(snd||depthSig()!==d0||JSON.stringify(snap(cur))!==c0)pushStep();
  }
}
function back(){
  if(phase==='land'){enterSky(false);return}
  if(phase==='arrive'||phase==='fly'){dive();return}
  if(cur.lv===0&&!bioOn)return;
  if(history.state&&history.state.u1&&STEP>0){history.back();return}
  stepOut();
}
/* One level out. Every way out (pinch, ‹, Esc, browser Back) arrives here through history.back. */
function stepOut(){
  if(bioBack())return;
  if(window.GJ_DEPTH&&GJ_DEPTH.pinchOut(depthApi()))return;
  if(cur.lv>0){cur={lv:0,k:null,id:null};if(window.GJ_DEPTH)GJ_DEPTH.sync(cur,depthApi());arriveAt(cur,false);ui()}
}
var STEP=0,BTOUCH=null,PEND=null;
function snap(c){return {lv:c.lv,k:c.k,id:c.id,b:c.b?1:0,cards:c.cards?1:0}}
function onBoard(){return cur.lv>=2||(cur.lv===1&&(!!cur.b||cur.k==='progress'))}
function pushStep(){STEP++;HL[STEP]=levelOf(cur);history.pushState({u1:1,cur:snap(cur),n:STEP},'',hashOf(cur))}
/* One source of truth for the level: 0 sky, 1 chapter (MID), 2 board, 3 work. The crumb and the rail both read it. */
var HL={};
function levelOf(c){
  if(!c||!c.lv)return 0;
  if(c.lv>=2||c.id)return 3;
  if(c.b||c.k==='progress'||c.cards)return 2;
  return 1;
}
function canJump(L){
  if(L===0)return levelOf(cur)>0;
  if(L>=levelOf(cur))return false;
  for(var n=STEP-1;n>=0;n--)if(HL[n]===L)return true;
  return false;
}
function jumpLevel(L){
  if(L===0){farHome();return}
  if(L>=levelOf(cur))return;
  for(var n=STEP-1;n>=0;n--)if(HL[n]===L){history.go(n-STEP);return}
}
function crumbNames(label){
  var lv=levelOf(cur),k=cur.k==='progress'?'in progress':cur.k;
  return ['ᑕᐣᓯ',k,cur.cards?'cards':'board',lv===3?label:'work'];
}
var HINTSEEN=false;
function syncHint(){
  var h=$('shint');if(!h)return;
  try{if(sessionStorage.getItem('gj-m4-hint'))HINTSEEN=true}catch(e){}
  var on=!HINTSEEN&&phase==='sky'&&levelOf(cur)===1&&cur.k!=='progress';
  h.hidden=!on&&!h._fading;
  h.classList.toggle('on',on);
  if(on&&!h._t){h._t=setTimeout(function(){seenHint()},9000)}
}
function seenHint(){
  HINTSEEN=true;try{sessionStorage.setItem('gj-m4-hint','1')}catch(e){}
  var h=$('shint');if(!h)return;
  clearTimeout(h._t);h.classList.remove('on');h._fading=1;
  setTimeout(function(){h._fading=0;h.hidden=true},1300);
}
/* The middle-view hint takes the lowest slot in the sky that has no star, orb or print under it, and waits invisibly when no slot is free. */
function placeHint(){
  var h=$('shint');if(!h||h.hidden||!h.classList.contains('on')&&!h._fading)return;
  if(!isMid()||!CH[cur.k])return;
  var c=CH[cur.k];
  if(h._home==null||h._H!==H||h._W!==W){
    h.style.top='';h.style.bottom='';
    var r0=h.getBoundingClientRect();
    h._home=r0.top;h._h=r0.height;h._H=H;h._W=W;h._x0=r0.left;h._x1=r0.right;
    h.style.bottom='auto';h.style.top=h._home+'px';h._y=h._home;
  }
  var boxes=[];
  var list=(cur.k==='objects'?c.items:c.skyItems).slice();
  list.forEach(function(it){
    if(it.in_progress&&cur.k!=='objects')return;
    if(it._mr){boxes.push([it._mr[0]-8,it._mr[1]-8,it._mr[0]+it._mr[2]+8,it._mr[1]+it._mr[3]+8])}
    else{var q=sp(posOf(it)[0],posOf(it)[1]);boxes.push([q[0]-24,q[1]-24,q[0]+24,q[1]+24])}
  });
  if(cur.k==='sound')c.dec.forEach(function(d){var q=sp(d.x,d.y);boxes.push([q[0]-14,q[1]-14,q[0]+14,q[1]+14])});
  if(cur.k==='film'&&cardsStar){
    var q=sp(cardsStar.sx,cardsStar.sy);boxes.push([q[0]-22,q[1]-22,q[0]+22,q[1]+22]);
    if(cardsStar._ml){var L=cardsStar._ml;boxes.push([L[0]-8,L[1]-8,L[0]+L[2]+8,L[1]+L[3]+8])}
  }
  function free(y){
    var y1=y+h._h;
    for(var i=0;i<boxes.length;i++){var b=boxes[i];if(b[0]<h._x1&&h._x0<b[2]&&b[1]<y1&&y<b[3])return false}
    return true;
  }
  var top=92+(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--st'))||0);
  var y=h._y;
  if(!free(y)){
    y=null;
    for(var t=h._home;t>=top;t-=8)if(free(t)){y=t;break}
  }
  if(y==null){h.classList.add('clash')}
  else{h.classList.remove('clash');if(y!==h._y){h._y=y;h.style.top=y+'px'}}
}
function syncCrumb(label){
  var cr=$('wcrumb'),rl=$('wrail'),bar=$('bar');if(!cr||!rl)return;
  var lv=levelOf(cur),show=phase==='sky'&&lv>0;
  cr.hidden=rl.hidden=!show;
  document.documentElement.classList.toggle('wc',show);
  if(!show)return;
  var nm=crumbNames(label),i,h='',r='';
  for(i=0;i<=lv;i++){
    var here=i===lv,can=!here&&canJump(i);
    if(i)h+='<i aria-hidden="true">›</i>';
    if(i===0)h+='<button type="button" class="sig" lang="cr" data-lv="0" aria-label="the whole sky">ᑕᐣᓯ</button>';
    else if(here)h+='<b aria-current="page">'+esc(nm[i])+'</b>';
    else h+=can?'<button type="button" data-lv="'+i+'">'+esc(nm[i])+'</button>':'<span>'+esc(nm[i])+'</span>';
  }
  for(i=0;i<4;i++){
    var cls=i===lv?'here':i<lv?'up':'',tap=i<lv&&canJump(i);
    r+='<li class="'+cls+(tap?' tap':'')+'"'+(tap?' data-lv="'+i+'"':'')+'><span'+(tap?' role="button" tabindex="0"':'')+' aria-label="'+esc(i===0?'sky':nm[i])+(i===lv?' (here)':'')+'">'+esc(i===0?'sky':nm[i])+'</span></li>';
  }
  var key=h+'|'+r;
  if(cr._key!==key){cr._key=key;cr.innerHTML=h;rl.innerHTML='<ol>'+r+'</ol>'}
  var bb=bar?bar.getBoundingClientRect():null;
  cr.style.top=Math.max(40,Math.round(bb?bb.bottom-6:46))+'px';
}
function syncHist(){
  if(PEND&&window.GJ_DEPTH){
    if(STEP!==PEND.s)PEND=null;
    else if(depthSig()!==PEND.d||JSON.stringify(snap(cur))!==PEND.c){PEND=null;pushStep();return}
  }
  var h=history.state;if(!h||!h.u1||h.n!==STEP)return;
  var want=hashOf(cur);
  HL[STEP]=levelOf(cur);
  if(location.hash!==want||JSON.stringify(h.cur)!==JSON.stringify(snap(cur)))history.replaceState({u1:1,cur:snap(cur),n:STEP},'',want);
}
function bioSig(){return bioOn+':'+bioLv+':'+bioMoon}
function depthSig(){var s=GJ_DEPTH.state();return [s.film,s.scale,s.board,s.fine,s.work,s.piece,s.sound].join('|')}
function onPop(e){
  var st=e.state;
  if(!st||!st.u1){
    seed(parseHash(location.hash));
    if(phase!=='sky')enterSky(true);else arriveAt(cur,false);
    return;
  }
  var n=st.n||0,c=st.cur||{lv:0,k:null,id:null};
  if(n<STEP){
    var one=STEP-n===1;STEP=n;
    if(one&&JSON.stringify(c)===JSON.stringify(snap(cur))){stepOut();ui();return}
    if(one&&isBio()&&c.lv===1&&c.k==='about'){bioBack();return}
  }else STEP=n;
  cur={lv:c.lv,k:c.k,id:c.id,b:c.b?1:0,cards:c.cards?1:0};sel=null;
  if(window.GJ_DEPTH)GJ_DEPTH.sync(cur,depthApi());
  if(phase!=='sky')enterSky(true);
  arriveAt(cur,false);
}
/* MID: the chapter's stars, bloomed into titled thumbnails in place. A pinch or tap there pushes the same camera on to the board. */
function midItems(){
  var c=CH[cur.k];if(!c)return [];
  return c.skyItems;
}
function midHit(x,y){
  if(cur.k==='film'&&cardsStar&&cardsStar._mr&&!cur.cards){
    var cq=sp(cardsStar.sx,cardsStar.sy),hw=18,hh=22,r=cardsStar._mr,l=cardsStar._ml;
    if(r){hw=Math.max(hw,r[2]/2+8);hh=Math.max(hh,r[3]/2+12)}
    var hitS=Math.abs(cq[0]-x)<=hw&&Math.abs(cq[1]-y)<=hh;
    if(!hitS&&l)hitS=x>=l[0]-6&&x<=l[0]+l[2]+6&&y>=l[1]-6&&y<=l[1]+l[3]+6;
    if(hitS)return {type:'work',k:'film',id:'film/cards',prog:0};
  }
  var best=null,bd=1e9;
  midItems().forEach(function(it){
    var p=posOf(it),q=sp(p[0],p[1]),hw=Math.max(14,(it.tw||20)*rest.s/2),hh=Math.max(14,(it.th||20)*rest.s/2+10);
    if(Math.abs(q[0]-x)<=hw&&Math.abs(q[1]-y)<=hh){var d=Math.hypot(q[0]-x,q[1]-y);if(d<bd){bd=d;best=it}}
  });
  return best?{type:'work',k:cur.k,id:best.id,prog:0}:null;
}
function openBoardAt(x,y){
  var h=(typeof x==='number')?midHit(x,y):null;
  var focus=h?h.id:(sel&&sel.id);
  var w=(typeof x==='number')?wp(x,y):[rest.x,rest.y];
  BTOUCH={k:cur.k,x:w[0],y:w[1]};
  go({lv:1,k:cur.k,id:null,b:1});
  if(focus){
    var spec=gridSpec(boardKey()),items=boardItems(),i;
    for(i=0;i<items.length;i++)if(items[i].id===focus){
      var rc=tileRect(spec,i,0),top=rc.y-spec.y0-spec.head;
      aim(scr,clamp(top-spec.winH*.3,0,spec.maxSc),false);
      sel={type:'work',k:cur.k,id:focus,prog:0};
      break;
    }
  }
}
function farHome(){
  if(cur.lv===0)return;
  if(history.state&&history.state.u1&&STEP>0){history.go(-STEP);return}
  cur={lv:0,k:null,id:null};if(window.GJ_DEPTH)GJ_DEPTH.sync(cur,depthApi());arriveAt(cur,false);ui();
}

function go(next){
  if(window.GJ_INNER)GJ_INNER.reset();
  cur=next;sel=null;
  if(window.GJ_DEPTH)GJ_DEPTH.sync(cur,depthApi());
  if(phase!=='sky')enterSky(true);
  pushStep();
  arriveAt(cur,false);
}
function hashOf(c){
  if(!c||c.lv===0)return '#/';
  if(c.cards)return '#film/cards';
  if(c.k==='progress'&&c.lv===1)return '#progress';
  if(c.k==='progress'&&c.id&&byId[c.id])return '#progress/'+byId[c.id].slug;
  if(c.lv===1&&c.b&&c.id&&byId[c.id])return '#'+byId[c.id].chapter+'/'+byId[c.id].slug;
  if(c.lv===1&&c.b)return '#'+c.k+'/board';
  if(c.lv===1)return '#'+c.k;
  if(c.id&&byId[c.id])return '#'+byId[c.id].chapter+'/'+byId[c.id].slug;
  return '#/';
}
/* fable-m4: one door per chapter landing (lv1, not the board): Objects -> objects-3d/ (lit specimen viewer);
 Photo -> ../photo-lab/ (the Horizon room with the contact sheet, the lab root; no other lab rooms are linked). */
function syncDoors(){
  var doors={objects:'gobj3d',photo:'gphoto'},k;
  for(k in doors){var el=$(doors[k]);if(!el)continue;
    var on=phase==='sky'&&cur.lv===1&&cur.k===k&&!cur.b&&!cur.cards&&!(window.GJ_DEPTH&&GJ_DEPTH.soundOn());
    if(el.hidden===on)el.hidden=!on}
}
function ui(){
  syncHist();
  syncDoors();
  var back=$('back'),where=$('where');
  back.hidden=cur.lv===0;
  document.documentElement.classList.toggle('mapdim',onBoard()||!!cur.cards||(bioOn&&isBio()));
  document.documentElement.classList.toggle('deep',cur.lv>0&&!(bioOn&&isBio()));
  var foot=$('foot');if(foot)foot.hidden=phase==='sky'||phase==='fly';
  var label='the sky';
  if(window.GJ_DEPTH&&GJ_DEPTH.soundOn())label='sound';
  else if(cur.k==='progress')label='in progress';
  else if(cur.k)label=cur.k+(cur.cards?' · cards':(cur.lv===1&&cur.b?' · board':''));
  if(window.GJ_DEPTH){
    var db=GJ_DEPTH.board();
    if(db&&db.work&&!GJ_DEPTH.soundOn())label=db.work.title;
    var dst=GJ_DEPTH.state();
    if(dst&&dst.label)label=dst.label;
  }
  if(bioOn&&isBio())label=bioMoon?'about · moon':'about · '+bioLv;
  if(cur.lv===2&&cur.id&&byId[cur.id]&&!(window.GJ_DEPTH&&GJ_DEPTH.soundOn())&&!(bioOn&&isBio())){
    var nm=byId[cur.id].title||'';
    if(!(/^photograph\s+\d+$/i.test(nm)||nm==='untitled'))label=nm;
  }
  if(window.GJ_DEPTH){var named=GJ_DEPTH.state();if(named&&named.label)label=named.label}
  where.textContent=label;
  syncCrumb(label);
  syncHint();
  var bar=$('bar');if(bar)bar.classList.toggle('bio',!!(bioOn&&isBio()));
  stage.setAttribute('aria-label',label);
  syncHire();
}
function openReel(){
  var it=byId['film/demo-reel']||byId['film/reel-2026'];
  if(!it)return;
  go({lv:2,k:'film',id:it.id});
}
function fillAbout(){
  var box=$('aprobio'),list=$('astars');if(!box||!list||box._filled)return;
  var mail=data.email||'imjamesgill@gmail.com';
  var paras=(data.bio||[]).map(function(p){return '<p>'+esc(p)+'</p>'}).join('');
  box.innerHTML='<p class="label">Cinematographer + Artist + Spatial Designer</p>'+paras+
    '<p class="pills"><a class="lk" href="mailto:'+esc(mail)+'">'+esc(mail)+'</a><a class="lk" href="https://www.joioco.com" rel="noopener">joio.co ↗</a></p>';
  var bio=byId['about/bio'],poem=byId['about/poem'];
  var rows=[
    {jx:'1px',id:'about/bio',title:'bio',small:(bio&&bio.meta)||'',go:'bio'},
    {jx:'27px',title:mail,small:'contact',href:'mailto:'+mail},
    {jx:'36px',title:'joio.co',small:'ceramics shop ↗',href:'https://www.joioco.com'},
    {jx:'26px',id:'about/poem',title:'the poem',small:poem&&poem.meta?poem.meta:'15 lines · ᑕᐣᓯ',go:'poem'}
  ];
  list.innerHTML=rows.map(function(r){
    var inn='<i class="dot" aria-hidden="true"></i><b>'+esc(r.title)+'</b><small>'+esc(r.small)+'</small>';
    if(r.href)return '<li><a style="--jx:'+r.jx+'" href="'+esc(r.href)+'"'+(r.href.indexOf('http')===0?' rel="noopener"':'')+'>'+inn+'</a></li>';
    return '<li><button type="button" style="--jx:'+r.jx+'" data-go="'+r.go+'">'+inn+'</button></li>';
  }).join('');
  list.querySelectorAll('button').forEach(function(b){
    b.addEventListener('click',function(e){
      e.stopPropagation();
      if(b.getAttribute('data-go')==='poem')go({lv:2,k:'about',id:'about/poem'});
      else {var card=$('aprobio');if(card)card.scrollIntoView({block:'start'})}
    });
  });
  box._filled=1;
}
function paintAbout(){
  var el=$('apro');if(el)el.hidden=true;
}
function syncExtras(){
  var proof=$('proof');
  if(proof){
    var on=PROOF&&phase==='sky';
    proof.hidden=!on;
    if(on)proof.style.opacity=String(Math.max(0,Math.min(1,farA())));
  }
  drawMap();
  tuckMap();
  paintAbout();
}
/* On the Weird Kid page the map sits in the gap beside the credits, under the hero and above the gallery. */
function tuckMap(){
  var btn=$('mmap');if(!btn)return;
  var sheet=document.querySelector('#layer .sheet.film.lv1.wk');
  var c=sheet&&sheet.querySelector('.credits'),w=sheet&&sheet.querySelector('.framewall'),hero=sheet&&sheet.querySelector('.heroframe');
  if(!sheet||!c||!w||!hero||innerWidth>=innerHeight){
    if(btn._tucked){btn.style.top='';btn.style.height='';btn.style.width='';btn._tucked=0}
    return;
  }
  var ct=c.getBoundingClientRect(),wt=w.getBoundingClientRect(),ht=hero.getBoundingClientRect();
  if(ct.top<ht.bottom-2||wt.top-ct.top<52){
    if(btn._tucked){btn.style.top='';btn.style.height='';btn.style.width='';btn._tucked=0}
    return;
  }
  var h=Math.min(72,wt.top-ct.top-6);
  btn.style.bottom='auto';btn.style.top=Math.round(ct.top)+'px';
  btn.style.height=Math.round(h)+'px';btn.style.width=Math.round(h*.72)+'px';
  btn._tucked=1;
}
function drawMap(){
  var btn=$('mmap'),cv=$('mmapc');if(!btn||!cv)return;
  var show=phase==='sky'&&!(bioOn&&isBio())&&!cur.cards;
  btn.hidden=!show;if(!show)return;
  var b={x0:1e9,y0:1e9,x1:-1e9,y1:-1e9};
  function inc(x,y){b.x0=Math.min(b.x0,x);b.x1=Math.max(b.x1,x);b.y0=Math.min(b.y0,y);b.y1=Math.max(b.y1,y)}
  ORDER.forEach(function(k){var c=CH[k];inc(c.x+c.ex.x0,c.y+c.ex.y0);inc(c.x+c.ex.x1,c.y+c.ex.y1)});
  cluster.forEach(function(it){inc(it.cx,it.cy)});
  inc(-20,-20);inc(20,20);
  var cw=76,ch=100,pad=8,sc=Math.min((cw-pad*2)/(b.x1-b.x0||1),(ch-pad*2)/(b.y1-b.y0||1));
  function M(x,y){return [pad+(x-b.x0)*sc,pad+(y-b.y0)*sc]}
  var g2=cv.getContext('2d');cv.width=cw*2;cv.height=ch*2;g2.setTransform(2,0,0,2,0,0);
  g2.clearRect(0,0,cw,ch);
  g2.strokeStyle='rgba(214,226,236,.2)';g2.lineWidth=1;
  ORDER.forEach(function(k){var c=CH[k],o=M(0,0),p=M(c.x,c.y);g2.beginPath();g2.moveTo(o[0],o[1]);g2.lineTo(p[0],p[1]);g2.stroke()});
  cluster.forEach(function(it){var p=M(it.cx,it.cy);g2.fillStyle='rgba(255,236,205,.7)';g2.fillRect(p[0]-1.2,p[1]-1.2,2.4,2.4)});
  ORDER.forEach(function(k){var p=M(CH[k].x,CH[k].y);g2.fillStyle='rgba(232,238,245,.9)';g2.beginPath();g2.arc(p[0],p[1],2.4,0,7);g2.fill()});
  var corners=[wp(0,64),wp(W,64),wp(W,H),wp(0,H)].map(function(p){return M(p[0],p[1])});
  g2.strokeStyle='rgba(232,238,245,.85)';
  g2.beginPath();corners.forEach(function(p,i){if(i)g2.lineTo(p[0],p[1]);else g2.moveTo(p[0],p[1])});g2.closePath();g2.stroke();
  var pct=Math.round((rest.s||.3)*100);
  g2.fillStyle='rgba(232,238,245,.8)';g2.font='10px Poppins,sans-serif';g2.textAlign='center';
  g2.fillText(pct+'%',cw/2,ch-6);
  btn._map={b:b,pad:pad,sc:sc};
}
function jumpMap(e){
  var btn=$('mmap');if(!btn||!btn._map)return;
  var m=btn._map,r=btn.getBoundingClientRect();
  var wx=m.b.x0+(e.clientX-r.left-m.pad)/m.sc;
  var wy=m.b.y0+(e.clientY-r.top-m.pad)/m.sc;
  var best=null,bd=1e9;
  ORDER.forEach(function(k){var c=CH[k],d=Math.hypot(c.x-wx,c.y-wy);if(d<bd){bd=d;best=k}});
  if(best&&bd<180)go({lv:1,k:best,id:null});
  else {cxS.t=wx;cyS.t=wy}
}
function syncHire(){
  var b=$('hire'),c=$('hirecard');if(!b)return;
  var show=phase==='sky';
  b.hidden=!show;
  if(!show&&c){c.hidden=true;b.setAttribute('aria-expanded','false')}
}
function hireOpen(open){
  var b=$('hire'),c=$('hirecard');if(!b||!c)return;
  c.hidden=!open;b.setAttribute('aria-expanded',open?'true':'false');
}

/* ---------- arrival, landing ---------- */
function fillPoem(){
  var el=$('poem');
  var letters='gill james'.split('').map(function(ch,i){
    return '<i style="animation-delay:'+(i*0.16).toFixed(2)+'s">'+(ch===' '?'&nbsp;':ch)+'</i>';
  }).join('');
  var lines=(data.poem||[]).map(function(l){return '<span>'+esc(l).replace(/ (\S+)$/,'&nbsp;$1')+'</span>'}).join('');
  el.innerHTML='<span class="wm"><span class="gj fade">'+letters+'</span></span><span id="typed">'+lines+'</span><span class="sig" lang="cr">ᑕᐣᓯ</span>';
}
function dust(){
  var d=$('dust'),h='';
  for(var i=0;i<16;i++)h+='<i style="left:'+(rnd(i)*100).toFixed(1)+'%;top:'+(rnd(i+9)*100).toFixed(1)+'%;opacity:'+(0.2+rnd(i+3)*.6).toFixed(2)+'"></i>';
  d.innerHTML=h;
}
/* fable-m4: the Film cards board's cards (from 's openCards): Weird Kid first, then the preview-cards order.
 To Go carries its muted preview clip and its song (play button only, never autoplayed). The old momo-480 loop tile is
 left out (only the momo2 v3 rising art is approved). Missing ids are skipped. */
function openCards(){
  var ids=['film/weird-kid','sound/to-go','film/one-with-the-devil','objects/hand-carved-piece','film/sleepwalker','film/repeat-feat-jessie-reyez'];
  return ids.map(function(id){
    var it=byId[id];if(!it)return null;var m=it.media||{};
    var c={id:id,title:it.title,role:it.role||'',meta:it.meta||'',still:m.big||m.thumb||'',clip:m.pv||m.clip||'',kind:it.chapter==='sound'?'sound':it.chapter==='film'?'film':'object',portrait:m.h>m.w};
    if(id==='film/weird-kid'){c.clip='media/v3/media/pv/22-card.mp4';c.still='media/v3/media/pv/22-card.webp'}
    if(id==='film/repeat-feat-jessie-reyez'){c.clip='media/v3/media/pv/16-card.mp4';c.still='media/v3/media/pv/16-card.webp'}
    if(id==='sound/to-go'){c.clip='media/v3/media/pv/to-go.mp4';c.still='media/v3/media/pv/to-go.webp';c.audio='media/pro2/audio/to-go.mp3'}
    return c;
  }).filter(Boolean);
}
function landFrames(){
  function src(id){var it=byId[id];return it&&it.media&&(it.media.big||it.media.thumb)||''}
  return [
    {src:src('film/one-with-the-devil'),cap:'One With the Devil'},
    {src:src('film/weird-kid'),cap:'Weird Kid'},
    {src:src('objects/hand-carved-piece'),cap:'hand-carved piece'},
    {src:src('sound/to-go'),cap:'To Go'}
  ];
}
function setChrome(){
  var on=phase==='arrive'||phase==='fly';
  $('water').classList.toggle('on',on);
  $('moon').classList.toggle('on',phase==='arrive');
  $('path').classList.toggle('on',phase==='arrive');
  $('horizon').classList.toggle('on',phase==='arrive');
  $('dust').classList.toggle('on',phase==='arrive'||phase==='sky');
  $('poem').classList.toggle('on',phase==='arrive');
  $('dive').classList.toggle('on',phase==='arrive');
  if(phase==='arrive')armArrival();else disarmArrival();
  $('bar').classList.toggle('on',phase==='sky');
  $('land').classList.toggle('on',phase==='land');
  syncHire();
}
var landTok=0;
function showLand(){
  var L=lands[landI]||lands[0];
  var img=$('landimg');
  var tok=++landTok;
  var live=img.getAttribute('src')&&$('land').classList.contains('on');
  function paint(){
    if(tok!==landTok)return;
    img.src=L.src;img.alt=L.cap;$('landcap').textContent=L.cap;
    img.style.opacity='1';
  }
  if(live){img.style.opacity='0';setTimeout(paint,320)}
  else paint();
  setChrome();
}
function nextLand(){
  if(landI>=lands.length-1){enterSky(false);return}
  landI++;landT=now();showLand();
}
function seenKey(){
  var p=location.pathname.replace(/index\.html$/,'');
  if(p.slice(-1)!=='/')p=p.replace(/\/[^/]*$/,'/');
  return 'seen:'+p;
}
var SKIPPING=0;
function skipToSky(){
  if(phase!=='arrive'||SKIPPING)return;
  SKIPPING=1;
  try{sessionStorage.setItem(seenKey(),'1')}catch(e){}
  var v=document.createElement('div');
  v.style.cssText='position:fixed;inset:0;z-index:50;background:#04070b;opacity:0;pointer-events:none;transition:opacity .15s linear';
  document.body.appendChild(v);
  void v.offsetWidth;v.style.opacity='1';
  setTimeout(function(){
    enterSky(true);
    v.style.transition='opacity .25s linear';v.style.opacity='0';
    setTimeout(function(){if(v.parentNode)v.parentNode.removeChild(v);SKIPPING=0},300);
  },150);
}
function dive(){
  if(phase!=='arrive'&&phase!=='fly')return;
  try{sessionStorage.setItem(seenKey(),'1')}catch(e){}
  if(phase==='fly'){enterSky(true);return}
  phase='fly';flyT=now();flyU=0;setChrome();
  ripples();
  if(window.GJ_DEPTH)GJ_DEPTH.burst();
}
function rippleAt(x,y){
  var w=$('water');if(!w)return;
  var s=document.createElement('i');s.className='rip';
  s.style.left=x+'px';s.style.top=y+'px';
  w.appendChild(s);
  setTimeout(function(){if(s.parentNode)s.parentNode.removeChild(s)},1600);
}
function ripples(){
  var w=$('water');if(!w)return;
  var r=w.getBoundingClientRect();
  for(var i=0;i<3;i++)rippleAt(r.width*(0.46+i*0.06),r.height*(0.62+i*0.02));
}
function enterSky(instant){
  var from=phase;
  phase='sky';
  if(from==='arrive'||from==='fly'||from==='land')SKYIN.t0=now();else skyIntroEnd();
  try{sessionStorage.setItem(seenKey(),'1')}catch(e){}
  setChrome();
  if(!history.state||!history.state.u1){STEP=0;HL[0]=0;history.replaceState({u1:1,cur:snap(cur),n:0},'',hashOf(cur))}
  arriveAt(cur,instant);
}
function decide(){
  var hash=location.hash||'';
  var deep=hash&&hash!=='#'&&hash!=='#/';
  var seen=false;try{seen=sessionStorage.getItem(seenKey())==='1'}catch(e){}
  var forceArrive=Q.get('arrive')==='1';
  var forceSky=Q.get('sky')==='1'||Q.get('arrive')==='0';
  var forceLand=Q.get('land')==='1';
  if(deep){
    var st=parseHash(hash);seed(st);enterSky(true);return;
  }
  if(forceSky){cur={lv:0,k:null,id:null};enterSky(true);return}
  if(forceLand){phase='land';landI=0;landT=now()+1e9;showLand();return}
  if(forceArrive||!seen){phase='arrive';setChrome();return}
  cur={lv:0,k:null,id:null};enterSky(true);
}
function parseHash(h){
  h=(h||'').replace(/^#\/?/,'').split('?')[0];
  if(!h)return {lv:0,k:null,id:null};
  var b=h.split('/').filter(Boolean);
  if(b[0]==='progress'){
    if(!b[1])return {lv:1,k:'progress',id:null};
    var it=progress.filter(function(p){return p.slug===b[1]})[0];
    return {lv:it?2:1,k:'progress',id:it?it.id:null};
  }
  if(!CH[b[0]])return {lv:0,k:null,id:null};
  if(!b[1])return {lv:1,k:b[0],id:null};
  if(b[1]==='board')return {lv:1,k:b[0],id:null,b:1};
  if(b[0]==='film'&&b[1]==='cards')return {lv:1,k:'film',id:null,cards:1};
  var card=CH[b[0]].items.filter(function(it){return it.slug===b[1]})[0]||byId[b[0]+'/'+b[1]]||byId[b[0]+'/track/'+b[1]];
  return {lv:card?2:1,k:b[0],id:card?card.id:null};
}
function seed(st){
  var chain=[{lv:0,k:null,id:null}];
  if(st.lv>=1&&st.k!=='progress')chain.push({lv:1,k:st.k,id:null,b:0});
  if(st.lv>=2||st.k==='progress'||st.b)chain.push({lv:1,k:st.k,id:null,b:1});
  if(st.cards)chain.push({lv:1,k:'film',id:null,cards:1});
  if(st.lv>=2)chain.push({lv:2,k:st.k,id:st.id,b:0});
  HL={};HL[0]=0;
  history.replaceState({u1:1,cur:chain[0],n:0},'',hashOf(chain[0]));
  for(var i=1;i<chain.length;i++){HL[i]=levelOf(chain[i]);history.pushState({u1:1,cur:chain[i],n:i},'',hashOf(chain[i]))}
  STEP=chain.length-1;
  cur=chain[chain.length-1];
  if(window.GJ_DEPTH)GJ_DEPTH.sync(cur,depthApi());
}

/* Open delay stretches the water and moon fade with the fallback, so the mark still waits for them. 1 removes the override. */
function applyFlash(){
  GFL=clamp(TUNE.flash,0,1);TUNE.flash=GFL;applyCtl();
  try{localStorage.setItem('gj.flash',String(GFL))}catch(e){}
}
function glitchLabel(v){
  v=clamp(v,0,1);
  if(v<=0)return 'off';
  if(Math.abs(v-1)<0.005)return 'full';
  return Math.round(v*100)+'%';
}
function syncBioCtl(){
  var root=$('bioctl'),btn=$('bioflash'),sl=$('bioglitch'),lab=$('bioglitchv');
  if(!root)return;
  var show=!!(bioOn&&isBio()&&!bioMoon&&!bioExit);
  root.hidden=!show;
  if(btn){
    btn.setAttribute('aria-pressed',GNOFLASH?'true':'false');
    btn.textContent='Stop flashing';
  }
  if(sl&&document.activeElement!==sl)sl.value=String(Math.round(clamp(GGL,0,1)*100));
  if(lab)lab.textContent=glitchLabel(GGL);
}
function applyNoflash(){
  document.documentElement.classList.toggle('gj-noflash',!!GNOFLASH);
  var v=$('calc'),moon=$('moons');
  if(GNOFLASH){
    if(v)try{v.pause()}catch(e){}
    if(moon)try{moon.pause()}catch(e){}
    GL.needStill=1;GL.still=0;
  }else{
    GL.still=0;GL.holdT=null;GL.needStill=0;
    if(bioOn&&isBio()&&!bioMoon&&v){v.muted=true;var p=v.play();if(p&&p.catch)p.catch(function(){})}
    if(bioMoon&&moon){moon.muted=true;var q=moon.play();if(q&&q.catch)q.catch(function(){})}
  }
  syncBioCtl();
}
function applyGlitch(){
  GGL=clamp(GGL,0,1);
  document.documentElement.style.setProperty('--glitch',String(GGL));
  if(GNOFLASH){GL.still=0;GL.needStill=1}
  syncBioCtl();
}
function setNoflash(on){
  GNOFLASH=!!on;
  try{localStorage.setItem('gj.noflash',GNOFLASH?'1':'0')}catch(e){}
  applyNoflash();
}
function setGlitch(v){
  var n=+v;GGL=isFinite(n)?clamp(n,0,1):1;
  try{localStorage.setItem('gj.glitch',String(GGL))}catch(e){}
  applyGlitch();
}
function wireBioCtl(){
  var root=$('bioctl'),btn=$('bioflash'),sl=$('bioglitch');
  if(root&&!root._wired){
    root._wired=1;
    ['pointerdown','pointerup','touchstart','touchend','click','wheel'].forEach(function(ev){
      root.addEventListener(ev,function(e){e.stopPropagation()});
    });
  }
  if(btn&&!btn._wired){
    btn._wired=1;
    btn.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();setNoflash(!GNOFLASH)});
  }
  if(sl&&!sl._wired){
    sl._wired=1;
    sl.addEventListener('input',function(e){e.stopPropagation();setGlitch(sl.value/100)});
  }
  syncBioCtl();
}
window.GJ_BIOCTL={
  noflash:function(){return !!GNOFLASH},
  setNoflash:setNoflash,
  glitch:function(){return GGL},
  setGlitch:setGlitch,
  sync:syncBioCtl
};
applyCtl();
applyGlitch();
applyNoflash();
function applyDelay(){
  var dly=tk('delay'),de=document.documentElement;
  if(dly===1)de.style.removeProperty('--gj-delay');
  else de.style.setProperty('--gj-delay',String(dly));
  if(ARR.on&&!ARR.done){
    clearTimeout(ARR.tm);
    ARR.tm=setTimeout(function(){ARR.wd=ARR.md=1;arrBegin()},1250*dly);
  }
}
/* The debug panel is the only caller. A multiplier left at 1 is the sky as written. Flash defaults to the player's 0.6. */
window.GJ_TUNE={
  get:function(k){return k==='flash'?GFL:tk(k)},
  values:function(){var o={};Object.keys(TDEF).forEach(function(k){o[k]=k==='flash'?GFL:TUNE[k]});return o},
  defaults:function(){var o={};Object.keys(TDEF).forEach(function(k){o[k]=TDEF[k]});return o},
  set:function(patch){
    if(!patch)return;
    var spatial=false,delay=false,flash=false;
    Object.keys(patch).forEach(function(k){
      if(!(k in TDEF))return;
      var v=+patch[k];if(!isFinite(v))return;
      TUNE[k]=v;
      if(SPATIAL[k])spatial=true;
      if(k==='delay')delay=true;
      if(k==='flash')flash=true;
    });
    if(spatial&&ready){layout();arriveAt(cur,true)}
    if(delay)applyDelay();
    if(flash)applyFlash();
  },
  reset:function(){
    Object.keys(TDEF).forEach(function(k){TUNE[k]=TDEF[k]});
    applyDelay();applyFlash();
    if(ready){layout();arriveAt(cur,true)}
  }
};
window.__u1={
  get phase(){return phase},get cur(){return snap(cur)},get step(){return STEP},
  get sel(){return sel},get ready(){return ready},
  get bloom(){return bloom},
  get bst(){return JSON.parse(JSON.stringify(BST))},
  get zoom(){return window.GJ_DEPTH?GJ_DEPTH.state():(window.GJ_INNER?GJ_INNER.state():{step:0})},
  pinchIn:function(x,y){deeper(x,y)},
  pinchOut:function(){back()},
  open:function(id){var it=byId[id];if(!it)return;go({lv:2,k:it.chapter,id:it.id})},
  get bio(){return {on:bioOn?1:0,lv:bioLv,exit:bioExit?1:0}},
  setBioLv:function(n){n=Math.round(+n);if(!isFinite(n)||!isBio()||bioExit)return;bioLv=clamp(n,1,7);bioMoon=0;var el=$('layers');if(el)el.classList.remove('exit','moonfade');paintBio(false);ui();},
  byId:function(id){return byId[id]},
  get map(){return {s:+rest.s.toFixed(3),prog:progress.map(function(it){var q=sp(it.cx,it.cy);return {t:it.title,x:Math.round(q[0]),y:Math.round(q[1])}}),ch:ORDER.map(function(k){var q=sp(CH[k].x,CH[k].y);return {k:k,x:Math.round(q[0]),y:Math.round(q[1])}})}},
  get mid(){if(cur.lv!==1||onBoard())return null;return midItems().map(function(it){var p=posOf(it),q=sp(p[0],p[1]);return {id:it.id,t:it.title,x:Math.round(q[0]),y:Math.round(q[1]),r:it._mr||null,l:it._ml||null}})},
  get cardsStar(){if(!cardsStar)return null;var q=sp(cardsStar.sx,cardsStar.sy);return {id:cardsStar.id,t:cardsStar.title,x:Math.round(q[0]),y:Math.round(q[1]),r:cardsStar._mr||null,l:cardsStar._ml||null,on:!!(cur.cards||(window.GJ_OPEN&&GJ_OPEN.board))}},
  get rects(){if(cur.lv<1||!onBoard())return null;var spec=gridSpec(boardKey());return {key:spec.key,cap:spec.cap,win:[spec.x0,spec.y0,spec.w,spec.winH],rects:boardItems().map(function(it,i){var t=spec.rects?spec.rects[i]:null;return t?{x:t.x,y:t.y+(spec.key==='objects'?(i%3)*3:0),w:t.w,h:t.h,a:spec.key==='photo'?((i%5)-2)*0.025:0,cap:!!(it._cap||it.title)}:null})}},
  get tiles(){if(cur.lv<1)return [];var spec=gridSpec(boardKey()),items=boardItems();return items.map(function(it,i){var rc=tileRect(spec,i,scr.x);return {id:it.id,t:it.title,x:Math.round(rc.x+rc.w/2),y:Math.round(rc.y+rc.h/2)}})}
};

window.__depth={
  tune:DZ,
  state:function(){
    var z=depthZoom(),r3=function(v){return +(+v).toFixed(3)};
    return {
      z:r3(z),hop:r3(HOP),view:[W,H],unit:fieldUnit(),pops:POPW+POPA,popsWrap:POPW,popsAppear:POPA,frames:FN,
      cam:{x:+rest.x.toFixed(1),y:+rest.y.toFixed(1),s:r3(rest.s)},
      layers:FIELD.map(function(L){
        var v=layerView(L),c=v.cyc-Math.floor(v.cyc);
        return {f:L.f,n:v.n,near:L.near,scale:r3(v.scale),slide:r3(v.slide),alpha:r3(v.alpha),cycle:r3(v.cyc),spreadMean:r3(L.pts.reduce(function(s,p){var q=p.ph+v.cyc;q-=Math.floor(q);return s+Math.pow(DZ.E,q)},0)/L.pts.length),offset:[+v.ox.toFixed(1),+v.oy.toFixed(1)],margin:+v.M.toFixed(1),sizeUnit:r3(v.su),maxDotPx:r3(2*v.su*v.scale*L.pts.reduce(function(m,p){return Math.max(m,p.r)},0))};
      })
    };
  },
  goTo:function(name){
    var k=String(name||'').toLowerCase();
    if(k==='far'||k==='sky'){go({lv:0,k:null,id:null});return this.state()}
    if(!CH[k])return this.state();
    go({lv:1,k:k,id:null});
    return this.state();
  }
};

fetch('data.json').then(function(r){return r.json()}).then(boot).catch(function(err){
  var w=$('where');if(w)w.textContent='could not read the works';
  console.error(err);
});
})();
