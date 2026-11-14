const L=require('./lib');const {sleep,pinch,tap,lum}=L;
const BASE=process.env.BASE||'http://127.0.0.1:8980/fable-m4/';
const cur=p=>p.evaluate(()=>__u1.cur);
async function toSky(p,R){for(let i=0;i<14&&(await p.evaluate(()=>__u1.phase))!=='sky';i++){if(R.touch)await tap(R.cdp,R.d.viewport.width/2,R.d.viewport.height/2);else await p.mouse.click(R.d.viewport.width/2,R.d.viewport.height/2);await sleep(900)}await sleep(1500)}
async function filmPt(p){return p.evaluate(()=>{const c=__u1.map.ch.find(x=>/film/i.test(x.k||x.n||x.t||''))||__u1.map.ch[0];return [c.x,c.y,JSON.stringify(c)]})}
async function journey(R,out){
  const {p}=R;const states=[];const rec=async()=>{states.push(await p.evaluate(()=>{const s=__u1.cur;return [s.lv,s.k,s.id||null,s.b].join('/')}))};
  await p.waitForFunction(()=>window.__u1&&__u1.ready,null,{timeout:30000});await toSky(p,R);
  const vw=R.d.viewport.width,vh=R.d.viewport.height,cx=vw/2,cy=vh/2;
  await R.step('sky',async()=>{await rec();if(!await R.darkBg())return 'page background not dark';const l=await R.cornerLum();if(l>.02)return 'bright corner '+l.toFixed(3)});
  await R.step('into the constellation (film)',async()=>{const f=await filmPt(p);const fx=Math.min(Math.max(f[0],60),vw-60),fy=Math.min(Math.max(f[1],130),vh-170);
    if(R.touch){await pinch(R.cdp,fx,fy,70,150)}else{await p.mouse.click(fx,fy);await sleep(500);await p.mouse.click(fx,fy)}
    await sleep(2200);let c=await cur(p);if(c.k!=='film'||c.lv<1){await p.evaluate(()=>__depth.goTo('film'));await sleep(1800);c=await cur(p);if(c.k!=='film')return 'film not reached '+JSON.stringify(c);await rec();return 'gesture did not reach film (reached via goTo)'}await rec()});
  await R.step('into the board + taps mid-snap',async()=>{
    if(R.touch)await pinch(R.cdp,cx,cy,70,135);else{await p.mouse.move(cx,cy);for(let i=0;i<3;i++){await p.mouse.wheel(0,-100);await sleep(30)}}
    for(let i=0;i<3;i++){await sleep(110);const x=cx-90+i*90,y=cy-60+(i%2)*120;if(R.touch)await tap(R.cdp,x,y);else await p.mouse.click(x,y)}
    await sleep(3200);const c=await cur(p);await rec();
    if(!(c.lv===1&&c.b===1))return 'board not open or a stray tap went through: '+JSON.stringify(c);
    const b=await p.evaluate(()=>__u1.bloom);if(b<.95)return 'board not fully locked, bloom '+b});
  await R.step('tap a film opens its page',async()=>{const t=await p.evaluate(()=>{const ts=__u1.tiles;return ts&&ts[5]});if(!t)return 'no tiles';if(R.touch)await tap(R.cdp,t.x,t.y);else await p.mouse.click(t.x,t.y);await sleep(2600);const c=await cur(p);await rec();if(c.lv!==2)return 'one tap after lock did not open the film: '+JSON.stringify(c)});
  await R.step('back out to the sky',async()=>{for(let i=0;i<5;i++){const c=await cur(p);if(c.lv===0)break;if(R.touch)await pinch(R.cdp,cx,cy,150,70);else await p.goBack();await sleep(2000)}const c=await cur(p);await rec();if(c.lv!==0)return 'did not reach the sky: '+JSON.stringify(c)});
  for(const room of ['film','photo','objects','sound','about','sky']){
    await R.step('nav in: '+room,async()=>{
      await p.evaluate(()=>GJ_MARKMENU.show(true));
      const how=await p.evaluate(r=>{const b=document.querySelector('.mm-rooms [data-go="'+r+'"]');if(b){b.click();return 'mark'}if(window.__depth&&__depth.goTo){__depth.goTo(r);return 'goTo'}return 'none'},room);
      await sleep(1800);const c=await cur(p);await rec();await p.evaluate(()=>GJ_MARKMENU.show(false));
      if(how==='none')return 'no way into '+room;
      if(room==='sky'?c.lv!==0:c.k!==room)return 'did not enter '+room+' ('+how+') '+JSON.stringify(c)});
    await R.step('nav out: '+room+' (back)',async()=>{
      if(room==='sky'){await rec();return}
      const before=await cur(p);
      await p.click('#back');
      await sleep(1400);let c=await cur(p);
      if(c.lv!==0&&c.k===before.k){await p.click('#back');await sleep(1200);c=await cur(p)}
      await rec();
      if(c.lv!==0)return 'back did not leave '+room+' '+JSON.stringify(c)})}
  await R.step('tune menu sliders',async()=>{await p.evaluate(()=>{GJ_MARKMENU.show(true)});await p.evaluate(()=>document.querySelector('.mm-tune').click());
    const px=async()=>p.evaluate(()=>{const c=document.getElementById('cv'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let s=0;for(let i=0;i<d.length;i+=97)s+=d[i]+d[i+1]*3+d[i+2]*7;return s});
    const set=v=>p.evaluate(v=>{const i=document.querySelector('#markmenu input[data-k="gj.tune.mood"]');if(!i)return false;i.value=v;i.dispatchEvent(new Event('input',{bubbles:true}));return true},v);
    if(!await set(200))return 'mood slider missing';await p.evaluate(()=>GJ_MARKMENU.show(false));await sleep(500);const a=await px();
    await p.evaluate(()=>GJ_MARKMENU.show(true));await set(0);await p.evaluate(()=>GJ_MARKMENU.show(false));await sleep(500);const b=await px();
    await p.evaluate(()=>{GJ_MARKMENU.show(true);document.querySelector('.mm-reset:not(.mm-reset-room)').click();GJ_MARKMENU.show(false)});if(a===b)return 'mood does not change the sky'});
  await R.step('ghost dial while a slider is held',async()=>{await p.evaluate(()=>{GJ_MARKMENU.show(false);__depth.goTo('sky')});await sleep(1800);await p.evaluate(()=>{GJ_MARKMENU.show(true)});await p.evaluate(()=>{const t=document.querySelector('.mm-tune');if(t.getAttribute('aria-expanded')!=='true')t.click()});await sleep(250);
    const r=await p.evaluate(()=>{const i=document.querySelector('#markmenu input[data-k="gj.tune.mood"]');i.scrollIntoView({block:'center'});const b=i.getBoundingClientRect();return [b.left+b.width*.5,b.top+b.height/2]});
    if(R.touch){await L.touch(R.cdp,'touchStart',[[r[0],r[1]]]);for(let i=1;i<=5;i++){await L.touch(R.cdp,'touchMove',[[r[0]+i*9,r[1]]]);await sleep(30)}}else{await p.mouse.move(r[0],r[1]);await p.mouse.down();for(let i=1;i<=5;i++){await p.mouse.move(r[0]+i*9,r[1]);await sleep(30)}}
    await sleep(360);const h=await p.evaluate(()=>{const arc=document.getElementById('gjdial-ghost'),menu=document.getElementById('markmenu'),snd=document.getElementById('snd');const q=arc&&arc.querySelector('.gd-arc');const box=q?q.getBBox():null;return {menu:getComputedStyle(menu).opacity,away:menu.classList.contains('gd-away'),peek:menu.classList.contains('mm-peek'),on:!!(arc&&arc.classList.contains('on')),snd:snd?getComputedStyle(snd).opacity:'1',name:arc&&arc.querySelector('.gd-name')?arc.querySelector('.gd-name').textContent:'',box:box?[Math.round(box.x),Math.round(box.y),Math.round(box.width),Math.round(box.height)]:null,W:innerWidth}});
    await R.shot('slider held, ghost dial');
    if(R.touch)await L.touch(R.cdp,'touchEnd',[]);else await p.mouse.up();
    await sleep(200);const mid=await p.evaluate(()=>{const arc=document.getElementById('gjdial-ghost'),menu=document.getElementById('markmenu');return {menu:getComputedStyle(menu).opacity,away:menu.classList.contains('gd-away'),on:!!(arc&&(arc.classList.contains('on')||arc.classList.contains('out')))}});
    await sleep(1200);const gone=await p.evaluate(()=>{const arc=document.getElementById('gjdial-ghost'),menu=document.getElementById('markmenu'),snd=document.getElementById('snd');return {menu:getComputedStyle(menu).opacity,away:menu.classList.contains('gd-away'),on:!!(arc&&(arc.classList.contains('on')||arc.classList.contains('out'))),snd:snd?getComputedStyle(snd).opacity:'1'}});
    await p.evaluate(()=>GJ_MARKMENU.show(false));
    if(!(+h.menu<0.05&&h.on&&h.away&&!h.peek))return 'drawer did not hide / edge arc did not show '+JSON.stringify(h);
    if(+h.snd<0.99)return 'waveform dimmed while the slider was held '+h.snd;
    if(!(h.box&&((h.box[0]<40)||(h.box[0]+h.box[2]>h.W-40))))return 'arc is not on a screen edge '+JSON.stringify(h.box);
    if(!(+mid.menu<0.05&&mid.on))return 'drawer returned before the arc was gone '+JSON.stringify(mid);
    if(gone.on||gone.away||+gone.menu<0.95)return 'drawer did not return about a second after release '+JSON.stringify(gone);
    if(+gone.snd<0.99)return 'waveform dimmed after release '+gone.snd});
  await R.step('Night/Red toggle',async()=>{const t0=await p.evaluate(()=>document.documentElement.dataset.theme);await p.click('#themeBtn');await sleep(600);const t1=await p.evaluate(()=>document.documentElement.dataset.theme);await R.shot('toggled to '+t1);await p.click('#themeBtn');await sleep(600);const t2=await p.evaluate(()=>document.documentElement.dataset.theme);if(!(t0!==t1&&t2===t0))return `toggle broken ${t0}->${t1}->${t2}`;if(!await R.darkBg())return 'bg not dark after toggle'});
  await R.step('waveform player plays and never dims',async()=>{await p.evaluate(()=>__u1.open('sound/waveform'));await sleep(2800);
    const fr=p.frames().find(f=>f.url().includes('player'));if(!fr)return 'player frame missing';await fr.waitForSelector('#pp',{state:'visible',timeout:10000});
    if(await fr.evaluate(()=>document.getElementById('pp').getAttribute('aria-label'))==='play')await fr.click('#pp');await sleep(700);
    const tc0=await fr.evaluate(()=>document.getElementById('tc').textContent);await sleep(2500);const tc1=await fr.evaluate(()=>document.getElementById('tc').textContent);
    const m=await fr.evaluate(()=>{const c=document.getElementById('wf'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};let mx=0,n=0;for(let i=0;i<d.length;i+=4)if(d[i+3]>20){n++;const l=.2126*f(d[i])+.7152*f(d[i+1])+.0722*f(d[i+2]);if(l>mx)mx=l}return {mx,n,title:getComputedStyle(document.getElementById('ttl')).color,tc:getComputedStyle(document.getElementById('tc')).color}});
    const crumb=await p.evaluate(()=>getComputedStyle(document.querySelector('#crumb .where')||document.body).color);await rec();
    if(tc0===tc1)return 'time did not advance';if(m.n<100)return 'waveform not drawn';
    if(R.theme==='red'){const n=s=>s.match(/[\d.]+/g).map(Number);if(!(lum(n(m.title))>lum(n(crumb))))return 'player title not brighter than UI ink '+m.title+' vs '+crumb;if(m.mx<.35)return 'waveform dim '+m.mx.toFixed(2)}
    await fr.click('#pp')});
  await R.step('photo colour sample (board tile)',async()=>{await p.evaluate(()=>{__depth.goTo('film')});await sleep(1500);await p.evaluate(()=>{__u1.scrub(1);__u1.letGo()});await sleep(3200);
    const t=await p.evaluate(()=>__u1.tiles[3]);const buf=await p.screenshot({scale:'css'});
    const col=await p.evaluate(async([b64,x,y])=>{const im=new Image();im.src='data:image/png;base64,'+b64;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const q=c.getContext('2d');q.drawImage(im,0,0);const d=q.getImageData(Math.max(0,x-10),Math.max(0,y-8),20,12).data;let r=0,g=0,b=0,n=0;for(let i=0;i<d.length;i+=4){r+=d[i];g+=d[i+1];b+=d[i+2];n++}return [r/n,g/n,b/n]},[buf.toString('base64'),t.x,t.y]);
    R.log.push(['tile',col]);
    const tiles=await p.evaluate(()=>{const R=__u1.rects||{},rs=R.rects||[],win=R.win||[0,0,innerWidth,innerHeight];return (__u1.tiles||[]).map((t,i)=>{const rc=rs[i]||{};const w=rc.w||0,h=rc.h||0;return {t:t.t,x:t.x,y:t.y,w,h,in:t.x-w/2>=win[0]+2&&t.x+w/2<=win[0]+win[2]-2&&t.y-h/2>=win[1]+2&&t.y+h/2<=win[1]+win[3]-2}}).filter(t=>t.in)});
    const flags=await p.evaluate(async([b64,tiles])=>{const im=new Image();im.src='data:image/png;base64,'+b64;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const q=c.getContext('2d');q.drawImage(im,0,0);const bad=[];
      tiles.forEach(t=>{if(t.x<28||t.y<70||t.x>im.width-28||t.y>im.height-28)return;if(t.w&&t.w<36)return;const ww=Math.max(24,Math.min(72,Math.round((t.w||40)*.7))),hh=Math.max(16,Math.min(48,Math.round((t.h||28)*.7)));const x=Math.max(0,Math.min(im.width-ww,Math.round(t.x-ww/2))),y=Math.max(0,Math.min(im.height-hh,Math.round(t.y-hh/2)));const d=q.getImageData(x,y,ww,hh).data;let r=0,g=0,b=0,n=0;for(let i=0;i<d.length;i+=4){r+=d[i];g+=d[i+1];b+=d[i+2];n++}r/=n;g/=n;b/=n;let v=0;for(let i=0;i<d.length;i+=4)v+=(d[i]-r)**2+(d[i+1]-g)**2+(d[i+2]-b)**2;const std=Math.sqrt(v/n/3),chroma=Math.max(r,g,b)-Math.min(r,g,b),mean=(r+g+b)/3;
        if(std<3&&chroma<8&&mean>80&&mean<180)bad.push(t.t+' grey');else if(std<1.2&&chroma<6&&mean<18)bad.push(t.t+' blank')});return bad},[buf.toString('base64'),tiles]);
    R.log.push(['blank',flags]);await rec();if(flags.length)return 'blank or grey tiles: '+flags.join(', ')});
  await R.step('about bio (m4 layers)',async()=>{await p.evaluate(()=>__u1.open('about/bio'));await sleep(2600);const b=await p.evaluate(()=>__u1.bio);await rec();if(!b.on)return 'bio not up '+JSON.stringify(b);if(!await R.darkBg())return 'bg not dark'});
  await R.step('the mark opens and closes',async()=>{await p.evaluate(()=>{if(window.__depth)__depth.goTo('sky')});await sleep(700);await p.click('#crumb .sig');await sleep(250);const open=await p.evaluate(()=>!document.getElementById('markmenu').hidden);await p.click('#crumb .sig');await sleep(250);const closed=await p.evaluate(()=>document.getElementById('markmenu').hidden);await rec();if(!open||!closed)return 'mark open='+open+' closed='+closed});
  await R.step('swipe out of a room',async()=>{await p.evaluate(()=>__depth.goTo('film'));await sleep(1200);if(R.touch)await pinch(R.cdp,cx,cy,180,55);else{await p.mouse.move(cx,cy);for(let i=0;i<6;i++){await p.mouse.wheel(0,140);await sleep(40)}}await sleep(1600);const c=await cur(p);await rec();if(c.lv!==0)return 'swipe did not leave the room '+JSON.stringify(c)});
  await R.step('spaces link and back',async()=>{await p.evaluate(()=>GJ_MARKMENU.show(true));const href=await p.evaluate(()=>{const a=[].find.call(document.querySelectorAll('.mm-rooms a'),x=>/spaces/.test(x.getAttribute('href')||''));return a?a.href:''});if(!href)return 'spaces link missing';await p.goto(href);await sleep(1200);if(!/spaces/.test(p.url()))return 'spaces did not open '+p.url();await p.goBack();await p.waitForFunction(()=>window.__u1&&__u1.ready,null,{timeout:20000});await sleep(800);await rec()});
  R.states=states;
}
module.exports={journey};
