/* previews · feedback. No backend: Send opens a mailto: to the agent inbox, Copy puts the same text on the clipboard,
   and the last draft per item lives in localStorage so a half-typed note is never lost. */
(function(){'use strict';
var TO='gilljames@mail.grokbot.com',BASE=new URL('.',location.href).href,KEY='pvfb:',REACT=[['Love','♥'],['Needs work','↻'],['Note','✎']];
var TZ='America/Vancouver',ITEMS=[];
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function $(s,r){return(r||document).querySelector(s)}function $$(s,r){return[].slice.call((r||document).querySelectorAll(s))}
function stem(f){return String(f||'').split('/').pop().replace(/\.[^.]+$/,'')}
function fileUrl(f){try{return new URL(f,BASE).href}catch(e){return f}}
function getD(f){try{return JSON.parse(localStorage.getItem(KEY+f))||{}}catch(e){return{}}}
function setD(f,d){try{if(!d.r&&!d.note)localStorage.removeItem(KEY+f);else localStorage.setItem(KEY+f,JSON.stringify(d))}catch(e){}}
function when(iso){try{var d=new Date(iso);return new Intl.DateTimeFormat('en-US',{timeZone:TZ,weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(d)}catch(e){return iso||''}}
function nowStr(){var d=new Date(),v='';try{v=new Intl.DateTimeFormat('en-CA',{timeZone:TZ,dateStyle:'medium',timeStyle:'short'}).format(d)+' Vancouver'}catch(e){}return d.toISOString()+(v?' ('+v+')':'')}

/* one form, same markup everywhere (rail card, grid card, player) */
function form(it,o){o=o||{};var f=it.file||'',d=getD(f),id='fb'+Math.random().toString(36).slice(2,7);
  return'<div class="fb" data-file="'+esc(f)+'" data-title="'+esc(it.title||'')+'" data-time="'+esc(it.time||'')+'">'+(o.noHead?'':'<p class="fbh">Your feedback</p>')+
  '<div class="fbr" role="group" aria-label="Reaction to '+esc(it.title||'this preview')+'">'+REACT.map(function(r){return'<button type="button" class="fbb" data-r="'+r[0]+'" aria-pressed="'+(d.r===r[0])+'"><i aria-hidden="true">'+r[1]+'</i>'+r[0]+'</button>'}).join('')+'</div>'+
  '<div class="fbn"><input type="text" id="'+id+'" maxlength="300" enterkeyhint="send" autocomplete="off" autocapitalize="sentences" placeholder="one line for Artist Agent…" aria-label="One line of feedback for '+esc(it.title||'this preview')+'" value="'+esc(d.note||'')+'"><button type="button" class="fbs">Send</button></div>'+
  '<div class="fbx"><button type="button" class="fbc">Copy</button><span class="fbst" role="status" aria-live="polite"></span></div></div>'}

function compose(box){var f=box.dataset.file,d=getD(f),t=box.dataset.title,body=['Preview: '+t,'Reaction: '+(d.r||'(none)'),'Note: '+(d.note||'(none)'),'Item file: '+fileUrl(f),'Page: '+BASE+'#'+(function(){var it=ITEMS.filter(function(i){return i.file===f})[0];return it?it.section+'/'+stem(f):''})(),
  box.dataset.time?'Item posted: '+box.dataset.time:'','Sent: '+nowStr()].filter(Boolean).join('\n'),subject='Preview feedback: '+t;
  return{subject:subject,body:body}}
function status(box,msg,cls){var s=$('.fbst',box);if(s){s.textContent=msg;s.className='fbst'+(cls?' '+cls:'')}}
function sync(box,skipInput){var f=box.dataset.file,d=getD(f);$$('.fb').forEach(function(b){if(b.dataset.file!==f)return;
  $$('.fbb',b).forEach(function(x){x.setAttribute('aria-pressed',String(d.r===x.dataset.r))});var i=$('input',b);if(i&&i!==skipInput&&i.value!==(d.note||''))i.value=d.note||''})}
function ok(box){var d=getD(box.dataset.file);if(!d.r&&!d.note){status(box,'Tap Love, Needs work or Note, or type a line first.','warn');return false}return true}
function send(box){if(!ok(box))return;var m=compose(box),url='mailto:'+TO+'?subject='+encodeURIComponent(m.subject)+'&body='+encodeURIComponent(m.body);
  status(box,'Opening your mail app… hit send there. If nothing opens, tap Copy.','ok');var a=document.createElement('a');a.href=url;a.style.display='none';document.body.appendChild(a);a.click();a.remove()}
function copy(box){if(!ok(box))return;var m=compose(box),txt='To: '+TO+'\nSubject: '+m.subject+'\n\n'+m.body;
  function done(){status(box,'Copied. Paste it into an email to '+TO,'ok')}
  function fb(){var t=document.createElement('textarea');t.value=txt;t.setAttribute('readonly','');t.style.cssText='position:fixed;left:-9999px;top:0;font-size:16px';document.body.appendChild(t);t.select();t.setSelectionRange(0,txt.length);var r=false;try{r=document.execCommand('copy')}catch(e){}t.remove();r?done():status(box,'Could not copy. Long-press the note and copy it by hand.','warn')}
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(done,fb);else fb()}

document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.fb button');if(!b)return;var box=b.closest('.fb'),f=box.dataset.file;
  if(b.classList.contains('fbb')){var d=getD(f);d.r=d.r===b.dataset.r?'':b.dataset.r;setD(f,d);sync(box);status(box,'');if(d.r==='Note'){var i=$('input',box);i&&i.focus()}}
  else if(b.classList.contains('fbs'))send(box);else if(b.classList.contains('fbc'))copy(box)});
document.addEventListener('input',function(e){var i=e.target;if(!i.closest||!i.closest('.fb')||i.tagName!=='INPUT')return;var box=i.closest('.fb'),f=box.dataset.file,d=getD(f);d.note=i.value;setD(f,d);sync(box,i);status(box,'')});
document.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.closest&&e.target.closest('.fb')&&e.target.tagName==='INPUT'){e.preventDefault();send(e.target.closest('.fb'))}});

/* the rail */
var rail=document.createElement('section'),togBtn=null,shown=false;rail.className='frail sheet';rail.id='frail';rail.hidden=true;rail.setAttribute('aria-label','Latest previews: leave feedback');
function pick(){return ITEMS.filter(function(i){return i.badge==='Latest'&&i.file&&i.type!=='placeholder'}).concat(ITEMS.filter(function(i){return i.badge==='Current direction'&&i.file&&i.type!=='placeholder'}))}
function build(){var a=pick();if(!a.length){rail.innerHTML='';return}
  rail.innerHTML='<div class="frh"><h2>Latest<small>Tap a reaction, add a line, Send.</small></h2><button type="button" class="frx" aria-label="Close latest">✕</button></div><ul class="frt">'+a.map(function(it){
    var bg=it.poster?' style="background-image:url(\''+esc(it.poster)+'\')"':'';
    return'<li><article class="card'+(it.badge==='Current direction'?' cur':'')+'"><button type="button" class="frp"'+bg+' data-go="'+esc(it.section+'/'+stem(it.file))+'" aria-label="Open large: '+esc(it.title)+'"><b>'+(it.type==='audio'?'▶ Listen':'▶ Play')+'</b></button><div class="cb"><div class="meta"><time class="when" datetime="'+esc(it.time)+'">'+when(it.time)+'</time><span class="badge">'+esc(it.badge)+'</span></div><h3 class="ct">'+esc(it.title)+'</h3>'+(it.desc?'<p class="cx">'+esc(it.desc)+'</p>':'')+form(it,{noHead:1})+'</div></article></li>'}).join('')+'</ul>'}
rail.addEventListener('click',function(e){var g=e.target.closest('[data-go]');if(g){setSheet(false);location.hash='#'+g.dataset.go;return}if(e.target.closest('.frx'))setSheet(false,1)});
function inList(){return!document.documentElement.classList.contains('sky-on')}
function place(){var l=inList(),plain=$('#plain'),hd=plain&&$('.ttl',plain);
  if(l){if(hd&&rail.parentNode!==plain)hd.insertAdjacentElement('afterend',rail);rail.className='frail inline';rail.hidden=!pick().length}
  else{if(rail.parentNode!==document.body)document.body.appendChild(rail);rail.className='frail sheet';rail.hidden=!shown}
  if(togBtn)togBtn.setAttribute('aria-expanded',String(!l&&shown))}
function setSheet(v,user){shown=v;if(user)try{sessionStorage.setItem('pvfb:seen','1')}catch(e){}place()}
function init(data){ITEMS=(data.items||[]).filter(function(i){return i&&i.section});build();
  var hud=$('#shud'),lst=$('#toList');if(hud&&lst&&!togBtn){togBtn=document.createElement('button');togBtn.type='button';togBtn.className='hb o fbtog';togBtn.id='fbtog';togBtn.setAttribute('aria-controls','frail');togBtn.setAttribute('aria-expanded','false');togBtn.innerHTML='✎ Latest';
    togBtn.addEventListener('click',function(){setSheet(!shown,1)});hud.insertBefore(togBtn,lst)}
  var seen=0;try{seen=sessionStorage.getItem('pvfb:seen')}catch(e){}
  if(!seen&&(/^#?(sky)?$/.test(location.hash))&&pick().length)shown=true;
  place();new MutationObserver(place).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  addEventListener('hashchange',function(){if(/^#.+\/.+/.test(location.hash)&&!/^#(sky|list)\//.test(location.hash)&&shown)setSheet(false)})}
fetch('previews.json?v='+Date.now(),{cache:'no-store'}).then(function(r){return r.json()}).then(init).catch(function(){});

/* the player's own copy for whichever item is open */
window.PVFB={form:form,mountPlayer:function(it){var m=$('#pfb');if(!m)return;if(!it||!it.file){m.hidden=true;m.innerHTML='';return}m.hidden=false;m.innerHTML=form(it,{noHead:1})}};
})();
