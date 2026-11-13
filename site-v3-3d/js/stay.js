/* site-v3-3d · <base href="../site-v3/"> would send list, card, and hash links
   to today's site-v3. Rewrite them so they stay here. */
(function(){
'use strict';
function here(){
  var p=location.pathname||'';
  if(/\/site-v3-3d(?:\/|$)/.test(p))return p.replace(/\/site-v3-3d\/.*$/,'/site-v3-3d/');
  return p.replace(/\/[^/]*$/,'/') ;
}
function rewrite(href){
  if(!href||/^(mailto:|tel:|https?:|\/{2})/i.test(href))return null;
  if(href.indexOf('site-v3-3d')!==-1)return null;
  var m;
  if(href==='list/'||href==='list')return here()+'list/';
  m=href.match(/^(film|photo|objects|sound|about)\/#?(w\w+|wave)?$/);
  if(m){
    if(m[1]==='sound'&&(!m[2]||m[2]==='wave'||m[2]==='w4'))return here()+'sound/';
    if(m[2])return here()+'#'+m[1]+'/'+m[2];
    return here()+'#sky/'+m[1];
  }
  if(href.charAt(0)==='#')return here()+href;
  return null;
}
function patch(){
  [].forEach.call(document.querySelectorAll('a[href]'),function(a){
    var n=rewrite(a.getAttribute('href'));
    if(n)a.setAttribute('href',n);
  });
}
document.addEventListener('click',function(e){
  var a=e.target.closest&&e.target.closest('a[href]');
  if(!a)return;
  var n=rewrite(a.getAttribute('href'));
  if(!n)return;
  a.setAttribute('href',n);
},true);
if(document.readyState==='loading')addEventListener('DOMContentLoaded',patch);
else patch();
addEventListener('hashchange',patch);
})();
