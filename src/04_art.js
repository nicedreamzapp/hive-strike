// ---------- painted art: art/level1..6.png (one per world) + art/splash.png. STATIC — the background never moves.
// A decoded 832x1248 background is 4.2 MB of RGBA however small the file is, and all
// seventeen were resident: 67 MB to hold sixteen pictures nobody was looking at, since the
// video replaces them anyway. Same sliding window as the clips. releaseArt also drops the
// mip pyramid and the blurred depth-of-field copy hung off each image -- neither was ever freed.
const ART={},ARTWIN=1;
function artLoad(k){if(ART[k]!==undefined)return;ART[k]=null;const im=new Image();
 im.onload=()=>{ART[k]=im;};im.onerror=()=>{if(!im._freed){ART[k]=null;missing('art/'+k+'.png');}};im.src='art/'+k+'.png';}
function artRelease(k){const im=ART[k];if(im){im._freed=1;im.src='';if(im._mips)im._mips.length=0;im.dof=null;}delete ART[k];}
function artSync(){const c=(stage-1)%NL+1,want=new Set(['splash']);
 for(let d=0;d<=ARTWIN;d++){want.add('level'+((c-1+d)%NL+1));want.add('level'+((c-1-d+NL*2)%NL+1));}
 for(const k of want)artLoad(k);
 for(const k in ART)if(!want.has(k))artRelease(k);}
artLoad('splash');
// rendered level loops: when art/clip/levelN.mp4 exists it replaces the still, and the scene animates
// for real instead of being faked with canvas warps. only the level being played is decoding.
const MASKNUMS=[2,3,6,7,10,12,13,14,15,16],MASKS={};
function maskLoad(n){if(MASKNUMS.indexOf(n)<0||MASKS[n]!==undefined)return;MASKS[n]=null;
 const im=new Image();im.onload=()=>{MASKS[n]=im;};im.onerror=()=>{if(!im._freed){MASKS[n]=null;missing('art/mask'+n+'.png');}};im.src='art/mask'+n+'.png';}
function maskSync(){const c=(stage-1)%NL+1,want=new Set();
 for(let d=0;d<=ARTWIN;d++){want.add((c-1+d)%NL+1);want.add((c-1-d+NL*2)%NL+1);}
 for(const n of want)maskLoad(n);
 for(const k in MASKS){const n=+k;if(!want.has(n)){const im=MASKS[n];if(im){im._freed=1;im.src='';if(im._mips)im._mips.length=0;}delete MASKS[n];}}}
// backgrounds are ~3MB of h264 each. buffering all 16 at boot cost 53MB of decode memory and a
// slow first frame for 15 clips nobody was watching. keep a sliding window around the live level.
const VID={},VIDEL={},VIDWIN=1;
function vidEl(n){let v=VIDEL[n];if(v)return v;v=document.createElement('video');v.muted=true;v.defaultMuted=true;v.loop=true;v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');v.setAttribute('muted','');v.preload='auto';
 const ready=()=>{VID['level'+n]=v;};
 v.addEventListener('loadeddata',ready);v.addEventListener('canplay',ready);
 v.addEventListener('error',()=>{v.bad=true;delete VID['level'+n];});v.src='art/clip/level'+n+'.mp4';VIDEL[n]=v;return v;}
function vidRelease(n){const v=VIDEL[n];if(!v)return;try{v.pause();v.removeAttribute('src');v.load();}catch(e){}delete VIDEL[n];delete VID['level'+n];}
function vidSync(){artSync();maskSync();bossSprSync();const c=(stage-1)%NL+1,want=new Set();for(let d=0;d<=VIDWIN;d++){want.add((c-1+d)%NL+1);want.add((c-1-d+NL*2)%NL+1);}for(const n of want)vidEl(n);for(const k in VIDEL)if(!want.has(+k))vidRelease(+k);}
// iOS will not buffer a video until something calls play(), so gating play() on
// canplay -- which only fires once buffered -- deadlocked: the clip never loaded,
// VID stayed empty, and every level fell back to its still. Drive VIDEL instead:
// ask the live clip to play unconditionally and promote it the moment it has data.
function vidTick(){vidSync();const cur=(stage-1)%NL+1;
 for(const j in VIDEL){const n=+j,v=VIDEL[n],key='level'+n;
  if(n===cur){
   if(v.readyState>=2&&!VID[key])VID[key]=v;
   if(v.paused&&!v.bad&&!document.hidden&&!paused)v.play().catch(()=>{});
  } else if(!v.paused)v.pause();}}
const SPLASHV=document.createElement('video');SPLASHV.muted=true;SPLASHV.defaultMuted=true;SPLASHV.loop=true;SPLASHV.playsInline=true;SPLASHV.setAttribute('playsinline','');SPLASHV.setAttribute('webkit-playsinline','');SPLASHV.setAttribute('muted','');SPLASHV.preload='auto';SPLASHV.ok=false;SPLASHV.addEventListener('loadeddata',()=>{SPLASHV.ok=true;});SPLASHV.addEventListener('canplay',()=>{SPLASHV.ok=true;});SPLASHV.addEventListener('error',()=>{SPLASHV.bad=true;SPLASHV.ok=false;});SPLASHV.src='art/clip/splash.mp4';
function splashFrame(){
 if(!SPLASHV.bad&&SPLASHV.paused&&!document.hidden)SPLASHV.play().catch(()=>{});   // same deadlock as the levels
 if(SPLASHV.readyState>=2)return SPLASHV;
 return ART.splash;}
const SPR={},MISSING=[];
// A 768px boss sprite is 2.4 MB decoded. All sixteen were resident for the one actually
// fighting you. Keep the current world's boss and its neighbours; drop the rest.
function bossSprLoad(i){const k='boss'+i;if(SPR[k]!==undefined)return;SPR[k]=null;
 const im=new Image();im.onload=()=>{SPR[k]=im;};im.onerror=()=>{if(!im._freed){SPR[k]=null;missing('art/sprites/'+k+'.png');}};im.src='art/sprites/'+k+'.png';}
function bossSprSync(){const want=new Set();
 for(let d=0;d<=ARTWIN;d++){want.add(THEMES[((stage-1)%NL+d)%NL].boss);want.add(THEMES[((stage-1)%NL-d+NL*2)%NL].boss);}
 for(const i of want)bossSprLoad(i);
 for(const k in SPR){const m=/^boss(\d+)$/.exec(k);
  if(m&&!want.has(+m[1])){const im=SPR[k];if(im){im._freed=1;im.src='';if(im._mips)im._mips.length=0;}delete SPR[k];}}}
function missing(path){MISSING.push(path);console.warn('[hive-strike] asset missing:',path);}
function loadSprites(){const names=Object.keys(ET).concat(['centihead1','centiseg1']);for(const k of names){const im=new Image();im.onload=()=>{SPR[k]=im;};im.onerror=()=>missing('art/sprites/'+k+'.png');im.src='art/sprites/'+k+'.png';}}
// sprites are ~800px tall and get drawn at 35-80px. drawImage has no mipmaps, so that 12-25x
// downscale shimmered every frame as the bug moved. halve the source until it is close to the
// drawn size, cache each step, and the final draw is never worse than a 2x reduction.
function mip(im,h){const need=h*DPR*1.4;if(!im.height||im.height<need*2)return im;
 if(!im._mips)im._mips=[im];let cur=im._mips[im._mips.length-1];
 while(cur.height>need*2&&cur.height>2){const c=document.createElement('canvas');c.width=Math.max(1,cur.width>>1);c.height=Math.max(1,cur.height>>1);const g=c.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(cur,0,0,c.width,c.height);im._mips.push(c);cur=c;}
 for(let i=im._mips.length-1;i>=0;i--)if(im._mips[i].height>=need)return im._mips[i];
 return im._mips[0];}
function drawSprite(im,h,rot=0){const m=mip(im,h),sc=h/m.height,w=m.width*sc;X.save();X.rotate(rot);X.drawImage(m,-w/2,-h/2,w,h);X.restore();}
function drawArt(im,alpha=1,soft=false){const iw=im.videoWidth||im.width,ih=im.videoHeight||im.height,sc=Math.max(W/iw,H/ih),w=iw*sc,h=ih*sc;let src=im,sx=(W-w)/2,sy=(H-h)/2,sw=w,sh=h;if(soft&&!im.videoWidth){const bz=1+.014*(.5+.5*Math.sin(t*.006));if(!im.dof){const c=document.createElement('canvas');c.width=W*DPR;c.height=H*DPR;const g=c.getContext('2d');g.setTransform(DPR,0,0,DPR,0,0);g.filter='blur(1.6px) saturate(.92)';g.drawImage(im,sx,sy,w,h);im.dof=c;}src=im.dof;sx=-(W*bz-W)/2;sy=-(H*bz-H)/2;sw=W*bz;sh=H*bz;}X.globalAlpha=alpha;X.drawImage(src,sx,sy,sw,sh);X.globalAlpha=1;}
