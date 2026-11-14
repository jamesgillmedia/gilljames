/* Photo lab · two rooms: Horizon and Darkroom. A simple switch, one shared contact sheet,
   the same photographs, the same gestures: tap to enter, pinch out for the sheet, never a dead end.
   Cards never auto-swipe. Same motion with Reduce Motion on. */
(function(){
'use strict';
var $=function(id){return document.getElementById(id)};
var hzB=$('toHorizon'),drB=$('toDarkroom'),where=$('where'),sortB=$('sort'),cam=$('cam'),sheetB=$('sheetBtn');

function current(){return (LAB.rooms&&LAB.rooms.current)||'horizon'}

function applyChrome(){
  var r=current();
  document.body.classList.toggle('hz',r==='horizon');
  document.body.classList.toggle('dr',r==='darkroom');
  if(hzB){hzB.classList.toggle('on',r==='horizon');hzB.setAttribute('aria-pressed',r==='horizon');hzB.setAttribute('aria-selected',r==='horizon')}
  if(drB){drB.classList.toggle('on',r==='darkroom');drB.setAttribute('aria-pressed',r==='darkroom');drB.setAttribute('aria-selected',r==='darkroom')}
  if(sortB)sortB.hidden=r!=='horizon';
  var open=LAB.sheet&&LAB.sheet.isOpen();
  if(where&&!open)where.textContent=r;
  var meta=document.querySelector('meta[name=theme-color]');
  if(meta&&!open){var on=document.body.classList.contains('safe');meta.content=r==='darkroom'?(on?'#120202':'#262321'):(on?'#0a0506':'#04070b')}
  if(r==='horizon'&&LAB.horizon&&LAB.horizon.show)LAB.horizon.show();
  else if(LAB.horizon&&LAB.horizon.hide)LAB.horizon.hide();
  if(r==='darkroom'&&LAB.darkroom&&LAB.darkroom.show)LAB.darkroom.show();
  else if(LAB.darkroom&&LAB.darkroom.hide)LAB.darkroom.hide();
}

function closeDownToRoom(){
  if(LAB.layer.dropTo)LAB.layer.dropTo(['horizon','darkroom']);
}

function setRoom(name,fromUser){
  if(name!=='horizon'&&name!=='darkroom')return;
  var prev=current();
  if(name===prev){
    /* already this room: if we are on the sheet, enter it */
    if(fromUser&&LAB.sheet&&LAB.sheet.isOpen())enter(null);
    return;
  }
  closeDownToRoom();
  LAB.rooms.current=name;
  var top=LAB.layer.top();
  if(top==='horizon'||top==='darkroom')LAB.layer.rename(name);
  applyChrome();
  if(fromUser)LAB.hint(name==='horizon'?'horizon: every photograph on a line of light':'darkroom: the paper box, the tray, the line',2800);
}

function enter(i){
  var r=current();
  var p=null;
  if(i!=null&&i>=0&&LAB.horizon&&LAB.horizon.photoAt)p=LAB.horizon.photoAt(i);
  if(r==='horizon'&&LAB.horizon)LAB.horizon.enter(i);
  else if(r==='darkroom'&&LAB.darkroom)LAB.darkroom.enter(p);
}

function leave(){
  var top=LAB.layer.top();
  if(top==='camera back'||top==='day'||top==='wall'){LAB.layer.back();return}
  if(top==='horizon'||top==='darkroom')LAB.layer.back();
}

LAB.rooms={current:'horizon',set:setRoom,enter:enter,leave:leave,apply:applyChrome};

if(hzB)hzB.addEventListener('click',function(){setRoom('horizon',true)});
if(drB)drB.addEventListener('click',function(){setRoom('darkroom',true)});

if(cam)cam.addEventListener('click',function(e){
  /* horizon.js also binds #cam; if we are in the darkroom, let darkroom handle it and stop the horizon handler. */
  if(current()!=='darkroom'||!LAB.darkroom)return;
  e.stopImmediatePropagation();
  LAB.darkroom.camera();
},true);

applyChrome();
})();
