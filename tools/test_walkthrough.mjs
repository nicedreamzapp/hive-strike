// Walk all 6 levels headlessly: play shot, warning card, boss fight; record JS errors + draw timing.
import fs from 'node:fs';
import {spawn} from 'node:child_process';
const SP=process.env.HS_OUT||fs.mkdtempSync((process.env.TMPDIR||'/tmp')+'/hive-strike-test-');
const PROF=SP+'/brave-prof';fs.mkdirSync(PROF,{recursive:true});
const br=spawn('/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',['--headless=new','--mute-audio','--no-first-run','--remote-debugging-port=9333','--user-data-dir='+PROF,'--window-size=520,760','--autoplay-policy=no-user-gesture-required','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let list;for(let i=0;i<40;i++){try{list=await (await fetch('http://127.0.0.1:9333/json')).json();break;}catch{await sleep(250);}}
const pg=list.find(p=>p.type==='page');
const ws=new WebSocket(pg.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend={};const errs=[];ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend[d.id]){pend[d.id](d);delete pend[d.id];}if(d.method==='Runtime.exceptionThrown')errs.push(d.params.exceptionDetails.exception?.description||d.params.exceptionDetails.text);};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend[i]=r;ws.send(JSON.stringify({id:i,method,params}));});
await send('Page.enable');await send('Runtime.enable');
await send('Page.navigate',{url:'file:///Users/dtribe/Desktop/PROJECTS/hive-strike/index.html'});await sleep(1500);
const ev=async expr=>{const r=await send('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true});if(r.result.exceptionDetails)throw new Error(JSON.stringify(r.result.exceptionDetails));return r.result.result.value;};
const shot=async name=>{await ev(`for(let i=0;i<120;i++)draw();1`);await sleep(30);const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`${SP}/all_${name}.png`,Buffer.from(r.result.data,'base64'));};
await ev(`window.__step=n=>{for(let i=0;i<n;i++){if(state==='play'&&!paused)update();else t++;}};`);
const st=async()=>await ev(`({stage,stageT,levelIntro,bossWarn,levelClear,bossAlive,boss:boss&&{name:boss.name,hp:boss.hp|0,rage:boss.rage},enemies:enemies.length,ebul:ebullets.length,lives:P.lives,score})`);
await shot('title');
await ev(`start();P.inv=1e9;`);
for(let lvl=1;lvl<=16;lvl++){
  await ev(`__step(205)`);                     // intro
  await ev(`__step(700)`);await sleep(40);await shot(`L${lvl}_play`);console.log('  play',JSON.stringify(await st()));
  const types=await ev(`[...new Set(enemies.map(e=>e.type))]`);
  let s;for(let k=0;k<60;k++){await ev(`__step(100)`);s=await st();if(s.bossWarn>0)break;}
  await ev(`__step(120)`);await sleep(40);await shot(`L${lvl}_warn`);
  await ev(`__step(95)`);await ev(`__step(260)`);await sleep(40);await shot(`L${lvl}_boss`);
  s=await st();console.log(`L${lvl}`,JSON.stringify({types,boss:s.boss,ebul:s.ebul}));
  await ev(`if(boss){boss.hp=boss.max*.45;__step(30)}`);s=await st();console.log('  rage',JSON.stringify(s.boss));
  await ev(`if(boss){boss.hp=1;__step(40)}`);           // kill (player bullets do it)
  for(let k=0;k<20;k++){s=await st();if(s.levelClear>0||!s.bossAlive)break;await ev(`if(boss)boss.hp=0;__step(5)`);}
  await ev(`__step(225)`);if((await ev(`state`))==='won'){console.log('WON screen reached');await shot('won');await ev(`continueGame()`);}
}
const timing=await ev(`(()=>{const t0=performance.now();for(let i=0;i<30;i++)draw();return ((performance.now()-t0)/30).toFixed(2);})()`);
console.log('draw ms/frame:',timing,'| JS errors:',errs.length,errs.slice(0,3));
ws.close();br.kill();process.exit(0);
