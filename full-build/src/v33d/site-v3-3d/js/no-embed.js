/* site-v3-3d · never load YouTube or Vimeo, even if a leftover url slips through.
   Also send media URLs that were resolved against this page (ignoring <base>)
   back to site-v3, where the files actually live. */
(function(){
'use strict';
var baseEl=document.querySelector('base');
if(baseEl){
  var base=baseEl.href, dir=location.pathname.replace(/[^/]*$/,'');
  var set=CSSStyleDeclaration.prototype.setProperty;
  CSSStyleDeclaration.prototype.setProperty=function(name, value, pri){
    if(typeof value==='string' && value.indexOf('url(')!==-1){
      value=value.replace(/url\((['"]?)(https?:\/\/[^)'"]+)/g, function(m, q, u){
        try{
          var path=new URL(u).pathname;
          if(path.indexOf(dir)!==0)return m;
          var rel=path.slice(dir.length);
          if(!/^(media|img|fonts)\//.test(rel))return m;
          return 'url('+q+new URL(rel, base).href;
        }catch(e){return m}
      });
    }
    return set.call(this, name, value, pri);
  };
}
var BAD=/youtube|youtu\.be|vimeo/i;
function scrub(){
  [].forEach.call(document.querySelectorAll('iframe,embed,object,a[href]'),function(el){
    var u=el.src||el.href||el.getAttribute('data-src')||'';
    if(BAD.test(u)){
      if(el.tagName==='A'){el.removeAttribute('href');el.setAttribute('hidden','');}
      else{el.removeAttribute('src');el.remove();}
    }
  });
}
var mo=new MutationObserver(scrub);
function start(){mo.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src','href']});scrub()}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',start);else start();
})();
