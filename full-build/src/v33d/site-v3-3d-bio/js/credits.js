/* site-v3-3d · fill caption/credits from the work's own data; hide the block when empty.
   Never show "[Gill writes]". Writes only when the text actually changes, so the
   observer cannot retrigger itself. */
(function(){
'use strict';
function workEl(){
  var d=window.__dive&&__dive.state&&__dive.state();
  if(!d||!d.k||!d.w)return null;
  return document.querySelector('#'+d.k+' .it[data-k="'+d.w+'"]');
}
function paint(){
  var dl=document.querySelector('.imm-c');if(!dl)return;
  var cap=dl.querySelector('dt+dd'); var cred=dl.querySelector('dt:nth-of-type(2)+dd')||dl.querySelectorAll('dd')[1];
  var it=workEl(), j={};
  if(it){try{j=JSON.parse(it.dataset.j||'{}')}catch(e){}}
  var c=(j.caption||j.cap||'').toString().trim();
  var r=(j.credits||j.credit||'').toString().trim();
  if(/\[Gill writes\]/i.test(c))c='';
  if(/\[Gill writes\]/i.test(r))r='';
  if(cap&&cap.textContent!==c)cap.textContent=c;
  if(cred&&cred.textContent!==r)cred.textContent=r;
  var empty=!c&&!r;
  if(dl.hidden!==empty)dl.hidden=empty;
  if(dl.classList.contains('has-copy')===empty)dl.classList.toggle('has-copy',!empty);
}
function hook(){
  paint();
  var imm=document.querySelector('.imm');
  if(imm&&!imm.__gjCred){imm.__gjCred=1;new MutationObserver(paint).observe(imm,{attributes:true,attributeFilter:['hidden','class']})}
  addEventListener('hashchange',paint);
  addEventListener('popstate',paint);
}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',hook);else hook();
})();
