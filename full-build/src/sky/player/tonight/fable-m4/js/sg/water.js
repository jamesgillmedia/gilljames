/* v3: the Moonwater backdrop (fixed, decorative). Adapted from v2 js/water.js.
   Moonwater hero: one fragment shader on a full-screen triangle (no three.js).
   Ambient swell + finger/cursor ripples, crescent moon reflected with Gill's cyan/red split, glint column, vignette.
   Fallbacks: no WebGL / Save-Data / slow device (<30 fps over 1.5 s) -> the still poster stays.
   Reduced motion -> a single still frame. Pauses off-screen and when the tab is hidden. */
(function(){
/* The poster and the poem paint first. The GPU work (shader compile can block a phone's main thread for seconds on some
   Android GPUs) waits until the page has loaded and the browser is idle, so arrival is never a black screen. */
var RUN=function(){
  var hero=document.querySelector('.backdrop'),c=document.getElementById('gl'),poster=document.getElementById('poster');
  if(!hero||!c)return;
  var con=navigator.connection||{};
  if(con.saveData||/(^|-)2g/.test(con.effectiveType||'')){c.remove();return}
  var g=null;try{g=c.getContext('webgl',{antialias:false,powerPreference:'low-power',preserveDrawingBuffer:true})}catch(e){}
  if(!g){c.remove();return}
  /* GPU context lost (iOS does this when backgrounded or under memory pressure): fall back to the still poster */
  /* GPU context lost (iOS does this when backgrounded or under memory pressure): show the still poster, and bring the water
     back when the context is restored */
  var lost=false;
  c.addEventListener('webglcontextlost',function(e){e.preventDefault();lost=true;run=false;cancelAnimationFrame(raf);c.classList.remove('on');hero.classList.remove('gl','gl-stars')},false);
  c.addEventListener('webglcontextrestored',function(){if(!lost||dead)return;lost=false;if(!prog()){dead=true;return}
    if(im.complete&&im.naturalWidth)tex();size();base();frame(performance.now());c.classList.add('on');hero.classList.add('gl');document.documentElement.classList.add('gl');document.dispatchEvent(new Event('water:on'));play()},false);
  var mob=innerWidth<900,dpr=Math.min(devicePixelRatio||1,2);
  var MOON=mob?[0.80,0.13]:[0.72,0.16],MOUSE=mob?[0.40,0.56]:[0.55,0.63];
  var vs='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var fs='precision highp float;uniform sampler2D T;uniform vec2 R,M,MO,I;uniform float t,mb,sw;uniform vec3 S[48];uniform vec3 H;'+
  'float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}'+
  'vec3 img(vec2 u){float sa=R.x/R.y,ia=I.x/I.y;if(sa>ia)u.y=(u.y-.5)*ia/sa+.5;else u.x=(u.x-.5)*sa/ia+.5;return texture2D(T,clamp(u,.001,.999)).rgb;}'+
  'float cres(vec2 q,float asp,vec2 o){vec2 m=(q+o-MO)*vec2(asp,1.);float r=mb;float a=length(m),b=length(m-vec2(-r*.36,r*.10));return smoothstep(r,r-.002,a)*smoothstep(r*.94-.002,r*.94+.002,b);}'+
  'void main(){vec2 q=gl_FragCoord.xy/R;q.y=1.-q.y;float asp=R.x/R.y;vec2 a=q*vec2(asp,1.);'+
  'float w1=sin(a.x*16.+t*.9+sin(a.y*7.)*1.5)*.0026*sw,w2=sin(a.y*29.-t*1.3+a.x*5.)*.0021*sw,w3=sin((a.x+a.y)*53.+t*2.1)*.0010;'+
  'vec2 dm=(q-M)*vec2(asp,1.);float d=length(dm);float ring=sin(d*95.-t*7.)*exp(-d*5.5)*smoothstep(0.,.015,d)*.0075;'+
  'vec2 hv=(q-H.xy)*vec2(asp,1.);float hd=length(hv);float hring=sin((hd-H.z)*120.-t*9.)*exp(-abs(hd-H.z)*14.)*step(.001,H.z)*.006;'+
  'vec2 off=vec2(w1+w3,w2+w3)+dm/(d+1e-4)*ring+hv/(hd+1e-4)*hring;float px=1./R.x;vec2 cs=vec2(px*2.);'+
  'vec3 col=vec3(img(q+off*1.2-cs).r,img(q+off*1.2).g,img(q+off*1.2+cs).b);col=pow(col,vec3(1.15))*vec3(.60,.66,.72);'+
  'vec2 ro=vec2(off.x*2.2,off.y*1.2);float k=(R.x<700.?2.:3.)*px;float cr=cres(q,asp,ro+vec2(k)),cg=cres(q,asp,ro),cb=cres(q,asp,ro-vec2(k));'+
  'vec3 moon=vec3(cr*.30+cg*.70,cg,cg*.7+cb*.30)*vec3(.95,.98,1.);float glow=exp(-length((q+ro-MO)*vec2(asp,1.))*14.)*.22;'+
  'float dx=abs((q.x+off.x*9.-MO.x)*asp);float below=smoothstep(MO.y+.02,MO.y+.10,q.y)*(1.-smoothstep(MO.y+.1,1.05,q.y));'+
  'float sp=pow(max(0.,sin(q.y*300.+off.x*1400.+t*2.7)),6.)*pow(max(0.,sin(q.y*97.-off.y*900.)),2.);float colm=exp(-dx*dx*900.)*below*(.25+1.6*sp);'+
  'col+=moon*1.05+vec3(.62,.72,.80)*glow+vec3(.78,.86,.92)*colm*.55;'+
  'vec2 qs=q+off*7.;for(int i=0;i<48;i++){vec3 st=S[i];if(st.z>0.){vec2 e=(qs-st.xy)*vec2(asp,1.);e.y*=.55;float g=exp(-dot(e,e)*R.y*R.y*.16)*st.z;float tw=.75+.25*sin(t*2.3+float(i)*1.7);col+=vec3(.86,.93,1.)*g*tw*1.4;}}'+
  'if(H.z>0.){vec2 sp2=q*vec2(asp,1.)*R.y/7.;vec2 g=floor(sp2);float h=hs(g);vec2 jt=vec2(hs(g+1.7),hs(g+4.1))*.6+.2;float sf=step(.975,h)*smoothstep(.22,0.,length(fract(sp2)-jt))*(.55+.45*hs(g+3.));vec3 sky=mix(vec3(.04,.07,.13),vec3(.01,.015,.03),clamp(hd*1.5,0.,1.))+vec3(.9,.95,1.)*sf;float m=smoothstep(H.z,H.z-.01,hd);col=mix(col,sky,m)+vec3(.75,.85,.95)*exp(-abs(hd-H.z)*90.)*.7;}'+
  'float v=smoothstep(1.25,.25,length((q-.5)*vec2(asp*.8,1.)));col*=mix(.45,1.,v);gl_FragColor=vec4(col,1.);}';
  function sh(t,s){var o=g.createShader(t);g.shaderSource(o,s);g.compileShader(o);return g.getShaderParameter(o,g.COMPILE_STATUS)?o:null}
  var pr,U={};
  /* compile + bind; run again after a lost GPU context is restored */
  function prog(){var v=sh(g.VERTEX_SHADER,vs),f=sh(g.FRAGMENT_SHADER,fs);if(!v||!f)return false;
    pr=g.createProgram();g.attachShader(pr,v);g.attachShader(pr,f);g.linkProgram(pr);if(!g.getProgramParameter(pr,g.LINK_STATUS))return false;
    g.useProgram(pr);
    var b=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,b);g.bufferData(g.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),g.STATIC_DRAW);
    var l=g.getAttribLocation(pr,'p');g.enableVertexAttribArray(l);g.vertexAttribPointer(l,2,g.FLOAT,false,0,0);
    ['T','R','M','MO','I','t','mb','sw','H'].forEach(function(n){U[n]=g.getUniformLocation(pr,n)});U.S=g.getUniformLocation(pr,'S');return true}
  var pt=performance.now();if(!prog()){c.remove();return}
  if(performance.now()-pt>900){c.remove();return} /* the GPU took too long just to compile: keep the still poster */
  var SA=new Float32Array(48*3),hole=null;
  var MB=0; /* v3.2: the moon's radius, set by js/arrival.js from the .moon slot beside the name */
  window.__water={moon:function(x,y,r){MOON=[x,y];MB=r;if(U.MO){g.uniform2f(U.MO,x,y);g.uniform1f(U.mb,r);if(!run&&c.classList.contains('on'))frame(performance.now())}},
    stars:function(a){SA.fill(0);a.slice(0,48).forEach(function(p,i){SA[i*3]=p[0];SA[i*3+1]=p[1];SA[i*3+2]=p[2]});g.uniform3fv(U.S,SA);if(!run)frame(performance.now())},
    hole:function(x,y){if(dead||lost||!c.classList.contains('on'))return false;act=true;hole={x:x,y:y,t:performance.now()};g.uniform2f(U.M,x,y);reduce=false;play();return true},live:function(){return !dead&&!lost&&c.classList.contains('on')},
    /* the shell turns the water off while the surface is hidden (sky / sections) and back on when you rise */
    /* v3.2.1: render resolution (1 = the early c08 water, soft; 2 = sharp), live */
    res:function(d){var n=Math.min(devicePixelRatio||1,d||2);if(n===dpr)return;dpr=n;if(c.classList.contains('on')){size();frame(performance.now())}},
    active:function(on){act=!!on;act&&vis&&!document.hidden?play():stop()},reset:function(){hole=null;reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;frame(performance.now())}};
  var scr=false,scrT=0,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,run=false,vis=true,act=true,dead=false,t0=performance.now(),raf=0,swell=1,lastY=scrollY;
  var im=new Image();im.decoding='async';
  function tex(){var tx=g.createTexture();g.bindTexture(g.TEXTURE_2D,tx);
    g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_S,g.CLAMP_TO_EDGE);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_T,g.CLAMP_TO_EDGE);
    g.texImage2D(g.TEXTURE_2D,0,g.RGB,g.RGB,g.UNSIGNED_BYTE,im);g.uniform2f(U.I,im.width,im.height)}
  function base(){g.uniform2f(U.M,MOUSE[0],MOUSE[1]);g.uniform2f(U.MO,MOON[0],MOON[1]);g.uniform1f(U.mb,MB||(mob?.058:.072));g.uniform1f(U.sw,1);g.uniform3fv(U.S,SA)}
  im.onload=function(){tex();start()};
  im.src=poster.currentSrc||poster.src; /* same file as the poster: no extra download */
  function size(){var r=hero.getBoundingClientRect();c.width=Math.round(r.width*dpr);c.height=Math.round(r.height*dpr);g.viewport(0,0,c.width,c.height);g.uniform2f(U.R,c.width,c.height)}
  function frame(now){var hr=0;if(hole){hr=Math.min(1.6,Math.pow((now-hole.t)/620,2.2)*1.5)}g.uniform3f(U.H,hole?hole.x:0,hole?hole.y:0,hr);g.uniform1f(U.t,reduce?2.:2.+(now-t0)/1000);swell+=(1-swell)*.04;g.uniform1f(U.sw,swell);g.drawArrays(g.TRIANGLES,0,3)}
  function loop(now){if(!run||dead)return;frame(now);probe(now);raf=requestAnimationFrame(loop)}
  function play(){if((reduce&&!hole)||dead||lost||run||!vis||!act||scr)return;run=true;raf=requestAnimationFrame(loop)}
  function stop(){run=false;cancelAnimationFrame(raf)}
  /* FPS probe (before3d pattern): first 1.5 s of running; under 30 fps -> keep the still poster */
  var pStart=0,pN=0,probed=/[?&]probe=0/.test(location.search); /* ?probe=0: test hook to keep WebGL on in slow headless renderers */
  function probe(now){if(probed)return;if(!pStart){pStart=now;return}pN++;if(now-pStart>1500){var fps=pN/((now-pStart)/1000);
    if(fps<45&&dpr>1){dpr=1;size();pStart=0;pN=0;return} /* sharp first; if it can't hold, render at 1x and probe again */
    probed=true;if(fps<24)slow()}}
  function slow(){if(hole)return;dead=true;hero.classList.remove('gl-stars');stop();c.classList.remove('on');hero.classList.remove('gl');setTimeout(function(){c.remove()},900)}
  function start(){size();addEventListener('resize',size);
    base();
    frame(performance.now());c.classList.add('on');hero.classList.add('gl');document.documentElement.classList.add('gl');document.dispatchEvent(new Event('water:on'));
    if(reduce)return; /* one still frame */
    addEventListener('pointermove',function(e){var r={left:0,top:0,width:innerWidth,height:innerHeight};g.uniform2f(U.M,(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height)},{passive:true});
    addEventListener('pointerdown',function(e){var r={left:0,top:0,width:innerWidth,height:innerHeight};g.uniform2f(U.M,(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height)},{passive:true});
    /* never draw while the document scrolls: stop, and pick up again 160 ms after the last scroll */
    addEventListener('scroll',function(){swell=Math.min(3,swell+Math.abs(scrollY-lastY)*.01);lastY=scrollY;if(!scr&&run)stop();scr=true;clearTimeout(scrT);scrT=setTimeout(function(){scr=false;vis&&!document.hidden&&play()},160)},{passive:true});
    new IntersectionObserver(function(es){vis=es[0].isIntersecting;vis&&!document.hidden?play():stop()}).observe(hero);
    document.addEventListener('visibilitychange',function(){document.hidden?stop():play()});
    play()}
};
var ran=false;function go(){if(ran)return;ran=true;RUN()}
function later(){(window.requestIdleCallback||function(f){setTimeout(f,150)})(go,{timeout:1200})}
if(document.readyState==='complete')later();else{addEventListener('load',later);setTimeout(later,3000)}
})();
