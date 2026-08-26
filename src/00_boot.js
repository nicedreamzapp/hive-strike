const C=document.getElementById('c');let X=C.getContext('2d');const W=480,H=720;
const DPR=Math.min(3,window.devicePixelRatio||1);C.width=W*DPR;C.height=H*DPR;C.style.width=W+'px';C.style.height=H+'px';X.setTransform(DPR,0,0,DPR,0,0);
const FONT='"Avenir Next Condensed","Futura","Arial Narrow","Helvetica Neue",sans-serif';
// letterbox the play field inside whatever the device actually gives us, safe-area padding
// already removed by the body. visualViewport is the honest number on iOS.
function fit(){const cs=getComputedStyle(document.body),
 px=(parseFloat(cs.paddingLeft)||0)+(parseFloat(cs.paddingRight)||0),
 py=(parseFloat(cs.paddingTop)||0)+(parseFloat(cs.paddingBottom)||0),
 vv=window.visualViewport,
 aw=Math.max(1,(vv?vv.width:innerWidth)-px), ah=Math.max(1,(vv?vv.height:innerHeight)-py),
 sc=Math.min(aw/W,ah/H);
 C.style.width=Math.round(W*sc)+'px';C.style.height=Math.round(H*sc)+'px';}
addEventListener('resize',fit);addEventListener('orientationchange',()=>setTimeout(fit,120));
if(window.visualViewport)visualViewport.addEventListener('resize',fit);
fit();
const keys={};addEventListener('keydown',e=>{keys[e.code]=1;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.code==='KeyP')paused=!paused;if(e.code==='Minus'){VOL=Math.max(0,+(VOL-.05).toFixed(2));localStorage.hs_vol=VOL;say('VOLUME '+Math.round(VOL*100)+'%');}if(e.code==='Equal'){VOL=Math.min(1,+(VOL+.05).toFixed(2));localStorage.hs_vol=VOL;say('VOLUME '+Math.round(VOL*100)+'%');}if(e.code==='KeyN')musicToggle();if(e.code==='KeyM'){VOL=VOL?0:.55;localStorage.hs_vol=VOL;say(VOL?'SOUND ON':'MUTED');}if(state!=='play'){if(e.code==='ArrowLeft')pickStage(startStage-1);if(e.code==='ArrowRight')pickStage(startStage+1);if(/^Digit[1-8]$/.test(e.code))pickStage(+e.code.slice(5));}
if(state!=='play'&&(e.code==='Enter'||e.code==='Space')){if(state==='won')continueGame();else if(!armed){arm();}else start();}});
addEventListener('keyup',e=>keys[e.code]=0);
let touch=null,target=null,lastMove=0;
let touchMode=(navigator.maxTouchPoints||0)>0&&matchMedia('(pointer:coarse)').matches;
const TOUCH_LIFT=86;   // a thumb is opaque. keep the bee above it.
function ptr(e){const r=C.getBoundingClientRect();const isT=e.pointerType==='touch';if(isT&&!touchMode)touchMode=true;
 return {x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height-(isT?TOUCH_LIFT:0)};}
// on-screen controls, only drawn once a finger has actually been used
const TBTN={bomb:{x:W-64,y:H-124,w:54,h:54},pause:{x:W-40,y:4,w:34,h:22}};
C.addEventListener('pointermove',e=>{target=ptr(e);lastMove=t;});
const BTN={music:{x:W/2-46,y:4,w:40,h:22},sfx:{x:W/2+6,y:4,w:40,h:22}};const inBtn=(p,b)=>p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h;
C.addEventListener('pointerdown',e=>{const isT=e.pointerType==='touch',p=ptr(e),raw={x:p.x,y:p.y+(isT?TOUCH_LIFT:0)};
 audioWake();
 if(inBtn(raw,BTN.music)){musicToggle();return;}
 if(inBtn(raw,BTN.sfx)){VOL=VOL?0:.55;localStorage.hs_vol=VOL;say(VOL?'SOUND ON':'MUTED');return;}
 if(isT&&state==='play'){
  if(inBtn(raw,TBTN.pause)){if(resumeCountdown>0){resumeCountdown=0;paused=false;}else paused=!paused;return;}
  if(inBtn(raw,TBTN.bomb)){wantBomb=1;return;}
  if(paused||resumeCountdown>0){resumeCountdown=0;paused=false;return;}
 }
 target=p;lastMove=t;
 if(state!=='play'){for(let i=0;i<16;i++){if(inBtn(raw,TILE(i))){pickStage(i+1);if(!armed)arm();return;}}if(state==='won')continueGame();else if(!armed)arm();else start();return;}
 // a finger landing is how you MOVE on a phone -- only a mouse click means "bomb"
 if(!isT)wantBomb=1;});
addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('gesturestart',e=>e.preventDefault());
document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});
C.addEventListener('pointerleave',()=>target=null);

