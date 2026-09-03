// Store screenshots straight out of the running game, at real device resolution.
// Apple 6.7" wants 1290x2796, Play wants at least 1080x1920.  node tools/store_shots.mjs
import fs from 'node:fs';import {spawn} from 'node:child_process';
const OUT=process.env.OUT||'store/screens';fs.mkdirSync(OUT,{recursive:true});
const PROF=(process.env.TMPDIR||'/tmp')+'/hs-store-prof';fs.mkdirSync(PROF,{recursive:true});
const W=+(process.env.SW||1290),H=+(process.env.SH||2796);
const br=spawn('/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',['--headless=new','--mute-audio','--no-first-run','--remote-debugging-port=9342','--user-data-dir='+PROF,`--window-size=${W},${H}`,'--force-device-scale-factor=1','about:blank'],{detached:true,stdio:'ignore'});
const kill=()=>{try{process.kill(-br.pid,'SIGKILL');}catch{}};process.on('exit',kill);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let list;for(let i=0;i<60;i++){try{list=await (await fetch('http://127.0.0.1:9342/json')).json();break;}catch{await sleep(250);}}
const pg=list.find(p=>p.type==='page');const ws=new WebSocket(pg.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend={};ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend[d.id]){pend[d.id](d);delete pend[d.id];}};
const send=(m,p={})=>new Promise(r=>{const i=++id;pend[i]=r;ws.send(JSON.stringify({id:i,method:m,params:p}));});
await send('Page.enable');await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride',{width:W,height:H,deviceScaleFactor:1,mobile:true});
const ROOT=new URL('..',import.meta.url).href.replace(/\/$/,'');
await send('Page.navigate',{url:ROOT+'/index.html'});await sleep(3000);
const ev=async e=>{const r=await send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true});if(r.result.exceptionDetails)throw new Error(JSON.stringify(r.result.exceptionDetails));return r.result.result.value;};
const shot=async n=>{await ev(`for(let i=0;i<6;i++)draw();1`);await sleep(120);const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(`${OUT}/${n}.png`,Buffer.from(r.result.data,'base64'));console.log(n);};
const run=async(lvl,frames,name,extra='')=>{
  await ev(`unlocked=16;clearCheckpoint();startStage=${lvl};pickStage(${lvl});start();P.inv=1e9;P.lvl=5;${extra};1`);
  await ev(`for(let i=0;i<${frames};i++){update();t++;}1`);await shot(name);
};
await ev(`unlocked=16;clearCheckpoint();try{localStorage.hs_seen_help='1'}catch(e){};1`);await sleep(1200);await shot('01_title');
await run(1,760,'02_meadow',`P.wpn='honey'`);
await run(5,900,'03_nightwood',`P.wpn='stinger'`);
await run(13,900,'04_volcano',`P.wpn='rain'`);
// a boss, mid fight
await ev(`unlocked=16;startStage=16;pickStage(16);start();P.inv=1e9;P.lvl=5;P.wpn='pollen';stageT=LV().len+1;1`);
await ev(`{let g=0;while(!bossAlive&&g++<2000){update();t++;}for(let i=0;i<200;i++){update();t++;}}1`);await shot('05_boss');
await run(6,900,'06_hive',`P.wpn='wax'`);
await ev(`quitToHome();clearCheckpoint();dexOpen=true;1`);await sleep(300);await shot('07_bugdex');
await ev(`dexOpen=false;touchMode=true;cardOpen='help';1`);await sleep(200);await shot('08_howto');
await ev(`cardOpen=null;STORE.native=true;payOpen=true;1`);await sleep(200);await shot('09_onepayment');
kill();process.exit(0);
