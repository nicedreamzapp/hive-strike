// ---------- title screen UI (2026-09-02, second redo: the painting stays whole) ----------
// Matt: "the buttons are covering the title, everything is too small to read, the art is
// buried, the whole front page looks bad." So: the art keeps the top third to itself, a 4x4
// grid of worlds you can actually read sits in the middle, ONE row of four big buttons under
// it, and a gear for the sliders. Tap a button to use it; HOLD it and a full-screen card in
// big letters says what it is. Controls and pick-ups moved into the HOW TO PLAY card, which
// also opens by itself the first time anyone starts a run.
const SBTN={music:{x:150,y:H-224,w:90,h:30},sfx:{x:260,y:H-224,w:90,h:30}};
const CARD_CONTRACT_Y0=140,CARD_CONTRACT_H=50;
function contractCardHit(p){for(let i=0;i<CONTRACTS.length;i++){const y=CARD_CONTRACT_Y0+i*CARD_CONTRACT_H;if(p.x>=24&&p.x<=W-24&&p.y>=y&&p.y<=y+CARD_CONTRACT_H-6)return i;}return -1;}
// white type over a painting needs an edge (Matt 9/2): stroke dark, then fill
function otext(txt,x,y,w){X.lineJoin='round';X.strokeStyle='rgba(0,0,0,.85)';X.lineWidth=w||3;X.strokeText(txt,x,y);X.fillText(txt,x,y);}
function hexPath(cx,cy,r){X.beginPath();for(let k=0;k<6;k++){const a=Math.PI/6+k*Math.PI/3;const px=cx+Math.cos(a)*r,py=cy+Math.sin(a)*r;k?X.lineTo(px,py):X.moveTo(px,py);}X.closePath();}
// glass: a dark tint you can see the painting through, one thin edge, one word
function titleBtn(b,col,word,hot){
 X.save();X.fillStyle=hot?'rgba(40,90,50,.22)':'rgba(0,0,0,.16)';X.beginPath();X.roundRect(b.x,b.y,b.w,b.h,b.h/2);X.fill();
 X.strokeStyle=col;X.globalAlpha=hot?.95:.6;X.lineWidth=1.2;X.stroke();X.globalAlpha=1;
 X.textAlign='center';X.shadowColor='#000';X.shadowBlur=4;X.fillStyle=col;X.font='bold 13px '+FONT;otext(word,b.x+b.w/2,b.y+b.h/2+5,3);X.restore();}
function drawTitleUI(sp){
 // the painting stays whole. only a soft shade at the very bottom so the words read over the flowers.
 {const g=X.createLinearGradient(0,470,0,H);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.45)');X.fillStyle=g;X.fillRect(0,470,W,H-470);}
 X.save();X.textAlign='center';X.shadowColor='#000';X.shadowBlur=6;
 // the picked world, in big letters, and its one-line hook
 {const th=THEMES[startStage-1],bs=bestFor(startStage);
  X.fillStyle='#ffd23f';X.font='bold 22px '+FONT;otext(th.name.replace('THE ',''),W/2,498,4);
  X.fillStyle='#fff';X.font='bold 11px '+FONT;otext(bs>0?'best '+bs:th.sub,W/2,516,2.5);}
 // sixteen comb cells, each a picture of its world. the picked one glows, the locked ones are dark.
 {const sheet=ART.worlds;
  for(let i=0;i<16;i++){const c=WCHIP(i),sel=startStage===i+1,th=THEMES[i],lock=(i+1)>unlocked,r=sel?26:24;
   X.save();X.shadowBlur=sel?14:0;X.shadowColor='#ffd23f';X.fillStyle='rgba(0,0,0,.18)';hexPath(c.cx,c.cy,r);X.fill();X.shadowBlur=0;
   hexPath(c.cx,c.cy,r);X.clip();
   if(sheet&&sheet.width){X.globalAlpha=sel?.85:.6;X.drawImage(sheet,(i%8)*96,Math.floor(i/8)*110,96,110,c.cx-r*.92,c.cy-r*1.05,r*1.84,r*2.1);X.globalAlpha=1;}
   else{const sg=X.createLinearGradient(0,c.cy-r,0,c.cy+r);sg.addColorStop(0,th.sky[0]);sg.addColorStop(1,th.ground[0]);X.fillStyle=sg;X.fillRect(c.cx-r,c.cy-r,r*2,r*2);}
   if(lock){X.fillStyle='rgba(0,0,0,.55)';X.fillRect(c.cx-r,c.cy-r,r*2,r*2);}
   X.restore();
   X.strokeStyle=sel?'#ffd23f':lock?'rgba(255,255,255,.18)':'rgba(255,240,200,.6)';X.lineWidth=sel?2.5:1;hexPath(c.cx,c.cy,r);X.stroke();
   X.shadowColor='#000';X.shadowBlur=4;
   if(lock){X.strokeStyle='rgba(255,255,255,.55)';X.lineWidth=2;X.beginPath();X.roundRect(c.cx-6,c.cy-3,12,10,2);X.stroke();X.beginPath();X.arc(c.cx,c.cy-4,4,Math.PI,0);X.stroke();}
   else{X.fillStyle='#fff';X.font='bold 16px '+FONT;otext(String(i+1),c.cx,c.cy+6,3);}
   X.fillStyle=sel?'#ffd23f':lock?'rgba(255,255,255,.35)':'rgba(255,255,255,.9)';X.font='bold 8px '+FONT;otext(th.name.replace('THE ',''),c.cx,c.cy+r+10,2);X.shadowBlur=0;}}
 // PLAY in the middle, help and the bug-dex either side. hold either side button for its card.
 {const b=CBTN.play,pulse=.5+Math.sin(t*.08)*.5;X.save();X.shadowColor='#ffd23f';X.shadowBlur=10+pulse*10;X.fillStyle='rgba(255,210,63,.55)';X.beginPath();X.roundRect(b.x,b.y,b.w,b.h,19);X.fill();X.restore();X.strokeStyle='rgba(255,230,140,.9)';X.lineWidth=1.2;X.beginPath();X.roundRect(b.x,b.y,b.w,b.h,19);X.stroke();
  X.fillStyle='#fff';X.font='bold 18px '+FONT;X.shadowColor='#000';X.shadowBlur=4;const cp=loadCheckpoint();otext(cp?'RESUME  '+((cp.stage-1)%NL+1):'PLAY',b.x+b.w/2,b.y+25,3.5);}
 titleBtn(CBTN.help,'#ffffff','HELP',false);
 titleBtn(CBTN.dex,'#7fd4ff','BUG-DEX',false);
 X.restore();
 // gear, top right, small
 {const b=CBTN.gear;X.save();X.translate(b.x+b.w/2,b.y+b.h/2);X.shadowColor='#000';X.shadowBlur=4;X.strokeStyle='rgba(255,255,255,.8)';X.lineWidth=2.5;for(let k=0;k<8;k++){const a=k*Math.PI/4;X.beginPath();X.moveTo(Math.cos(a)*5,Math.sin(a)*5);X.lineTo(Math.cos(a)*9,Math.sin(a)*9);X.stroke();}
  X.beginPath();X.arc(0,0,5,0,7);X.stroke();X.restore();}
 X.shadowBlur=0;
 if(settingsOpen)drawSettingsSheet();
 if(cardOpen)drawCard(cardOpen);}
function drawSettingsSheet(){
 X.save();X.fillStyle='rgba(0,0,0,.35)';X.fillRect(0,0,W,H);
 X.fillStyle='rgba(10,20,36,.82)';X.beginPath();X.roundRect(40,H-262,W-80,190,14);X.fill();X.strokeStyle='rgba(255,255,255,.3)';X.lineWidth=1;X.stroke();
 X.textAlign='center';X.fillStyle='#fff';X.font='bold 18px '+FONT;X.fillText('SOUND',W/2,H-236);
 const tog=(b,lab,on,col)=>{X.fillStyle=on?col:'rgba(255,255,255,.12)';X.beginPath();X.roundRect(b.x,b.y,b.w,b.h,8);X.fill();X.fillStyle=on?'#0b1a0c':'rgba(255,255,255,.7)';X.font='bold 12px '+FONT;X.fillText(lab+(on?' ON':' OFF'),b.x+b.w/2,b.y+20);};
 tog(SBTN.music,'MUSIC',MUSIC.on,'#7fd4ff');tog(SBTN.sfx,'FX',SFX_ON,'#ffd23f');
 const bar=(b,lab,v,col)=>{X.textAlign='right';X.font='bold 11px '+FONT;X.fillStyle='rgba(255,255,255,.8)';X.fillText(lab,b.x-12,b.y+11);
  X.fillStyle='rgba(0,0,0,.5)';X.beginPath();X.roundRect(b.x,b.y,b.w,b.h,5);X.fill();X.fillStyle=col;X.beginPath();X.roundRect(b.x,b.y,Math.max(4,b.w*v),b.h,5);X.fill();
  X.textAlign='left';X.font='11px '+FONT;X.fillStyle='rgba(255,255,255,.7)';X.fillText(Math.round(v*100)+'%',b.x+b.w+10,b.y+11);};
 bar(BARS.mus,'MUSIC',MUSLV,'#7fd4ff');bar(BARS.sfx,'FX',SFXLV,'#ffd23f');
 X.textAlign='center';X.font='10px '+FONT;X.fillStyle='rgba(220,235,255,.6)';X.fillText('tap outside to close',W/2,H-86);X.restore();}
// one full-screen card, big type, few words. closes on the next tap.
function drawCard(kind){
 X.save();X.fillStyle='rgba(4,10,20,.80)';X.fillRect(0,0,W,H);X.textAlign='center';X.shadowColor='#000';X.shadowBlur=6;
 const title=(txt,col)=>{X.fillStyle=col;X.font='bold 34px '+FONT;X.fillText(txt,W/2,86);};
 const line=(txt,y,size=17,col='#fff')=>{X.fillStyle=col;X.font=(size>=17?'bold ':'')+size+'px '+FONT;X.fillText(txt,W/2,y);};
 if(kind==='daily'){const dc=dailyContract(),db=dailyBest();title('DAILY HIVE','#8dff9a');
  line('One challenge run a day.',150);line('The same run for everyone, everywhere.',176,15,'#cfe8ff');
  line("TODAY'S RULE",240,13,'#8dff9a');line(dc.label,272,26,'#ffd23f');line(dc.terms,300,15,'#cfe8ff');line('score counts  x'+dc.mult,330,20);
  line('Starts at world 1.',400,15,'#cfe8ff');line(db?'Your best today:  '+db:'You have not flown today.',428,15,'#cfe8ff');
  line('TAP DAILY TO FLY IT',520,16,'#8dff9a');}
 else if(kind==='contract'){title("QUEEN'S CONTRACT",'#ffd23f');line('A deal for your normal runs. Tap one.',118,13,'#cfe8ff');
  for(let i=0;i<CONTRACTS.length;i++){const c=CONTRACTS[i],y=CARD_CONTRACT_Y0+i*CARD_CONTRACT_H,on=i===contractIx;
   X.fillStyle=on?'rgba(255,210,63,.18)':'rgba(255,255,255,.06)';X.beginPath();X.roundRect(24,y,W-48,CARD_CONTRACT_H-6,9);X.fill();
   if(on){X.strokeStyle='#ffd23f';X.lineWidth=2;X.stroke();}
   X.textAlign='left';X.fillStyle=on?'#ffd23f':'#fff';X.font='bold 15px '+FONT;X.fillText(c.label,38,y+20);
   X.font='11px '+FONT;X.fillStyle='#cfe8ff';X.fillText(c.terms,38,y+36);
   X.textAlign='right';X.font='bold 16px '+FONT;X.fillStyle=c.mult>1?'#8dff9a':c.mult<1?'#ff9a9a':'#fff';X.fillText('x'+c.mult,W-38,y+28);}
  X.textAlign='center';line('bigger number = harder run, bigger score',CARD_CONTRACT_Y0+CONTRACTS.length*CARD_CONTRACT_H+22,12,'#cfe8ff');}
 else if(kind==='help'){title('HOW TO PLAY','#fff');
  const rows=touchMode
   ?[['MOVE','drag anywhere, the bee rides above your finger'],['BOMB','the button bottom right, or it fires itself when you are about to be hit'],['PAUSE','the II button top right']]
   :[['MOVE','arrows or WASD, the bee follows the mouse'],['FOCUS','hold SHIFT to go slow and precise'],['BOMB','X or B, or it fires itself when you are about to be hit'],['PAUSE','P']];
  let y=136;for(const r of rows){X.textAlign='left';X.fillStyle='#ffd23f';X.font='bold 15px '+FONT;X.fillText(r[0],36,y);X.fillStyle='#fff';X.font='13px '+FONT;X.fillText(r[1],110,y);y+=30;}
  y+=6;X.textAlign='center';
  // the two colours you must know, drawn as the things themselves, not described
  X.strokeStyle='#8dff9a';X.lineWidth=3;ell(110,y+10,14,14);X.stroke();X.fillStyle='#fff';X.font='bold 15px '+FONT;X.fillText('GRAB IT',110,y+44);
  X.fillStyle=rg(W-110,y+10,22,'rgba(255,60,220,.9)','rgba(255,40,200,0)');ell(W-110,y+10,22,22);X.fill();X.strokeStyle='#ff3bd4';X.lineWidth=2;ell(W-110,y+10,14,14);X.stroke();X.fillStyle='#fff';X.fillText('DODGE IT',W-110,y+44);
  y+=84;const pick=[['NECTAR','power up, Lv1 to Lv5'],['S','a bomb'],['HEART','an extra life'],['GUN','the label says what it does']];
  for(const r of pick){X.textAlign='left';X.fillStyle='#8dff9a';X.font='bold 14px '+FONT;X.fillText(r[0],36,y);X.fillStyle='#fff';X.font='13px '+FONT;X.fillText(r[1],110,y);y+=26;}
  y+=10;X.textAlign='center';line('CHAIN: six fast kills = x2 score, up to x8.',y,13,'#cfe8ff');line('Fill the bar at the top to reach the boss.',y+20,13,'#cfe8ff');
  line('TAP TO CLOSE',H-40,14,'#ffd23f');}
 else if(kind==='dex'){const n=dexSeen();title('BUG-DEX','#7fd4ff');
  line('Every bug you have beaten,',160);line('with a true fact about the real one.',186,15,'#cfe8ff');
  line(n+' of '+DEX.length+' found',260,26,'#ffd23f');line('TAP BUG-DEX TO OPEN IT',520,16,'#7fd4ff');}
 if(kind!=='help')line('tap anywhere to close',H-40,12,'rgba(220,235,255,.6)');
 X.restore();}
