/* About · bio · Stop flashing, back on the bio itself (Gill, Nov 14). The accessibility switch from the about-noflash pass
 (fable-m4-work #bioflash, Nov 12; on gill-sky it shipped as the "light" plate's Stop flashing switch in tonight/about/bio,
 c9621b3) only survived inside the + drawer on main. This is that switch again: one quiet pill with an LED, only while the bio
 is open, same key and API (gj.noflash via GJ_BIOCTL). On: the calculator, the glitch and the flicker hold still on one frame.
 Off (the default): the glitch exactly as it is. */
(function(){
'use strict';
var el=null;
function B(){return window.GJ_BIOCTL||null}
function active(){var u=window.__u1;if(!u||!u.bio||!B())return false;var b=u.bio,c=u.cur||{};
  if(!b.on||b.exit||b.moon)return false;return c.k==='about'&&c.lv===2&&c.id==='about/bio'}
function build(){el=document.createElement('button');el.type='button';el.id='bioflash';el.setAttribute('aria-pressed','false');el.hidden=true;
  el.innerHTML='<i class="led" aria-hidden="true"></i><span>stop flashing</span>';document.body.appendChild(el);
  ['pointerdown','pointerup','touchstart','touchend','wheel'].forEach(function(t){el.addEventListener(t,function(e){e.stopPropagation()},{passive:true})});
  el.addEventListener('click',function(e){e.stopPropagation();e.preventDefault();window.__gjNavSwallow=Date.now()+300;var b=B();if(!b)return;b.setNoflash(!b.noflash());paint()})}
function place(){var lr=document.getElementById('lrail'),r=lr&&lr.getBoundingClientRect();
  if(r&&r.height){el.style.top=Math.round(r.bottom+14)+'px';el.style.right=Math.max(6,Math.round(innerWidth-r.right-4))+'px'}}
function paint(){if(!el)build();var on=active()&&!(window.GJ_MARKMENU&&GJ_MARKMENU.open)&&!document.documentElement.classList.contains('bd-open');
  el.hidden=!on;if(!on)return;var nf=B().noflash();el.setAttribute('aria-pressed',String(nf));el.classList.toggle('on',nf);
  el.setAttribute('aria-label',nf?'stop flashing is on: the calculator and the glitch hold still. Tap to let them move again':'stop flashing: hold the calculator, the glitch and the flicker still');place()}
setInterval(paint,300);addEventListener('resize',paint);
window.GJ_BIOFLASH={paint:paint};
})();
