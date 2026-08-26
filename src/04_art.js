// ---------- painted art: art/level1..6.png (one per world) + art/splash.png. STATIC — the background never moves.
const ART={};for(const k of Array.from({length:16},(_,i)=>'level'+(i+1)).concat(['splash'])){const im=new Image();im.onload=()=>{ART[k]=im;};im.onerror=()=>missing('art/'+k+'.png');im.src='art/'+k+'.png';}
// rendered level loops: when art/clip/levelN.mp4 exists it replaces the still, and the scene animates
// for real instead of being faked with canvas warps. only the level being played is decoding.
const MASKS={};for(const n of [2,3,6,7,10,12,13,14,15,16]){const im=new Image();im.onload=()=>{MASKS[n]=im;};im.onerror=()=>missing('art/mask'+n+'.png');im.src='art/mask'+n+'.png';}
// backgrounds are ~3MB of h264 each. buffering all 16 at boot cost 53MB of decode memory and a
// slow first frame for 15 clips nobody was watching. keep a sliding window around the live level.
const VID={},VIDEL={},VIDWIN=1;
function vidEl(n){let v=VIDEL[n];if(v)return v;v=document.createElement('video');v.muted=true;v.defaultMuted=true;v.loop=true;v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');v.preload='auto';v.addEventListener('canplay',()=>{VID['level'+n]=v;},{once:true});v.addEventListener('error',()=>{v.bad=true;delete VID['level'+n];});v.src='art/clip/level'+n+'.mp4';VIDEL[n]=v;return v;}
function vidRelease(n){const v=VIDEL[n];if(!v)return;try{v.pause();v.removeAttribute('src');v.load();}catch(e){}delete VIDEL[n];delete VID['level'+n];}
function vidSync(){const c=(stage-1)%NL+1,want=new Set();for(let d=0;d<=VIDWIN;d++){want.add((c-1+d)%NL+1);want.add((c-1-d+NL*2)%NL+1);}for(const n of want)vidEl(n);for(const k in VIDEL)if(!want.has(+k))vidRelease(+k);}
function vidTick(){vidSync();const k='level'+((stage-1)%NL+1);for(const j in VID){const v=VID[j];if(j===k){if(v.paused&&!document.hidden&&!paused)v.play().catch(()=>{});}else if(!v.paused)v.pause();}}
const SPLASHV=document.createElement('video');SPLASHV.src='art/clip/splash.mp4';SPLASHV.muted=true;SPLASHV.loop=true;SPLASHV.playsInline=true;SPLASHV.preload='auto';SPLASHV.ok=false;SPLASHV.addEventListener('canplay',()=>{SPLASHV.ok=true;});SPLASHV.addEventListener('error',()=>{SPLASHV.ok=false;});
function splashFrame(){if(SPLASHV.ok&&SPLASHV.readyState>=2){if(SPLASHV.paused)SPLASHV.play().catch(()=>{});return SPLASHV;}return ART.splash;}
const SPR={},MISSING=[];
function missing(path){MISSING.push(path);console.warn('[hive-strike] asset missing:',path);}
function loadSprites(){const names=Object.keys(ET).concat(Array.from({length:16},(_,i)=>'boss'+i)).concat(['centihead1','centiseg1']);for(const k of names){const im=new Image();im.onload=()=>{SPR[k]=im;};im.onerror=()=>missing('art/sprites/'+k+'.png');im.src='art/sprites/'+k+'.png';}}
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
