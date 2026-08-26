// ---------- pickups ----------
function drop(x,y,force){const r=Math.random();let k=null;
 if(force)k=force;else if(r<.11)k='nectar';else if(r<.17)k=randWeapon();else if(r<.14)k='bomb';else if(r<.143)k='life';
 if(k)pickups.push({x,y,k,vy:1.1,t:0});}
function take(p){
 if(p.k==='nectar'){SFX.nectar();if(P.lvl<5){P.lvl++;say('POWER UP  Lv'+P.lvl);}else{addScore(1000);say('MAX POWER +1000');}}
 else if(p.k==='bomb'){SFX.bomb();P.bombs=Math.min(5,P.bombs+1);say('SWARM CALL +1');}
 else if(p.k==='life'){SFX.life();P.lives++;say('EXTRA LIFE!');}
 else{SFX.weapon(p.k);if(P.wpn!==p.k){bullets=bullets.filter(b=>!b.orbit&&!b.drone&&b.k!=='wall'&&b.k!=='lure');lashT=null;}if(P.wpn===p.k){P.lvl=Math.min(5,P.lvl+1);say(WEAPONS[p.k].name+'  Lv'+P.lvl);}else{P.wpn=p.k;P.lvl=Math.max(1,P.lvl-1);say(WEAPONS[p.k].name+'  —  '+WEAPONS[p.k].tag);}}}
let chain=0,chainT=0,chainBest=0,grazed=0,nextExt=0;
const EXTENDS=[100000,250000,500000,900000];
const chainMult=()=>Math.min(8,1+Math.floor(chain/6));
function addScore(n){score+=Math.round(n*chainMult());
 while(nextExt<EXTENDS.length&&score>=EXTENDS[nextExt]){nextExt++;P.lives++;say('EXTRA LIFE!');
  jingle([880,1174,1568,2093],'sine',.03,.07);}}
function onKill(){chain++;chainT=190;if(chain>chainBest)chainBest=chain;
 if(chain%6===0){
  // Matt built this and still had to ask what x8 was. Name it once, the first time it
  // pays, then go back to the short form so it stops being noise.
  say(learned.has('chain')?'CHAIN x'+chainMult():'CHAIN x2  \u00b7  EVERY POINT DOUBLED');
  learned.add('chain');
  snd(700+chainMult()*90,.06,'sine',.03,1400);}}
function breakChain(){if(chain>2)say('CHAIN LOST');chain=0;chainT=0;}
function chainTick(){if(chainT>0&&--chainT===0)chain=0;}
// grazing: sliding close past a shot without being hit pays, and tops up your bombs
function grazeTick(){if(P.dead||P.inv>0)return;
 for(const b of ebullets){if(b.dead||b.grz)continue;
  const dx=P.x-b.x,dy=P.y-b.y,d=Math.hypot(dx,dy),near=P.r+b.r+3,far=P.r+b.r+22;
  if(d>near&&d<far){b.grz=1;grazed++;addScore(60);
   sparks(b.x+(dx?dx/d*6:0),b.y+(dy?dy/d*6:0),'#ffe680',2,4);
   if(grazed%22===0&&P.bombs<5){P.bombs++;say(learned.has('graze')?'BOMB FROM GRAZING':'FREE BOMB  \u00b7  FOR SLIPPING PAST SHOTS');learned.add('graze');}
   if(grazed%6===0)snd(2200,.03,'sine',.012,3000);}}}
function hitPlayer(){if(P.inv>0||P.dead)return;if(P.bombs>0){bomb();P.inv=90;say('AUTO SWARM CALL!');return;}breakChain();P.lives--;P.dead=90;shake=20;boom(P.x,P.y,'#ffd166',40,7);noise(.7,.05,1400,.6,200,'lowpass');swell(90,.9,'sine',.08,.05,40);
 P.lvl=Math.max(1,P.lvl-1);ebullets=[];
 if(P.lives<0){state='over';music('title');if(score>hi){hi=score;localStorage.hs_hi=hi;}}}

