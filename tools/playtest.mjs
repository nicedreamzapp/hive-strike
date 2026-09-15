// Actually PLAY the game, start to finish, with nothing switched off.
//
// Everything else in tools/ measures a slice with the player made invulnerable. This does not:
// real lives, real collisions, real deaths, real game over. A bot dodges at the player's true
// speed and hitbox, goes and fetches pickups when it is safe to (guns sit still now, so
// fetching one is a decision it has to make), fires automatically like a player does, and
// spends a bomb when it is genuinely cornered. It runs from world 1 until it either wins or
// dies out, and reports what happened.
//
//   node tools/playtest.mjs            one run from world 1
//   node tools/playtest.mjs 3          three runs (the game is random; one run proves little)
//   node tools/playtest.mjs 1 12       one run starting at world 12
import fs from 'node:fs';import {spawn} from 'node:child_process';
const RUNS=+(process.argv[2]||1), FROM=+(process.argv[3]||1);
const SP=fs.mkdtempSync((process.env.TMPDIR||'/tmp')+'/hs-play-');
const PROF=SP+'/p';fs.mkdirSync(PROF,{recursive:true});
const br=spawn('/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',['--headless=new','--mute-audio','--no-first-run','--remote-debugging-port=9450','--user-data-dir='+PROF,'--window-size=520,760','--autoplay-policy=no-user-gesture-required','about:blank'],{stdio:'ignore',detached:true});
const kill=()=>{try{process.kill(-br.pid,'SIGKILL');}catch{}};
process.on('exit',kill);process.on('SIGINT',()=>{kill();process.exit(130);});
process.on('uncaughtException',e=>{kill();console.error(e);process.exit(1);});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let list;for(let i=0;i<40;i++){try{list=await (await fetch('http://127.0.0.1:9450/json')).json();break;}catch{await sleep(250);}}
const ws=new WebSocket(list.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend={};const errs=[];
ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend[d.id]){pend[d.id](d);delete pend[d.id];}
 if(d.method==='Runtime.exceptionThrown')errs.push(d.params.exceptionDetails.exception?.description||d.params.exceptionDetails.text);};
const send=(m,p={})=>new Promise(r=>{const i=++id;pend[i]=r;ws.send(JSON.stringify({id:i,method:m,params:p}));});
await send('Page.enable');await send('Runtime.enable');
const ROOT=new URL('..',import.meta.url).href.replace(/\/$/,'');
await send('Page.navigate',{url:ROOT+'/index.html'});await sleep(1800);
const ev=async e=>{const r=await send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true});
 if(r.result.exceptionDetails)throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0,600));return r.result.result.value;};

await ev(`
const PE=4,PB=2;
function _m(x,y,ahead){let w=1e9;
 for(const e of enemies){if(e.dead||e.tiny)continue;
  const evx=e.x-(e.__px==null?e.x:e.__px),evy=e.y-(e.__py==null?e.y:e.__py);
  const rx=e.x-x,ry=e.y-y,s2=evx*evx+evy*evy;
  const tc=s2>1e-6?Math.max(0,Math.min(ahead,-(rx*evx+ry*evy)/s2)):0;
  const d=Math.hypot(rx+evx*tc,ry+evy*tc)-(e.r+PE);if(d<w)w=d;}
 for(const b of ebullets){if(b.dead||b.kind==='web')continue;
  const rx=b.x-x,ry=b.y-y,s2=b.vx*b.vx+b.vy*b.vy||1e-6,tc=Math.max(0,Math.min(ahead,-(rx*b.vx+ry*b.vy)/s2));
  const d=Math.hypot(rx+b.vx*tc,ry+b.vy*tc)-(b.r+PB);if(d<w)w=d;}
 if(boss&&boss.y>0){const d=Math.hypot(boss.x-x,boss.y-y)-(boss.r+PE+6);if(d<w)w=d;}
 return w;}
window.__play=function(from,maxFrames){
 startStage=from;start();levelIntro=0;
 const log=[]; let deaths=0,bombsUsed=0,prevLives=P.lives,prevBombs=P.bombs,prevStage=stage;
 let guns={},mercy=0,prevMercy=-9999,penned=0,_fetch=false,unavoidable=0,_pennedRecently=0,_mercyWasCold=false;
 let f=0, cleared=0, hardStuck=0;
 for(;f<maxFrames;f++){
  if(state!=='play')break;
  if(!P.dead){
   // 1. where is it safe to stand
   let bx=P.x,by=P.y,bs=_m(P.x,P.y,26);_fetch=false;
   for(let a=0;a<16;a++){const th=a/16*6.2831853,nx=Math.max(14,Math.min(W-14,P.x+Math.cos(th)*4.5)),ny=Math.max(30,Math.min(H-20,P.y+Math.sin(th)*4.5));
    const s=_m(nx,ny,26)+(ny>H*.55?2:0);if(s>bs){bs=s;bx=nx;by=ny;}}
   // 2. if it is calm, go and FETCH something -- guns no longer come to you
   if(bs>70&&pickups.length){
    let want=null,wd=1e9;
    for(const p of pickups){const d=Math.hypot(p.x-P.x,p.y-P.y);
     const worth = p.k==='life'?0 : p.k==='bomb'?1 : p.k==='nectar'?2 : 3;
     const sc=d+worth*40; if(sc<wd&&_m(p.x,p.y,26)>26){wd=sc;want=p;}}
    if(want){_fetch=true;const dx=want.x-P.x,dy=want.y-P.y,d=Math.hypot(dx,dy)||1;
     bx=Math.max(14,Math.min(W-14,P.x+dx/d*4.5));by=Math.max(30,Math.min(H-20,P.y+dy/d*4.5));}}
   target={x:bx,y:by};
   // 3. cornered? that is what the bomb is for now.
   if(bs<8&&P.bombs>0&&P.inv<=0)wantBomb=1;
   if(bs<0){penned++;_pennedRecently=12;_mercyWasCold=(P.inv<=0&&(t-(P.mercyT||-9999))>=70);
     if(_mercyWasCold)hardStuck++;}
   else if(_pennedRecently>0)_pennedRecently--;
  }
  const before=P.mercyT;
  update();
  for(const e of enemies){e.__px=e.x;e.__py=e.y;}
  if(P.mercyT!==before&&P.mercyT!==prevMercy){mercy++;prevMercy=P.mercyT;}
  if(P.bombs<prevBombs)bombsUsed+=prevBombs-P.bombs; prevBombs=P.bombs;
  if(P.lives<prevLives){deaths+=prevLives-P.lives;
   if(_pennedRecently>0&&_mercyWasCold)unavoidable++;
   let bg=0;for(const e of enemies)if(!e.tiny&&!e.dead)bg++;
   log.push('died on world '+((stage-1)%16+1)+' at '+(f/60|0)+'s  ['+(bossAlive?'BOSS '+(boss&&boss.name):'waves')+', '+bg+' bugs, '+ebullets.length+' shots, gun '+P.wpn+' Lv'+P.lvl+', bombs '+P.bombs+', fetching '+(_fetch?'YES':'no')+']');}
  prevLives=P.lives;
  if(stage!==prevStage){cleared++;log.push('cleared world '+((prevStage-1)%16+1)+' at '+(f/60|0)+'s  (lives '+P.lives+', bombs '+P.bombs+', '+P.wpn+' Lv'+P.lvl+')');prevStage=stage;}
  guns[P.wpn]=(guns[P.wpn]||0)+1;
 }
 // how many guns went untaken? a gun that drifts off was a decision, not a miss
 return {from, endState:state, frames:f, seconds:+(f/60).toFixed(0), worldsCleared:cleared,
  reached:((stage-1)%16+1), loop, deaths, livesLeft:P.lives, bombsUsed, score,
  mercyWindows:mercy, framesPenned:penned, framesDoomed:hardStuck, unavoidableDeaths:unavoidable,
  gunTime:Object.entries(guns).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=>k+' '+(v/f*100|0)+'%'),
  log};
};1`);

let allOK=true;
for(let r=1;r<=RUNS;r++){
 const res=await ev(`__play(${FROM}, 200000)`);
 console.log(`\n=== run ${r} ===`);
 console.log(`finished: ${res.endState}   reached world ${res.reached}${res.loop?' (loop '+res.loop+')':''}   ${res.seconds}s   score ${res.score}`);
 console.log(`worlds cleared ${res.worldsCleared}   deaths ${res.deaths}   lives left ${res.livesLeft}   bombs used ${res.bombsUsed}`);
 console.log(`penned ${res.framesPenned} frames   mercy windows ${res.mercyWindows}   doomed frames ${res.framesDoomed}   UNAVOIDABLE DEATHS ${res.unavoidableDeaths}`);
 console.log(`time on each gun: ${res.gunTime.join(', ')}`);
 for(const l of res.log)console.log('   '+l);
 if(res.unavoidableDeaths>0){console.log('   !! died with no way out '+res.unavoidableDeaths+' time(s)');allOK=false;}
 if(res.endState==='over'&&res.worldsCleared<3)console.log('   (note: a short run -- the bot is a dodger, not a good player)');
}
console.log('\nJS errors during play:',errs.length,errs.slice(0,3));
if(errs.length)allOK=false;
console.log(allOK?'\nPASS - played through with nothing switched off and nothing went wrong.':'\nFAIL - see the !! lines above.');
ws.close();kill();process.exit(allOK?0:1);
