// ---------- Bug-Dex: every bug you have beaten, with a fact ----------
// A collection screen over data the game already had: BUGINFO facts, the sprites, and a
// kill count per type that killScore() keeps in STAT.dex. Sixty-five bugs in roster
// order, then the sixteen bosses. Undiscovered cards show a dark silhouette so the
// player can see how many are left without being told what they are.
// BOSSFACT (one line per boss) already lives in 05_state.js and feeds the fact card; reuse it.
const DEX=Object.keys(ET).map(k=>({k,spr:k,name:(BUGINFO[k]||{}).name||k.toUpperCase(),fact:(BUGINFO[k]||{}).fact||'',n:()=>STAT.dex[k]||0}))
 .concat(BOSSES.map((b,i)=>({k:'boss'+i,spr:'boss'+i,boss:i,name:b.name,fact:BOSSFACT[i]||'',n:()=>STAT.bdex[i]||0})));
let dexOpen=false,dexPg=0,dexPick=null;
const DEXC=5,DEXR=5,DEXW=88,DEXH=100,DEXX=(W-DEXC*DEXW)/2,DEXY=76,DEXPAGES=Math.ceil(DEX.length/(DEXC*DEXR));
const dexSeen=()=>DEX.reduce((a,c)=>a+(c.n()>0?1:0),0);
function dexPage(d){dexPg=(dexPg+d+DEXPAGES)%DEXPAGES;dexPick=null;click(1000,.02);}
const DEXNAV={prev:{x:20,y:H-118,w:110,h:36},next:{x:W-130,y:H-118,w:110,h:36},close:{x:W-80,y:12,w:68,h:26}};
function dexTap(p){
 if(dexPick){dexPick=null;return;}
 if(inBtn(p,DEXNAV.close)){dexOpen=false;return;}
 if(inBtn(p,DEXNAV.prev)){dexPage(-1);return;}
 if(inBtn(p,DEXNAV.next)){dexPage(1);return;}
 const c=Math.floor((p.x-DEXX)/DEXW),r=Math.floor((p.y-DEXY)/DEXH);
 if(c>=0&&c<DEXC&&r>=0&&r<DEXR){const i=dexPg*DEXC*DEXR+r*DEXC+c,card=DEX[i];if(card&&card.n()>0){dexPick=card;click(1400,.02);}}}
function wrapText(s,maxW){const out=[];let line='';for(const w of s.split(' ')){const tr=line?line+' '+w:w;if(X.measureText(tr).width>maxW&&line){out.push(line);line=w;}else line=tr;}if(line)out.push(line);return out;}
function dexSprite(card,h,dim){const im=SPR[card.spr];
 if(card.boss!=null&&SPR[card.spr]===undefined)bossSprLoad(card.boss);   // bosses load on demand for the page you are looking at
 if(!im||!im.height){X.fillStyle=dim?'rgba(255,255,255,.12)':'rgba(255,255,255,.35)';X.font='bold '+Math.round(h*.6)+'px '+FONT;X.textAlign='center';X.fillText('?',0,h*.22);return;}
 X.save();if(dim){X.globalAlpha=.55;if(!LOW)X.filter='brightness(0.12)';}drawSprite(im,h,Math.PI);X.restore();}
function drawDex(){X.save();X.setTransform(DPR,0,0,DPR,0,0);
 X.fillStyle='rgba(4,10,20,.94)';X.fillRect(0,0,W,H);
 X.textAlign='center';X.shadowColor='#000';X.shadowBlur=8;
 X.fillStyle='#ffd23f';X.font='bold 26px '+FONT;X.fillText('BUG-DEX',W/2,42);
 X.fillStyle='#cfe8ff';X.font='11px '+FONT;X.fillText('seen '+dexSeen()+' of '+DEX.length+'   \u00b7   tap a card you have beaten',W/2,60);
 const btn=(b,s,col)=>{X.fillStyle='rgba(6,14,28,.9)';X.beginPath();X.roundRect(b.x,b.y,b.w,b.h,8);X.fill();X.strokeStyle=col;X.lineWidth=1;X.stroke();X.fillStyle=col;X.font='bold 12px '+FONT;X.textAlign='center';X.fillText(s,b.x+b.w/2,b.y+b.h/2+4);};
 btn(DEXNAV.close,'\u2715  CLOSE','#ff9f9f');
 const start=dexPg*DEXC*DEXR;
 for(let r=0;r<DEXR;r++)for(let c=0;c<DEXC;c++){const card=DEX[start+r*DEXC+c];if(!card)continue;
  const x=DEXX+c*DEXW,y=DEXY+r*DEXH,seen=card.n()>0;
  X.fillStyle=seen?'rgba(20,40,60,.7)':'rgba(10,16,28,.7)';X.beginPath();X.roundRect(x+3,y+3,DEXW-6,DEXH-6,8);X.fill();
  X.strokeStyle=card.boss!=null?(seen?'rgba(255,120,120,.6)':'rgba(255,120,120,.18)'):(seen?'rgba(127,212,255,.45)':'rgba(255,255,255,.08)');X.lineWidth=1;X.stroke();
  X.save();X.translate(x+DEXW/2,y+44);dexSprite(card,card.boss!=null?58:50,!seen);X.restore();
  X.textAlign='center';X.font='bold 7.5px '+FONT;X.fillStyle=seen?'#fff':'rgba(255,255,255,.28)';X.fillText(seen?card.name:'? ? ?',x+DEXW/2,y+84);
  if(seen){X.font='7px '+FONT;X.fillStyle='rgba(255,210,63,.9)';X.fillText('\u00d7'+card.n(),x+DEXW/2,y+93);}}
 btn(DEXNAV.prev,'\u2039  PREV','#cfe8ff');btn(DEXNAV.next,'NEXT  \u203a','#cfe8ff');
 X.fillStyle='#cfe8ff';X.font='bold 12px '+FONT;X.textAlign='center';X.fillText('PAGE '+(dexPg+1)+' / '+DEXPAGES,W/2,H-95);
 X.font='9px '+FONT;X.fillStyle='rgba(255,255,255,.45)';X.fillText(touchMode?'tap outside a card to go back':'\u2190 \u2192 pages   \u00b7   ESC or D closes',W/2,H-64);
 if(dexPick){const c=dexPick,pw=380,ph=380,px=(W-pw)/2,py=(H-ph)/2;
  X.fillStyle='rgba(0,0,0,.6)';X.fillRect(0,0,W,H);
  X.fillStyle='rgba(10,22,40,.97)';X.beginPath();X.roundRect(px,py,pw,ph,14);X.fill();X.strokeStyle=c.boss!=null?'#ff9f9f':'#7fd4ff';X.lineWidth=2;X.stroke();
  X.save();X.translate(W/2,py+118);dexSprite(c,c.boss!=null?190:160,false);X.restore();
  X.textAlign='center';X.fillStyle='#ffd23f';X.font='bold 22px '+FONT;X.fillText(c.name,W/2,py+232);
  X.fillStyle='#8dff9a';X.font='bold 11px '+FONT;X.fillText((c.boss!=null?'defeated ':'beaten ')+c.n()+(c.n()===1?' time':' times'),W/2,py+250);
  X.fillStyle='#e8f2ff';X.font='13px '+FONT;const lines=wrapText(c.fact||'No one has written this one down yet.',pw-50);
  lines.forEach((l,i)=>X.fillText(l,W/2,py+278+i*18));
  X.fillStyle='rgba(255,255,255,.45)';X.font='9px '+FONT;X.fillText('tap anywhere to go back',W/2,py+ph-14);}
 X.restore();}
