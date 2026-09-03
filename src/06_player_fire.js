// ---------- player fire ----------
// HONEY = wide fan, solid damage up close (great vs swarms).  STINGER = one thin piercing beam, best single-target.  POLLEN = slow homing seekers, weakest but never misses.
// At Lv5 every shot is EVOLVED: same damage, same hitbox, but it wears an aura in its
// weapon's colour and the big three get a flourish (honey swells, stinger crackles wider,
// pollen leaves a sparkle wake). The bee already glows at Lv5; now the shots match.
function fire(){const L=P.lvl,x=P.x,y=P.y-14,n0=bullets.length;P.shots++;gainScale=.3;try{fireInner(L,x,y);}finally{gainScale=1;}if(L>=5)for(let i=n0;i<bullets.length;i++)bullets[i].evo=1;}
function fireInner(L,x,y){
 if(P.wpn==='honey'){const n=Math.min(5,L+1),spread=.16;for(let i=0;i<n;i++){const a=-Math.PI/2+(i-(n-1)/2)*spread;bullets.push({x:x+(i-(n-1)/2)*5,y,vx:Math.cos(a)*10,vy:Math.sin(a)*10,d:1.5,r:5,k:'honey'});}P.fireT=13;FIRE.honey();flashMuzzle(x,y,'#ffd166');}
 else if(P.wpn==='stinger'){const w=3+L*1.6;bullets.push({x,y,vx:0,vy:-18,d:.6+L*.22,r:w,k:'stinger',pierce:1});if(L>=4){bullets.push({x:x-16,y,vx:-1.2,vy:-17,d:.15,r:3,k:'stinger',pierce:1});bullets.push({x:x+16,y,vx:1.2,vy:-17,d:.15,r:3,k:'stinger',pierce:1});}P.fireT=5;FIRE.stinger();flashMuzzle(x,y,'#e0b0ff');}
 else if(P.wpn==='pollen'){const n=Math.min(5,2+Math.floor(L/1.5));for(let i=0;i<n;i++){const a=-Math.PI/2+(i-(n-1)/2)*.42;bullets.push({x,y,vx:Math.cos(a)*7.5,vy:Math.sin(a)*7.5,d:1.5+L*.45,r:7,k:'pollen',home:1});}P.fireT=17;FIRE.pollen();flashMuzzle(x,y,'#ffb0d8');}
 else if(P.wpn==='water'){const n=L>=3?2:1;for(let i=0;i<n;i++){bullets.push({x:x+(i-(n-1)/2)*10,y,vx:(i-(n-1)/2)*.5,vy:-16,d:.95+L*.15,r:4,k:'water'});}P.fireT=8;FIRE.water();flashMuzzle(x,y,'#ffd080');}
 else if(P.wpn==='wax'){const n=L>=3?2:1;for(let i=0;i<n;i++){bullets.push({x:x+(i-(n-1)/2)*16,y,vx:0,vy:-9,d:3.2+L*.7,r:9,k:'wax'});}P.fireT=24;FIRE.wax();flashMuzzle(x,y,'#ffe0a0');}
 else if(P.wpn==='thorn'){for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*.16;bullets.push({x,y,vx:Math.cos(a)*12,vy:Math.sin(a)*12,d:.85+L*.14,r:3.5,k:'thorn',life:22+L*2});}P.fireT=18;FIRE.thorn();flashMuzzle(x,y,'#ffd890');}
 else if(P.wpn==='lance'){bullets.push({x,y,vx:0,vy:-14,d:5+L*1.2,r:6,k:'lance',pierce:1,cd:0});P.fireT=34;FIRE.lance();flashMuzzle(x,y,'#ffe066');}
 else if(P.wpn==='drones'){const want=2+Math.ceil(L/2),have=bullets.filter(b=>b.drone).length;if(have<want){for(let i=have;i<want;i++)bullets.push({x:P.x+R(-30,30),y:P.y-10,vx:0,vy:0,d:1.2+L*.3,r:7,k:'drone',drone:1,pierce:1,slot:i,cd:0});FIRE.drones();}P.fireT=20;}
 else if(P.wpn==='static'){bullets.push({x,y,vx:0,vy:-2.2,d:.9+L*.25,r:11,k:'static',pierce:1,life:170,zapT:0,zaps:[],targets:2+Math.floor(L/2)});P.fireT=50;FIRE.static();flashMuzzle(x,y,'#d8b0ff');}
 else if(P.wpn==='saw'){const n=L>=4?2:1;for(let i=0;i<n;i++)bullets.push({x:x+(i-(n-1)/2)*24,y,vx:(i-(n-1)/2)*.6,vy:-13,d:1.4+L*.35,r:8,k:'saw',pierce:1,cd:0,ang:0,life:260});P.fireT=30;FIRE.saw();flashMuzzle(x,y,'#b0ff70');}
 else if(P.wpn==='lash'){let best=null,bd=320*320;for(const e of enemies){if(e.y>P.y)continue;const d=(e.x-P.x)**2+(e.y-P.y)**2;if(d<bd){bd=d;best=e;}}if(boss&&boss.y>0){const d=(boss.x-P.x)**2+(boss.y-P.y)**2;if(d<bd){bd=d;best=boss;}}
  const dmg=(.4+L*.12)*PD;if(best){best.hp-=dmg;best.fl=2;lashT={x:best.x,y:best.y,t:t,isBoss:best===boss};if(t%3===0)sparks(best.x,best.y,'#fff7b0',2,5);if(best!==boss&&best.hp<=0){best.dead=1;addScore(best.sc);onKill();boom(best.x,best.y,best.col,14);sparks(best.x,best.y,'#fff',8);if(best.elite)drop(best.x,best.y,randWeapon());else if(!best.tiny)drop(best.x,best.y);if(!best.tiny)gibs(best);sfxKill(best);}if(best===boss)sfxBossHit();}else lashT=null;
  P.fireT=4;FIRE.lash();}
 else if(P.wpn==='rain'){for(let i=0;i<4+L;i++)bullets.push({x:clamp(P.x+R(-110,110),10,W-10),y:-10-R(0,60),vx:0,vy:8+R(0,3),d:1.1+L*.25,r:5,k:'rain',down:1});P.fireT=26;FIRE.rain();}
 else if(P.wpn==='lure'){if(bullets.filter(b=>b.k==='lure').length<2){bullets.push({x,y,vx:0,vy:-7,d:34+L*11,r:12,k:'lure',pierce:1,life:96,stopY:P.y-230});FIRE.lure();}P.fireT=20;}
 else if(P.wpn==='grenade'){bullets.push({x,y,vx:R(-.6,.6),vy:-9.5,d:2+L*.5,r:7,k:'grenade',ay:.24});P.fireT=40;FIRE.grenade();flashMuzzle(x,y,'#ffa54d');}
 else if(P.wpn==='wall'){if(!bullets.some(b=>b.k==='wall')){bullets.push({x:P.x,y:P.y-70,vx:0,vy:0,d:.5+L*.12,r:8,k:'wall',pierce:1,life:260,cd:0,half:44+L*8});FIRE.wall();}
  // the wall alone cannot hurt a boss, so it also spits resin darts straight up
  const n=Math.min(3,1+Math.floor(L/2));for(let i=0;i<n;i++){const a=-Math.PI/2+(i-(n-1)/2)*.13;bullets.push({x,y,vx:Math.cos(a)*9,vy:Math.sin(a)*9,d:1.3+L*.35,r:5,k:'thorn'});}
  P.fireT=16;}
 else if(P.wpn==='petal'){const want=2+Math.floor(L/2),have=bullets.filter(b=>b.orbit).length;if(have<want){for(let i=have;i<want;i++)bullets.push({x:P.x,y:P.y,vx:0,vy:0,d:.14+L*.03,r:7,k:'petal',orbit:1,pierce:1,a:i/want*Math.PI*2});FIRE.petal();}const n=L>=4?2:1;for(let i=0;i<n;i++)bullets.push({x:x+(i-(n-1)/2)*12,y,vx:0,vy:-11,d:.85+L*.18,r:5,k:'petal',a:-Math.PI/2});P.fireT=14;FIRE.petalDart();}
}
function bomb(){if(P.bombs<=0||P.dead)return;P.bombs--;shake=25;flash=1;stop(4);buzz('heavy');rumble(1,.08);swell(140,1,'sawtooth',.05,.15);noise(.5,.05,600,.7,120,'lowpass');say('SWARM CALL!');
 ebullets=[];for(const e of enemies){e.hp-=40;boom(e.x,e.y,'#ffd166',6);}if(boss){boss.hp-=30;boss.bombDmg=(boss.bombDmg||0)+30;}   // was 60: with auto-bombs firing whenever you are about to be hit, bosses were dying too fast (Matt 9/2)
 for(let i=0;i<60;i++)parts.push({x:R(0,W),y:R(0,H),vx:R(-3,3),vy:R(-6,-1),l:R(30,70),c:'#ffd166',r:R(2,5),bee:1});}

