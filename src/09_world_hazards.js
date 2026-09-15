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
// THE VOLCANO's ember column is GONE (Matt 2026-09-15: "there's this like bar that comes down
// and kills you in the middle of the screen... I don't like that part of the game"). It was a
// 66px strip of fire running the full height of the screen that hit you every 20 frames you
// stood in it, and against a lava background it was very nearly invisible -- the screenshot that
// settled it showed a faint orange wash you would never read as lethal. A hazard you cannot see
// is not difficulty, it is a coin flip. The falling embers in 18_scene_motion stay: those are
// ordinary bullets, they come one at a time, and you can see every one of them.
function volcanoTick(){}
// the cave goes dark: you only see a pool of light around the bee
function worldOverlay(){
 const name=LV().name;
 if(name!=='THE CAVE')return;
 // 9/3: the cave painting is pitch dark now, so the lamp is wider and the far dark is lighter than
 // when the picture underneath was a daylit arch -- you must still be able to see what is coming
 const r=200+Math.sin(t*.03)*10;
 X.save();X.globalCompositeOperation='source-over';
 const g=X.createRadialGradient(P.x,P.y,r*.4,P.x,P.y,r*2.0);
 g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.55,'rgba(0,4,10,.38)');g.addColorStop(1,'rgba(0,3,8,.70)');
 X.fillStyle=g;X.fillRect(0,0,W,H);X.restore();
}
