// Derive WFIT: the per-world correction that puts every world's real pressure on the curve.
//
// Every dial in src/07_levels.js already sits exactly on the line. What the curve cannot see is
// how each world's BUGS behave -- above all how long a shooter lingers. A spiderling hangs on a
// thread at a fixed height and fires twenty times; a fly diving past gets one volley. So worlds
// with parkers measure far hotter than worlds with passers at the same heat.
//
// This measures what each world actually demands of a player (the share of frames where standing
// still gets you hit, hazards subtracted so it is bugs only), compares it to what its heat says
// it should demand, and prints the multiplier that closes the gap. Paste the array into WFIT.
//
//   node tools/world_fit.mjs          measure and print the table
//   node tools/world_fit.mjs 5        five samples per world instead of three
import fs from 'node:fs';import {spawn} from 'node:child_process';
const SAMPLES=+(process.argv[2]||3);
const SP=fs.mkdtempSync((process.env.TMPDIR||'/tmp')+'/hs-wf-');const PROF=SP+'/p';fs.mkdirSync(PROF,{recursive:true});
const br=spawn('/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',['--headless=new','--mute-audio','--no-first-run','--remote-debugging-port=9510','--user-data-dir='+PROF,'--window-size=520,760','--autoplay-policy=no-user-gesture-required','about:blank'],{stdio:'ignore',detached:true});
const kill=()=>{try{process.kill(-br.pid,'SIGKILL');}catch{}};process.on('exit',kill);process.on('uncaughtException',e=>{kill();console.error(e);process.exit(1);});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let list;for(let i=0;i<40;i++){try{list=await (await fetch('http://127.0.0.1:9510/json')).json();break;}catch{await sleep(250);}}
const ws=new WebSocket(list.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend={};ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend[d.id])pend[d.id](d);};
const send=(m,p={})=>new Promise(r=>{const i=++id;pend[i]=r;ws.send(JSON.stringify({id:i,method:m,params:p}));});
await send('Page.enable');await send('Runtime.enable');
const ROOT=new URL('..',import.meta.url).href.replace(/\/$/,'');
await send('Page.navigate',{url:ROOT+'/index.html'});await sleep(1800);
const ev=async e=>{const r=await send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true});if(r.result.exceptionDetails)throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0,500));return r.result.result.value;};
await ev(`
const PE=4,PB=2;
function _m(x,y,ahead){let w=1e9;
 for(const e of enemies){if(e.dead||e.tiny)continue;
  const evx=e.x-(e.ppx==null?e.x:e.ppx),evy=e.y-(e.ppy==null?e.y:e.ppy);
  const rx=e.x-x,ry=e.y-y,s2=evx*evx+evy*evy;
  const tc=s2>1e-6?Math.max(0,Math.min(ahead,-(rx*evx+ry*evy)/s2)):0;
  const d=Math.hypot(rx+evx*tc,ry+evy*tc)-(e.r+PE);if(d<w)w=d;}
 for(const b of ebullets){if(b.dead||b.kind==='web')continue;
  const rx=b.x-x,ry=b.y-y,s2=b.vx*b.vx+b.vy*b.vy||1e-6,tc=Math.max(0,Math.min(ahead,-(rx*b.vx+ry*b.vy)/s2));
  const d=Math.hypot(rx+b.vx*tc,ry+b.vy*tc)-(b.r+PB);if(d<w)w=d;}
 return w;}
window.__fit=function(st,frames){
 startStage=st;start();P.inv=1e9;levelIntro=0;
 const _wf=window.worldForce; window.worldForce=function(){P.px=P.x;P.py=P.y;};  // bugs only
 let n=0,forced=0,shooterFrames=0,shooterSeen=new Map(),fired=0;
 const _es=window.eshot; window.eshot=function(){const k=ebullets.length;_es.apply(null,arguments);if(ebullets.length>k)fired++;};
 for(let f=0;f<frames;f++){
  if(state!=='play'||bossAlive||bossWarn>0||levelClear>0)break;
  if(_m(P.x,P.y,45)<0)forced++;
  let bx=P.x,by=P.y,bs=_m(P.x,P.y,26);
  for(let a=0;a<16;a++){const th=a/16*6.2831853,nx=Math.max(14,Math.min(W-14,P.x+Math.cos(th)*4.5)),ny=Math.max(30,Math.min(H-20,P.y+Math.sin(th)*4.5));
   const s=_m(nx,ny,26)+(ny>H*.55?2:0);if(s>bs){bs=s;bx=nx;by=ny;}}
  target={x:bx,y:by};
  update();n++;
  for(const e of enemies){e.ppx=e.x;e.ppy=e.y;
   if(e.tiny||e.dead)continue;
   if(SHOOTERS.includes(A(e.type))||SHOOTERS.includes(e.type)){shooterFrames++;shooterSeen.set(e,(shooterSeen.get(e)||0)+1);}}
 }
 window.worldForce=_wf; window.eshot=_es;
 const dwell=[...shooterSeen.values()];
 return {forced:+(forced/(n||1)*100).toFixed(2),
  dwell:+((dwell.reduce((a,b)=>a+b,0)/(dwell.length||1))/60).toFixed(1),
  shooters:+(shooterFrames/(n||1)).toFixed(1),
  fired:+(fired/((n||1)/60)).toFixed(1)};};1`);

const rows=[];
for(let st=1;st<=16;st++){
 const acc={forced:0,dwell:0,shooters:0,fired:0};
 for(let k=0;k<SAMPLES;k++){const r=await ev(`__fit(${st},4200)`);for(const q in acc)acc[q]+=r[q];}
 for(const q in acc)acc[q]/=SAMPLES;
 const name=await ev(`THEMES[${st-1}].name`);
 const h=(st-1)/15;
 rows.push({st,name,h,...acc});
 process.stdout.write('.');
}
console.log('\n');
// what the curve SAYS each world should demand. anchored on the ends, which are already right.
const target=h=>2.0+32.0*Math.pow(h,1.8);
console.log('#  world           heat  dwell  shooters  fired/s |  forced   target   WFIT');
console.log('-'.repeat(76));
const fit=[];
for(const r of rows){
 const tg=target(r.h);
 // cadence is a WAIT, so a world that is too quiet needs a SMALLER number
 let m=Math.pow(tg/Math.max(0.4,r.forced),-0.55);
 m=Math.max(0.35,Math.min(2.2,m));
 fit.push(+m.toFixed(2));
 console.log(`${String(r.st).padStart(2)} ${r.name.replace('THE ','').padEnd(14)} ${r.h.toFixed(2)}  ${r.dwell.toFixed(1).padStart(5)}s ${r.shooters.toFixed(1).padStart(9)} ${r.fired.toFixed(1).padStart(8)} | ${String(r.forced.toFixed(1)).padStart(6)}% ${String(tg.toFixed(1)).padStart(7)}% ${String(m.toFixed(2)).padStart(6)}`);
}
console.log('\npaste into WFIT in src/07_levels.js:\n');
console.log('const WFIT=['+fit.join(',')+'];');
ws.close();kill();process.exit(0);
