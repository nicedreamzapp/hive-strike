// ---------- what each world does TO you ----------
// difficulty was only ever "more bugs, faster". every world now has one hazard of its own, so
// level 12 does not just feel like level 4 with extra health.
let slideVX=0, slideVY=0, gustT=0, gustA=0;
function worldForce(){
 const name=LV().name, d=D();
 switch(name){
  case 'THE POND': case 'THE SWAMP':          // a current pushes you off your line
   P.x+=Math.sin(t*.012)*1.5*d;break;
  case 'THE TIDE POOL':                        // the wash surges up and drags back
   P.y+=Math.sin(t*.02)*1.7*d;break;
  case 'THE DUNES':                            // gusts shove you sideways, then stop
   if(--gustT<=0){gustT=RI(150,320);gustA=R(-1,1)<0?-1:1;}
   if(gustT<90)P.x+=gustA*(1.6+d)*Math.sin((90-gustT)/90*Math.PI);break;
  case 'THE ALPINE':                           // downslope wind
   P.x+=Math.sin(t*.007)*1.2*d;P.y+=.35*d;break;
  case 'THE TUNDRA':                           // ice: you keep sliding after you stop
   slideVX=slideVX*.90+(P.x-P.px)*.30;slideVY=slideVY*.90+(P.y-P.py)*.30;
   P.x+=slideVX;P.y+=slideVY;break;
  case 'THE CANOPY':                           // rain drags you down through the leaves
   P.y+=.55*d;break;
  case 'THE ROOFTOPS':                         // traffic draws you toward the street
   P.x+=(W*.5-P.x)*.006*d;break;
  case 'THE HIVE':                             // wax underfoot, everything is heavier
   P.x-=(P.x-P.px)*.22;P.y-=(P.y-P.py)*.22;break;
 }
 P.px=P.x;P.py=P.y;
}
// THE VOLCANO: ember columns erupt from the floor. a column is cover -- it burns enemy
// shots out of the air and cooks any bug standing in it -- but it cooks you just the same.
// 90 frames of shimmer telegraph where it will rise, then ~4 seconds of fire.
let volc=null,volcNext=700;
function volcanoTick(){
 if(state!=='play'||LV().name!=='THE VOLCANO'){volc=null;return;}
 if(!volc){if(--volcNext<=0){volc={x:R(70,W-70),w:66,t:0};volcNext=RI(650,1000);}return;}
 volc.t++;const inBand=(x)=>Math.abs(x-volc.x)<volc.w/2;
 if(volc.t<90){if(volc.t%5===0)parts.push({x:volc.x+R(-volc.w/2,volc.w/2),y:H-R(10,40),vx:0,vy:-R(.5,1.2),l:20,c:'#ff9030',r:R(1,2)});return;}
 if(volc.t>330){volc=null;return;}
 if(volc.t%2===0)parts.push({x:volc.x+R(-volc.w/2,volc.w/2),y:H,vx:R(-.3,.3),vy:-R(6,10),l:R(20,40),c:['#ffd166','#ff9030','#ff5a10'][RI(0,2)],r:R(1.5,3),spark:1});
 for(const b of ebullets)if(!b.dead&&inBand(b.x)&&b.y>40){b.dead=1;sparks(b.x,b.y,'#ff9030',3,5);}
 if(!P.dead&&P.inv===0&&inBand(P.x)&&volc.t%20===0)hitPlayer();
 if(volc.t%12===0)for(const e of enemies){if(!e.dead&&inBand(e.x)&&e.y>0){e.hp-=1.2;e.fl=3;if(e.hp<=0){e.dead=1;killScore(e);boom(e.x,e.y,'#ff9030',14);if(!e.tiny)gibs(e);sfxKill(e);}}}
}
// the cave goes dark: you only see a pool of light around the bee
function worldOverlay(){
 const name=LV().name;
 if(name==='THE VOLCANO'&&volc){const a=volc.t<90?.10+(volc.t/90)*.12:.32,x0=volc.x-volc.w/2;
  X.save();const g=X.createLinearGradient(0,H,0,volc.t<90?H-120:0);
  g.addColorStop(0,`rgba(255,120,20,${a})`);g.addColorStop(.6,`rgba(255,60,10,${a*.6})`);g.addColorStop(1,'rgba(255,40,0,0)');
  X.fillStyle=g;X.fillRect(x0,0,volc.w,H);
  if(volc.t>=90){X.globalCompositeOperation='lighter';X.fillStyle=`rgba(255,200,80,${.10+Math.sin(volc.t*.4)*.05})`;X.fillRect(x0+volc.w*.3,0,volc.w*.4,H);}
  X.restore();return;}
 if(name!=='THE CAVE')return;
 // 9/3: the cave painting is pitch dark now, so the lamp is wider and the far dark is lighter than
 // when the picture underneath was a daylit arch -- you must still be able to see what is coming
 const r=200+Math.sin(t*.03)*10;
 X.save();X.globalCompositeOperation='source-over';
 const g=X.createRadialGradient(P.x,P.y,r*.4,P.x,P.y,r*2.0);
 g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.55,'rgba(0,4,10,.38)');g.addColorStop(1,'rgba(0,3,8,.70)');
 X.fillStyle=g;X.fillRect(0,0,W,H);X.restore();
}
