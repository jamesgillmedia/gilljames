/* Shared look layer for the sky pages: grain, glow pulse, star flash and the beat.
   Values come from each page's defaults (or its ambience tray); there is no panel. */
window.GJFX=(function(){
var Q=new URLSearchParams(location.search);
var cfg={controls:[]},vals={},grainOn=false,grainEl=null,lastT=0;
var LOOK=[
  {id:'br',min:-100,max:100,step:.1,def:0},{id:'ct',min:-100,max:100,step:.1,def:0},
  {id:'gr',min:0,max:100,step:.1,def:0},{id:'inv',min:0,max:100,step:.1,def:0},
  {id:'sf',min:0,max:100,step:.1,def:0},{id:'af',min:0,max:100,step:.1,def:0},
  {id:'bpm',min:60,max:180,step:.1,def:100},{id:'sync',min:0,max:100,step:.1,def:0}
];
var LOOKIDS={br:1,ct:1,gr:1,inv:1,sf:1,af:1,bpm:1,sync:1};
function isLook(k){return !!LOOKIDS[k.id]}
var beatAcc=0,beatSrc=null,fogEl=null,fogG=null,invEl=null,fogLevel=1;
function soundMode(){return !!document.getElementById('vis')}
function applyLook(){
  var vis=document.getElementById('vis')||document.getElementById('gjview');
  var br=vals.br||0,ct=vals.ct||0,iv=soundMode()?0:(vals.inv||0)/100;
  var hue=iv>0?Math.sin(iv*Math.PI)*140:0;
  if(vis)vis.style.filter=(br||ct||iv)?'brightness('+(1+br/100*.8).toFixed(4)+') contrast('+(1+ct/100*.7).toFixed(4)+')'+(iv?' hue-rotate('+hue.toFixed(2)+'deg)':''):'';
  if(invEl){var gv=Math.round(Math.sin(iv*Math.PI/2)*.8*255);invEl.style.display=iv>0?'block':'none';invEl.style.backgroundColor='rgb('+gv+','+gv+','+gv+')'}
  var gr=vals.gr||0;grainOn=gr>0;
  if(grainEl){grainEl.style.display=grainOn?'block':'none';grainEl.style.opacity=(gr/100*.8).toFixed(3)}
}
function makeGrain(){
  grainEl=document.createElement('div');grainEl.id='gjgrain';grainEl.setAttribute('aria-hidden','true');
  var c=document.createElement('canvas');c.width=c.height=256;
  var x=c.getContext('2d'),d=x.createImageData(256,256),i,s=1234567;
  for(i=0;i<d.data.length;i+=4){s=(s*1664525+1013904223)>>>0;var v=s>>>24;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}
  x.putImageData(d,0,0);grainEl.style.backgroundImage='url('+c.toDataURL()+')';
  document.body.appendChild(grainEl);
}
function makeView(){
  var view=document.getElementById('vis')||document.getElementById('gjview');if(!view)return;
  fogEl=document.createElement('canvas');fogEl.id='gjfog';fogEl.width=128;fogEl.height=72;fogEl.setAttribute('aria-hidden','true');
  fogG=fogEl.getContext('2d');
  if(soundMode())view.appendChild(fogEl);
  else{var hud=document.getElementById('hud');view.insertBefore(fogEl,hud&&hud.parentNode===view?hud:null)}
  invEl=document.createElement('div');invEl.id='gjinv';invEl.setAttribute('aria-hidden','true');
  (document.getElementById('gjview')||view).appendChild(invEl);
}
function frac(x){return x-Math.floor(x)}
function beatCount(){return beatSrc?beatSrc():beatAcc}
function pulse(pos){
  var off=(vals.sync||0)/100*.9*Math.max(0,Math.min(1,pos||0));
  var ph=frac(beatCount()-off);
  return ph<.05?ph/.05:Math.exp(-(ph-.05)*4.2);
}
function flash(pos){var f=(vals.sf||0)/100;return f>0?f*pulse(pos):0}
function drawFog(t){
  if(!fogEl)return;
  var af=(vals.af||0)/100;
  if(af<=0){if(fogEl.style.display!=='none')fogEl.style.display='none';return}
  fogEl.style.display='block';
  var w=fogEl.width,h=fogEl.height,g=fogG,i,N=6;
  g.clearRect(0,0,w,h);g.globalCompositeOperation='lighter';
  for(i=0;i<N;i++){
    var ang=i*2.39996+t*.00005*(i%2?1:-1),rad=i===0?0:.2+.05*i;
    var fx=.5+Math.cos(ang)*rad*1.1,fy=.5+Math.sin(ang)*rad*.8;
    var pos=Math.min(1,Math.hypot(fx-.5,(fy-.5)*1.6)/.62);
    var e=pulse(pos),lv=af*(.3+.7*e)*fogLevel;
    var col=i%2?'160,190,240':'85,218,161',R=w*(.55+.06*Math.sin(t*.0004+i));
    var gr=g.createRadialGradient(fx*w,fy*h,0,fx*w,fy*h,R);
    gr.addColorStop(0,'rgba('+col+','+(lv*.42).toFixed(3)+')');gr.addColorStop(.5,'rgba('+col+','+(lv*.14).toFixed(3)+')');gr.addColorStop(1,'rgba('+col+',0)');
    g.fillStyle=gr;g.fillRect(0,0,w,h);
  }
  g.globalCompositeOperation='source-over';
}
function allControls(){return LOOK.concat(cfg.controls||[])}
function find(id){return allControls().filter(function(x){return x.id===id})[0]}
function init(c){
  cfg=c||{controls:[]};
  allControls().forEach(function(k){
    var q=k.param?Q.get(k.param):null;
    if(k.kind==='seg'||k.kind==='bool'){vals[k.id]=q!==null?q:k.def}
    else{
      var v0=q===null||q===''?NaN:parseFloat(q);
      if(!isFinite(v0)&&k.ls){try{v0=parseFloat(localStorage.getItem(k.ls))}catch(e){}}
      if(!isFinite(v0))v0=k.def;
      vals[k.id]=Math.max(k.min,Math.min(k.max,v0));
    }
  });
  makeGrain();makeView();applyLook();
  allControls().forEach(function(k){
    if(!isLook(k)&&k.onChange&&!k.noInit&&((k.param&&Q.get(k.param)!==null)||k.always))k.onChange(vals[k.id],true)
  });
  requestAnimationFrame(loop);
}
function loop(t){
  requestAnimationFrame(loop);
  var dt=t-(lastT||t);lastT=t;
  if(dt>0&&dt<250)beatAcc+=dt*(vals.bpm||100)/60000;
  drawFog(t);
  if(grainOn&&grainEl){var gx=(Math.random()*256)|0,gy=(Math.random()*256)|0;grainEl.style.transform='translate3d('+(-gx)+'px,'+(-gy)+'px,0)'}
}
function setSeg(id,v){vals[id]=v}
function setBpm(v){v=parseFloat(v);if(!isFinite(v))return;var k=find('bpm');vals.bpm=Math.max(k.min,Math.min(k.max,v))}
function setVal(id,v){var k=find(id);if(!k)return;
  if(k.kind==='bool'||k.kind==='seg'){vals[id]=String(v)}else{vals[id]=Math.max(k.min,Math.min(k.max,+v))}
  if(isLook(k))applyLook();else if(k.onChange)k.onChange(vals[id]);}
return {setVal:setVal,setSeg:setSeg,setBpm:setBpm,pulse:pulse,flash:flash,beat:beatCount,
  sf:function(){return (vals.sf||0)/100},af:function(){return (vals.af||0)/100},bpm:function(){return vals.bpm||100},sync:function(){return (vals.sync||0)/100},
  setBeat:function(fn){beatSrc=fn},fogLevel:function(v){fogLevel=v},init:init,frame:function(){},val:function(id){return vals[id]}};
})();
