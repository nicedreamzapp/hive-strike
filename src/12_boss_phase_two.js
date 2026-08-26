// ---------- boss second phases ----------
// sixteen bosses shared eight attack patterns and one identical enrage, so the fights blurred
// together. below half health each boss now opens its OWN attack on top of its pattern.
const PHASE2=[
 {cry:'THE QUEEN CALLS THE SWARM!', k:'fan'},      {cry:'THE SCYTHES COME DOWN!',   k:'cross'},
 {cry:'EVERY THREAD PULLS!',        k:'web'},      {cry:'TOO SLOW!',                k:'strafe'},
 {cry:'THE CROWN LOWERS!',          k:'charge'},   {cry:'A HUNDRED LEGS!',          k:'rain'},
 {cry:'HOLD STILL!',                k:'needle'},   {cry:'THE SAND REMEMBERS!',      k:'spiral'},
 {cry:'YOU LOOKED RIGHT AT ME!',    k:'ambush'},   {cry:'FOLLOW THE LIGHTS!',       k:'lantern'},
 {cry:'THE COLD BITES!',            k:'burst'},    {cry:'OLDER THAN YOU!',          k:'wall'},
 {cry:'EVERY EMBER IS MINE!',       k:'rain'},     {cry:'THE COLD PINCHES!',        k:'cross'},
 {cry:'THE LIGHTS BROUGHT ME!',     k:'strafe'},   {cry:'SHINE, LITTLE BEE!',       k:'spiral'},
];
function phase2(b){
 const k=PHASE2[LV().boss].k, d=D(), per=Math.max(16,80-((stage-1)%NL)*4.2);
 if(b.t%per) return;
 const aim0=Math.atan2(P.y-b.y,P.x-b.x);
 const shot=(a,sp,r,col,kind)=>ebullets.push({x:b.x,y:b.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r,col,t:0,kind});
 switch(k){
  case 'fan':     for(let i=-3;i<=3;i++)shot(aim0+i*.20,2.4+d,7,'#ffb03a','dart');break;
  case 'cross':   for(let i=0;i<4;i++)shot(i*Math.PI/2+t*.01,2.6+d,8,'#9dff8a','blade');break;
  case 'web':     for(let i=0;i<5;i++)shot(aim0+R(-.5,.5),1.7+d*.6,9,'#e8e8ff','web');break;
  case 'strafe':  for(let i=0;i<3;i++)shot(Math.PI/2+R(-.25,.25),3.2+d,6,'#7ae8ff','dart');break;
  case 'charge':  for(let i=-2;i<=2;i++)shot(Math.PI/2+i*.13,3.0+d,9,'#c08a40','acorn');break;
  case 'rain':    for(let i=0;i<6;i++)ebullets.push({x:R(20,W-20),y:-12,vx:0,vy:2.2+d,r:7,col:'#ff8a4a',t:0,kind:'ember'});break;
  case 'needle':  for(let i=0;i<2;i++)shot(aim0+R(-.06,.06),4.0+d,5,'#ff7070','dart');break;
  case 'spiral':  for(let i=0;i<3;i++)shot(b.t*.07+i*2.09,2.3+d,7,'#ffd6a0','dart');break;
  case 'ambush':  for(let i=0;i<4;i++)ebullets.push({x:P.x+R(-70,70),y:-12,vx:0,vy:2.6+d,r:7,col:'#9ad07a',t:0,kind:'seed'});break;
  case 'lantern': for(let i=0;i<7;i++)shot(i/7*6.283,1.9+d*.7,8,'#7fe8ff','drop');break;
  case 'burst':   for(let i=0;i<9;i++)shot(i/9*6.283+b.t*.02,2.1+d,7,'#bfe8ff','dart');break;
  case 'wall':    for(let i=0;i<8;i++)ebullets.push({x:20+i*((W-40)/7),y:-12,vx:0,vy:2.0+d,r:8,col:'#8aa08a',t:0,kind:'dart'});break;
 }
}
function updBoss(b){b.t++;if(b.fl>0)b.fl--;if(b.y>0)sfxBossIdle(b);let sp=.55+D()*.5;if(!b.rage&&b.hp<b.max*.5){b.rage=1;say(PHASE2[LV().boss].cry);shake=20;rumble(1,.06);hiss(.9,.05,6000,1500);chitter(14,1400,.035,20);}if(b.rage)sp*=1.15;if(b.rage)phase2(b);const rf=b.rage?.8:1;
 const rest=BARCH[LV().boss]===5?60:BSIZE[LV().boss]*.5+14;if(b.y<rest){b.y+=1.2;return;}   // centipede drives its own Y; everyone else stops low enough that the whole sprite is on screen
 // and keep the whole sprite inside the sides too -- the stag beetle's antlers were running off the left
 {const sp=SPR['boss'+LV().boss];if(sp){const hw=BSIZE[LV().boss]*(sp.width/sp.height)*.5+6;if(hw<W*.5)b.x=clamp(b.x,hw,W-hw);}}
 const i=BARCH[LV().boss];
 if(i===5){ // centipede: head snakes across, body trails
  // a longer, smoother serpentine so the body never folds back over its own head
  b.x=W/2+Math.cos(b.t*.0165)*(W/2-56);b.y=150+Math.sin(b.t*.0165)*74;
  b.seg.unshift({x:b.x,y:b.y});if(b.seg.length>200)b.seg.pop();
  if(b.t%(220*rf|0)===0){const a=aim(b.x,b.y);for(let k=-1;k<=1;k+=2)eshot(b.x,b.y+10,a+k*.16,3.4*sp,5,'#8fdc3a','venom');snd(200,.1);}
  if(b.t%(190*rf|0)===0){const s=b.seg[Math.min(b.seg.length-1,RI(40,140))];if(s)eshot(s.x,s.y,Math.PI/2+R(-.3,.3),2.4*sp,5,'#8fdc3a','venom');}
  if(b.t%520===0)for(let k=0;k<2;k++)spawn(anyBug(),R(40,W-40),-20,{pat:'march'});
  return;}
 b.x=W/2+Math.sin(b.t*.012)*(W/2-70);
 if(i===0){ // hornet: small aimed bursts + a slow ring + the odd mosquito
  if(b.t%(210*rf|0)===0){const a=aim(b.x,b.y);for(let k=-1;k<=1;k+=2)eshot(b.x,b.y+20,a+k*.18,3.6*sp,4,'#ff3b3b','dart');snd(200,.1);}
  if(b.t%520===0){for(let k=0;k<4;k++)eshot(b.x,b.y,k*Math.PI/2+Math.PI/4,2.4*sp,5,'#ffcc33');}
  if(b.t%700===0)spawn(anyBug(),b.x+R(-60,60),b.y,{pat:'dive'});
 }else if(i===1){ // mantis: scythe sweeps + falling walls
  if(b.t%32===0){const a=b.t*.04;eshot(b.x,b.y,a,4*sp,4,'#7ed957','blade');eshot(b.x,b.y,a+Math.PI,4*sp,4,'#7ed957','blade');}
  if(b.t%(300*rf|0)===0){for(let x=20;x<W;x+=90)if(Math.abs(x-P.x)>70)eshot(x,-10,Math.PI/2,3.5*sp,6,'#b5ff7a','blade');}
  if(b.t%320===0)for(let k=0;k<2;k++)spawn(anyBug(),R(40,W-40),-20,{pat:'sine',ox:R(80,W-80)});
 }else if(i===2){ // spider: spirals + slow big webs
  if(b.t%46===0){const a=b.t*.09;eshot(b.x,b.y,a,3*sp,3,'#e8e8ff','web');}
  if(b.t%(160*rf|0)===0){const a=aim(b.x,b.y);for(let k=-1;k<=1;k++)eshot(b.x,b.y,a+k*.16,2.2*sp,9,'#e8e8ff','web');}
  // the webs only tangle. these bite.
  if(b.t%(150*rf|0)===0){const a=aim(b.x,b.y);for(let k=-1;k<=1;k++)eshot(b.x,b.y+8,a+k*.20,2.5*sp,4,'#ff2d2d','fang');snd(200,.1);}
  if(b.rage&&b.t%(240*rf|0)===0){for(let k=0;k<5;k++)eshot(b.x,b.y,aim(b.x,b.y)+R(-.55,.55),2.9*sp,4,'#ff2d2d','fang');}
  if(b.t%520===0)spawn(anyBug(),R(60,W-60),-30,{pat:'slow'});
 }else if(i===3){ // dragonfly: darts fast, straight double shots, strafes
  b.x=W/2+Math.sin(b.t*.03)*(W/2-70);b.y=110+Math.abs(Math.sin(b.t*.015))*60;
  if(b.t%(90*rf|0)===0){eshot(b.x-14,b.y+20,Math.PI/2,4*sp,4,'#60e0ff','drop');eshot(b.x+14,b.y+20,Math.PI/2,4*sp,4,'#60e0ff','drop');}
  if(b.t%(360*rf|0)===0){const a=aim(b.x,b.y);for(let k=-1;k<=1;k++)eshot(b.x,b.y,a+k*.14,4.5*sp,4,'#a0f0ff','drop');snd(400,.1,'sine',.03,900);}
  if(b.t%520===0)spawn(anyBug(),Math.random()<.5?-20:W+20,R(150,220),{pat:'dash'});
 }else if(i===4){ // stag beetle: heavy slow shots, dropping acorns, ants
  if(b.t%(170*rf|0)===0){const a=aim(b.x,b.y);for(let k=-1;k<=1;k+=2)eshot(b.x,b.y+30,a+k*.26,2.6*sp,8,'#8a4a10','acorn');snd(120,.15,'triangle',.05,60);}
  if(b.t%(200*rf|0)===0)eshot(R(30,W-30),-10,Math.PI/2,2.2*sp,7,'#c07030','acorn');
  if(b.t%560===0)for(let k=0;k<2;k++)spawn(anyBug(),b.x+R(-50,50),b.y+20,{pat:'march'});
 }else if(i===6){ // mosquito matriarch: hovers, then lunges down at you and pulls back up; spits venom; calls gnats
  if(b.lunge>0){b.lunge--;if(b.lunge>25){b.x+=Math.cos(b.la)*5*sp;b.y+=Math.sin(b.la)*5*sp;}else{b.y+=(110-b.y)*.08;}}
  else{b.y+=(110+Math.sin(b.t*.03)*20-b.y)*.05;if(b.t%(240*rf|0)===0){b.lunge=50;b.la=aim(b.x,b.y);buzz(J(1200),.5,'sine',.04,200,14,5000,600);}}
  if(b.t%(230*rf|0)===0){const a=aim(b.x,b.y);eshot(b.x,b.y+20,a,3.2*sp,4,'#8fdc3a','venom');}
  if(b.t%900===0)FORMS.cloud();
 }else if(i===7){ // scorpion king: scuttles side to side, tail stabs (fast darts), pincer sweeps (blades), ants
  b.x=W/2+Math.sin(b.t*.02)*(W/2-80);b.y=110+Math.abs(Math.sin(b.t*.01))*30;
  if(b.t%(190*rf|0)===0){const a=aim(b.x,b.y);for(let k=-1;k<=1;k+=2)eshot(b.x,b.y-30,a+k*.1,5*sp,4,'#ff3b3b','dart');click(600,.04);}
  if(b.t%(280*rf|0)===0){for(const sg of[-1,1])eshot(b.x+sg*40,b.y+10,Math.PI/2+sg*.35,2.8*sp,6,'#e8c070','blade');}
  if(b.t%440===0)for(let k=0;k<2;k++)spawn(anyBug(),b.x+R(-60,60),b.y+30,{pat:'march'});
 }
}
