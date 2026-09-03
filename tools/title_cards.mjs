// Screenshot the title cards (help / contract / daily / settings) headlessly for a layout check.
import fs from 'node:fs';import {spawn} from 'node:child_process';
const SP=process.env.HS_OUT||'/tmp';const PROF=fs.mkdtempSync('/tmp/hs-cards-');
const br=spawn('/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',['--headless=new','--mute-audio','--no-first-run','--remote-debugging-port=9334','--user-data-dir='+PROF,'--window-size=520,760','about:blank'],{detached:true,stdio:'ignore'});
const kill=()=>{try{process.kill(-br.pid,'SIGKILL');}catch{}};process.on('exit',kill);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let list;for(let i=0;i<40;i++){try{list=await (await fetch('http://127.0.0.1:9334/json')).json();break;}catch{await sleep(250);}}
const pg=list.find(p=>p.type==='page');const ws=new WebSocket(pg.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend={};ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend[d.id]){pend[d.id](d);delete pend[d.id];}};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend[i]=r;ws.send(JSON.stringify({id:i,method,params}));});
await send('Page.enable');await send('Runtime.enable');
const ROOT=new URL('..',import.meta.url).href.replace(/\/$/,'');await send('Page.navigate',{url:ROOT+'/index.html'});await sleep(1500);
const ev=async e=>{const r=await send('Runtime.evaluate',{expression:e,returnByValue:true});if(r.result.exceptionDetails)throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0,300));return r.result.result.value;};
const shot=async name=>{await ev('for(let i=0;i<30;i++)draw();1');await sleep(30);const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`${SP}/card_${name}.png`,Buffer.from(r.result.data,'base64'));};
for(const k of ['help','contract','daily','dex']){await ev(`cardOpen='${k}';1`);await shot(k);}
await ev('cardOpen=null;settingsOpen=true;1');await shot('settings');
// hold logic: press HOW TO PLAY, run 30 frames, the card must open on its own
const held=await ev(`settingsOpen=false;holdBtn='help';holdT=t;for(let i=0;i<30;i++){t++;if(holdBtn&&!cardOpen&&state!=='play'&&t-holdT>=HOLD_FRAMES){cardOpen=holdBtn;}}cardOpen`);
console.log('hold opens card:',held);kill();process.exit(0);
