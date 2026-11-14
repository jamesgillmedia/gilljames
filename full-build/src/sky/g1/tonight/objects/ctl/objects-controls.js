/* Objects · the glass-ring plate. Every ring's light (hoop, ticks, floor ripples, warm pools, motes, back glow) on one slider,
 and each ring on its own: bring the joio cup ring down without touching the others. Haze, far stars and the lamp on the cup.
 The photographs and the cup's own texture are never graded. */
(function(){
  if(!window.AMBX)return;
  var ROOM='objects';
  function init(){
    var O=window.__objAmb;if(!O||init.done)return;init.done=1;
    document.documentElement.classList.add('has-ctl');
    var A=O.AMB,R=O.rings;
    /* every ring's own setting is applied at once, not only the one in view */
    R.forEach(function(r,i){A.Rk[i]=AMBX.read(ROOM,'ring',100,r.id,0,150)/100});
    function cur(){var s=O.state();return s.lv==='board'?null:R[s.r]}
    var C=AMBX.create({room:ROOM,title:'glow',cls:'sk-glass obj-ctl',aria:'ring controls: glow of all rings, this ring, haze, stars, lamp',
      where:function(){var r=cur();return r?r.title:'the board'},
      sliders:[
        {type:'sec',label:'rings'},
        {k:'glow',label:'all rings',min:0,max:150,def:18,aria:'glow of every ring',apply:function(v){A.G=v/100;O.apply()}},
        {k:'ring',label:function(){var r=cur();return r?r.title:'this ring'},aria:function(){var r=cur();return 'glow of this ring'+(r?': '+r.title:'')},
          scope:function(){var r=cur();return r?r.id:'none'},show:function(){return !!cur()},min:0,max:150,def:100,
          apply:function(v){var s=O.state();if(s.lv==='board')return;A.Rk[s.r]=v/100;O.apply()}},
        {type:'sec',label:'air'},
        {k:'haze',label:'haze',min:0,max:250,def:100,aria:'haze in the dark between rings',apply:function(v){A.haze=v/100;O.apply()}},
        {k:'stars',label:'stars',min:0,max:200,def:100,aria:'far stars',apply:function(v){A.star=v/100;O.apply()}},
        {k:'lamp',label:'lamp',min:20,max:160,def:100,aria:'the lamp on the 3D cup',apply:function(v){A.lamp=v/100;O.apply()}}
      ],
      onReset:function(){R.forEach(function(r,i){A.Rk[i]=1;try{localStorage.removeItem(AMBX.key(ROOM,'ring',r.id))}catch(e){}});O.apply()}});
    document.addEventListener('obj:state',function(){setTimeout(C.refresh,0)});
    window.__ctl=C;O.apply();
  }
  if(window.__objAmb)init();else document.addEventListener('obj:ready',init);
})();
