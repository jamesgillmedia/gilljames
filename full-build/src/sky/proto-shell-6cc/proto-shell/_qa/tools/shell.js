const L=require('./lib');const {sleep,pinch,tap,lum}=L;
const BASE=process.env.BASE||'http://127.0.0.1:8777/';
const ST=p=>p.evaluate(()=>{const s=__shell.state(),B=(()=>{try{return __shell.world.stop({lv:Math.max(1,s.level.lv),k:'film'})}catch(e){return null}})();return {lv:s.level.lv,k:s.level.k,id:s.level.id,fsn:s.mod&&s.mod.fsn,s:s.cam.s,board:B&&B.s,glide:!!__shell.cam.glide}});
async function tilePt(p,n){return p.evaluate(n=>{const st=__shell.world.stop({lv:2,k:'film'}),M=Shell.mods['film-snap'],it=M.items[n],W=__shell.cam.W,H=__shell.cam.H;return [W/2+(it.bx-st.x)*st.s,H/2+(it.by-st.y)*st.s]},n)}
async function filmPt(p){return p.evaluate(()=>{const c=__shell.sky.chapter('film'),q=__shell.cam.toScreen(c.cx,c.cy);return q})}
async function journey(R,out){
  const {p}=R;const states=[];const rec=async()=>{states.push(await p.evaluate(()=>{const s=__shell.state().level;return [s.lv,s.k,s.id||null].join('/')}))};
  await p.waitForFunction(()=>window.__shell&&__shell.ready,null,{timeout:30000});await sleep(1200);
  const vw=R.d.viewport.width,vh=R.d.viewport.height,cx=vw/2,cy=vh/2;
  await R.step('sky',async()=>{const c=await p.evaluate(()=>__shell.check().ok);await rec();if(!c)return 'player/mark check failed';if(!await R.darkBg())return 'page background not dark';const l=await R.cornerLum();if(l>.02)return 'bright corner '+l.toFixed(3)});
  await R.step('pinch into film',async()=>{const f=await filmPt(p);
    if(R.touch)await pinch(R.cdp,Math.min(Math.max(f[0],60),vw-60),Math.min(Math.max(f[1],120),vh-160),70,140);
    else{await p.mouse.move(f[0],f[1]);for(let i=0;i<3;i++){await p.mouse.wheel(0,-100);await sleep(30)}}
    await sleep(1800);const s=await ST(p);await rec();if(!(s.lv>=1&&s.k==='film'))return 'did not reach film: '+JSON.stringify(s)});
  await R.step('into the board + taps mid-snap',async()=>{
    if(R.touch)await pinch(R.cdp,cx,cy,70,130);else{await p.mouse.move(cx,cy);for(let i=0;i<3;i++){await p.mouse.wheel(0,-100);await sleep(30)}}
    // strays during the settle: three taps, distinct places
    for(let i=0;i<3;i++){await sleep(110);const x=cx-90+i*90,y=cy-60+(i%2)*120;if(R.touch)await tap(R.cdp,x,y);else await p.mouse.click(x,y)}
    await sleep(2200);const s=await ST(p);await rec();
    if(s.lv!==2)return 'a stray tap went through or the board did not open: '+JSON.stringify(s);
    if(Math.abs(s.s-s.board)>1e-3||s.glide)return 'board not locked: s='+s.s+' board='+s.board});
  await R.step('tap a film opens the player',async()=>{const t=await tilePt(p,5);if(R.touch)await tap(R.cdp,t[0],t[1]);else await p.mouse.click(t[0],t[1]);await sleep(1800);const s=await ST(p);await rec();if(s.lv!==3)return 'one tap after lock did not open the film: '+JSON.stringify(s)});
  await R.step('back out to the sky',async()=>{
    for(let i=0;i<3;i++){if(R.touch)await pinch(R.cdp,cx,cy,150,70);else await p.keyboard.press('Escape');await sleep(1700)}
    const s=await ST(p);await rec();if(s.lv!==0)return 'did not reach the sky: '+JSON.stringify(s)});
  for(const room of ['film','sound','photo','sky']){
    await R.step('room: '+room,async()=>{await p.click('#crumb .sig');await p.click('.mm-tune');await p.click(`.mm-rooms [data-go=${room}]`);await sleep(1500);const s=await ST(p);await rec();await p.evaluate(()=>GJ_MARKMENU.show(false));
      if(room==='sky'?s.lv!==0:s.k!==room)return 'room not reached '+JSON.stringify(s)})}
  await R.step('tune menu sliders',async()=>{await p.click('#crumb .sig');await p.click('.mm-tune');
    const px=async()=>p.evaluate(()=>{const c=document.getElementById('cv'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let s=0;for(let i=0;i<d.length;i+=97)s+=d[i]+d[i+1]*3+d[i+2]*7;return s});
    const set=v=>p.evaluate(v=>{const i=document.querySelector('#markmenu input[data-k="gj.tune.mood"]');if(!i)return false;i.value=v;i.dispatchEvent(new Event('input',{bubbles:true}));return true},v);
    if(!await set(200))return 'mood slider missing';await sleep(300);await p.evaluate(()=>GJ_MARKMENU.show(false));await sleep(200);const a=await px();
    await p.evaluate(()=>GJ_MARKMENU.show(true));await set(0);await p.evaluate(()=>GJ_MARKMENU.show(false));await sleep(300);const b=await px();
    await p.evaluate(()=>GJ_MARKMENU.show(true));await p.click('.mm-reset-room');await p.evaluate(()=>GJ_MARKMENU.show(false));
    if(a===b)return 'mood does not change the sky'});
  await R.step('ghost dial while a slider is held',async()=>{await p.evaluate(()=>{GJ_MARKMENU.show(false);__shell.ladder.far&&__shell.ladder.far()});await sleep(1500);await p.click('#crumb .sig');await p.evaluate(()=>{const t=document.querySelector('.mm-tune');if(t.getAttribute('aria-expanded')!=='true')t.click()});await sleep(250);
    const r=await p.evaluate(()=>{const i=document.querySelector('#markmenu input[data-k="gj.tune.mood"]');i.scrollIntoView({block:'center'});const b=i.getBoundingClientRect();return [b.left+b.width*.5,b.top+b.height/2]});
    if(R.touch){await L.touch(R.cdp,'touchStart',[[r[0],r[1]]]);for(let i=1;i<=5;i++){await L.touch(R.cdp,'touchMove',[[r[0]+i*9,r[1]]]);await sleep(30)}}else{await p.mouse.move(r[0],r[1]);await p.mouse.down();for(let i=1;i<=5;i++){await p.mouse.move(r[0]+i*9,r[1]);await sleep(30)}}
    await sleep(320);const h=await p.evaluate(()=>({menu:getComputedStyle(document.getElementById('markmenu')).opacity,on:document.getElementById('ghostdial').classList.contains('on'),dock:document.getElementById('snd').getBoundingClientRect().top,box:(()=>{const q=document.querySelector('#ghostdial .gd-arc').getBBox();return [q.y,q.height]})()}));
    await R.shot('slider held, ghost dial');if(R.touch)await L.touch(R.cdp,'touchEnd',[]);else await p.mouse.up();await sleep(1500);
    const gone=!(await p.evaluate(()=>document.getElementById('ghostdial').classList.contains('on')));await p.evaluate(()=>GJ_MARKMENU.show(false));
    if(!(h.menu==='0'&&h.on))return 'menu did not step aside / dial did not appear '+JSON.stringify(h);if(h.box[0]+h.box[1]>h.dock)return 'dial over the player';if(!gone)return 'dial did not leave'});
  await R.step('Night/Red toggle',async()=>{const t0=await p.evaluate(()=>document.documentElement.dataset.theme);await p.click('#themeBtn');await sleep(500);const t1=await p.evaluate(()=>document.documentElement.dataset.theme);await R.shot('toggled to '+t1);await p.click('#themeBtn');await sleep(500);const t2=await p.evaluate(()=>document.documentElement.dataset.theme);if(!(t0!==t1&&t2===t0))return `toggle broken ${t0}->${t1}->${t2}`;if(!await R.darkBg())return 'bg not dark after toggle'});
  await R.step('waveform player plays and never dims',async()=>{
    await p.evaluate(()=>{localStorage.setItem('gj.tune.mood','0')});
    const m=async()=>p.evaluate(()=>{const c=document.querySelector('#snd .rail canvas'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};let mx=0,ink=0;for(let i=0;i<d.length;i+=4)if(d[i+3]>20){const l=.2126*f(d[i])+.7152*f(d[i+1])+.0722*f(d[i+2]);if(l>mx)mx=l;ink++}return {mx,ink,check:__shell.check(),title:getComputedStyle(document.querySelector('#snd .who b')).color,crumb:getComputedStyle(document.querySelector('#crumb .where')).color}});
    await p.click('#snd .pp');await sleep(2300);const a=await m();await p.evaluate(()=>localStorage.removeItem('gj.tune.mood'));
    if(!a.check.ok||!a.check.wave.playing||a.check.wave.t<1)return 'not playing: '+JSON.stringify(a.check.wave);if(a.ink<200)return 'rail not drawn';
    if(R.theme==='red'){const n=s=>s.match(/[\d.]+/g).map(Number);if(!(lum(n(a.title))>lum(n(a.crumb))))return 'player not brighter than UI ink'; if(a.mx<.5)return 'rail dim '+a.mx.toFixed(2)}
    R.log.push(['rail',a.mx]);await p.click('#snd .pp')});
  await R.step('photo colour sample (board tile)',async()=>{await p.evaluate(()=>__shell.go({lv:2,k:'film'}));await sleep(2200);
    const t=await tilePt(p,3);const buf=await p.screenshot({scale:'css'});
    const col=await p.evaluate(async([b64,x,y])=>{const im=new Image();im.src='data:image/png;base64,'+b64;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const q=c.getContext('2d');q.drawImage(im,0,0);const d=q.getImageData(Math.max(0,x-12),Math.max(0,y-8),24,16).data;let r=0,g=0,b=0,n=0;for(let i=0;i<d.length;i+=4){r+=d[i];g+=d[i+1];b+=d[i+2];n++}return [r/n,g/n,b/n]},[buf.toString('base64'),t[0],t[1]]);
    R.log.push(['tile',col]);await rec()});
  await R.step('about-calc 2D/3D',async()=>{await p.goto(BASE+`?m=about-calc&at=about/board&v=A&theme=${R.theme}`);await p.waitForFunction(()=>window.__shell&&__shell.ready);await sleep(2200);
    let s=await p.evaluate(()=>__shell.state());if(!(s.mod&&s.mod.bio&&s.mod.bio.on&&s.mod.v==='A'))return '2D not up '+JSON.stringify(s.mod);await R.shot('about 2D');
    await p.click('#crumb .sig');await p.click('.mm-tune');await p.click('.mm-toggle [data-v=B]');await sleep(900);await p.evaluate(()=>GJ_MARKMENU.show(false));
    s=await p.evaluate(()=>__shell.state());if(s.mod.v!=='B')return '3D toggle failed';if(!await p.evaluate(()=>__shell.check().ok))return 'player check failed in about-calc';await rec()});
  R.states=states;
}
module.exports={journey};
