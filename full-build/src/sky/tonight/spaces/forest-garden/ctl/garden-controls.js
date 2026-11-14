/* Forest Garden · the brass dial plate. Day–night used to be a separate pill (and a copy in the ?debug=1 strip);
 it now sits with the garden's light: glow (sun, lens, light front, pool, motes), stars and haze.
 Nothing moves by itself; the light still travels only with the drag. */
(function(){
  if(!window.AMBX)return;
  var A=window.__seAmb=window.__seAmb||{glow:1,star:1,haze:1};
  document.documentElement.classList.add('has-ctl');
  var DN='gj.se.daynight';
  function dn(){try{var s=localStorage.getItem(DN);return s==null||s===''?0:Math.max(0,Math.min(1,+s))}catch(e){return 0}}
  var C=AMBX.create({room:'garden',title:'dial',cls:'sk-wood garden-ctl',aria:'garden controls: day to night, glow, stars, haze',
    where:function(){var v=dn();return 'forest garden · '+(v<.28?'night':v<.7?'dusk':'day')},
    sliders:[
      {type:'sec',label:'sky'},
      {k:'day',label:'day–night',min:0,max:100,def:0,detent:0,aria:'day to night',fmt:function(v){return v<28?'night':v<70?'dusk':'day'},
        read:function(){return Math.round(dn()*100)},
        write:function(v){if(window.__se)window.__se.setDay(v/100,true);else try{localStorage.setItem(DN,String(v/100))}catch(e){}}},
      {k:'star',label:'stars',min:0,max:200,def:100,aria:'star brightness (night)',apply:function(v){A.star=v/100}},
      {type:'sec',label:'light'},
      {k:'glow',label:'glow',min:0,max:150,def:100,aria:'glow: the sun, the lens, the light front and the pool',apply:function(v){A.glow=v/100}},
      {k:'haze',label:'haze',min:0,max:300,def:100,aria:'haze: fog over the water',apply:function(v){A.haze=v/100}}
    ]});
  window.__ctl=C;
})();
