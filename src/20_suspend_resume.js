// ---------- suspend / resume ----------
// phones and laptops background this app constantly. two things break when they do:
// the browser freezes the WebAudio clock and never restarts it, and the player comes back
// mid-boss already taking hits. handle both.
let resumeCountdown=0,wasPaused=false;
function audioWake(){
 if(AC&&AC.state!=='running')AC.resume().catch(()=>{});}
for(const ev of ['pointerdown','keydown','touchstart'])addEventListener(ev,audioWake,{passive:true});
function goDark(){
 wasPaused=paused&&!pausedByBlur;pausedByBlur=false;paused=true;resumeCountdown=0;saveCheckpoint();   /* sent to the background mid-run: keep the place so a killed app can RESUME */
 for(const k in MUSIC.tracks){const a=MUSIC.tracks[k];if(!a.paused){a.pause();a.volume=0;}}
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
// Nobody should have to know what a pixel ratio is. Two seconds of real play and the
// game picks its own detail level, both directions.
//   dropping  is judged on the gap between frames: over 21ms average means frames
//             are being missed, whatever the screen's refresh rate is.
//   climbing back is judged on WORK done per frame, never on the gap -- a healthy
//             60Hz phone sits at a 16.7ms gap by definition, so a gap threshold
//             could never tell 'fast' from 'just vsynced' and would strand a good
//             phone in LOW forever after one rough patch.
// Two climbs, then it accepts LOW as the truth about this device and stops trying.
let _pn=0,_pt=0,_pw=0,_ups=0;
// One throw inside update() or draw() used to end the game permanently: the rAF was
// re-armed on the LAST line, so an exception skipped it, the loop never ran again, the
// last painted frame stayed on screen and the music -- a plain HTMLAudioElement, nothing
// to do with rAF -- kept playing. That is exactly the iPhone freeze of 2026-08-27: bugs
// stopped mid-screen, the bee vanished, the background stopped animating, the song went
// on. Re-arm in a finally so the loop can never be killed, and keep the first error so a
// phone with no console attached can still say what happened.
let FRAMEERR=null,_errN=0;
function frame(now){const dt=now-last,_w0=performance.now();
 try{
  acc+=Math.min(100,dt);last=now;padTick();
  while(acc>=STEP){acc-=STEP;
   if(hitstop>0&&state==='play'&&!paused){hitstop--;continue;}   // the world holds its breath
   if(slowmo>0&&state==='play'&&!paused){slowmo--;if(slowmo&1)continue;}   // half speed for a beat
   if(resumeCountdown>0){resumeCountdown--;if(resumeCountdown===0)paused=false;t++;}
   else if(state==='play'&&!paused)update();else t++;}
  if(holdBtn&&!cardOpen&&state!=='play'&&t-holdT>=HOLD_FRAMES){cardOpen=holdBtn;click(900,.02);}   // a held title button opens its card
  musicTick();ambTick();draw();
  if(!shownOnce){shownOnce=true;nativeReady();}
  if(state==='play'&&!paused&&dt>0&&dt<200){_pt+=dt;_pw+=performance.now()-_w0;
   if(++_pn>=120||(LOW&&!LOW3&&_pn>=30)){const gap=_pt/_pn,work=_pw/_pn;_pn=0;_pt=0;_pw=0;
    if(!LOW&&gap>21){setLow(true);say('DETAIL LOWERED FOR THIS PHONE');}
    else if(LOW&&!LOW2&&gap>45){setLow2(true);say('LOWEST DETAIL FOR THIS PHONE');}   // 30-frame window: at 5 fps, 120 frames is 24 s of misery
    else if(LOW2&&!LOW3&&gap>40){setLow3(true);say('BARE-BONES MODE FOR THIS PHONE');}
    else if(LOW3&&work<6&&gap<26&&_ups<2){_ups++;setLow3(false);say('LOWEST DETAIL');}
    else if(LOW2&&!LOW3&&work<6&&gap<22&&_ups<2){_ups++;setLow2(false);say('LOW DETAIL');}
    else if(LOW&&!LOW2&&work<4&&gap<17.5&&_ups<2){_ups++;setLow(false);say('FULL DETAIL');}}}
 }catch(e){
  _errN++;
  if(!FRAMEERR){FRAMEERR=((e&&e.message)||String(e))+' | '+((e&&e.stack||'').split('\n')[1]||'').trim();
   try{console.error('[hive-strike] frame error:',e);}catch(_){}}
  // the frame that threw left the canvas mid-state; put it back so the next one draws clean
  try{X.setTransform(DPR,0,0,DPR,0,0);X.globalAlpha=1;X.filter='none';
      X.globalCompositeOperation='source-over';}catch(_){}
 }finally{requestAnimationFrame(frame);}
 // a phone in your hand has no console. Print it small at the bottom so it can be read out.
 if(FRAMEERR){try{X.save();X.setTransform(DPR,0,0,DPR,0,0);X.globalAlpha=1;
  X.fillStyle='rgba(0,0,0,.72)';X.fillRect(0,H-30,W,30);X.fillStyle='#ff8a8a';
  X.font='9px '+FONT;X.textAlign='left';
  X.fillText(('x'+_errN+' '+FRAMEERR).slice(0,88),5,H-18);
  X.fillText('screenshot this and send it to Matt',5,H-7);X.restore();}catch(_){}}
}
requestAnimationFrame(frame);
addEventListener('error',e=>{if(!FRAMEERR)FRAMEERR='load: '+(e.message||e.type)+' '+((e.filename||'').split('/').pop()||'')+':'+(e.lineno||0);});
