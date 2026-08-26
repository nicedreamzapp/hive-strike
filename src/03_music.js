// ---------- music: Song Forge instrumental beds (music/main.mp3 for levels, music/boss.mp3 for boss fights) ----------
const MUSIC={tracks:{},cur:null,want:null,vol:.045,on:localStorage.hs_music!=null?localStorage.hs_music==='1':true};
function musicToggle(){MUSIC.on=!MUSIC.on;localStorage.hs_music=MUSIC.on?'1':'0';say(MUSIC.on?'MUSIC ON':'MUSIC OFF');}
function musicLoad(){const names=['main','boss','win','title'];for(let n=1;n<=16;n++){names.push('level'+n,'boss'+n);}for(const k of names){const a=new Audio('music/'+k+'.mp3');a.loop=k!=='win';a.volume=0;a.preload='none';a.ok=false;a.addEventListener('canplay',()=>{a.ok=true;});a.addEventListener('error',()=>{a.ok=false;a.bad=true;});MUSIC.tracks[k]=a;}}
function musicPick(kind){if(kind==='win')return 'win';if(kind==='title')return 'title';const n=(stage-1)%NL+1,k=(kind==='boss'?'boss':'level')+n,a=MUSIC.tracks[k];if(a&&!a.bad){if(a.preload==='none'){a.preload='auto';a.load();}return k;}return kind==='boss'?'boss':'main';}
function music(name){MUSIC.want=name?musicPick(name):null;}
function musicTick(){for(const k in MUSIC.tracks){const a=MUSIC.tracks[k],boss=k.startsWith('boss'),target=(k===MUSIC.want&&(state==='play'||k==='title')&&!paused&&MUSIC.on&&!(k==='win'&&a.ended))?VOL*(boss?MUSIC.vol*1.1:k==='win'?MUSIC.vol*1.3:MUSIC.vol):0;if(target>0&&a.paused){if(a.bad){MUSIC.want=k.startsWith('boss')?'boss':'main';return;}a.play().catch(()=>{});}a.volume+= (target-a.volume)*.04;if(a.volume<.004&&target===0&&!a.paused){a.pause();a.volume=0;}}}
musicLoad();
