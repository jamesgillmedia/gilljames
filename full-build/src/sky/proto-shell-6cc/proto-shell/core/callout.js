/* proto-shell · floating callouts (red mode). A boxed label with a hairline leader to the thing it names, plus corner brackets round it,
   after the Roadster UI's part callouts, in Gill's own language: thin line work, the part being adjusted in gold, existing words only.
   ShellCallout(shell) -> { show(room, {label, value}), hide(), step(cam) }.
   Used by the tune menu: while a slider moves, its room's constellation is bracketed and a callout shows the room and the slider's own
   label and value. A module can reuse it: show(chapterId, {label, value}). Red only (the caller hides it in night); nothing here animates:
   it appears, follows the camera each frame, and goes away. No Reduce Motion branch. */
(function(w){
'use strict';
var NS='http://www.w3.org/2000/svg';
function el(n,a,p){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
function clamp(v,a,b){return v<a?a:v>b?b:v}
w.ShellCallout=function(sh){
  var svg=el('svg',{id:'callouts','aria-hidden':'true'}),defs=el('defs',{},svg),rg=el('radialGradient',{id:'co-glow'},defs);
  [[0,.8],[.3,.22],[1,0]].forEach(function(q){el('stop',{offset:q[0],'stop-color':'#e8c48a','stop-opacity':q[1]},rg)});
  var g=el('g',{},svg),stars=[0,1,2,3,4].map(function(){var s=el('g',{class:'co-star'},g);el('circle',{r:6,fill:'url(#co-glow)'},s);el('circle',{r:1.6,fill:'#ffe9c4'},s);return s}),br=[0,1,2,3].map(function(){return el('path',{class:'co-br'},g)}),
    ln=el('path',{class:'co-ln'},g),box=el('rect',{class:'co-box',rx:2},g),t1=el('text',{class:'co-t1'},g),t2=el('text',{class:'co-t2'},g);
  document.body.appendChild(svg);g.style.display='none';
  var cur=null,API={};
  API.show=function(k,info){cur={k:k,label:info&&info.label||'',value:info&&info.value!=null?info.value:''};g.style.display=''};
  API.hide=function(){cur=null;g.style.display='none'};
  function size(){t1.textContent=cur.k.toUpperCase();t2.textContent=(cur.label?cur.label+' ':'')+cur.value;
    var a=t1.getComputedTextLength?t1.getComputedTextLength():60,b=t2.getComputedTextLength?t2.getComputedTextLength():80;return {w:Math.ceil(Math.max(a,b))+20,h:40}}
  API.step=function(cam){
    if(!cur)return;var W=cam.W,H=cam.H,c=sh.sky.chapter(cur.k),o=[0,0,0],r,whole=false;
    if(c){var P=function(x,y){return sh.sky.proj(cam,x,y,c.z,[0,0,0])},a=P(c.x+c.ex.x0,c.y+c.ex.y0),b=P(c.x+c.ex.x1,c.y+c.ex.y1);r={x0:Math.min(a[0],b[0]),y0:Math.min(a[1],b[1]),x1:Math.max(a[0],b[0]),y1:Math.max(a[1],b[1])}}
    else{whole=true;sh.sky.proj(cam,sh.sky.FAR.x,sh.sky.FAR.y,1,o);r={x0:o[0]-1,y0:o[1]-1,x1:o[0]+1,y1:o[1]+1}}
    /* a part bigger than the view is bracketed at the edge of the view */
    r={x0:clamp(r.x0,10,W-10),y0:clamp(r.y0,60,H-124),x1:clamp(r.x1,10,W-10),y1:clamp(r.y1,60,H-124)};
    var pad=6,bs=whole?[]:[[r.x0-pad,r.y0-pad,1,1],[r.x1+pad,r.y0-pad,-1,1],[r.x1+pad,r.y1+pad,-1,-1],[r.x0-pad,r.y1+pad,1,-1]],L=10;
    br.forEach(function(p,i){var q=bs[i];p.style.display=q?'':'none';stars[i].style.display=q?'':'none';if(q){p.setAttribute('d','M'+q[0]+' '+(q[1]+q[3]*L)+'V'+q[1]+'H'+(q[0]+q[2]*L));stars[i].setAttribute('transform','translate('+q[0]+' '+q[1]+')')}});
    var s=size(),m=8,top=56,bot=H-124,cx=(r.x0+r.x1)/2,cy=(r.y0+r.y1)/2,bw=s.w,bh=s.h,bx,by,ax,ay,side;
    var fits={right:r.x1+pad+26+bw<=W-m,left:r.x0-pad-26-bw>=m,above:r.y0-pad-26-bh>=top,below:r.y1+pad+26+bh<=bot};
    if(whole){side='above';bx=clamp(cx-bw/2,m,W-bw-m);by=clamp(cy-90,top,bot-bh);ax=cx;ay=cy}
    else if(fits.right||(!fits.left&&!fits.above&&!fits.below&&cx<W/2)){side='right';bx=r.x1+pad+26;by=clamp(r.y0-pad,top,bot-bh);ax=r.x1+pad;ay=r.y0-pad}
    else if(fits.left){side='left';bx=r.x0-pad-26-bw;by=clamp(r.y0-pad,top,bot-bh);ax=r.x0-pad;ay=r.y0-pad}
    else if(fits.above){side='above';bx=clamp(cx-bw/2,m,W-bw-m);by=r.y0-pad-26-bh;ax=cx>bx+bw/2?r.x1+pad:r.x0-pad;ay=r.y0-pad}
    else{side='below';bx=clamp(cx-bw/2,m,W-bw-m);by=Math.min(r.y1+pad+26,bot-bh);ax=r.x0-pad;ay=r.y1+pad}
    bx=clamp(bx,m,W-bw-m);by=clamp(by,top,Math.max(top,bot-bh));
    var ex=side==='right'?bx:side==='left'?bx+bw:clamp(ax,bx+10,bx+bw-10),ey=side==='above'?by+bh:side==='below'?by:by+bh/2;
    ln.setAttribute('d','M'+ax+' '+ay+'L'+ex+' '+ey);
    stars[4].style.display='';stars[4].setAttribute('transform','translate('+ax+' '+ay+')');
    box.setAttribute('x',bx);box.setAttribute('y',by);box.setAttribute('width',bw);box.setAttribute('height',bh);
    t1.setAttribute('x',bx+10);t1.setAttribute('y',by+15);t2.setAttribute('x',bx+10);t2.setAttribute('y',by+31)};
  return API};
})(window);
