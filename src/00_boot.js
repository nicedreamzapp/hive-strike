const C=document.getElementById('c');let X=C.getContext('2d');const W=480,H=720;
// RS is the raster scale: how many device pixels the 480x720 play field actually gets.
// It is NOT devicePixelRatio. On a 12.9" iPad the field is letterboxed up to 1821x2732
// device px, so a DPR-sized 960x1440 backing store was being stretched 1.9x and every
// sprite, every bug, the whole game looked soft. On a phone the opposite happened and it
// rendered ~10% MORE pixels than the screen could show. fit() sets this from the real box.
// LOW is cheap-phone mode. A 480x720 field rendered at full device pixels, plus a live
// canvas blur under every sprite, costs an iPhone nothing and murders a budget Android:
// Skia does not GPU-accelerate ctx.filter blur, so each blurred draw is a fresh offscreen
// layer. LOW caps the raster and drops the blurs. It turns itself on after a slow couple
// of seconds of real play and remembers the answer for next launch.
// LOW2 is the floor under LOW, for 2018-class budget chips (measured 2026-09-02 on a MediaTek
// MT6765 burner: 5 fps in LOW with 11 bugs on screen). It renders at 1.0 raster and draws every
// embossed sprite in one direct pass -- no offscreen rim/gloss/shadow passes, which were the
// whole cost (5 -> 12.5 fps on the frozen frame). hs_low: '0' full, '1' LOW, '2' LOW2.
// LOW3 is bare bones under LOW2 (Matt, 2026-09-02, still glitchy on the burner): 0.85 raster,
// no glows (rg returns a flat body colour and drops transparent-edged glows), no enemy-shot
// trails, no bee aura, at most 40 particles drawn.
let LOW=false,LOW2=false,LOW3=false; try{const v=localStorage.hs_low;LOW=v==='1'||v==='2'||v==='3';LOW2=v==='2'||v==='3';LOW3=v==='3';}catch(e){}
const RASTER_MAX=()=>LOW3?0.85:LOW2?1:LOW?1.25:4;
function lowSave(){try{localStorage.hs_low=LOW3?'3':LOW2?'2':LOW?'1':'0';}catch(e){}}
function setLow(v){if(LOW===v&&!(LOW2&&!v))return;LOW=v;if(!v){LOW2=false;LOW3=false;}lowSave();fit();}
function setLow2(v){if(LOW2===v&&!(LOW3&&!v))return;LOW2=v;if(v)LOW=true;else LOW3=false;lowSave();fit();}
function setLow3(v){if(LOW3===v)return;LOW3=v;if(v){LOW=true;LOW2=true;}lowSave();fit();}
// In any LOW mode a blurred canvas shadow becomes a 1px hard one. Measured 2026-09-16 on the
// MT6765 burner in LOW3: the blur passes alone held play at ~30 fps; hard shadows ran ~38-40
// and the text stays readable over the busy backgrounds. Nothing in src sets shadowOffset,
// so the setter owns it. On the prototype because offscreen sprite canvases draw text too.
{const P=CanvasRenderingContext2D.prototype,sb=Object.getOwnPropertyDescriptor(P,'shadowBlur');
 if(sb&&sb.set)Object.defineProperty(P,'shadowBlur',{configurable:true,get(){return sb.get.call(this);},
  set(v){if(LOW&&v>0){sb.set.call(this,0);this.shadowOffsetX=this.shadowOffsetY=1;}
   else{sb.set.call(this,v);if(this.shadowOffsetX)this.shadowOffsetX=this.shadowOffsetY=0;}}});}
let DPR=Math.min(3,window.devicePixelRatio||1);
C.width=W*DPR;C.height=H*DPR;C.style.width=W+'px';C.style.height=H+'px';X.setTransform(DPR,0,0,DPR,0,0);
const FONT='"Avenir Next Condensed","Futura","Arial Narrow","Helvetica Neue",sans-serif';
// stamped by tools/assemble.py from the version in package.json and the git commit --
// never edit by hand. It is how you tell at a glance whether the phone in your hand is
// running the same build as the one next to it.
const BUILD='dev';
// The play field is a fixed 2:3 portrait box. In a wide or square window -- an unfolded iPhone Duo,
// an iPad in landscape, Split View, a Stage Manager window -- that leaves big flat bars beside it.
// The backdrop fills them with a soft, dim, live echo of the field itself (the current world's art
// and light), so the bars read as part of the scene. It is a 30x45 copy of the canvas, refreshed
// every 6th frame; CSS stretches and blurs it, so it costs one tiny drawImage. Off in LOW2/LOW3
// and whenever the bars are thin (fit() decides).
const BD=document.createElement('canvas');BD.id='bd';BD.width=30;BD.height=45;BD.setAttribute('aria-hidden','true');
BD.style.cssText='position:fixed;left:-8%;top:-8%;width:116%;height:116%;object-fit:cover;'+
 'filter:blur(26px) brightness(.5) saturate(1.15);z-index:0;pointer-events:none;display:none;'+
 'max-width:none;max-height:none;aspect-ratio:auto;background:none;box-shadow:none';   // undo the page's canvas{} rule
document.body.insertBefore(BD,C);C.style.position='relative';C.style.zIndex='1';
const BDX=BD.getContext('2d');let bdOn=false,bdN=0;
function backdropTick(){if(!bdOn||(++bdN)%6)return;try{BDX.drawImage(C,0,0,BD.width,BD.height);}catch(e){}}
// letterbox the play field inside whatever the device actually gives us, safe-area padding
// already removed by the body. visualViewport is the honest number on iOS -- except for height
// under a keyboard. A keyboard only ever makes the visual viewport SHORTER than the layout
// viewport, and the play field must never shrink for one. Worse, WebKit can leave it short for
// good: Apple's own sign-in alert (UNLOCK, not signed in) brings up a keyboard, and after Cancel
// visualViewport.height stayed 636 on a 956pt iPhone while innerHeight was back to 956, so the
// whole game sat at 2/3 size until the next fold or rotation (iOS 27, 2026-10-07). So: never
// take a height smaller than the layout viewport's.
function fit(){const cs=getComputedStyle(document.body),
 px=(parseFloat(cs.paddingLeft)||0)+(parseFloat(cs.paddingRight)||0),
 py=(parseFloat(cs.paddingTop)||0)+(parseFloat(cs.paddingBottom)||0),
 vv=window.visualViewport,
 aw=Math.max(1,(vv?vv.width:innerWidth)-px), ah=Math.max(1,(vv?Math.max(vv.height,innerHeight):innerHeight)-py),
 sc=Math.min(aw/W,ah/H);
 C.style.width=Math.round(W*sc)+'px';C.style.height=Math.round(H*sc)+'px';
 // the backdrop earns its keep only when the bars beside/above the field are real space
 bdOn=!LOW2&&((aw-W*sc)>aw*.12||(ah-H*sc)>ah*.12);BD.style.display=bdOn?'block':'none';
 // render exactly the pixels this screen will show -- no upscale on a tablet, no waste
 // on a phone. Capped at 4 so a huge display cannot blow the memory budget.
 const want=Math.max(LOW3?0.85:1,Math.min(RASTER_MAX(),+(sc*(window.devicePixelRatio||1)).toFixed(3)));
 if(Math.abs(want-DPR)>0.01||C.width!==Math.round(W*want)){
  DPR=want;C.width=Math.round(W*DPR);C.height=Math.round(H*DPR);
  X.setTransform(DPR,0,0,DPR,0,0);
  rasterReset();                       // every cached surface was built at the old scale
 }}
// Re-fit whenever the WINDOW changes size, never on what the device says its orientation is:
// on a foldable (iPhone Duo), in iPad Split View and in a Stage Manager window the size changes
// with no rotation at all, and a live drag fires dozens of these -- coalesce to one fit a frame.
let fitQ=0;const fitSoon=()=>{if(!fitQ)fitQ=requestAnimationFrame(()=>{fitQ=0;fit();});};
addEventListener('resize',fitSoon);
if(window.visualViewport)visualViewport.addEventListener('resize',fitSoon);
if(window.ResizeObserver)new ResizeObserver(fitSoon).observe(document.documentElement);
// a system sheet (purchase, sign-in) can change the viewport without a resize reaching us;
// measure again whenever the page gets the screen back
addEventListener('focus',fitSoon);addEventListener('pageshow',fitSoon);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)fitSoon();});
fit();
const keys={};addEventListener('keydown',e=>{keys[e.code]=1;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.code==='KeyP')paused=!paused;if(e.code==='Escape'&&state==='play'){if(paused)quitToHome();else paused=true;}if(e.code==='KeyL'){setLow(!LOW);say('DETAIL '+(LOW?'LOW':'FULL'));}if(e.code==='Minus'){VOL=Math.max(0,+(VOL-.05).toFixed(2));localStorage.hs_vol=VOL;applyVol();say('VOLUME '+Math.round(VOL*100)+'%');}if(e.code==='Equal'){VOL=Math.min(1,+(VOL+.05).toFixed(2));localStorage.hs_vol=VOL;applyVol();say('VOLUME '+Math.round(VOL*100)+'%');}if(e.code==='KeyN')musicToggle();if(e.code==='KeyM')sfxToggle();if(dexOpen){if(e.code==='Escape'||e.code==='KeyD')dexOpen=false;else if(e.code==='ArrowLeft')dexPage(-1);else if(e.code==='ArrowRight')dexPage(1);else if(e.code==='Enter'||e.code==='Space')dexPick=null;return;}
 if(state!=='play'&&e.code==='KeyD'){dexOpen=true;return;}
 if(state!=='play'){if(e.code==='ArrowLeft')pickStage(startStage-1);if(e.code==='ArrowRight')pickStage(startStage+1);if(/^Digit[1-8]$/.test(e.code))pickStage(+e.code.slice(5));}
if(state!=='play'&&(e.code==='Enter'||e.code==='Space')){if(state==='won')continueGame();else if(!armed){arm();}else start();}});
addEventListener('keyup',e=>keys[e.code]=0);
let touch=null,target=null,lastMove=0;
let touchMode=(navigator.maxTouchPoints||0)>0&&matchMedia('(pointer:coarse)').matches;
const TOUCH_LIFT=86;   // a thumb is opaque. keep the bee above it.
function ptr(e){const r=C.getBoundingClientRect();const isT=e.pointerType==='touch';if(isT&&!touchMode)touchMode=true;
 return {x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height-(isT?TOUCH_LIFT:0)};}
// on-screen controls, only drawn once a finger has actually been used
const TBTN={bomb:{x:W-64,y:H-124,w:54,h:54},pause:{x:W-40,y:4,w:34,h:22}};
const PBTN={resume:{x:W/2-90,y:H/2+22,w:180,h:40},quit:{x:W/2-90,y:H/2+74,w:180,h:40}};   // the pause menu
// title-screen level sliders: Matt tunes the mix himself instead of waiting on a rebuild
// they live in the settings sheet now (gear button, bottom right of the title screen)
const BARS={mus:{x:150,y:H-168,w:200,h:14},sfx:{x:150,y:H-122,w:200,h:14}};
// One place that knows where every HUD box is, so the pause button can never be
// parked on top of the bomb count again. tools/hud_overlap.mjs asserts they are disjoint.
const pauseGap=()=>(touchMode&&state==='play')?TBTN.pause.w+10:0;
const HUDR={
 lives:()=>({x:4,y:4,w:26+Math.min(5,Math.max(1,P.lives))*22+(P.lives>5?24:0),h:22}),
 bombs:()=>{const n=Math.min(4,Math.max(1,P.bombs)),sh=pauseGap(),ex=(P.bombs>4?24:0);return {x:W-12-n*18-8-sh-ex,y:4,w:n*18+16+ex,h:22};},
 music:()=>BTN.music, sfx:()=>BTN.sfx,
 pause:()=>(touchMode&&state==='play')?TBTN.pause:null,
 bomb :()=>(touchMode&&state==='play')?TBTN.bomb :null,
};
const barHit=(p,b)=>p.x>=b.x-8&&p.x<=b.x+b.w+8&&p.y>=b.y-9&&p.y<=b.y+b.h+9;
const barVal=(p,b)=>Math.max(0,Math.min(1,(p.x-b.x)/b.w));
C.addEventListener('pointermove',e=>{target=ptr(e);lastMove=t;});
const BTN={music:{x:W/2-46,y:4,w:40,h:22},sfx:{x:W/2+6,y:4,w:40,h:22}};const inBtn=(p,b)=>p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h;
// title screen, redone 2026-09-02 (Matt: chips covered the title, nothing readable, art buried):
// art up top, a 4x4 world grid in the middle, ONE row of four big buttons under it, a gear.
// Tap a button = do it. HOLD a button = a full-screen card in big letters saying what it is.
const CBTN={play:{x:160,y:652,w:160,h:38},help:{x:20,y:652,w:110,h:38},dex:{x:350,y:652,w:110,h:38},gear:{x:W-44,y:14,w:32,h:32}};
const DBTN=CBTN.dex;
let holdBtn=null,holdT=0,cardOpen=null,settingsOpen=false;const HOLD_FRAMES=22;
function firstHelp(){try{if(localStorage.hs_seen_help)return false;localStorage.hs_seen_help='1';}catch(e){return false;}cardOpen='help';return true;}
C.addEventListener('pointerdown',e=>{const isT=e.pointerType==='touch',p=ptr(e),raw={x:p.x,y:p.y+(isT?TOUCH_LIFT:0)};
 audioWake();
 if(inBtn(raw,BTN.music)){musicToggle();return;}
 if(inBtn(raw,BTN.sfx)){sfxToggle();return;}
 if(state==='play'&&paused){if(inBtn(raw,PBTN.quit)){quitToHome();click(900,.02);return;}if(inBtn(raw,PBTN.resume)){paused=false;return;}}
 if(isT&&state==='play'){
  if(inBtn(raw,TBTN.pause)){if(resumeCountdown>0){resumeCountdown=0;paused=false;}else paused=!paused;return;}
  if(inBtn(raw,TBTN.bomb)){wantBomb=1;return;}
  if(paused||resumeCountdown>0){resumeCountdown=0;paused=false;return;}
 }
 if(state!=='play'&&payOpen){if(payHit(raw))return;if(!locked()){payOpen=false;}return;}
 if(state!=='play'&&settingsOpen&&!dexOpen){
  if(barHit(raw,BARS.mus)){setMusLv(barVal(raw,BARS.mus));say('MUSIC '+Math.round(MUSLV*100)+'%');return;}
  if(barHit(raw,BARS.sfx)){setSfxLv(barVal(raw,BARS.sfx));click(1400,.02);say('EFFECTS '+Math.round(SFXLV*100)+'%');return;}
  if(inBtn(raw,SBTN.music)){musicToggle();return;}
  if(inBtn(raw,SBTN.sfx)){sfxToggle();return;}
  settingsOpen=false;click(900,.02);return;   // tap anywhere else closes the sheet
 }
 target=p;lastMove=t;
 if(dexOpen){dexTap(raw);return;}
 if(state!=='play'){
  if(cardOpen){const was=cardOpen;cardOpen=null;holdBtn=null;if(was==='contract'){const k=contractCardHit(raw);if(k>=0){contractIx=k;localStorage.hs_contract=k;click(1200,.02);}}else click(900,.02);return;}
  if(inBtn(raw,CBTN.gear)){settingsOpen=true;click(1200,.02);return;}
  if(trialBtnShown()&&inBtn(raw,TRIALB)){payOpen=true;click(1200,.02);return;}   // the in-app purchase, reachable from launch (see 22_store.js)
  for(const k of ['help','dex']){if(inBtn(raw,CBTN[k])){holdBtn=k;holdT=t;return;}}
  if(!armed)arm();
  for(let i=0;i<16;i++){if(inBtn(raw,WCHIP(i))){const again=startStage===i+1&&i+1<=unlocked;pickStage(i+1);if(again){if(firstHelp())return;start();}return;}}   // tap picks a world, tapping it again flies
  if(inBtn(raw,CBTN.play)){playOrResume();return;}
  if(state==='won'){continueGame();return;}
  playOrResume();return;}
 // a finger landing is how you MOVE on a phone -- only a mouse click means "bomb"
 if(!isT)wantBomb=1;});
// quick tap = do the button's thing; a held press already opened its card (see frame()), so do nothing
C.addEventListener('pointerup',e=>{if(!holdBtn)return;const k=holdBtn;holdBtn=null;if(cardOpen||state==='play')return;
 if(k==='daily'){if(!armed)arm();if(firstHelp())return;wantDaily=true;start();}
 else if(k==='contract'){contractIx=(contractIx+1)%CONTRACTS.length;localStorage.hs_contract=contractIx;const c=CONTRACTS[contractIx];say(c.label+'  \u00b7  '+c.terms+(c.mult!==1?'  \u00b7  SCORE x'+c.mult:''));click(1200,.02);}
 else if(k==='help'){cardOpen='help';click(1200,.02);}
 else if(k==='dex'){dexOpen=true;click(1200,.02);}});
C.addEventListener('pointercancel',()=>{holdBtn=null;});
addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('gesturestart',e=>e.preventDefault());
document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});
C.addEventListener('pointerleave',()=>target=null);

