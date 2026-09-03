// Is a bug see-through because of its PNG, or because of what the level paints over it?
// Renders a snail (garden) and the horseshoe crab (tide pool) twice: over the real world and
// over flat black. If the bug reads solid over black but washed over the world, the world's
// overlay is the cause, not the sprite.
import fs from 'node:fs';import {spawn} from 'node:child_process';
const SP=process.env.HS_OUT||'/tmp';const PROF=fs.mkdtempSync('/tmp/hs-probe-');
const br=spawn('/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',['--headless=new','--mute-audio','--no-first-run','--remote-debugging-port=9335','--user-data-dir='+PROF,'--window-size=520,760','about:blank'],{detached:true,stdio:'ignore'});
const kill=()=>{try{process.kill(-br.pid,'SIGKILL');}catch{}};process.on('exit',kill);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let list;for(let i=0;i<40;i++){try{list=await (await fetch('http://127.0.0.1:9335/json')).json();break;}catch{await sleep(250);}}
const pg=list.find(p=>p.type==='page');const ws=new WebSocket(pg.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend={};ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend[d.id]){pend[d.id](d);delete pend[d.id];}};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend[i]=r;ws.send(JSON.stringify({id:i,method,params}));});
await send('Page.enable');await send('Runtime.enable');
const ROOT=new URL('..',import.meta.url).href.replace(/\/$/,'');await send('Page.navigate',{url:ROOT+'/index.html'});await sleep(1500);
const ev=async e=>{const r=await send('Runtime.evaluate',{expression:e,returnByValue:true});if(r.result.exceptionDetails)throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0,400));return r.result.result.value;};
const shot=async name=>{await ev('for(let i=0;i<3;i++)draw();1');await sleep(30);const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`${SP}/probe_${name}.png`,Buffer.from(r.result.data,'base64'));};
await ev(`window.__step=n=>{for(let i=0;i<n;i++){if(state==='play'&&!paused)update();else t++;}};unlockUpTo(16);1`);
// snail in the garden, parked mid-screen
await ev(`pickStage(2);start();P.inv=1e9;__step(220);enemies.length=0;ebullets.length=0;spawn('snail',W/2,300,{pat:'slow'});spawn('ladybug',W/2-120,300,{pat:'slow'});spawn('earwig',W/2+120,300,{pat:'slow'});for(const e of enemies){e.vy=0;e.vx=0;}__step(20);for(const e of enemies){e.x=[W/2,W/2-120,W/2+120][enemies.indexOf(e)];e.y=300;}1`);
await shot('snail_world');
await ev(`window.__dw=drawWorld;drawWorld=function(){X.fillStyle='#000';X.fillRect(0,0,W,H);};1`);await shot('snail_black');await ev(`drawWorld=window.__dw;1`);
// horseshoe crab
await ev(`pickStage(12);start();P.inv=1e9;__step(220);1`);
let s;for(let k=0;k<80;k++){await ev(`__step(100)`);s=await ev(`bossWarn`);if(s>0)break;}
await ev(`__step(120);__step(95);__step(260);1`);
await shot('crab_world');
await ev(`window.__do=drawOverlays;drawOverlays=function(){};1`);await shot('crab_noOverlays');await ev(`drawOverlays=window.__do;1`);
await ev(`window.__ws=[waveWash,heatHaze,sunShafts,mist,cloudShadows];waveWash=function(){};heatHaze=function(){};sunShafts=function(){};mist=function(){};cloudShadows=function(){};1`);await shot('crab_noWash');await ev(`[waveWash,heatHaze,sunShafts,mist,cloudShadows]=window.__ws;1`);
await ev(`window.__db=drawBoss;drawBoss=function(b,portrait){X.save();X.translate(b.x,b.y);drawSprite(SPR['boss'+LV().boss],BSIZE[LV().boss],faceRot('boss'+LV().boss));X.restore();};1`);await shot('crab_plainSprite');await ev(`drawBoss=window.__db;1`);
await ev(`drawWorld=function(){X.fillStyle='#000';X.fillRect(0,0,W,H);};1`);await shot('crab_black');
console.log(await ev(`JSON.stringify({stage,boss:boss&&boss.name,alpha:X.globalAlpha,comp:X.globalCompositeOperation,filter:X.filter})`));
kill();process.exit(0);
