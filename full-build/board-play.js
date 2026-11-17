/* board-play.js · a film board opens the film player (Gill, Nov 14).
   The hub's film board had two steps, ‹ back and closer ›, and no way on to the film itself. This adds the third: ▶ play, between
   them, which opens that film's own page in the m4 sky's film player (src/sky/player/tonight/fable-m4/film/<slug>/).
   It is one page visit, so Browser Back returns to this same board.
   One small file, loaded by one line in index.html. blend.js is not touched: this only reads __cb.board() for the open film.
   The button is a plain button in the board's own nav, so it takes the board's own style (44px, cool ink, mint focus ring).
   It shows only for a film the m4 player has a page for (graph.js keeps that list with the room table; nothing is probed),
   and never on a masked board (the same rule closer › follows). */
(function(){
'use strict';
var bd=document.getElementById('board'),bn=bd&&bd.querySelector('.bn'),closer=document.getElementById('bcloser');
if(!bn||!closer||!window.__cb||!__cb.board)return;

var b=document.createElement('button');b.type='button';b.id='bplay';b.hidden=true;b.textContent='\u25B6 play';b.setAttribute('aria-label','play this film');
bn.insertBefore(b,closer);
function slug(){var s=__cb.board();return s&&s.slug?String(s.slug):''}
function href(s){var G=window.GJ&&GJ.graph;return G&&G.film?G.film(s):null}
function sync(){var s=slug();b.hidden=!s||closer.hidden||!href(s)}
b.addEventListener('click',function(e){e.stopPropagation();var u=href(slug());if(u)location.href=u});
addEventListener('gj-graph',sync);
new MutationObserver(sync).observe(bd,{attributes:true,attributeFilter:['hidden','class']});
new MutationObserver(sync).observe(closer,{attributes:true,attributeFilter:['hidden']});
addEventListener('pageshow',sync);sync();
})();
