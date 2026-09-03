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
function wave(){const lv=LV(),pr=stageT/lv.len;
 if(stageT>lv.len){for(const e of enemies){if(e.pat!=='fall'){e.pat='fall';e.vy=6;}}return;}
 const cap=6+Math.floor(((stage-1)%NL)*1.1)+loop*2;
 // count only REAL bugs against the cap. a gnat cloud is 40-plus tiny sprites and it was
 // blowing straight past the cap, so one cloud starved the whole level of actual enemies.
 let big=0;for(const e of enemies)if(!e.tiny&&!e.dead)big++;
 // an empty screen is dead air. if nothing is left to fight, the next wave comes NOW
 // instead of waiting out the timer.
 if(big===0&&nextWave>stageT)nextWave=stageT;
 if(stageT<nextWave||big>=cap)return;
 const gap=Math.max(120-((stage-1)%NL)*5,236-pr*100-(stage-1)*12-loop*20);nextWave=stageT+gap;
 // a gnat cloud is atmosphere, not a wave. it used to consume the wave slot and return,
 // so a level could be nothing but gnats for ten seconds. now it drops the cloud and the
 // real wave keeps coming in the same breath. spaced out too, since levels are twice as long.
 if(stageT>=nextCloud){nextCloud=stageT+RI(1250,1850)-(lv.decor==='pond'?250:0);FORMS.cloud();say((BUGINFO[LV().cloud]?BUGINFO[LV().cloud].name:'GNATS')+' SWARMING!');}
 const fod=lv.roster.filter(k=>FODDER.includes(k)),sho=lv.roster.filter(k=>SHOOTERS.includes(k));
 // the newest bug of each world (last in its roster) was one random pick among six and went
 // unseen for whole runs; give it four in ten of the waves it qualifies for
 const nwst=lv.roster[lv.roster.length-1],pick=a=>(a.includes(nwst)&&Math.random()<.4)?nwst:a[RI(0,a.length-1)];
 if(!rushDone&&pr>.55){rushDone=true;say('SWARM INCOMING!');snd(300,.3,'square',.04,600);FORMS.line(fod[0]||'fly');FORMS.vee(fod[RI(0,fod.length-1)]||'fly');return;}
 const sig=lv.roster[0];const useShooter=sho.length&&Math.random()<.35+pr*.2;if(Math.random()<.45){if(SHOOTERS.includes(sig)&&!FODDER.includes(sig)){const as2=A(sig);if(as2==='cicada')FORMS.screamer(sig);else if(as2==='dragon')FORMS.heavy(sig);else if(as2==='snail')FORMS.crawler(sig);else if(as2==='stinkbug')FORMS.stinker(sig);else if(as2==='glowworm'||as2==='dungbeetle')spawn(sig,R(60,W-60),-30,{pat:as2==='glowworm'?'creep':'slow'});else FORMS[SHOOTER_FORMS[RI(0,1)]](sig);}else{let f=FODDER_FORMS[RI(0,FODDER_FORMS.length-1)];if(sig==='grasshopper')f='hoppers';if(sig==='hornet')f='chargers';if(sig==='spiderling')f='threads';if(sig==='earwig')f='zig';const asig=A(sig);if(asig==='ladybug')f=['line','vee','column'][RI(0,2)];if(asig==='firefly')f='column';if(asig==='dragon')f='skaters';if(asig==='grasshopper')f='hoppers';if(asig==='butterfly')f='flutters';if(asig==='ant')f='column';if(asig==='fly')f=['line','vee','column'][RI(0,2)];if(asig==='earwig')f='zig';if(asig==='gnat')f='swarm';if(asig==='mosquito')f='divers';if(asig==='strider')f='skaters';if(asig==='wasp')f='flank';FORMS[f](sig);}return;}
 if(useShooter){const k=pick(sho);const ak=A(k);if(ak==='cicada')FORMS.screamer(k);else if(ak==='stinkbug')FORMS.stinker(k);else if(ak==='snail')FORMS.crawler(k);else if(ak==='spiderling')FORMS.threads(k);else if(ak==='glowworm'||ak==='dungbeetle')spawn(k,R(60,W-60),-30,{pat:ak==='glowworm'?'creep':'slow'});else FORMS[SHOOTER_FORMS[RI(0,1)]](k);}
 else if(Math.random()<.55){const k=pick(fod)||'fly';SYMFORMS[RI(0,SYMFORMS.length-1)](k,RI(4,6));}
 else{const k=pick(fod)||'fly',ak=A(k);let f=FODDER_FORMS[RI(0,FODDER_FORMS.length-1)];if(ak==='gnat')f='swarm';if(ak==='grasshopper')f='hoppers';if(ak==='hornet')f=Math.random()<.6?'chargers':'pincer';if(ak==='spiderling')f='threads';if(ak==='butterfly')f='flutters';if(ak==='earwig')f=Math.random()<.6?'zig':'pincer';if(ak==='katydid')f='hoppers';if(ak==='strider')f='skaters';if(ak==='weevil')f='chargers';if(ak==='termite')f='scurry';if(ak==='horsefly')f='divers';if(ak==='ant')f=Math.random()<.5?'column':'line';if(k==='ant'&&(f==='pincer'||f==='ambush'))f='column';FORMS[f](k);}
 if(Math.random()<.22+((stage-1)%NL)*.052+loop*.1&&enemies.length){const e=enemies[enemies.length-1];if(!e.elite&&!e.tiny){e.elite=1;e.hp*=2.2+((stage-1)%NL)*.06;e.maxhp=e.hp;e.sc*=3;}}
}
const anyBug=()=>{const r=LV().roster;return r[RI(0,r.length-1)];};
const PD=1.70; // player damage multiplier — guns felt weak at 1.15
const EB=.5;const FR0=1.3; // FR = how much longer bugs wait between volleys
Object.defineProperty(globalThis,'FR',{get(){const lv=(stage-1)%NL;return Math.max(.55,FR0-lv*.055-loop*.1)*(MODS.quick?.72:1);}});
// kinds: dart (default), venom (green drop), seed (spiky seed), dust (moth scale puff), ember (firefly spark), drop (water), gas (stink cloud), wave (cicada sound ring), web (sticks to you and slows you), blade (mantis scythe), acorn (beetle king)
function eshot(x,y,a,sp,r=4,col='#ff3b3b',kind='dart'){const bf=(bossAlive?.85:1)*(MODS.quick?1.12:1);ebullets.push({x,y,vx:Math.cos(a)*sp*EB*bf,vy:Math.sin(a)*sp*EB*bf,r:Math.max(6,r+2),col,t:0,kind});}
function aim(x,y){return Math.atan2(P.y-y,P.x-x);}
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
  case 'charge':if(e.t<45){e.y+=1.2*sp;}else if(e.t<75){e.x+=R(-1.5,1.5);}else{if(!e.a){e.a=aim(e.x,e.y);VOICE.hornet.enter();}e.x+=Math.cos(e.a)*5.5*sp;e.y+=Math.sin(e.a)*5.5*sp;}break;
  case 'fall':e.y+=(e.vy||1.4)*sp;break;
  case 'dive':if(e.t<40){e.y+=1.5;}else{if(!e.a)e.a=aim(e.x,e.y);e.x+=Math.cos(e.a)*3.5*sp;e.y+=Math.sin(e.a)*3.5*sp;}break;
  case 'arc':e.x+=e.dir*2.6*sp;e.y+=Math.min(2.2,e.t*.03)*sp;break;
  case 'zig':e.y+=1.5*sp;e.x+=e.dir*3.2*sp;if(e.t%40===0)e.dir*=-1;break;
  case 'rise':if(e.t<70){e.x+=e.dir*2.4*sp;e.y-=1.8*sp;}else{if(!e.a)e.a=aim(e.x,e.y);e.x+=Math.cos(e.a)*3*sp;e.y+=Math.sin(e.a)*3*sp;}break;
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
  case 'dash':if(!e.dx)e.dx=e.x<W/2?1:-1;e.x+=e.dx*4.2*sp;e.y+=Math.sin(e.t*.1)*1.5;break;
 }
 // shooting is by TYPE, so a wasp shoots the same way whatever formation it arrived in
 if(e.y>0&&e.y<H-80){switch(A(e.type)){
  case 'wasp':if(--e.ft<=0){e.ft=270*FR/sp;const a=aim(e.x,e.y);eshot(e.x,e.y,a-.14,3.2*sp,4,'#8fdc3a','venom');eshot(e.x,e.y,a+.14,3.2*sp,4,'#8fdc3a','venom');snd(300,.08,'triangle',.02,180,1200);}break;
  case 'beetle':if(--e.ft<=0){e.ft=240*FR/sp;for(let i=0;i<4;i++)eshot(e.x,e.y,i*Math.PI/2+e.t*.1,2.5*sp,4,'#c77dff','seed');}break;
  case 'moth':if(--e.ft<=0){e.ft=200*FR;eshot(e.x,e.y,aim(e.x,e.y),3.5*sp,5,'#ffdd88','dust');}break;
  case 'ladybug':if(--e.ft<=0){e.ft=300*FR/sp;const a=aim(e.x,e.y);eshot(e.x,e.y,a,3*sp,4,'#8fdc3a','venom');}break;
  case 'firefly':e.glow=(Math.sin(e.t*.08)+1)/2;if(--e.ft<=0){e.ft=270*FR/sp;if(e.glow>.5){eshot(e.x,e.y,aim(e.x,e.y),2.6*sp,6,'#e8ff60','ember');snd(700,.1,'sine',.02,1400);}}break;
  case 'dragon':if(--e.ft<=0){e.ft=250*FR/sp;eshot(e.x-8,e.y+10,Math.PI/2,3.4*sp,4,'#60e0ff','drop');eshot(e.x+8,e.y+10,Math.PI/2,3.4*sp,4,'#60e0ff','drop');}break;
  case 'stinkbug':if(--e.ft<=0){e.ft=290*FR/sp;eshot(e.x,e.y+10,Math.PI/2+R(-.4,.4),.9*sp,13,'#9acd32','gas');VOICE.stinkbug.gas();}break;
  case 'cicada':if(--e.ft<=0){e.ft=340*FR/sp;e.scream=30;for(let i=0;i<6;i++)eshot(e.x,e.y,i*Math.PI/3+e.t*.05,2*sp,5,'#ffcc66','wave');VOICE.cicada.scream();}if(e.scream>0)e.scream--;break;
  case 'butterfly':if(--e.ft<=0){e.ft=320*FR/sp;eshot(e.x,e.y+8,Math.PI/2,1.6*sp,5,'#ffd080','dust');}break;
  case 'spiderling':if(--e.ft<=0){e.ft=260*FR/sp;if(e.y>=e.hang-1)eshot(e.x,e.y,aim(e.x,e.y),2.6*sp,3,'#e8e8ff','web');}break;
  case 'snail':if(--e.ft<=0){e.ft=300*FR/sp;const a=aim(e.x,e.y);eshot(e.x,e.y-6,a,1.8*sp,6,'#8fdc3a','venom');}break;
  case 'glowworm':e.glow=(Math.sin(e.t*.06)+1)/2;if(--e.ft<=0){e.ft=260*FR/sp;eshot(e.x,e.y+6,Math.PI/2+R(-.3,.3),1.4*sp,6,'#e8ff60','ember');}break;
  case 'dungbeetle':if(--e.ft<=0){e.ft=280*FR/sp;eshot(e.x,e.y+14,Math.PI/2,1.6*sp,9,'#5a3a1a','acorn');snd(J(90),.15,'triangle',.03,50);}break;
 }}
 // a bug that gets past you should come back around for another run, not just vanish.
 // gnat clouds still blow through, and 'fall' is the level-end exit, so both still leave.
 if(e.tiny||e.pat==='fall'){if(e.y>H+40||e.x<-60||e.x>W+60)e.dead=1;}
 else if(e.y>H+40){e.y=-40;e.x=clamp(e.x+R(-70,70),30,W-30);if(e.ox!=null)e.ox=e.x;e.t=0;e.a=null;e.hx=e.hy=null;e.laps=(e.laps||0)+1;}
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
