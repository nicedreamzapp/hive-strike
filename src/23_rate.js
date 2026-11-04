// ---------- rating prompt ----------
// Asks the store's own rating sheet (StoreKit on iPhone/iPad, Play In-App Review on Android)
// right after a boss goes down, on the LEVEL CLEAR card, never during a fight. Rules:
// not before the 3rd boss win on this device, at most once every 60 days, no pre-screen of our
// own (Apple 5.6.1). The OS may still decide not to show it; that is its call, not ours.
const RATE_MIN_WINS=3, RATE_GAP_MS=60*24*3600*1000;
function rateNative(){try{const C=window.Capacitor;return !!(C&&C.isNativePlatform&&C.isNativePlatform()&&C.Plugins&&C.Plugins.InAppReview);}catch(e){return false;}}
function rateOnBossWin(){
 let n=0;try{n=(+localStorage.hs_rate_wins||0)+1;localStorage.hs_rate_wins=n;}catch(e){return;}
 if(n<RATE_MIN_WINS||!rateNative())return;
 const last=+localStorage.hs_rate_last||0;if(last&&Date.now()-last<RATE_GAP_MS)return;
 // let the BOSS DEFEATED card land first; only ask if we are still on that card
 setTimeout(()=>{
  if(state!=='play'||levelClear<=0||bossAlive||paused||collapse>0)return;
  try{localStorage.hs_rate_last=Date.now();window.Capacitor.Plugins.InAppReview.requestReview().catch(()=>{});console.log('[hs-rate] asked after boss win '+n);}catch(e){}
 },1400);
}
