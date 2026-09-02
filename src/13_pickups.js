// ---------- pickups ----------
function drop(x,y,force){const r=Math.random();let k=null;
 // the old chain tested r<.14 and r<.143 AFTER r<.17, so bombs and lives never dropped
 // by chance -- only when forced. now they exist. ROYAL FEAST doubles the nectar band.
 const nb=MODS.feast?.22:.11;
 if(force)k=force;else if(r<nb)k='nectar';else if(r<nb+.06)k=randWeapon();else if(r<nb+.09)k='bomb';else if(r<nb+.093)k='life';
 if(k==='bomb'&&MODS.nobomb)k='nectar';   // NO SWARM CALLS means none, not "found one anyway"
 if(k)pickups.push({x,y,k,vy:1.1,t:0});}
function take(p){buzz('light');
 if(p.k==='nectar'){SFX.nectar();if(P.lvl<5){P.lvl++;say('POWER UP  Lv'+P.lvl);pop(p.x,p.y,'POWER Lv'+P.lvl,'#ffd23f',13);}else{addScore(1000);say('MAX POWER +1000');pop(p.x,p.y,'+1000','#ffd23f',13);}}
 else if(p.k==='bomb'){SFX.bomb();P.bombs=Math.min(5,P.bombs+1);say('SWARM CALL +1');pop(p.x,p.y,'+1 BOMB','#8dff9a',13);}
 else if(p.k==='life'){SFX.life();P.lives++;say('EXTRA LIFE!');pop(p.x,p.y,'1 UP','#8dff9a',15);buzz('success');}
 else{SFX.weapon(p.k);if(P.wpn!==p.k){bullets=bullets.filter(b=>!b.orbit&&!b.drone&&b.k!=='wall'&&b.k!=='lure');lashT=null;}if(P.wpn===p.k){P.lvl=Math.min(5,P.lvl+1);say(WEAPONS[p.k].name+'  Lv'+P.lvl);}else{P.wpn=p.k;P.lvl=Math.max(1,P.lvl-1);say(WEAPONS[p.k].name+'  —  '+WEAPONS[p.k].tag);}}}
let chain=0,chainT=0,chainBest=0,grazed=0,nextExt=0;
const EXTENDS=[100000,250000,500000,900000];
const chainMult=()=>Math.min(8,1+Math.floor(chain/6));
function addScore(n){const got=Math.round(n*chainMult()*cmult);score+=got;
 while(nextExt<EXTENDS.length&&score>=EXTENDS[nextExt]){nextExt++;P.lives++;say('EXTRA LIFE!');announce('EXTRA LIFE!','#8dff9a');buzz('success');
  jingle([880,1174,1568,2093],'sine',.03,.07);}return got;}
function onKill(){chain++;chainT=190;if(chain>chainBest)chainBest=chain;
 if(chain%6===0){
  // Matt built this and still had to ask what x8 was. Name it once, the first time it
  // pays, then go back to the short form so it stops being noise.
  if(learned.has('chain'))announce('CHAIN x'+chainMult());else say('CHAIN x2  \u00b7  EVERY POINT DOUBLED');
  learned.add('chain');buzz('medium');
  snd(700+chainMult()*90,.06,'sine',.03,1400);}
 if(chainMult()===8){frenzyKills++;if(frenzy<=0&&(frenzyKills===1||frenzyKills%24===0))frenzyStart();}}
function breakChain(){if(chain>2)say('CHAIN LOST');chain=0;chainT=0;frenzyKills=0;if(frenzy>0)frenzy=Math.min(frenzy,30);}
function chainTick(){if(chainT>0&&--chainT===0){chain=0;frenzyKills=0;if(frenzy>0)frenzy=Math.min(frenzy,30);}}
// close kills pay double and feed the chain an extra step -- parking on a bug's face is
// a choice, so it pays like one. 84px is "in their face" without kissing hitboxes.
function killScore(e){const near=!P.dead&&(e.x-P.x)**2+(e.y-P.y)**2<84*84;
 STAT.dex[e.type]=(STAT.dex[e.type]||0)+1;   // the Bug-Dex counts every kill
 const got=addScore(e.sc*(near?2:1));onKill();
 if(!e.tiny){pop(e.x,e.y,'+'+got,near?'#8dff9a':e.elite?'#ffd23f':'#fff',near||e.elite?15:11);ring(e.x,e.y,near?'#8dff9a':'#ffd166');}
 if(e.elite)stop(3);
 if(near){stop(2);buzz('light');chain++;if(chain>chainBest)chainBest=chain;chainT=230;sparks(e.x,e.y,'#8dff9a',5,7);
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
  if(d>near&&d<far){const pays=b.hot?2:1;b.grz=1;const got=addScore(60*pays);if(b.hot)pop(b.x,b.y,'+'+got,'#8dff9a',10);
   sparks(b.x+(dx?dx/d*6:0),b.y+(dy?dy/d*6:0),b.hot?'#8dff9a':'#ffe680',2,4);
   for(let g=pays;g--;){grazed++;
    if(grazed%22===0&&P.bombs<5){P.bombs++;say(learned.has('graze')?'BOMB FROM GRAZING':'FREE BOMB  \u00b7  FOR SLIPPING PAST SHOTS');learned.add('graze');}}
   if(grazed%6<pays)snd(2200,.03,'sine',.012,3000);}}}
function hitPlayer(){if(P.inv>0||P.dead)return;if(P.bombs>0){bomb();P.inv=90;say('AUTO SWARM CALL!');return;}breakChain();P.lives--;P.dead=90;shake=20;stop(10);buzz('heavy');boom(P.x,P.y,'#ffd166',40,7);noise(.7,.05,1400,.6,200,'lowpass');swell(90,.9,'sine',.08,.05,40);
 P.lvl=Math.max(1,P.lvl-1);ebullets=[];
 if(P.lives<0){state='over';music('title');endRun();if(score>hi){hi=score;localStorage.hs_hi=hi;}}}


// ---------- juice: the game showing you what just happened ----------
// hitstop freezes the whole sim for a few frames on the big beats (the frame loop skips
// update while it counts down); pops are the numbers that fly off a kill; rings mark the
// spot; the announcer is the chain step, punched in big and gone fast. All of it draws
// above the world and under the HUD, and none of it is something to dodge.
let hitstop=0,ann=null,slowmo=0;const POPS=[];
// HIVE FRENZY: reaching chain x8 (and every 24 kills you hold it) buys five seconds of
// double fire rate under a gold sky, with the music pushed up. x8 was just a number.
let frenzy=0,frenzyKills=0;
function frenzyStart(){frenzy=300;announce('HIVE FRENZY!','#ffd23f');buzz('success');flash=.35;shake=10;jingle([880,1108,1318,1760,2217],'square',.018,.06);}
function stop(n){hitstop=Math.max(hitstop,n);}
function pop(x,y,s,col='#fff',size=12){if(POPS.length>28)POPS.shift();POPS.push({x,y:y-6,s,col,size,t:0,vy:-1.1});}
function ring(x,y,col){if(POPS.length>28)POPS.shift();POPS.push({x,y,ring:1,col,t:0});}
function announce(s,col='#ffd23f'){ann={s,col,t:0};}
function juiceTick(){if(frenzy>0){frenzy--;if(P.fireT>1)P.fireT--;if(t%3===0&&!P.dead)parts.push({x:P.x+R(-26,26),y:P.y+R(-20,26),vx:R(-.6,.6),vy:R(-2.2,-.8),l:R(14,26),c:['#ffd23f','#fff3b0','#ffb300'][RI(0,2)],r:R(1.2,2.6)});}for(let i=POPS.length;i--;){const p=POPS[i];p.t++;if(p.ring){if(p.t>14)POPS.splice(i,1);}else{p.y+=p.vy;p.vy*=.94;if(p.t>44)POPS.splice(i,1);}}if(ann&&++ann.t>60)ann=null;}
function drawJuice(){
 if(frenzy>0){const k=Math.min(1,frenzy/30)*(.85+.15*Math.sin(t*.3));X.save();const g=X.createRadialGradient(W/2,H/2,H*.28,W/2,H/2,H*.72);g.addColorStop(0,'rgba(255,200,40,0)');g.addColorStop(1,'rgba(255,190,30,'+(.34*k)+')');X.fillStyle=g;X.fillRect(0,0,W,H);
  X.textAlign='left';X.font='bold 11px '+FONT;X.fillStyle='rgba(255,220,80,'+k+')';X.shadowColor='#000';X.shadowBlur=4;X.fillText('HIVE FRENZY  '+(frenzy/60).toFixed(1)+'s  ·  double fire',10,H-44);X.restore();}
 if(!POPS.length&&!ann)return;X.save();
 for(const p of POPS){if(p.ring){const f=p.t/14;X.strokeStyle=p.col;X.globalAlpha=(1-f)*.8;X.lineWidth=3-2*f;X.beginPath();X.arc(p.x+pxo(p.x,p.y),p.y,6+f*30,0,7);X.stroke();continue;}
  const k=Math.min(1,p.t/6),sc=1.6-.6*k,a=p.t>30?1-(p.t-30)/14:1;X.save();X.translate(p.x+pxo(p.x,p.y),p.y);X.scale(sc,sc);X.globalAlpha=a;X.font='bold '+p.size+'px '+FONT;X.textAlign='center';X.lineWidth=3;X.strokeStyle='rgba(0,0,0,.7)';X.strokeText(p.s,0,0);X.fillStyle=p.col;X.fillText(p.s,0,0);X.restore();}
 if(ann){const k=Math.min(1,ann.t/8),e=1-(1-k)*(1-k),sc=2.4-1.4*e,a=ann.t>40?1-(ann.t-40)/20:1;X.translate(W/2,H*.36);X.scale(sc,sc);X.globalAlpha=a;X.font='bold 30px '+FONT;X.textAlign='center';X.shadowColor='#000';X.shadowBlur=12;X.lineWidth=4;X.strokeStyle='rgba(0,0,0,.75)';X.strokeText(ann.s,0,0);X.fillStyle=ann.col;X.fillText(ann.s,0,0);}
 X.restore();}
// haptics: the phone answers the beats the thumb caused. Capacitor's Haptics plugin on
// iOS/Android, navigator.vibrate on the web where it exists, nothing when effects are muted.
let buzzT=0;
function buzz(k){if(!SFX_ON||t-buzzT<4)return;buzzT=t;try{const Hp=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.Haptics;
 if(Hp){if(k==='success')Hp.notification({type:'SUCCESS'});else if(k==='warn')Hp.notification({type:'WARNING'});else Hp.impact({style:k==='heavy'?'HEAVY':k==='medium'?'MEDIUM':'LIGHT'});}
 else if(navigator.vibrate)navigator.vibrate(k==='heavy'?45:k==='medium'?22:k==='light'?10:[20,30,20]);}catch(e){}}
