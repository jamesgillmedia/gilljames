(function(){
  var boxes=document.querySelectorAll('.sketch');
  if(!boxes.length)return;
  document.documentElement.classList.add('js');
  var live=[];
  function rd(k,d){try{var v=parseFloat(localStorage.getItem(k));return isFinite(v)?Math.max(0,Math.min(1,v)):d}catch(e){return d}}
  var VOL=rd('gj.vol',1),FLASH=rd('gj.flash',.6),ctls=[],redraws=[];
  function dim(){return .35+.65*FLASH}
  function applyAll(){
    document.documentElement.style.setProperty('--flash',FLASH);
    live.forEach(function(a){a.volume=VOL});
    ctls.forEach(function(c){c.sync()});
    redraws.forEach(function(f){f()});
  }
  function put(k,v){try{localStorage.setItem(k,v)}catch(e){}}
  window.addEventListener('storage',function(e){
    if(e.key==='gj.vol'||e.key==='gj.flash'){VOL=rd('gj.vol',1);FLASH=rd('gj.flash',.6);applyAll()}
  });
  function controls(box){
    var row=document.createElement('div');
    row.className='ctl';
    row.setAttribute('role','group');
    row.setAttribute('aria-label','sound controls');
    row.innerHTML='<label class="cl"><span>vol</span><input type="range" min="0" max="100" step="1" aria-label="volume"></label>'+
      '<label class="cl"><span>flash</span><input type="range" min="0" max="100" step="1" aria-label="flash brightness"></label>';
    var iv=row.querySelectorAll('input')[0],ifl=row.querySelectorAll('input')[1];
    function paint(i,v){i.value=Math.round(v*100);i.style.setProperty('--p',Math.round(v*100)+'%');i.setAttribute('aria-valuetext',Math.round(v*100)+'%')}
    function sync(){paint(iv,VOL);paint(ifl,FLASH)}
    iv.addEventListener('input',function(){VOL=iv.value/100;put('gj.vol',VOL);applyAll()});
    ifl.addEventListener('input',function(){FLASH=ifl.value/100;put('gj.flash',FLASH);applyAll()});
    ctls.push({sync:sync});
    sync();
    box.appendChild(row);
  }
  function mmss(s){
    s=Math.max(0,Math.round(s||0));
    return (s/60|0)+':'+(s%60<10?'0':'')+(s%60);
  }
  function arm(box){
    var src=box.getAttribute('data-src')||'';
    var play=box.querySelector('.play');
    var time=box.querySelector('.time');
    var canvas=box.querySelector('canvas');
    var rail=box.querySelector('.rail');
    if(!src)return;
    var audio=document.createElement('audio');
    audio.preload='auto';
    audio.src=src;
    audio.hidden=true;
    audio.volume=VOL;
    box.appendChild(audio);
    var peaks=[],dur=0,head=0,hold=0,mark=null;
    function duration(){
      return isFinite(audio.duration)&&audio.duration>0?audio.duration:dur;
    }
    function label(cur){
      if(!time)return;
      var d=duration();
      var at=cur==null?(audio.currentTime||0):cur;
      time.textContent=d>0?mmss(at)+' / '+mmss(d):mmss(at);
    }
    function draw(){
      if(!canvas)return;
      var dpr=Math.min(2,window.devicePixelRatio||1);
      var w=canvas.clientWidth||320,h=canvas.clientHeight||48;
      if(canvas.width!==(w*dpr|0)||canvas.height!==(h*dpr|0)){canvas.width=w*dpr|0;canvas.height=h*dpr|0}
      var g=canvas.getContext('2d');
      g.setTransform(dpr,0,0,dpr,0,0);
      g.clearRect(0,0,w,h);
      if(!peaks.length)return;
      var n=peaks.length,i,pk,x,bw,y,on;
      bw=Math.max(1,(w-8)/n*0.62);
      for(i=0;i<n;i++){
        pk=peaks[i];
        x=4+(i+0.5)*(w-8)/n;
        y=Math.max(1.2,pk*(h*0.42));
        on=head>0&&i/n<head;
        g.fillStyle=on?'rgba(232,228,220,'+(0.45+0.5*pk).toFixed(2)+')':'rgba(220,232,240,'+(0.16+0.28*pk).toFixed(2)+')';
        g.fillRect(x-bw/2,h/2-y,bw,y*2);
      }
      g.fillStyle='rgba(232,228,220,.8)';
      g.fillRect(4,(h/2)-0.5,Math.max(0,(w-8)*head),1.5);
      if(mark&&peaks.length){
        var age=hold?0:(performance.now()-mark.t)/680;
        if(!hold&&age>=1)mark=null;
        else{
          var a=hold?0.9:Math.max(0,1-age);
          var xi=4+mark.u*(w-8);
          var idx=Math.max(0,Math.min(n-1,Math.floor(mark.u*n)));
          var py=Math.max(3,peaks[idx]*(h*0.46));
          g.fillStyle='rgba(232,228,220,'+(0.55*a*dim()).toFixed(3)+')';
          g.beginPath();
          g.arc(xi,h/2,Math.max(3,py*0.22),0,6.3);
          g.fill();
        }
      }
    }
    function setHead(){
      var d=duration();
      if(hold&&mark){
        head=mark.u;
        label(mark.u*(d||0));
      }else{
        head=d>0?(audio.currentTime||0)/d:0;
        label();
      }
      draw();
    }
    function fadeMark(){
      if(!mark||hold)return;
      draw();
      if(mark)requestAnimationFrame(fadeMark);
    }
    audio.addEventListener('loadedmetadata',function(){dur=audio.duration;setHead()});
    audio.addEventListener('durationchange',function(){if(isFinite(audio.duration))dur=audio.duration;setHead()});
    audio.addEventListener('timeupdate',setHead);
    audio.addEventListener('ended',function(){if(play)play.textContent='play';setHead()});
    if(play)play.addEventListener('click',function(){
      if(audio.paused){
        live.forEach(function(o){if(o!==audio){o.pause();var b=o._play;if(b)b.textContent='play'}});
        var p=audio.play();if(p&&p.catch)p.catch(function(){});
        play.textContent='pause';
      }else{audio.pause();play.textContent='play'}
    });
    audio._play=play;
    live.push(audio);
    redraws.push(draw);
    controls(box);
    function seek(ev){
      var d=isFinite(audio.duration)&&audio.duration>0?audio.duration:dur;
      if(!rail||!(d>0))return;
      var r=rail.getBoundingClientRect();
      var point=ev.clientX;
      if(point==null&&ev.touches&&ev.touches[0])point=ev.touches[0].clientX;
      if(point==null)return;
      var u=Math.max(0,Math.min(1,(point-r.left)/r.width));
      var want=u*d;
      mark={u:u,t:performance.now()};
      audio._want=want;
      var end=audio.seekable&&audio.seekable.length?audio.seekable.end(audio.seekable.length-1):0;
      if(end+0.05>=want){
        try{audio.currentTime=want}catch(e){}
        audio._want=null;
      }
      setHead();
    }
    if(!audio._seekOn){
      audio._seekOn=1;
      audio.addEventListener('progress',function(){
        if(audio._want==null)return;
        var end=audio.seekable&&audio.seekable.length?audio.seekable.end(audio.seekable.length-1):0;
        if(end+0.05<audio._want)return;
        try{audio.currentTime=audio._want}catch(e){}
        audio._want=null;
        setHead();
      });
    }
    if(rail){
      function down(ev){
        hold=1;
        try{if(rail.setPointerCapture&&ev.pointerId!=null)rail.setPointerCapture(ev.pointerId)}catch(e){}
        seek(ev);
      }
      function up(){
        if(!hold)return;
        hold=0;
        if(mark)mark.t=performance.now();
        setHead();
        fadeMark();
      }
      rail.addEventListener('pointerdown',down);
      rail.addEventListener('pointermove',function(ev){if(hold)seek(ev)});
      rail.addEventListener('pointerup',up);
      rail.addEventListener('pointercancel',up);
    }
    var key=box.getAttribute('data-wave');
    var waves=box.getAttribute('data-waves')||'../../media/pro2/audio/waves.json';
    if(key){
      fetch(waves).then(function(r){if(!r.ok)throw new Error(r.status);return r.json()}).then(function(j){
        peaks=(j.peaks&&j.peaks[key])||[];
        draw();
      }).catch(function(){peaks=[];draw()});
    }
    audio.load();
    label();
    draw();
  }
  [].forEach.call(boxes,arm);
  applyAll();
})();
