// ---------- drawing helpers ----------
function ell(x,y,rx,ry,a=0){X.beginPath();X.ellipse(x,y,rx,ry,a,0,7);}
function rg(x,y,r,c1,c2){const g=X.createRadialGradient(x-r*.3,y-r*.3,r*.1,x,y,r);g.addColorStop(0,c1);g.addColorStop(1,c2);return g;}
function lerpC(a,b,m){const pa=parseInt(a.slice(1),16),pb=parseInt(b.slice(1),16);const r=(pa>>16)+((pb>>16)-(pa>>16))*m,g=((pa>>8)&255)+(((pb>>8)&255)-((pa>>8)&255))*m,bl=(pa&255)+((pb&255)-(pa&255))*m;return `rgb(${r|0},${g|0},${bl|0})`;}
// ---- EMBOSS: render a sprite offscreen, then composite ground shadow + drop shadow + light rim + dark rim.
// This cached one scratch canvas per distinct glow size, forever. Thirty sizes x two
// slots x DPR3 came to 59 MB of scratch space that nothing ever released. Round the size
// to a step so near-identical requests share a canvas, and evict least-recently-used
// past a hard cap. Visually identical, bounded memory.
// emboss() draws the whole scratch canvas scaled into an SxS box, so the canvas has to be
// exactly S -- rounding sizes into buckets would silently rescale every sprite. Keep exact
// sizes and bound the CACHE instead: least-recently-used eviction past a hard cap, with the
// evicted canvas zeroed so the backing store is actually handed back.
const OC={},OCLRU=[],OCMAX=10;
// Called by fit() when the raster scale changes (rotation, window resize, moving between
// displays). Every cached surface and every mip pyramid was built for the OLD scale, so
// keeping them would draw the wrong size. Cheap to rebuild, wrong to keep.
function rasterReset(){
 try{for(const k in OC){const c=OC[k];if(c){c.width=0;c.height=0;}delete OC[k];}OCLRU.length=0;}catch(e){}
 try{_WB=null;}catch(e){}
 try{_MB=null;}catch(e){}
 try{for(const k in _GM)delete _GM[k];}catch(e){}
 const drop=o=>{try{for(const k in o){const im=o[k];if(im){if(im._mips)im._mips.length=0;im.dof=null;}}}catch(e){}};
 try{drop(SPR);}catch(e){} try{drop(ART);}catch(e){}
}
function oc(k,s){
 let c=OC[k];
 if(!c){
  while(OCLRU.length>=OCMAX){const old=OCLRU.shift();const d=OC[old];if(d){d.width=0;d.height=0;}delete OC[old];}
  c=OC[k]=document.createElement('canvas');c.width=s*DPR;c.height=s*DPR;c.g=c.getContext('2d');
 } else { const i=OCLRU.indexOf(k); if(i>=0)OCLRU.splice(i,1); }
 OCLRU.push(k);
 return c;}
function emboss(x,y,box,fn,o={}){const S=box|0,A=oc('A'+S,S),B=oc('B'+S,S),a=A.g,b=B.g,alt=o.alt==null?1:o.alt;
 const _X=X;X=a;a.setTransform(DPR,0,0,DPR,0,0);a.clearRect(0,0,S,S);a.save();a.translate(S/2,S/2);fn();a.restore();X=_X;
 const rim=(dx,dy,col)=>{b.setTransform(DPR,0,0,DPR,0,0);b.globalCompositeOperation='source-over';b.clearRect(0,0,S,S);b.drawImage(A,0,0,S,S);b.globalCompositeOperation='source-in';b.fillStyle=col;b.fillRect(0,0,S,S);b.globalCompositeOperation='destination-out';b.drawImage(A,dx,dy,S,S);};
 // hover: the sprite bobs up and down a few px; its cast shadow on the ground shrinks/grows the opposite way — that separation is what sells the height
 const bob=alt>0?(Math.sin(t*.18+x*.02+y*.01)*.5+.5):0,lift=bob*4*alt;y-=lift;
 X.save();
 if(alt>0){const sh=1-bob*.18;X.globalAlpha=.30*alt*(1-bob*.25);X.fillStyle=LV().shadow;if(!LOW)X.filter='blur(5px)';ell(x+8*alt+bob*3,y+box*.24*alt+lift+bob*2,box*.14*sh,box*.052*sh);X.fill();X.filter='none';}
 if(!LOW){X.globalAlpha=.34;X.filter='brightness(0) blur(2px)';X.drawImage(A,x-S/2+3,y-S/2+4,S,S);X.filter='none';}
 X.globalAlpha=1;if(o.filter)X.filter=o.filter;X.drawImage(A,x-S/2,y-S/2,S,S);X.filter='none';
 rim(1.2,1.8,'#fff');X.globalAlpha=.26;X.drawImage(B,x-S/2,y-S/2,S,S);
 rim(-1.4,-2.0,'#000');X.globalAlpha=.34;X.drawImage(B,x-S/2,y-S/2,S,S);
 // gloss: a soft sheen across the top-left of the silhouette, like light on a shell
 b.globalCompositeOperation='source-over';b.clearRect(0,0,S,S);b.drawImage(A,0,0,S,S);b.globalCompositeOperation='source-in';const gg=b.createLinearGradient(0,0,S*.7,S*.9);gg.addColorStop(0,'rgba(255,255,255,.30)');gg.addColorStop(.45,'rgba(255,255,255,0)');b.fillStyle=gg;b.fillRect(0,0,S,S);X.globalAlpha=.28;X.drawImage(B,x-S/2,y-S/2,S,S);
 X.restore();}
function wings(r,alpha=.6,spread=1){X.save();
 for(const sgn of[-1,1]){for(let k=2;k>=0;k--){const ph=Math.sin(t*1.4-k*.9)*.5;X.globalAlpha=k?.22:.9;const g=X.createLinearGradient(0,0,sgn*r*1.6,-r*.8);g.addColorStop(0,'rgba(240,250,255,.95)');g.addColorStop(1,'rgba(170,210,240,.55)');X.fillStyle=g;ell(sgn*r*.7*spread,-r*.35,r*1.05,r*.42+ph*sgn*.6,sgn*(.5+ph*.25));X.fill();}
  X.globalAlpha=.9;X.strokeStyle='rgba(90,130,170,.75)';X.lineWidth=1;X.beginPath();X.moveTo(0,-r*.3);X.quadraticCurveTo(sgn*r*.8,-r*.9,sgn*r*1.55*spread,-r*.7);X.moveTo(0,-r*.2);X.quadraticCurveTo(sgn*r*.9,-r*.3,sgn*r*1.45*spread,-r*.05);X.moveTo(sgn*r*.5,-r*.55);X.lineTo(sgn*r*.6,-r*.15);X.moveTo(sgn*r*.95,-r*.75);X.lineTo(sgn*r*1.05,-r*.25);X.moveTo(sgn*r*.3,-r*.4);X.lineTo(sgn*r*.35,-r*.05);X.moveTo(sgn*r*.75,-r*.85);X.quadraticCurveTo(sgn*r*.9,-r*.55,sgn*r*.85,-r*.15);X.moveTo(sgn*r*1.2,-r*.7);X.lineTo(sgn*r*1.25,-r*.3);X.stroke();X.globalAlpha=.25;X.fillStyle='rgba(180,220,255,.6)';ell(sgn*r*.9*spread,-r*.55,r*.35,r*.15,sgn*.6);X.fill();}
 X.restore();}
function fuzz(cx,cy,rx,ry,col,n=26,seed=0){X.save();X.strokeStyle=col;X.lineWidth=1;X.lineCap='round';X.beginPath();for(let i=0;i<n;i++){const a=i/n*Math.PI*2+seed,x=cx+Math.cos(a)*rx,y=cy+Math.sin(a)*ry,l=1+((i*7)%3)*.8;X.moveTo(x,y);X.lineTo(x+Math.cos(a)*l*2.2,y+Math.sin(a)*l*2.2);}X.stroke();X.restore();}
function legs(r,col,len=1,wig=1){X.strokeStyle=col;X.lineWidth=Math.max(1.2,r*.09);X.lineCap='round';X.beginPath();for(let i=0;i<3;i++){const yy=-r*.5+i*r*.35,w=Math.sin(t*.5+i*2.1)*r*.08*wig;for(const sgn of[-1,1]){X.moveTo(sgn*r*.4,yy);X.quadraticCurveTo(sgn*r*.8,yy-r*.15+w,sgn*r*.95*len,yy+r*.25+w);X.lineTo(sgn*r*1.05*len,yy+r*.5+w);}}X.stroke();}
function eye(x,y,rx,ry,col='#111'){X.fillStyle=rg(x,y,rx,col==='#111'?'#3a3a3a':col,'#000');ell(x,y,rx,ry);X.fill();X.fillStyle='rgba(255,255,255,.85)';ell(x-rx*.3,y-ry*.35,rx*.32,ry*.3);X.fill();X.fillStyle='rgba(255,255,255,.35)';ell(x+rx*.25,y+ry*.3,rx*.18,ry*.15);X.fill();}
function antennae(r,col='#222',len=1){const sw=Math.sin(t*.12)*r*.08;X.strokeStyle=col;X.lineWidth=Math.max(1.5,r*.1);X.lineCap='round';X.beginPath();X.moveTo(-r*.15,-r*1.4);X.quadraticCurveTo(-r*.5+sw,-r*1.9*len,-r*.75+sw,-r*1.75*len);X.moveTo(r*.15,-r*1.4);X.quadraticCurveTo(r*.5+sw,-r*1.9*len,r*.75+sw,-r*1.75*len);X.stroke();X.fillStyle=col;ell(-r*.75+sw,-r*1.75*len,r*.07,r*.07);X.fill();ell(r*.75+sw,-r*1.75*len,r*.07,r*.07);X.fill();}
// the HERO bee (only the player uses this). Full detail when r>=10 (the HUD lives use a plain small version).
function bee(x,y,r,col,stripe,_w,ang=0){X.save();X.translate(x,y);X.rotate(ang);const bob=Math.sin(t*.25)*r*.03;X.translate(0,bob);const D=r>=10;
 wings(r,.7);
 // legs: jointed, hairy, with pollen baskets on the back pair
 X.strokeStyle='#2a1a05';X.lineWidth=Math.max(1.2,r*.09);X.lineCap='round';X.beginPath();for(let i=0;i<3;i++){const yy=-r*.5+i*r*.35,w=Math.sin(t*.5+i*2.1)*r*.08;for(const sgn of[-1,1]){X.moveTo(sgn*r*.4,yy);X.quadraticCurveTo(sgn*r*.8,yy-r*.15+w,sgn*r*.95,yy+r*.25+w);X.lineTo(sgn*r*1.05,yy+r*.5+w);}}X.stroke();
 if(D){X.strokeStyle='rgba(60,40,10,.7)';X.lineWidth=1;X.beginPath();for(let i=0;i<3;i++){const yy=-r*.5+i*r*.35;for(const sgn of[-1,1])for(let k=0;k<3;k++){const px=sgn*(r*.55+k*r*.15),py=yy+k*r*.08;X.moveTo(px,py);X.lineTo(px+sgn*r*.05,py+r*.09);}}X.stroke();
  for(const sgn of[-1,1]){X.fillStyle=rg(sgn*r*.95,r*.2,r*.16,'#ffe27a','#d89a10');ell(sgn*r*.95,r*.2,r*.17,r*.13);X.fill();}}
 // stinger
 X.fillStyle=rg(0,r*1.05,r*.2,'#555','#000');X.beginPath();X.moveTo(0,r*1.3);X.lineTo(-r*.16,r*.88);X.lineTo(r*.16,r*.88);X.fill();
 // abdomen: segmented, banded, glossy
 X.fillStyle=rg(0,r*.2,r*.9,col,'#6a3a00');ell(0,r*.2,r*.72,r*.95);X.fill();
 X.save();X.beginPath();X.ellipse(0,r*.2,r*.72,r*.95,0,0,7);X.clip();X.fillStyle=stripe;for(let i=0;i<3;i++){X.beginPath();const yy=r*.05+i*r*.4;X.moveTo(-r,yy);X.quadraticCurveTo(0,yy+r*.16,r,yy);X.lineTo(r,yy+r*.2);X.quadraticCurveTo(0,yy+r*.36,-r,yy+r*.2);X.fill();}
 if(D){X.strokeStyle='rgba(0,0,0,.35)';X.lineWidth=1;for(let i=0;i<4;i++){const yy=r*.02+i*r*.4-r*.06;X.beginPath();X.moveTo(-r,yy);X.quadraticCurveTo(0,yy+r*.16,r,yy);X.stroke();}
  X.strokeStyle='rgba(255,240,180,.5)';for(let i=0;i<3;i++){const yy=r*.05+i*r*.4+r*.22;X.beginPath();X.moveTo(-r*.6,yy);X.quadraticCurveTo(0,yy+r*.12,r*.6,yy);X.stroke();}
  X.fillStyle='rgba(0,0,0,.25)';ell(r*.25,r*.75,r*.4,r*.5);X.fill();}
 X.fillStyle='rgba(255,255,255,.3)';ell(-r*.28,-r*.1,r*.22,r*.45,.3);X.fill();X.fillStyle='rgba(255,255,255,.14)';ell(-r*.2,r*.55,r*.12,r*.25,.3);X.fill();X.restore();
 X.strokeStyle='rgba(0,0,0,.4)';X.lineWidth=1;ell(0,r*.2,r*.72,r*.95);X.stroke();
 // thorax: fuzzy, with a fur pattern
 fuzz(0,-r*.55,r*.6,r*.52,'#8a6a2a',D?44:28,t*.01);X.fillStyle=rg(0,-r*.55,r*.55,'#e2bd63','#5a3a10');ell(0,-r*.55,r*.58,r*.5);X.fill();
 if(D){X.strokeStyle='rgba(90,60,20,.55)';X.lineWidth=1;X.lineCap='round';X.beginPath();for(let i=0;i<26;i++){const a=i/26*Math.PI*2,rx=r*.42*Math.cos(a),ry=-r*.55+r*.36*Math.sin(a);X.moveTo(rx*.55,ry*.5-r*.27);X.lineTo(rx,ry);}X.stroke();X.fillStyle='rgba(255,255,255,.22)';ell(-r*.18,-r*.72,r*.24,r*.17,-.4);X.fill();X.fillStyle='rgba(0,0,0,.18)';ell(r*.2,-r*.4,r*.28,r*.18,.4);X.fill();}
 else{X.fillStyle='rgba(255,255,255,.25)';ell(-r*.18,-r*.7,r*.22,r*.16,-.4);X.fill();}
 // head with faceted eyes, mandibles, proboscis
 X.fillStyle=rg(0,-r*1.05,r*.45,'#4a4a4a','#050505');ell(0,-r*1.05,r*.42,r*.4);X.fill();
 eye(-r*.22,-r*1.1,r*.18,r*.23);eye(r*.22,-r*1.1,r*.18,r*.23);
 if(D){X.strokeStyle='rgba(255,255,255,.18)';X.lineWidth=.6;X.beginPath();for(const sg of[-1,1])for(let k=-2;k<=2;k++){X.moveTo(sg*r*.22-r*.15,-r*1.1+k*r*.07);X.lineTo(sg*r*.22+r*.15,-r*1.1+k*r*.07);X.moveTo(sg*r*.22+k*r*.06,-r*1.3);X.lineTo(sg*r*.22+k*r*.06,-r*.9);}X.stroke();
  X.strokeStyle='#1a1a1a';X.lineWidth=Math.max(1,r*.08);X.lineCap='round';X.beginPath();X.moveTo(-r*.12,-r*.72);X.quadraticCurveTo(-r*.2,-r*.62,-r*.08,-r*.58);X.moveTo(r*.12,-r*.72);X.quadraticCurveTo(r*.2,-r*.62,r*.08,-r*.58);X.stroke();X.strokeStyle='#3a2a10';X.lineWidth=Math.max(1,r*.06);X.beginPath();X.moveTo(0,-r*.7);X.lineTo(0,-r*.5);X.stroke();X.fillStyle='rgba(255,255,255,.18)';ell(-r*.1,-r*1.28,r*.16,r*.08,-.3);X.fill();}
 else{X.fillStyle='#222';ell(0,-r*.78,r*.1,r*.06);X.fill();}
 // antennae, jointed
 const sw=Math.sin(t*.12)*r*.08;X.strokeStyle='#222';X.lineWidth=Math.max(1.5,r*.1);X.lineCap='round';X.beginPath();X.moveTo(-r*.15,-r*1.4);X.lineTo(-r*.42+sw,-r*1.7);X.lineTo(-r*.75+sw,-r*1.75);X.moveTo(r*.15,-r*1.4);X.lineTo(r*.42+sw,-r*1.7);X.lineTo(r*.75+sw,-r*1.75);X.stroke();X.fillStyle='#222';ell(-r*.75+sw,-r*1.75,r*.08,r*.08);X.fill();ell(r*.75+sw,-r*1.75,r*.08,r*.08);X.fill();if(D){ell(-r*.42+sw,-r*1.7,r*.06,r*.06);X.fill();ell(r*.42+sw,-r*1.7,r*.06,r*.06);X.fill();}
 X.restore();}
// a WASP: slim waist, long legs dangling, pointed abdomen — not the hero
function waspBody(r,col='#ffcc33',dark='#1a1a1a',mand=true){X.save();X.rotate(Math.PI);
 wings(r*.9,.6,1.15);
 X.strokeStyle='#3a2a00';X.lineWidth=Math.max(1.2,r*.1);X.lineCap='round';X.beginPath();for(let i=0;i<3;i++){const yy=-r*.3+i*r*.3,w=Math.sin(t*.4+i)*r*.1;for(const sgn of[-1,1]){X.moveTo(sgn*r*.3,yy);X.lineTo(sgn*r*.8,yy-r*.2+w);X.lineTo(sgn*r*1.1,yy+r*.7+w);}}X.stroke();
 X.fillStyle=rg(0,r*1.5,r*.15,'#666','#000');X.beginPath();X.moveTo(0,r*1.9);X.lineTo(-r*.12,r*1.45);X.lineTo(r*.12,r*1.45);X.fill();
 X.fillStyle=rg(0,r*.8,r*.7,col,'#8a5a00');X.beginPath();X.moveTo(0,r*.15);X.quadraticCurveTo(r*.75,r*.5,r*.5,r*1.2);X.quadraticCurveTo(r*.2,r*1.55,0,r*1.55);X.quadraticCurveTo(-r*.2,r*1.55,-r*.5,r*1.2);X.quadraticCurveTo(-r*.75,r*.5,0,r*.15);X.fill();
 X.save();X.clip();X.fillStyle=dark;for(let i=0;i<4;i++){const yy=r*.35+i*r*.3;X.beginPath();X.moveTo(-r,yy);X.quadraticCurveTo(0,yy+r*.12,r,yy);X.lineTo(r,yy+r*.13);X.quadraticCurveTo(0,yy+r*.25,-r,yy+r*.13);X.fill();}X.restore();
 X.fillStyle=dark;ell(0,r*.1,r*.14,r*.14);X.fill();
 X.fillStyle=rg(0,-r*.35,r*.5,col,'#7a4a00');ell(0,-r*.35,r*.48,r*.48);X.fill();X.fillStyle=dark;ell(0,-r*.35,r*.2,r*.12);X.fill();
 X.fillStyle=rg(0,-r*1.05,r*.4,'#333','#000');ell(0,-r*1.0,r*.4,r*.36);X.fill();eye(-r*.2,-r*1.05,r*.16,r*.2,'#c8c800');eye(r*.2,-r*1.05,r*.16,r*.2,'#c8c800');
 if(mand){X.strokeStyle='#3a2a00';X.lineWidth=r*.12;X.beginPath();X.moveTo(-r*.15,-r*1.3);X.lineTo(-r*.3,-r*1.55);X.moveTo(r*.15,-r*1.3);X.lineTo(r*.3,-r*1.55);X.stroke();}
 antennae(r*.9,'#3a2a00');
 X.restore();}

// eye positions per bug (sprite space) so pupils can track the bee and brows/sweat can show mood. rot = sprite is drawn upside-down (wasps)
const EYES={katydid:{e:[[-2.5,-12],[2.5,-12]],r:1.7},weevil:{e:[[-3,-11],[3,-11]],r:1.3},glowworm:{e:[[-1.8,-12.5],[1.8,-12.5]],r:1.1},termite:{e:[[-1.8,-9.5],[1.8,-9.5]],r:1},horsefly:{e:[[-3.5,-10],[3.5,-10]],r:3.4},dungbeetle:{e:[[-3,-15],[3,-15]],r:1.4},butterfly:{e:[[-1.4,-8.5],[1.4,-8.5]],r:1},snail:{e:[[13,-9],[16,-7]],r:1.5},earwig:{e:[[-2,-13],[2,-13]],r:1.3},fly:{e:[[-3.6,-8],[3.6,-8]],r:3.2},mosquito:{e:[[-2,-10],[2,-10]],r:1.6},wasp:{e:[[-2.2,11.5],[2.2,11.5]],r:1.8,rot:1},hornet:{e:[[-2,10.5],[2,10.5]],r:1.6,rot:1},beetle:{e:[[-3,-21],[3,-21]],r:1.8},moth:{e:[[-2,-11],[2,-11]],r:1.4},gnat:{e:[[-1.4,-6.5],[1.4,-6.5]],r:1.2},ant:{e:[[-2.6,-11],[2.6,-11]],r:1.7},ladybug:{e:[[-3.5,-13],[3.5,-13]],r:1.3},firefly:{e:[[-1.8,-11.5],[1.8,-11.5]],r:1.2},grasshopper:{e:[[-3,-14],[3,-14]],r:2},stinkbug:{e:[[-2.5,-16],[2.5,-16]],r:1.4},cicada:{e:[[-6,-12],[6,-12]],r:2.6}};
function face(e){if(e.tiny)return;const m=EYES[A(e.type)];if(!m)return;const dx=P.x-e.x,dy=P.y-e.y,d=Math.hypot(dx,dy)||1;let ux=dx/d,uy=dy/d;if(m.rot){ux=-ux;uy=-uy;}
 const scared=e.hp<e.maxhp*.35,angry=e.elite||(e.ft!=null&&e.ft<40&&SHOOTERS.includes(e.type));
 for(const [ex,ey] of m.e){X.fillStyle='#000';ell(ex+ux*m.r*.45,ey+uy*m.r*.45,m.r*.45,m.r*.5);X.fill();X.fillStyle='rgba(255,255,255,.9)';ell(ex+ux*m.r*.45-m.r*.15,ey+uy*m.r*.45-m.r*.2,m.r*.14,m.r*.14);X.fill();
  if(scared){X.strokeStyle='rgba(255,255,255,.85)';X.lineWidth=.8;ell(ex,ey,m.r*1.25,m.r*1.35);X.stroke();}}
 const L=m.e[0],Rr=m.e[m.e.length-1],up=m.rot?1:-1;
 if(angry){X.strokeStyle='#100';X.lineWidth=Math.max(1,m.r*.5);X.lineCap='round';X.beginPath();X.moveTo(L[0]-m.r*1.1,L[1]+up*m.r*1.9);X.lineTo(L[0]+m.r*.7,L[1]+up*m.r*1.1);X.moveTo(Rr[0]+m.r*1.1,Rr[1]+up*m.r*1.9);X.lineTo(Rr[0]-m.r*.7,Rr[1]+up*m.r*1.1);X.stroke();}
 else if(scared){X.strokeStyle='#100';X.lineWidth=Math.max(.8,m.r*.4);X.lineCap='round';X.beginPath();X.moveTo(L[0]-m.r*1,L[1]+up*m.r*1.2);X.lineTo(L[0]+m.r*.6,L[1]+up*m.r*1.9);X.moveTo(Rr[0]+m.r*1,Rr[1]+up*m.r*1.2);X.lineTo(Rr[0]-m.r*.6,Rr[1]+up*m.r*1.9);X.stroke();
  const sw=(e.t*.4)%14;X.fillStyle='rgba(150,220,255,.9)';X.beginPath();X.moveTo(Rr[0]+m.r*1.8,Rr[1]-m.r+sw*.3);X.quadraticCurveTo(Rr[0]+m.r*2.4,Rr[1]+sw*.5,Rr[0]+m.r*1.8,Rr[1]+m.r*.6+sw*.5);X.quadraticCurveTo(Rr[0]+m.r*1.2,Rr[1]+sw*.5,Rr[0]+m.r*1.8,Rr[1]-m.r+sw*.3);X.fill();}}
const dep=y=>.62+.46*clamp(y/H,0,1);   // 0.62 far at the top, ~1.08 right in your face
function drawEnemy(e){if(e.tiny&&SPR[e.type]){X.save();X.globalAlpha=.22;X.fillStyle='#202030';ell(e.x,e.y,13,9);X.fill();X.globalAlpha=1;X.translate(e.x,e.y);X.rotate(faceRot(e.type)+Math.sin(e.t*.4+e.ph)*.2);if(e.fl>0)X.filter='brightness(2.6)';drawSprite(SPR[e.type],16*dep(e.y),0);X.filter='none';X.restore();return;}
 if(e.tiny){X.save();X.globalAlpha=.22;X.fillStyle='#202030';ell(e.x,e.y,13,9);X.fill();X.globalAlpha=1;X.translate(e.x,e.y);const wf=Math.sin(t*2+e.ph)*.5;X.globalAlpha=.7;X.fillStyle='#e8f0ff';ell(-3,-1,3.5,1.3,-.6+wf);X.fill();ell(3,-1,3.5,1.3,.6-wf);X.fill();X.globalAlpha=1;X.fillStyle='#fff';ell(0,0,3.2,3.6);X.fill();X.fillStyle=e.fl>0?'#fff':'#1a1a2a';ell(0,0,2.2,2.8);X.fill();X.fillStyle='#ff4040';ell(-.8,-1.2,.6,.6);X.fill();ell(.8,-1.2,.6,.6);X.fill();X.restore();return;}
 const sc=(e.elite?1.55:1.35)*dep(e.y),box=e.r*2*sc*5.0+30;const vx=e.x-(e.px==null?e.x:e.px),vy=e.y-(e.py==null?e.y:e.py);e.px=e.x;e.py=e.y;const sq=clamp(Math.abs(vx)*.03,0,.18),st=clamp(Math.abs(vy)*.025,0,.15);
 const spr=SPR[e.type];if(spr){emboss(e.x,e.y,box,()=>{const br=1+Math.sin(e.t*.25+e.ph)*.03,wob=Math.sin(e.t*.4+e.ph)*.05;X.scale((1+sq-st*.5)*br,(1-sq*.5+st)/br);const rot=e.pat==='dash'?(e.dx>0?-Math.PI/2:Math.PI/2):(faceRot(e.type)+Math.atan2(vx,vy)*.18+wob);drawSprite(spr,e.r*2*sc*4.0,rot);},{filter:e.fl>0?'brightness(2.6) saturate(.3)':e.slow>0?'sepia(.7) brightness(1.1)':(e.elite?'saturate(1.6) brightness(1.15)':null)});
  if(e.label>0&&BUGINFO[e.type]){X.save();X.globalAlpha=Math.min(1,e.label/40);X.fillStyle='#fff';X.font='bold 11px '+FONT;X.textAlign='center';X.shadowColor='#000';X.shadowBlur=4;X.fillText(BUGINFO[e.type].name,e.x,e.y+e.r*sc+(e.elite?36:24));X.restore();}return;}
 if(e.elite){X.save();X.strokeStyle='rgba(255,215,0,.9)';X.lineWidth=3;X.setLineDash([5,4]);X.lineDashOffset=-e.t*.5;ell(e.x,e.y,e.r*sc+10,e.r*sc+10);X.stroke();X.setLineDash([]);X.fillStyle='#ffd700';X.font='bold 10px '+FONT;X.textAlign='center';X.shadowColor='#000';X.shadowBlur=3;X.fillText('ELITE',e.x,e.y+e.r*sc+24);X.restore();}
 emboss(e.x,e.y,box,()=>{X.scale(sc*(1+sq-st*.5),sc*(1-sq*.5+st));const ph=e.t*.3;
 switch(A(e.type)){
  case 'fly':{X.save();X.rotate(Math.PI);wings(9,.6,1.1);X.restore();legs(9,'#0d3a30',1.1);
   X.fillStyle=rg(0,2,10,'#a8f0dc','#145245');ell(0,2,7,10);X.fill();X.fillStyle='rgba(180,255,240,.35)';ell(-2.5,-1,2.2,5,.2);X.fill();X.strokeStyle='rgba(0,40,30,.5)';X.lineWidth=1;for(let i=0;i<3;i++){X.beginPath();X.moveTo(-6.5,2+i*3);X.quadraticCurveTo(0,3.5+i*3,6.5,2+i*3);X.stroke();}
   X.fillStyle=rg(0,-6,5,'#cffff2','#2f7a68');ell(0,-7,5,5);X.fill();eye(-3.6,-8,3.2,3.7,'#d0392b');eye(3.6,-8,3.2,3.7,'#d0392b');
   X.strokeStyle='#0d3a30';X.lineWidth=1;X.beginPath();X.moveTo(-1,-11);X.lineTo(-3,-14);X.moveTo(1,-11);X.lineTo(3,-14);X.stroke();break;}
  case 'mosquito':{const lw=Math.sin(ph)*1.5;X.strokeStyle='#2b2b45';X.lineWidth=1.2;X.lineCap='round';X.beginPath();for(let i=-1;i<=1;i++){for(const sg of[-1,1]){X.moveTo(0,i*4);X.quadraticCurveTo(sg*8,i*4-4+lw,sg*13,i*4+8+lw);X.lineTo(sg*16,i*4+14+lw);}}X.stroke();
   for(let k=0;k<2;k++){X.globalAlpha=k?.25:.55;const wf=Math.sin(t*1.6-k)*.35;X.fillStyle='#dfe8ff';ell(-7,-3,8,3,-.5+wf);X.fill();ell(7,-3,8,3,.5-wf);X.fill();}X.globalAlpha=1;
   X.fillStyle=rg(0,0,8,'#8a8ab0','#23233a');ell(0,1,3,9);X.fill();X.strokeStyle='rgba(255,255,255,.25)';X.lineWidth=1;for(let i=0;i<4;i++){X.beginPath();X.moveTo(-2.6,-4+i*3.2);X.lineTo(2.6,-4+i*3.2);X.stroke();}
   X.fillStyle=rg(0,-9,4,'#6a6a90','#1a1a30');ell(0,-9,3.5,3);X.fill();eye(-2,-10,1.6,1.6,'#ff4040');eye(2,-10,1.6,1.6,'#ff4040');
   X.strokeStyle='#eee';X.lineWidth=1.4;X.beginPath();X.moveTo(0,9);X.lineTo(0,21);X.stroke();X.fillStyle='#f55';ell(0,21,1.2,1.2);X.fill();break;}
  case 'wasp':waspBody(11);break;
  case 'hornet':waspBody(10,'#e07a1c','#2a1000');break;
  case 'butterfly':{const f=Math.sin(t*.35+e.ph)*.45;for(const sg of[-1,1]){X.save();X.scale(1,1+f*.3);X.fillStyle=rg(sg*11,-3,16,'#ffd070','#e05a10');X.beginPath();X.moveTo(0,-2);X.quadraticCurveTo(sg*24,-20,sg*20,-4);X.quadraticCurveTo(sg*22,6,sg*10,4);X.quadraticCurveTo(sg*18,14,sg*6,13);X.closePath();X.fill();X.fillStyle='#2a1000';X.beginPath();X.moveTo(0,-2);X.quadraticCurveTo(sg*24,-20,sg*20,-4);X.quadraticCurveTo(sg*22,6,sg*10,4);X.quadraticCurveTo(sg*18,14,sg*6,13);X.closePath();X.lineWidth=1.4;X.strokeStyle='#2a1000';X.stroke();X.fillStyle='#fff';for(const [a,b] of [[14,-10],[12,0],[8,8]]){ell(sg*a,b,1.6,1.6);X.fill();}X.fillStyle='rgba(60,20,80,.7)';ell(sg*17,-5,3,2.2);X.fill();X.restore();}
   X.fillStyle=rg(0,0,7,'#5a4a3a','#1a1008');ell(0,2,2.6,10);X.fill();ell(0,-8,3,3);X.fill();eye(-1.4,-8.5,1,1,'#222');eye(1.4,-8.5,1,1,'#222');X.strokeStyle='#1a1008';X.lineWidth=1;X.beginPath();X.moveTo(-1,-11);X.quadraticCurveTo(-6,-18,-8,-16);X.moveTo(1,-11);X.quadraticCurveTo(6,-18,8,-16);X.stroke();break;}
  case 'spiderling':{X.strokeStyle='rgba(255,255,255,.7)';X.lineWidth=1;X.beginPath();X.moveTo(0,-8);X.lineTo(0,-(e.y+20)/1.35);X.stroke();X.strokeStyle='#1a1a22';X.lineWidth=1.4;X.lineCap='round';X.beginPath();for(let k=0;k<4;k++){const a=.3+k*.45,f=Math.sin(t*.3+k)*1.5;for(const sg of[-1,1]){X.moveTo(0,0);X.lineTo(sg*Math.cos(a)*9,Math.sin(a)*9-f-3);X.lineTo(sg*Math.cos(a)*13,Math.sin(a)*13+3);}}X.stroke();
   X.fillStyle=rg(0,2,8,'#6a6a7e','#15151c');ell(0,3,6,7);X.fill();X.fillStyle='#b01020';ell(0,3,1.6,3);X.fill();X.fillStyle=rg(0,-6,4,'#4a4a5e','#0a0a10');ell(0,-6,4,3.5);X.fill();X.fillStyle='#ff3333';for(let k=0;k<4;k++){ell(-3+k*2,-7.5,.8,.8);X.fill();}break;}
  case 'snail':{X.fillStyle=rg(0,4,10,'#d8c8a8','#6a5a3a');X.beginPath();X.moveTo(-14,6);X.quadraticCurveTo(-8,-2,0,0);X.quadraticCurveTo(10,2,12,6);X.quadraticCurveTo(0,12,-14,6);X.fill();
   X.fillStyle=rg(-2,-4,12,'#e0a060','#5a2a10');ell(-2,-3,11,9);X.fill();X.strokeStyle='rgba(60,20,0,.6)';X.lineWidth=1.5;X.beginPath();for(let k=0;k<3;k++){X.arc(-2,-3,3+k*2.8,k*.6,k*.6+4.5);}X.stroke();X.fillStyle='rgba(255,255,255,.25)';ell(-6,-8,4,3,.4);X.fill();
   X.strokeStyle='#8a6a4a';X.lineWidth=1.6;X.lineCap='round';X.beginPath();X.moveTo(9,1);X.lineTo(13,-8);X.moveTo(11,2);X.lineTo(16,-6);X.stroke();X.fillStyle='#222';ell(13,-9,1.5,1.5);X.fill();ell(16,-7,1.5,1.5);X.fill();break;}
  case 'katydid':{const ph2=e.t%100,crouch=ph2>50&&ph2<60;X.strokeStyle='#4a8a20';X.lineWidth=2;X.lineCap='round';X.beginPath();for(const sg of[-1,1]){X.moveTo(sg*5,4);X.lineTo(sg*15,crouch?-1:-7);X.lineTo(sg*13,10);X.moveTo(sg*4,-4);X.lineTo(sg*9,-3);X.lineTo(sg*11,2);}X.stroke();
   for(const sg of[-1,1]){X.fillStyle=rg(sg*6,2,14,'#c8f080','#4a8a20');X.beginPath();X.moveTo(0,-8);X.quadraticCurveTo(sg*14,-2,sg*8,14);X.quadraticCurveTo(sg*2,10,0,-8);X.fill();X.strokeStyle='rgba(20,60,0,.5)';X.lineWidth=1;X.beginPath();X.moveTo(0,-6);X.quadraticCurveTo(sg*7,0,sg*5,12);X.stroke();}
   X.fillStyle=rg(0,-11,6,'#b8e870','#3f7a22');ell(0,-11,4.5,5);X.fill();eye(-2.5,-12,1.6,1.9,'#222');eye(2.5,-12,1.6,1.9,'#222');X.strokeStyle='#3f7a22';X.lineWidth=1;X.beginPath();X.moveTo(-1,-16);X.quadraticCurveTo(-14,-30,-18,-24);X.moveTo(1,-16);X.quadraticCurveTo(14,-30,18,-24);X.stroke();break;}
  case 'strider':{X.rotate(e.dx>0?Math.PI/2:-Math.PI/2);X.strokeStyle='#4a5a5a';X.lineWidth=1.2;X.lineCap='round';X.beginPath();for(const sg of[-1,1]){X.moveTo(sg*2,-2);X.lineTo(sg*16,-10);X.lineTo(sg*24,-2);X.moveTo(sg*2,3);X.lineTo(sg*16,10);X.lineTo(sg*26,6);X.moveTo(sg*2,-5);X.lineTo(sg*7,-11);}X.stroke();
   X.fillStyle='rgba(255,255,255,.35)';for(const sg of[-1,1]){ell(sg*24,-2,4,1.5);X.fill();ell(sg*26,6,4,1.5);X.fill();}
   X.fillStyle=rg(0,0,9,'#b8c8c8','#3a4a4a');ell(0,1,2.6,9);X.fill();X.fillStyle=rg(0,-8,4,'#a0b0b0','#2a3a3a');ell(0,-8,3,2.8);X.fill();eye(-1.6,-8.5,1.2,1.2,'#111');eye(1.6,-8.5,1.2,1.2,'#111');break;}
  case 'weevil':{X.strokeStyle='#3a2a1a';X.lineWidth=1.5;X.beginPath();for(let i=0;i<3;i++){const yy=-3+i*5;for(const sg of[-1,1]){X.moveTo(sg*5,yy);X.lineTo(sg*11,yy+3);}}X.stroke();
   X.fillStyle=rg(0,2,12,'#b08a5a','#3a2210');ell(0,3,9,12);X.fill();X.strokeStyle='rgba(0,0,0,.35)';X.lineWidth=1;X.beginPath();X.moveTo(0,-8);X.lineTo(0,14);X.stroke();for(let i=0;i<4;i++){X.fillStyle='rgba(0,0,0,.25)';ell(-4,-4+i*5,1.2,1.2);X.fill();ell(4,-4+i*5,1.2,1.2);X.fill();}X.fillStyle='rgba(255,255,255,.2)';ell(-3,-3,2.5,6,.3);X.fill();
   X.fillStyle=rg(0,-11,5,'#8a6a4a','#2a1a08');ell(0,-11,5,4.5);X.fill();X.strokeStyle='#2a1a08';X.lineWidth=2.6;X.lineCap='round';X.beginPath();X.moveTo(0,-13);X.lineTo(0,-24);X.stroke();X.strokeStyle='#4a3a2a';X.lineWidth=1;X.beginPath();X.moveTo(0,-19);X.lineTo(-5,-23);X.moveTo(0,-19);X.lineTo(5,-23);X.stroke();eye(-3,-11,1.3,1.3,'#111');eye(3,-11,1.3,1.3,'#111');break;}
  case 'glowworm':{const g=e.glow||0;X.fillStyle=`rgba(180,255,110,${.15+g*.35})`;ell(0,4,16+g*6,12+g*4);X.fill();X.strokeStyle='#3a5a1a';X.lineWidth=1.2;X.beginPath();for(let i=0;i<4;i++){const yy=-6+i*5;for(const sg of[-1,1]){X.moveTo(sg*4,yy);X.lineTo(sg*8,yy+2);}}X.stroke();
   for(let i=0;i<6;i++){X.fillStyle=rg(0,-8+i*4,5,i>=3?`rgb(${200+g*55|0},255,${100+g*60|0})`:'#8a9a5a','#2a3a10');ell(0,-8+i*4,5-i*.3,3);X.fill();}
   X.fillStyle=rg(0,-12,4,'#5a6a3a','#1a2a08');ell(0,-12,4,3.5);X.fill();eye(-1.8,-12.5,1.1,1.1,'#111');eye(1.8,-12.5,1.1,1.1,'#111');break;}
  case 'termite':{X.strokeStyle='#8a7a5a';X.lineWidth=1.2;X.beginPath();for(let i=0;i<3;i++){const yy=-3+i*3.5;for(const sg of[-1,1]){X.moveTo(sg*2.5,yy);X.lineTo(sg*7,yy-2+Math.sin(t*.6+i)*1.5);X.lineTo(sg*9,yy+2);}}X.stroke();
   X.fillStyle=rg(0,4,7,'#f4ead0','#a08a5a');ell(0,5,4.5,7);X.fill();X.fillStyle=rg(0,-3,3,'#e8d8b0','#8a7a5a');ell(0,-3,3,3);X.fill();X.fillStyle=rg(0,-9,4,'#d8b070','#6a4a1a');ell(0,-9,4.2,3.8);X.fill();eye(-1.8,-9.5,1,1,'#222');eye(1.8,-9.5,1,1,'#222');X.strokeStyle='#3a2a10';X.lineWidth=1.3;X.beginPath();X.moveTo(-1.5,-12);X.lineTo(-3.5,-15);X.moveTo(1.5,-12);X.lineTo(3.5,-15);X.stroke();break;}
  case 'horsefly':{X.save();X.rotate(Math.PI);wings(11,.6,1.2);X.restore();legs(11,'#1a1a10',1.1);
   X.fillStyle=rg(0,2,12,'#7a7a5a','#1a1a10');ell(0,3,8,12);X.fill();X.strokeStyle='rgba(0,0,0,.4)';X.lineWidth=1;for(let i=0;i<4;i++){X.beginPath();X.moveTo(-7,-2+i*4);X.quadraticCurveTo(0,0+i*4,7,-2+i*4);X.stroke();}X.fillStyle='rgba(255,255,255,.2)';ell(-3,-2,2.5,6,.2);X.fill();
   X.fillStyle=rg(0,-9,7,'#5a5a4a','#0a0a05');ell(0,-9,7,6);X.fill();eye(-3.5,-10,3.6,4,'#2ac080');eye(3.5,-10,3.6,4,'#2ac080');X.strokeStyle='#1a1a10';X.lineWidth=1.6;X.beginPath();X.moveTo(0,-4);X.lineTo(0,2);X.stroke();break;}
  case 'dungbeetle':{X.strokeStyle='#1a1008';X.lineWidth=2.2;X.lineCap='round';X.beginPath();for(let i=0;i<3;i++){const yy=-4+i*6;for(const sg of[-1,1]){X.moveTo(sg*8,yy);X.lineTo(sg*15,yy-4);X.lineTo(sg*17,yy+3);}}X.stroke();
   X.fillStyle=rg(0,0,18,'#6a5a4a','#0a0805');ell(0,1,14,16);X.fill();X.strokeStyle='rgba(0,0,0,.5)';X.lineWidth=1.5;X.beginPath();X.moveTo(0,-13);X.lineTo(0,16);X.stroke();X.strokeStyle='rgba(255,255,255,.15)';X.lineWidth=1;for(const sg of[-1,1])for(let k=1;k<=2;k++){X.beginPath();X.moveTo(sg*k*4,-11+k*2);X.quadraticCurveTo(sg*k*5,2,sg*k*4,14-k*2);X.stroke();}X.fillStyle='rgba(255,255,255,.18)';ell(-5,-6,3.5,7,.3);X.fill();
   X.fillStyle=rg(0,-15,6,'#4a3a2a','#000');ell(0,-15,7,5);X.fill();X.fillStyle='#2a1a08';X.beginPath();X.moveTo(-6,-18);X.lineTo(-2,-26);X.lineTo(2,-26);X.lineTo(6,-18);X.closePath();X.fill();eye(-3,-15,1.4,1.4,'#ffe040');eye(3,-15,1.4,1.4,'#ffe040');
   X.fillStyle=rg(0,24,9,'#8a6a3a','#2a1a08');ell(0,24,9,8);X.fill();X.strokeStyle='rgba(0,0,0,.35)';X.lineWidth=1;X.beginPath();X.moveTo(-6,20);X.quadraticCurveTo(0,26,6,20);X.moveTo(-5,28);X.quadraticCurveTo(0,24,5,28);X.stroke();break;}
  case 'earwig':{X.strokeStyle='#3a1a08';X.lineWidth=1.4;X.beginPath();for(let i=0;i<3;i++){const yy=-4+i*4;for(const sg of[-1,1]){X.moveTo(sg*3,yy);X.lineTo(sg*9,yy-3);X.lineTo(sg*11,yy+2);}}X.stroke();
   X.fillStyle=rg(0,2,12,'#a86a3a','#2a1008');ell(0,3,4.5,13);X.fill();X.strokeStyle='rgba(0,0,0,.4)';X.lineWidth=1;for(let i=0;i<6;i++){X.beginPath();X.moveTo(-4,-6+i*3.5);X.lineTo(4,-6+i*3.5);X.stroke();}X.fillStyle='rgba(255,255,255,.2)';ell(-1.5,-2,1.5,7,.1);X.fill();
   const pw=Math.sin(t*.3+e.ph)*1.5;X.strokeStyle='#2a1008';X.lineWidth=2;X.lineCap='round';X.beginPath();X.moveTo(-2,15);X.quadraticCurveTo(-7+pw,22,-3+pw,27);X.moveTo(2,15);X.quadraticCurveTo(7-pw,22,3-pw,27);X.stroke();
   X.fillStyle=rg(0,-12,5,'#8a5a2a','#1a0800');ell(0,-12,4.5,4);X.fill();eye(-2,-13,1.3,1.3,'#222');eye(2,-13,1.3,1.3,'#222');X.strokeStyle='#2a1008';X.lineWidth=1;X.beginPath();X.moveTo(-1,-16);X.lineTo(-6,-22);X.moveTo(1,-16);X.lineTo(6,-22);X.stroke();break;}
  case 'grasshopper':{const ph2=e.t%100,crouch=ph2>50&&ph2<60;X.strokeStyle='#3f7a22';X.lineWidth=2.2;X.lineCap='round';X.beginPath();for(const sg of[-1,1]){X.moveTo(sg*5,4);X.lineTo(sg*14,crouch?-2:-6);X.lineTo(sg*12,10);X.moveTo(sg*4,-4);X.lineTo(sg*9,-2);X.lineTo(sg*11,3);}X.stroke();
   X.fillStyle=rg(0,0,14,'#b8f070','#3f7a22');ell(0,2,6,14);X.fill();X.fillStyle='rgba(255,255,255,.22)';ell(-2,-4,2,7,.2);X.fill();X.strokeStyle='rgba(0,60,0,.4)';X.lineWidth=1;for(let i=0;i<5;i++){X.beginPath();X.moveTo(-5,-4+i*4);X.lineTo(5,-4+i*4);X.stroke();}
   X.fillStyle=rg(0,-2,9,'#d0ff90','#5a9a30');X.beginPath();X.moveTo(-1,-10);X.lineTo(5,2);X.lineTo(3,12);X.lineTo(-1,-10);X.fill();
   X.fillStyle=rg(0,-13,6,'#a0e060','#3f7a22');ell(0,-13,5,5.5);X.fill();eye(-3,-14,2,2.4,'#222');eye(3,-14,2,2.4,'#222');X.strokeStyle='#3f7a22';X.lineWidth=1.2;X.beginPath();X.moveTo(-2,-18);X.quadraticCurveTo(-10,-30,-4,-34);X.moveTo(2,-18);X.quadraticCurveTo(10,-30,4,-34);X.stroke();break;}
  case 'stinkbug':{X.strokeStyle='#3a3a1a';X.lineWidth=1.6;X.beginPath();for(let i=0;i<3;i++){const yy=-5+i*6;for(const sg of[-1,1]){X.moveTo(sg*8,yy);X.lineTo(sg*15,yy+4);}}X.stroke();
   X.fillStyle=rg(0,0,16,'#a8b860','#3a4a1a');X.beginPath();X.moveTo(0,-14);X.lineTo(13,-6);X.lineTo(10,8);X.lineTo(0,16);X.lineTo(-10,8);X.lineTo(-13,-6);X.closePath();X.fill();
   X.strokeStyle='rgba(0,0,0,.35)';X.lineWidth=1.2;X.beginPath();X.moveTo(0,-8);X.lineTo(0,16);X.moveTo(-13,-6);X.lineTo(13,-6);X.stroke();X.fillStyle='rgba(30,40,10,.5)';for(const[a,b]of[[-6,0],[6,0],[-4,8],[4,8],[0,-3]]){ell(a,b,1.6,1.6);X.fill();}X.fillStyle='rgba(255,255,255,.2)';ell(-5,-4,3,5,.4);X.fill();
   X.fillStyle=rg(0,-15,5,'#6a7a3a','#1a2a0a');ell(0,-15,5,4);X.fill();eye(-2.5,-16,1.4,1.4,'#c8c800');eye(2.5,-16,1.4,1.4,'#c8c800');X.strokeStyle='#3a3a1a';X.lineWidth=1;X.beginPath();X.moveTo(-2,-18);X.lineTo(-7,-24);X.moveTo(2,-18);X.lineTo(7,-24);X.stroke();
   if(e.ft<40){X.fillStyle='rgba(154,205,50,.3)';ell(0,14,8+ (40-e.ft)*.3,5);X.fill();}break;}
  case 'cicada':{const sc2=e.scream>0?1+Math.sin(e.scream*.8)*.08:1;X.scale(sc2,sc2);for(const sg of[-1,1]){X.globalAlpha=.55;X.fillStyle='rgba(220,235,255,.9)';X.beginPath();X.moveTo(sg*3,-6);X.quadraticCurveTo(sg*16,0,sg*9,22);X.quadraticCurveTo(sg*4,12,sg*3,-6);X.fill();X.globalAlpha=1;X.strokeStyle='rgba(60,60,40,.6)';X.lineWidth=.8;X.beginPath();for(let k=0;k<4;k++){X.moveTo(sg*3,-4+k*3);X.lineTo(sg*(8+k*2),6+k*4);}X.stroke();}
   X.fillStyle=rg(0,0,12,'#8a8a6a','#1a1a10');ell(0,2,7,13);X.fill();X.strokeStyle='rgba(0,0,0,.4)';X.lineWidth=1;for(let i=0;i<5;i++){X.beginPath();X.moveTo(-6,0+i*3);X.lineTo(6,0+i*3);X.stroke();}X.fillStyle='rgba(255,255,255,.18)';ell(-2.5,-3,2.5,6,.2);X.fill();
   X.fillStyle=rg(0,-12,8,'#6a6a4a','#0a0a05');ell(0,-11,8,5.5);X.fill();eye(-6,-12,2.6,2.6,'#ff3030');eye(6,-12,2.6,2.6,'#ff3030');X.fillStyle='#ff9040';ell(0,-13,1.2,1.2);X.fill();
   if(e.scream>0){X.strokeStyle=`rgba(255,220,120,${e.scream/30*.8})`;X.lineWidth=2;ell(0,0,18+(30-e.scream)*1.4,18+(30-e.scream)*1.4);X.stroke();}break;}
  case 'beetle':{legs(18,'#120a1e',1.1);
   X.fillStyle=rg(0,0,20,'#a98bde','#1c0e33');ell(0,0,16,20);X.fill();X.fillStyle='rgba(255,255,255,.22)';ell(-6,-8,4,8,.3);X.fill();X.fillStyle='rgba(255,255,255,.08)';ell(7,5,3,6,-.2);X.fill();
   X.strokeStyle='#120a1e';X.lineWidth=1.5;X.beginPath();X.moveTo(0,-17);X.lineTo(0,19);X.stroke();X.strokeStyle='rgba(0,0,0,.35)';X.lineWidth=1;for(const sg of[-1,1])for(let i=1;i<=2;i++){X.beginPath();X.moveTo(sg*i*5,-15+i*2);X.quadraticCurveTo(sg*i*6,0,sg*i*4.5,17-i*2);X.stroke();}
   X.fillStyle='#e6d8ff';for(const[a,b]of[[-7,-4],[7,-4],[0,8],[-8,8],[8,8]]){ell(a,b,2.3,2.3);X.fill();}X.fillStyle='rgba(255,255,255,.8)';for(const[a,b]of[[-7,-4],[7,-4],[0,8],[-8,8],[8,8]]){ell(a-.7,b-.7,.8,.8);X.fill();}
   X.fillStyle=rg(0,-20,7,'#555','#000');ell(0,-20,7,6);X.fill();eye(-3,-21,1.8,1.8,'#ffee40');eye(3,-21,1.8,1.8,'#ffee40');
   const mw=Math.sin(ph*.7)*1.5;X.strokeStyle='#111';X.lineWidth=2.2;X.lineCap='round';X.beginPath();X.moveTo(-4,-25);X.quadraticCurveTo(-10-mw,-31,-6-mw,-35);X.moveTo(4,-25);X.quadraticCurveTo(10+mw,-31,6+mw,-35);X.stroke();break;}
  case 'moth':{const f=Math.sin(t*.3)*5;for(const sgn of[-1,1]){X.fillStyle=rg(sgn*12,-2,18,'#f4e6c4','#7a6040');X.beginPath();X.moveTo(0,-4);X.quadraticCurveTo(sgn*26,-18+f,sgn*24,-2+f);X.quadraticCurveTo(sgn*22,8-f,sgn*12,6);X.quadraticCurveTo(sgn*20,16-f,sgn*6,14);X.closePath();X.fill();
    X.strokeStyle='rgba(90,60,30,.5)';X.lineWidth=1;X.beginPath();for(let k=0;k<4;k++){X.moveTo(sgn*2,-2+k*2);X.quadraticCurveTo(sgn*14,-12+f*.6+k*4,sgn*23,-6+f+k*4);}X.stroke();
    X.fillStyle='rgba(120,80,50,.55)';X.beginPath();X.moveTo(sgn*4,-3);X.quadraticCurveTo(sgn*18,-14+f*.8,sgn*22,-3+f);X.quadraticCurveTo(sgn*14,-6+f*.4,sgn*4,-3);X.fill();
    X.fillStyle='#4a2a1a';ell(sgn*13,-4+f*.5,4.5,3.3);X.fill();X.fillStyle='#e8b860';ell(sgn*13,-4+f*.5,2.6,2);X.fill();X.fillStyle='#1a0a05';ell(sgn*13,-4+f*.5,1.3,1.3);X.fill();X.fillStyle='#fff';ell(sgn*12.4,-4.6+f*.5,.6,.6);X.fill();}
   fuzz(0,-2,4.5,11,'#8a6a4a',22,t*.02);X.fillStyle=rg(0,0,12,'#b89a78','#3a2a1a');ell(0,2,4,12);X.fill();ell(0,-10,4,4);X.fill();eye(-2,-11,1.4,1.4,'#222');eye(2,-11,1.4,1.4,'#222');
   X.strokeStyle='#4a3a2a';X.lineWidth=1.3;X.beginPath();X.moveTo(-2,-13);X.quadraticCurveTo(-8,-20,-12,-17);X.moveTo(2,-13);X.quadraticCurveTo(8,-20,12,-17);X.stroke();X.lineWidth=.8;X.beginPath();for(let k=1;k<5;k++){for(const sg of[-1,1]){const px=sg*(2+k*2.3),py=-13-k*1.6;X.moveTo(px,py);X.lineTo(px+sg*1.5,py-2.2);X.moveTo(px,py);X.lineTo(px+sg*1.5,py+1.2);}}X.stroke();break;}
  case 'gnat':{const wf=Math.sin(t*2+e.ph)*.5;X.globalAlpha=.6;X.fillStyle='#e8f0ff';ell(-5,-2,6,2.2,-.6+wf);X.fill();ell(5,-2,6,2.2,.6-wf);X.fill();X.globalAlpha=1;
   X.fillStyle=rg(0,0,6,'#c0c8e0','#2a3050');ell(0,1,3,6);X.fill();X.fillStyle=rg(0,-6,3,'#a0a8c0','#202840');ell(0,-6,3,3);X.fill();eye(-1.4,-6.5,1.2,1.2,'#ff6060');eye(1.4,-6.5,1.2,1.2,'#ff6060');
   X.strokeStyle='#2a3050';X.lineWidth=.8;X.beginPath();for(const sg of[-1,1]){X.moveTo(sg*2,0);X.lineTo(sg*7,4);X.moveTo(sg*2,3);X.lineTo(sg*6,8);}X.stroke();break;}
  case 'ant':{const w=Math.sin(t*.6)*2;X.strokeStyle='#4a1408';X.lineWidth=1.6;X.lineCap='round';X.beginPath();for(let i=0;i<3;i++){const yy=-4+i*4;for(const sg of[-1,1]){X.moveTo(sg*4,yy);X.lineTo(sg*10,yy-4+w*sg*(i%2?1:-1));X.lineTo(sg*13,yy+3);}}X.stroke();
   X.fillStyle=rg(0,9,8,'#e05a3a','#5a1a08');ell(0,10,7,9);X.fill();X.fillStyle='rgba(255,255,255,.25)';ell(-2.5,6,2,4,.3);X.fill();
   X.fillStyle=rg(0,-1,4,'#d04a30','#5a1a08');ell(0,-1,4,4);X.fill();
   X.fillStyle=rg(0,-10,6,'#c8402a','#4a1408');ell(0,-10,6,5.5);X.fill();eye(-2.6,-11,1.7,1.7,'#222');eye(2.6,-11,1.7,1.7,'#222');
   X.strokeStyle='#4a1408';X.lineWidth=1.5;X.beginPath();X.moveTo(-2,-14);X.lineTo(-6,-19);X.lineTo(-9,-18);X.moveTo(2,-14);X.lineTo(6,-19);X.lineTo(9,-18);X.stroke();
   X.strokeStyle='#2a0a04';X.lineWidth=1.6;X.beginPath();X.moveTo(-3,-13);X.lineTo(-4,-17);X.moveTo(3,-13);X.lineTo(4,-17);X.stroke();break;}
  case 'ladybug':{X.strokeStyle='#111';X.lineWidth=1.4;X.beginPath();for(let i=0;i<3;i++){const yy=-4+i*5;for(const sg of[-1,1]){X.moveTo(sg*6,yy);X.lineTo(sg*12,yy+3);}}X.stroke();
   X.fillStyle=rg(0,0,14,'#ff5a4a','#8a0a00');ell(0,1,12,13);X.fill();X.strokeStyle='#111';X.lineWidth=1.5;X.beginPath();X.moveTo(0,-10);X.lineTo(0,14);X.stroke();
   X.fillStyle='#111';for(const[a,b,r]of[[-6,-3,2.6],[6,-3,2.6],[-4,6,2.2],[4,6,2.2],[-8,3,1.6],[8,3,1.6]]){ell(a,b,r,r);X.fill();}
   X.fillStyle='rgba(255,255,255,.3)';ell(-5,-6,3,5,.4);X.fill();
   X.fillStyle=rg(0,-12,6,'#444','#000');ell(0,-12,6.5,5);X.fill();X.fillStyle='#fff';ell(-4,-13,1.8,1.8);X.fill();ell(4,-13,1.8,1.8);X.fill();eye(-3.5,-13,1.3,1.3,'#222');eye(3.5,-13,1.3,1.3,'#222');
   X.strokeStyle='#111';X.lineWidth=1;X.beginPath();X.moveTo(-2,-16);X.lineTo(-5,-20);X.moveTo(2,-16);X.lineTo(5,-20);X.stroke();break;}
  case 'firefly':{const g=e.glow||0;if(g>.3){X.fillStyle=`rgba(230,255,100,${g*.5})`;ell(0,9,12*g+4,10*g+3);X.fill();}
   for(let k=0;k<2;k++){X.globalAlpha=k?.25:.5;const wf=Math.sin(t*1.5-k)*.3;X.fillStyle='#e8f0ff';ell(-7,-4,8,3,-.5+wf);X.fill();ell(7,-4,8,3,.5-wf);X.fill();}X.globalAlpha=1;
   X.fillStyle=rg(0,-3,8,'#8a6a3a','#2a1a08');ell(0,-2,5,8);X.fill();X.fillStyle=rg(0,-5,6,'#c0403a','#5a1010');ell(0,-6,5.5,4);X.fill();
   X.fillStyle=rg(0,9,6,`rgb(${200+g*55|0},255,${80+g*80|0})`,'#6a8a00');ell(0,9,4.2,5);X.fill();
   X.fillStyle='#111';ell(0,-11,3.5,3);X.fill();eye(-1.8,-11.5,1.2,1.2,'#f0f0f0');eye(1.8,-11.5,1.2,1.2,'#f0f0f0');
   X.strokeStyle='#111';X.lineWidth=1;X.beginPath();X.moveTo(-1,-14);X.lineTo(-5,-18);X.moveTo(1,-14);X.lineTo(5,-18);X.stroke();break;}
  case 'dragon':{X.rotate(e.dx>0?Math.PI/2:-Math.PI/2);const wf=Math.sin(t*1.8)*.25;for(const sg of[-1,1]){for(let k=0;k<2;k++){X.globalAlpha=k?.4:.7;X.fillStyle='rgba(200,240,255,.9)';ell(sg*13,-6+k*9,14,3.4,sg*(.25+wf*(k?-1:1)));X.fill();}}X.globalAlpha=1;X.strokeStyle='rgba(60,120,160,.6)';X.lineWidth=.8;X.beginPath();for(const sg of[-1,1]){X.moveTo(sg*2,-6);X.lineTo(sg*26,-8);X.moveTo(sg*2,3);X.lineTo(sg*26,4);}X.stroke();
   X.fillStyle=rg(0,5,12,'#60e8ff','#106080');ell(0,8,3,16);X.fill();X.strokeStyle='rgba(0,40,60,.5)';X.lineWidth=1;X.beginPath();for(let i=0;i<6;i++){X.moveTo(-3,-2+i*4);X.lineTo(3,-2+i*4);}X.stroke();
   X.fillStyle=rg(0,-8,5,'#40c0e0','#105060');ell(0,-8,4.5,4.5);X.fill();X.fillStyle=rg(0,-13,5,'#2a6a80','#000');ell(0,-13,5,4.5);X.fill();eye(-2.6,-13.5,2.4,2.6,'#20c0a0');eye(2.6,-13.5,2.4,2.6,'#20c0a0');break;}
 }face(e);},{filter:e.fl>0?'brightness(2.6) saturate(.3)':e.slow>0?'sepia(.7) brightness(1.1)':(e.elite?'saturate(1.6) brightness(1.15)':null)});
 if(e.label>0&&BUGINFO[e.type]){X.save();X.globalAlpha=Math.min(1,e.label/40);X.fillStyle='#fff';X.font='bold 11px '+FONT;X.textAlign='center';X.shadowColor='#000';X.shadowBlur=4;X.fillText(BUGINFO[e.type].name,e.x,e.y+e.r*sc+(e.elite?36:24));X.restore();}}

// bosses: each one is its own creature
function bossSprite(b,i){const s=Math.sin(b.t*.1),rage=b.rage;
 if(i===0){ // HORNET QUEEN — long dark hornet, orange bands, crown, big mandibles
  X.scale(1.15,1.15);X.save();X.rotate(Math.PI);wings(34,.7,1.1);X.restore();
  X.strokeStyle='#2a1200';X.lineWidth=3.5;X.lineCap='round';X.beginPath();for(let k=0;k<3;k++){const yy=-8+k*12,w=Math.sin(b.t*.3+k)*3;for(const sg of[-1,1]){X.moveTo(sg*10,yy);X.lineTo(sg*30,yy-8+w);X.lineTo(sg*40,yy+22+w);}}X.stroke();
  X.fillStyle=rg(0,58,8,'#777','#000');X.beginPath();X.moveTo(0,72);X.lineTo(-6,54);X.lineTo(6,54);X.fill();
  X.fillStyle=rg(0,30,30,rage?'#ff6a1c':'#ff9f1c','#5a2000');X.beginPath();X.moveTo(0,6);X.quadraticCurveTo(30,18,22,44);X.quadraticCurveTo(10,60,0,60);X.quadraticCurveTo(-10,60,-22,44);X.quadraticCurveTo(-30,18,0,6);X.fill();
  X.save();X.clip();X.fillStyle='#2a1200';for(let k=0;k<4;k++){const yy=14+k*11;X.beginPath();X.moveTo(-40,yy);X.quadraticCurveTo(0,yy+5,40,yy);X.lineTo(40,yy+5);X.quadraticCurveTo(0,yy+10,-40,yy+5);X.fill();}X.fillStyle='rgba(255,255,255,.22)';ell(-10,22,6,18,.2);X.fill();X.restore();
  X.fillStyle='#2a1200';ell(0,4,6,6);X.fill();
  X.fillStyle=rg(0,-14,22,'#c86a10','#3a1a00');ell(0,-14,20,19);X.fill();fuzz(0,-14,20,19,'#5a2a00',30,b.t*.01);X.fillStyle='rgba(255,255,255,.2)';ell(-7,-22,6,5,-.4);X.fill();
  X.fillStyle=rg(0,-42,16,'#4a2a10','#000');ell(0,-40,16,15);X.fill();eye(-7,-42,6,8,'#ff3020');eye(7,-42,6,8,'#ff3020');
  X.strokeStyle='#1a0a00';X.lineWidth=4;X.lineCap='round';X.beginPath();X.moveTo(-6,-50);X.quadraticCurveTo(-16,-60,-10,-66);X.moveTo(6,-50);X.quadraticCurveTo(16,-60,10,-66);X.stroke();
  X.strokeStyle='#1a0a00';X.lineWidth=2.5;X.beginPath();X.moveTo(-4,-54);X.quadraticCurveTo(-18,-70,-24,-60);X.moveTo(4,-54);X.quadraticCurveTo(18,-70,24,-60);X.stroke();
  X.fillStyle=rg(0,-62,14,'#fff3a0','#d4a000');X.beginPath();X.moveTo(-18,-52);for(let k=0;k<4;k++){X.lineTo(-13+k*9,-68);X.lineTo(-9+k*9,-52);}X.closePath();X.fill();X.fillStyle='#ff2050';for(let k=0;k<3;k++){ell(-9+k*9,-56,2,2);X.fill();}
 }else if(i===1){ // PRAYING MANTIS
  X.scale(1.2,1.2);X.strokeStyle='#3f7a22';X.lineWidth=6;X.lineCap='round';X.beginPath();for(const sgn of[-1,1]){X.moveTo(sgn*8,10);X.lineTo(sgn*40,0);X.lineTo(sgn*50,30);X.moveTo(sgn*8,25);X.lineTo(sgn*38,28);X.lineTo(sgn*46,55);}X.stroke();
  X.fillStyle=rg(0,12,36,rage?'#d0f070':'#a8f070','#3f7a22');ell(0,14,15,38);X.fill();X.strokeStyle='rgba(0,60,0,.35)';X.lineWidth=1;for(let k=0;k<6;k++){X.beginPath();X.moveTo(-14,-10+k*10);X.quadraticCurveTo(0,-6+k*10,14,-10+k*10);X.stroke();}
  X.fillStyle=rg(0,-28,16,'#8fd85a','#3f7a22');ell(0,-26,13,16);X.fill();
  X.strokeStyle='#2d5a18';X.lineWidth=8;X.beginPath();for(const sgn of[-1,1]){X.moveTo(sgn*10,-20);X.lineTo(sgn*46,-14+s*10*sgn);X.lineTo(sgn*50,26+s*10*sgn);}X.stroke();X.strokeStyle='#d9ffb0';X.lineWidth=2;X.beginPath();for(const sgn of[-1,1]){X.moveTo(sgn*46,-14+s*10*sgn);X.lineTo(sgn*50,26+s*10*sgn);for(let k=0;k<5;k++){X.moveTo(sgn*(46+k),-10+k*7+s*10*sgn);X.lineTo(sgn*(52+k),-8+k*7+s*10*sgn);}}X.stroke();
  X.fillStyle=rg(0,-44,12,'#b8ff80','#4e9a2e');X.beginPath();X.moveTo(-14,-36);X.lineTo(14,-36);X.lineTo(0,-56);X.closePath();X.fill();X.fillStyle='#ff3030';ell(-8,-42,4.5,5);X.fill();ell(8,-42,4.5,5);X.fill();X.fillStyle='#fff';ell(-7,-44,1.5,1.5);X.fill();ell(9,-44,1.5,1.5);X.fill();
  X.strokeStyle='#2d5a18';X.lineWidth=1.5;X.beginPath();X.moveTo(-3,-54);X.quadraticCurveTo(-12,-70,-4,-76);X.moveTo(3,-54);X.quadraticCurveTo(12,-70,4,-76);X.stroke();
 }else if(i===2){ // ORB WEAVER
  X.scale(1.2,1.2);X.strokeStyle='#1a1a22';X.lineWidth=5;X.lineCap='round';for(let k=0;k<4;k++){const a=.35+k*.5,f=Math.sin(b.t*.15+k)*6;for(const sgn of[-1,1]){X.beginPath();X.moveTo(0,0);X.lineTo(sgn*Math.cos(a)*44,Math.sin(a)*44-f-20);X.lineTo(sgn*Math.cos(a)*62,Math.sin(a)*62+16);X.stroke();}}
  X.fillStyle=rg(0,12,38,rage?'#7a5a6e':'#5a5a6e','#15151c');ell(0,14,32,36);X.fill();fuzz(0,14,32,36,'#2a2a34',40,b.t*.01);X.fillStyle='#b01020';X.beginPath();X.moveTo(0,-6);X.lineTo(-11,12);X.lineTo(0,32);X.lineTo(11,12);X.closePath();X.fill();X.fillStyle='#ff5060';ell(0,12,3,8);X.fill();X.fillStyle='rgba(255,255,255,.15)';ell(-12,0,8,14,.4);X.fill();
  X.fillStyle=rg(0,-30,18,'#4a4a5e','#0a0a10');ell(0,-30,18,16);X.fill();X.fillStyle='#ff3333';for(let k=0;k<4;k++){ell(-12+k*8,-36,3.2,3.2);X.fill();}X.fillStyle='#fff';for(let k=0;k<4;k++){ell(-11+k*8,-37,1,1);X.fill();}X.fillStyle='#ff3333';ell(-6,-28,2,2);X.fill();ell(6,-28,2,2);X.fill();X.fillStyle='#111';X.beginPath();X.moveTo(-6,-18);X.lineTo(-10,-8);X.lineTo(-2,-14);X.moveTo(6,-18);X.lineTo(10,-8);X.lineTo(2,-14);X.fill();
 }else if(i===3){ // DRAGONFLY ACE — long body, four long wings, huge eyes
  X.scale(1.15,1.15);const wf=Math.sin(b.t*1.6)*.2;for(const sg of[-1,1]){for(let k=0;k<2;k++){X.globalAlpha=k?.45:.75;const g=X.createLinearGradient(0,0,sg*70,0);g.addColorStop(0,'rgba(220,250,255,.95)');g.addColorStop(1,'rgba(120,200,240,.4)');X.fillStyle=g;ell(sg*38,-14+k*24,40,8,sg*(.18+wf*(k?-1:1)));X.fill();}}X.globalAlpha=1;
  X.strokeStyle='rgba(40,100,140,.55)';X.lineWidth=1;X.beginPath();for(const sg of[-1,1]){for(let k=0;k<2;k++){for(let j=0;j<5;j++){X.moveTo(sg*6,-14+k*24);X.lineTo(sg*(20+j*14),-20+k*24+(j%2?6:-2));}}}X.stroke();
  X.fillStyle=rg(0,20,50,rage?'#80f0ff':'#50e0ff','#0a4a6a');ell(0,26,7,46);X.fill();X.strokeStyle='rgba(0,40,60,.5)';X.lineWidth=1.5;X.beginPath();for(let i=0;i<9;i++){X.moveTo(-7,-8+i*9);X.lineTo(7,-8+i*9);}X.stroke();X.fillStyle='rgba(255,255,255,.3)';ell(-2.5,20,2,30);X.fill();
  X.fillStyle=rg(0,-22,14,'#30c0e0','#0a4a60');ell(0,-22,12,13);X.fill();X.strokeStyle='#0a4a60';X.lineWidth=3;X.beginPath();for(let k=0;k<3;k++){const yy=-24+k*6;for(const sg of[-1,1]){X.moveTo(sg*8,yy);X.lineTo(sg*20,yy+8);X.lineTo(sg*24,yy+18);}}X.stroke();
  X.fillStyle=rg(0,-38,14,'#1a5a70','#000');ell(0,-38,13,11);X.fill();eye(-8,-40,8,9,'#20e0b0');eye(8,-40,8,9,'#20e0b0');
 }else if(i===4){ // STAG BEETLE KING — huge armored dome, horn-antlers, gold rivets
  X.scale(1.2,1.2);X.strokeStyle='#2a1005';X.lineWidth=5;X.lineCap='round';X.beginPath();for(let k=0;k<3;k++){const yy=-6+k*16,w=Math.sin(b.t*.2+k)*3;for(const sg of[-1,1]){X.moveTo(sg*18,yy);X.lineTo(sg*40,yy-10+w);X.lineTo(sg*48,yy+14+w);}}X.stroke();
  X.fillStyle=rg(0,8,44,rage?'#a04a20':'#7a3a18','#1a0800');ell(0,10,34,40);X.fill();X.strokeStyle='#1a0800';X.lineWidth=2.5;X.beginPath();X.moveTo(0,-26);X.lineTo(0,48);X.stroke();X.fillStyle='rgba(255,255,255,.18)';ell(-14,-6,9,20,.3);X.fill();X.fillStyle='rgba(255,220,150,.12)';ell(14,10,7,14,-.2);X.fill();
  X.strokeStyle='rgba(0,0,0,.35)';X.lineWidth=1.5;for(const sg of[-1,1])for(let k=1;k<=3;k++){X.beginPath();X.moveTo(sg*k*9,-22+k*3);X.quadraticCurveTo(sg*k*11,10,sg*k*8,42-k*3);X.stroke();}
  X.fillStyle='#ffd45a';for(const[a,c]of[[-16,-10],[16,-10],[-22,14],[22,14],[-10,34],[10,34]]){ell(a,c,3,3);X.fill();}
  X.fillStyle=rg(0,-32,16,'#5a2a10','#0a0400');ell(0,-32,20,14);X.fill();eye(-9,-33,4,4,'#ffe040');eye(9,-33,4,4,'#ffe040');
  const mw=Math.sin(b.t*.12)*4;X.strokeStyle='#1a0800';X.lineWidth=7;X.lineCap='round';X.beginPath();X.moveTo(-10,-42);X.quadraticCurveTo(-30-mw,-60,-22-mw,-80);X.moveTo(-22-mw,-64);X.lineTo(-10-mw,-70);X.moveTo(10,-42);X.quadraticCurveTo(30+mw,-60,22+mw,-80);X.moveTo(22+mw,-64);X.lineTo(10+mw,-70);X.stroke();
  X.strokeStyle='#8a5a30';X.lineWidth=2;X.beginPath();X.moveTo(-10,-44);X.quadraticCurveTo(-28-mw,-60,-22-mw,-76);X.moveTo(10,-44);X.quadraticCurveTo(28+mw,-60,22+mw,-76);X.stroke();
 }else if(i===6){ // MOSQUITO MATRIARCH — long thin body, huge wings, dangling legs, a needle proboscis
  X.scale(1.15,1.15);const lw=Math.sin(b.t*.3)*3;X.strokeStyle='#2b2b45';X.lineWidth=3;X.lineCap='round';X.beginPath();for(let i=-1;i<=1;i++){for(const sg of[-1,1]){X.moveTo(0,i*14);X.quadraticCurveTo(sg*30,i*14-16+lw,sg*50,i*14+28+lw);X.lineTo(sg*62,i*14+52+lw);}}X.stroke();
  for(let k=0;k<2;k++){X.globalAlpha=k?.3:.6;const wf=Math.sin(b.t*1.6-k)*.35;X.fillStyle='#dfe8ff';ell(-28,-12,32,10,-.5+wf);X.fill();ell(28,-12,32,10,.5-wf);X.fill();}X.globalAlpha=1;
  X.fillStyle=rg(0,4,30,rage?'#a0a0d0':'#8a8ab0','#23233a');ell(0,8,11,34);X.fill();X.strokeStyle='rgba(255,255,255,.25)';X.lineWidth=2;for(let i=0;i<6;i++){X.beginPath();X.moveTo(-9,-14+i*9);X.lineTo(9,-14+i*9);X.stroke();}X.fillStyle='rgba(255,255,255,.2)';ell(-4,0,3,22);X.fill();
  X.fillStyle=rg(0,-34,14,'#6a6a90','#1a1a30');ell(0,-34,13,11);X.fill();eye(-7,-38,5,6,'#ff4040');eye(7,-38,5,6,'#ff4040');
  X.strokeStyle='#eee';X.lineWidth=3.5;X.beginPath();X.moveTo(0,-26);X.lineTo(0,18);X.stroke();X.strokeStyle='#ff5050';X.lineWidth=1.5;X.beginPath();X.moveTo(0,10);X.lineTo(0,22);X.stroke();
  X.strokeStyle='#2b2b45';X.lineWidth=2;X.beginPath();X.moveTo(-5,-44);X.quadraticCurveTo(-20,-60,-26,-52);X.moveTo(5,-44);X.quadraticCurveTo(20,-60,26,-52);X.stroke();
 }else if(i===7){ // SCORPION KING — armored segments, two great pincers, tail curled over with a stinger
  X.scale(1.2,1.2);X.strokeStyle='#5a2a08';X.lineWidth=5;X.lineCap='round';X.beginPath();for(let k=0;k<4;k++){const yy=-10+k*12,w=Math.sin(b.t*.25+k)*3;for(const sg of[-1,1]){X.moveTo(sg*14,yy);X.lineTo(sg*34,yy-8+w);X.lineTo(sg*44,yy+12+w);}}X.stroke();
  for(let k=0;k<5;k++){X.fillStyle=rg(0,-20+k*10,20,rage?'#e0a050':'#c08040','#4a2008');ell(0,-20+k*10,22-k*1.5,8);X.fill();}X.fillStyle='rgba(255,255,255,.18)';ell(-8,-12,6,18,.2);X.fill();
  X.fillStyle=rg(0,-32,16,'#b07030','#3a1a05');ell(0,-32,20,12);X.fill();eye(-6,-30,4,4,'#ffe040');eye(6,-30,4,4,'#ffe040');
  // pincers
  const pw=Math.sin(b.t*.12)*6;for(const sg of[-1,1]){X.strokeStyle='#5a2a08';X.lineWidth=9;X.beginPath();X.moveTo(sg*14,-24);X.lineTo(sg*40,-34);X.lineTo(sg*54,-22);X.stroke();X.fillStyle=rg(sg*56,-20,16,'#d09050','#4a2008');ell(sg*56,-20,15,11,sg*.4);X.fill();X.strokeStyle='#2a1004';X.lineWidth=5;X.beginPath();X.moveTo(sg*62,-28);X.lineTo(sg*(76+pw*.5),-40+pw);X.moveTo(sg*66,-14);X.lineTo(sg*(80+pw*.5),-8-pw);X.stroke();}
  // tail arcing up over the back
  const tw=Math.sin(b.t*.08)*5;X.strokeStyle='#4a2008';X.lineWidth=11;X.lineCap='round';X.beginPath();X.moveTo(0,26);X.quadraticCurveTo(30,50,44+tw,10);X.quadraticCurveTo(52+tw,-30,20+tw,-52);X.stroke();X.strokeStyle='#c08040';X.lineWidth=6;X.beginPath();X.moveTo(0,26);X.quadraticCurveTo(30,50,44+tw,10);X.quadraticCurveTo(52+tw,-30,20+tw,-52);X.stroke();
  X.fillStyle=rg(20+tw,-56,10,'#333','#000');X.beginPath();X.moveTo(24+tw,-52);X.lineTo(6+tw,-70);X.lineTo(14+tw,-46);X.closePath();X.fill();X.fillStyle='#8fdc3a';ell(8+tw,-68,2.5,2.5);X.fill();
 }
}
function centipedeSprite(b){ // built from real rendered art, plates spaced by distance along the trail
 const segs=b.seg,head=SPR['centihead1'],seg=SPR['centiseg1'];
 if(!segs.length)return;
 if(head&&seg){
  // walk back down the trail putting a plate every STEP pixels; even spacing is what makes it
  // read as a segmented body rather than a smear
  const STEP=15,pts=[];
  let acc=0;
  for(let k=1;k<segs.length;k++){
   const dx=segs[k].x-segs[k-1].x,dy=segs[k].y-segs[k-1].y,d=Math.hypot(dx,dy);
   acc+=d;
   if(acc>=STEP){acc=0;pts.push({x:segs[k].x,y:segs[k].y,a:Math.atan2(dy,dx),f:k/segs.length});}
   if(pts.length>46)break;
  }
  for(let i=pts.length-1;i>=0;i--){
   const q=pts[i],r=(21-q.f*9)*2.5,w=r*1.9,h=w*seg.height/seg.width;
   X.save();X.translate(q.x-b.x,q.y-b.y);X.rotate(q.a+Math.PI/2);
   if(b.rage)X.filter='saturate(1.6) brightness(1.15)';
   X.drawImage(seg,-w/2,-h*.62,w,h*1.24);X.filter='none';X.restore();}
  const h0=segs[0],h1=segs[Math.min(8,segs.length-1)],ah=Math.atan2(h0.y-h1.y,h0.x-h1.x);
  const hw=104,hh=hw*head.height/head.width;
  X.save();X.rotate(ah-Math.PI/2);
  if(b.rage)X.filter='saturate(1.6) brightness(1.15)';
  X.drawImage(head,-hw/2,-hh*.86,hw,hh);X.filter='none';X.restore();
  return;}
 X.fillStyle='#b03a20';for(let k=Math.min(segs.length-1,150);k>=6;k-=6){const s2=segs[k];ell(s2.x-b.x,s2.y-b.y,14,12);X.fill();}
}
const BEYES=[{s:1.15,e:[[-7,-42],[7,-42]],r:7,spk:[[-24,20],[24,20],[-20,40],[20,40]]},{s:1.2,e:[[-8,-42],[8,-42]],r:6,spk:[[-16,-20],[16,-20],[-14,10],[14,10]]},{s:1.2,e:[[-12,-36],[-4,-36],[4,-36],[12,-36]],r:4,spk:[[-30,0],[30,0],[-26,26],[26,26],[0,48]]},{s:1.15,e:[[-8,-40],[8,-40]],r:9,spk:[[-8,10],[8,10],[-7,40],[7,40]]},{s:1.2,e:[[-9,-33],[9,-33]],r:5,spk:[[-32,0],[32,0],[-26,-20],[26,-20],[-22,26],[22,26]]},{s:1,e:[[-7,-18],[7,-18]],r:6,spk:[[-24,-4],[24,-4],[-22,16],[22,16]]},{s:1.15,e:[[-8,-40],[8,-40]],r:6,spk:[[-10,10],[10,10],[-8,40],[8,40]]},{s:1.2,e:[[-6,-30],[6,-30]],r:4,spk:[[-46,-24],[46,-24],[-30,20],[30,20],[0,-70]]}];
function menace(b,i){const m=BEYES[i];X.save();
 // art is head-down, and this overlay's eyes are authored at negative y, so flip it to match
 X.rotate(Math.PI);X.scale(m.s,m.s);const pulse=.5+Math.sin(b.t*.15)*.5,rage=b.rage;
 // spikes / barbs along the body
 X.fillStyle='#0a0400';for(const [sx,sy] of m.spk){const a=Math.atan2(sy,sx);X.save();X.translate(sx,sy);X.rotate(a);X.beginPath();X.moveTo(0,-4);X.lineTo(11,0);X.lineTo(0,4);X.closePath();X.fill();X.restore();}
 // eye glow + slit pupils + heavy angry brows
 X.globalCompositeOperation='lighter';for(const [ex,ey] of m.e){X.fillStyle=rg(ex,ey,m.r*2.6,`rgba(255,${rage?20:60},0,${.45+pulse*.3})`,'rgba(255,0,0,0)');ell(ex,ey,m.r*2.6,m.r*2.6);X.fill();}X.globalCompositeOperation='source-over';
 for(const [ex,ey] of m.e){X.fillStyle=rage?'#ff2000':'#ff4a00';ell(ex,ey,m.r*.9,m.r*.9);X.fill();X.fillStyle='#000';ell(ex,ey,m.r*.25,m.r*.8);X.fill();X.fillStyle='rgba(255,255,255,.7)';ell(ex-m.r*.35,ey-m.r*.4,m.r*.22,m.r*.18);X.fill();}
 const L=m.e[0],Rr=m.e[m.e.length-1];X.strokeStyle='#0a0400';X.lineWidth=m.r*.7;X.lineCap='round';X.beginPath();X.moveTo(L[0]-m.r*1.4,L[1]-m.r*2.2);X.lineTo(L[0]+m.r*.9,L[1]-m.r*1.1);X.moveTo(Rr[0]+m.r*1.4,Rr[1]-m.r*2.2);X.lineTo(Rr[0]-m.r*.9,Rr[1]-m.r*1.1);X.stroke();
 // venom drool from the mouth
 const my=L[1]+m.r*2.2,dl=(b.t*.35)%22;X.fillStyle='rgba(120,255,60,.85)';X.beginPath();X.moveTo(-2,my);X.quadraticCurveTo(3,my+dl*.6,0,my+dl);X.quadraticCurveTo(-4,my+dl*.6,-2,my);X.fill();ell(0,my+dl,2.2,2.6);X.fill();
 X.restore();}
function drawBoss(b,portrait){const real=LV().boss,i=BARCH[real];
 if(!portrait&&b.y>0){const pulse=.5+Math.sin(b.t*.1)*.5;X.fillStyle=rg(b.x,b.y,95+pulse*15,b.rage?'rgba(160,0,0,.5)':'rgba(70,0,20,.42)','rgba(0,0,0,0)');ell(b.x,b.y+10,95+pulse*15,80+pulse*12);X.fill();}
 if(i===5&&!portrait){
  // drawn straight to the canvas: emboss renders into a fixed square buffer and casts one huge
  // blurred ellipse, which clipped the long body and left a visible box around it
  X.save();X.translate(b.x,b.y);
  X.globalAlpha=.28;X.fillStyle=LV().shadow;if(!LOW)X.filter='blur(4px)';
  for(let k=Math.min(b.seg.length-1,150);k>=6;k-=12){const sg=b.seg[k];ell(sg.x-b.x+7,sg.y-b.y+9,17,9);X.fill();}
  X.filter='none';X.globalAlpha=1;
  if(b.fl>0)X.filter='brightness(2) saturate(.5)';
  centipedeSprite(b);X.filter='none';X.restore();
  // the split twin: same plates, mirrored trail. shares the mother's health -- one hunger, two mouths
  if(b.rage&&b.seg2&&b.seg2.length>8){X.save();X.translate(b.x2,b.y2);if(b.fl>0)X.filter='brightness(2) saturate(.5)';centipedeSprite({...b,x:b.x2,y:b.y2,seg:b.seg2});X.filter='none';X.restore();}}
 else if(i===5){if(!b.seg.length)b.seg=Array.from({length:150},(_,k)=>({x:b.x+Math.sin(k*.06)*40,y:b.y+k*.9}));emboss(b.x,b.y,220,()=>{centipedeSprite(b);menace(b,5);},{alt:0});}
 else if(SPR['boss'+real])emboss(b.x,b.y,300,()=>{const sc=(1+(b.rage?Math.sin(b.t*.3)*.03:0))*(1+Math.sin(b.t*.12)*.025);X.scale(sc,sc);X.rotate(Math.sin(b.t*.07)*.04);drawSprite(SPR['boss'+real],BSIZE[real],faceRot('boss'+real));},{filter:b.fl>0?'brightness(2) saturate(.5)':(b.camo?'opacity(0.13) blur(1px)':(b.rage?'saturate(1.5) contrast(1.15)':null)),alt:portrait||b.camo?0:1});
 else emboss(b.x,b.y,230,()=>{bossSprite(b,i);menace(b,i);},{filter:b.fl>0?'brightness(2) saturate(.5)':(b.camo?'opacity(0.13) blur(1px)':null),alt:portrait?0:1});
 if(portrait)return;
 // scorpion's planted tail-turret: rooted where the job change happened, pulsing so you know it is live
 if(b.turret){const q=b.turret;X.save();X.translate(q.x,q.y);X.fillStyle='rgba(0,0,0,.3)';ell(0,26,20,7);X.fill();
  X.strokeStyle='#5a3a10';X.lineWidth=9;X.lineCap='round';X.beginPath();X.moveTo(0,26);X.quadraticCurveTo(10,4,0,-14);X.stroke();
  X.strokeStyle='#c08040';X.lineWidth=5;X.beginPath();X.moveTo(0,24);X.quadraticCurveTo(8,4,0,-12);X.stroke();
  const pu=.5+Math.sin(b.t*.2)*.5;X.fillStyle=rg(0,-16,10+pu*4,'rgba(255,60,40,.9)','rgba(255,0,0,0)');ell(0,-16,10+pu*4,10+pu*4);X.fill();X.fillStyle='#ff3b3b';ell(0,-16,3.5,5);X.fill();X.restore();}
 // atlas moth wing-shields: they soak the hits for their side until they break
 if(b.wings&&b.y>0)for(const s of[-1,1]){const wv=s<0?b.wings.l:b.wings.r;if(wv<=0)continue;const f=wv/b.wings.max;
  X.save();X.translate(b.x+s*62,b.y);X.rotate(s*.15+Math.sin(b.t*.1)*.06*s);X.globalAlpha=.30+f*.40;
  X.fillStyle=rg(0,0,70,'#ffd9a0','#c06a20');ell(0,0,32,76);X.fill();X.globalAlpha=1;
  X.strokeStyle=`rgba(255,220,160,${.45+f*.45})`;X.lineWidth=2;ell(0,0,32,76);X.stroke();X.restore();}
 X.fillStyle='rgba(0,0,0,.34)';X.fillRect(40,36,W-80,14);const g=X.createLinearGradient(42,0,W-42,0);g.addColorStop(0,'#ff3b3b');g.addColorStop(1,'#ffb13b');X.fillStyle=g;X.fillRect(42,38,(W-84)*Math.max(0,b.hp/b.max),10);X.fillStyle='#fff';X.font='bold 12px '+FONT;X.textAlign='center';X.shadowColor='#000';X.shadowBlur=4;X.fillText('BOSS  ·  '+b.name+(b.rage?'  (ENRAGED)':''),W/2,47);X.shadowBlur=0;}

