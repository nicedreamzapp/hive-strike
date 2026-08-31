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
// close kills pay double and feed the chain an extra step -- parking on a bug's face is
// a choice, so it pays like one. 84px is "in their face" without kissing hitboxes.
function killScore(e){const near=!P.dead&&(e.x-P.x)**2+(e.y-P.y)**2<84*84;
 addScore(e.sc*(near?2:1));onKill();
 if(near){chain++;if(chain>chainBest)chainBest=chain;chainT=230;sparks(e.x,e.y,'#8dff9a',5,7);
  if(!learned.has('pb')){say('POINT BLANK x2  \u00b7  CLOSE KILLS PAY DOUBLE');learned.add('pb');}}}
// grazing: sliding close past a shot without being hit pays, and tops up your bombs.
// a shot whose path clips the bee inside 16 frames is HOT (green ring): grazing that
// one pays double. the ring goes on the bullet that matters, not a random sparkle.
function grazeTick(){if(P.dead||P.inv>0)return;
 for(const b of ebullets){if(b.dead)continue;
  if(b.kind==='web')b.hot=0;
  else{const rx=b.x-P.x,ry=b.y-P.y,sp2=b.vx*b.vx+b.vy*b.vy||1e-6,tc=clamp(-(rx*b.vx+ry*b.vy)/sp2,0,16),cx=rx+b.vx*tc,cy=ry+b.vy*tc;b.hot=cx*cx+cy*cy<(b.r+9)**2?1:0;}
  if(b.grz)continue;
  const dx=P.x-b.x,dy=P.y-b.y,d=Math.hypot(dx,dy),near=P.r+b.r+3,far=P.r+b.r+22;
  if(d>near&&d<far){const pays=b.hot?2:1;b.grz=1;addScore(60*pays);
   sparks(b.x+(dx?dx/d*6:0),b.y+(dy?dy/d*6:0),b.hot?'#8dff9a':'#ffe680',2,4);
   for(let g=pays;g--;){grazed++;
    if(grazed%22===0&&P.bombs<5){P.bombs++;say(learned.has('graze')?'BOMB FROM GRAZING':'FREE BOMB  \u00b7  FOR SLIPPING PAST SHOTS');learned.add('graze');}}
   if(grazed%6<pays)snd(2200,.03,'sine',.012,3000);}}}
function hitPlayer(){if(P.inv>0||P.dead)return;if(P.bombs>0){bomb();P.inv=90;say('AUTO SWARM CALL!');return;}breakChain();P.lives--;P.dead=90;shake=20;boom(P.x,P.y,'#ffd166',40,7);noise(.7,.05,1400,.6,200,'lowpass');swell(90,.9,'sine',.08,.05,40);
 P.lvl=Math.max(1,P.lvl-1);ebullets=[];
 if(P.lives<0){state='over';music('title');if(score>hi){hi=score;localStorage.hs_hi=hi;}}}

