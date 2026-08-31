// ---------- update ----------
function update(){t++;if(shake>0)shake--;if(msgT>0)msgT--;bugChorus();chainTick();grazeTick();volcanoTick();if(P.lives===0&&!P.dead&&t%64===0)SFX.heartbeat();
 if(P.dead>0){P.dead--;if(P.dead===0){P.x=W/2;P.y=H-100;P.inv=240;}}
 else{const s=(keys.ShiftLeft||keys.ShiftRight||PAD.slow?2.5:4.5)*(P.webbed>0?.35:1);
  if(keys.ArrowLeft||keys.KeyA)P.x-=s;if(keys.ArrowRight||keys.KeyD)P.x+=s;if(keys.ArrowUp||keys.KeyW)P.y-=s;if(keys.ArrowDown||keys.KeyS)P.y+=s;
  if(PAD.x||PAD.y){P.x+=PAD.x*s;P.y+=PAD.y*s;}
  const kb=keys.ArrowLeft||keys.KeyA||keys.ArrowRight||keys.KeyD||keys.ArrowUp||keys.KeyW||keys.ArrowDown||keys.KeyS||PAD.x||PAD.y;
  if(target&&!kb){if(P.webbed>0){const drag=.018+.032*(1-Math.min(1,P.webbed/190));P.x+=(target.x-P.x)*drag;P.y+=(target.y-P.y)*drag;}else{P.x=target.x;P.y=target.y;}}
  worldForce();
 P.x=clamp(P.x,14,W-14);P.y=clamp(P.y,30,H-20);
 P.dep=.72+.44*clamp((P.y-30)/(H-50),0,1);   // small and far at the top, big and close at the bottom
  if(P.inv>0)P.inv--;
  if(P.fireT>0)P.fireT--;else fire();
  if(keys.KeyX||keys.KeyB||wantBomb){if(!P.bt)bomb();P.bt=1;}else P.bt=0;wantBomb=0;}
 // stage flow: intro -> waves -> WARNING -> boss -> LEVEL CLEAR -> next
 if(levelClear>0){levelClear--;if(levelClear===0){recordBest((stage-1)%NL+1,score);if(stage%NL===0&&loop===0){unlockUpTo(16);state='won';music('title');endRun();if(score>hi){hi=score;localStorage.hs_hi=hi;}return;}stage++;stageT=0;unlockUpTo((stage-1)%NL+1);if(stage>STAT.deepest){STAT.deepest=stage;}statSave();if((stage-1)%NL===0){loop++;}levelIntro=200;nextWave=0;rushDone=false;nextCloud=400;buildDecor((stage-1)%NL);SFX.levelStart();}}
 else if(!bossAlive){
  if(levelIntro>0){levelIntro--;if(levelIntro===0)music('main');}
  else if(bossWarn>0){bossWarn--;if(bossWarn%45===0){swell(70,.5,'sine',.07,.08);rumble(.5,.04);}if(bossWarn===0)spawnBoss();}
  else{stageT++;wave();if(stageT>LV().len){for(const e of enemies){if(e.pat!=='fall'){e.pat='fall';e.vy=6;}}bossWarn=210;ebullets=[];shake=10;music('boss');drop(clamp(P.x-50,40,W-40),P.y-260,randWeapon());drop(clamp(P.x+50,40,W-40),P.y-280,'nectar');if(P.bombs<2)drop(P.x,P.y-300,'bomb');}}}
 else if(boss&&boss.dying>0){boss.dying--;boss.fl=2;boss.x+=R(-3,3);if(boss.dying%7===0){boom(boss.x+R(-40,40),boss.y+R(-40,40),['#fff','#ffd166',boss.col][RI(0,2)],18,6);shake=8;rumble(.35,.06);noise(.12,.03,900,.7,250,'lowpass');click(R(1500,3000),.02);}if(boss.dying%20===0)hiss(.3,.03,R(2000,5000),800);if(boss.dying===0){boss.hp=0;}}
 else if(boss){updBoss(boss);if(boss.hp<=0&&boss.dying==null){boss.dying=90;ebullets=[];say(boss.name+' IS GOING DOWN!');rumble(1.5,.07);swell(80,1.4,'triangle',.05,.3,30);return;}if(boss.hp<=0){addScore(5000*(stage+loop));boom(boss.x,boss.y,boss.col,80,9);boom(boss.x,boss.y,'#fff',40,5);sparks(boss.x,boss.y,'#fff',40,12);flash=.6;shake=22;rumble(1.8,.1);swell(60,1.8,'sine',.07,.2,30);noise(.6,.05,700,.6,120,'lowpass');jingle([660,880,1108,1318,1760],'sine',.03,.09);
  for(let i=0;i<3;i++)drop(clamp(boss.x-80+i*80,50,W-50),boss.y+i*10,i===0?'nectar':i===1?randWeapon():['nectar','bomb','bomb',(stage%2===0?'life':'bomb')][RI(0,3)]);
  boss=null;bossAlive=false;ebullets=[];enemies=[];levelClear=220;msgT=0;STAT.bosses++;statSave();SFX.levelClear();const w=MUSIC.tracks.win;if(w&&!w.bad){w.currentTime=0;music('win');}else music(null);}}
 // bullets
 for(const b of bullets){if(b.home){let best=null,bd=1e9;for(const e of enemies){const d=(e.x-b.x)**2+(e.y-b.y)**2;if(d<bd){bd=d;best=e;}}if(boss&&boss.y>0){const d=(boss.x-b.x)**2+(boss.y-b.y)**2;if(d<bd){bd=d;best=boss;}}
   if(best){const a=Math.atan2(best.y-b.y,best.x-b.x),ca=Math.atan2(b.vy,b.vx);let da=a-ca;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;const na=ca+clamp(da,-.12,.12);b.vx=Math.cos(na)*7;b.vy=Math.sin(na)*7;}}
  if(b.cd>0)b.cd--;
  if(b.drone){if(P.wpn!=='drones'||P.dead){b.dead=1;}let tg=null,bd=300*300;for(const e of enemies){const d=(e.x-b.x)**2+(e.y-b.y)**2;if(d<bd){bd=d;tg=e;}}if(boss&&boss.y>0){const d=(boss.x-b.x)**2+(boss.y-b.y)**2;if(d<bd){bd=d;tg=boss;}}
   let hx,hy;if(tg){hx=tg.x;hy=tg.y;}else{const a=t*.05+b.slot*2.1;hx=P.x+Math.cos(a)*36;hy=P.y-14+Math.sin(a)*12;}const dx=hx-b.x,dy=hy-b.y,d=Math.hypot(dx,dy)||1,spd=tg?6.5:4;b.vx+=(dx/d*spd-b.vx)*.18;b.vy+=(dy/d*spd-b.vy)*.18;b.x+=b.vx;b.y+=b.vy;b.x=clamp(b.x,10,W-10);b.y=clamp(b.y,30,H-20);}
  else if(b.k==='static'){b.y+=b.vy;b.x+=Math.sin(t*.05+b.y*.02)*.6;b.zaps=b.zaps.filter(z=>--z.ttl>0);if(--b.zapT<=0){b.zapT=18;const near=enemies.filter(e=>!e.dead&&(e.x-b.x)**2+(e.y-b.y)**2<105*105).sort((p,q)=>((p.x-b.x)**2+(p.y-b.y)**2)-((q.x-b.x)**2+(q.y-b.y)**2)).slice(0,b.targets);for(const e of near){e.hp-=b.d*PD;e.fl=3;b.zaps.push({x:e.x,y:e.y,ttl:8});sparks(e.x,e.y,'#e0c0ff',3,5);if(e.hp<=0){e.dead=1;killScore(e);boom(e.x,e.y,e.col,14);sparks(e.x,e.y,'#fff',8);if(e.elite)drop(e.x,e.y,randWeapon());else if(!e.tiny)drop(e.x,e.y);if(!e.tiny)gibs(e);sfxKill(e);}}if(boss&&boss.y>0&&(boss.x-b.x)**2+(boss.y-b.y)**2<130*130){boss.hp-=b.d*PD*1.5;boss.fl=3;b.zaps.push({x:boss.x,y:boss.y,ttl:8});sfxBossHit();}if(near.length||(boss&&b.zaps.length))IMPACT.static();}}
  else if(b.k==='lure'){if(b.y>b.stopY)b.y+=b.vy;for(const e of enemies){if(e.tiny)continue;const dx=b.x-e.x,dy=b.y-e.y,d=Math.hypot(dx,dy);if(d<170&&d>4){e.x+=dx/d*2.2;e.y+=dy/d*2.2;}}if(t%6===0)parts.push({x:b.x+R(-20,20),y:b.y+R(-20,20),vx:0,vy:-.6,l:18,c:'#ff7ad9',r:2});if(b.life===1){boom(b.x,b.y,'#ff7ad9',50,9);boom(b.x,b.y,'#fff',20,5);flash=.25;shake=10;for(const e of enemies){if((e.x-b.x)**2+(e.y-b.y)**2<100*100){e.hp-=b.d*PD;e.fl=4;if(e.hp<=0){e.dead=1;killScore(e);boom(e.x,e.y,e.col,14);if(!e.tiny)gibs(e);sfxKill(e);}}}if(boss&&boss.y>0&&(boss.x-b.x)**2+(boss.y-b.y)**2<130*130){boss.hp-=b.d*PD*2;boss.fl=3;}rumble(.5,.05);tone(J(600),.3,'sine',.03,200);}}
  else if(b.k==='grenade'){b.vy+=b.ay;b.x+=b.vx;b.y+=b.vy;if(b.vy>0||enemies.some(e=>!e.dead&&(e.x-b.x)**2+(e.y-b.y)**2<(e.r+b.r+6)**2)){b.dead=1;boom(b.x,b.y,'#ffa54d',16,5);for(let k=0;k<8;k++){const a=k*Math.PI/4+R(-.2,.2);bullets.push({x:b.x,y:b.y,vx:Math.cos(a)*7,vy:Math.sin(a)*7,d:b.d*.45,r:4,k:'shard',life:26});}IMPACT.grenade();}}
  else if(b.k==='wall'){b.x+=(P.x-b.x)*.2;b.y=P.y-70;if(P.wpn!=='wall'||P.dead)b.dead=1;}
  else if(b.k==='saw'){b.vy+=.42;b.ang+=.5;if(b.vy>0){b.vx+=(P.x-b.x)*.004;}b.x+=b.vx;b.y+=b.vy;if(b.vy>0&&b.y>P.y+10)b.dead=1;}
  else if(b.orbit){b.a+=.09;b.x=P.x+Math.cos(b.a)*44;b.y=P.y+Math.sin(b.a)*44;if(P.wpn!=='petal'||P.dead)b.dead=1;}else if(b.k!=='lure'&&b.k!=='grenade'&&b.k!=='wall'){b.x+=b.vx;b.y+=b.vy;
   // THE CRYSTAL: shots ricochet off the cavern walls once. your own volley is the puzzle.
   if(LV().name==='THE CRYSTAL'&&!b.bounced&&((b.x<8&&b.vx<0)||(b.x>W-8&&b.vx>0))){b.vx=-b.vx;b.bounced=1;b.x=clamp(b.x,8,W-8);sparks(b.x,b.y,'#c8a0ff',3,5);}
   if((b.y<-20&&!b.down)||b.y<-90||b.x<-20||b.x>W+20||b.y>H+20)b.dead=1;}if(b.life!=null&&--b.life<=0)b.dead=1;if(!b.orbit&&!b.drone&&b.k!=='stinger'&&b.k!=='static'&&t%3===0)parts.push({x:b.x+R(-2,2),y:b.y+R(-2,2),vx:R(-.4,.4),vy:R(.3,1),l:R(8,14),c:WEAPONS[b.k]?WEAPONS[b.k].col:'#fff',r:R(1,2.2)});
  for(const e of enemies){if(b.k==='static'||b.k==='lure'||b.k==='grenade')break;if((b.k==='lance'||b.k==='saw'||b.drone||b.k==='wall')&&b.cd>0)break;const hitW=b.k==='wall'?(Math.abs(e.x-b.x)<b.half+e.r&&Math.abs(e.y-b.y)<12+e.r):(e.x-b.x)**2+(e.y-b.y)**2<(e.r*1.3+b.r)**2;if(!e.dead&&!b.dead&&hitW){if(b.k==='lance'||b.k==='saw')b.cd=6;if(b.drone)b.cd=14;if(b.k==='wall')b.cd=8;e.hp-=b.d*PD;e.fl=4;if(!b.pierce)b.dead=1;if(b.k==='water'){for(const o of enemies){if(o!==e&&!o.dead&&(o.x-b.x)**2+(o.y-b.y)**2<48*48){o.hp-=b.d*.5;o.fl=3;}}for(let q=0;q<5;q++)parts.push({x:b.x,y:b.y,vx:R(-3,3),vy:R(-3,1),l:14,c:'#ffd070',r:2});}if(b.k==='wax'){e.slow=140;}if(b.orbit&&t%6!==0)continue;sfxHit(e);sfxImpact();sparks(b.x,b.y,WEAPONS[b.k]?WEAPONS[b.k].col:'#fff',4,6);if(e.hp<=0){e.dead=1;killScore(e);boom(e.x,e.y,e.col,14);sparks(e.x,e.y,'#fff',8);if(e.elite)drop(e.x,e.y,Math.random()<.5?randWeapon():['nectar','nectar','bomb'][RI(0,2)]);else if(!e.tiny)drop(e.x,e.y);if(!e.tiny)gibs(e);if(!e.tiny||t%4===0)sfxKill(e);}}}
  if(boss&&!b.dead&&b.k!=='static'&&b.k!=='lure'&&b.k!=='grenade'&&b.k!=='wall'&&!((b.k==='lance'||b.k==='saw'||b.drone)&&b.cd>0)&&boss.y>0&&(boss.x-b.x)**2+(boss.y-b.y)**2<(boss.r+b.r+(boss.wings&&(boss.wings.l>0||boss.wings.r>0)?44:0))**2){if(b.k==='lance'||b.k==='saw')b.cd=6;if(b.drone)b.cd=14;
   // atlas moth: while a wing lives it soaks the hit for its side. break one and that half
   // of the screen fills with scales you can graze -- the shield becomes the feast.
   if(boss.wings&&(boss.wings.l>0||boss.wings.r>0)){const side=(b.x<boss.x&&boss.wings.l>0)||boss.wings.r<=0?'l':'r';boss.wings[side]-=b.d*PD;boss.fl=3;
    if(boss.wings[side]<=0){boss.wings[side]=0;const sx=side==='l'?boss.x-90:boss.x+90;boom(sx,boss.y,'#e0a060',40,7);flash=.3;shake=14;say('A WING BREAKS!');rumble(.8,.06);
     for(let k=0;k<16;k++)ebullets.push({x:side==='l'?R(10,W/2-20):R(W/2+20,W-10),y:R(-50,90),vx:R(-.2,.2),vy:R(.7,1.3),r:6,col:'#ffdd88',t:0,kind:'dust'});drop(sx,boss.y+40,'bomb');}}
   else{boss.hp-=b.d*PD;boss.fl=3;}
   if(!b.pierce)b.dead=1;sfxBossHit();parts.push({x:b.x,y:b.y,vx:R(-2,2),vy:R(-2,2),l:10,c:'#fff',r:2});}
 }
 bullets=bullets.filter(b=>!b.dead);
 for(const e of enemies){updEnemy(e);if(!P.dead&&(e.x-P.x)**2+(e.y-P.y)**2<(e.r+P.r-(e.tiny?0:8))**2){if(e.tiny){e.dead=1;P.webbed=Math.max(P.webbed,104);if(t-gnatT>20){gnatT=t;say((BUGINFO[e.type]?BUGINFO[e.type].name:'GNATS')+' IN YOUR EYES!');}buzz(J(2200),.08,'sine',.012,200,40,5000);}else hitPlayer();}}
 // bugs must never sit on top of each other -- you cannot shoot what you cannot see.
 // this runs AFTER the movement patterns, or they would just write the overlap back.
 separate();
 enemies=enemies.filter(e=>!e.dead);
 if(boss&&!P.dead&&(boss.x-P.x)**2+(boss.y-P.y)**2<(boss.r+P.r-6)**2)hitPlayer();
 if(!P.dead&&P.inv===0&&P.bombs>0){for(const b of ebullets){if(b.kind==='web')continue;const dx=P.x-b.x,dy=P.y-b.y,d2=dx*dx+dy*dy;if(d2<30*30&&(dx*b.vx+dy*b.vy)>0){bomb();P.inv=90;say('AUTO SWARM CALL!');break;}}}
 const walls=bullets.filter(w=>w.k==='wall');
 for(const b of ebullets){if(b.kind==='fang'&&!P.dead&&(b.hm=(b.hm||0)+1)<170){const s2=Math.hypot(b.vx,b.vy)||1,ca=Math.atan2(b.vy,b.vx);let d=Math.atan2(P.y-b.y,P.x-b.x)-ca;while(d>Math.PI)d-=6.283185307179586;while(d<-Math.PI)d+=6.283185307179586;const na=ca+clamp(d,-.032,.032);b.vx=Math.cos(na)*s2;b.vy=Math.sin(na)*s2;}
  b.x+=b.vx;b.y+=b.vy;if(b.y>H+20||b.y<-60||b.x<-20||b.x>W+20)b.dead=1;for(const w of walls){if(Math.abs(b.x-w.x)<w.half&&Math.abs(b.y-w.y)<10){b.dead=1;sparks(b.x,b.y,'#c8a050',4,5);IMPACT.wall();}}if(!P.dead&&(b.x-P.x)**2+(b.y-P.y)**2<(b.r+2)**2){b.dead=1;if(b.kind==='web'){if(!P.webbed){say('TANGLED IN WEB!');noise(.3,.04,2500,.5,600,'bandpass');}P.webbed=190;}else hitPlayer();}}
 if(P.webbed>0)P.webbed--;
 ebullets=ebullets.filter(b=>!b.dead);
 for(const p of pickups){p.t++;p.y+=p.vy;p.x+=Math.sin(p.t*.05);const dx=P.x-p.x,dy=P.y-p.y,dd=Math.hypot(dx,dy);if(!P.dead&&dd<90){p.x+=dx/dd*2.5;p.y+=dy/dd*2.5;}if(p.y>H+20)p.dead=1;if(!P.dead&&dd<34){p.dead=1;take(p);}}
 pickups=pickups.filter(p=>!p.dead);
 for(const p of parts){p.x+=p.vx;p.y+=p.vy;if(p.spark){p.vx*=.88;p.vy*=.88;}else if(p.gib){p.vy+=p.wing?.03:.12;p.vx*=.97;p.a+=p.va;if(p.wing)p.x+=Math.sin(p.l*.3)*1.2;}else p.vy+=p.bee?.05:.08;p.l--;}parts=parts.filter(p=>p.l>0);
}

