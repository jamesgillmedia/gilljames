/* proto-shell · the constellation and sky renderer (canvas 2D, no build). Built to /workspace/share/proto-standards-1112.
   Layout = the m4 sky as written (c9621b3 tonight/fable-m4/js/sky.js): placeChapter (each figure sized by its own work count,
   works placed on the brightest stars first, the rest on a hex grid), chapterAt on ANG/ANGP, the rx/ry growth loop that keeps
   the centre and the names clear, bbox, FAR fit (W-28 by H-78-36), map / stars spread after the fit. TDEF map 1.3, stars 1.2.
   Depth = the 4:45 blend (constellation-blend/blend.js): far field 1100 stars at z 0.18 + pow(r,1.6)*0.7 over 2.6x the box,
   46 near dust motes at z 1.7-3.3, chapters at DEP (film 1.10 … sound 0.88) ± 0.08 jitter, the mark at 1.12; projection
   k = pow(zf,(z-1)*0.38), tilt offset T*(z-1)*2.2, far-layer ease zE. Chapter names: Julius 400 at clamp(12*pow(z,.35),11,18) px,
   fading on sstep(2.2,3.6,zf). Seeded, so every load is identical, Reduce Motion included. */
(function(w){
'use strict';
/* colours come from the theme layer (core/theme.js, css/theme.css): GJ_THEME.pal. Night values are the ones that were written here. */
var P=(w.GJ_THEME&&w.GJ_THEME.pal)||{name:'night',field:[223,231,242],fieldCool:[150,175,215],fieldWarm:[244,230,208],wash:'19,32,46',glow:'205,225,255',core:'#fff',chapter:null,active:null,grid:null,adj:null};
function clamp(v,a,b){return v<a?a:v>b?b:v}
function sstep(a,b,v){var u=clamp((v-a)/(b-a),0,1);return u*u*(3-2*u)}
function seeded(seed){var s=seed>>>0;return function(){s=(s+0x6D2B79F5)>>>0;var t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
/* sky mood (gj.tune.mood, 0-200, 100 = the sky as written): m runs -1 (hushed, cool, sparse) to +1 (lit, warm, wider glow).
   At m = 0 every factor below is exactly 1 and the field colour is the original #dfe7f2, so 100 draws what it always drew. */
function moodOf(T){var v=T&&T.mood!=null?+T.mood:1;return clamp(v-1,-1,1)}
function moodCore(m){var t=m<0?P.coreCool:P.coreWarm,u=Math.abs(m),c=P.coreRGB.map(function(a,i){return Math.round(a+(t[i]-a)*u)});return m?'rgb('+c[0]+','+c[1]+','+c[2]+')':P.core}
function moodField(m){var t=m<0?P.fieldCool:P.fieldWarm,u=Math.abs(m),c=P.field.map(function(a,i){return Math.round(a+(t[i]-a)*u)});return 'rgb('+c[0]+','+c[1]+','+c[2]+')'}
function glowSprite(rgb){var c=document.createElement('canvas');c.width=c.height=128;var q=c.getContext('2d'),gr=q.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,'rgba('+rgb+',.95)');gr.addColorStop(.16,'rgba('+rgb+',.42)');gr.addColorStop(.42,'rgba('+rgb+',.10)');gr.addColorStop(1,'rgba('+rgb+',0)');q.fillStyle=gr;q.fillRect(0,0,128,128);return c}
var DEP={film:1.10,photo:.92,objects:1.04,spaces:1.07,about:.95,sound:.88};
function Sky(D){
  var K={D:D,CH:[],FIELD:[],DUST:[],GW:glowSprite(P.glow),GL:{},port:false,FAR:{x:0,y:0,s:.3}},SPR={};
  /* glow sprites by colour; the theme decides the colour (red: every constellation red, the one you are in or adjusting gold) */
  K.spr=function(rgb){return SPR[rgb]||(SPR[rgb]=glowSprite(rgb))};
  K.tintOf=function(k){var c=K.chapter(k);return P.chapter||(c?c.tint:'255,255,255')};
  /* Red is not one red: hushed pulls the chapter ink toward a deep crimson, lit toward a light rose (quantised so the glow sprites stay few) */
  K.col=function(c,here){if(P.active&&(here||P.adj==='sky'||P.adj===c.k))return P.active;if(!P.chapter)return c.tint;var m=Math.round(K.mood*5)/5;if(!m)return P.chapter;var b=P.chapter.split(',').map(Number),t=m<0?[120,24,40]:[255,176,186],u=Math.abs(m)*.55;return b.map(function(v,i){return Math.round(v+(t[i]-v)*u)}).join(',')};
  K.mood=0;
  K.retheme=function(){K.GW=glowSprite(P.glow);K.CH.forEach(function(c){K.GL[c.k]=K.spr(P.chapter||c.tint)})};
  /* m4 placeChapter, positions only: n works in list order (isNew first) */
  function place(k,n,port,isNew){
    var S=D.sh[k],cw=k==='photo'||k==='objects'?60:74,chh=k==='photo'||k==='objects'?78:56;if(k==='about'){cw=120;chh=40}
    var A=Math.max(Math.max(n,1)*cw*chh*1.35,380*190),q=port?.92:.5,bw=Math.sqrt(A/q),bh=bw*q;if(k==='about')bw=Math.max(bw,port?300:420);
    var P=S.s.map(function(p,i){return {i:i,ox:(p[0]-.5)*bw,oy:(p[1]-.5)*bh,b:p[2],st:p[3]}});
    var order=P.filter(function(p){return !p.st}).sort(function(a,b){return b.b-a.b||a.i-b.i});
    var list=[];for(var i=0;i<n;i++)list.push({i:i,isNew:isNew?!!isNew[i]:false});list.sort(function(a,b){return (b.isNew-a.isNew)||(a.i-b.i)});
    var placed=[],ii=0,items=new Array(n),node=[];
    function ok(x,y){for(var j=0;j<placed.length;j++){var p=placed[j];if(Math.abs(p.ox-x)<cw*.92&&Math.abs(p.oy-y)<chh*.92)return false}return true}
    order.forEach(function(p){if(ii>=list.length)return;if(ok(p.ox,p.oy)){var it={ox:p.ox,oy:p.oy,b:p.b,star:p.i};items[list[ii++].i]=it;placed.push(it);node[p.i]=1}});
    var cand=[];for(var r=-8;r<=8;r++)for(var qq=-8;qq<=8;qq++){var x=(qq+((r&1)?.5:0))*cw,y=r*chh;cand.push({x:x,y:y,d:Math.pow(x/(bw/2),2)+Math.pow(y/(bh/2),2)})}
    cand.sort(function(a,b){return a.d-b.d});
    for(var ci=0;ii<list.length&&ci<cand.length;ci++){var c=cand[ci];if(ok(c.x,c.y)){var it2={ox:c.x,oy:c.y,b:.35,star:-1};items[list[ii++].i]=it2;placed.push(it2)}}
    var x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;function inc(x,y){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
    items.forEach(function(it){if(it)inc(it.ox,it.oy)});P.forEach(function(p){if(!node[p.i])inc(p.ox,p.oy)});
    return {k:k,P:P,e:S.e,items:items,bw:bw,bh:bh,ex:{x0:x0-16,y0:y0-16,x1:x1+16,y1:y1+16}};
  }
  K.isNew={};
  K.layout=function(W,H,T){
    var port=H>W*1.05;K.port=port;var ang=port?D.angp:D.ang,ord=D.order;
    var C={};ord.forEach(function(k){C[k]=place(k,(D.skyItems||{})[k]||0,port,K.isNew[k]);C[k].tint=D.sh[k].t;C[k].z=DEP[k]||1;K.GL[k]=K.spr(P.chapter||D.sh[k].t)});
    function at(k,rx,ry){var a=ang[k]*Math.PI/180;return {x:Math.cos(a)*rx,y:Math.sin(a)*ry}}
    function bbox(){var b={x0:1e9,y0:1e9,x1:-1e9,y1:-1e9};ord.forEach(function(k){var c=C[k];b.x0=Math.min(b.x0,c.x+c.ex.x0);b.x1=Math.max(b.x1,c.x+c.ex.x1);b.y0=Math.min(b.y0,c.y+c.ex.y0-20);b.y1=Math.max(b.y1,c.y+c.ex.y1+36)});
      b.x0=Math.min(b.x0,-80);b.x1=Math.max(b.x1,80);b.y0=Math.min(b.y0,-90);b.y1=Math.max(b.y1,200);return b}
    var rx=port?300:500,ry=port?460:380,scale=1,box;
    for(var n=0;n<28;n++){ord.forEach(function(k){var p=at(k,rx,ry);C[k].x=p.x;C[k].y=p.y});box=bbox();
      var ce={x0:-70,y0:-80,x1:70,y1:160},hit=false;
      ord.forEach(function(k){var c=C[k];if(c.x+c.ex.x0<ce.x1&&ce.x0<c.x+c.ex.x1&&c.y+c.ex.y0<ce.y1&&ce.y0<c.y+c.ex.y1)hit=true});
      if(hit){rx*=1.06;ry*=1.06;continue}
      scale=Math.min((W-28)/(box.x1-box.x0),(H-78-36)/(box.y1-box.y0));var label=40/scale,ov=false;
      var R=ord.map(function(k){var c=C[k];return {x0:c.x+c.ex.x0,x1:c.x+c.ex.x1,y0:c.y+c.ex.y0,y1:c.y+c.ex.y1+label}});
      for(var i=0;i<R.length;i++)for(var j=i+1;j<R.length;j++){var a=R[i],b=R[j];if(a.x0<b.x1&&b.x0<a.x1&&a.y0<b.y1&&b.y0<a.y1)ov=true}
      if(ov){rx*=1.05;ry*=1.05;continue}break}
    var mapK=T.map||1,starK=T.stars||1;
    if(mapK!==1)ord.forEach(function(k){var p=at(k,rx*mapK,ry*mapK);C[k].x=p.x;C[k].y=p.y});
    if(starK!==1)ord.forEach(function(k){var c=C[k];c.P.forEach(function(p){p.ox*=starK;p.oy*=starK});c.items.forEach(function(it){if(it){it.ox*=starK;it.oy*=starK}});c.ex={x0:c.ex.x0*starK,y0:c.ex.y0*starK,x1:c.ex.x1*starK,y1:c.ex.y1*starK}});
    if(mapK!==1||starK!==1){box=bbox();ord.forEach(function(k){var c=C[k],hw=c.bw*.5;box.x0=Math.min(box.x0,c.x-hw);box.x1=Math.max(box.x1,c.x+hw)});scale=Math.min((W-28)/(box.x1-box.x0),(H-78-36)/(box.y1-box.y0))}
    K.FAR={x:0,y:0,s:scale};K.BOX=[box.x0,box.y0,box.x1,box.y1];
    var r=seeded(7);
    K.CH=ord.map(function(k){var c=C[k];c.cx=c.x;c.cy=c.y;c.name=k;
      c.stars=c.P.map(function(p){return {x:c.x+p.ox,y:c.y+p.oy,b:p.b,dec:p.st,z:c.z+(r()-.5)*.08}});
      c.works=c.items.map(function(it){return it?{x:c.x+it.ox,y:c.y+it.oy,b:it.b,star:it.star}:null});return c});
    var bw=box.x1-box.x0,bh=box.y1-box.y0;K.FIELD=[];K.DUST=[];
    for(var f=0;f<1100;f++)K.FIELD.push({x:box.x0-bw*.8+r()*bw*2.6,y:box.y0-bh*.8+r()*bh*2.6,z:.18+Math.pow(r(),1.6)*.7,b:r()<.06?.9+r()*.5:.25+r()*.5});
    for(f=0;f<46;f++)K.DUST.push({x:box.x0-bw*.3+r()*bw*1.6,y:box.y0-bh*.3+r()*bh*1.6,z:1.7+r()*1.6,rad:8+r()*26,a:.04+r()*.07});
  };
  K.box=function(){return K.BOX};
  K.chapter=function(k){return K.CH.filter(function(c){return c.k===k})[0]};
  K.near=function(p){var b=K.CH[0],bd=1e18;K.CH.forEach(function(c){var d=Math.hypot(c.cx-p[0],c.cy-p[1]);if(d<bd){bd=d;b=c}});return b.k};
  /* m4 fitBox */
  K.fitBox=function(b,top,bot,W,H){var s=Math.min((W-24)/(b.x1-b.x0),(H-top-bot)/(b.y1-b.y0)),cy=(top+(H-bot))/2;return {x:(b.x0+b.x1)/2,y:(b.y0+b.y1)/2-(cy-H/2)/s,s:s}};
  K.chFit=function(k,W,H){var c=K.chapter(k);return K.fitBox({x0:c.x+c.ex.x0,y0:c.y+c.ex.y0,x1:c.x+c.ex.x1,y1:c.y+c.ex.y1},36,28,W,H)};
  function zE(cam,z){return 1+(z-1)*(1-sstep(1.6,5,cam.zf()))}
  K.core=P.core;
  K.proj=function(cam,x,y,z,o){z=zE(cam,z);var k=Math.pow(cam.zf(),(z-1)*.38),s=cam.s*k;o=o||[0,0,0];
    o[0]=cam.W/2+(x-cam.x)*s+cam.tilt.x*(z-1)*2.2;o[1]=cam.H/2+(y-cam.y)*s+cam.tilt.y*(z-1)*2.2;o[2]=s;return o};
  function dot(g,x,y,rad,a,spr,gs){if(a<.01)return;if(P.name==='red'){gs*=.62;a*=.9}g.globalAlpha=a*.85;g.drawImage(spr,x-gs/2,y-gs/2,gs,gs);g.globalAlpha=a;g.fillStyle=K.core;g.beginPath();g.arc(x,y,rad,0,6.283);g.fill();g.globalAlpha=1}
  /* the mood wash: the page wash (#13202e at 50% 0 into --bg, STANDARDS §4), growing with mood above 100. Behind everything. */
  /* red mode: the dotted floor. A lattice of fine dots in the world at depth .55, so it slides under the constellations as you move
     (spacing doubles as you zoom in so the dots stay 18-36 px apart). Static: nothing in it moves by itself. */
  function floor(g,cam,m){var W=cam.W,H=cam.H,base=60,z=.55,o=[0,0,0],px=K.proj(cam,0,0,z,[0,0,0])[2],sp=base*Math.pow(2,Math.ceil(Math.log(18/(px*base))/Math.LN2));
    var x0=Math.floor((cam.x-W/2/px-sp)/sp)*sp,y0=Math.floor((cam.y-H/2/px-sp)/sp)*sp,x1=cam.x+W/2/px+sp,y1=cam.y+H/2/px+sp;
    g.fillStyle='rgba('+P.grid+','+(.5*(1+m*.5)).toFixed(3)+')';
    for(var y=y0;y<y1;y+=sp)for(var x=x0;x<x1;x+=sp){K.proj(cam,x,y,z,o);if(o[0]<-2||o[0]>W+2||o[1]<-2||o[1]>H+2)continue;g.fillRect(o[0]-.5,o[1]-.5,1.2,1.2)}}
  K.drawWash=function(g,cam,T){var m=moodOf(T);K.core=moodCore(m);K.mood=m;if(P.grid)floor(g,cam,m);if(m<=0||!P.wash)return;var W=cam.W,H=cam.H,gr=g.createRadialGradient(W/2,0,0,W/2,0,Math.max(W,H)*.95);
    gr.addColorStop(0,'rgba('+P.wash+','+(m*.95).toFixed(3)+')');gr.addColorStop(1,'rgba('+P.wash+',0)');g.fillStyle=gr;g.fillRect(0,0,W,H)};
  K.draw=function(g,cam,t,T,st,hide){
    var o=[0,0,0],W=cam.W,H=cam.H,z=cam.zf(),sS=T.starS||1,sG=T.starG||1,lA=T.lineA||1,lW=T.lineW||1;
    var m=moodOf(T),fa=1+m*.6,fcol=moodField(m),mg=1+m*.5,ml=1+m*.45,hush=m<0?-m*.4:0;
    K.FIELD.forEach(function(p){if(p.b<hush)return;K.proj(cam,p.x,p.y,p.z,o);if(o[0]<-4||o[0]>W+4||o[1]<-4||o[1]>H+4)return;
      g.globalAlpha=Math.min(1,Math.min(1,p.b)*.55*fa);g.fillStyle=fcol;var r=p.b>.9?1.4:.9;g.fillRect(o[0]-r/2,o[1]-r/2,r,r)});g.globalAlpha=1;
    var zs=clamp(Math.sqrt(z),1,3.2);
    K.CH.forEach(function(c){if(hide&&hide(c.k))return;
      var here=st.lv>=1&&st.k===c.k,dim=st.lv>=1&&!here?.35:1,col=K.col(c,here),spr=K.spr(col),pts=c.stars.map(function(s){return K.proj(cam,s.x,s.y,s.z,[0,0,0])});
      g.strokeStyle='rgba('+col+','+Math.min(1,.34*lA*ml*dim)+')';g.lineWidth=lW;
      c.e.forEach(function(e){var a=pts[e[0]],b=pts[e[1]];if(!a||!b)return;g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke()});
      c.stars.forEach(function(s,i){var p=pts[i];if(p[0]<-30||p[0]>W+30||p[1]<-30||p[1]>H+30)return;
        var rad=(s.dec?.6:.9+s.b*1.3)*sS*zs,gs=(s.dec?8:14+s.b*22)*sG*mg*zs;dot(g,p[0],p[1],rad,(s.dec?.45:.6+s.b*.4)*dim,spr,gs)});
      if(c.k!=='film'||!hide)c.works.forEach(function(wk){if(!wk||wk.star>=0)return;K.proj(cam,wk.x,wk.y,c.z,o);if(o[0]<-10||o[0]>W+10||o[1]<-10||o[1]>H+10)return;
        dot(g,o[0],o[1],.7*sS*zs,.5*dim,spr,9*sG*mg*zs)});
      var nm=K.proj(cam,c.cx,c.cy+c.ex.y1,c.z,[0,0,0]),na=(1-sstep(2.2,3.6,z))*dim,fs=clamp(12*Math.pow(z,.35),11,18);
      c._name=[nm[0],nm[1]+16,fs];
      if(na>.02){g.globalAlpha=na;g.font='400 '+fs.toFixed(1)+'px "Julius Sans One",Poppins,sans-serif';g.textAlign='center';g.fillStyle='rgba('+col+',.95)';
        g.fillText(c.name.toUpperCase().split('').join(String.fromCharCode(8202)),nm[0],nm[1]+16);g.globalAlpha=1}
    });
  };
  K.drawDust=function(g,cam){var o=[0,0,0];K.DUST.forEach(function(d){K.proj(cam,d.x,d.y,d.z,o);var r=d.rad*o[2]/cam.s;if(o[0]<-r||o[0]>cam.W+r||o[1]<-r||o[1]>cam.H+r)return;
    g.globalAlpha=d.a*sstep(1.05,1.6,cam.zf());g.drawImage(K.GW,o[0]-r,o[1]-r,r*2,r*2)});g.globalAlpha=1};
  K.nameAt=function(x,y,cam){if(cam&&sstep(2.2,3.6,cam.zf())>.9)return null;for(var i=0;i<K.CH.length;i++){var n=K.CH[i]._name;if(n&&Math.abs(n[0]-x)<60&&Math.abs(n[1]-n[2]*.35-y)<18)return K.CH[i].k}return null};
  return K;
}
w.ShellSky=Sky;
})(window);
