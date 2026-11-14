/* tiled-moon-v3: Gill's rule, motion behaves the same with Reduce Motion on. Every script on this page asks matchMedia about
 prefers-reduced-motion; this answers "no preference" so nothing switches to a reduced path. Loaded first, before any other script. */
(function(){var mm=window.matchMedia;if(!mm)return;
window.matchMedia=function(q){if(/prefers-reduced-motion/.test(String(q))){var noop=function(){};return{matches:false,media:String(q),onchange:null,addListener:noop,removeListener:noop,addEventListener:noop,removeEventListener:noop,dispatchEvent:function(){return false}}}return mm.call(window,q)}})();
