/* site-v3-pro2 · sound: the sync line. Understated, under the picks and in the player; the mail subject follows the chosen song.
   r4: the per-song picture (faded reel shots behind the stars) is gone at Gill's request; only this plain line stays. */
(function(){
'use strict';
var sk=document.getElementById('sk'),A=[],tk=null;
function mail(k){var t=(window.TRACKS||{})[k]||{};return 'mailto:imjamesgill@gmail.com?subject='+encodeURIComponent('Sync / licensing: '+(t.title||'')+(t.artist?' ('+t.artist+')':''))}
[['#intro','syn-l'],['#player','syn-l syn-lp']].forEach(function(x){var host=document.querySelector(x[0]);if(!host)return;var p=document.createElement('p');p.className=x[1];
  p.innerHTML='available for sync / licensing · <a href="mailto:imjamesgill@gmail.com">imjamesgill@gmail.com</a>';host.appendChild(p);A.push(p.querySelector('a'))});
function tick(){var k;try{k=__sk.sel().k}catch(e){return}if(k!==tk){tk=k;A.forEach(function(a){a.href=mail(k)})}}
if(sk&&window.__sk){setInterval(tick,500);tick()}
})();
