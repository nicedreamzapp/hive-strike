// ---------- LEVELS / THEMES ----------
// Six worlds. Each has its own sky+ground palette, its own scrolling decor, its own enemy roster and its own boss.
const THEMES=[
 {name:'THE MEADOW',    sub:'sunny fields',      sky:['#2f9fe8','#7fd0ff'],ground:['#8ad46e','#5cb05a'],shadow:'rgba(20,60,20,.35)',decor:'meadow', roster:['grasshopper','fly','butterfly','ladybug','katydid','gnat','hoverfly'],len:3000,boss:0,stars:0,cloud:'midge'},
 {name:'THE GARDEN',    sub:'sunset roses',      sky:['#3a1f5e','#e06a4a'],ground:['#7da356','#3f6a32'],shadow:'rgba(40,10,50,.4)', decor:'garden', roster:['ladybug','wasp','katydid','snail','earwig','butterfly','rosechafer'],len:3200,boss:1,stars:0,cloud:'aphid'},
 {name:'THE POND',      sub:'still water',       sky:['#1b6f8a','#3fb5c9'],ground:['#3aa9c4','#1f7a93'],shadow:'rgba(0,30,50,.4)',  decor:'pond',   roster:['dragon','mosquito','strider','shorefly','spiderling','fly','divingbeetle'],len:3300,boss:3,stars:0,cloud:'thrips'},
 {name:'THE ORCHARD',   sub:'autumn apples',     sky:['#c9743a','#f0b070'],ground:['#d19a4a','#9a6a2a'],shadow:'rgba(60,30,0,.4)',  decor:'orchard',roster:['cicada','beetle','weevil','snail','hornet','moth','tigermoth'],len:3400,boss:4,stars:0,cloud:'fruitfly'},
 {name:'THE NIGHT WOOD',sub:'moonlit forest',    sky:['#05081c','#101a4a'],ground:['#23325a','#111a36'],shadow:'rgba(0,0,20,.55)',  decor:'night',  roster:['firefly','moth','glowworm','spiderling','cavecricket','ashmoth','lunamoth'],len:3500,boss:2,stars:1,cloud:'sandfly'},
 {name:'THE HIVE',      sub:'inside the comb',   sky:['#4a2a00','#b06a10'],ground:['#e0a030','#a86a10'],shadow:'rgba(60,30,0,.45)', decor:'hive',   roster:['hornet','ant','termite','wasp','jewelwasp','beetle'],len:3600,boss:5,stars:0,cloud:'blackfly'},
 {name:'THE SWAMP',     sub:'misty bog',         sky:['#3a4a2a','#8aa070'],ground:['#5a6a3a','#2a3a1a'],shadow:'rgba(10,30,10,.45)', decor:'pond',   roster:['spiderling','snail','horsefly','mosquito','strider','isopod','damselfly'],len:3700,boss:6,stars:0,cloud:'whitefly'},
 {name:'THE DUNES',     sub:'desert sunset',     sky:['#ffb060','#ffe0a0'],ground:['#e0b070','#a07040'],shadow:'rgba(80,40,0,.4)',  decor:'dunes',  roster:['earwig','stinkbug','dungbeetle','scorpionfly','sandhopper','silverfish','antlion'],len:3800,boss:7,stars:0,cloud:'springtail'},
 {name:'THE CANOPY',    sub:'rainforest',        sky:['#1a4a2a','#6ab070'],ground:['#3a7a3a','#1a3a1a'],shadow:'rgba(0,30,0,.45)',  decor:'meadow', roster:['leafcutter','morpho','harlequin','katydid','glasswing','ant','rhinobeetle'],len:3900,boss:8,stars:0,cloud:'leafhopper'},
 {name:'THE CAVE',      sub:'deep dark',         sky:['#0a0a14','#20203a'],ground:['#2a2a3a','#101018'],shadow:'rgba(0,0,0,.6)',    decor:'night',  roster:['cavecricket','millipede','whipscorpion','silverfish','glowworm','isopod'],len:4000,boss:9,stars:0,cloud:'fungusgnat'},
 {name:'THE ALPINE',    sub:'high mountain',     sky:['#8ac0ff','#e8f4ff'],ground:['#a8b8a0','#607060'],shadow:'rgba(20,30,40,.4)', decor:'meadow', roster:['stonefly','apollo','snowflea','grasshopper','ladybug','moth'],len:4000,boss:10,stars:0,cloud:'mayfly'},
 {name:'THE TIDE POOL', sub:'rocky shore',       sky:['#4ab0d0','#c8f0ff'],ground:['#5aa0b0','#2a6070'],shadow:'rgba(0,30,50,.45)', decor:'pond',   roster:['sandhopper','isopod','shorefly','strider','snail','millipede'],len:4100,boss:11,stars:0,cloud:'noseeum'},
 {name:'THE VOLCANO',   sub:'ash & ember',       sky:['#2a0a00','#8a2a00'],ground:['#3a2a20','#100806'],shadow:'rgba(0,0,0,.55)',   decor:'dunes',  roster:['lavacricket','ashmoth','blisterbeetle','ant','cicada','dungbeetle'],len:4100,boss:12,stars:0,cloud:'psyllid'},
 {name:'THE TUNDRA',    sub:'frozen white',      sky:['#c0d8f0','#f4f8ff'],ground:['#d8e8f4','#8aa0b8'],shadow:'rgba(40,60,90,.35)',decor:'meadow', roster:['scorpionfly','iceworm','woollybear','snowflea','stonefly','apollo'],len:4200,boss:13,stars:0,cloud:'lacebug'},
 {name:'THE ROOFTOPS',  sub:'city at dusk',      sky:['#2a1a3a','#c05a30'],ground:['#3a3a44','#1a1a22'],shadow:'rgba(0,0,10,.5)',   decor:'night',  roster:['cockroach','silverfish','bedbug','horsefly','fly','ant','assassinbug'],len:4200,boss:14,stars:1,cloud:'planthopper'},
 {name:'THE CRYSTAL',   sub:'glowing cavern',    sky:['#1a0a3a','#5a2a9a'],ground:['#3a2a6a','#1a1040'],shadow:'rgba(20,0,40,.5)',  decor:'hive',   roster:['glasswing','jewelwasp','lanternbug','morpho','firefly','harlequin','jewelbeetle'],len:4300,boss:15,stars:1,cloud:'crystalmite'},
];
const NL=THEMES.length;
function LV(){return THEMES[(stage-1)%NL];}

// ---------------- DIFFICULTY: one number per world, every dial reads off it ----------------
// Before 2026-09-15 difficulty was an accident of two lotteries. A world was as hard as its
// ROSTER happened to be -- THE DUNES drew bugs that barely shoot and measured QUIETER than
// world 1 (0.9 shots in the air against 2.2) -- and a boss was as hard as whichever of eight
// shared attack patterns it was handed, with no regard for which world it stood in (world 16's
// boss forced a dodging bot to move on 4.2% of frames; world 14's on 6.5%). The curve had dips
// in it and no one could see them, because difficulty was never written down anywhere.
//
// heat() is now that number: 0 at THE MEADOW, 1 at THE CRYSTAL, and it keeps climbing on later
// loops. Every dial below is a named point on that curve, so world 9 is a thing you can look up
// instead of a thing you discover. The roster still picks WHICH bugs you fight. It no longer
// picks how hard the world is.
//
// tools/difficulty_curve.mjs measures the real game against this and FAILS if any world comes
// out easier than the one before it.
// Per-world correction, the same trick that took the boss patterns from a 35x spread to 1.3x.
// Every dial sits exactly on the curve, but a world's BUGS still differ in ways the curve cannot
// see -- above all in how long a shooter sticks around. A spiderling hangs on its thread at a
// fixed height and fires twenty times; a diving fly gets one volley on its way past. So THE
// SWAMP measured 11.8% forced movement at world 7 while THE HIVE measured 1.2% at world 6.
// WFIT scales each world's fire cadence so the themed roster stays exactly as it is and the
// pressure still lands on the line. Derived by measurement, not by taste --
// tools/world_fit.mjs re-derives it and prints a fresh table.
const WFIT=[1.11,1.00,0.55,0.61,0.87,0.35,0.85,0.55,0.39,0.44,0.85,0.58,0.86,0.85,0.71,0.69];
const heat=()=>((stage-1)%NL)/(NL-1)+loop*.55;
const HC=(a,b)=>a+(b-a)*heat();
const DIFF={
 speed   :()=>Math.min(2.5,HC(.36,1.55)),        // how fast bugs move
 swarm   :()=>Math.round(HC(6,19)),              // bugs allowed on screen at once
 squads  :()=>heat()>=.78?4:heat()>=.42?3:2,     // formations allowed to share the air
 squadAdd:()=>Math.round(HC(0,3.2)),             // extra bugs per formation
 cadence :()=>Math.max(.14,HC(.78,.17))*WFIT[(stage-1)%NL], // wait between a bug's volleys (lower = faster)
 airCap  :()=>Math.round(Math.min(110,HC(16,88))),// hard ceiling on enemy shots in the air
 elite   :()=>Math.min(.85,HC(.15,.55)),         // chance a wave carries an elite
 bossFire:()=>Math.max(.55,HC(1.18,.70)),        // boss fire period (lower = shoots more often)
 gunners :()=>Math.min(.90,HC(.22,.82)),         // share of the swarm that must be bugs which SHOOT
 bossHp  :()=>HC(1.30,3.05),                     // boss health, against the gun you are likely to hold
 // ---- how cheap it is to be WRONG. this is half of difficulty and it was never on the curve ----
 // Measured off Matt's own live run 2026-09-15: three worlds in at THE CRYSTAL, every enemy dial
 // pegged at maximum, and he was carrying 10 lives and 5 bombs -- fifteen mistakes in hand. No
 // amount of enemy pressure reads as danger when being wrong costs nothing.
 maxLives:()=>Math.round(HC(9,4)),               // how many lives you may bank
 bombCap :()=>Math.round(HC(5,3)),               // how many swarm calls you may hold
 savePain:()=>heat()>=.5,                        // deep in, a bomb saving your life also costs you a power level
 // Matt 2026-09-15: "I was easily able to dodge the firepower on some of the higher rounds."
 // He was right and it was not subtle. Enemy shots carried a flat 0.55 speed multiplier at every
 // level of the game, so at THE CRYSTAL a wasp's venom travelled 1.97 px a frame against your
 // 4.50 -- you outran every bullet in the game by more than two to one, forever. More bullets
 // arriving at a speed you can simply walk away from is not difficulty, it is weather. Shot
 // speed is now the steepest line on the curve: still comfortably escapable at the end, but
 // close enough that you have to actually go somewhere.
 shotSpeed:()=>HC(.55,1.00),
 // How much of the enemies' fire is actually pointed AT you. Measured 2026-09-15: THE CRYSTAL
 // fires 14.4 shots a second, more than double any other world, and still forced a dodging bot
 // to move only 3.6% of the time -- LESS than world five. Its roster is full of bugs that spray
 // rings in every direction, so most of those bullets were never coming for you in the first
 // place. Volume is not threat. Aim is. So aim is a dial: early worlds shoot roughly where you
 // stood, late worlds shoot where you are going to BE, and a radial burst starts lining one of
 // its spokes up on you instead of landing wherever it happens to land.
 aimShare:()=>HC(.18,.92),
 // And WHICH gunners show up. A bug that aims is worth several that spray: THE TUNDRA's roster
 // is stacked with ladybugs, moths and snails and forces 20.8% movement, while THE POND is all
 // ring-sprayers and forces 0.1%. That was the last thing deciding difficulty by roster luck
 // instead of by the curve.
 aimers  :()=>Math.min(.90,HC(.20,.85)),
};
function D(){return DIFF.speed();}

