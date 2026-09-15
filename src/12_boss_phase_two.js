// ---------- boss second phases ----------
// How often a boss fires, as one number. 0.9 = it shoots 10 percent more often than it used
// to. Measured 2026-09-15 before this: the stage 12 boss put 119 shots up across a 100-second
// fight and a dodging bot was FORCED to move on only 1.6% of frames -- you could stand still
// for 98% of that fight. Matt felt it immediately: "I don't have to move out of the way."
const BFIRE=()=>DIFF.bossFire();
// Sixteen bosses share eight attack patterns, and the patterns fire at wildly different rates:
// measured 2026-09-15, the mantis pattern put up 692 shots in a fight where the scorpion put up
// 119. So a boss was as hard as the pattern it was handed, and world 16's boss came out EASIER
// than world 14's. BCOMP is the correction that makes every pattern hit the same output, so a
// boss fight's difficulty comes from its world's heat and nothing else. Filled in by
// measurement, not by guessing -- tools/difficulty_curve.mjs re-derives it.
// Measured at stage 9 with only the pattern swapped (shots per 60s), after the starved
// patterns got a third attack: 144, 284, 244, 87, 183, 158, 66, 166. BCOMP divides each of
// those down to a common ~170, so the pattern a boss was handed no longer decides the fight.
const BCOMP=[0.86,2.05,1.42,0.51,0.85,0.52,0.40,0.33];
// BCOMP levels the eight PATTERNS against each other. BFIT then places each of the sixteen
// BOSSES on the curve, because a levelled pattern still lands differently depending on the boss
// wearing it -- its size, where it sits, how much health it has. Measured one fight at a time
// with a fixed reference gun (tools/boss_table.mjs): before this the HORNET QUEEN, the FIRST
// boss in the game, forced more movement than the next six put together, while the PRAYING
// MANTIS at world 2 forced 1%. Same method as WFIT for the worlds: measure, correct, re-measure.
const BFIT=[1.25,0.75,0.80,1.04,0.76,1.05,0.75,1.38,0.58,1.34,0.52,0.49,0.58,0.52,0.44,0.63];
// sixteen bosses shared eight attack patterns and one identical enrage, so the fights blurred
// together. below half health each boss now opens its OWN attack on top of its pattern.
const PHASE2=[
 {cry:'THE QUEEN CALLS THE SWARM!', k:'fan'},      {cry:'THE SCYTHES COME DOWN!',   k:'cross'},
 {cry:'EVERY THREAD PULLS!',        k:'web'},      {cry:'TOO SLOW!',                k:'strafe'},
 {cry:'THE CROWN LOWERS!',          k:'charge'},   {cry:'TWO HUNGERS NOW!',         k:'split'},
 {cry:'HOLD STILL!',                k:'needle'},   {cry:'THE TAIL TAKES ROOT!',     k:'pincer'},
 {cry:'YOU LOOKED RIGHT AT ME!',    k:'ambush'},   {cry:'FOLLOW THE LIGHTS!',       k:'lantern'},
 {cry:'THE COLD BITES!',            k:'burst'},    {cry:'OLDER THAN YOU!',          k:'wall'},
 {cry:'EVERY EMBER IS MINE!',       k:'rain'},     {cry:'THE COLD PINCHES!',        k:'cross'},
 {cry:'THE LIGHTS BROUGHT ME!',     k:'strafe'},   {cry:'SHINE, LITTLE BEE!',       k:'spiral'},
];
function phase2(b){
 const k=PHASE2[LV().boss].k, d=D(), per=Math.max(14,88*BFIRE()*BFIT[(stage-1)%NL]);
 if(b.t%per) return;
 const aim0=Math.atan2(P.y-b.y,P.x-b.x);
 const shot=(a,sp,r,col,kind)=>epush({x:b.x,y:b.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r,col,t:0,kind});
 switch(k){
  case 'fan':     for(let i=-3;i<=3;i++)shot(aim0+i*.20,2.4+d,7,'#ffb03a','dart');break;
  case 'cross':   for(let i=0;i<4;i++)shot(i*Math.PI/2+t*.01,2.6+d,8,'#9dff8a','blade');break;
  case 'web':     for(let i=0;i<5;i++)shot(aim0+R(-.5,.5),1.7+d*.6,9,'#e8e8ff','web');break;
  case 'strafe':  for(let i=0;i<3;i++)shot(Math.PI/2+R(-.25,.25),3.2+d,6,'#7ae8ff','dart');break;
  case 'charge':  for(let i=-2;i<=2;i++)shot(Math.PI/2+i*.13,3.0+d,9,'#c08a40','acorn');break;
  case 'rain':    for(let i=0;i<6;i++)epush({x:R(20,W-20),y:-12,vx:0,vy:2.2+d,r:7,col:'#ff8a4a',t:0,kind:'ember'});break;
  case 'needle':  for(let i=0;i<2;i++)shot(aim0+R(-.06,.06),4.0+d,5,'#ff7070','dart');break;
  case 'spiral':  for(let i=0;i<3;i++)shot(b.t*.07+i*2.09,2.3+d,7,'#ffd6a0','dart');break;
  case 'ambush':  for(let i=0;i<4;i++)epush({x:P.x+R(-70,70),y:-12,vx:0,vy:2.6+d,r:7,col:'#9ad07a',t:0,kind:'seed'});break;
  case 'lantern': for(let i=0;i<7;i++)shot(i/7*6.283,1.9+d*.7,8,'#7fe8ff','drop');break;
  case 'burst':   for(let i=0;i<9;i++)shot(i/9*6.283+b.t*.02,2.1+d,7,'#bfe8ff','dart');break;
  // A rank across the whole width reads as a bar coming down at you, which is the exact thing
  // Matt called out. Same attack, but one shot is always missing: it is a wall with a DOOR, and
  // you can see the door from the moment it appears. The gap moves every time.
  case 'wall':    {const door=RI(1,6);for(let i=0;i<8;i++){if(i===door)continue;epush({x:20+i*((W-40)/7),y:-12,vx:0,vy:2.0+d,r:8,col:'#8aa08a',t:0,kind:'dart'});}}break;
  case 'split':   if(b.x2!=null){const a2=Math.atan2(P.y-b.y2,P.x-b.x2);shot(aim0+.12,2.2+d,6,'#8fdc3a','venom');epush({x:b.x2,y:b.y2,vx:Math.cos(a2-.12)*(2.2+d),vy:Math.sin(a2-.12)*(2.2+d),r:8,col:'#8fdc3a',t:0,kind:'venom'});}break;
  case 'pincer':  for(const s of[-1,1])epush({x:s<0?10:W-10,y:clamp(P.y+R(-60,20),80,H-60),vx:(s<0?1:-1)*(2.2+d),vy:R(-.3,.3),r:7,col:'#e8c070',t:0,kind:'blade'});break;
 }
}
// half health is a JOB CHANGE, not a speed bump. rageBoss flips the switch and builds
// whatever new body the second half of the fight needs; phase2() plays the new attack.
function rageBoss(b){if(b.rage)return;b.rage=1;const real=LV().boss;say(PHASE2[real].cry);shake=20;stop(5);buzz('warn');rumble(1,.06);hiss(.9,.05,6000,1500);chitter(14,1400,.035,20);
 if(real===5){b.seg.length=Math.min(b.seg.length,90);b.seg2=b.seg.map(s=>({x:W-s.x,y:s.y}));}   // the mother splits: two shorter snakes that pinch
 if(real===7){b.turret={x:clamp(b.x,70,W-70),y:Math.max(90,b.y-10),t:0};}                        // the tail plants as a turret while the body flanks
 if(real===8)b.camoT=0;                                                                          // fades into the canopy; only the twig-sway tells
 if(real===15){const w=b.max*.16;b.wings={l:w,r:w,max:w};say('THE WINGS BECOME SHIELDS!');}      // break a wing, feast on the scales
}
// the landing: the first frame a boss is properly on screen the ground answers -- shake,
// dust, a roar, a shockwave and its name punched in. It arrives; it does not just appear.
function bossLand(b){b.landed=1;shake=18;stop(3);buzz('heavy');announce(b.name,'#ff9f9f');rumble(1.2,.08);noise(.5,.05,500,.8,150,'lowpass');ring(b.x,b.y,b.col,240);
 for(let k=0;k<28;k++)parts.push({x:b.x+R(-80,80),y:b.y+R(20,70),vx:R(-2.6,2.6),vy:R(-1.6,.4),l:R(22,44),c:['#8a7a5a','#6a5a3a','#b0a080'][RI(0,2)],r:R(2,5)});}
function updBoss(b){b.t++;if(b.fl>0)b.fl--;if(!b.landed&&b.y>=60)bossLand(b);if(b.y>0)sfxBossIdle(b);let sp=.55+D()*.5;if(!b.rage&&b.hp<b.max*.5)rageBoss(b);if(b.rage)sp*=1.15;if(b.rage)phase2(b);const rf=(b.rage?.8:1)*BFIRE()*BCOMP[BARCH[LV().boss]]*BFIT[(stage-1)%NL];   // BFIRE: Matt 9/15 wanted ~10% more bullets out of the bosses
 if(LV().boss===8&&b.rage){b.camoT=(b.camoT||0)+1;const ph=b.camoT%300;b.camo=ph>=150;if(ph===150&&!b.saidCamo){b.saidCamo=1;say('ONLY THE TWIG-SWAY TELLS');}
  if(b.camo&&b.t%26===0)parts.push({x:b.x+R(-30,30),y:b.y+R(-20,40),vx:R(-.3,.3),vy:R(.2,.8),l:22,c:'#7a8a4a',r:2});}
 const rest=BARCH[LV().boss]===5?60:BSIZE[LV().boss]*.5+14;if(b.y<rest){b.y+=1.2;return;}   // centipede drives its own Y; everyone else stops low enough that the whole sprite is on screen
 // and keep the whole sprite inside the sides too -- the stag beetle's antlers were running off the left
 {const sp=SPR['boss'+LV().boss];if(sp){const hw=BSIZE[LV().boss]*(sp.width/sp.height)*.5+6;if(hw<W*.5)b.x=clamp(b.x,hw,W-hw);}}
 const i=BARCH[LV().boss];
 if(i===5){ // centipede: head snakes across, body trails
  // a longer, smoother serpentine so the body never folds back over its own head
  b.x=W/2+Math.cos(b.t*.0165)*(W/2-56);b.y=150+Math.sin(b.t*.0165)*74;
  b.seg.unshift({x:b.x,y:b.y});if(b.seg.length>(b.rage?90:200))b.seg.pop();
  if(b.rage){ // JOB CHANGE: split into two shorter snakes -- the twin mirrors and the pair pinch
   b.x2=W-b.x;b.y2=150+Math.sin(b.t*.0165+Math.PI/2)*74;
   b.seg2=b.seg2||[];b.seg2.unshift({x:b.x2,y:b.y2});if(b.seg2.length>90)b.seg2.pop();}
  if(b.t%(Math.max(8,220*rf)|0)===0){const a=aim(b.x,b.y);for(let k=-1;k<=1;k+=2)eshot(b.x,b.y+10,a+k*.16,3.4*sp,5,'#8fdc3a','venom');if(b.rage&&b.x2!=null)eshot(b.x2,b.y2+10,aim(b.x2,b.y2),3.4*sp,5,'#8fdc3a','venom');snd(200,.1);}
  if(b.t%(Math.max(8,190*rf)|0)===0){const s=b.seg[Math.min(b.seg.length-1,RI(40,Math.min(140,b.seg.length-1)))];if(s)eshot(s.x,s.y,Math.PI/2+R(-.3,.3),2.4*sp,5,'#8fdc3a','venom');}
  if(b.t%520===0)for(let k=0;k<2;k++)spawn(anyBug(),R(40,W-40),-20,{pat:'march'});
  return;}
 b.x=W/2+Math.sin(b.t*.012)*(W/2-70);
 if(i===0){ // hornet: small aimed bursts + a slow ring + the odd mosquito
  if(b.t%(Math.max(8,210*rf)|0)===0){const a=aim(b.x,b.y);for(let k=-1;k<=1;k+=2)eshot(b.x,b.y+20,a+k*.18,3.6*sp,4,'#ff3b3b','dart');snd(200,.1);}
  if(b.t%520===0){for(let k=0;k<4;k++)eshot(b.x,b.y,k*Math.PI/2+Math.PI/4,2.4*sp,5,'#ffcc33');}
  if(b.t%(Math.max(8,150*rf)|0)===0){const a=aim(b.x,b.y);for(let k=-1;k<=1;k++)eshot(b.x,b.y+16,a+k*.30,2.8*sp,5,'#ffcc33','dart');}
  if(b.t%700===0)spawn(anyBug(),b.x+R(-60,60),b.y,{pat:'dive'});
 }else if(i===1){ // mantis: scythe sweeps + falling walls
  if(b.t%(Math.max(10,32*rf)|0)===0){const a=b.t*.04;eshot(b.x,b.y,a,4*sp,4,'#7ed957','blade');eshot(b.x,b.y,a+Math.PI,4*sp,4,'#7ed957','blade');}
  if(b.t%(Math.max(8,300*rf)|0)===0){for(let x=20;x<W;x+=90)if(Math.abs(x-P.x)>70)eshot(x,-10,Math.PI/2,3.5*sp,6,'#b5ff7a','blade');}
  if(b.t%320===0)for(let k=0;k<2;k++)spawn(anyBug(),R(40,W-40),-20,{pat:'sine',ox:R(80,W-80)});
 }else if(i===2){ // spider: spirals + slow big webs
  if(b.t%(Math.max(12,46*rf)|0)===0){const a=b.t*.09;eshot(b.x,b.y,a,3*sp,3,'#e8e8ff','web');}
  if(b.t%(Math.max(8,160*rf)|0)===0){const a=aim(b.x,b.y);for(let k=-1;k<=1;k++)eshot(b.x,b.y,a+k*.16,2.2*sp,9,'#e8e8ff','web');}
  // the webs only tangle. these bite.
  if(b.t%(Math.max(8,150*rf)|0)===0){const a=aim(b.x,b.y);for(let k=-1;k<=1;k++)eshot(b.x,b.y+8,a+k*.20,2.5*sp,4,'#ff2d2d','fang');snd(200,.1);}
  if(b.rage&&b.t%(Math.max(8,240*rf)|0)===0){for(let k=0;k<5;k++)eshot(b.x,b.y,aim(b.x,b.y)+R(-.55,.55),2.9*sp,4,'#ff2d2d','fang');}
  if(b.t%520===0)spawn(anyBug(),R(60,W-60),-30,{pat:'slow'});
 }else if(i===3){ // dragonfly: darts fast, straight double shots, strafes
  b.x=W/2+Math.sin(b.t*.03)*(W/2-70);b.y=110+Math.abs(Math.sin(b.t*.015))*60;
  if(b.t%(Math.max(8,90*rf)|0)===0){eshot(b.x-14,b.y+20,Math.PI/2,4*sp,4,'#60e0ff','drop');eshot(b.x+14,b.y+20,Math.PI/2,4*sp,4,'#60e0ff','drop');}
  if(b.t%(Math.max(8,360*rf)|0)===0){const a=aim(b.x,b.y);for(let k=-1;k<=1;k++)eshot(b.x,b.y,a+k*.14,4.5*sp,4,'#a0f0ff','drop');snd(400,.1,'sine',.03,900);}
  if(b.t%520===0)spawn(anyBug(),Math.random()<.5?-20:W+20,R(150,220),{pat:'dash'});
 }else if(i===4){ // stag beetle: heavy slow shots, dropping acorns, ants
  // b.camo is only ever set on the walking stick: hidden in the canopy it holds its fire,
  // because a shot from empty air would give the trick away (and feel cheap)
  // This pattern (stag beetle, walking stick, ARMOR CRAB KING on stage 12) fired a quarter of
  // what the mantis pattern does -- two thin lines and nothing to weave through. Tightened,
  // plus a spread of falling acorns so there is an actual shape to slip between.
  if(!b.camo&&b.t%(Math.max(8,130*rf)|0)===0){const a=aim(b.x,b.y);for(let k=-1;k<=1;k+=2)eshot(b.x,b.y+30,a+k*.26,2.6*sp,8,'#8a4a10','acorn');snd(120,.15,'triangle',.05,60);}
  if(!b.camo&&b.t%(Math.max(8,150*rf)|0)===0)eshot(R(30,W-30),-10,Math.PI/2,2.2*sp,7,'#c07030','acorn');
  if(!b.camo&&b.t%(Math.max(8,260*rf)|0)===0){const gx=R(60,W-60);for(let k=-1;k<=1;k++)eshot(clamp(gx+k*95,20,W-20),-10,Math.PI/2,2.0*sp,7,'#c07030','acorn');}
  if(b.t%560===0)for(let k=0;k<2;k++)spawn(anyBug(),b.x+R(-50,50),b.y+20,{pat:'march'});
 }else if(i===6){ // mosquito matriarch: hovers, then lunges down at you and pulls back up; spits venom; calls gnats
  if(b.lunge>0){b.lunge--;if(b.lunge>25){b.x+=Math.cos(b.la)*5*sp;b.y+=Math.sin(b.la)*5*sp;}else{b.y+=(110-b.y)*.08;}}
  else{b.y+=(110+Math.sin(b.t*.03)*20-b.y)*.05;if(b.t%(Math.max(8,240*rf)|0)===0){b.lunge=50;b.la=aim(b.x,b.y);buzz(J(1200),.5,'sine',.04,200,14,5000,600);}}
  if(b.t%(Math.max(8,230*rf)|0)===0){const a=aim(b.x,b.y);eshot(b.x,b.y+20,a,3.2*sp,4,'#8fdc3a','venom');}
  if(b.t%(Math.max(8,120*rf)|0)===0){const a=aim(b.x,b.y);for(let k=-1;k<=1;k+=2)eshot(b.x,b.y+18,a+k*.22,2.9*sp,5,'#8fdc3a','venom');}
  if(b.t%(Math.max(8,340*rf)|0)===0){for(let k=0;k<5;k++)eshot(b.x,b.y+10,Math.PI/2+(k-2)*.26,2.3*sp,6,'#a8e86a','venom');}
  if(b.t%900===0)FORMS.cloud();
 }else if(i===7){ // scorpion king: scuttles side to side, tail stabs (fast darts), pincer sweeps (blades), ants
  // JOB CHANGE at half health: the tail plants in the sand as a turret (drawn where it rooted)
  // and keeps firing aimed darts from there while the body flanks faster with pincers only.
  b.x=W/2+Math.sin(b.t*(b.rage?.032:.02))*(W/2-80);b.y=110+Math.abs(Math.sin(b.t*.01))*30;
  if(b.rage&&b.turret){b.turret.t++;if(b.turret.t%(Math.max(8,120*rf)|0)===0){const a=Math.atan2(P.y-b.turret.y,P.x-b.turret.x);eshot(b.turret.x,b.turret.y,a,4.2*sp,4,'#ff3b3b','dart');click(700,.04);}}
  if(!b.rage&&b.t%(Math.max(8,190*rf)|0)===0){const a=aim(b.x,b.y);for(let k=-1;k<=1;k+=2)eshot(b.x,b.y-30,a+k*.1,5*sp,4,'#ff3b3b','dart');click(600,.04);}
  if(b.t%(Math.max(8,280*rf)|0)===0){for(const sg of[-1,1])eshot(b.x+sg*40,b.y+10,Math.PI/2+sg*.35,2.8*sp,6,'#e8c070','blade');}
  if(b.t%(Math.max(8,135*rf)|0)===0){const a=aim(b.x,b.y);for(let k=-1;k<=1;k++)eshot(b.x,b.y-24,a+k*.17,3.6*sp,4,'#ff6b3b','dart');}
  if(b.t%(Math.max(8,300*rf)|0)===0){const gx=clamp(P.x+R(-60,60),30,W-30);for(let k=-1;k<=1;k++)eshot(gx+k*70,-10,Math.PI/2,2.4*sp,6,'#e8c070','blade');}
  if(b.t%440===0)for(let k=0;k<2;k++)spawn(anyBug(),b.x+R(-60,60),b.y+30,{pat:'march'});
 }
}
