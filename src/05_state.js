// ---------- state ----------
const R=(a,b)=>a+Math.random()*(b-a),RI=(a,b)=>Math.floor(R(a,b+1)),clamp=(v,a,b)=>v<a?a:v>b?b:v;
let flash=0,bossIntro=0,bossWarn=0,levelIntro=0,levelClear=0,armed=false,startStage=+localStorage.hs_start||1;
// progression: you only get to jump to a level you have actually reached.
let unlocked=Math.max(1,Math.min(16,+localStorage.hs_unlocked||1));
function unlockUpTo(n){const u=n>16?16:Math.max(1,Math.min(16,n));if(u>unlocked){unlocked=u;localStorage.hs_unlocked=u;}}
const bestFor=n=>+localStorage['hs_best'+n]||0;
function recordBest(n,sc){if(n>=1&&n<=16&&sc>bestFor(n))localStorage['hs_best'+n]=sc;}
const STAT={runs:+localStorage.hs_runs||0,bosses:+localStorage.hs_bosses||0,deepest:+localStorage.hs_deepest||1};
function statSave(){localStorage.hs_runs=STAT.runs;localStorage.hs_bosses=STAT.bosses;localStorage.hs_deepest=STAT.deepest;}
function pickStage(n){n=clamp(n,1,16);if(n>unlocked){say('LEVEL '+n+' LOCKED  \u2014  REACH IT TO PLAY IT');noise(.12,.025,300,1.2,140,'lowpass');return;}startStage=n;localStorage.hs_start=startStage;click(1200,.02);}
const TILE=(i)=>({x:26+(i%8)*54,y:H-150+Math.floor(i/8)*44,w:48,h:38});
function arm(){armed=true;ctx();music('title');}
function continueGame(){state='play';stage++;stageT=0;loop++;levelIntro=200;nextWave=0;rushDone=false;bossAlive=false;boss=null;enemies=[];ebullets=[];pickups=[];buildDecor((stage-1)%NL);SFX.levelStart();music('main');}let state='title',paused=false,t=0,score=0,hi=+localStorage.hs_hi||0,stage=1,stageT=0,bossAlive=false,shake=0,wantBomb=0,msg='',msgT=0,loop=0;
const PLABEL={nectar:'POWER UP',bomb:'BOMB +1',life:'1 UP',honey:'HONEY · WIDE SPREAD',stinger:'STINGER · PIERCE',pollen:'POLLEN · HOMING',water:'NECTAR · SPLASH STREAM',wax:'WAX · STICKY SLOW',thorn:'PROPOLIS · SHOTGUN',petal:'HONEYCOMB · SHIELD + DARTS',lance:'LANCE · PIERCING SPEAR',drones:'GUARD BEES · HUNTERS',static:'STATIC · CHAIN ZAP',saw:'SEED SAW · BOOMERANG',lash:'LIGHT LASH · BENDING BEAM',rain:'NECTAR RAIN · FROM ABOVE',lure:'LURE · PULLS THEN BURSTS',grenade:'COMB GRENADE · SHARDS',wall:'PROPOLIS WALL · SHIELD'};
// real bug names + one true, kid-sized fact each. The name pops up under a bug the first time it flies in; the fact shows the first time you beat one.
const BUGINFO={
 fly:{name:'HOUSE FLY',fact:'A house fly tastes food with its FEET and beats its wings about 200 times a second.'},
 mosquito:{name:'MOSQUITO',fact:'Only female mosquitoes bite. They need blood to make their eggs.'},
 wasp:{name:'PAPER WASP',fact:'Paper wasps chew wood into pulp and build papery nests with it.'},
 beetle:{name:'SCARAB BEETLE',fact:'One out of every four animal species on Earth is a beetle!'},
 moth:{name:'MOTH',fact:'Moths steer by the moon. Porch lights confuse them, so they circle the light.'},
 gnat:{name:'GNAT',fact:'Gnats are only a few millimetres long and so light they drift on a breeze.'},
 ant:{name:'FIRE ANT',fact:'An ant can carry 20 to 50 times its own weight and talks to friends with smells.'},
 ladybug:{name:'LADYBUG',fact:'A ladybug can eat 50 aphids a day. Farmers love them for protecting crops.'},
 firefly:{name:'FIREFLY',fact:'Fireflies make light with a chemical reaction that gives off almost no heat.'},
 dragon:{name:'DRAGONFLY',fact:'Dragonflies can fly backwards and catch about 95% of the bugs they chase.'},
 grasshopper:{name:'GRASSHOPPER',fact:'A grasshopper hears with ears on its belly and can jump 20 times its length.'},
 stinkbug:{name:'STINK BUG',fact:'When scared, a stink bug sprays a stinky liquid so predators leave it alone.'},
 hornet:{name:'HORNET',fact:'A hornet is just a big wasp. It hunts other insects to feed its young.'},
 cicada:{name:'CICADA',fact:'Cicadas are the loudest insects; some live underground for 17 years before coming out.'},
 butterfly:{name:'BUTTERFLY',fact:'Butterflies taste with their feet.'},spiderling:{name:'SPIDERLING',fact:'Baby spiders ride the wind on silk threads.'},snail:{name:'SNAIL',fact:'A snail can sleep for months.'},earwig:{name:'EARWIG',fact:''},katydid:{name:'KATYDID',fact:''},strider:{name:'WATER STRIDER',fact:''},weevil:{name:'WEEVIL',fact:''},glowworm:{name:'GLOWWORM',fact:''},termite:{name:'TERMITE',fact:''},horsefly:{name:'HORSEFLY',fact:''},dungbeetle:{name:'DUNG BEETLE',fact:''},midge:{name:'MIDGES'},aphid:{name:'APHIDS'},thrips:{name:'THRIPS'},fruitfly:{name:'FRUIT FLIES'},sandfly:{name:'SAND FLIES'},blackfly:{name:'BLACK FLIES'},whitefly:{name:'WHITEFLIES'},springtail:{name:'SPRINGTAILS'},leafhopper:{name:'LEAFHOPPERS'},fungusgnat:{name:'FUNGUS GNATS'},mayfly:{name:'MAYFLIES'},noseeum:{name:'NO-SEE-UMS'},psyllid:{name:'PSYLLIDS'},lacebug:{name:'LACE BUGS'},planthopper:{name:'PLANTHOPPERS'},crystalmite:{name:'CRYSTAL MITES'},leafcutter:{name:'LEAFCUTTER ANT'},morpho:{name:'BLUE MORPHO'},harlequin:{name:'HARLEQUIN BEETLE'},cavecricket:{name:'CAVE CRICKET'},millipede:{name:'MILLIPEDE'},whipscorpion:{name:'WHIP SCORPION'},stonefly:{name:'STONEFLY'},apollo:{name:'APOLLO BUTTERFLY'},snowflea:{name:'SNOW FLEA'},sandhopper:{name:'SAND HOPPER'},isopod:{name:'SEA SLATER'},shorefly:{name:'SHORE FLY'},lavacricket:{name:'LAVA CRICKET'},ashmoth:{name:'ASH MOTH'},blisterbeetle:{name:'BLISTER BEETLE'},scorpionfly:{name:'SCORPIONFLY'},iceworm:{name:'ICE WORM'},woollybear:{name:'WOOLLY BEAR'},cockroach:{name:'COCKROACH'},silverfish:{name:'SILVERFISH'},bedbug:{name:'BED BUG'},glasswing:{name:'GLASSWING'},jewelwasp:{name:'JEWEL WASP'},lanternbug:{name:'LANTERN BUG'},
};
const BOSSFACT=['A hornet queen starts a brand-new nest all by herself every spring.','A praying mantis can turn its head almost all the way around to look behind it.','An orb weaver spider eats its web every night and spins a fresh one.','A dragonfly eye has up to 30,000 tiny lenses.','Male stag beetles wrestle each other with jaws shaped like antlers.','Centipedes have one pair of legs per body segment, and never exactly 100.'];
let factTxt='',factName='',factT=0;const learned=new Set();
function showFact(name,fact){factName=name;factTxt=fact;factT=360;}
// ================= WEAPON ASSORTMENT =================
// HONEY wide fan · STINGER piercing beam · POLLEN homing · WATER fast stream that splashes · WAX sticky globs that slow bugs · THORN close-range shotgun · PETAL orbiting shield
const WEAPONS={honey:{name:'HONEY SPRAY',tag:'WIDE SPREAD',col:'#ffb300'},stinger:{name:'STINGER BEAM',tag:'PIERCING LASER',col:'#c77dff'},pollen:{name:'POLLEN SEEKERS',tag:'HOMING',col:'#ff6fb5'},
 water:{name:'NECTAR DROPS',tag:'FAST STREAM · SPLASH',col:'#ffa030'},wax:{name:'WAX GLOBS',tag:'STICKY · SLOWS BUGS',col:'#ffd27a'},thorn:{name:'PROPOLIS SHOT',tag:'SHOTGUN · CLOSE RANGE',col:'#b8862b'},petal:{name:'HONEYCOMB SHIELD',tag:'ORBIT SHIELD + DARTS',col:'#ffcc44'},
 lance:{name:'ROYAL JELLY LANCE',tag:'PIERCING SPEAR · BIG HITS',col:'#ffe066'},drones:{name:'GUARD BEES',tag:'BEES THAT HUNT FOR YOU',col:'#ffb84d'},static:{name:'STATIC POLLEN',tag:'CLOUD THAT CHAIN-ZAPS',col:'#c77dff'},saw:{name:'SEED SAW',tag:'BOOMERANG · HITS TWICE',col:'#8fd14f'},lash:{name:'LIGHT LASH',tag:'BEAM THAT BENDS TO BUGS',col:'#fff7b0'},
 rain:{name:'NECTAR RAIN',tag:'DROPS FALL FROM ABOVE',col:'#ffcc66'},lure:{name:'PHEROMONE LURE',tag:'PULLS BUGS IN, THEN BURSTS',col:'#ff7ad9'},grenade:{name:'COMB GRENADE',tag:'LOBBED · BURSTS INTO SHARDS',col:'#ffa54d'},wall:{name:'PROPOLIS WALL',tag:'BLOCKS SHOTS · BURNS BUGS',col:'#c8a050'}};
const WKEYS=Object.keys(WEAPONS);const randWeapon=()=>{const o=WKEYS.filter(k=>k!==P.wpn);return o[RI(0,o.length-1)];};
const P={x:W/2,y:H-100,px:W/2,py:H-100,r:12,lives:5,wpn:'honey',lvl:1,bombs:3,inv:0,fireT:0,dead:0,shots:0};
let bullets=[],ebullets=[],enemies=[],pickups=[],parts=[],boss=null,lashT=null;
// ---- queen's contract: pick your terms before the run, the payout scales with the greed ----
const CONTRACTS=[
 {id:'none', label:'NO CONTRACT',      terms:'the hive as it is',            mult:1,  mods:{}},
 {id:'feast',label:'ROYAL FEAST',      terms:'nectar drops doubled',         mult:.7, mods:{feast:1}},
 {id:'guard',label:'GUARDED',          terms:'start with 5 swarm calls',     mult:.8, mods:{guard:1}},
 {id:'angry',label:'ANGRY HIVES',      terms:'every boss wakes enraged',     mult:1.5,mods:{angry:1}},
 {id:'quick',label:'QUICK HIVES',      terms:'bugs shoot faster',            mult:1.5,mods:{quick:1}},
 {id:'nobomb',label:'NO SWARM CALLS',  terms:'no bombs · every hit costs',   mult:2,  mods:{nobomb:1}},
 {id:'royal',label:'ROYAL DECREE',     terms:'enraged bosses + fast bugs',   mult:2.2,mods:{angry:1,quick:1}},
 {id:'dwish',label:'DEATH WISH',       terms:'no bombs + fast bugs',         mult:3,  mods:{nobomb:1,quick:1}},
];
let contractIx=Math.min(CONTRACTS.length-1,+localStorage.hs_contract||0);
let MODS={},cmult=1;         // the live run's terms
// ---- daily hive: the date is the seed. same contract for every phone, no network ----
let dailyRun=null,wantDaily=false;
const dayKey=()=>{const d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();};
function seededPick(seed,n){let a=seed|0;a=Math.imul(a^a>>>15,1|a);a^=a+Math.imul(a^a>>>7,61|a);return ((a^(a>>>14))>>>0)%n;}
const dailyContract=()=>CONTRACTS[1+seededPick(dayKey(),CONTRACTS.length-1)];
const dailyBest=()=>+localStorage['hs_daily'+dayKey()]||0;
function endRun(){if(dailyRun&&score>dailyBest())localStorage['hs_daily'+dayKey()]=score;}

function start(){STAT.runs++;statSave();learned.clear();POPS.length=0;ann=null;hitstop=0;factT=0;chain=0;chainT=0;chainBest=0;grazed=0;nextExt=0;state='play';score=0;stage=startStage;stageT=0;loop=0;bossAlive=false;boss=null;bullets=[];ebullets=[];enemies=[];pickups=[];parts=[];Object.assign(P,{x:W/2,y:H-100,lives:5,wpn:'honey',lvl:1,bombs:3,inv:120,fireT:0,dead:0,webbed:0});
 dailyRun=wantDaily?dayKey():null;wantDaily=false;
 const c=dailyRun?dailyContract():CONTRACTS[contractIx];MODS=c.mods;cmult=c.mult;
 if(dailyRun)stage=1;                                  // a daily score means nothing unless everyone starts at the door
 if(MODS.guard)P.bombs=5;if(MODS.nobomb)P.bombs=0;
 bossWarn=0;levelClear=0;levelIntro=200;nextWave=0;rushDone=false;nextCloud=500;buildDecor((stage-1)%NL);palA=palB=(stage-1)%NL;palMix=1;SFX.levelStart();music('main');
 if(dailyRun)say('DAILY HIVE  ·  '+c.label+'  ·  x'+c.mult);else if(c.mult!==1)say(c.label+'  ·  SCORE x'+c.mult);}
function say(s){msg=s;msgT=150;}
function sparks(x,y,c,n=8,sp=9){for(let i=0;i<n;i++){const a=R(0,Math.PI*2),s=R(sp*.5,sp);parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:R(8,18),c,r:R(1,2),spark:1});}}
let muzzle=[];function flashMuzzle(x,y,c){muzzle.push({x,y,c,l:4});}
function gibs(e){const n=RI(4,7);for(let i=0;i<n;i++){const a=R(0,7),v=R(1.5,4.5);parts.push({x:e.x,y:e.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-2,l:R(30,55),c:e.col,r:R(2,4),gib:1,a:R(0,7),va:R(-.3,.3),rx:R(1.2,2.2)});}for(let i=0;i<2;i++){const a=R(0,7);parts.push({x:e.x,y:e.y,vx:Math.cos(a)*2,vy:-2,l:R(35,60),c:'rgba(230,245,255,.85)',r:R(3,5),gib:1,wing:1,a:R(0,7),va:R(-.2,.2),rx:2.4});}}
let boom=function(x,y,c,n=12,sp=4){for(let i=0;i<n;i++){const a=R(0,Math.PI*2),s=R(.5,sp);parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:R(15,40),c,r:R(1.5,4)});}}

