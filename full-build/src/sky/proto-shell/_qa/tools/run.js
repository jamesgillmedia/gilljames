const L=require('./lib');const {sleep,launch,DEVICES,Run,fs,path}=L;
const which=process.argv[2]||'shell',outdir=process.argv[3]||'/tmp/qa/j/out',devs=(process.argv[4]||Object.keys(DEVICES).join(',')).split(',');
const J=require('./'+which).journey,BASE=which==='shell'?(process.env.BASE||'http://127.0.0.1:8777/'):(process.env.BASE||'http://127.0.0.1:8980/fable-m4/');
(async()=>{const b=await launch();const report={};
for(const dev of devs){const rep={steps:[],gates:{}};report[dev]=rep;const runs={};
 for(const [theme,rm] of [['night','no-preference'],['red','no-preference'],['night','reduce']]){
  const R=new Run(which,dev,theme,rm,outdir);R.theme=theme;
  try{await R.init(b,BASE+'?theme='+theme+'&t='+Date.now());await J(R,outdir)}catch(e){R.steps.push({name:'journey crashed',ok:false,msg:String(e.message).split('\n')[0]})}
  rep.steps.push(...R.steps.map(s=>({...s,theme,rm})));runs[theme+'/'+rm]=R;rep.errors=(rep.errors||[]).concat(R.errs.map(e=>theme+': '+e));await R.close()}
 const n=runs['night/no-preference'],r=runs['red/no-preference'],m=runs['night/reduce'];
 // gates across runs
 const tn=(n.log.find(x=>x[0]==='tile')||[])[1],tr=(r.log.find(x=>x[0]==='tile')||[])[1];
 rep.gates['photos keep true colour (board tile night vs red)']=tn&&tr?(Math.hypot(tn[0]-tr[0],tn[1]-tr[1],tn[2]-tr[2])<14?'pass':'FAIL '+JSON.stringify([tn,tr])):'n/a';
 rep.gates['Reduce Motion matches (state path)']=JSON.stringify(n.states)===JSON.stringify(m.states)?'pass':'FAIL '+JSON.stringify([n.states,m.states]);
 const wf=name=>rep.steps.filter(s=>s.name.startsWith('waveform')).every(s=>s.ok);rep.gates['waveform plays, renders, never dims (night+red)']=wf()?'pass':'FAIL';
 rep.gates['dark background (all steps, night+red)']=rep.steps.filter(s=>/background|corner/.test(s.msg||'')).length?'FAIL':'pass';
 const blanks=(n.log.find(x=>x[0]==='blank')||[null,[]])[1]||[];rep.gates['no blank or grey tiles']=blanks.length?'FAIL '+blanks.join(', '):'pass';
 rep.pass=rep.steps.filter(s=>s.rm==='no-preference').every(s=>s.ok)&&Object.values(rep.gates).every(g=>g==='pass'||g==='n/a');
 console.log(dev,rep.pass?'PASS':'FAIL',rep.steps.filter(s=>!s.ok).map(s=>`[${s.theme}/${s.rm}] ${s.name}: ${s.msg}`).join(' | '),JSON.stringify(rep.gates).slice(0,300));
 fs.writeFileSync(path.join(outdir,'report.json'),JSON.stringify(report,null,1))}
await b.close()})();
