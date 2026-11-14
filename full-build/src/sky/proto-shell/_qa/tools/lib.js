const { chromium } = require('playwright-core');
const fs = require('fs'), path = require('path');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const DEVICES = {
  'iphone-se':     { viewport:{width:375,height:667}, deviceScaleFactor:2, isMobile:true, hasTouch:true },
  'iphone-15-pro': { viewport:{width:393,height:852}, deviceScaleFactor:3, isMobile:true, hasTouch:true },
  'iphone-pro-max':{ viewport:{width:430,height:932}, deviceScaleFactor:3, isMobile:true, hasTouch:true },
  'phone-landscape':{ viewport:{width:844,height:390}, deviceScaleFactor:2, isMobile:true, hasTouch:true },
  'ipad':          { viewport:{width:820,height:1180}, deviceScaleFactor:2, isMobile:true, hasTouch:true },
  'desktop':       { viewport:{width:1440,height:900}, deviceScaleFactor:1 },
};
const launch = () => chromium.launch({ executablePath:'/usr/local/bin/google-chrome', args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--autoplay-policy=no-user-gesture-required'] });
async function touch(cdp, type, pts){ await cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts.map((q,i)=>({x:q[0],y:q[1],id:i+1}))}) }
async function pinch(cdp,cx,cy,d0,d1,steps=8){ await touch(cdp,'touchStart',[[cx-d0/2,cy],[cx+d0/2,cy]]); for(let i=1;i<=steps;i++){const d=d0+(d1-d0)*i/steps;await touch(cdp,'touchMove',[[cx-d/2,cy],[cx+d/2,cy]]);await sleep(16)} await touch(cdp,'touchEnd',[]) }
async function tap(cdp,x,y){ await touch(cdp,'touchStart',[[x,y]]); await sleep(40); await touch(cdp,'touchEnd',[]) }
function lum(c){const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])}
class Run {
  constructor(build, device, theme, rm, outdir){ this.build=build; this.device=device; this.theme=theme; this.rm=rm; this.dir=path.join(outdir,device); fs.mkdirSync(this.dir,{recursive:true}); this.steps=[]; this.n=0; this.frames=[]; this.log=[]; }
  async init(browser, url){
    const d=DEVICES[this.device]; this.d=d; this.touch=!!d.hasTouch;
    this.ctx=await browser.newContext({...d,reducedMotion:this.rm}); this.p=await this.ctx.newPage(); this.errs=[];
    this.p.on('pageerror',e=>this.errs.push(String(e)));
    this.cdp=this.touch?await this.ctx.newCDPSession(this.p):null;
    await this.p.goto(url);
  }
  async shot(label){ this.n++; const f=`${this.theme}-${this.rm==='reduce'?'rm-':''}${String(this.n).padStart(2,'0')}-${label.replace(/[^a-z0-9]+/gi,'_')}.png`; await this.p.screenshot({path:path.join(this.dir,f),scale:'css'}); this.frames.push({f,label}); return path.join(this.dir,f) }
  async step(name, fn){ let ok=true,msg=''; try{ const r=await fn(); if(r===false)ok=false; else if(typeof r==='string'){ok=false;msg=r} else if(r&&r.fail){ok=false;msg=r.fail} }catch(e){ok=false;msg=String(e.message||e).split('\n')[0]}
    this.steps.push({name,ok,msg}); try{await this.shot(name+(ok?'':' FAIL'))}catch(e){} return ok }
  async darkBg(){ // desktop-dark rule: the page background and every screenshot corner/edge stay dark
    const r=await this.p.evaluate(()=>{const c=s=>getComputedStyle(s).backgroundColor;return [c(document.documentElement),c(document.body)]});
    const num=s=>(s.match(/[\d.]+/g)||[0,0,0]).map(Number);const L=r.map(s=>{const m=num(s);return m.length>3&&m[3]===0?0:lum(m)});
    return Math.max(...L)<.03 }
  async cornerLum(){ const buf=await this.p.screenshot({scale:'css'}); return await this.p.evaluate(async b64=>{const im=new Image();im.src='data:image/png;base64,'+b64;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const q=c.getContext('2d');q.drawImage(im,0,0);const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};let mx=0;const pts=[[2,2],[im.width-3,2],[2,im.height-3],[im.width-3,im.height-3],[im.width/2|0,im.height-3]];pts.forEach(p=>{const d=q.getImageData(p[0],p[1],1,1).data;const l=.2126*f(d[0])+.7152*f(d[1])+.0722*f(d[2]);if(l>mx)mx=l});return mx},buf.toString('base64')) }
  async close(){ await this.ctx.close() }
}
module.exports={chromium,sleep,DEVICES,launch,touch,pinch,tap,lum,Run,fs,path};
