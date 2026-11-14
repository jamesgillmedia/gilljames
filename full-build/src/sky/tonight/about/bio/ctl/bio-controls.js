/* About bio · the glitch plate. Stop flashing and the glitch dimmer were two always-on pills over the bio;
 they now fold into one quiet "light" switch (bottom left, only while the bio is open), the same switch and slider
 as every other room. Same keys as before (gj.noflash, gj.glitch), so nothing Gill set is lost. */
(function(){
  var B=window.GJ_BIOCTL;if(!B||!window.AMBX)return;
  document.documentElement.classList.add('has-ctl');
  var L=document.getElementById('layers');
  var C=AMBX.create({room:'bio',title:'light',cls:'bio-ctl',aria:'bio controls: stop flashing, glitch',where:function(){return 'about · bio'},
    sliders:[
      {type:'sw',k:'noflash',label:'stop flashing',aria:'stop flashing: freeze the calculator and the glitch',get:function(){return B.noflash()},toggle:function(){B.setNoflash(!B.noflash());if(B.sync)B.sync()}},
      {k:'glitch',label:'glitch',min:0,max:100,def:100,aria:'glitch intensity',fmt:function(v){return v>=100?'full':v<=0?'off':v+'%'},
        read:function(){return Math.round(B.glitch()*100)},write:function(v){B.setGlitch(v/100);if(B.sync)B.sync()}}
    ]});
  function vis(){var on=L&&!L.hidden&&!L.classList.contains('exit');C.el.hidden=!on;if(!on)C.open(false)}
  if(L)new MutationObserver(vis).observe(L,{attributes:true,attributeFilter:['hidden','class']});
  vis();window.__ctl=C;
})();
