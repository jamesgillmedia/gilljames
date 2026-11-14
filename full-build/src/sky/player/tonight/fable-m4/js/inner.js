/* Inside a work the breadcrumb stays on the work. Pinch and tap keep opening:
 a field of shots, then one cluster as stills, then a clip with the credits as stars.
 Further pinches only get closer. Pinch out is one step. */
(function(){
'use strict';
var PRO2='', JOIOB='', NOV='media/nov9/', ST='media/studio/', DR='media/drive/';
var S={step:0,scale:1,groups:[],gi:0,si:0,it:null,frags:[],t:0};
var cache={};
var subs=[];

function $(id){return document.getElementById(id)}
function img(src){
  if(!src)return null;
  if(cache[src])return cache[src];
  var im=new Image();im.decoding='async';
  im.onload=function(){im._ok=1;if(S.step>0)paint()};
  im.src=src;cache[src]=im;return im;
}
function chunk(list,n){
  var g=[],i;
  n=Math.max(4,n);
  if(list.length<=12){
    var half=Math.ceil(list.length/2);
    if(list.length<=6) return [{shots:list.slice()}];
    return [{shots:list.slice(0,half)},{shots:list.slice(half)}];
  }
  for(i=0;i<list.length;i+=n)g.push({shots:list.slice(i,i+n)});
  return g;
}
function place(W,H){
  var n=S.groups.length,R=Math.min(W,H)*(n>4?0.34:0.28);
  S.groups.forEach(function(g,i){
    var a=-Math.PI/2+(i/Math.max(1,n))*Math.PI*2;
    g.x=W/2+Math.cos(a)*R;
    g.y=H/2+46+Math.sin(a)*R*0.82;
    g.shots.forEach(function(s,j){
      var b=(j/Math.max(1,g.shots.length))*Math.PI*2;
      var rr=48+Math.min(54,g.shots.length*6);
      s.x=g.x+Math.cos(b)*rr;s.y=g.y+Math.sin(b)*rr;
    });
  });
}
function gridPlace(shots,W,H){
  var n=shots.length,cols=Math.max(2,Math.round(Math.sqrt(n*(W/Math.max(1,H-80)))));
  var rows=Math.ceil(n/cols);
  var gap=8,top=78,bot=36;
  var cw=(W-24-(cols-1)*gap)/cols,ch=(H-top-bot-(rows-1)*gap)/rows;
  shots.forEach(function(s,i){
    var c=i%cols,r=(i/cols)|0;
    s.x=12+c*(cw+gap)+cw/2;
    s.y=top+r*(ch+gap)+ch/2;
    s.w=cw;s.h=Math.max(28,ch-16);
  });
}
function filmKey(it){
  if(!it)return null;
  if(it.slug==='reel-2026'||it.k==='w0')return 'reel';
  var m=/^w(\d+)$/.exec(it.k||'');
  if(!m)return null;
  return m[1].length<2?'0'+m[1]:m[1];
}
function filmShots(it){
  var key=filmKey(it),F=window.GJ_FRAMES&&key&&GJ_FRAMES[key];
  var clip=(it.media&&(it.media.pv||it.media.clip))||'';
  if(F&&F.f&&F.f.length){
    return F.f.map(function(f){return {src:PRO2+'frames/'+f[0],t:f[1],clip:clip,title:''}});
  }
  var fr=(it.media&&it.media.frames)||[];
  if(fr.length)return fr.map(function(src){return {src:src,t:0,clip:clip,title:''}});
  var one=it.media&&(it.media.big||it.media.thumb);
  return one?[{src:one,t:0,clip:clip,title:it.title||''}]:[];
}
function reelShots(){
  var R=window.GJ_REEL||[];
  return R.map(function(s){return {src:PRO2+'reel/'+s.f+'.webp',clip:PRO2+'reel/'+s.f+'.mp4',t:0,title:s.b||''}});
}
function crops(src,clip){
  var out=[],i,j;
  for(j=0;j<3;j++)for(i=0;i<3;i++)out.push({src:src,clip:clip||'',t:0,crop:[i/3,j/3,1/3,1/3]});
  return out;
}
function waveShots(song){
  var peaks=(song&&song.peaks)||[];
  if(!peaks.length)return [];
  return peaks.map(function(p,i){return {peak:p,src:'',title:(song&&song.title)||'',i:i,clip:(song&&song.file)||'',t:song&&song.dur?song.dur*(i/peaks.length):0}});
}
function shotsOf(it,song){
  if(it&&it.shots&&it.shots.length)return it.shots;
  if(it&&(it.kind==='reel'||it.slug==='demo-reel'))return reelShots();
  if(it&&it.kind==='player')return waveShots(song);
  var list=filmShots(it||{});
  if(it&&it.chapter==='photo'&&list.length<=1&&list[0]&&list[0].src)return crops(list[0].src,list[0].clip);
  if(list.length===1&&list[0].src&&!list[0].text)return crops(list[0].src,list[0].clip);
  return list;
}
function fragsOf(it,song){
  var bits=[];
  function add(s){if(!s)return;String(s).split(/[·,]/).forEach(function(p){p=p.trim();if(p&&bits.length<10)bits.push(p)})}
  if(it){add(it.role);add(it.meta);(it.credits||[]).forEach(add)}
  if(song){add(song.title);add(song.artist);add('available for sync / licensing')}
  if(!bits.length&&it)bits.push(it.title||'');
  return bits.filter(Boolean);
}
function arm(it,song){
  var list=shotsOf(it,song);
  if(!list.length){
    list=fragsOf(it,song).map(function(t){return {text:t,src:''}});
  }
  S.it=it;S.groups=chunk(list,8);S.gi=0;S.si=0;S.scale=1;S.frags=fragsOf(it,song);
  S.groups.forEach(function(g){g.shots.forEach(function(s){if(s.src)img(s.src)})});
}
function canvas(){
  var el=$('layer');if(!el)return null;
  el.classList.add('on','zooming');
  var c=$('zfield');
  if(!c){c=document.createElement('canvas');c.id='zfield';el.appendChild(c)}
  var dpr=Math.min(2,window.devicePixelRatio||1);
  var w=el.clientWidth||window.innerWidth,h=el.clientHeight||window.innerHeight;
  c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);
  c.style.width=w+'px';c.style.height=h+'px';
  var g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);
  return {g:g,w:w,h:h};
}
function star(g,x,y,r){
  g.fillStyle='rgba(232,240,248,.92)';
  g.beginPath();g.arc(x,y,r,0,7);g.fill();
}
function drawShot(g,s,w,h,big){
  var im=s.src&&img(s.src);
  if(s.text&&!s.src){
    g.fillStyle='rgba(228,236,245,.9)';
    g.font=(big?'300 18px':'300 11px')+' Poppins,sans-serif';
    g.textAlign='center';g.textBaseline='middle';
    g.fillText(s.text,s.x,s.y);
    return;
  }
  if(s.peak!=null){
    var bh=8+s.peak*(big?h*0.35:28);
    g.fillStyle='rgba(232,228,220,.85)';
    g.fillRect(s.x-1.5,s.y-bh/2,3,bh);
    return;
  }
  if(im&&im._ok){
    var dw=s.w||(big?Math.min(w-48,h*0.7):28);
    var dh=s.h||dw*(s.crop?1:0.62);
    var x=s.x-dw/2,y=s.y-dh/2;
    g.save();
    if(s.crop){
      var sx=s.crop[0]*im.naturalWidth,sy=s.crop[1]*im.naturalHeight,sw=s.crop[2]*im.naturalWidth,sh=s.crop[3]*im.naturalHeight;
      g.drawImage(im,sx,sy,sw,sh,x,y,dw,dh);
    }else{
      var ir=im.naturalWidth/Math.max(1,im.naturalHeight),rr=dw/Math.max(1,dh);
      var sx2=0,sy2=0,sw2=im.naturalWidth,sh2=im.naturalHeight;
      if(ir>rr){sw2=im.naturalHeight*rr;sx2=(im.naturalWidth-sw2)/2}else{sh2=im.naturalWidth/rr;sy2=(im.naturalHeight-sh2)/2}
      g.drawImage(im,sx2,sy2,sw2,sh2,x,y,dw,dh);
    }
    g.restore();
  }else star(g,s.x,s.y,big?3:1.6);
}
function paint(){
  if(S.step<1)return;
  var c=canvas();if(!c)return;
  var g=c.g,W=c.w,H=c.h;
  g.clearRect(0,0,W,H);
  g.fillStyle='rgba(4,7,11,.92)';g.fillRect(0,0,W,H);
  if(S.step===1){
    place(W,H);
    g.strokeStyle='rgba(190,210,230,.35)';g.lineWidth=1;g.beginPath();
    S.groups.forEach(function(gr){
      gr.shots.forEach(function(s,i){if(!i)return;g.moveTo(gr.shots[i-1].x,gr.shots[i-1].y);g.lineTo(s.x,s.y)});
      if(gr.shots.length>2){g.moveTo(gr.shots[0].x,gr.shots[0].y);g.lineTo(gr.shots[gr.shots.length-1].x,gr.shots[gr.shots.length-1].y)}
    });
    g.stroke();
    S.groups.forEach(function(gr){gr.shots.forEach(function(s){drawShot(g,s,W,H,false)})});
  }else if(S.step===2){
    var gr=S.groups[S.gi]||S.groups[0];
    if(!gr)return;
    gridPlace(gr.shots,W,H);
    g.strokeStyle='rgba(190,210,230,.28)';g.beginPath();
    gr.shots.forEach(function(s,i){if(!i)return;g.moveTo(gr.shots[i-1].x,gr.shots[i-1].y);g.lineTo(s.x,s.y)});
    g.stroke();
    gr.shots.forEach(function(s){drawShot(g,s,W,H,true)});
  }else{
    var gr2=S.groups[S.gi]||S.groups[0];
    var s=gr2&&gr2.shots[S.si];
    if(!s)return;
    var sc=S.scale;
    var dw=Math.min(W-20,H*0.62)*sc,dh=dw*0.62;
    if(s.crop)dh=dw;
    s.x=W/2;s.y=H*0.42;s.w=dw;s.h=dh;
    if(s.peak!=null){s.w=W*sc;drawWave(g,gr2.shots,W,H,sc)}
    else drawShot(g,s,W,H,true);
    placeVid(s,W,H);
    g.font='300 12px Poppins,sans-serif';g.textAlign='center';g.fillStyle='rgba(226,234,242,.88)';
    S.frags.forEach(function(f,i){
      var col=i%2, row=(i/2)|0;
      var x=col?W*0.72:W*0.28;
      var y=H*0.72+row*22+Math.sin((S.t||0)/700+i)*4;
      star(g,x,y-11,1.3);
      g.fillText(f,x,y);
    });
  }
}
function drawWave(g,shots,W,H,sc){
  var n=shots.length,i,x,y,bh;
  g.strokeStyle='rgba(232,228,220,.9)';g.beginPath();
  for(i=0;i<n;i++){
    x=(i/(n-1||1))*W*sc-(W*(sc-1)/2);
    bh=shots[i].peak*H*0.28;
    y=H*0.45;
    if(!i)g.moveTo(x,y-bh);else g.lineTo(x,y-bh);
  }
  g.stroke();
}
function placeVid(s){
  var v=$('zvid');
  if(!s||!s.clip){if(v)v.remove();return}
  var el=$('layer');if(!el)return;
  if(!v){v=document.createElement('video');v.id='zvid';v.muted=true;v.loop=true;v.autoplay=true;v.playsInline=true;v.setAttribute('playsinline','');el.appendChild(v)}
  var dw=s.w||200,dh=s.h||120;
  v.style.left=(s.x-dw/2)+'px';v.style.top=(s.y-dh/2)+'px';v.style.width=dw+'px';v.style.height=dh+'px';
  if(v.getAttribute('data-src')!==s.clip){
    v.setAttribute('data-src',s.clip);v.poster=s.src||'';v.src=s.clip;
    var t=s.t||0;
    v.addEventListener('loadedmetadata',function once(){v.removeEventListener('loadedmetadata',once);try{if(t)v.currentTime=Math.min(t,Math.max(0,(v.duration||t)-0.2))}catch(e){}}, {once:false});
  }
  var p=v.play();if(p&&p.catch)p.catch(function(){});
}
function nearest(list,x,y){
  var b=0,bd=1e9,i,d;
  for(i=0;i<list.length;i++){
    d=Math.hypot((list[i].x||0)-x,(list[i].y||0)-y);
    if(d<bd){bd=d;b=i}
  }
  return b;
}
function stepIn(x,y,it,song){
  var fv=$('fv'),jv=$('jv');if(fv&&fv.pause)fv.pause();if(jv&&jv.pause)jv.pause();
  if(S.step<1){
    if(!it)return false;
    arm(it,song);S.step=1;paint();return true;
  }
  if(S.step===1){
    S.gi=nearest(S.groups,x,y);S.step=2;S.scale=1;paint();return true;
  }
  if(S.step===2){
    var gr=S.groups[S.gi]||S.groups[0];
    S.si=gr?nearest(gr.shots,x,y):0;S.step=3;S.scale=1;paint();return true;
  }
  S.scale=Math.min(6,S.scale*1.35);paint();return true;
}
function stepOut(){
  if(S.step>=3&&S.scale>1.2){S.scale=Math.max(1,S.scale/1.35);paint();return true}
  if(S.step>1){S.step--;S.scale=1;if(S.step<3){var v=$('zvid');if(v)v.remove()}paint();return true}
  if(S.step===1){reset();return true}
  return false;
}
function reset(){
  S.step=0;S.scale=1;S.groups=[];S.it=null;
  var v=$('zvid');if(v)v.remove();
  var c=$('zfield');if(c)c.remove();
  var el=$('layer');if(el)el.classList.remove('zooming');
}
function tick(t){S.t=t||0;if(S.step>=3)paint()}
function active(){return S.step>0}
function state(){return {step:S.step,scale:+S.scale.toFixed(2),groups:S.groups.length,shots:S.groups.reduce(function(n,g){return n+g.shots.length},0),title:S.it&&S.it.title}}

function addItem(byId,ch,it){byId[it.id]=it;ch.items.push(it);return it}
function shot(src,extra){var o={src:src,t:0,clip:'',title:''};if(extra)for(var k in extra)o[k]=extra[k];return o}
function joioShots(){
  var list=[],J=window.GJ_JOIO||[];
  J.forEach(function(c){
    if(c.k==='v')list.push(shot(JOIOB+c.f,{clip:JOIOB+c.v,title:c.title||'',t:0}));
    else list.push(shot(JOIOB+c.f,{title:c.title||'joio'}));
  });
  ['cup-top','cup-glaze','cup-moss','cup-rim','joio','joio-board','joio-hold','joio-latte','joio-pour'].forEach(function(n){
    list.push(shot(PRO2+'img/objects/'+n+'-960.webp',{title:n.replace('joio','cup')}));
  });
  ['IMG_0346.webp','F3283192-39BF-4BE9-B6F2-8A88933AB63A.webp','DBBB3452-330C-4F73-8F21-65C1A57FE3AE.webp','2528243E-E3AF-45FC-B054-21D812CCB892.webp','ECFA9F0C-95D8-4608-8AAB-7FEB9AF57660.webp','0456C57F-49C0-4B5D-B7DE-D67B647AC163.webp','1724F546-645A-4CD6-8DD3-DF55A3A19C36.webp','IMG_0183.webp','IMG_3497.webp','IMG_0166.webp','IMG_2351.webp','IMG_2401.webp','IMG_3479.webp','IMG_3506.webp','IMG_6690.webp','IMG_9543.webp','IMG_9545.webp','IMG_6964.webp','16B39E13-2667-41A0-BDF7-EC4D14309DE1.webp','IMG_0952.webp','IMG_9126.webp','IMG_9147.webp','IMG_1322.webp','IMG_5881.webp','IMG_1178.webp'].forEach(function(n){
    list.push(shot(NOV+n,{title:'joio'}));
  });
  return list;
}
/* fable-m4: Gill's 11 colourful/abstract Drive picks (box:drive-abstract picks.md, ranked; no titles exist, so none are
 shown). Clips are silent and loop whole, like every clip on this base. Never 09-tour.MP4, screenshots or private files. */
function driveShots(){
  return [
    shot(DR+'img/a78c7ad1794b40bba6ef16ba9c10697a_frame.webp',{clip:DR+'clips/a78c7ad1794b40bba6ef16ba9c10697a.mp4',title:''}),
    shot(DR+'img/d9b7fee657454b918b5c2217d2fea1ff_frame.webp',{clip:DR+'clips/d9b7fee657454b918b5c2217d2fea1ff.mp4',title:''}),
    shot(DR+'img/3108f47976944bccb615cc0a6f91937b_frame.webp',{clip:DR+'clips/3108f47976944bccb615cc0a6f91937b.mp4',title:''}),
    shot(DR+'img/6ffc728f926c4b709d871d3be86d144c_frame.webp',{clip:DR+'clips/6ffc728f926c4b709d871d3be86d144c.mp4',title:''}),
    shot(DR+'img/85dacdf606044b90804f52ce5e3d06c1_frame.webp',{clip:DR+'clips/85dacdf606044b90804f52ce5e3d06c1.mp4',title:''}),
    shot(DR+'img/090dfcafe76842f4990d761802abd99f_frame.webp',{clip:DR+'clips/090dfcafe76842f4990d761802abd99f.mp4',title:''}),
    shot(DR+'img/E5BADB72-A8DB-4A04-AB51-E0B3D574C803.webp',{title:''}),
    shot(DR+'img/F2EC92C9-9EA8-4FC0-B609-3E9F70F8DA83.webp',{title:''}),
    shot(DR+'img/cc0f7acaf2124d8da770adbbf461e2b4_frame.webp',{clip:DR+'clips/cc0f7acaf2124d8da770adbbf461e2b4.mp4',title:''}),
    shot(DR+'img/d605ca0b589a433daeb232de78cb7cb0_frame.webp',{clip:DR+'clips/d605ca0b589a433daeb232de78cb7cb0.mp4',title:''}),
    shot(DR+'img/7DE23FAF-B1D7-4BE0-8D78-419A065DF570.webp',{title:''})
  ];
}
function cedarShots(){
  var list=[];
  ['carve','boards','materials','wire','spoon'].forEach(function(n){list.push(shot(PRO2+'img/objects/'+n+'-960.webp',{title:n}))});
  ['IMG_7571.webp','IMG_7443.webp'].forEach(function(n){list.push(shot(NOV+n,{title:'relief'}))});
  list.push(shot(ST+'heat-480.webp',{clip:'media/nov9/IMG_1202.mp4',title:'heat'}));
  list.push(shot(ST+'unfired-480.webp',{clip:'media/nov9/IMG_2787.mp4',title:'unfired cup'}));
  list.push(shot(ST+'cup-hand-480.webp',{clip:'media/nov9/IMG_2793.mp4',title:'cup'}));
  return list;
}
function build(ctx){
  PRO2=ctx.PRO2;JOIOB=ctx.JOIOB;
  var ch=ctx.CH.objects,byId=ctx.byId;
  var joio=byId['objects/joio'];
  if(joio)joio.shots=joioShots().concat(driveShots());
  var cedar=byId['objects/hand-carved-piece'];
  if(cedar)cedar.shots=cedarShots();
  if(!byId['objects/spirit-eye']){
    addItem(byId,ch,{
      id:'objects/spirit-eye',chapter:'objects',slug:'spirit-eye',title:'Spirit Eye of skwácháýs',
      role:'public art concept',
      meta:"recognized with Best Public Art Concept and Council's Choice within the BIDC Public Art Intensive",
      body:"Spirit Eye of skwácháýs. A public art concept recognized with Best Public Art Concept and Council's Choice within the BIDC Public Art Intensive.",
      kind:'object',noPage:true,
      media:{thumb:'media/pro2/img/objects/spirit-eye.webp',big:'media/pro2/img/objects/spirit-eye.webp'},
      credits:["Best Public Art Concept","Council's Choice","BIDC Public Art Intensive"],
      shots:[
        {title:'Spirit Eye of skwácháýs',src:'media/pro2/img/objects/spirit-eye.webp'}
      ],
      related:[],also:[],in_progress:false,isNew:false,ox:0,oy:0,sx:0,sy:0,gx:0,gy:0
    });
  }
  if(!byId['objects/process']){
    addItem(byId,ch,{
      id:'objects/process',chapter:'objects',slug:'process',title:'process',
      role:'making',meta:'cedar, clay, the studio',kind:'object',
      pageHref:'objects/hand-carved-piece/',media:{thumb:ST+'cup-hand-480.webp',big:ST+'cup-hand-480.webp'},
      credits:[],shots:cedarShots().slice(5),related:[],also:[],in_progress:false,isNew:false,body:'',ox:0,oy:0,sx:0,sy:0,gx:0,gy:0
    });
  }
  subs=[byId['objects/joio'],byId['objects/spirit-eye'],byId['objects/hand-carved-piece'],byId['objects/process']].filter(Boolean);
  subs.forEach(function(it,i){it._sub=i;it._subLabel=['cups and paddles','skwácháýs','hand-carved','making'][i]});
}
function drawSubs(g,W,H,bloom){
  if(!subs.length||bloom<.15)return;
  var spots=[[.28,.40],[.72,.40],[.28,.66],[.72,.66]];
  g.save();
  subs.forEach(function(it,i){
    var x=spots[i][0]*W,y=spots[i][1]*H;
    it._px=x;it._py=y;
    var n=7,a;
    g.strokeStyle='rgba(214,222,236,'+(0.35*bloom)+')';g.lineWidth=1;g.beginPath();
    for(a=0;a<n;a++){
      var p1=ring(x,y,a,n,34),p2=ring(x,y,(a+2)%n,n,34);
      g.moveTo(p1[0],p1[1]);g.lineTo(p2[0],p2[1]);
    }
    g.stroke();
    for(a=0;a<n;a++){var p=ring(x,y,a,n,34);star(g,p[0],p[1],bloom> .6?1.8:1.3)}
    if(bloom>.45){
      g.globalAlpha=bloom;g.fillStyle='#e8eef6';g.font='400 12px "Julius Sans One",sans-serif';
      g.textAlign='center';g.textBaseline='top';
      g.fillText(it.title==='Spirit Eye of skwácháýs'?'Spirit Eye':it.title,x,y+42);
      g.font='300 10px Poppins,sans-serif';g.fillStyle='rgba(201,211,214,.8)';
      g.fillText(it._subLabel||'',x,y+58);
      g.globalAlpha=1;
    }
  });
  g.restore();
}
function ring(x,y,i,n,r){var a=-Math.PI/2+i/n*Math.PI*2;return [x+Math.cos(a)*r,y+Math.sin(a)*r*0.72]}
function subHit(x,y){
  var best=null,bd=78,i,d;
  for(i=0;i<subs.length;i++){
    d=Math.hypot((subs[i]._px||0)-x,(subs[i]._py||0)-y);
    if(d<bd){bd=d;best=subs[i]}
  }
  return best;
}

function shotsOf(it){
  if(!it)return [];
  if(it.shots&&it.shots.length)return it.shots;
  if(it.kind==='reel'||it.slug==='demo-reel')return reelShots();
  if(it.kind==='film')return filmShots(it);
  var src=it.media&&(it.media.big||it.media.thumb);
  if(it.chapter==='photo'&&it.kind==='photo'&&src)return crops(src,'');
  return [];
}
window.GJ_INNER={
  build:build,drawSubs:drawSubs,subHit:subHit,groups:function(){return subs},shotsOf:shotsOf,
  stepIn:stepIn,stepOut:stepOut,reset:reset,tick:tick,active:active,state:state,paint:paint
};
})();
