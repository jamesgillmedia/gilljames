/* proto-shell module · film-snap (decision 1: the m4 loose map snaps to the site-3d board, with counts, on pinch-in).
   Built to /workspace/share/proto-standards-1112 (STANDARDS.md, tokens.json).
   - Loose map = the m4 sky as written: each film sits where m4 placeChapter puts it (core/sky.js works[], isNew first).
   - BOARD stop = m4 camFor: fitBox(film, 36, 28).s * 1.45 * 1.3 * tk('board'), same centre as MID.
   - Board grid = m4 4:31 boardSpec('film') in screen px at that scale: maxW min(W-28, 680), pad 8, gap 14, head 44,
     cols 2 (< 520) / 3, tile h = w / 2.39, caption 12+12+6, row gap FILM_ROWGAP 18, top = boardRoom 62. fdens / fgap scale cols / gap.
   - fsn (0 map … 1 board) IS the camera's log progress from MID to BOARD, so a pinch or wheel scrubs it; letting go settles
     through the ladder (snapAt 34 %, log). Counts = m4 filmCounts (kind film only). Mint = new only (it.isNew).
   - Decision 3 (open: mixed): a board tile goes straight to the work (the film-player slot); a map dot only shows its title.
   A = both, snap (default) · B = the m4 map only · C = the site-3d board only. ?mid=1 freezes fsn at 0.5. No Reduce Motion branch. */
(function(){
'use strict';
function clamp(v,a,b){return v<a?a:v>b?b:v}
function sstep(a,b,v){var u=clamp((v-a)/(b-a),0,1);return u*u*(3-2*u)}
function ease(u){u=clamp(u,0,1);return u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2}
var VMAP={A:'snap',B:'map',C:'board'};
var M={id:'film-snap',title:'film · map ⇄ board',chapter:'film',
  variants:{A:'A · both: the loose map, then pinch on and it snaps into the board with counts (decision 1)',
    B:'B · the m4 loose map only (pinch in goes no further than the map)',C:'C · the site-3d board only (film opens on the board)'},
  items:[],B:null,fsn:0,loaded:false,count:null,frozen:false};
M.ready=fetch('data/film.json').then(function(r){return r.json()}).then(function(d){M.items=d.items;M.isNew=d.items.map(function(i){return i.isNew});M.count=counts(d.items)});
/* colours: GJ_THEME.pal (core/theme.js). Photographs and film frames are drawn untouched; only the labels around them follow the theme. */
var PAL=window.GJ_THEME.pal;
function mode(){return GJ_DEC.get('film')||'snap'}
M.variant=function(v){try{GJ_DEC.set('film',VMAP[v]||'snap')}catch(e){}};
function counts(items){var c={commercial:0,'music video':0,'brand film':0,rs:0,other:0},n=0;
  items.forEach(function(it){if(it.kind!=='film')return;n++;var t=String(it.meta||'').split(' · ')[0].trim().toLowerCase();if(t==='reel'||t==='short')c.rs++;else if(c[t]!=null)c[t]++;else c.other++});
  var p=[n+' films'];if(c.commercial)p.push(c.commercial+' commercial');if(c['music video'])p.push(c['music video']+' music video');if(c['brand film'])p.push(c['brand film']+' brand film');if(c.rs)p.push(c.rs+' reels + shorts');if(c.other)p.push(c.other+' other');return p.join(' · ')}
function boardS(sh,W,H){var T=GJ_TUNE.values(),f=sh.sky.chFit('film',W,H);return {x:f.x,y:f.y,s:f.s*1.45*1.3*(T.board||1),mid:f.s*1.45*(T.mid||1)}}
M.layout=function(W,H,sh){
  var c=sh.sky.chapter('film');if(!c||!M.items.length)return;var T=GJ_TUNE.values(),bs=boardS(sh,W,H),s=bs.s;
  var maxW=Math.min(W-28,680),pad=8,gap=14*(T.fgap||1),head=44,AW=maxW+28,cols=Math.max(1,Math.round((AW<520?2:3)*(T.fdens||1)));
  var tw=(maxW-pad*2-gap*(cols-1))/cols,th=tw/2.39,chh=12+12+6,rowF=th+chh+18,x0=(W-maxW)/2+pad,y0=62+head;
  function wx(px){return bs.x+(px-W/2)/s}function wy(py){return bs.y+(py-H/2)/s}
  M.B={s:s,mid:bs.mid,cols:cols,tw:tw/s,th:th/s,x0:wx(x0-pad),y0:wy(62),w:maxW/s,headY:wy(62+18),rows:Math.ceil(M.items.length/cols),rowF:rowF/s};
  M.items.forEach(function(it,i){var wk=c.works[i]||{x:c.cx,y:c.cy};it.lx=wk.x;it.ly=wk.y;it.st=((i*37)%101)/101;
    var cc=i%cols,rr=Math.floor(i/cols);it.bx=wx(x0+cc*(tw+gap)+tw/2);it.by=wy(y0+rr*rowF+th/2)});
};
M.box=function(sh){var B=M.B;if(!B)return null;return [B.x0,B.y0,B.x0+B.w,B.y0+(44+B.rows*B.rowF*B.s)/B.s+10]};
M.stop=function(st,W,H,sh){
  if(st.k!=='film'||!M.B)return undefined;var m=mode(),bs=boardS(sh,W,H),board={x:bs.x,y:bs.y,s:bs.s};
  if(st.lv===1)return m==='board'?board:undefined;
  if(st.lv===2)return m==='snap'?board:null;
  /* WORK: no single m4 constant (STANDARDS §9, TBD). Shell slot: the blend deepS 0.82 rule, picture at 0.82 of the short side,
     clamped so the facts stay on screen. */
  if(st.lv===3){var it=M.items[+st.id];if(!it)return null;var side=W>H*1.25,mn=Math.min(W,H),s=mn*.82/(M.B.tw);
    s=side?Math.min(s*1.25,(H-190)/M.B.th,(W-400)/M.B.tw):Math.min(s,(H-250)/M.B.th,W*.9/M.B.tw);return {x:it.bx,y:it.by+(side?0:M.B.th*.5+40/s),s:s}}
  return undefined};
M.workId=function(id){return isFinite(+id)?String(+id):'0'};
M.levelName=function(lv,st){if(lv===2)return 'board';var it=M.items[+st.id];return it?it.title:'work'};
M.mid=function(sh){var W=sh.cam.W,H=sh.cam.H;sh.ladder.go({lv:1,k:'film'},0);var b=boardS(sh,W,H);sh.cam.glide=null;sh.cam.x=b.x;sh.cam.y=b.y;sh.cam.s=Math.sqrt(b.s*b.mid);M.frozen=true;sh.cam.onSettle=function(){}};
function want(){if(M.loaded)return;M.loaded=true;M.items.forEach(function(it){if(!it.thumb)return;var im=new Image();im.decoding='async';im.onload=function(){it.ld=1};im.src=it.thumb;it.im=im})}
function fsnNow(sh){var st=sh.ladder.cur,cam=sh.cam,m=mode();if(!M.B)return 0;var near=sh.sky.near([cam.x,cam.y])==='film';
  if(m==='map'||!near)return 0;var B=boardS(sh,cam.W,cam.H);
  if(m==='board')return st.k==='film'&&st.lv>=1?1:sstep(.55,.95,cam.s/B.s);
  return clamp(Math.log(cam.s/B.mid)/Math.log(B.s/B.mid),0,1)}
M.hide=function(k){return k==='film'&&M.fsn>.85};
M.state=function(sh){return {fsn:+M.fsn.toFixed(3),mode:mode(),items:M.items.length,count:M.count,loaded:M.items.filter(function(i){return i.ld}).length,frozen:M.frozen}};
M.draw=function(g,cam,t,sh){
  if(!M.B)return;var B=M.B,f=fsnNow(sh);M.fsn=f;var st=sh.ladder.cur;
  if(sh.sky.near([cam.x,cam.y])==='film'&&cam.zf()>1.25)want();
  var o=[0,0,0],sky=sh.sky,work=st.lv===3&&st.k==='film'?+st.id:-1,z=sky.chapter('film').z;
  var fsp=sky.spr(sky.col(sky.chapter('film'),st.lv>=1&&st.k==='film'));
  g.save();
  M.items.forEach(function(it,i){
    var e=ease(clamp(f*1.3-it.st*.3,0,1)),x=it.lx+(it.bx-it.lx)*e,y=it.ly+(it.by-it.ly)*e;sky.proj(cam,x,y,z+(1-z)*e,o);
    var sw=B.tw*e*o[2],sh2=B.th*e*o[2];if(o[0]<-sw-40||o[0]>cam.W+sw+40||o[1]<-sh2-60||o[1]>cam.H+sh2+60){it._r=null;return}
    var da=1-sstep(.25,.55,e),dimW=work>=0&&work!==i;
    if(da>.02){g.globalAlpha=da*(dimW?.3:1);var rr=(1.2+it.st)*Math.min(2.2,Math.sqrt(cam.zf()));g.drawImage(fsp,o[0]-rr*6,o[1]-rr*6,rr*12,rr*12);g.fillStyle=sky.core;g.beginPath();g.arc(o[0],o[1],rr*.55,0,6.283);g.fill()}
    var ia=sstep(.3,.7,e);
    if(ia>.02){g.globalAlpha=ia*(dimW?.18:1);var x0=o[0]-sw/2,y0=o[1]-sh2/2;
      if(it.ld){var im=it.im,ar=im.naturalWidth/im.naturalHeight,ta=sw/sh2,sx=0,sy=0,w2=im.naturalWidth,h2=im.naturalHeight;if(ar>ta){w2=h2*ta;sx=(im.naturalWidth-w2)/2}else{h2=w2/ta;sy=(im.naturalHeight-h2)/2}
        g.drawImage(im,sx,sy,w2,h2,x0,y0,sw,sh2)}else{g.fillStyle='rgba('+sky.tintOf('film')+',.08)';g.fillRect(x0,y0,sw,sh2)}
      g.strokeStyle=PAL.line;g.lineWidth=1;g.strokeRect(x0+.5,y0+.5,sw-1,sh2-1);
      if(sw>84&&work<0){g.globalAlpha=ia*sstep(84,120,sw);g.font='300 11px Poppins,sans-serif';g.textAlign='left';
        g.fillStyle=it.isNew?PAL.mint:PAL.label;g.fillText(cut(g,it.title,sw),x0,y0+sh2+14);
        g.fillStyle=PAL.meta;g.font='300 10px Poppins,sans-serif';g.fillText(cut(g,it.meta||'',sw),x0,y0+sh2+27)}}
    it._r=[o[0]-sw/2,o[1]-sh2/2,sw,sh2];
  });
  var ca=sstep(.6,1,f)*(work>=0?0:1);
  if(ca>.02&&M.count){sky.proj(cam,B.x0,B.headY,1,o);var lx=Math.max(14,o[0]+8);g.globalAlpha=ca;g.textAlign='left';
    g.font='400 12px "Julius Sans One",Poppins,sans-serif';g.fillStyle='rgba('+sky.tintOf('film')+',.95)';g.fillText('FILM',lx,o[1]);
    g.font='300 10px Poppins,sans-serif';g.fillStyle=PAL.dim;g.fillText(M.count,lx,o[1]+15)}
  if(work>=0){var it=M.items[work];if(it&&it._r){var r=it._r,side=cam.W>cam.H*1.25,lx=side?r[0]+r[2]+16:Math.max(14,r[0]),ly=side?r[1]+14:r[1]+r[3]+24;g.globalAlpha=1;g.textAlign='left';
    g.font='400 13px "Julius Sans One",Poppins,sans-serif';g.fillStyle=it.isNew?PAL.mint:PAL.ink;g.fillText(cut(g,it.title.toUpperCase(),side?cam.W-lx-16:cam.W-28),lx,ly);
    g.font='300 11px Poppins,sans-serif';g.fillStyle=PAL.meta;g.fillText(it.meta||'',lx,ly+18);
    g.fillStyle=PAL.slot;g.font='300 9px Poppins,sans-serif';g.fillText('film player slot · m4 js/filmplayer.js + scope.js plug in here',lx,ly+36)}}
  g.restore();g.globalAlpha=1;
};
function cut(g,s,max){s=String(s||'');if(g.measureText(s).width<=max)return s;while(s.length>1&&g.measureText(s+'…').width>max)s=s.slice(0,-1);return s+'…'}
/* LOCKED: the board is committed and the camera is resting on its stop. A tap opens a tile only then. Mid-snap (the map turning into the board,
   the glide still running, a pinch or wheel still live) a tap is swallowed: it opens nothing and shows nothing. Port of preview-film-snap:
   tiles answer only once the board has fully bloomed, and a tap that lands during a settle never goes through. */
function locked(sh){var cam=sh.cam;if(cam.glide||cam.busy)return false;var B=boardS(sh,cam.W,cam.H);return Math.abs(Math.log(cam.s/B.s))<.03}
M.tap=function(x,y,sh){var st=sh.ladder.cur;if(st.k!=='film'||st.lv<1)return false;
  if(st.lv===3)return true;
  var f=M.fsn;
  if(f>.02&&f<.985)return true;
  if(f>=.985){if(!locked(sh))return true;
    for(var i=0;i<M.items.length;i++){var r=M.items[i]._r;if(!r)continue;
      if(x>=r[0]&&x<=r[0]+r[2]&&y>=r[1]&&y<=r[1]+r[3]+28){sh.ladder.go({lv:3,k:'film',id:String(i)});return true}}
    return false}
  for(var j=0;j<M.items.length;j++){var q=M.items[j]._r;if(!q)continue;
    if(Math.hypot(q[0]+q[2]/2-x,q[1]+q[3]/2-y)<18){sh.chipTitle(M.items[j].title,x,y);return true}}
  return false};
if(window.GJ_GHOST)GJ_GHOST.avoid(function(){var sh=window.__shell;if(!sh||!sh.cam)return null;var st=sh.ladder.cur;if(st.k!=='film'||st.lv<1)return null;if(M.fsn<.2&&st.lv===1&&!M.frozen)return null;return [[0,0,sh.cam.W,sh.cam.H]]});
M.tune=[
  {key:'fdens',label:'snap density',min:60,max:140},
  {key:'fgap',label:'frame gap',min:25,max:300}
];
window.Shell.register(M);
})();
