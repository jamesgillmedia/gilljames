/* One With the Devil. Paths in the page are relative to this folder. The pro2 <base> would
   send them to gilljames, so they are resolved against this page before the sky reads them. */
(function(){
'use strict';
var STILLS=['01_wood_chop','02_dallas_snow','03_colton_snow_trees','04_table_twoshot','05_lantern_portrait','06_colton_cabin','07_dallas_cu','08_rose','09_landscape','10_rifle_doorway','11_night_cabin','12_candlelight'];
var DIR=new URL('film/owtd/',location.href);
function abs(rel){return new URL(rel,DIR).href}
var stills=STILLS.map(function(n){return abs('stills/'+n+'.jpg')});
var clip=abs('one-with-the-devil-clip.mp4');
var poster=abs('stills/05_lantern_portrait.jpg');
var el=document.querySelector('#film .it[data-k="owtd"]');
if(!el)return;
el.dataset.big=poster;el.dataset.pv=clip;el.dataset.sc=clip;
var im=el.querySelector('img');if(im)im.dataset.src=poster;
var j={};try{j=JSON.parse(el.dataset.j||'{}')}catch(e){}
j.frames=stills;
j.native=URL.createObjectURL(new Blob([JSON.stringify({
  film:'owtd',dur:8.007,fps:24,w:1280,h:544,ar:2.3529,poster:poster,
  parts:[{src:clip,t:0,d:8.007}],
  shots:stills.map(function(src,i){return{t:+(8*i/12).toFixed(3),d:+(8/12).toFixed(3),n:i,title:'',film:0,th:src}})}
)],{type:'application/json'}));
el.dataset.j=JSON.stringify(j);
var C=window.GJ_COPY=window.GJ_COPY||{};C.credits=C.credits||{};
C.credits.owtd={t:'One With the Devil',dir:'Drew Pollins',cam:'Gill James'};
})();
