// Re-derive the gun balance table (WBAL in src/06_player_fire.js) from the real game.
// A gun should differ in HOW it kills, not HOW MUCH: every gun's (far+crowd)/2 at Lv5 should
// land on the same power budget, while its far-vs-crowd SHAPE stays its own character.
// What every gun actually does, measured: damage per second at each power level, against a
// single far target (boss range), a single near target, and a spread-out crowd.
import fs from 'node:fs';import {spawn} from 'node:child_process';
const SP=fs.mkdtempSync((process.env.TMPDIR||'/tmp')+'/hs-guns-');const PROF=SP+'/p';fs.mkdirSync(PROF,{recursive:true});
const br=spawn('/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',['--headless=new','--mute-audio','--no-first-run','--remote-debugging-port=9431','--user-data-dir='+PROF,'--window-size=520,760','--autoplay-policy=no-user-gesture-required','about:blank'],{stdio:'ignore',detached:true});
const kill=()=>{try{process.kill(-br.pid,'SIGKILL');}catch{}};process.on('exit',kill);process.on('uncaughtException',e=>{kill();console.error(e);process.exit(1);});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let list;for(let i=0;i<40;i++){try{list=await (await fetch('http://127.0.0.1:9431/json')).json();break;}catch{await sleep(250);}}
const ws=new WebSocket(list.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend={};ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend[d.id])pend[d.id](d);};
const send=(m,p={})=>new Promise(r=>{const i=++id;pend[i]=r;ws.send(JSON.stringify({id:i,method:m,params:p}));});
await send('Page.enable');await send('Runtime.enable');
const ROOT=new URL('..',import.meta.url).href.replace(/\/$/,'');
await send('Page.navigate',{url:ROOT+'/index.html'});await sleep(1800);
const ev=async e=>{const r=await send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true});if(r.result.exceptionDetails)throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0,400));return r.result.result.value;};

await ev(`window.__gun=function(k,lvl,mode,frames,trt){
 startStage=9;start();P.inv=1e9;levelIntro=0;
 enemies.length=0;ebullets.length=0;bullets.length=0;pickups.length=0;
 P.wpn=k;P.lvl=lvl;P.x=W/2;P.y=H-100;P.fireT=0;
 // a target of a given TRAIT, so each gun can be read against the four things it can meet
 const HP=1e9, mk=(x,y)=>{
  const tp = trt==='gunner' ? 'wasp' : 'fly';
  const e=spawn(tp,x,y,{pat: trt==='runner' ? 'charge' : 'none'});
  e.hp=HP;e.maxhp=HP;e.ft=1e9;e.r=22;
  if(trt==='armor')e.elite=1;
  return e;};
 let targets=[];
 if(mode==='far')  targets=[mk(W/2,150)];
 else if(mode==='near') targets=[mk(W/2,380)];
 else for(let i=0;i<8;i++)targets.push(mk(50+i*54,200+(i%3)*70));
 const _w=wave; window.wave=function(){};   // no interference from real waves
 for(let f=0;f<frames;f++){
  P.x=W/2;P.y=H-100;target={x:W/2,y:H-100};
  for(const e of targets){e.dead=0;if(e.hp<HP*0.5){}}
  update();
  for(const e of targets){e.x=e.__x||(e.__x=e.x);e.y=e.__y||(e.__y=e.y);e.dead=0;}
 }
 window.wave=_w;
 let dmg=0;for(const e of targets)dmg+=HP-e.hp;
 enemies.length=0;bullets.length=0;
 return Math.round(dmg/(frames/60));
};1`);

const KEYS=await ev(`Object.keys(WEAPONS)`);
const rows=[];
const TRAITS=['swarm','armor','runner','gunner'];
for(const k of KEYS){
 const r={gun:k,name:(await ev(`WEAPONS[${JSON.stringify(k)}].name`)),t:{}};
 for(const trt of TRAITS){
  const far=await ev(`__gun(${JSON.stringify(k)},5,"far",420,${JSON.stringify(trt)})`);
  const crowd=await ev(`__gun(${JSON.stringify(k)},5,"crowd",420,${JSON.stringify(trt)})`);
  r.t[trt]=Math.round((far+crowd)/2);
 }
 r.far5=r.t.swarm; r.crowd5=r.t.swarm;
 r.budget=Math.round(TRAITS.reduce((a,x)=>a+r.t[x],0)/TRAITS.length);
 rows.push(r); process.stdout.write('.');
}
console.log('\n');
const pad=(v,w)=>String(v).padStart(w);
console.log('gun                     swarm  armor runner gunner | budget   best        worst');
console.log('-'.repeat(84));
for(const r of rows){const e=Object.entries(r.t).sort((a,b)=>b[1]-a[1]);
 console.log(`${r.name.padEnd(22)} ${pad(r.t.swarm,5)} ${pad(r.t.armor,6)} ${pad(r.t.runner,6)} ${pad(r.t.gunner,6)} | ${pad(r.budget,6)}   ${e[0][0].padEnd(11)} ${e[3][0]}`);}
fs.writeFileSync(SP+'/guns.json',JSON.stringify(rows,null,1));
const budget=rows.map(r=>({g:r.gun,b:r.budget}));
const tgt=budget.reduce((a,x)=>a+x.b,0)/budget.length;
console.log(`\npower budget (far+crowd)/2 at Lv5, target ${tgt.toFixed(0)}:`);
const off=budget.filter(x=>Math.abs(x.b-tgt)/tgt>0.12);
for(const x of budget)if(Math.abs(x.b-tgt)/tgt>0.12)console.log(`  ${x.g.padEnd(9)} ${x.b.toFixed(0).padStart(4)}   <- off budget, suggest WBAL x${(tgt/x.b).toFixed(2)}`);
{const sw=rows.map(r=>Math.max(...Object.values(r.t))/Math.max(1,Math.min(...Object.values(r.t))));
 console.log(`\nmatchup swing (best trait vs worst, per gun): ${Math.min(...sw).toFixed(2)}x to ${Math.max(...sw).toFixed(2)}x`);
 if(Math.max(...sw)<1.5)console.log('  (warning: matchups are too flat to notice)');}
if(off.length){console.log('\nFAIL - '+off.length+' gun(s) off the power budget by more than 12%');process.exitCode=1;}
else console.log('\nPASS - every gun sits on the same power budget; only its shape differs.');
ws.close();kill();process.exit(0);
