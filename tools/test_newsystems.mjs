// Targeted checks for the 1.1/1.2 systems: contracts, daily hive, boss job changes,
// volcano columns, crystal ricochet. Same headless-Brave rig as test_walkthrough.mjs.
import fs from 'node:fs';
import {spawn} from 'node:child_process';
const SP=process.env.HS_OUT||fs.mkdtempSync((process.env.TMPDIR||'/tmp')+'/hive-strike-new-');
const PROF=SP+'/brave-prof';fs.mkdirSync(PROF,{recursive:true});
const br=spawn('/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',['--headless=new','--mute-audio','--no-first-run','--remote-debugging-port=9334','--user-data-dir='+PROF,'--window-size=520,760','--autoplay-policy=no-user-gesture-required','about:blank'],{stdio:'ignore',detached:true});
const killBrave=()=>{try{process.kill(-br.pid,'SIGKILL');}catch{}try{br.kill('SIGKILL');}catch{}};
process.on('exit',killBrave);process.on('SIGINT',()=>{killBrave();process.exit(130);});
process.on('uncaughtException',e=>{killBrave();console.error(e);process.exit(1);});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let list;for(let i=0;i<40;i++){try{list=await (await fetch('http://127.0.0.1:9334/json')).json();break;}catch{await sleep(250);}}
const pg=list.find(p=>p.type==='page');
const ws=new WebSocket(pg.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend={};const errs=[];ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend[d.id]){pend[d.id](d);delete pend[d.id];}if(d.method==='Runtime.exceptionThrown')errs.push(d.params.exceptionDetails.exception?.description||d.params.exceptionDetails.text);};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend[i]=r;ws.send(JSON.stringify({id:i,method,params}));});
await send('Page.enable');await send('Runtime.enable');
const ROOT=new URL('..',import.meta.url).href.replace(/\/$/,'');
await send('Page.navigate',{url:ROOT+'/index.html'});await sleep(1500);
const ev=async expr=>{const r=await send('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true});if(r.result.exceptionDetails)throw new Error(JSON.stringify(r.result.exceptionDetails));return r.result.result.value;};
const shot=async name=>{await ev(`for(let i=0;i<3;i++)draw();1`);await sleep(30);const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`${SP}/${name}.png`,Buffer.from(r.result.data,'base64'));};
await ev(`window.__step=n=>{for(let i=0;i<n;i++){if(state==='play'&&!paused)update();else t++;}};1`);
let pass=0,fail=0;const ok=(name,cond)=>{console.log((cond?'PASS':'FAIL')+'  '+name);cond?pass++:fail++;};

// ---- title chips render
await shot('title_chips');

// ---- contracts: mods + multiplier + bombs
for(const [ix,want] of [[2,'guard'],[5,'nobomb'],[6,'royal']]){
  const r=await ev(`contractIx=${ix};start();({id:CONTRACTS[${ix}].id,cmult,bombs:P.bombs,mods:Object.keys(MODS).join(',')})`);
  ok(`contract ${r.id} applies (mult ${r.cmult}, bombs ${r.bombs}, mods ${r.mods})`,
     r.id===want&&(want!=='guard'||r.bombs===5)&&(want!=='nobomb'||r.bombs===0)&&(want!=='royal'||r.mods==='angry,quick'));
}
ok('contract multiplier feeds score', await ev(`contractIx=5;start();score=0;chain=0;addScore(100);score`)===200);
ok('no-bomb contract converts bomb drops', await ev(`contractIx=5;start();pickups=[];for(let i=0;i<20;i++)drop(100,100,'bomb');pickups.every(p=>p.k!=='bomb')`));
// angry contract: boss opens enraged
ok('angry contract: boss wakes enraged', await ev(`contractIx=3;start();stage=2;spawnBoss();boss.rage===1`));

// ---- daily hive: seeded, starts at 1, saves its own best
const d=await ev(`contractIx=0;wantDaily=true;startStage=9;start();({daily:!!dailyRun,stage,mult:cmult})`);
ok(`daily forces level 1 + seeded contract (mult ${d.mult})`,d.daily&&d.stage===1&&d.mult>0);
ok('daily best saved on game over', await ev(`score=4321;P.lives=-1;endRun();dailyBest()===4321||dailyBest()>=4321`));

// ---- centipede mother splits at half health
await ev(`wantDaily=false;contractIx=0;start();stage=6;stageT=0;spawnBoss();__step(300)`);
const c=await ev(`boss.hp=boss.max*.45;__step(200);({rage:boss.rage,twin:!!(boss.seg2&&boss.seg2.length>8),x2:boss.x2|0,segs:boss.seg.length})`);
ok(`centipede splits: twin trail ${c.twin}, main capped ${c.segs}<=90`,c.rage===1&&c.twin&&c.segs<=90);
await shot('centipede_split');

// ---- scorpion tail turret
await ev(`start();stage=8;stageT=0;spawnBoss();__step(300)`);
const s=await ev(`boss.hp=boss.max*.45;__step(10);ebullets=[];__step(300);({turret:!!boss.turret,shots:ebullets.length})`);
ok(`scorpion plants turret and it fires (${s.shots} shots on screen)`,s.turret&&s.shots>0);
await shot('scorpion_turret');

// ---- walking stick camouflage cycles
await ev(`start();stage=9;stageT=0;spawnBoss();__step(300);boss.hp=boss.max*.45;__step(10)`);
const w=await ev(`let seen={hid:0,vis:0};for(let i=0;i<320;i++){update();if(boss){if(boss.camo)seen.hid++;else seen.vis++;}}seen`);
ok(`walking stick camo cycles (hidden ${w.hid}f / visible ${w.vis}f)`,w.hid>50&&w.vis>50);
await shot('stick_camo');

// ---- atlas moth wing shields soak damage, breaking one spills scales
await ev(`start();stage=16;stageT=0;spawnBoss();__step(300);boss.hp=boss.max*.45;__step(5)`);
const m1=await ev(`({wings:!!boss.wings,l:boss.wings&&boss.wings.l|0,r:boss.wings&&boss.wings.r|0})`);
const m2=await ev(`const hp0=boss.hp;boss.wings.l=1;ebullets=[];bullets.push({x:boss.x-30,y:boss.y,vx:0,vy:-8,d:50,r:4,k:'honey'});__step(3);({hpHeld:boss.hp>=hp0-1,broke:boss.wings.l===0,scales:ebullets.filter(b=>b.kind==='dust').length})`);
ok(`moth wings up (${m1.l}/${m1.r}) · wing break spills ${m2.scales} scales, hp held ${m2.hpHeld}`,m1.wings&&m2.broke&&m2.scales>=10&&m2.hpHeld);
await shot('moth_wings');

// ---- volcano ember column: cover for you, death for shots and bugs
await ev(`start();stage=13;stageT=0;levelIntro=0;volc=null;volcNext=1;__step(3)`);
const v1=await ev(`volc?({x:volc.x|0,t:volc.t}):null`);
const v2=await ev(`__step(100);ebullets=[{x:volc.x,y:300,vx:0,vy:2,r:6,col:'#fff',t:0,kind:'dart'}];__step(4);({active:volc&&volc.t>90,shotDied:ebullets.length===0||ebullets[0].dead===1})`);
ok(`volcano column erupts and burns enemy shots (telegraph at t=${v1&&v1.t})`,!!v1&&v2.active&&v2.shotDied);
await shot('volcano_column');

// ---- crystal ricochet: player shots bounce off the walls once
await ev(`start();stage=16;stageT=0;levelIntro=0`);
const cr=await ev(`bullets=[{x:10,y:400,vx:-6,vy:-2,d:10,r:4,k:'honey'}];__step(2);({vx:bullets[0]&&bullets[0].vx,bounced:bullets[0]&&bullets[0].bounced})`);
ok(`crystal ricochet flips vx (now ${cr.vx})`,cr.vx>0&&cr.bounced===1);

// ---- full-speed sanity: 2 minutes of live play on the volcano with a contract on
await ev(`contractIx=6;start();stage=13;stageT=0;__step(7200)`);
const fin=await ev(`({state,score,lives:P.lives})`);
ok(`2min contract run on volcano survives headless (state ${fin.state}, score ${fin.score})`,fin.state==='play'||fin.state==='over');

console.log(`\n${pass} passed, ${fail} failed | JS errors: ${errs.length}`,errs.slice(0,3));
console.log('shots:',SP);
ws.close();killBrave();process.exit(fail||errs.length?1:0);
