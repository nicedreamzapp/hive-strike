// ---------- suspend / resume ----------
// phones and laptops background this app constantly. two things break when they do:
// the browser freezes the WebAudio clock and never restarts it, and the player comes back
// mid-boss already taking hits. handle both.
let resumeCountdown=0,wasPaused=false;
function audioWake(){if(AC&&AC.state!=='running')AC.resume().catch(()=>{});}
for(const ev of ['pointerdown','keydown','touchstart'])addEventListener(ev,audioWake,{passive:true});
function goDark(){
 wasPaused=paused&&!pausedByBlur;pausedByBlur=false;paused=true;resumeCountdown=0;
 for(const k in MUSIC.tracks){const a=MUSIC.tracks[k];if(!a.paused){a.pause();a.volume=0;}}
 for(const j in VID){const v=VID[j];if(v&&!v.paused)v.pause();}
 if(SPLASHV&&!SPLASHV.paused)SPLASHV.pause();
 if(AC&&AC.state==='running')AC.suspend().catch(()=>{});
}
function comeBack(){
 audioWake();last=performance.now();acc=0;
 if(state==='play'&&!wasPaused)resumeCountdown=180; else paused=wasPaused;
}
document.addEventListener('visibilitychange',()=>{document.hidden?goDark():comeBack();});
addEventListener('pagehide',goDark);
// clicking another window on the same screen blurs without hiding, so visibilitychange
// never fires. pause anyway, and remember that WE paused it so focus can undo it.
let pausedByBlur=false;
addEventListener('blur',()=>{if(state==='play'&&!paused){paused=true;pausedByBlur=true;}});
addEventListener('focus',()=>{audioWake();last=performance.now();acc=0;
 if(pausedByBlur){pausedByBlur=false;if(state==='play'){paused=true;resumeCountdown=180;}}});

// In a Capacitor shell the OS launch screen stays up until we say the game is drawn --
// that way there is never a blank frame between the two. A plain browser has no bridge
// and this is a no-op.
let shownOnce=false;
function nativeReady(){try{const P=window.Capacitor&&window.Capacitor.Plugins;if(P&&P.SplashScreen&&P.SplashScreen.hide)P.SplashScreen.hide();}catch(e){}}
let acc=0,last=performance.now();const STEP=1000/60;
function frame(now){acc+=Math.min(100,now-last);last=now;padTick();
 while(acc>=STEP){acc-=STEP;
  if(resumeCountdown>0){resumeCountdown--;if(resumeCountdown===0)paused=false;t++;}
  else if(state==='play'&&!paused)update();else t++;}
 musicTick();ambTick();if(state==='play'&&!SPLASHV.paused)SPLASHV.pause();draw();
 if(!shownOnce){shownOnce=true;nativeReady();}
 requestAnimationFrame(frame);}
requestAnimationFrame(frame);
