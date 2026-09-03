// ---------- bosses ----------
const BOSSES=[
 {name:'HORNET QUEEN',    taunt:'"This meadow is MINE, little bee."',      hp:220,r:40,col:'#ff9f1c'},
 {name:'PRAYING MANTIS',  taunt:'"Pray, then. It will not help."',          hp:320,r:46,col:'#7ed957'},
 {name:'ORB WEAVER',      taunt:'"Every thread leads to me."',              hp:420,r:50,col:'#3a3a4a'},
 {name:'DRAGONFLY ACE',   taunt:'"Too slow. You are ALL too slow."',        hp:360,r:44,col:'#40d0ff'},
 {name:'STAG BEETLE KING',taunt:'"Bow before the crown of horns."',         hp:480,r:50,col:'#5a2a10'},
 {name:'CENTIPEDE MOTHER',taunt:'"A hundred legs. One hunger."',            hp:540,r:36,col:'#c0402a'},
 {name:'MOSQUITO MATRIARCH',taunt:'"Hold still. This will only take everything."',hp:400,r:44,col:'#5a5a8a'},
 {name:'SCORPION KING',    taunt:'"The sand remembers every sting."',          hp:520,r:50,col:'#c08040'},
 {name:'GIANT WALKING STICK',taunt:'"You looked right at me. Twice."',           hp:560,r:52,col:'#7a8a4a'},
 {name:'CAVE GLOWWORM',    taunt:'"Follow the lights. Everyone does."',         hp:520,r:50,col:'#9fe8ff'},
 {name:'ICE WETA',         taunt:'"Cold. Slow. Still faster than you."',        hp:540,r:48,col:'#d8f0ff'},
 {name:'ARMOR CRAB KING',  taunt:'"Older than the flowers you drink from."',    hp:640,r:54,col:'#4a5a4a'},
 {name:'FIRE ANT QUEEN',   taunt:'"Every ember is one of my children."',        hp:580,r:46,col:'#ff5a10'},
 {name:'GLACIER EARWIG',   taunt:'"The cold pinches. So do I."',                 hp:600,r:48,col:'#a0e0ff'},
 {name:'DOBSONFLY',        taunt:'"The lights brought me. You brought dinner."',hp:620,r:46,col:'#d8b070'},
 {name:'ATLAS MOTH',       taunt:'"Shine, little bee, before you break."',      hp:700,r:50,col:'#e0a060'},
];
const faceRot=k=>0;  // every sprite PNG is stored head-down now, so nothing is rotated at draw time
const BSIZE=[250,250,250,250,196,250,250,225,250,250,250,225,250,250,250,235]; // per-boss draw height: the stag beetle's antlers and the crab's claws ran off the sides
const BROT=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; // art is rendered head-down now, so no sprite is flipped
const BARCH=[0,1,2,3,4,5,6,7,4,2,0,4,1,1,0,3]; // which of the eight hand-built fight patterns each boss uses
function spawnBoss(){const b=BOSSES[LV().boss];boss={...b,hp:b.hp*BHP*(1+loop*.7),max:b.hp*BHP*(1+loop*.7),x:W/2,y:-80,t:0,ph:0,rage:0,seg:[]};bossAlive=true;enemies=[];bossIntro=110;shake=30;say(b.name+'  —  FIGHT!');rumble(1.6,.07);swell(55,1.6,'triangle',.06,.5);
 if(MODS.angry)rageBoss(boss); // ANGRY HIVES: the job change starts at the door
}
