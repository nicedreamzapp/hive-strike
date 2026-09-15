// Judge every boss on its own: how hard is each one, actually?
//
// Sixteen bosses share eight attack patterns, so a boss used to be as hard as the pattern it
// drew rather than as hard as the world it stands in. BCOMP levelled their FIRE RATE; this
// measures what that actually adds up to at the player's end -- how often you are forced to
// move, how long the fight lasts, how much of the screen is safe -- one boss at a time, with a
// fixed reference gun so the fights are comparable.
//
//   node tools/boss_table.mjs        three samples per boss
//   node tools/boss_table.mjs 5      five
import fs from 'node:fs';import {spawn} from 'node:child_process';
const SAMPLES=+(process.argv[2]||3);
const SP=fs.mkdtempSync((process.env.TMPDIR||'/tmp')+'/hs-bt-');const PROF=SP+'/p';fs.mkdirSync(PROF,{recursive:true});
const br=spawn('/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',['--headless=new','--mute-audio','--no-first-run','--remote-debugging-port=9530','--user-data-dir='+PROF,'--window-size=520,760','--autoplay-policy=no-user-gesture-required','about:blank'],{stdio:'ignore',detached:true});
const kill=()=>{try{process.kill(-br.pid,'SIGKILL');}catch{}};process.on('exit',kill);process.on('uncaughtException',e=>{kill();console.error(e);process.exit(1);});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let list;for(let i=0;i<40;i++){try{list=await (await fetch('http://127.0.0.1:9530/json')).json();break;}catch{await sleep(250);}}
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
 if(boss&&boss.y>0){const d=Math.hypot(boss.x-x,boss.y-y)-(boss.r+PE+6);if(d<w)w=d;}
 return w;}
// a fixed reference loadout, so "how long did the fight take" means the same thing every time
window.__boss=function(st,frames){
 startStage=st;start();P.inv=1e9;levelIntro=0;
 stageT=LV().len+1;let g=0;while(!bossAlive&&g++<3000)update();
 P.wpn='honey';P.lvl=3;
 const hp0=boss?boss.max:0, nm=boss?boss.name:'?';
 let f=0,forced=0,fired=0,safe=0,samp=0,killed=0,doomed=0,penned=0;
 const _es=window.eshot,_ep=window.epush;
 window.eshot=function(){const k=ebullets.length;_es.apply(null,arguments);if(ebullets.length>k)fired++;};
 window.epush=function(o){const k=ebullets.length;_ep(o);if(ebullets.length>k)fired++;};
 for(;f<frames;f++){
  if(!bossAlive||state!=='play'){killed=1;break;}
  if(_m(P.x,P.y,45)<0)forced++;
  let bx=P.x,by=P.y,bs=_m(P.x,P.y,26);
  for(let a=0;a<16;a++){const th=a/16*6.2831853,nx=Math.max(14,Math.min(W-14,P.x+Math.cos(th)*4.5)),ny=Math.max(30,Math.min(H-20,P.y+Math.sin(th)*4.5));
   const s=_m(nx,ny,26)+(ny>H*.55?2:0);if(s>bs){bs=s;bx=nx;by=ny;}}
  target={x:bx,y:by};
  if(bs<0){penned++;if(P.inv<=0&&(t-(P.mercyT||-9999))>=70)doomed++;}
  update();
  for(const e of enemies){e.ppx=e.x;e.ppy=e.y;}
  if(f%20===0){let fr=0,tt=0;
   for(let gx=20;gx<W;gx+=24)for(let gy=40;gy<H-20;gy+=24){tt++;if(_m(gx,gy,26)>12)fr++;}
   safe+=fr/tt;samp++;}
 }
 window.eshot=_es;window.epush=_ep;
 return {name:nm, hp:hp0|0, killed, secs:+(f/60).toFixed(0),
  forced:+(forced/(f||1)*100).toFixed(1), fired:+(fired/((f||1)/60)).toFixed(1),
  safe:+((safe/(samp||1))*100).toFixed(0), penned:+(penned/(f||1)*100).toFixed(2), doomed};};1`);
const rows=[];
for(let st=1;st<=16;st++){
 const acc={hp:0,secs:0,forced:0,fired:0,safe:0,penned:0,doomed:0,killed:0};let nm='';
 for(let k=0;k<SAMPLES;k++){const r=await ev(`__boss(${st},9000)`);nm=r.name;for(const q in acc)acc[q]+=r[q];}
 for(const q in acc)acc[q]/=SAMPLES;
 const arch=await ev(`BARCH[THEMES[${st-1}].boss]`), p2=await ev(`PHASE2[THEMES[${st-1}].boss].k`);
 rows.push({st,nm,arch,p2,...acc});process.stdout.write('.');
}
console.log('\n');
const p=(v,w)=>String(v).padStart(w);
console.log('  #  boss                 pattern   phase2    HP   kill  shots/s  forced  safe%  verdict');
console.log('  '+'-'.repeat(96));
const fs2=rows.map(r=>r.forced);
const med=[...fs2].sort((a,b)=>a-b)[8];
for(const r of rows){
 const rel=r.forced/Math.max(.2,med);
 const v = r.killed<1 ? 'NEVER DIED (too tanky)' : rel>1.9?'HOT for its world' : rel<0.45?'a pushover' : 'on the line';
 console.log(`  ${p(r.st,2)}  ${r.nm.padEnd(20)} ${p('#'+r.arch,7)} ${r.p2.padEnd(8)} ${p(r.hp|0,5)} ${p(r.secs.toFixed(0)+'s',6)} ${p(r.fired.toFixed(1),7)} ${p(r.forced.toFixed(1)+'%',7)} ${p(r.safe.toFixed(0),5)}  ${v}`);
}
// what the curve says each boss should demand, and the correction that gets it there
const target=h=>2.0+12.0*Math.pow(h,1.3);
const fit=rows.map(r=>{const h=(r.st-1)/15;let m=Math.pow(target(h)/Math.max(0.4,r.forced),-0.55);
 return +Math.max(0.4,Math.min(2.2,m)).toFixed(2);});
console.log('\n  target vs measured, and the correction:');
for(const r of rows){const h=(r.st-1)/15;
 console.log(`  ${String(r.st).padStart(2)}  ${r.nm.padEnd(20)} measured ${String(r.forced.toFixed(1)+'%').padStart(6)}   target ${String(target(h).toFixed(1)+'%').padStart(6)}   BFIT ${fit[r.st-1].toFixed(2)}`);}
console.log('\n  paste into BFIT in src/12_boss_phase_two.js:\n');
console.log('  const BFIT=['+fit.join(',')+'];');
console.log(`\n  median forced movement ${med.toFixed(1)}%   |   unavoidable deaths across every fight: ${rows.reduce((a,r)=>a+r.doomed,0)===0?'none':'SOME - investigate'}`);
ws.close();kill();process.exit(0);
