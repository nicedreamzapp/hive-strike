// ---------- enemies ----------
const ET={
 fly:{hp:4,r:11,sc:100,col:'#7dd3c0'},
 mosquito:{hp:2,r:9,sc:150,col:'#4a4a6a'},
 wasp:{hp:10,r:14,sc:300,col:'#ffcc33'},
 beetle:{hp:24,r:18,sc:500,col:'#6b4c9a'},
 moth:{hp:14,r:16,sc:400,col:'#d9c7a3'},
 gnat:{hp:2,r:7,sc:80,col:'#9fb0d0'},
 midge:{hp:1,r:6,sc:20,col:'#a0a8b8'},
 aphid:{hp:1,r:6,sc:20,col:'#9ad04a'},
 thrips:{hp:1,r:6,sc:20,col:'#d8c060'},
 fruitfly:{hp:1,r:6,sc:20,col:'#d0a060'},
 sandfly:{hp:1,r:6,sc:20,col:'#c8b890'},
 blackfly:{hp:1,r:6,sc:20,col:'#2a2a2a'},
 whitefly:{hp:1,r:6,sc:20,col:'#f0f0f0'},
 springtail:{hp:1,r:6,sc:20,col:'#6a5a8a'},
 leafhopper:{hp:1,r:6,sc:20,col:'#60c060'},
 fungusgnat:{hp:1,r:6,sc:20,col:'#4a4a5a'},
 mayfly:{hp:1,r:6,sc:20,col:'#d0d8b0'},
 noseeum:{hp:1,r:6,sc:20,col:'#8a8a8a'},
 psyllid:{hp:1,r:6,sc:20,col:'#c0a040'},
 lacebug:{hp:1,r:6,sc:20,col:'#e0e0f0'},
 planthopper:{hp:1,r:6,sc:20,col:'#80c0e0'},
 crystalmite:{hp:1,r:6,sc:20,col:'#d0a0ff'},
 ant:{hp:16,r:13,sc:350,col:'#b0402a'},
 ladybug:{hp:12,r:13,sc:350,col:'#e8322a'},
 firefly:{hp:8,r:11,sc:300,col:'#d8ff60'},
 dragon:{hp:11,r:15,sc:400,col:'#40d0ff'},
 grasshopper:{hp:12,r:14,sc:350,col:'#7ac943'},
 stinkbug:{hp:18,r:15,sc:450,col:'#7a8a3a'},
 hornet:{hp:8,r:12,sc:350,col:'#e07a1c'},
 cicada:{hp:14,r:14,sc:450,col:'#3a3a2a'},
 butterfly:{hp:6,r:14,sc:300,col:'#ff9f43'},
 spiderling:{hp:7,r:10,sc:300,col:'#3a3a4a'},
 snail:{hp:22,r:14,sc:450,col:'#b08a5a'},
 earwig:{hp:9,r:12,sc:300,col:'#6a3a1a'},
 katydid:{hp:10,r:14,sc:350,col:'#9ad64a'},
 strider:{hp:5,r:12,sc:300,col:'#8aa0a0'},
 weevil:{hp:12,r:12,sc:350,col:'#7a5a3a'},
 glowworm:{hp:9,r:11,sc:350,col:'#b0ff70'},
 termite:{hp:4,r:9,sc:150,col:'#e8d8b0'},
 horsefly:{hp:9,r:13,sc:350,col:'#4a4a3a'},
 dungbeetle:{hp:24,r:16,sc:500,col:'#3a2a1a'},
 leafcutter:{hp:8,r:12,sc:300,col:'#8a4a2a'},morpho:{hp:6,r:15,sc:350,col:'#2a6aff'},harlequin:{hp:16,r:15,sc:450,col:'#c03030'},
 cavecricket:{hp:9,r:13,sc:300,col:'#c8b090'},millipede:{hp:20,r:14,sc:450,col:'#3a2a20'},whipscorpion:{hp:14,r:14,sc:450,col:'#2a2a2a'},
 stonefly:{hp:5,r:11,sc:250,col:'#8a8a8a'},apollo:{hp:6,r:15,sc:350,col:'#f0f0f0'},snowflea:{hp:2,r:6,sc:100,col:'#3a3a4a'},
 sandhopper:{hp:8,r:11,sc:300,col:'#b0a080'},isopod:{hp:18,r:13,sc:450,col:'#7a8090'},shorefly:{hp:4,r:10,sc:200,col:'#40a060'},
 lavacricket:{hp:10,r:13,sc:350,col:'#2a1a1a'},ashmoth:{hp:7,r:15,sc:350,col:'#9a9a9a'},blisterbeetle:{hp:14,r:14,sc:450,col:'#20a060'},
 scorpionfly:{hp:5,r:11,sc:300,col:'#4a4a5a'},iceworm:{hp:16,r:12,sc:400,col:'#2a3a4a'},woollybear:{hp:22,r:14,sc:450,col:'#e08020'},
 cockroach:{hp:12,r:14,sc:350,col:'#6a3a1a'},silverfish:{hp:5,r:11,sc:250,col:'#b0b8c8'},bedbug:{hp:9,r:10,sc:300,col:'#8a3a2a'},
 glasswing:{hp:6,r:15,sc:400,col:'#d8e8ff'},jewelwasp:{hp:8,r:12,sc:400,col:'#10c080'},lanternbug:{hp:14,r:14,sc:450,col:'#e05a90'},
 // ten more, 2026-09-01: one per world that needed a face it did not have
 hoverfly:{hp:5,r:11,sc:150,col:'#f0c030'},rosechafer:{hp:14,r:13,sc:380,col:'#3fc060'},divingbeetle:{hp:16,r:14,sc:420,col:'#5a7a20'},tigermoth:{hp:12,r:15,sc:380,col:'#ff8a30'},lunamoth:{hp:8,r:16,sc:300,col:'#b8f0b0'},damselfly:{hp:6,r:12,sc:250,col:'#40a0ff'},antlion:{hp:15,r:13,sc:400,col:'#c8a060'},rhinobeetle:{hp:22,r:16,sc:500,col:'#3a2a1a'},assassinbug:{hp:13,r:13,sc:400,col:'#8a8a9a'},jewelbeetle:{hp:12,r:13,sc:450,col:'#40e0c0'},
};
loadSprites();
function spawn(type,x,y,o={}){const d=ET[type];const e=Object.assign({type,x,y,hp:(o.tiny?1.6:d.hp*EHP)*(1+loop*.6),r:o.tiny?4:d.r,sc:o.tiny?20:d.sc,col:d.col,t:0,ft:RI(40,100),dir:Math.random()<.5?-1:1,ph:R(0,7)},o);if(e.elite){e.hp*=2.2;e.sc*=3;}e.maxhp=e.hp;e.px=e.x;e.py=e.y;enemies.push(e);return e;}
// FORMATIONS — every wave is a shape, not a drip. fodder = the bugs that fly in shapes; shooters = the ones that take a position and fire.
// ARCH: what an unseen bug behaves like (movement + shooting + voice recipe). PITCH: how its voice is tuned so no two sound alike.
const ARCH={midge:'gnat',aphid:'gnat',thrips:'gnat',fruitfly:'gnat',sandfly:'gnat',blackfly:'gnat',whitefly:'gnat',springtail:'gnat',leafhopper:'gnat',fungusgnat:'gnat',mayfly:'gnat',noseeum:'gnat',psyllid:'gnat',lacebug:'gnat',planthopper:'gnat',crystalmite:'gnat',leafcutter:'ant',morpho:'butterfly',harlequin:'beetle',cavecricket:'grasshopper',millipede:'snail',whipscorpion:'earwig',stonefly:'fly',apollo:'butterfly',snowflea:'gnat',sandhopper:'grasshopper',isopod:'stinkbug',shorefly:'fly',lavacricket:'grasshopper',ashmoth:'moth',blisterbeetle:'beetle',scorpionfly:'mosquito',iceworm:'snail',woollybear:'snail',cockroach:'earwig',silverfish:'strider',bedbug:'ant',glasswing:'butterfly',jewelwasp:'wasp',lanternbug:'cicada',hoverfly:'fly',rosechafer:'beetle',divingbeetle:'beetle',tigermoth:'moth',lunamoth:'moth',damselfly:'dragon',antlion:'earwig',rhinobeetle:'beetle',assassinbug:'stinkbug',jewelbeetle:'beetle'};
const PITCH={midge:0.80,aphid:0.86,thrips:0.92,fruitfly:0.98,sandfly:1.04,blackfly:1.10,whitefly:1.16,springtail:1.22,leafhopper:1.28,fungusgnat:1.34,mayfly:1.40,noseeum:1.46,psyllid:1.52,lacebug:1.58,planthopper:1.64,crystalmite:1.70,leafcutter:1.3,morpho:.8,harlequin:.7,cavecricket:1.4,millipede:.6,whipscorpion:.75,stonefly:1.2,apollo:1.15,snowflea:1.6,sandhopper:.9,isopod:.65,shorefly:1.35,lavacricket:.85,ashmoth:.9,blisterbeetle:1.1,scorpionfly:1.25,iceworm:.55,woollybear:.7,cockroach:.8,silverfish:1.45,bedbug:1.2,glasswing:1.5,jewelwasp:1.3,lanternbug:.75};
const A=k=>ARCH[k]||k;
const FODDER=['fly','mosquito','gnat','ant','ladybug','grasshopper','hornet','butterfly','spiderling','earwig','katydid','strider','weevil','termite','horsefly','leafcutter','morpho','cavecricket','whipscorpion','stonefly','apollo','snowflea','sandhopper','shorefly','lavacricket','scorpionfly','cockroach','silverfish','bedbug','glasswing','jewelwasp','hoverfly','lunamoth','damselfly'],SHOOTERS=['wasp','beetle','moth','firefly','dragon','ladybug','cicada','stinkbug','snail','spiderling','glowworm','dungbeetle','harlequin','millipede','isopod','ashmoth','blisterbeetle','iceworm','woollybear','lanternbug','jewelwasp','rosechafer','divingbeetle','tigermoth','antlion','rhinobeetle','assassinbug','jewelbeetle'];
const FORMS={
 line(k){const n=5,y=-20;for(let i=0;i<n;i++)spawn(k,60+i*(W-120)/(n-1),y-i*6,{pat:'fall',vy:1.3});},          // a rank marching straight down
 vee(k){for(let i=-2;i<=2;i++)spawn(k,W/2+i*55,-20-Math.abs(i)*40,{pat:'fall',vy:1.5});},                       // V wedge
 column(k){const x=R(80,W-80);for(let i=0;i<4;i++)spawn(k,x,-20-i*55,{pat:'sine',ox:x});},                      // snake column
 pincer(k){for(let i=0;i<3;i++){spawn(k,-20-i*40,80+i*25,{pat:'arc',dir:1});spawn(k,W+20+i*40,80+i*25,{pat:'arc',dir:-1});}}, // from both sides
 zig(k){const x=R(100,W-100);for(let i=0;i<3;i++)spawn(k,x,-20-i*50,{pat:'zig',dir:i%2?1:-1});},               // sharp zigzag
 ambush(k){for(const sg of[-1,1])for(let i=0;i<2;i++)spawn(k,sg<0?-20:W+20,H-160-i*40,{pat:'rise',dir:-sg});},// from BELOW the bee
 divers(k){for(let i=0;i<3;i++)spawn(k||'mosquito',R(30,W-30),-20-i*40,{pat:'dive'});},
 skaters(k){for(const sg of[-1,1])spawn(k||'strider',sg<0?-20:W+20,R(120,260),{pat:'dash'});},
 scurry(k){const x=R(60,W-60);for(let i=0;i<5;i++)spawn(k||'termite',x+R(-14,14),-20-i*22,{pat:'scurry'});},
 flank(k){spawn(k,60,-20,{pat:'hover',dir:1});spawn(k,W-60,-20,{pat:'hover',dir:-1});},                         // two gunners take the corners
 heavy(k){spawn(k,R(80,W-80),-30,{pat:k==='dragon'?'dash':k==='firefly'?'blink':'slow'});},
 swarm(k){const x=R(80,W-80);for(let i=0;i<6;i++)spawn(k||'gnat',x+R(-40,40),-20-i*16,{pat:'swarm'});},
 hoppers(k){for(let i=0;i<3;i++)spawn(k||'grasshopper',100+i*(W-200)/2,-20-i*30,{pat:'hop'});},                    // three grasshoppers that leap at you
 chargers(k){for(let i=0;i<2;i++)spawn(k||'hornet',R(60,W-60),-20-i*60,{pat:'charge'});},                           // hornets: wind up, then dash
 screamer(k){spawn(k||'cicada',R(80,W-80),-20,{pat:'hover',dir:Math.random()<.5?-1:1});},
 stinker(k){spawn(k||'stinkbug',R(60,W-60),-30,{pat:'slow'});},
 threads(k){for(let i=0;i<3;i++)spawn(k||'spiderling',90+i*(W-180)/2,-20,{pat:'thread',hang:R(140,260)});},      // spiderlings drop in on silk and hang there
 flutters(k){for(let i=0;i<2;i++)spawn(k||'butterfly',R(60,W-60),-20-i*80,{pat:'flutter'});},
 crawler(k){spawn(k||'snail',R(60,W-60),-30,{pat:'creep'});},
 cloud(k){const cx=R(120,W-120),n=Math.min(26,12+stage);   /* 22+stage*2 put 54 gnats on a phone screen: clutter, not danger */const sp2=LV().cloud||'gnat';for(let i=0;i<n;i++){const a=R(0,7),rr=Math.sqrt(Math.random());spawn(sp2,cx+Math.cos(a)*rr*110,-40+Math.sin(a)*rr*55,{pat:'cloud',tiny:1,cx,ph:R(0,7)});}},
};
const FODDER_FORMS=['line','vee','column','pincer','zig','ambush','divers','swarm'],SHOOTER_FORMS=['flank','heavy'];
let nextWave=0,rushDone=false,nextCloud=0;
