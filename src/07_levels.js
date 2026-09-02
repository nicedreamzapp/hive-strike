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
function D(){const lv=(stage-1)%NL;
 // late worlds keep accelerating instead of coasting: a curve, not a straight line
 const late=lv>=11?(lv-10)*.085:0;
 return Math.min(2.5,.36+lv*.105+late+loop*.28);}

