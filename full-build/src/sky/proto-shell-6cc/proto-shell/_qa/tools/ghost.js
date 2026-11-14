const L=require('./lib');const {sleep,touch,launch,DEVICES,Run}=L;
(async()=>{const b=await launch();let bad=0;const chk=(n,c,x='')=>{console.log(c?'PASS':'FAIL',n,x);if(!c)bad++};
for(const dev of ['iphone-15-pro','desktop']) for(const th of ['night','red']){
 const d=DEVICES[dev];const ctx=await b.newContext({...d});const p=await ctx.newPage();const cdp=d.hasTouch?await ctx.newCDPSession(p):null;
 await p.goto(`http://127.0.0.1:8777/?theme=${th}`);await p.waitForFunction(()=>window.__shell&&__shell.ready);await sleep(1200);
 await p.click('#crumb .sig');await p.click('.mm-tune');await sleep(300);
 const r=await p.evaluate(()=>{const i=document.querySelector('#markmenu input[data-k="gj.tune.mood"]');const b=i.getBoundingClientRect();return [b.left,b.top+b.height/2,b.width]});
 const x0=r[0]+r[2]*.5,y0=r[1];
 if(cdp){await touch(cdp,'touchStart',[[x0,y0]]);for(let i=1;i<=6;i++){await touch(cdp,'touchMove',[[x0+i*10,y0]]);await sleep(30)}}
 else{await p.mouse.move(x0,y0);await p.mouse.down();for(let i=1;i<=6;i++){await p.mouse.move(x0+i*10,y0);await sleep(30)}}
 await sleep(300);
 const held=await p.evaluate(()=>({menu:getComputedStyle(document.getElementById('markmenu')).opacity,ghost:getComputedStyle(document.getElementById('ghostdial')).opacity,on:document.getElementById('ghostdial').classList.contains('on'),arc:document.querySelector('#ghostdial .gd-arc').getAttribute('d'),name:document.querySelector('#ghostdial .gd-name').textContent,box:(()=>{const q=document.querySelector('#ghostdial .gd-arc').getBBox();return [q.x,q.y,q.width,q.height].map(Math.round)})(),dock:(()=>{const q=document.getElementById('snd').getBoundingClientRect();return [Math.round(q.top)]})(),W:innerWidth}));
 chk(`${dev}/${th}: held: menu gone, ghost dial up (${held.name}, arc box ${held.box}, vw ${held.W})`,held.menu==='0'&&held.on&&+held.ghost>.9);
 const side=held.box[0]>held.W/2?'right':'left';chk(`${dev}/${th}: dial sits on the edge away from the thumb (${side}, thumb x ${Math.round(x0)})`,(x0<held.W/2)===(side==='right'));
 chk(`${dev}/${th}: dial clear of the player (bottom ${held.box[1]+held.box[3]} < dock ${held.dock})`,held.box[1]+held.box[3]<held.dock[0]);
 await p.screenshot({path:`/tmp/qa/j/ghost-${dev}-${th}-held.png`,scale:'css'});
 if(cdp)await touch(cdp,'touchEnd',[]);else await p.mouse.up();
 await sleep(120);const rel=await p.evaluate(()=>({menu:getComputedStyle(document.getElementById('markmenu')).opacity,on:document.getElementById('ghostdial').classList.contains('on')}));
 chk(`${dev}/${th}: after release the menu is back and the dial lingers`,rel.menu==='1'&&rel.on);
 await sleep(1300);chk(`${dev}/${th}: dial gone about a second after release`,!(await p.evaluate(()=>document.getElementById('ghostdial').classList.contains('on'))));
 // on the film board there is no safe place: the menu stays
 await p.evaluate(()=>{GJ_MARKMENU.show(false);__shell.go({lv:2,k:'film'})});await sleep(2200);await p.click('#crumb .sig');
 const r2=await p.evaluate(()=>{const i=document.querySelector('#markmenu input[data-k="gj.tune.fdens"]');if(!i)return null;const b=i.getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]});
 if(r2){await p.evaluate(()=>{const m=document.querySelector('.mm-tune');if(m.getAttribute('aria-expanded')!=='true')m.click()});await sleep(200);
  const r3=await p.evaluate(()=>{const i=document.querySelector('#markmenu input[data-k="gj.tune.fdens"]');const b=i.getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]});
  await p.mouse.move(r3[0],r3[1]);await p.mouse.down();await p.mouse.move(r3[0]+30,r3[1],{steps:4});await sleep(250);
  const f=await p.evaluate(()=>({menu:getComputedStyle(document.getElementById('markmenu')).opacity,on:document.getElementById('ghostdial').classList.contains('on')}));
  chk(`${dev}/${th}: over the film board the dial stays away and the menu stays`,f.menu==='1'&&!f.on,JSON.stringify(f));await p.mouse.up()}
 await ctx.close()}
// Reduce Motion: no animation
{const ctx=await b.newContext({...DEVICES.desktop,reducedMotion:'reduce'});const p=await ctx.newPage();await p.goto('http://127.0.0.1:8777/');await p.waitForFunction(()=>window.__shell&&__shell.ready);
 const t=await p.evaluate(()=>getComputedStyle(document.getElementById('ghostdial')).transitionDuration);chk('Reduce Motion: dial has no transition ('+t+')',/^0s/.test(t));await ctx.close()}
await b.close();process.exit(bad?1:0)})();
