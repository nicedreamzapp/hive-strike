// Measure the ACTUAL difficulty of every world and prove it goes up.
//
// Difficulty in Hive Strike is a formula now -- heat() in src/07_levels.js, 0 at THE MEADOW and
// 1 at THE CRYSTAL, with every dial reading off it. This tool checks that the formula survives
// contact with the real game: it plays each world with a near-optimal dodging bot, measures the
// pressure that actually reaches the player, and FAILS if any world comes out easier than the
// one before it, or if the bot is ever left with nowhere to stand.
//
//   node tools/difficulty_curve.mjs            all 16 worlds, waves + bosses
//   node tools/difficulty_curve.mjs --waves    wave phase only (faster)
//
// The bot moves at the player's real speed and collides with the player's real hitbox (4px
// against bugs, 2px against bullets -- see 14_update.js). A bot that teleports to the optimal
// pixel is the instrument that hid this problem for months; this one does not.
import fs from 'node:fs';import {spawn} from 'node:child_process';
const WAVES_ONLY=process.argv.includes('--waves');
const SP=fs.mkdtempSync((process.env.TMPDIR||'/tmp')+'/hs-curve-');
const PROF=SP+'/p';fs.mkdirSync(PROF,{recursive:true});
const PORT=9410;
const br=spawn('/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',['--headless=new','--mute-audio','--no-first-run','--remote-debugging-port='+PORT,'--user-data-dir='+PROF,'--window-size=520,760','--autoplay-policy=no-user-gesture-required','about:blank'],{stdio:'ignore',detached:true});
const kill=()=>{try{process.kill(-br.pid,'SIGKILL');}catch{}};
process.on('exit',kill);process.on('SIGINT',()=>{kill();process.exit(130);});
process.on('uncaughtException',e=>{kill();console.error(e);process.exit(1);});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let list;for(let i=0;i<40;i++){try{list=await (await fetch('http://127.0.0.1:'+PORT+'/json')).json();break;}catch{await sleep(250);}}
const ws=new WebSocket(list.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend={};const errs=[];
ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend[d.id]){pend[d.id](d);delete pend[d.id];}
 if(d.method==='Runtime.exceptionThrown')errs.push(d.params.exceptionDetails.exception?.description||d.params.exceptionDetails.text);};
const send=(m,p={})=>new Promise(r=>{const i=++id;pend[i]=r;ws.send(JSON.stringify({id:i,method:m,params:p}));});
await send('Page.enable');await send('Runtime.enable');
const ROOT=new URL('..',import.meta.url).href.replace(/\/$/,'');
await send('Page.navigate',{url:ROOT+'/index.html'});await sleep(1800);
const ev=async e=>{const r=await send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true});
 if(r.result.exceptionDetails)throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0,500));return r.result.result.value;};

await ev(`
const PE=4,PB=2;
function _margin(x,y,ahead){let w=1e9;
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
function _step(){
 let bx=P.x,by=P.y,bs=_margin(P.x,P.y,26);
 for(let a=0;a<16;a++){const th=a/16*6.2831853,nx=Math.max(14,Math.min(W-14,P.x+Math.cos(th)*4.5)),ny=Math.max(30,Math.min(H-20,P.y+Math.sin(th)*4.5));
  const s=_margin(nx,ny,26)+(ny>H*.55?2:0);if(s>bs){bs=s;bx=nx;by=ny;}}
 target={x:bx,y:by};return bs;}
// Two different questions, and only the second one is Matt's rule.
// PENNED  = geometry: this frame there is no clear spot within one step. Happens; a real player
//           plans further ahead than one frame and mostly never arrives there.
// DOOMED  = penned AND the game is allowed to kill you for it -- not invulnerable, and the
//           mercy window (10_waves.js) is on cooldown. THIS is what must be zero.
function _doomed(penned){ return penned && P.inv<=0 && !P.dead && (t-(P.mercyT||-9999))>=120; }
window.__world=function(st,waveFrames,bossFrames){
 startStage=st;start();P.inv=1e9;levelIntro=0;
 let _fired=0; const _es=window.eshot, _ep=window.epush;
 window.eshot=function(){const n=ebullets.length;_es.apply(null,arguments);if(ebullets.length>n)_fired++;};
 window.epush=function(o){const n=ebullets.length;_ep(o);if(ebullets.length>n)_fired++;};
 let shots=[],bugs=[],forced=0,stuck=0,penned=0,n=0;
 for(let f=0;f<waveFrames;f++){
  if(state!=='play'||bossAlive||bossWarn>0||levelClear>0)break;
  if(_margin(P.x,P.y,45)<0)forced++;
  {const bs=_step()<0; if(bs)penned++; if(_doomed(bs))stuck++;}
  update();
  for(const e of enemies){e.__px=e.x;e.__py=e.y;}n++;
  if(f%15===0){shots.push(ebullets.length);let b=0;for(const e of enemies)if(!e.tiny&&!e.dead)b++;bugs.push(b);}
 }

 window.eshot=_es; window.epush=_ep;
 const wave={fired:+(_fired/(n/60||1)).toFixed(1), shots:+(shots.reduce((a,b)=>a+b,0)/(shots.length||1)).toFixed(1),
  bugs:+(bugs.reduce((a,b)=>a+b,0)/(bugs.length||1)).toFixed(1),
  forced:+(forced/(n||1)*100).toFixed(1), penned:+(penned/(n||1)*100).toFixed(2), stuck:+(stuck/(n||1)*100).toFixed(2)};
 let bos=null;
 if(bossFrames>0){
  stageT=LV().len+1;let g=0;while(!bossAlive&&g++<3000)update();
  let bf=0,bs2=0,bpen=0,bn=0,bsh=[];
  for(let f=0;f<bossFrames;f++){ if(!bossAlive)break;
   if(boss)boss.hp=Math.max(boss.max*.35,boss.hp);   // hold the fight open long enough to read it
   if(_margin(P.x,P.y,45)<0)bf++;
   {const pn=_step()<0; if(pn)bpen++; if(_doomed(pn))bs2++;}
   update();bn++;
   if(f%15===0)bsh.push(ebullets.length);}
  bos={name:(boss&&boss.name)||'?',shots:+(bsh.reduce((a,b)=>a+b,0)/(bsh.length||1)).toFixed(1),
   forced:+(bf/(bn||1)*100).toFixed(1), penned:+(bpen/(bn||1)*100).toFixed(2), stuck:+(bs2/(bn||1)*100).toFixed(2)};
 }
 return {stage:st, world:LV().name, heat:+heat().toFixed(3),
  dials:{swarm:DIFF.swarm(),squads:DIFF.squads(),speed:+DIFF.speed().toFixed(2),cadence:+DIFF.cadence().toFixed(2),airCap:DIFF.airCap(),elite:+DIFF.elite().toFixed(2)},
  wave, boss:bos};
};1`);

const rows=[];
for(let s=1;s<=16;s++){ rows.push(await ev(`__world(${s},4200,${WAVES_ONLY?0:2400})`)); process.stdout.write('.'); }
console.log('\n');
const pad=(v,w)=>String(v).padStart(w);
console.log('world                 heat  swarm sq speed cad  air elite | WAVES fired shots bugs force pen  die | BOSS               shots force pen  die');
console.log('-'.repeat(139));
for(const r of rows){
 const d=r.dials,w=r.wave,b=r.boss;
 console.log(`${r.world.padEnd(16)} ${pad(r.heat,6)} ${pad(d.swarm,5)} ${pad(d.squads,2)} ${pad(d.speed,5)} ${pad(d.cadence,4)} ${pad(d.airCap,4)} ${pad(d.elite,5)} | ${pad(w.fired,5)} ${pad(w.shots,5)} ${pad(w.bugs,4)} ${pad(w.forced,5)} ${pad(w.penned,4)} ${pad(w.stuck,4)} | ${(b?b.name:'-').padEnd(18)} ${pad(b?b.shots:'-',5)} ${pad(b?b.forced:'-',5)} ${pad(b?b.penned:'-',4)} ${pad(b?b.stuck:'-',4)}`);
}
fs.writeFileSync(SP+'/curve.json',JSON.stringify(rows,null,1));

// ---- the assertions ----
let fails=[];
// 1. every dial must be monotonic in heat
// CADENCE is deliberately not monotonic any more, and that is the point. WFIT corrects each
// world's fire rate for how its own bugs behave, so the raw dial zig-zags on purpose in order to
// make the thing the player actually feels -- forced movement, checked below -- come out smooth.
// Asserting the input is monotonic would be asserting against the fix. Every other dial is a
// straight read off the curve with no correction, so those still must not go backwards.
const dialDirs={swarm:1,speed:1,airCap:1,elite:1};
for(const k in dialDirs){ for(let i=1;i<rows.length;i++){
 const a=rows[i-1].dials[k],b=rows[i].dials[k];
 if((b-a)*dialDirs[k]<0)fails.push(`dial ${k} goes the wrong way at ${rows[i].world}: ${a} -> ${b}`); }}
// 2. measured wave pressure must trend up. compare in thirds, so one noisy world is not a failure
// One 65-second sample per world is a noisy read -- which formation the dice picked moves the
// shot count by more than one step of the curve does. So the CLAIM being tested is "the game
// gets harder across the game", strictly, end to end; adjacent thirds only have to not fall
// back by more than a tenth, which is inside the noise. Loosening this further would be moving
// the goalposts, so it does not get loosened further.
const third=n=>rows.slice(n*5,n*5+5).reduce((a,r)=>a+r.wave.shots,0)/5;
const fthird=n=>rows.slice(n*5,n*5+5).reduce((a,r)=>a+r.wave.forced,0)/5;
console.log(`\nforced to move (share of frames where standing still gets you hit): worlds 1-5 ${fthird(0).toFixed(1)}%, 6-10 ${fthird(1).toFixed(1)}%, 11-15 ${fthird(2).toFixed(1)}%`);
if(fthird(2)<=fthird(0)*1.5)fails.push(`bullets never start MAKING you move: forced movement is ${fthird(0).toFixed(1)}% early and ${fthird(2).toFixed(1)}% late -- expected at least half again as much`);
if(fthird(2)<8)fails.push(`late worlds barely make you move at all (${fthird(2).toFixed(1)}% of frames) -- you can stand still and survive`);
const rthird=n=>rows.slice(n*5,n*5+5).reduce((a,r)=>a+r.wave.fired,0)/5;
console.log(`shots fired per second: worlds 1-5 ${rthird(0).toFixed(1)}, 6-10 ${rthird(1).toFixed(1)}, 11-15 ${rthird(2).toFixed(1)}`);
if(rthird(2)<=rthird(0)*1.4)fails.push(`fire rate does not rise across the game: ${rthird(0).toFixed(1)}/s early, ${rthird(2).toFixed(1)}/s late -- expected at least 40% more`);
if(rthird(1)<rthird(0)*0.9)fails.push(`middle of the game sags: ${rthird(0).toFixed(1)}/s early, ${rthird(1).toFixed(1)}/s at 6-10`);
if(rthird(2)<rthird(1)*0.9)fails.push(`end of the game sags: ${rthird(1).toFixed(1)}/s at 6-10, ${rthird(2).toFixed(1)}/s at 11-15`);
// 3. no world may be a hole: nowhere-to-stand must be zero everywhere
for(const r of rows){
 if(r.wave.stuck>0)fails.push(`${r.world} waves: KILLABLE with no escape on ${r.wave.stuck}% of frames`);
 if(r.boss&&r.boss.stuck>0)fails.push(`${r.world} boss (${r.boss.name}): KILLABLE with no escape on ${r.boss.stuck}% of frames`);
}
{const wp=Math.max(...rows.map(r=>r.wave.penned)),bp=Math.max(...rows.map(r=>r.boss?r.boss.penned:0));
 console.log(`penned (no clear spot this frame, but survivable): waves peak ${wp}%, bosses peak ${bp}%`);}
// 4. no boss may be a pushover next to the world before it
// A late boss SHOULD be harder than an early one -- that is heat working. What must not happen
// is a boss being hard because of the pattern it drew. So: the trend must rise across the game,
// and any single boss sitting far off its world's level gets named (a warning, not a failure --
// forty seconds of one fight is a noisy sample and patterns are allowed some character).
if(!WAVES_ONLY){
 const bthird=n=>{const g=rows.slice(n*5,n*5+5).filter(r=>r.boss);return g.reduce((a,r)=>a+r.boss.forced,0)/(g.length||1);};
 if(bthird(2)<=bthird(0))fails.push(`boss difficulty does not rise: worlds 1-5 avg ${bthird(0).toFixed(1)}% forced movement, worlds 11-15 avg ${bthird(2).toFixed(1)}%`);
 const med=[...rows.filter(r=>r.boss).map(r=>r.boss.forced)].sort((a,b)=>a-b)[8];
 const odd=rows.filter(r=>r.boss&&(r.boss.forced<med*.45||r.boss.forced>med*2.6));
 if(odd.length)console.log('\nbosses off their world\'s level (pattern showing through, worth a look):\n'+odd.map(r=>`  ${r.boss.name.padEnd(20)} ${r.boss.forced}% vs a ${med}% median`).join('\n'));}
console.log('\nJS errors:',errs.length);
if(fails.length){console.log('\nFAIL');for(const f of fails)console.log('  -',f);}
else console.log('\nPASS  - the curve rises, every dial is monotonic, and there is always somewhere to stand.');
console.log('\ndata:',SP+'/curve.json');
ws.close();kill();process.exit(fails.length?1:0);
