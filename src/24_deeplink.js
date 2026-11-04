// ---------- deep links ----------
// hivestrike://event/black-friday (the App Store in-app event "Black Friday Bug Hunt") and any other
// hivestrike:// link open the title screen with the world grid. A run in progress is checkpointed
// by quitToHome() first, so RESUME still works. Cards and the Bug-Dex close; the paywall stays
// if the trial is over (a link never unlocks anything).
function deepLink(url){
 try{
  const u=String(url||'');if(!/^hivestrike:/i.test(u))return;
  console.log('[hs-link] '+u);
  if(state==='play')quitToHome();
  else if(state==='won'){state='title';music('title');}
  dexOpen=false;cardOpen=null;settingsOpen=false;holdBtn=null;
  if(!locked())payOpen=false;
  if(/event\/black-friday/i.test(u))say('BLACK FRIDAY BUG HUNT  ·  PICK YOUR WORLD');
 }catch(e){}
}
(function linkInit(){
 const go=()=>{try{const A=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.App;if(!A)return;
  A.addListener('appUrlOpen',e=>deepLink(e&&e.url));
  if(A.getLaunchUrl)A.getLaunchUrl().then(r=>{if(r&&r.url)deepLink(r.url);}).catch(()=>{});}catch(e){}};
 if(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform())go();
})();
