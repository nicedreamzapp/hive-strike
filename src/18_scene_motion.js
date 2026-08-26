// ---------- moving the picture itself ----------
// the background is a photograph, so overlays alone will never make it move. these take a snapshot
// of the frame and redraw the part of it that should be alive one thin strip at a time, each strip
// pushed on its own wave. that is what makes the water ripple, the trees sway and the lava run.
let _WB=null;
function snap(){if(!_WB){_WB=document.createElement('canvas');_WB.width=W*DPR;_WB.height=H*DPR;_WB.g=_WB.getContext('2d');}
 if(_WB.t===t&&_WB.p===palB)return _WB;_WB.t=t;_WB.p=palB;
 _WB.g.setTransform(1,0,0,1,0,0);_WB.g.clearRect(0,0,_WB.width,_WB.height);_WB.g.drawImage(C,0,0);return _WB;}
// water: sliding whole rows just made the picture sway. real ripples are LOCAL -- so the surface is
// cut into a grid and each cell rides a wave whose phase steps along both axes, which makes crests
// travel across and toward you. amplitude grows with nearness, the way a real surface reads.
function ripple(y0,y1,amp,sp,rows=30,cols=14){const src=snap(),top=H*y0,hh=(H*y1-top)/rows,cw=W/cols,d=DPR;
 for(let i=0;i<rows;i++){const y=top+i*hh,f=.22+(i/rows)*.95;
  for(let c=0;c<cols;c++){const x=c*cw,ph=t*sp-i*.85+c*.38;
   const dx=(Math.sin(ph)+Math.sin(ph*.63+c*.5)*.55)*amp*f;
   const dy=Math.cos(ph*1.15)*amp*.32*f;
   X.drawImage(src,x*d,y*d,(cw+2)*d,(hh+1)*d,x+dx,y+dy,cw+2,hh+1);}}}
// breeze: the old sway slid whole rows, which moved the distant hills along with the branches and
// read as camera wobble. this splits each strip into columns too, so a gust travels across the frame
// and one tree can be moving while the next is still -- leaves rustling, not the picture sliding.
function breeze(y0,y1,amp,sp,rows=26,cols=12,topAnchored=false){const src=snap(),top=H*y0,hh=(H*y1-top)/rows,cw=W/cols,d=DPR;
 for(let i=0;i<rows;i++){const y=top+i*hh,f=topAnchored?i/rows:1-i/rows;
  for(let c=0;c<cols;c++){const x=c*cw;
   const dx=(Math.sin(t*sp+c*.55+f*1.9)+Math.sin(t*sp*.57+c*.9)*.5+Math.sin(t*sp*.23+c*.31)*.7)*amp*f*f;
   X.drawImage(src,x*d,y*d,(cw+2)*d,(hh+1)*d,x+dx,y,cw+2,hh+1);}}}
function hangSway(y0,y1,amp,sp,rows=30){const src=snap(),top=H*y0,hh=(H*y1-top)/rows,d=DPR;
 for(let i=0;i<rows;i++){const y=top+i*hh,f=i/rows;
  const dx=(Math.sin(t*sp+f*1.8)+Math.sin(t*sp*.47+f*3.1)*.45)*amp*f*f;
  X.drawImage(src,0,y*d,W*d,(hh+1)*d,dx,y,W,hh+1);}}
// flowing texture: the strip is sampled from a little upstream of where it is drawn, so the surface
// travels. two phases crossfade into each other so the hand-over never shows as a seam.
function flowChannel(clip,y0,y1,sp,amp,rows=40){const src=snap(),top=H*y0,bh=H*y1-top,hh=bh/rows,d=DPR;
 const A=hh*2,o1=((t*sp)%A+A)%A,o2=(o1+A/2)%A;
 X.save();clip();
 for(const ph of [o1,o2]){const a=1-Math.abs(ph/A-.5)*2;if(a<=0)continue;X.globalAlpha=a;
  for(let i=0;i<rows;i++){const dy=top+i*hh,sy=Math.max(0,Math.min(H-hh-1,dy-(sp<0?-ph:ph)));
   const dx=Math.sin(t*.05+i*.5)*amp;
   X.drawImage(src,0,sy*d,W*d,(hh+1)*d,dx,dy,W,hh+1);}}
 X.globalAlpha=1;X.restore();}
// masked pulse: brightens and dims the real lit pixels of the picture (windows, car lights, glowing
// honey) on their own clocks. these are the photograph's own lights, not rectangles drawn on top.
function maskedPulse(mask,cells,speed,depth){if(!mask)return;
 if(!_MB){_MB=document.createElement('canvas');_MB.width=W*DPR;_MB.height=H*DPR;_MB.g=_MB.getContext('2d');}
 const g=_MB.g;g.setTransform(DPR,0,0,DPR,0,0);g.globalCompositeOperation='source-over';g.clearRect(0,0,W,H);
 g.drawImage(mask,0,0,W,H);
 g.globalCompositeOperation='source-atop';
 const cw=W/cells,ch=H/cells;
 for(let cx=0;cx<cells;cx++)for(let cy=0;cy<cells;cy++){
  const a=Math.max(0,Math.sin(t*speed+cx*2.3+cy*1.7)*.5+Math.sin(t*speed*.41+cx*1.1)*.5);
  g.globalAlpha=a*depth;g.fillStyle='#fff9e0';g.fillRect(cx*cw,cy*ch,cw+1,ch+1);}
 g.globalAlpha=1;g.globalCompositeOperation='source-over';
 X.globalCompositeOperation='lighter';X.drawImage(_MB,0,0,_MB.width,_MB.height,0,0,W,H);
 X.globalCompositeOperation='source-over';}
// masked ripple: the wave grid is applied to a copy of the frame and then cut to the traced water
// shape, so ONLY the water moves -- rocks, ice slabs, banks and reeds stay exactly where they are.
function maskedRipple(mask,y0,y1,amp,sp,rows,cols){if(!mask)return;
 if(!_MB){_MB=document.createElement('canvas');_MB.width=W*DPR;_MB.height=H*DPR;_MB.g=_MB.getContext('2d');}
 const g=_MB.g;g.setTransform(DPR,0,0,DPR,0,0);g.globalCompositeOperation='source-over';g.clearRect(0,0,W,H);
 const _X=X;X=g;ripple(y0,y1,amp,sp,rows,cols);X=_X;
 g.globalCompositeOperation='destination-in';g.drawImage(mask,0,0,W,H);g.globalCompositeOperation='source-over';
 X.drawImage(_MB,0,0,_MB.width,_MB.height,0,0,W,H);}
// masked flow: the molten texture is scrolled along the crack THROUGH a mask traced off the picture,
// so the lava moves but the crack itself never shifts. displacing the crack is what made it swivel.
let _MB=null;
function maskedFlow(mask,sp,alpha,travel){if(!mask)return;
 if(!_MB){_MB=document.createElement('canvas');_MB.width=W*DPR;_MB.height=H*DPR;_MB.g=_MB.getContext('2d');}
 const g=_MB.g,src=snap(),A=travel,o1=((t*sp)%A+A)%A,o2=(o1+A/2)%A;
 g.setTransform(DPR,0,0,DPR,0,0);g.globalCompositeOperation='source-over';g.clearRect(0,0,W,H);
 for(const ph of [o1,o2]){const a=1-Math.abs(ph/A-.5)*2;if(a<=0)continue;g.globalAlpha=a;
  g.drawImage(src,0,0,src.width,src.height,0,ph,W,H);}
 g.globalAlpha=1;g.globalCompositeOperation='destination-in';g.drawImage(mask,0,0,W,H);
 g.globalCompositeOperation='source-over';
 X.globalAlpha=alpha;X.drawImage(_MB,0,0,_MB.width,_MB.height,0,0,W,H);X.globalAlpha=1;}
// glow flow: a copy of the level art crushed down to just its BRIGHT parts (multiply it into itself
// twice and everything dark falls to black). sliding that copy additively makes only the lit thing
// move -- the lava in its crack, the light in the chasm -- while the rock around it stays put.
const _GM={};
function glowMask(){let m=_GM[palB];if(m!==undefined)return m;
 const a=ART['level'+(palB+1)];if(!a)return _GM[palB]=null;
 m=document.createElement('canvas');m.width=W*DPR;m.height=H*DPR;const g=m.getContext('2d');
 g.setTransform(DPR,0,0,DPR,0,0);const _X=X;X=g;
 try{drawArt(a,1,false);g.globalCompositeOperation='multiply';drawArt(a,1,false);drawArt(a,1,false);
  g.globalCompositeOperation='source-over';}catch(e){X=_X;return _GM[palB]=null;}
 X=_X;return _GM[palB]=m;}
function glowFlow(sp,alpha,y0=0,y1=1){const m=glowMask();if(!m)return;
 const A=44,o1=((t*sp)%A+A)%A,o2=(o1+A/2)%A;
 X.save();X.beginPath();X.rect(0,H*y0,W,H*(y1-y0));X.clip();X.globalCompositeOperation='lighter';
 for(const ph of [o1,o2]){const a=(1-Math.abs(ph/A-.5)*2)*alpha;if(a<=0)continue;X.globalAlpha=a;
  X.drawImage(m,0,0,m.width,m.height,0,(sp<0?-ph:ph),W,H);}
 X.globalCompositeOperation='source-over';X.globalAlpha=1;X.restore();}
// region shapes traced off the pictures, so an effect only touches the thing it belongs to
function poly(pts){return()=>{X.beginPath();for(const q of pts)X.lineTo(q[0]*W,q[1]*H);X.closePath();X.clip();};}
const TIDEWATER=poly([[.28,-.02],[1.04,-.02],[1.04,.40],[.60,.58],[.34,.30]]);
// channel shapes traced off the actual pictures so the flow stays inside the crack / the stream bed
function chan(pts,w0,w1){return()=>{X.beginPath();
 for(let i=0;i<pts.length;i++){const f=i/(pts.length-1),hw=(w0+(w1-w0)*f)*W;X.lineTo(pts[i][0]*W+hw,pts[i][1]*H);}
 for(let i=pts.length-1;i>=0;i--){const f=i/(pts.length-1),hw=(w0+(w1-w0)*f)*W;X.lineTo(pts[i][0]*W-hw,pts[i][1]*H);}
 X.closePath();X.clip();};}
const LAVACHAN=chan([[.52,.26],[.46,.40],[.38,.55],[.32,.70],[.30,.84],[.35,1.02]],.018,.055);
const CAVESTREAM=chan([[.50,.54],[.47,.66],[.44,.78],[.42,.90],[.44,1.02]],.02,.05);
const CRYSTALBEAM=chan([[.50,.04],[.50,.24],[.50,.44],[.50,.62]],.07,.12);
// particle beds are built once per kind, then just keep moving
const BEDS={};
function bed(key,n,make){return BEDS[key]||(BEDS[key]=Array.from({length:n},(_,i)=>make(i)));}
// wind-borne litter: leaves, petals, seeds. drifts sideways and off the edge so it never reads as something to dodge
function windLitter(key,n,cols,size,dir){const p=bed(key,n,i=>({x:R(-40,W+40),y:R(-40,H+40),g:R(0,7),vs:R(.5,1.5),ph:R(0,7),c:cols[i%cols.length],s:R(.7,1.3)}));
 for(const b of p){b.x+=dir*b.vs*1.4;b.y+=Math.sin(t*.02+b.ph)*.45+.2;b.g+=.018*b.vs;
  if(dir>0&&b.x>W+40){b.x=-40;b.y=R(-30,H);}if(dir<0&&b.x<-40){b.x=W+40;b.y=R(-30,H);}if(b.y>H+40)b.y=-40;
  X.save();X.translate(b.x,b.y);X.rotate(b.g);X.globalAlpha=.45;X.fillStyle=b.c;X.beginPath();X.moveTo(0,-size*b.s);X.quadraticCurveTo(size*.72*b.s,0,0,size*b.s);X.quadraticCurveTo(-size*.72*b.s,0,0,-size*b.s);X.fill();X.restore();}X.globalAlpha=1;}
// water: long highlights that slide along the surface and breathe, not points that blink
function waterShimmer(key,col,alpha,n,y0=.12,y1=1,x0=0,x1=1){const p=bed(key,n,i=>({y:R(H*y0,H*y1),w:R(50,150),x:R(W*x0,W*x1),sp:R(.2,.75)*(i%2?1:-1),ph:R(0,7)}));
 X.globalCompositeOperation='lighter';
 for(const b of p){b.x+=b.sp;if(b.x>W+b.w)b.x=-b.w;if(b.x<-b.w)b.x=W+b.w;const a=(Math.sin(t*.05+b.ph)+1)/2;
  X.globalAlpha=alpha*(.3+a*.7);X.fillStyle=col;X.filter='blur(3px)';ell(b.x,b.y+Math.sin(t*.03+b.ph)*4,b.w*(.7+a*.3),2.2);X.fill();X.filter='none';}
 X.globalCompositeOperation='source-over';X.globalAlpha=1;}
function bubbles(key,n,col){const p=bed(key,n,()=>({x:R(0,W),y:R(0,H),vy:R(.3,.9),s:R(1,3),ph:R(0,7)}));
 for(const b of p){b.y-=b.vy;b.x+=Math.sin(t*.04+b.ph)*.4;if(b.y<-6){b.y=H+6;b.x=R(0,W);}X.globalAlpha=.2;X.strokeStyle=col;X.lineWidth=1;ell(b.x,b.y,b.s,b.s);X.stroke();}X.globalAlpha=1;}
// the tide rolling in and back out
function waveWash(){X.globalCompositeOperation='lighter';const y=H*(.60+Math.sin(t*.012)*.07);X.globalAlpha=.09+Math.sin(t*.012)*.05;X.fillStyle='#eaffff';X.filter='blur(10px)';ell(W/2,y,W*.72,11);X.fill();X.filter='none';X.globalCompositeOperation='source-over';X.globalAlpha=1;}
// embers lifting off the crack on the heat
function emberLift(){const e=bed('ember',14,()=>({x:W*R(.28,.55),y:R(0,H),vy:R(.5,1.4),ph:R(0,7),s:R(.7,1.6)}));
 X.globalCompositeOperation='lighter';
 for(const b of e){b.y-=b.vy;b.x+=Math.sin(t*.03+b.ph)*.6;if(b.y<-10){b.y=H+10;b.x=W*R(.28,.55);}
  const a=Math.max(0,.9-b.y/H);X.globalAlpha=.25+a*.4;X.fillStyle='#ffb040';ell(b.x,b.y,b.s,b.s);X.fill();}
 X.globalCompositeOperation='source-over';X.globalAlpha=1;heatHaze('rgba(255,120,40,.5)',.04);}
function heatHaze(col,alpha){X.globalCompositeOperation='lighter';X.filter='blur(9px)';for(let i=0;i<4;i++){X.globalAlpha=alpha;X.fillStyle=col;ell(W/2+Math.sin(t*.03+i*2)*40,H*(.55+i*.11)+Math.sin(t*.05+i)*5,W*.55,7);X.fill();}X.filter='none';X.globalCompositeOperation='source-over';X.globalAlpha=1;}
function blowingSnow(key,n,sp){const p=bed(key,n,()=>({x:R(0,W),y:R(0,H),vy:R(.4,1.2),vx:R(.8,2.4),ph:R(0,7),s:R(1,2.8),d:R(0,1)}));
 for(const b of p){b.x+=b.vx*sp;b.y+=b.vy*sp*.5+Math.sin(t*.05+b.ph)*.3;if(b.x>W+10){b.x=-10;b.y=R(0,H);}if(b.y>H+10)b.y=-10;
  // near flakes read bright, far ones read as cold blue-grey so they show up against the ice
  X.globalAlpha=.35+b.d*.4;X.fillStyle=b.d>.5?'#ffffff':'#9fb8d8';ell(b.x,b.y,b.s,b.s);X.fill();
  X.globalAlpha=(.35+b.d*.4)*.35;X.strokeStyle='#7f9ec4';X.lineWidth=1;X.beginPath();X.moveTo(b.x,b.y);X.lineTo(b.x-b.vx*4*sp,b.y-b.vy*2*sp);X.stroke();}X.globalAlpha=1;}
// low ground-drift: sheets of snow sliding across the surface, the thing you actually see on open ice
function groundDrift(key,n,col){const p=bed(key,n,()=>({x:R(-200,W),y:R(H*.45,H),w:R(90,220),vx:R(1.2,3),a:R(.05,.13)}));
 for(const b of p){b.x+=b.vx;if(b.x-b.w>W){b.x=-b.w;b.y=R(H*.45,H);}X.globalAlpha=b.a;X.fillStyle=col;X.filter='blur(7px)';ell(b.x,b.y+Math.sin(t*.03+b.w)*3,b.w,4);X.fill();X.filter='none';}X.globalAlpha=1;}
function blowingSand(){const p=bed('sand',8,()=>({x:R(0,W),y:R(H*.45,H),len:R(18,52),vx:R(1.6,3.4),a:R(.05,.12),w:R(.8,1.5)}));
 for(const b of p){b.x+=b.vx;b.y+=Math.sin(t*.04+b.len)*.25;if(b.x-b.len>W){b.x=-b.len;b.y=R(H*.38,H);}
  X.globalAlpha=b.a;X.strokeStyle='#ffe6b0';X.lineWidth=b.w;X.lineCap='round';X.beginPath();X.moveTo(b.x,b.y);X.lineTo(b.x-b.len,b.y+2);X.stroke();}
 X.lineCap='butt';groundDrift('sanddrift',2,'#ffe0a8');X.globalAlpha=1;}
// water falling from the roof of the cave, and the ring it leaves when it hits the pool below
let RIPPLES=[];
function caveDrips(){const p=bed('drip',13,()=>({x:R(W*.24,W*.76),y:R(-320,0),vy:R(1.8,3.4),w:R(.7,1.3),land:H*R(.74,.92)}));
 for(const b of p){b.y+=b.vy;b.vy+=.03;
  if(b.y>=b.land){RIPPLES.push({x:b.x,y:b.land,r:2});b.y=R(-340,-40);b.vy=R(1.8,3.4);b.x=R(W*.24,W*.76);b.land=H*R(.74,.92);}
  X.globalAlpha=.42;X.fillStyle='#cdefff';ell(b.x,b.y,b.w,b.w*3.6);X.fill();}
 for(let i=RIPPLES.length-1;i>=0;i--){const r=RIPPLES[i];r.r+=.9;X.globalAlpha=Math.max(0,.4-r.r/60);X.strokeStyle='#cdefff';X.lineWidth=1.2;ell(r.x,r.y,r.r,r.r*.3);X.stroke();if(r.r>26)RIPPLES.splice(i,1);}
 X.globalAlpha=1;}
function honeyDrips(){const p=bed('hny',3,()=>({x:R(20,W-20),y:R(-320,-20),vy:R(.5,1.2),w:R(2,4)}));
 for(const b of p){b.y+=b.vy;b.vy+=.012;if(b.y>H+20){b.y=R(-360,-40);b.vy=R(.5,1.2);b.x=R(20,W-20);}
  X.globalAlpha=.45;X.fillStyle='#ffcf5a';X.beginPath();X.moveTo(b.x,b.y-b.w*3);X.quadraticCurveTo(b.x+b.w*1.6,b.y+b.w,b.x,b.y+b.w*2.2);X.quadraticCurveTo(b.x-b.w*1.6,b.y+b.w,b.x,b.y-b.w*3);X.fill();
  X.globalAlpha=.22;X.fillStyle='#fff0b0';ell(b.x-b.w*.4,b.y,b.w*.4,b.w);X.fill();}X.globalAlpha=1;}
// fireflies that actually wander around instead of blinking in one spot
function fireflies(key,n,col){const p=bed(key,n,()=>({x:R(0,W),y:R(0,H),ph:R(0,7),vx:R(-.4,.4),vy:R(-.3,.3),s:R(.9,1.8)}));
 X.globalCompositeOperation='lighter';
 for(const b of p){b.vx=clamp(b.vx+R(-.03,.03),-.6,.6);b.vy=clamp(b.vy+R(-.03,.03),-.5,.5);b.x+=b.vx;b.y+=b.vy;
  if(b.x<0)b.x=W;if(b.x>W)b.x=0;if(b.y<0)b.y=H;if(b.y>H)b.y=0;
  const a=Math.max(0,Math.sin(t*.05+b.ph));X.globalAlpha=a*.75;X.fillStyle=col;ell(b.x,b.y,b.s,b.s);X.fill();X.globalAlpha=a*.15;ell(b.x,b.y,b.s*6,b.s*6);X.fill();}
 X.globalCompositeOperation='source-over';X.globalAlpha=1;}
// sun through the trees, swaying the way light does when the branches move
function sunShafts(col,alpha,sway){X.globalCompositeOperation='lighter';X.globalAlpha=alpha;X.fillStyle=col;X.filter='blur(18px)';
 for(let i=0;i<3;i++){X.save();X.translate(300+i*90+Math.sin(t*.006+i)*sway,0);X.rotate(.35+Math.sin(t*.004+i)*.03);X.fillRect(-20,-200,40+i*10,H*2);X.restore();}
 X.filter='none';X.globalCompositeOperation='source-over';X.globalAlpha=1;}
function glowPool(x,y,r,col,a){X.globalCompositeOperation='lighter';X.globalAlpha=a;X.fillStyle=rg(x,y,r,col,col.replace(/[\d.]+\)$/,'0)'));ell(x,y,r,r*1.1);X.fill();X.globalCompositeOperation='source-over';X.globalAlpha=1;}
// the city waking up: windows on their own clocks, headlights running the street
function cityNight(){
 // apartment windows waking up and going dark again, only on the buildings down either side
 const wnd=bed('wnd',40,i=>{const left=i%2===0;return{x:left?R(W*.02,W*.33):R(W*.67,W*.98),y:R(H*.10,H*.66),w:R(3,7),h:R(4,10),on:Math.random()<.45,ft:RI(40,420),c:['#ffd27a','#ffe9b0','#cfe4ff'][RI(0,2)]};});
 for(const b of wnd){if(--b.ft<=0){b.on=!b.on;b.ft=RI(110,560);}if(!b.on)continue;
  X.globalAlpha=.55;X.fillStyle=b.c;X.fillRect(b.x,b.y,b.w,b.h);X.globalAlpha=.12;X.filter='blur(4px)';X.fillRect(b.x-3,b.y-3,b.w+6,b.h+6);X.filter='none';}
 // headlights coming up the street out of the vanishing point, growing as they get close
 const car=bed('car',8,i=>({p:R(0,1),sp:R(.0025,.0065),lane:(i%2?1:-1)*R(.05,.16),c:i%2?'#fff4cc':'#ff8a6a'}));
 X.globalCompositeOperation='lighter';
 for(const b of car){b.p+=b.sp;if(b.p>1)b.p=0;
  const e=b.p*b.p,y=H*.42+H*.52*e,x=W*.5+W*b.lane*e*3.4,sz=1.6+e*7;
  X.globalAlpha=.20+e*.45;X.fillStyle=b.c;X.filter='blur(2px)';ell(x-sz*.9,y,sz,sz*.5);X.fill();ell(x+sz*.9,y,sz,sz*.5);X.fill();
  X.globalAlpha=(.10+e*.18);ell(x,y+sz,sz*3.4,sz*.9);X.fill();X.filter='none';}
 // a couple of street lamps buzzing on and off down the block
 const lamp=bed('lamp',4,i=>({x:W*(i%2?.22:.78),y:H*(.34+i*.07),ft:RI(60,300),on:true}));
 for(const b of lamp){if(--b.ft<=0){b.on=!b.on;b.ft=b.on?RI(300,900):RI(6,26);}if(!b.on)continue;
  X.globalAlpha=.13;X.fillStyle=rg(b.x,b.y,34,'rgba(255,225,150,.9)','rgba(255,225,150,0)');ell(b.x,b.y,34,34);X.fill();}
 X.globalCompositeOperation='source-over';X.globalAlpha=1;}
// light travelling down through the crystal, and glints sliding with it
function crystalSweep(){X.globalCompositeOperation='lighter';const y=(t*.6)%(H+400)-200;
 X.globalAlpha=.10;X.fillStyle=rg(W/2,y,300,'rgba(190,130,255,.9)','rgba(190,130,255,0)');ell(W/2,y,300,120);X.fill();
 const p=bed('glint',16,()=>({x:R(0,W),y:R(0,H),ph:R(0,7),vy:R(.15,.5),s:R(1,2.4)}));
 for(const b of p){b.y+=b.vy;if(b.y>H+10){b.y=-10;b.x=R(0,W);}const a=Math.max(0,Math.sin(t*.04+b.ph));
  X.globalAlpha=a*.65;X.fillStyle=b.s>1.7?'#d8b0ff':'#a0f0ff';X.beginPath();X.moveTo(b.x,b.y-4-b.s);X.lineTo(b.x+1.4,b.y);X.lineTo(b.x,b.y+4+b.s);X.lineTo(b.x-1.4,b.y);X.closePath();X.fill();}
 X.globalCompositeOperation='source-over';X.globalAlpha=1;}
// a few things that only belong to one picture
function fountain(){ // L2: the fountain in the middle of the garden
 const p=bed('fnt',22,()=>({x:W*.5+R(-11,11),y:H*R(.36,.40),vy:R(.6,1.6),s:R(.8,1.8)}));
 X.globalCompositeOperation='lighter';
 for(const b of p){b.y+=b.vy;b.vy+=.05;if(b.y>H*.455){b.y=H*R(.355,.375);b.vy=R(.4,1.2);b.x=W*.5+R(-11,11);}
  X.globalAlpha=.5;X.fillStyle='#eaf6ff';ell(b.x,b.y,b.s*.6,b.s*1.5);X.fill();}
 X.globalAlpha=.10+Math.sin(t*.07)*.04;X.fillStyle='#dff2ff';X.filter='blur(4px)';ell(W*.5,H*.45,26,5);X.fill();X.filter='none';
 X.globalCompositeOperation='source-over';X.globalAlpha=1;}
function fallingFruit(){ // L4: apples letting go of the orchard trees
 const p=bed('apl',4,i=>({x:i%2?R(W*.06,W*.24):R(W*.76,W*.94),y:R(-H*.4,H*.2),vy:R(1.4,2.6),r:R(2.4,4),done:0}));
 for(const b of p){b.y+=b.vy;b.vy+=.09;if(b.y>H*.86){b.y=-R(20,H*.35);b.vy=R(1.2,2.2);b.x=b.x<W*.5?R(W*.06,W*.24):R(W*.76,W*.94);}
  X.globalAlpha=.85;X.fillStyle=rg(b.x,b.y,b.r,'#ff7060','#8a0a00');ell(b.x,b.y,b.r,b.r);X.fill();}X.globalAlpha=1;}
function glowCaps(){ // L5: the bioluminescent mushrooms breathing along the forest floor
 const p=bed('cap',11,()=>({x:R(W*.04,W*.96),y:H*R(.74,.94),r:R(7,15),ph:R(0,7)}));
 X.globalCompositeOperation='lighter';
 for(const b of p){const a=.10+(Math.sin(t*.035+b.ph)+1)/2*.16;X.globalAlpha=a;
  X.fillStyle=rg(b.x,b.y,b.r*2.4,'rgba(150,200,255,.9)','rgba(150,200,255,0)');ell(b.x,b.y,b.r*2.4,b.r*1.6);X.fill();}
 X.globalCompositeOperation='source-over';X.globalAlpha=1;}
function combRun(){ // L6: honey running down the comb walls on both sides
 const p=bed('run',4,i=>({x:i%2?R(W*.02,W*.22):R(W*.78,W*.98),y:R(-H*.3,H),len:R(14,40),vy:R(.35,.9)}));
 for(const b of p){b.y+=b.vy;if(b.y-b.len>H){b.y=-R(10,H*.3);b.x=b.x<W*.5?R(W*.02,W*.22):R(W*.78,W*.98);}
  X.globalAlpha=.35;X.strokeStyle='#ffd25a';X.lineWidth=2.2;X.lineCap='round';X.beginPath();X.moveTo(b.x,b.y-b.len);X.lineTo(b.x,b.y);X.stroke();
  X.globalAlpha=.5;X.fillStyle='#ffe89a';ell(b.x,b.y,1.8,2.6);X.fill();}
 X.lineCap='butt';X.globalAlpha=1;}
function sunBloom(x,y,r,col,a){X.globalCompositeOperation='lighter';X.globalAlpha=a;X.fillStyle=rg(x,y,r,col,col.replace(/[\d.]+\)$/,'0)'));ell(x,y,r,r);X.fill();X.globalCompositeOperation='source-over';X.globalAlpha=1;}
function ambient(k,name){X.save();const pulse=.5+Math.sin(t*.02)*.5;
 switch(name){
  // big tree across the top, hive swinging under a branch, wildflower meadow rolling away below
  case 'THE MEADOW':
   breeze(0,.38,4.2,.022);breeze(.48,1,3.4,.030);break;
  // hedges, topiary and roses around a stone fountain
  case 'THE GARDEN':
   breeze(0,.32,2.6,.021);breeze(.58,1,2.4,.026);
   maskedFlow(MASKS[2],1.7,1,22);maskedRipple(MASKS[2],.34,.52,2.2,.09,20,14);break;
  // a still channel of water with reeds down both banks and lilies on the surface
  case 'THE POND':
   breeze(0,.36,1.7,.022);maskedRipple(MASKS[3],.16,1.02,2.2,.05,30,16);break;
  // two rows of apple trees, grass lane down the middle, windfalls on the ground
  case 'THE ORCHARD':
   breeze(0,.54,2.4,.017);breeze(.58,1,1.4,.03);break;
  // moonlit pines, a web strung between them, glowing mushrooms on the floor
  case 'THE NIGHT WOOD':
   breeze(0,.62,2.4,.013);hangSway(.28,.56,1.8,.02);break;
  // inside the comb: honey running the walls, light pouring up the corridor
  case 'THE HIVE':
   maskedFlow(MASKS[6],.9,.95,44);break;
  // drowned forest: standing water below, mist walking through the trunks
  case 'THE SWAMP':
   breeze(0,.44,1.4,.015);maskedRipple(MASKS[7],.48,1.02,1.8,.035,26,14);break;
  // wind-carved dunes, sand streaming off the crests, heat standing over the horizon
  case 'THE DUNES':
   breeze(.34,1,3,.022,32,18);breeze(.10,.34,1.2,.012,14,10);break;
  // rainforest: vines hanging from the canopy, light coming down in shafts
  case 'THE CANOPY':
   breeze(0,.7,3.2,.017,28,14,true);breeze(.70,1,1.8,.023);break;
  // a stream running out of the dark down the floor of the cave
  case 'THE CAVE':
   maskedRipple(MASKS[10],.52,1.02,2.6,.055,28,16);maskedFlow(MASKS[10],1.1,.9,34);break;
  // high meadow under snow peaks: daisies and grass moving, cloud crossing the slope
  case 'THE ALPINE':
   breeze(.38,1,2.2,.021,28,14);breeze(0,.30,.9,.010,14,10);break;
  // surf at the top of the frame, the wash running up the wet sand
  case 'THE TIDE POOL':
   maskedRipple(MASKS[12],0,.62,2.4,.06,28,16);break;
  // a lava crack running down the cracked plain, embers coming off it
  case 'THE VOLCANO':
   maskedFlow(MASKS[13],1.5,1,52);emberLift();
   sunBloom(W*.5,H*.10,150,'rgba(255,180,90,.9)',.06+pulse*.04);break;
  // meltwater between the ice floes
  case 'THE TUNDRA':
   maskedRipple(MASKS[14],.30,1.02,3.2,.045,30,16);breeze(.30,1,1.2,.008,20,12);break;
  // the street at dusk: windows coming on down both sides, traffic climbing out of the vanishing point
  case 'THE ROOFTOPS':
   maskedFlow(MASKS[15],.9,.8,26);maskedPulse(MASKS[15],7,.035,.55);break;
  // the light column in the chasm, water on the floor of it
  case 'THE CRYSTAL':
   maskedRipple(MASKS[16],.55,1.02,2.4,.032,26,14);break;
  default:
   breeze(0,.42,2,.018);breeze(.55,1,1.4,.024);
 }
 X.restore();}
let ringsFx=[];
function ring(x,y,c,max=60){ringsFx.push({x,y,c,r:4,max});}
const _boom=boom;boom=function(x,y,c,n=12,sp=4){_boom(x,y,c,n,sp);ring(x,y,c,n>30?120:50);};
function worldHazard(){
 const name=LV().name;
 if(name==='THE VOLCANO'&&t%Math.max(26,70-((stage-1)%NL)*2)===0){
  const x=R(20,W-20);ebullets.push({x,y:-14,vx:R(-.4,.4),vy:2.1+D()*1.3,r:7,col:'#ff9030',t:0,kind:'ember'});}
 if(name==='THE CRYSTAL'&&t%Math.max(30,90-((stage-1)%NL)*2)===0){
  const x=R(20,W-20);ebullets.push({x,y:-14,vx:0,vy:2.4+D()*1.2,r:7,col:'#c9a0ff',t:0,kind:'dart'});}
 if(name==='THE NIGHT WOOD'&&t%Math.max(40,110-((stage-1)%NL)*2)===0){
  const x=R(20,W-20);ebullets.push({x,y:-14,vx:R(-.6,.6),vy:1.7+D(),r:6,col:'#cfe0ff',t:0,kind:'drop'});}
}
function drawOverlays(){
 const v=X.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.45)');X.fillStyle=v;X.fillRect(0,0,W,H);
 if(bossIntro>0){bossIntro--;X.fillStyle=`rgba(40,0,0,${Math.sin(bossIntro/110*Math.PI)*.45})`;X.fillRect(0,0,W,H);}
 if(flash>0){X.fillStyle=`rgba(255,255,255,${flash*.7})`;X.fillRect(0,0,W,H);flash=Math.max(0,flash-.06);}
}
function panel(x,y,w,h,r=8){X.save();X.fillStyle='rgba(6,12,26,.17)';X.beginPath();X.roundRect(x,y,w,h,r);X.fill();X.strokeStyle='rgba(255,255,255,.14)';X.lineWidth=1;X.beginPath();X.roundRect(x+.5,y+.5,w-1,h-1,r);X.stroke();X.restore();}
function drawPickup(p){emboss(p.x,p.y,70,()=>{const pulse=1.35+Math.sin(p.t*.15)*.1;X.scale(pulse,pulse);X.rotate(Math.sin(p.t*.1)*.3);
  if(p.k==='nectar'){X.fillStyle=rg(0,0,12,'#ffe08a','#e08a00');X.beginPath();X.moveTo(0,-13);X.quadraticCurveTo(11,4,0,11);X.quadraticCurveTo(-11,4,0,-13);X.fill();X.fillStyle='#fffa';ell(-3,0,2.5,3.5);X.fill();}
  else if(p.k==='bomb'){X.fillStyle=rg(0,0,11,'#555','#000');ell(0,0,11,11);X.fill();X.fillStyle='#ffd166';X.font='bold 13px '+FONT;X.textAlign='center';X.fillText('S',0,5);}
  else if(p.k==='life'){X.fillStyle=rg(0,-2,12,'#ff8fa3','#c0002a');X.beginPath();X.moveTo(0,9);X.bezierCurveTo(-15,-4,-7,-15,0,-6);X.bezierCurveTo(7,-15,15,-4,0,9);X.fill();}
  else if(p.k==='honey'){X.fillStyle=rg(0,0,13,'#fff3b0','#ff9500');ell(0,0,13,13);X.fill();X.fillStyle='#7a3a00';for(let k=-2;k<=2;k++){X.save();X.rotate(k*.35);X.beginPath();X.moveTo(0,2);X.lineTo(-2.2,-4);X.lineTo(0,-11);X.lineTo(2.2,-4);X.closePath();X.fill();X.restore();}}
  else if(p.k==='stinger'){X.fillStyle=rg(0,0,13,'#f0d8ff','#8a2be2');ell(0,0,13,13);X.fill();X.fillStyle='#fff';X.beginPath();X.moveTo(2,-11);X.lineTo(-5,1);X.lineTo(0,1);X.lineTo(-2,11);X.lineTo(5,-2);X.lineTo(0,-2);X.closePath();X.fill();}
  else if(p.k==='pollen'){X.fillStyle=rg(0,0,13,'#ffe0f0','#ff2f8f');ell(0,0,13,13);X.fill();X.fillStyle='#fff';for(let k=0;k<6;k++){ell(Math.cos(k*1.047)*6,Math.sin(k*1.047)*6,3.2,2,k*1.047);X.fill();}X.fillStyle='#ffd23f';ell(0,0,2.5,2.5);X.fill();X.strokeStyle='#fff';X.lineWidth=1.2;X.beginPath();X.moveTo(-9,9);X.lineTo(-4,4);X.moveTo(9,9);X.lineTo(4,4);X.stroke();}
  else if(p.k==='water'){X.fillStyle=rg(0,0,13,'#fff0c0','#e07000');ell(0,0,13,13);X.fill();X.fillStyle='#fff8e0';X.beginPath();X.moveTo(0,-9);X.quadraticCurveTo(7,2,0,8);X.quadraticCurveTo(-7,2,0,-9);X.fill();X.fillStyle='#e07000';ell(-1.5,1,1.5,3);X.fill();}
  else if(p.k==='wax'){X.fillStyle=rg(0,0,13,'#fff2c0','#d08a10');ell(0,0,13,13);X.fill();X.fillStyle='#7a4a00';X.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3;X.lineTo(Math.cos(a)*8,Math.sin(a)*8);}X.closePath();X.fill();X.fillStyle='#ffd27a';X.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3;X.lineTo(Math.cos(a)*5,Math.sin(a)*5);}X.closePath();X.fill();}
  else if(p.k==='thorn'){X.fillStyle=rg(0,0,13,'#ffe8b0','#7a4a10');ell(0,0,13,13);X.fill();X.fillStyle='#3a2000';for(let k=-2;k<=2;k++){X.save();X.rotate(k*.4);X.beginPath();X.moveTo(0,2);X.lineTo(-2,-3);X.lineTo(0,-11);X.lineTo(2,-3);X.closePath();X.fill();X.restore();}}
  else if(p.k==='rain'){X.fillStyle=rg(0,0,13,'#fff4d0','#e09000');ell(0,0,13,13);X.fill();X.fillStyle='#7a4a00';for(const [a,c] of [[-6,-4],[0,-7],[6,-4],[-3,4],[4,5]]){X.beginPath();X.moveTo(a,c-4);X.quadraticCurveTo(a+2.5,c,a,c+3);X.quadraticCurveTo(a-2.5,c,a,c-4);X.fill();}}
  else if(p.k==='lure'){X.fillStyle=rg(0,0,13,'#ffe0f6','#d0208a');ell(0,0,13,13);X.fill();X.strokeStyle='#fff';X.lineWidth=1.5;ell(0,0,4,4);X.stroke();ell(0,0,8,8);X.stroke();X.fillStyle='#fff';ell(0,0,1.8,1.8);X.fill();}
  else if(p.k==='grenade'){X.fillStyle=rg(0,0,13,'#ffe0b0','#c05010');ell(0,0,13,13);X.fill();X.fillStyle='#5a2a00';X.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3;X.lineTo(Math.cos(a)*7,Math.sin(a)*7);}X.closePath();X.fill();X.strokeStyle='#fff';X.lineWidth=1.5;X.beginPath();X.moveTo(0,-8);X.quadraticCurveTo(4,-12,6,-9);X.stroke();}
  else if(p.k==='wall'){X.fillStyle=rg(0,0,13,'#fff0c8','#a06a10');ell(0,0,13,13);X.fill();X.fillStyle='#5a3a00';X.fillRect(-9,-3,18,6);X.fillStyle='#ffd070';for(let k=-6;k<=6;k+=6){ell(k,0,2,2);X.fill();}}
  else if(p.k==='lance'){X.fillStyle=rg(0,0,13,'#fff8d0','#e0a000');ell(0,0,13,13);X.fill();X.fillStyle='#7a4a00';X.beginPath();X.moveTo(0,-11);X.lineTo(3.5,-3);X.lineTo(1.5,10);X.lineTo(-1.5,10);X.lineTo(-3.5,-3);X.closePath();X.fill();X.fillStyle='#fff';X.beginPath();X.moveTo(0,-9);X.lineTo(1.5,-3);X.lineTo(-1.5,-3);X.closePath();X.fill();}
  else if(p.k==='drones'){X.fillStyle=rg(0,0,13,'#fff0c0','#e08a10');ell(0,0,13,13);X.fill();X.fillStyle='#1a1a1a';for(const [a,b2] of [[-5,-3],[5,-2],[0,5]]){ell(a,b2,3,2.2);X.fill();}X.fillStyle='#ffd23f';for(const [a,b2] of [[-5,-3],[5,-2],[0,5]]){ell(a,b2,1.2,2);X.fill();}X.strokeStyle='#fff';X.lineWidth=1;for(const [a,b2] of [[-5,-3],[5,-2],[0,5]]){X.beginPath();X.moveTo(a-3,b2-2);X.lineTo(a-6,b2-4);X.moveTo(a+3,b2-2);X.lineTo(a+6,b2-4);X.stroke();}}
  else if(p.k==='static'){X.fillStyle=rg(0,0,13,'#f0e0ff','#7a3ab0');ell(0,0,13,13);X.fill();X.fillStyle='#fff';X.beginPath();X.moveTo(2,-10);X.lineTo(-4,0);X.lineTo(0,0);X.lineTo(-2,9);X.lineTo(4,-1);X.lineTo(0,-1);X.closePath();X.fill();}
  else if(p.k==='saw'){X.fillStyle=rg(0,0,13,'#e8ffc0','#3a7a1a');ell(0,0,13,13);X.fill();X.fillStyle='#1a3a08';X.beginPath();for(let k=0;k<16;k++){const a=k*Math.PI/8,rr=k%2?9:6.5;X.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}X.closePath();X.fill();X.fillStyle='#8fd14f';ell(0,0,2.5,2.5);X.fill();}
  else if(p.k==='lash'){X.fillStyle=rg(0,0,13,'#ffffe0','#d0a000');ell(0,0,13,13);X.fill();X.strokeStyle='#7a5000';X.lineWidth=3;X.lineCap='round';X.beginPath();X.moveTo(-6,9);X.quadraticCurveTo(-8,-6,6,-8);X.stroke();X.strokeStyle='#fff';X.lineWidth=1.2;X.beginPath();X.moveTo(-6,9);X.quadraticCurveTo(-8,-6,6,-8);X.stroke();X.fillStyle='#fff';ell(6,-8,2.5,2.5);X.fill();}
  else{X.fillStyle=rg(0,0,13,'#fff4c8','#e08a10');ell(0,0,13,13);X.fill();X.fillStyle='#7a4a00';for(let k=0;k<6;k++){const a=k*Math.PI/3;X.save();X.translate(Math.cos(a)*6.5,Math.sin(a)*6.5);X.beginPath();for(let j=0;j<6;j++){const aa=j*Math.PI/3;X.lineTo(Math.cos(aa)*3.4,Math.sin(aa)*3.4);}X.closePath();X.fill();X.restore();}X.fillStyle='#fff';ell(0,0,3,3);X.fill();}},{alt:.8});
 X.save();X.strokeStyle='rgba(90,255,130,.95)';X.lineWidth=2.5;X.setLineDash([6,5]);X.lineDashOffset=-p.t*.6;ell(p.x,p.y,22,22);X.stroke();X.setLineDash([]);
 X.fillStyle=WEAPONS[p.k]?WEAPONS[p.k].col:'#c8ffd4';X.font='bold 11px '+FONT;X.textAlign='center';X.shadowColor='#000';X.shadowBlur=4;X.fillText(PLABEL[p.k],p.x,p.y+37);if(WEAPONS[p.k]){X.fillStyle='#fff';X.font='bold 9px '+FONT;X.fillText(P.wpn===p.k?'= LEVEL UP':'= SWITCH GUN (−1 Lv)',p.x,p.y+49);}X.restore();}
function draw(){X.save();if(shake>0)X.translate(R(-shake,shake)*.4,R(-shake,shake)*.4);
 drawWorld();
 for(const p of pickups)drawPickup(p);
 for(const e of enemies)drawEnemy(e);
 if(boss)drawBoss(boss);
 X.globalCompositeOperation='lighter';
 for(const b of bullets){const bd=.62+.55*clamp(b.y/H,0,1);   // your shots shrink as they fly away from you
  if(b.k==='honey'){X.save();X.translate(b.x,b.y);X.rotate(Math.atan2(b.vy,b.vx)+Math.PI/2);X.fillStyle='rgba(255,179,0,.22)';ell(0,b.r*1.8,b.r*.9,b.r*2.6);X.fill();X.fillStyle='rgba(255,220,120,.35)';ell(0,b.r*2.6,b.r*.35,b.r*1.2);X.fill();X.fillStyle=rg(0,0,b.r,'#fff8d0','#ff9500');X.beginPath();X.moveTo(0,-b.r*2);X.quadraticCurveTo(b.r*1.15,b.r*.2,0,b.r*1.2);X.quadraticCurveTo(-b.r*1.15,b.r*.2,0,-b.r*2);X.fill();X.fillStyle='rgba(255,255,255,.85)';ell(-b.r*.35,-b.r*.5,b.r*.25,b.r*.55,.2);X.fill();X.fillStyle='rgba(180,90,0,.35)';ell(b.r*.3,b.r*.5,b.r*.3,b.r*.35);X.fill();X.restore();}
  else if(b.k==='stinger'){const pw=1+Math.sin(t*.9+b.y*.05)*.25;X.strokeStyle='rgba(240,220,255,.9)';X.lineWidth=1.3;X.beginPath();for(const sg of[-1,1]){let yy=b.y-22;X.moveTo(b.x+sg*b.r*pw*.4,yy);while(yy<b.y+22){yy+=R(5,9);X.lineTo(b.x+sg*b.r*pw*R(.6,1.8),yy);}}X.stroke();X.shadowColor='#c77dff';X.shadowBlur=16;const g=X.createLinearGradient(b.x-b.r*pw,0,b.x+b.r*pw,0);g.addColorStop(0,'rgba(199,125,255,0)');g.addColorStop(.4,'rgba(230,190,255,.9)');g.addColorStop(.5,'#fff');g.addColorStop(.6,'rgba(230,190,255,.9)');g.addColorStop(1,'rgba(199,125,255,0)');X.fillStyle=g;X.fillRect(b.x-b.r*pw,b.y-22,b.r*2*pw,44);X.shadowBlur=0;}
  else if(b.k==='water'){X.save();X.translate(b.x,b.y);X.fillStyle=rg(0,0,b.r*1.4,'#fff0c0','#ff8a00');X.beginPath();X.moveTo(0,-b.r*2.2);X.quadraticCurveTo(b.r*1.3,0,0,b.r*1.2);X.quadraticCurveTo(-b.r*1.3,0,0,-b.r*2.2);X.fill();X.fillStyle='rgba(255,255,255,.8)';ell(-b.r*.35,-b.r*.4,b.r*.3,b.r*.6);X.fill();X.restore();}
  else if(b.k==='wax'){X.save();X.translate(b.x,b.y);const wob=Math.sin(t*.4+b.y*.1)*.15;X.fillStyle=rg(0,0,b.r,'#fff4c8','#e0a020');ell(0,0,b.r*(1+wob),b.r*(1-wob));X.fill();ell(0,b.r*.9,b.r*.35,b.r*.5);X.fill();X.fillStyle='rgba(255,255,255,.6)';ell(-b.r*.3,-b.r*.35,b.r*.3,b.r*.22);X.fill();X.restore();}
  else if(b.k==='thorn'){X.save();X.translate(b.x,b.y);X.rotate(Math.atan2(b.vy,b.vx));X.fillStyle=rg(0,0,7,'#ffe0a0','#6a4010');X.beginPath();X.moveTo(9,0);X.lineTo(-6,-3);X.lineTo(-4,0);X.lineTo(-6,3);X.closePath();X.fill();X.restore();}
  else if(b.k==='rain'){X.save();X.translate(b.x,b.y);X.fillStyle='rgba(255,204,102,.3)';ell(0,-b.r*2,b.r*.6,b.r*3);X.fill();X.fillStyle=rg(0,0,b.r,'#fff8d0','#ff9500');X.beginPath();X.moveTo(0,-b.r*2.2);X.quadraticCurveTo(b.r*1.2,0,0,b.r*1.2);X.quadraticCurveTo(-b.r*1.2,0,0,-b.r*2.2);X.fill();X.restore();}
  else if(b.k==='lure'){X.save();X.translate(b.x,b.y);const pl=1+Math.sin(t*.3)*.2,rr=(t*3)%170;X.strokeStyle=`rgba(255,122,217,${1-rr/170})`;X.lineWidth=2;ell(0,0,rr,rr*.8);X.stroke();X.fillStyle=rg(0,0,b.r*2*pl,'rgba(255,200,240,.7)','rgba(255,122,217,0)');ell(0,0,b.r*2*pl,b.r*2*pl);X.fill();X.fillStyle='#fff';ell(0,0,b.r*.5,b.r*.5);X.fill();X.restore();}
  else if(b.k==='grenade'||b.k==='shard'){X.save();X.translate(b.x,b.y);X.rotate(t*.2);X.fillStyle=rg(0,0,b.r,'#ffe0a0','#c06010');X.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3;X.lineTo(Math.cos(a)*b.r,Math.sin(a)*b.r);}X.closePath();X.fill();if(b.k==='grenade'){X.strokeStyle='rgba(255,255,255,.6)';X.lineWidth=1;X.stroke();}X.restore();}
  else if(b.k==='wall'){X.save();X.translate(b.x,b.y);const g=X.createLinearGradient(-b.half,0,b.half,0);g.addColorStop(0,'rgba(200,160,80,0)');g.addColorStop(.15,'rgba(230,190,100,.9)');g.addColorStop(.85,'rgba(230,190,100,.9)');g.addColorStop(1,'rgba(200,160,80,0)');X.fillStyle=g;X.fillRect(-b.half,-7,b.half*2,14);X.fillStyle='rgba(120,70,10,.8)';for(let k=-b.half+8;k<b.half-4;k+=14){X.beginPath();for(let j=0;j<6;j++){const a=j*Math.PI/3;X.lineTo(k+Math.cos(a)*5,Math.sin(a)*5);}X.closePath();X.fill();}X.globalAlpha=Math.min(1,b.life/40);X.strokeStyle='#fff8d0';X.lineWidth=1.2;X.strokeRect(-b.half,-7,b.half*2,14);X.restore();}
  else if(b.k==='lance'){X.save();X.translate(b.x,b.y);X.fillStyle='rgba(255,224,102,.25)';ell(0,14,9,40);X.fill();const g=X.createLinearGradient(0,-34,0,26);g.addColorStop(0,'#fff');g.addColorStop(.3,'#ffe066');g.addColorStop(1,'rgba(255,160,0,0)');X.fillStyle=g;X.beginPath();X.moveTo(0,-36);X.lineTo(6,-8);X.lineTo(4,26);X.lineTo(-4,26);X.lineTo(-6,-8);X.closePath();X.fill();X.fillStyle='rgba(255,255,255,.9)';ell(0,-20,1.6,10);X.fill();X.strokeStyle='rgba(255,240,160,.8)';X.lineWidth=1;X.beginPath();for(let k=0;k<3;k++){const a=t*.2+k*2.1;X.moveTo(Math.cos(a)*8,Math.sin(a)*8-8);X.lineTo(Math.cos(a)*13,Math.sin(a)*13-8);}X.stroke();X.restore();}
  else if(b.drone){X.save();X.translate(b.x,b.y);X.rotate(Math.atan2(b.vy,b.vx)+Math.PI/2);X.globalCompositeOperation='source-over';X.fillStyle='rgba(0,0,0,.22)';ell(4,8,7,3);X.fill();bee(0,0,6,'#ffd23f','#1a1a1a','#fff');X.restore();X.globalCompositeOperation='lighter';}
  else if(b.k==='static'){X.save();X.translate(b.x,b.y);const pl=1+Math.sin(t*.4)*.15;X.fillStyle=rg(0,0,b.r*2.2*pl,'rgba(230,200,255,.55)','rgba(150,80,255,0)');ell(0,0,b.r*2.2*pl,b.r*1.8*pl);X.fill();X.fillStyle='rgba(200,150,255,.8)';for(let k=0;k<6;k++){const a=k*1.047+t*.1;ell(Math.cos(a)*b.r*.7,Math.sin(a)*b.r*.5,b.r*.45,b.r*.35);X.fill();}X.fillStyle='#fff';ell(0,0,b.r*.35,b.r*.35);X.fill();X.restore();
   X.strokeStyle='#e8d0ff';X.lineWidth=2;X.shadowColor='#c77dff';X.shadowBlur=10;for(const z of b.zaps){X.globalAlpha=z.ttl/8;X.beginPath();X.moveTo(b.x,b.y);let cx=b.x,cy=b.y;const n=5;for(let k=1;k<=n;k++){const fx=b.x+(z.x-b.x)*k/n+(k<n?R(-9,9):0),fy=b.y+(z.y-b.y)*k/n+(k<n?R(-9,9):0);X.lineTo(fx,fy);}X.stroke();}X.globalAlpha=1;X.shadowBlur=0;}
  else if(b.k==='saw'){X.save();X.translate(b.x,b.y);X.fillStyle='rgba(143,209,79,.25)';ell(0,0,b.r*1.9,b.r*1.9);X.fill();X.rotate(b.ang);X.fillStyle=rg(0,0,b.r,'#d8ff9a','#3a7a1a');X.beginPath();for(let k=0;k<16;k++){const a=k*Math.PI/8,rr=k%2?b.r*1.35:b.r*.95;X.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}X.closePath();X.fill();X.fillStyle='#2a5a10';ell(0,0,b.r*.35,b.r*.35);X.fill();X.strokeStyle='rgba(255,255,255,.5)';X.lineWidth=1;ell(0,0,b.r*.7,b.r*.7);X.stroke();X.restore();}
  else if(b.k==='petal'){X.save();X.translate(b.x,b.y);if(b.orbit){X.rotate(b.a);X.fillStyle='#7a4a00';X.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3;X.lineTo(Math.cos(a)*9,Math.sin(a)*9);}X.closePath();X.fill();X.fillStyle=rg(0,0,7,'#fff0b0','#ffb020');X.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3;X.lineTo(Math.cos(a)*6.5,Math.sin(a)*6.5);}X.closePath();X.fill();}else{X.fillStyle=rg(0,0,6,'#fff8d0','#ffa000');X.beginPath();X.moveTo(0,-10);X.quadraticCurveTo(5,0,0,7);X.quadraticCurveTo(-5,0,0,-10);X.fill();}X.restore();}
  else{X.save();X.translate(b.x,b.y);X.fillStyle=rg(0,0,b.r*2,'rgba(255,255,255,.9)','rgba(255,111,181,0)');ell(0,0,b.r*2,b.r*2);X.fill();X.strokeStyle='rgba(255,111,181,.5)';X.lineWidth=3;X.beginPath();X.moveTo(0,0);X.lineTo(-b.vx*2.5,-b.vy*2.5);X.stroke();X.rotate(t*.3+b.x);X.fillStyle='#ffe066';for(let k=0;k<5;k++){const a=k*1.257;ell(Math.cos(a)*b.r*.55,Math.sin(a)*b.r*.55,b.r*.32,b.r*.32);X.fill();}X.fillStyle='#fff';ell(0,0,b.r*.3,b.r*.3);X.fill();X.strokeStyle='rgba(255,255,255,.7)';X.lineWidth=1;X.beginPath();for(let k=0;k<3;k++){const a=k*2.09+t*.1;X.moveTo(Math.cos(a)*b.r*1.1,Math.sin(a)*b.r*1.1);X.lineTo(Math.cos(a)*b.r*1.7,Math.sin(a)*b.r*1.7);}X.stroke();X.restore();}}
 X.globalCompositeOperation='source-over';
 for(const b of ebullets){b.t=(b.t||0)+1;const r=b.r;X.save();X.translate(b.x,b.y);X.fillStyle='rgba(0,0,0,.25)';ell(4,7,r*1.4,r*.8);X.fill();
  switch(b.kind){
   case 'venom':X.rotate(Math.atan2(b.vy,b.vx)+Math.PI/2);X.fillStyle='#1a3a00';X.beginPath();X.moveTo(0,-r*2.1);X.quadraticCurveTo(r*1.5,r*.2,0,r*1.5);X.quadraticCurveTo(-r*1.5,r*.2,0,-r*2.1);X.fill();X.fillStyle=rg(0,0,r,'#e8ff90','#5aa000');X.beginPath();X.moveTo(0,-r*1.7);X.quadraticCurveTo(r*1.1,r*.2,0,r*1.1);X.quadraticCurveTo(-r*1.1,r*.2,0,-r*1.7);X.fill();break;
   case 'seed':X.rotate(b.t*.2);X.fillStyle='#000';X.beginPath();for(let k=0;k<12;k++){const a=k*Math.PI/6,rr=k%2?r*1.9:r*1.1;X.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}X.closePath();X.fill();X.fillStyle=rg(0,0,r,'#e0c0ff','#7a3ab0');ell(0,0,r*.95,r*.95);X.fill();break;
   case 'dust':X.fillStyle='rgba(60,40,10,.8)';ell(0,0,r*1.7,r*1.5);X.fill();X.fillStyle='rgba(255,230,150,.9)';for(let k=0;k<5;k++){const a=k*1.26+b.t*.1;ell(Math.cos(a)*r*.7,Math.sin(a)*r*.7,r*.55,r*.35,a);X.fill();}break;
   case 'ember':X.fillStyle='rgba(255,200,0,.35)';ell(0,0,r*2,r*2);X.fill();X.fillStyle='#000';ell(0,0,r*1.25,r*1.25);X.fill();X.fillStyle=rg(0,0,r,'#fff','#ffb000');ell(0,0,r*.9+Math.sin(b.t*.5)*r*.15,r*.9+Math.sin(b.t*.5)*r*.15);X.fill();break;
   case 'drop':X.rotate(Math.atan2(b.vy,b.vx)+Math.PI/2);X.fillStyle='#04304a';X.beginPath();X.moveTo(0,-r*2.2);X.quadraticCurveTo(r*1.5,r*.1,0,r*1.4);X.quadraticCurveTo(-r*1.5,r*.1,0,-r*2.2);X.fill();X.fillStyle=rg(0,0,r,'#e8fbff','#2aa8e8');X.beginPath();X.moveTo(0,-r*1.8);X.quadraticCurveTo(r*1.1,r*.1,0,r*1);X.quadraticCurveTo(-r*1.1,r*.1,0,-r*1.8);X.fill();break;
   case 'gas':{const w=1+Math.sin(b.t*.15)*.12;X.fillStyle='rgba(60,90,20,.55)';for(let k=0;k<5;k++){const a=k*1.26+b.t*.03;ell(Math.cos(a)*r*.6,Math.sin(a)*r*.5,r*.9*w,r*.75*w);X.fill();}X.fillStyle='rgba(180,230,80,.6)';ell(0,0,r*.9,r*.7);X.fill();X.fillStyle='#2a3a10';X.font='bold 9px '+FONT;X.textAlign='center';X.fillText('~',0,3);break;}
   case 'wave':X.strokeStyle='rgba(255,220,120,.95)';X.lineWidth=3;ell(0,0,r*1.6,r*1.6);X.stroke();X.strokeStyle='rgba(0,0,0,.6)';X.lineWidth=1.5;ell(0,0,r*1.6,r*1.6);X.stroke();ell(0,0,r*.9,r*.9);X.stroke();X.fillStyle='#ffe090';ell(0,0,r*.45,r*.45);X.fill();break;
   case 'web':{X.rotate(b.t*.05);X.strokeStyle='rgba(0,0,0,.55)';X.lineWidth=2.4;X.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3;X.moveTo(0,0);X.lineTo(Math.cos(a)*r*2.2,Math.sin(a)*r*2.2);}X.stroke();X.strokeStyle='#f4f4ff';X.lineWidth=1.2;X.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3;X.moveTo(0,0);X.lineTo(Math.cos(a)*r*2.2,Math.sin(a)*r*2.2);}for(let ring=1;ring<=3;ring++){for(let k=0;k<=6;k++){const a=k*Math.PI/3,rr=r*.7*ring;if(k===0)X.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);else X.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}}X.stroke();break;}
   case 'fang':{X.rotate(Math.atan2(b.vy,b.vx)+Math.PI/2);X.fillStyle='rgba(255,50,50,.30)';ell(0,0,r*2.1,r*2.1);X.fill();X.fillStyle='#3a0000';X.beginPath();X.moveTo(0,-r*2.2);X.quadraticCurveTo(r*1.35,r*.1,0,r*1.5);X.quadraticCurveTo(-r*1.35,r*.1,0,-r*2.2);X.fill();X.fillStyle=rg(0,-r*.4,r*1.2,'#ffd6d6','#c00812');X.beginPath();X.moveTo(0,-r*1.8);X.quadraticCurveTo(r*.95,r*.05,0,r*1.15);X.quadraticCurveTo(-r*.95,r*.05,0,-r*1.8);X.fill();X.fillStyle='rgba(255,255,255,.85)';ell(-r*.28,-r*.8,r*.22,r*.4);X.fill();break;}
  case 'blade':X.rotate(Math.atan2(b.vy,b.vx));X.fillStyle='#0a2a00';X.beginPath();X.moveTo(r*2.4,0);X.quadraticCurveTo(0,-r*1.3,-r*1.6,-r*.3);X.quadraticCurveTo(0,-r*.2,r*2.4,0);X.fill();X.fillStyle=rg(0,0,r,'#d8ffb0','#4aa020');X.beginPath();X.moveTo(r*2,0);X.quadraticCurveTo(0,-r,-r*1.3,-r*.25);X.quadraticCurveTo(0,-r*.15,r*2,0);X.fill();break;
   case 'acorn':X.rotate(b.t*.1);X.fillStyle='#1a0800';ell(0,r*.2,r*1.2,r*1.5);X.fill();X.fillStyle=rg(0,r*.2,r,'#e0a060','#7a3a10');ell(0,r*.3,r*.95,r*1.2);X.fill();X.fillStyle='#4a2a10';ell(0,-r*.7,r*1.1,r*.55);X.fill();X.fillRect(-1.5,-r*1.5,3,r*.6);break;
   default:X.rotate(b.t*.12);X.fillStyle='#000';X.beginPath();for(let k=0;k<10;k++){const a=k*Math.PI/5,rr=k%2?r*1.9:r*1.15;X.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}X.closePath();X.fill();X.fillStyle=rg(0,0,r,'#fff','#ff2020');ell(0,0,r,r);X.fill();
  }  // danger marking goes ON TOP of the shot's own artwork -- underneath, every kind's shape
  // painted straight over it, which is why the red never showed.
  // webs only tangle you, they do not kill, so they are marked white instead of red.
  if(b.kind==='web'){X.strokeStyle='rgba(255,255,255,.75)';X.lineWidth=1.4;ell(0,0,r*1.1,r*1.1);X.stroke();}
  else{
  X.globalCompositeOperation='lighter';
  X.fillStyle=rg(0,0,r*1.15,'rgba(255,70,50,.85)','rgba(255,20,20,0)');ell(0,0,r*1.15,r*1.15);X.fill();
  X.globalCompositeOperation='source-over';
  X.strokeStyle='rgba(90,0,0,.9)';X.lineWidth=2.4;ell(0,0,r*1.1,r*1.1);X.stroke();
  X.strokeStyle='#ff3030';X.lineWidth=1.6;ell(0,0,r*1.1,r*1.1);X.stroke();}
  X.restore();}
 for(const r of ringsFx){r.r+=(r.max-r.r)*.15;X.globalAlpha=Math.max(0,1-r.r/r.max);X.strokeStyle='#fff';X.lineWidth=3;ell(r.x,r.y,r.r,r.r);X.stroke();X.strokeStyle=r.c;X.lineWidth=1.5;ell(r.x,r.y,r.r*.8,r.r*.8);X.stroke();}X.globalAlpha=1;ringsFx=ringsFx.filter(r=>r.r<r.max-2);
 X.globalCompositeOperation='lighter';X.lineCap='round';for(const p of parts){X.globalAlpha=Math.min(1,p.l/15);if(p.spark){X.strokeStyle=p.c;X.lineWidth=p.r;X.beginPath();X.moveTo(p.x,p.y);X.lineTo(p.x-p.vx*2.5,p.y-p.vy*2.5);X.stroke();}else if(p.gib){X.globalCompositeOperation='source-over';X.fillStyle='rgba(0,0,0,.25)';ell(p.x+3,p.y+5,p.r*p.rx,p.r*.6,p.a);X.fill();X.fillStyle=p.c;ell(p.x,p.y,p.r*p.rx,p.r*.6,p.a);X.fill();X.globalCompositeOperation='lighter';}else{X.fillStyle=p.c;ell(p.x,p.y,p.r,p.r);X.fill();}}X.globalAlpha=1;X.globalCompositeOperation='source-over';
 if(state==='play'&&!P.dead&&(P.inv===0||(t>>2)&1)){
  if(t%2===0)parts.push({x:P.x+R(-6,6),y:P.y+14,vx:R(-.3,.3),vy:R(1,2.5),l:R(8,16),c:'#ffe08a',r:R(1,2.5)});
  X.globalCompositeOperation='lighter';for(const m of muzzle){X.globalAlpha=m.l/4*.8;X.fillStyle=rg(m.x,m.y,14,'#fff',m.c);ell(m.x,m.y,6+(4-m.l)*3,10+(4-m.l)*2);X.fill();m.l--;}muzzle=muzzle.filter(m=>m.l>0);X.globalAlpha=1;
  X.fillStyle=rg(P.x,P.y+4,30,'rgba(255,220,80,.35)','rgba(255,220,80,0)');ell(P.x,P.y+4,30,30);X.fill();if(P.lvl>=5){const pr=(t%40)/40;X.globalAlpha=1-pr;X.strokeStyle=WEAPONS[P.wpn].col;X.lineWidth=3;ell(P.x,P.y,22+pr*26,22+pr*26);X.stroke();X.globalAlpha=1;}X.globalCompositeOperation='source-over';
  emboss(P.x,P.y,120*(P.dep||1),()=>bee(0,0,16*(P.dep||1),'#ffd23f','#1a1a1a','#fff'),{alt:1.2});
  if(P.webbed>0){X.save();X.translate(P.x,P.y);X.globalAlpha=Math.min(1,P.webbed/30);X.strokeStyle='rgba(255,255,255,.9)';X.lineWidth=1.5;X.shadowColor='#000';X.shadowBlur=3;X.beginPath();for(let k=0;k<8;k++){const a=k*Math.PI/4;X.moveTo(0,0);X.lineTo(Math.cos(a)*34,Math.sin(a)*34);}for(let ring=1;ring<=3;ring++){for(let k=0;k<=8;k++){const a=k*Math.PI/4,rr=11*ring;if(k===0)X.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);else X.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}}X.stroke();X.restore();}
  if(P.wpn==='lash'){X.save();X.globalCompositeOperation='lighter';const tx=lashT&&t-lashT.t<4?lashT.x:P.x+Math.sin(t*.1)*10,ty=lashT&&t-lashT.t<4?lashT.y:P.y-260,cx=(P.x+tx)/2+Math.sin(t*.35)*40,cy=(P.y-14+ty)/2;for(const [w,c] of [[14,'rgba(255,247,176,.22)'],[6,'rgba(255,247,176,.7)'],[2.2,'#fff']]){X.strokeStyle=c;X.lineWidth=w;X.lineCap='round';X.beginPath();X.moveTo(P.x,P.y-14);X.quadraticCurveTo(cx,cy,tx,ty);X.stroke();}if(lashT&&t-lashT.t<4){X.fillStyle=rg(tx,ty,18,'rgba(255,255,255,.9)','rgba(255,220,120,0)');ell(tx,ty,18,18);X.fill();}X.restore();}
  if(keys.ShiftLeft||keys.ShiftRight){X.strokeStyle='#fff';X.lineWidth=1.5;ell(P.x,P.y,5,5);X.stroke();X.fillStyle='#f33';ell(P.x,P.y,2,2);X.fill();}}
 X.restore();
 worldOverlay();drawOverlays();
 // HUD
 const hg=X.createLinearGradient(0,H-44,0,H);hg.addColorStop(0,'rgba(0,0,0,0)');hg.addColorStop(1,'rgba(0,0,0,.42)');X.fillStyle=hg;X.fillRect(0,H-44,W,44);
 X.font='bold 13px '+FONT;X.textAlign='left';X.fillStyle='rgba(255,255,255,.92)';X.shadowColor='#000';X.shadowBlur=5;X.fillText('SCORE '+score,8,H-12);
 X.textAlign='right';X.fillStyle='rgba(221,221,221,.9)';X.fillText('HI '+hi,W-8,H-12);
 if(chain>1){const m=chainMult(),a=Math.min(1,chainT/40);
  X.textAlign='left';X.globalAlpha=a;
  X.fillStyle=m>=6?'#ff8adf':m>=4?'#ffd23f':'#8dff9a';X.font='bold 15px '+FONT;
  X.fillText('x'+m,8,H-28);
  X.font='7px '+FONT;X.fillStyle='rgba(255,255,255,.5)';X.fillText('MULT',8,H-40);
  X.font='bold 10px '+FONT;X.fillStyle='rgba(255,255,255,.75)';X.fillText(chain+' KILLS IN A ROW',30,H-28);
  X.globalAlpha=1;}
 X.textAlign='center';X.fillStyle=WEAPONS[P.wpn].col;X.fillText(WEAPONS[P.wpn].name+' Lv'+P.lvl+'   ·   '+WEAPONS[P.wpn].tag,W/2,H-12);
 for(let i=0;i<5;i++){X.fillStyle=i<P.lvl?WEAPONS[P.wpn].col:'rgba(255,255,255,.25)';X.fillRect(W/2-40+i*16,H-34,12,4);}
 X.shadowBlur=0;
 // cap the bee row at five and count the rest -- eleven lives used to run into the
 // music button. HUDR below is the single source of truth for where this lands.
 {const r=HUDR.lives();panel(r.x,r.y,r.w,r.h,6);
  for(let i=0;i<Math.min(5,Math.max(0,P.lives));i++)bee(20+i*22,15,6,'#ffd23f','#1a1a1a','#fff');
  if(P.lives>5){X.textAlign='left';X.font='bold 11px '+FONT;X.fillStyle='#ffd23f';X.fillText('\u00d7'+P.lives,4+26+5*22-14,19);}}
 {const r=HUDR.bombs(),sh=pauseGap(),n=Math.min(4,P.bombs);panel(r.x,r.y,r.w,r.h,6);
  for(let i=0;i<n;i++){X.fillStyle=rg(W-16-i*18-sh,15,6,'#fff','#ffb300');ell(W-16-i*18-sh,15,6,6);X.fill();}
  if(P.bombs>4){X.textAlign='left';X.font='bold 11px '+FONT;X.fillStyle='#ffb300';X.fillText('\u00d7'+P.bombs,r.x+8,19);}}
 for(const [k,b] of Object.entries(BTN)){const on=k==='music'?MUSIC.on:SFX_ON;panel(b.x,b.y,b.w,b.h,6);X.fillStyle=on?'#ffd23f':'rgba(255,255,255,.35)';X.font='bold 12px '+FONT;X.textAlign='center';X.fillText(k==='music'?(on?'♪ ON':'♪ OFF'):(on?'FX ON':'FX OFF'),b.x+b.w/2,b.y+15);}
 if(touchMode&&state==='play'){const b=TBTN.bomb,ok=P.bombs>0;X.save();X.globalAlpha=ok?.62:.28;
  X.beginPath();X.arc(b.x+b.w/2,b.y+b.h/2,b.w/2,0,7);X.fillStyle='#000';X.fill();X.lineWidth=2;X.strokeStyle=ok?'#ffd23f':'#888';X.stroke();
  X.globalAlpha=1;X.fillStyle=ok?'#ffd23f':'rgba(255,255,255,.3)';X.font='bold 11px '+FONT;X.textAlign='center';
  X.fillText('BOMB',b.x+b.w/2,b.y+b.h/2-1);X.font='bold 13px '+FONT;X.fillText(String(P.bombs),b.x+b.w/2,b.y+b.h/2+14);X.restore();
  const q=TBTN.pause;panel(q.x,q.y,q.w,q.h,6);X.fillStyle='rgba(255,255,255,.75)';X.font='bold 11px '+FONT;X.textAlign='center';X.fillText(paused?'▶':'II',q.x+q.w/2,q.y+15);}
 if(msgT>0){const card=levelClear>0||levelIntro>0||bossWarn>0;
  // In-play callouts used to hit full opacity at 24px in the middle of the play field,
  // sitting right on top of the bugs you are trying to read. They are notifications, not
  // cards: keep them faint and park them under the bee, above the score line, where
  // nothing is ever happening. Level/boss cards are a deliberate beat and stay put.
  X.globalAlpha=card?Math.min(1,msgT/30):Math.min(.45,msgT/30*.45);
  X.fillStyle='#fff';X.shadowColor='#000';X.shadowBlur=card?8:5;
  X.font='bold '+(card?18:15)+'px '+FONT;X.textAlign='center';
  X.fillText(msg,W/2,card?H-150:H-56);
  X.shadowBlur=0;X.globalAlpha=1;}
 if(state==='play'&&!bossAlive&&bossWarn===0&&levelClear===0&&levelIntro===0){const lv=LV(),pr=Math.min(1,stageT/lv.len),x0=70,x1=W-70;panel(x0-10,26,x1-x0+56,46,7);X.textAlign='center';X.fillStyle='rgba(255,255,255,.92)';X.font='bold 18px '+FONT;X.shadowColor='#000';X.shadowBlur=4;X.fillText('LEVEL '+stage+'  ·  '+lv.name,W/2,47);X.fillStyle='rgba(0,0,0,.18)';X.fillRect(x0,55,x1-x0,8);X.fillStyle='rgba(255,210,63,.62)';X.fillRect(x0,55,(x1-x0)*pr,8);X.textAlign='left';X.fillStyle='rgba(255,80,80,.85)';X.font='bold 12px '+FONT;X.fillText('BOSS',x1+6,64);X.shadowBlur=0;bee(x0+(x1-x0)*pr,59,5,'#ffd23f','#1a1a1a','#fff');}
 if(state==='play'&&levelIntro>0){const a=Math.min(1,levelIntro/30,(200-levelIntro)/20),th=LV(),bd=BOSSES[th.boss];
  // no panel behind it -- just the words, outlined so they read over any background, and see-through
  X.save();X.textAlign='center';X.lineJoin='round';X.globalAlpha=a*.92;
  const cut=(txt,y,size,col,alpha)=>{X.font='bold '+size+'px '+FONT;X.globalAlpha=a*alpha*.35;X.strokeStyle='#000';X.lineWidth=size*.22;X.strokeText(txt,W/2,y);X.globalAlpha=a*alpha;X.fillStyle=col;X.fillText(txt,W/2,y);};
  cut('LEVEL '+stage,H/2-50,46,'#ffd23f',.92);
  cut(th.name,H/2-12,28,'#ffffff',.92);
  X.font='italic 14px '+FONT;X.globalAlpha=a*.30;X.strokeStyle='#000';X.lineWidth=3;X.strokeText(th.sub,W/2,H/2+10);X.globalAlpha=a*.75;X.fillStyle='#cfe8ff';X.fillText(th.sub,W/2,H/2+10);
  cut('fill the bar at the top, then beat the boss',H/2+42,14,'#ffffff',.72);
  cut(bd.name,H/2+64,17,'#ff8a8a',.92);
  cut('GET READY',H/2+90,14,'#ffffff',.80);
  X.globalAlpha=1;X.restore();}
 if(state==='play'&&bossWarn>0){const bd=BOSSES[LV().boss],a=Math.min(1,(210-bossWarn)/45,bossWarn/20),pulse=.5+Math.sin(bossWarn*.12)*.5;X.save();X.globalAlpha=a;
  // red edge vignette that breathes — a warning you feel, not a wall
  const vg=X.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,H*.8);vg.addColorStop(0,'rgba(120,0,0,0)');vg.addColorStop(1,`rgba(160,0,0,${.25+pulse*.25})`);X.fillStyle=vg;X.fillRect(0,0,W,H);
  // slim banner just under the HUD; portrait small on the left, words on the right
  panel(12,66,W-24,74,10);X.fillStyle=`rgba(255,40,40,${.5+pulse*.5})`;X.fillRect(12,66,W-24,3);X.fillRect(12,137,W-24,3);
  X.save();X.beginPath();X.roundRect(14,68,W-28,70,9);X.clip();X.translate(60,103);X.scale(.42,.42);X.translate(-60,-103);drawBoss({...bd,x:60,y:103,t:t,fl:0,hp:1,max:1,rage:0,seg:[]},true);X.restore();
  X.textAlign='left';X.shadowColor='#000';X.shadowBlur=6;X.fillStyle=pulse>.5?'#fff':'#ffb0b0';X.font='bold 20px '+FONT;X.fillText('WARNING',118,92);X.fillStyle='#ffd23f';X.font='bold 17px '+FONT;X.fillText(bd.name,118,113);X.fillStyle='#ffd0d0';X.font='italic 11px '+FONT;X.fillText(bd.taunt,118,130);X.shadowBlur=0;X.restore();}
 if(state==='play'&&levelClear>0){X.textAlign='center';X.shadowColor='#000';X.shadowBlur=10;X.fillStyle='#fff';X.font='bold 46px '+FONT;X.fillText('LEVEL '+stage+' CLEAR!',W/2,H/2-40);X.font='bold 18px '+FONT;X.fillStyle='#ffd23f';X.fillText(BOSSES[LV().boss].name+' DEFEATED   +'+(5000*(stage+loop)),W/2,H/2);X.font='14px '+FONT;X.fillStyle='#c8ffd4';X.fillText('grab the goodies!',W/2,H/2+28);X.shadowBlur=0;}
 if(state!=='play'){const sp=splashFrame();if(sp){drawArt(sp);X.save();cloudShadows(.2);X.globalCompositeOperation='lighter';X.globalAlpha=.10+(.5+Math.sin(t*.02)*.5)*.08;X.fillStyle=rg(W/2,H*.3,240,'rgba(255,220,140,.9)','rgba(255,220,140,0)');ell(W/2,H*.3,240,240);X.fill();X.restore();const g=X.createLinearGradient(0,H*.5,0,H);g.addColorStop(0,'rgba(0,10,25,0)');g.addColorStop(.35,'rgba(0,10,25,.42)');g.addColorStop(1,'rgba(0,10,25,.58)');X.fillStyle=g;X.fillRect(0,0,W,H);X.fillStyle='rgba(0,10,25,.16)';X.fillRect(0,0,W,150);}else{X.fillStyle='rgba(0,20,40,.45)';X.fillRect(0,0,W,H);}
  X.textAlign='center';X.shadowColor='#000';X.shadowBlur=14;X.fillStyle='#ffd23f';X.font='bold 64px '+FONT;X.fillText('HIVE STRIKE',W/2,sp?92:200);X.shadowBlur=0;
  if(!sp)emboss(W/2,265,150,()=>bee(0,0,26,'#ffd23f','#1a1a1a','#fff'),{alt:0});
  X.fillStyle='#fff';X.font='14px '+FONT;
  X.shadowColor='#000';X.shadowBlur=6;if(state==='won'){X.font='bold 30px '+FONT;X.fillStyle='#8dff9a';X.fillText('THE HIVE IS SAFE!',W/2,sp?306:320);X.font='14px '+FONT;X.fillStyle='#fff';X.fillText('all sixteen worlds cleared   ·   SCORE '+score+'   HI '+hi,W/2,sp?332:348);X.font='12px '+FONT;X.fillStyle='#cfe8ff';X.fillText('best chain x'+Math.min(8,1+Math.floor(chainBest/6))+'  ('+chainBest+' kills)   ·   '+grazed+' grazes',W/2,sp?352:368);}else if(state==='over'){X.font='bold 26px '+FONT;X.fillStyle='#ff4d6d';X.fillText('THE HIVE HAS FALLEN',W/2,sp?306:320);X.font='14px '+FONT;X.fillStyle='#fff';X.fillText('SCORE '+score+'   HI '+hi+'   LEVEL '+stage,W/2,sp?332:348);X.font='12px '+FONT;X.fillStyle='#cfe8ff';X.fillText('best chain x'+Math.min(8,1+Math.floor(chainBest/6))+'  ('+chainBest+' kills)   ·   '+grazed+' grazes',W/2,sp?352:368);}
  else{X.font='bold 16px '+FONT;X.fillText('sixteen worlds. sixteen bosses. forty-eight bugs. one bee.',W/2,sp?122:335);}
  // instructions as a laid-out table instead of six centred lines running together
  {const ty=sp?392:372,colL=W*.06,colR=W*.53,colW=W*.41;
   X.save();X.fillStyle='rgba(6,14,28,.20)';X.beginPath();X.roundRect(colL-10,ty-20,W-2*(colL-10),150,10);X.fill();
   X.strokeStyle='rgba(255,210,63,.22)';X.lineWidth=1;X.beginPath();X.roundRect(colL-10,ty-20,W-2*(colL-10),150,10);X.stroke();
   // the panel stays see-through so the bee reads through it; the text earns its
   // contrast from a shadow instead of from a slab painted over the art
   X.shadowColor='rgba(0,0,0,.95)';X.shadowBlur=4;X.shadowOffsetY=1;
   const head=(txt,x)=>{X.textAlign='left';X.font='bold 10px '+FONT;X.fillStyle='#ffd23f';X.fillText(txt,x,ty);
     X.strokeStyle='rgba(255,210,63,.30)';X.beginPath();X.moveTo(x,ty+5);X.lineTo(x+colW,ty+5);X.stroke();};
   const row=(k,v,x,i,off)=>{const y=ty+20+i*15;X.textAlign='left';X.font='bold 10px '+FONT;X.fillStyle='#ffffff';X.fillText(k,x,y);
     X.font='10px '+FONT;X.fillStyle='#dceaf7';X.fillText(v,x+off,y);};
   head('CONTROLS',colL);head('PICK UPS',colR);
   (touchMode
     ? [['DRAG','the bee follows your finger'],['BOMB button','bottom right'],['II button','pause'],['♪ / FX','tap to mute']]
     : [['ARROWS / WASD','move'],['SHIFT','focus, slow and precise'],['X or B','bomb'],['M / N','mute FX / music']]
   ).forEach((r,i)=>row(r[0],r[1],colL,i,84));
   [['NECTAR','power up, Lv1 to Lv5'],['S','bomb'],['HEART','extra life'],['GUN DROPS','label says what it does']].forEach((r,i)=>row(r[0],r[1],colR,i,66));
   X.textAlign='center';X.font='11px '+FONT;X.fillStyle='#8dff9a';
   X.fillText('GREEN RING = grab it        RED GLOW = dodge it',W/2,ty+90);X.textAlign='center';
   X.fillStyle='#a8c4e0';X.font='11px '+FONT;
   X.font='9px '+FONT;
   X.fillText('CHAIN  \u00b7  six fast kills = x2 score, up to x8   \u2014   it resets if you stop or get hit',W/2,ty+104);
   X.fillText('fill the top bar to reach the boss   \u00b7   webs tangle you   \u00b7   gnat clouds slow you',W/2,ty+115);
   X.fillText(touchMode?'the bee rides above your finger   \u00b7   bombs fire themselves when you are about to be hit':'the bee follows your cursor   \u00b7   bombs fire themselves when you are about to be hit',W/2,ty+126);X.font='11px '+FONT;
   X.restore();}
  X.textAlign='center';
  // two level sliders -- tap anywhere along one to set it
  {const bar=(b,lab,v,col)=>{
    X.textAlign='right';X.font='bold 9px '+FONT;X.fillStyle='rgba(255,255,255,.7)';X.fillText(lab,b.x-10,b.y+11);
    X.fillStyle='rgba(0,0,0,.45)';X.beginPath();X.roundRect(b.x,b.y,b.w,b.h,4);X.fill();
    X.fillStyle=col;X.beginPath();X.roundRect(b.x,b.y,Math.max(3,b.w*v),b.h,4);X.fill();
    X.strokeStyle='rgba(255,255,255,.22)';X.lineWidth=1;X.beginPath();X.roundRect(b.x+.5,b.y+.5,b.w-1,b.h-1,4);X.stroke();
    for(let i=1;i<5;i++){X.fillStyle='rgba(0,0,0,.30)';X.fillRect(b.x+b.w*i/5,b.y+2,1,b.h-4);}
    X.textAlign='left';X.font='9px '+FONT;X.fillStyle='rgba(255,255,255,.55)';X.fillText(Math.round(v*100)+'%',b.x+b.w+7,b.y+11);};
   bar(BARS.mus,'MUSIC',MUSLV,'#7fd4ff'); bar(BARS.sfx,'FX',SFXLV,'#ffd23f');}
  // build stamp: centred at the very bottom, between the left and right HUD text,
  // small and dim enough to disappear unless you go looking for it
  {X.save();X.textAlign='center';X.font='8px '+FONT;X.fillStyle='rgba(255,255,255,.30)';
   X.shadowColor='rgba(0,0,0,.8)';X.shadowBlur=3;X.fillText(BUILD,W/2,H-9);X.restore();}
  X.textAlign='center';X.fillStyle='#ffd23f';X.font='bold 12px '+FONT;X.fillText(touchMode?'CHOOSE YOUR WORLD   ·   tap a world you have reached':'CHOOSE YOUR WORLD   ←  →   (1 – 8 keys pick the first row)',W/2,H-160);
  for(let i=0;i<16;i++){const tl=TILE(i),sel=startStage===i+1,th=THEMES[i],lock=(i+1)>unlocked,bs=bestFor(i+1);panel(tl.x,tl.y,tl.w,tl.h,6);
   if(lock){X.fillStyle='rgba(0,0,0,.45)';X.beginPath();X.roundRect(tl.x,tl.y,tl.w,tl.h,6);X.fill();}
   if(sel&&!lock){X.strokeStyle='#ffd23f';X.lineWidth=2.5;X.beginPath();X.roundRect(tl.x,tl.y,tl.w,tl.h,6);X.stroke();}
   X.fillStyle=lock?'rgba(255,255,255,.35)':sel?'#ffd23f':'#cfe8ff';X.font='bold 14px '+FONT;X.fillText(lock?'\uD83D\uDD12':String(i+1),tl.x+tl.w/2,tl.y+17);
   X.font='7px '+FONT;X.fillStyle=lock?'rgba(255,255,255,.3)':sel?'#fff':'rgba(255,255,255,.7)';X.fillText(th.name.replace('THE ',''),tl.x+tl.w/2,tl.y+30);
   if(!lock&&bs>0){X.font='6px '+FONT;X.fillStyle='rgba(255,210,63,.85)';X.fillText(bs>=1000?(bs/1000).toFixed(bs>=10000?0:1)+'k':String(bs),tl.x+tl.w/2,tl.y+37);}}
  X.shadowBlur=0;}
 if(resumeCountdown>0){X.fillStyle='#0008';X.fillRect(0,0,W,H);X.textAlign='center';X.fillStyle='#fff';X.font='bold 22px '+FONT;X.fillText('GET READY',W/2,H/2-40);X.fillStyle='#ffd23f';X.font='bold 64px '+FONT;X.fillText(String(Math.ceil(resumeCountdown/60)),W/2,H/2+30);}
 else if(paused){X.fillStyle='#0008';X.fillRect(0,0,W,H);X.fillStyle='#fff';X.font='bold 30px '+FONT;X.textAlign='center';X.fillText('PAUSED',W/2,H/2);X.font='11px '+FONT;X.fillStyle='rgba(255,255,255,.75)';X.fillText('P or START to resume',W/2,H/2+26);}
}
buildDecor(0);

