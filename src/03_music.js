// ---------- music: Song Forge instrumental beds (music/main.mp3 for levels, music/boss.mp3 for boss fights) ----------
// iOS does not let you set the volume of an <audio> element. It accepts the
// assignment, then resets to 1 the moment the media loads -- measured on device:
// "set 0.045 -> reads back 0.045 ... after load: 1". So every bed played at FULL
// volume instead of 4.5%, the fade-out that stops the previous track never reached
// zero, and old tracks never paused: level music, boss music and the title theme
// all stacked on top of each other. Route every track through a GainNode instead.
// That is honoured on every platform.
const MUSIC={tracks:{},gains:{},cur:null,want:null,vol:.045,on:localStorage.hs_music!=null?localStorage.hs_music==='1':true};
function musicGain(k,a){
 let g=MUSIC.gains[k];
 if(g!==undefined)return g;
 try{const ac=ctx();const src=ac.createMediaElementSource(a);g=ac.createGain();g.gain.value=0;src.connect(g).connect(ac.destination);}
 catch(e){g=null;}                       // fall back to a.volume if the graph refuses
 MUSIC.gains[k]=g;return g;}
const mvol=(k,a)=>{const g=MUSIC.gains[k];return g?g.gain.value:a.volume;};
function msetvol(k,a,v){const g=musicGain(k,a);if(g)g.gain.value=v;else a.volume=v;}
function musicToggle(){MUSIC.on=!MUSIC.on;localStorage.hs_music=MUSIC.on?'1':'0';say(MUSIC.on?'MUSIC ON':'MUSIC OFF');}
function musicLoad(){const names=['main','boss','win','title'];for(let n=1;n<=16;n++){names.push('level'+n,'boss'+n);}for(const k of names){const a=new Audio('music/'+k+'.mp3');a.loop=k!=='win';a.volume=0;a.preload='none';a.ok=false;a.addEventListener('canplay',()=>{a.ok=true;});a.addEventListener('error',()=>{a.ok=false;a.bad=true;});MUSIC.tracks[k]=a;}}
function musicPick(kind){if(kind==='win')return 'win';if(kind==='title')return 'title';const n=(stage-1)%NL+1,k=(kind==='boss'?'boss':'level')+n,a=MUSIC.tracks[k];if(a&&!a.bad){if(a.preload==='none'){a.preload='auto';a.load();}return k;}return kind==='boss'?'boss':'main';}
function music(name){MUSIC.want=name?musicPick(name):null;}
function musicTick(){for(const k in MUSIC.tracks){const a=MUSIC.tracks[k],boss=k.startsWith('boss'),
  target=(k===MUSIC.want&&(state==='play'||k==='title')&&!paused&&MUSIC.on&&!(k==='win'&&a.ended))?VOL*(boss?MUSIC.vol*1.1:k==='win'?MUSIC.vol*1.3:MUSIC.vol):0;
  if(target>0&&a.paused){if(a.bad){MUSIC.want=k.startsWith('boss')?'boss':'main';return;}musicGain(k,a);a.play().catch(()=>{});}
  if(target<=0&&a.paused)continue;                       // nothing to fade on a stopped track
  const v=mvol(k,a)+(target-mvol(k,a))*.04;
  msetvol(k,a,v);
  if(v<.004&&target===0&&!a.paused){a.pause();msetvol(k,a,0);}}}
musicLoad();
