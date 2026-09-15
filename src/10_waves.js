// ---------- coordinated arrivals ----------
// waves used to be scattered and crossed over one another. these come down as mirrored,
// evenly spaced formations so an attack reads as deliberate instead of messy.
function formSym(kind,n,opt){
 const mid=W/2,step=(W-140)/Math.max(1,n-1);
 for(let i=0;i<n;i++){
  const x=70+i*step, off=Math.abs(x-mid)/mid;      // outer wings enter a beat later
  spawn(kind,x,-30-off*70,Object.assign({pat:'march'},opt||{}));
 }
}
function formArc(kind,n,opt){
 for(let i=0;i<n;i++){
  const f=n===1?.5:i/(n-1), x=70+f*(W-140);
  const dip=Math.sin(f*Math.PI)*70;                 // a shallow bowl, symmetric about centre
  spawn(kind,x,-30-dip,Object.assign({pat:'sine',ox:x},opt||{}));
 }
}
function formWedge(kind,n,opt){
 const mid=W/2,half=Math.floor(n/2);
 for(let i=-half;i<=half;i++){
  if(n%2===0&&i===0)continue;
  spawn(kind,mid+i*46,-30-Math.abs(i)*44,Object.assign({pat:'march'},opt||{}));
 }
}
function formTwin(kind,n,opt){                       // mirrored pairs, never crossing
 const mid=W/2;
 for(let i=1;i<=Math.ceil(n/2);i++){
  const dx=i*52;
  spawn(kind,mid-dx,-30-i*30,Object.assign({pat:'march'},opt||{}));
  spawn(kind,mid+dx,-30-i*30,Object.assign({pat:'march'},opt||{}));
 }
}
const SYMFORMS=[formSym,formArc,formWedge,formTwin];

// ---------- 1943 RULES: one squadron at a time, and every squadron leaves ----------
// Measured 2026-09-15: world 16 held 11.8 SEPARATE waves in the air at once, peaking at 18,
// with six species mixed together. The game owns twenty formation shapes and never showed
// you one by itself -- you cannot read a V when eighteen other shapes are stacked on it.
// So: a hard limit on how many squadrons share the airspace, a swarm no wider than the
// screen can show, and a clock on every wave so the next one gets a clean stage.
const MAXWAVES=()=>DIFF.squads();
function liveWaves(){const s=new Set();for(const e of enemies)if(!e.dead&&!e.tiny&&e.pat!=='fall')s.add(e.wv);return s.size;}
// The old cap was 6+level*1.1, so 22 bugs by world 16. Their bodies came to 597px of solid
// bug across a 480px screen, and separate() demands 1.45x that -- 1.8 screen widths. They
// physically could not fit in one row, so they stacked into a lattice. That was the wall.
// Now the cap is derived from the bugs' actual size: about one and a third rows, never more.
function waveCap(){const rs=LV().roster.map(k=>(ET[k]?ET[k].r:13));
 const avgR=rs.reduce((a,b)=>a+b,0)/rs.length,rowFits=Math.floor((W*1.25)/(avgR*2*1.45));
 return Math.max(5,Math.min(rowFits,DIFF.swarm()));}
// A camper (hover, thread) never descends, so laps alone will not retire it. Hard clock.
const WAVE_TTL=900;
function retireOldWaves(){for(const e of enemies){if(e.tiny||e.dead||e.pat==='fall')continue;
 if((e.wt=(e.wt||0)+1)>WAVE_TTL){e.pat='fall';e.vy=2.6;}}}
// The lull is the point. Attack, breathe, attack -- that beat is where a wave becomes
// readable and where your heartrate comes down. Zero dead air is what made it a wall.
const LULL=48;
function wave(){const lv=LV(),pr=stageT/lv.len;
 if(stageT>lv.len){for(const e of enemies){if(e.pat!=='fall'){e.pat='fall';e.vy=2.8;}}return;}
 retireOldWaves();
 const cap=waveCap();
 // count only REAL bugs against the cap. a gnat cloud is 40-plus tiny sprites and it was
 // blowing straight past the cap, so one cloud starved the whole level of actual enemies.
 let big=0;for(const e of enemies)if(!e.tiny&&!e.dead)big++;
 // an empty screen is dead air. if nothing is left to fight, the next wave comes NOW
 // instead of waiting out the timer.
 if(big===0&&nextWave>stageT+LULL)nextWave=stageT+LULL;
 if(stageT<nextWave||big>=cap||liveWaves()>=MAXWAVES())return;
 waveSeq++;   // everything spawned from here down belongs to ONE squadron
 const gap=Math.max(96-((stage-1)%NL)*4,206-pr*95-(stage-1)*11-loop*20);   /* fewer bugs at once, so they arrive sooner */nextWave=stageT+gap;
 // a gnat cloud is atmosphere, not a wave. it used to consume the wave slot and return,
 // so a level could be nothing but gnats for ten seconds. now it drops the cloud and the
 // real wave keeps coming in the same breath. spaced out too, since levels are twice as long.
 if(stageT>=nextCloud){nextCloud=stageT+RI(1250,1850)-(lv.decor==='pond'?250:0);FORMS.cloud();say((BUGINFO[LV().cloud]?BUGINFO[LV().cloud].name:'GNATS')+' SWARMING!');}
 const fod=lv.roster.filter(k=>FODDER.includes(k)),sho=lv.roster.filter(k=>SHOOTERS.includes(k));
 // the newest bug of each world (last in its roster) was one random pick among six and went
 // unseen for whole runs; give it four in ten of the waves it qualifies for
 // How much of what is on screen can actually SHOOT BACK is itself a dial now. Cadence cannot
 // speed up the fire of a bug that never fires, and whether a world had gunners was pure roster
 // luck: measured 2026-09-15, THE CANOPY and THE VOLCANO put ZERO shots in the air while THE
 // GARDEN put thirteen. If the screen is short of gunners, the next wave IS gunners.
 let gun=0,tot=0;for(const e of enemies){if(e.tiny||e.dead)continue;tot++;if(SHOOTERS.includes(A(e.type))||SHOOTERS.includes(e.type))gun++;}
 const needGunners=sho.length&&(tot===0||gun/tot<DIFF.gunners());
 const nwst=lv.roster[lv.roster.length-1],pick=a=>(a.includes(nwst)&&Math.random()<.4)?nwst:a[RI(0,a.length-1)];
 // when the curve wants aimers and this world has some, send those
 const aimSho=sho.filter(isAimer),pickSho=()=>(aimSho.length&&Math.random()<DIFF.aimers())?pick(aimSho):pick(sho);
 if(needGunners&&!SHOOTERS.includes(A(lv.roster[0]))){const k=pickSho(),ak=A(k);
  if(ak==='spiderling')FORMS.threads(k);
  else SYMFORMS[RI(0,SYMFORMS.length-1)](k,RI(3+WSZ(),5+WSZ()));
  return;}
 if(!rushDone&&pr>.55){rushDone=true;say('SWARM INCOMING!');snd(300,.3,'square',.04,600);FORMS.line(fod[0]||'fly');FORMS.vee(fod[RI(0,fod.length-1)]||'fly');return;}
 const sig=lv.roster[0];const useShooter=sho.length&&(needGunners||Math.random()<DIFF.gunners());if(Math.random()<.45){if(SHOOTERS.includes(sig)&&!FODDER.includes(sig)){const as2=A(sig);if(as2==='cicada')FORMS.screamer(sig);else if(as2==='dragon')FORMS.heavy(sig);else if(as2==='snail')FORMS.crawler(sig);else if(as2==='stinkbug')FORMS.stinker(sig);else if(as2==='glowworm'||as2==='dungbeetle')spawn(sig,R(60,W-60),-30,{pat:as2==='glowworm'?'creep':'slow'});else FORMS[SHOOTER_FORMS[RI(0,1)]](sig);}else{let f=FODDER_FORMS[RI(0,FODDER_FORMS.length-1)];if(sig==='grasshopper')f='hoppers';if(sig==='hornet')f='chargers';if(sig==='spiderling')f='threads';if(sig==='earwig')f='zig';const asig=A(sig);if(asig==='ladybug')f=['line','vee','column'][RI(0,2)];if(asig==='firefly')f='column';if(asig==='dragon')f='skaters';if(asig==='grasshopper')f='hoppers';if(asig==='butterfly')f='flutters';if(asig==='ant')f='column';if(asig==='fly')f=['line','vee','column'][RI(0,2)];if(asig==='earwig')f='zig';if(asig==='gnat')f='swarm';if(asig==='mosquito')f='divers';if(asig==='strider')f='skaters';if(asig==='wasp')f='flank';FORMS[f](sig);}return;}
 if(useShooter){const k=pickSho();const ak=A(k);if(ak==='cicada')FORMS.screamer(k);else if(ak==='stinkbug')FORMS.stinker(k);else if(ak==='snail')FORMS.crawler(k);else if(ak==='spiderling')FORMS.threads(k);else if(ak==='glowworm'||ak==='dungbeetle')spawn(k,R(60,W-60),-30,{pat:ak==='glowworm'?'creep':'slow'});else FORMS[SHOOTER_FORMS[RI(0,1)]](k);}
 else if(Math.random()<.55){const k=pick(fod)||'fly';SYMFORMS[RI(0,SYMFORMS.length-1)](k,RI(4+WSZ(),6+WSZ()));}
 else{const k=pick(fod)||'fly',ak=A(k);let f=FODDER_FORMS[RI(0,FODDER_FORMS.length-1)];if(ak==='gnat')f='swarm';if(ak==='grasshopper')f='hoppers';if(ak==='hornet')f=Math.random()<.6?'chargers':'pincer';if(ak==='spiderling')f='threads';if(ak==='butterfly')f='flutters';if(ak==='earwig')f=Math.random()<.6?'zig':'pincer';if(ak==='katydid')f='hoppers';if(ak==='strider')f='skaters';if(ak==='weevil')f='chargers';if(ak==='termite')f='scurry';if(ak==='horsefly')f='divers';if(ak==='ant')f=Math.random()<.5?'column':'line';if(k==='ant'&&(f==='pincer'||f==='ambush'))f='column';FORMS[f](k);}
 if(Math.random()<DIFF.elite()&&enemies.length){const e=enemies[enemies.length-1];if(!e.elite&&!e.tiny){e.elite=1;e.hp*=2.2+((stage-1)%NL)*.06;e.maxhp=e.hp;e.sc*=3;}}
}
const anyBug=()=>{const r=LV().roster;return r[RI(0,r.length-1)];};
const PD=1.70; // player damage multiplier — guns felt weak at 1.15
// 9/3 rebalance. Five guns (thorn, saw, static, grenade, lure) could not physically REACH a
// boss, and honey got weaker as it levelled; all fixed in 06_player_fire. With real guns the
// old health made every fight a formality, so bugs and bosses are tougher and there are FEWER
// of them: the late worlds were 85 sprites of clutter, not 85 sprites of danger.
const EHP=1.75;      // per-bug health (was a flat 1.05)
// BHP was a flat 2.90 for every boss in the game, set back when the guns were assumed to be
// stronger than they now are. Playtested 2026-09-15 with real lives: THE MEADOW's boss took
// between 59 and 122 SECONDS to kill with the starting gun, and spawned up to ten divers while
// you chipped at it. Two minutes on the first fight of the game. Boss health now reads off the
// same curve as everything else, so it is matched to the gun you are actually likely to be
// holding: quick at THE MEADOW, a slog at THE CRYSTAL.
const BHP=2.90;      // kept as the reference the per-boss numbers were authored against
const EB=.55;   /* reference only -- live value is DIFF.shotSpeed(), see 07_levels */
const FR0=1.14; // FR = how much longer bugs wait between volleys. 9/3: the wave phase
// was a stroll (a dodging bot took 0-5 hits across a whole world), so bugs shoot sooner and their
// shots travel a little faster. There are fewer bugs now, so the pressure comes from them, not from a crowd.
Object.defineProperty(globalThis,'FR',{get(){return DIFF.cadence()*(MODS.quick?.72:1);}});
// kinds: dart (default), venom (green drop), seed (spiky seed), dust (moth scale puff), ember (firefly spark), drop (water), gas (stink cloud), wave (cicada sound ring), web (sticks to you and slows you), blade (mantis scythe), acorn (beetle king)
// Matt 9/15: there always has to be a way not to die. Two guarantees live here.
// PMAX -- nothing the bugs do may be faster than the bee can run (4.5, or 2.5 focused),
// so stepping out of the way always works.
// EBCAP -- a hard ceiling on shots in the air. World 16 measured 56 on average and spiked
// to 93 purely from timers coinciding; a ceiling means density can never spike like that.
const PMAX=4.14;
const EBCAP=()=>DIFF.airCap();
let lastRadial=-999;   // beetles and cicadas fire in ALL directions -- there is no side to
                       // step toward, so only one of them may be going off at a time.
// Matt 9/15: "there always has to be some way to not die." This is that promise, enforced
// per shot rather than hoped for. Before a bullet is added we ask whether the bee still has
// somewhere to BE once it exists -- sixteen headings, one frame of travel, against everything
// already in the air. If the honest answer is nowhere, the shot does not happen and the bug
// waits a beat. It costs one pass over the bullets and only ever triggers in the 1-2% of
// frames that were genuinely inescapable, so patterns look unchanged.
const _PE=4,_PB=2;
function escapeExists(nx2,ny2,nvx,nvy,nr){
 for(let i=0;i<16;i++){
  const th=i/16*6.2831853,px=clamp(P.x+Math.cos(th)*4.5,14,W-14),py=clamp(P.y+Math.sin(th)*4.5,30,H-20);
  let ok=true;
  if(nr!=null){const rx=nx2-px,ry=ny2-py,s2=nvx*nvx+nvy*nvy||1e-6,tc=Math.max(0,Math.min(26,-(rx*nvx+ry*nvy)/s2));
   if(Math.hypot(rx+nvx*tc,ry+nvy*tc)-(nr+_PB)<0)ok=false;}
  if(ok)for(const b of ebullets){ if(b.dead||b.kind==='web')continue;
   const rx=b.x-px,ry=b.y-py,s2=b.vx*b.vx+b.vy*b.vy||1e-6,tc=Math.max(0,Math.min(26,-(rx*b.vx+ry*b.vy)/s2));
   if(Math.hypot(rx+b.vx*tc,ry+b.vy*tc)-(b.r+_PB)<0){ok=false;break;} }
  if(ok)for(const e of enemies){ if(e.dead||e.tiny)continue;
   const evx=e.x-(e.ppx==null?e.x:e.ppx),evy=e.y-(e.ppy==null?e.y:e.ppy);
   const rx=e.x-px,ry=e.y-py,s2=evx*evx+evy*evy;
   const tc=s2>1e-6?Math.max(0,Math.min(26,-(rx*evx+ry*evy)/s2)):0;
   if(Math.hypot(rx+evx*tc,ry+evy*tc)-(e.r+_PE)<0){ok=false;break;} }
  if(ok)return true;
 }
 return false;
}
// Every enemy bullet in the game goes through here. eshot() is the aimed-shot convenience;
// epush() is for the patterns that build their own bullet objects (the bosses do). Both
// honour the ceiling and both honour the promise that you are never left with nowhere to go.
// The last line of the promise. Blocking a shot at the moment it is FIRED cannot catch
// everything: bullets that were each legal on their own converge twenty frames later, and a bug
// can walk into the one gap you had. So every frame we also ask the plain question -- does the
// bee have anywhere to go right now? If the answer is no, the game put you there, and the game
// does not get to kill you for it. A mercy window, at most once every two seconds so that
// parking in the thick of it never becomes a strategy.
// 2s between mercy windows left you exposed if a second trap arrived inside that gap -- a full
// 55-minute playthrough found 8-11 frames where it did. 70 frames apart with a shorter window
// closes that without turning "stand in the fire" into a viable plan.
const escapeNow=()=>escapeExists(0,0,0,0,null);
function mercyTick(){
 if(P.dead||P.inv>0)return;
 if(t-(P.mercyT||-9999)<70)return;
 if(escapeNow())return;
 P.mercyT=t;P.inv=22;
}
function epush(o){
 if(ebullets.length>=EBCAP())return;
 if(!P.dead&&P.inv<=0&&!escapeExists(o.x,o.y,o.vx,o.vy,o.r))return;
 ebullets.push(o);}
function eshot(x,y,a,sp,r=4,col='#ff3b3b',kind='dart'){if(ebullets.length>=EBCAP())return;const bf=(bossAlive?.85:1)*(MODS.quick?1.12:1),es=DIFF.shotSpeed();
 const vx=Math.cos(a)*sp*es*bf,vy=Math.sin(a)*sp*es*bf,rr=Math.max(6,r+2);
 if(!P.dead&&P.inv<=0&&!escapeExists(x,y,vx,vy,rr))return;
 ebullets.push({x,y,vx,vy,r:rr,col,t:0,kind});}
// aim() leads the bee by however much the curve says this world should. At heat 0 it fires at
// where you stood, which you simply walk out of; at heat 1 it fires at where you are going.
function aim(x,y){
 const lead=DIFF.aimShare();
 if(lead<=0.02||P.dead)return Math.atan2(P.y-y,P.x-x);
 const pvx=P.x-P.px,pvy=P.y-P.py;
 const d=Math.hypot(P.x-x,P.y-y),tt=Math.min(46,d/Math.max(1.2,3*DIFF.shotSpeed()));
 return Math.atan2(P.y+pvy*tt*lead-y,P.x+pvx*tt*lead-x);}
function separate(){const n=enemies.length;
 // 'fall' is a normal descent pattern during play, so those get separated too.
 // only at level end, when everything is sweeping off for the boss, do we let them pass through.
 if(stageT>LV().len)return;
 for(let pass=0;pass<3;pass++)
 for(let i=0;i<n;i++){const a=enemies[i];if(a.tiny||a.dead)continue;
  for(let j=i+1;j<n;j++){const b=enemies[j];if(b.tiny||b.dead)continue;
   const dx=b.x-a.x,dy=b.y-a.y,min=(a.r+b.r)*1.45,d2=dx*dx+dy*dy;
   if(d2>.01&&d2<min*min){const d=Math.sqrt(d2),push=(min-d)*.5,ux=dx/d,uy=dy/d;
    a.x-=ux*push;a.y-=uy*push;b.x+=ux*push;b.y+=uy*push;
    if(a.ox!=null)a.ox-=ux*push;if(b.ox!=null)b.ox+=ux*push;
    const ma=a.r*1.1+2,mb=b.r*1.1+2;
    a.x=clamp(a.x,ma,W-ma);b.x=clamp(b.x,mb,W-mb);
    if(a.ox!=null)a.ox=clamp(a.ox,ma+20,W-ma-20);if(b.ox!=null)b.ox=clamp(b.ox,mb+20,W-mb-20);}}}
}
function updEnemy(e){e.t++;if(e.fl>0)e.fl--;if(e.slow>0)e.slow--;if(e.label>0)e.label--;const sp=(.5+D()*.4)*(e.slow>0?.45:1);if(!e.seen&&e.y>0&&e.y<H&&e.x>0&&e.x<W){e.seen=1;if(!e.tiny&&t-(lastLabel[e.type]||-9999)>420){e.label=150;lastLabel[e.type]=t;}if(!e.tiny)sfxEnter(e);}if(e.seen&&e.t%RI(50,90)===0&&Math.random()<.6)sfxIdle(e);
 // movement
 switch(e.pat){
  case 'sine':e.y+=1.4*sp;e.x=e.ox+Math.sin(e.t*.06)*70;break;
  case 'hop':{const ph=e.t%100;if(ph<60){e.y+=.35*sp;}else{if(ph===60){e.sx=e.x;e.sy=e.y;e.hx=clamp(P.x+R(-40,40),30,W-30);e.hy=e.y+R(120,190);(VOICE.grasshopper||{}).hop&&VOICE.grasshopper.hop();}const k=(ph-60)/40;e.x=e.sx+(e.hx-e.sx)*k;e.y=e.sy+(e.hy-e.sy)*k-Math.sin(k*Math.PI)*70;}break;}
  case 'charge':if(e.t<45){e.y+=1.2*sp;}else if(e.t<75){e.x+=R(-1.5,1.5);if(e.t===62){e.fl=14;ring(e.x,e.y,'#ffb03a',58);snd(300,.09,'square',.02,180);}}else{if(!e.a){e.a=aim(e.x,e.y);VOICE.hornet.enter();}const cs=Math.min(5.5*sp,PMAX);e.x+=Math.cos(e.a)*cs;e.y+=Math.sin(e.a)*cs;}break;
  case 'fall':e.y+=(e.vy||1.4)*sp;break;
  case 'dive':if(e.t<40){e.y+=1.5;if(e.t===28){e.fl=12;ring(e.x,e.y,'#ff6b6b',52);snd(520,.07,'square',.02,300);}}else{if(!e.a)e.a=aim(e.x,e.y);const ds=Math.min(3.5*sp,PMAX);e.x+=Math.cos(e.a)*ds;e.y+=Math.sin(e.a)*ds;}break;
  case 'arc':e.x+=e.dir*2.6*sp;e.y+=Math.min(2.2,e.t*.03)*sp;break;
  case 'zig':e.y+=1.5*sp;e.x+=e.dir*Math.min(3.2*sp,PMAX);if(e.t%40===0)e.dir*=-1;break;
  case 'rise':if(e.t<70){e.x+=e.dir*2.4*sp;e.y-=1.8*sp;if(e.t===58){e.fl=12;ring(e.x,e.y,'#ff6b6b',50);}}else{if(!e.a)e.a=aim(e.x,e.y);e.x+=Math.cos(e.a)*3*sp;e.y+=Math.sin(e.a)*3*sp;}break;
  case 'flutter':e.y+=.9*sp+Math.sin(e.t*.13+e.ph)*1.6;e.x+=Math.sin(e.t*.07+e.ph)*2.6+Math.cos(e.t*.21)*1.2;break;
  case 'thread':if(e.y<e.hang){e.y+=2.2*sp;}else if(e.t<420){e.x+=Math.sin(e.t*.05)*.8;}else{e.y+=3.5*sp;}break;
  case 'creep':e.y+=.45*sp;e.x+=Math.sin(e.t*.02)*.4;break;
  case 'scurry':e.y+=2.2*sp;e.x+=Math.sin(e.t*.4+e.ph)*1.2;break;
  case 'hover':if(e.t>720){e.y+=2*sp;break;}if(e.y<120)e.y+=1.5;else e.x+=e.dir*1.3*sp;if(e.x<30||e.x>W-30)e.dir*=-1;break;
  case 'slow':e.y+=.8;break;
  case 'drift':e.y+=1.2;e.x+=Math.sin(e.t*.03)*2.5;break;
  case 'swarm':e.y+=1.5*sp;e.x+=Math.sin(e.t*.22+e.ph)*3;break;
  case 'cloud':e.y+=.75*sp;e.x+=Math.sin(e.t*.3+e.ph)*1.4+Math.sin(e.t*.02+e.ph)*.4;break;
  case 'march':e.y+=.9*sp;e.x+=Math.sin(e.t*.15)*.6;break;
  case 'bounce':e.y+=.9*sp;e.x+=e.dir*2*sp;if(e.x<30||e.x>W-30)e.dir*=-1;break;
  case 'blink':e.y+=1.0*sp;e.x+=Math.sin(e.t*.04+e.ph)*2;break;
  case 'dash':if(!e.dx)e.dx=e.x<W/2?1:-1;e.x+=e.dx*Math.min(4.2*sp,PMAX);e.y+=Math.sin(e.t*.1)*1.5;break;
 }
 // shooting is by TYPE, so a wasp shoots the same way whatever formation it arrived in
 if(e.y>0&&e.y<H-80){switch(A(e.type)){
  case 'wasp':if(--e.ft<=0){e.ft=270*FR/sp;const a=aim(e.x,e.y);eshot(e.x,e.y,a-.14,3.2*sp,4,'#8fdc3a','venom');eshot(e.x,e.y,a+.14,3.2*sp,4,'#8fdc3a','venom');snd(300,.08,'triangle',.02,180,1200);}break;
  case 'beetle':if(--e.ft<=0){if(t-lastRadial<45){e.ft=24;break;}lastRadial=t;e.ft=240*FR/sp;const b0=Math.random()<DIFF.aimShare()?aim(e.x,e.y):e.t*.1;for(let i=0;i<4;i++)eshot(e.x,e.y,i*Math.PI/2+b0,2.5*sp,4,'#c77dff','seed');}break;
  case 'moth':if(--e.ft<=0){e.ft=200*FR;eshot(e.x,e.y,aim(e.x,e.y),3.5*sp,5,'#ffdd88','dust');}break;
  case 'ladybug':if(--e.ft<=0){e.ft=300*FR/sp;const a=aim(e.x,e.y);eshot(e.x,e.y,a,3*sp,4,'#8fdc3a','venom');}break;
  case 'firefly':e.glow=(Math.sin(e.t*.08)+1)/2;if(--e.ft<=0){e.ft=270*FR/sp;if(e.glow>.5){eshot(e.x,e.y,aim(e.x,e.y),2.6*sp,6,'#e8ff60','ember');snd(700,.1,'sine',.02,1400);}}break;
  case 'dragon':if(--e.ft<=0){e.ft=250*FR/sp;const da=Math.random()<DIFF.aimers()?aim(e.x,e.y):Math.PI/2;eshot(e.x-8,e.y+10,da,3.4*sp,4,'#60e0ff','drop');eshot(e.x+8,e.y+10,da,3.4*sp,4,'#60e0ff','drop');}break;
  case 'stinkbug':if(--e.ft<=0){e.ft=290*FR/sp;eshot(e.x,e.y+10,(Math.random()<DIFF.aimers()?aim(e.x,e.y):Math.PI/2)+R(-.4,.4),.9*sp,13,'#9acd32','gas');VOICE.stinkbug.gas();}break;
  case 'cicada':if(--e.ft<=0){if(t-lastRadial<45){e.ft=24;break;}lastRadial=t;e.ft=340*FR/sp;e.scream=30;const c0=Math.random()<DIFF.aimShare()?aim(e.x,e.y):e.t*.05;for(let i=0;i<6;i++)eshot(e.x,e.y,i*Math.PI/3+c0,2*sp,5,'#ffcc66','wave');VOICE.cicada.scream();}if(e.scream>0)e.scream--;break;
  case 'butterfly':if(--e.ft<=0){e.ft=320*FR/sp;eshot(e.x,e.y+8,Math.random()<DIFF.aimers()?aim(e.x,e.y):Math.PI/2,1.6*sp,5,'#ffd080','dust');}break;
  case 'spiderling':if(--e.ft<=0){e.ft=260*FR/sp;if(e.y>=e.hang-1)eshot(e.x,e.y,aim(e.x,e.y),2.6*sp,3,'#e8e8ff','web');}break;
  case 'snail':if(--e.ft<=0){e.ft=300*FR/sp;const a=aim(e.x,e.y);eshot(e.x,e.y-6,a,1.8*sp,6,'#8fdc3a','venom');}break;
  case 'glowworm':e.glow=(Math.sin(e.t*.06)+1)/2;if(--e.ft<=0){e.ft=260*FR/sp;eshot(e.x,e.y+6,(Math.random()<DIFF.aimers()?aim(e.x,e.y):Math.PI/2)+R(-.3,.3),1.4*sp,6,'#e8ff60','ember');}break;
  case 'dungbeetle':if(--e.ft<=0){e.ft=280*FR/sp;eshot(e.x,e.y+14,Math.random()<DIFF.aimers()?aim(e.x,e.y):Math.PI/2,1.6*sp,9,'#5a3a1a','acorn');snd(J(90),.15,'triangle',.03,50);}break;
 }}
 // a bug that gets past you should come back around for another run, not just vanish.
 // gnat clouds still blow through, and 'fall' is the level-end exit, so both still leave.
 if(e.tiny||e.pat==='fall'){if(e.y>H+40||e.x<-60||e.x>W+60)e.dead=1;}
 else if(e.y>H+40){
  // a squadron that has made its pass LEAVES, the way a 1943 formation flies off the bottom.
  // one return run first, so a bug you missed is not simply free, then it is gone.
  if((e.laps||0)>=1){e.dead=1;}
  else{e.y=-40;e.x=clamp(e.x+R(-70,70),30,W-30);if(e.ox!=null)e.ox=e.x;e.t=0;e.a=null;e.hx=e.hy=null;e.laps=1;}}
 else if(e.x<-60){e.x=W+50;if(e.ox!=null)e.ox=e.x;}
 else if(e.x>W+60){e.x=-50;if(e.ox!=null)e.ox=e.x;}

 // keep every bug inside the frame: a bug you cannot see is a bug you cannot fight.
 // 'dash' crosses the screen on purpose and 'fall' is the level-end exit, so those are exempt.
 if(e.pat!=='dash'&&e.pat!=='fall'&&e.y>-40){const m=e.r*1.1+2;
  if(e.x<m){e.x=m;if(e.vx<0)e.vx=-e.vx;if(e.ox!=null)e.ox=Math.max(e.ox,m+20);}
  if(e.x>W-m){e.x=W-m;if(e.vx>0)e.vx=-e.vx;if(e.ox!=null)e.ox=Math.min(e.ox,W-m-20);}
  // no bottom clamp any more: a bug that gets past you flies off the bottom and loops
  // back in at the top for another run. sitting pinned to the bottom edge read as stuck.
  }
}
