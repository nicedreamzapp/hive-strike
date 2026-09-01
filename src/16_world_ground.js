// ---------- WORLD: themed parallax ground ----------
let decor=[],clouds=[],palA=0,palB=0,palMix=1;

// RULE: the background is scenery, not action. Only characters, shots and pickups move. Decor never animates, never falls.
const DK={ // decor kinds per theme: [kind, count, layer]  layer 0 = big/dim ground shapes, 1 = mid, 2 = small details
 meadow:[['hill',5,0],['tree',8,1],['flower',12,2],['grass',30,2]],
 garden:[['hedge',6,0],['rose',9,1],['tulip',12,2]],
 pond:[['ripple',8,0],['lily',8,1],['reed',14,2]],
 orchard:[['orchrow',5,0],['appletree',8,1],['apple',8,2]],
 night:[['darktree',8,0],['mushroom',9,1]],
 hive:[['comb',30,0],['drip',6,1],['cell',8,1]],
 dunes:[['hill',5,0],['grass',16,2]],
};
const LSP=[.12,.12,.12]; // one uniform, barely-visible crawl — no parallax
function buildDecor(i){const th=THEMES[i];decor=[];for(const [k,n,l] of DK[th.decor])for(let j=0;j<n;j++)decor.push({k,l,x:R(-20,W+20),y:R(-40,H+40),s:R(.7,1.3),g:R(0,7),c:RI(0,4)});decor.sort((a,b)=>a.l-b.l);}
function drawDecorItem(d,th){const s=d.s;X.save();X.translate(d.x,d.y);
 switch(d.k){
  case 'hill':X.fillStyle=rg(0,0,100*s,lerpC(th.ground[0],'#ffffff',.18),th.ground[1]);ell(0,0,110*s,42*s);X.fill();break;
  case 'tree':{X.fillStyle='rgba(0,0,0,.2)';ell(10*s,10*s,22*s,10*s);X.fill();X.fillStyle=rg(0,0,20*s,'#4aa04a','#1d5229');for(let k=0;k<4;k++){ell(Math.cos(k*1.7+d.g)*9*s,Math.sin(k*1.7+d.g)*7*s,14*s,12*s);X.fill();}X.fillStyle='rgba(255,255,255,.18)';ell(-6*s,-7*s,7*s,5*s);X.fill();break;}
  case 'flower':{X.rotate(d.g);const c=['#ff5e7e','#ffd166','#b388ff','#ff9f43','#fff'][d.c];X.fillStyle='rgba(0,0,0,.15)';ell(3,4,9*s,6*s);X.fill();X.fillStyle=c;for(let k=0;k<5;k++){ell(Math.cos(k*1.257)*6*s,Math.sin(k*1.257)*6*s,5*s,3.2*s,k*1.257);X.fill();}X.fillStyle='#ffe680';ell(0,0,2.5*s,2.5*s);X.fill();break;}
  case 'grass':{X.strokeStyle=th.ground[1];X.globalAlpha=.7;X.lineWidth=1.3;X.beginPath();const sw=Math.sin(d.g)*3;for(let k=-1;k<=1;k++){X.moveTo(k*3,0);X.quadraticCurveTo(k*3+sw,-8*s,k*5+sw*1.5,-16*s);}X.stroke();break;}
  case 'hedge':X.fillStyle=rg(0,0,60*s,'#5a8a3a','#22401a');ell(0,0,70*s,26*s);X.fill();X.fillStyle='rgba(255,255,255,.08)';ell(-20*s,-8*s,30*s,8*s);X.fill();break;
  case 'rose':{X.fillStyle='rgba(0,0,0,.2)';ell(6*s,8*s,16*s,7*s);X.fill();X.fillStyle=rg(0,0,14*s,'#3a7a30','#163a10');ell(0,0,14*s,12*s);X.fill();const c=['#ff3a5a','#ff7aa0','#ffd0e0','#ff5030','#ffe0a0'][d.c];for(let k=0;k<4;k++){X.fillStyle=rg(Math.cos(k*1.6+d.g)*8*s,Math.sin(k*1.6+d.g)*6*s,4*s,'#fff',c);ell(Math.cos(k*1.6+d.g)*8*s,Math.sin(k*1.6+d.g)*6*s,4*s,4*s);X.fill();}break;}
  case 'tulip':{const c=['#ff3a3a','#ffd23f','#ff70b0','#ff8c3a','#f0f0ff'][d.c];X.strokeStyle='#2a6a20';X.lineWidth=2;X.beginPath();X.moveTo(0,10*s);X.lineTo(0,-4*s);X.stroke();X.fillStyle=rg(0,-8*s,6*s,'#fff',c);X.beginPath();X.moveTo(-6*s,-4*s);X.quadraticCurveTo(-7*s,-16*s,0,-14*s);X.quadraticCurveTo(7*s,-16*s,6*s,-4*s);X.closePath();X.fill();break;}
  case 'petal':X.globalAlpha=.8;X.fillStyle=['#ff8fa3','#fff','#ffd6e0','#ffb0c0','#ffe0a0'][d.c];ell(0,0,5*s,2.5*s,d.g+t*.02);X.fill();break;
  case 'ripple':{X.strokeStyle='rgba(255,255,255,.22)';X.lineWidth=1.5;ell(0,0,40*s,14*s);X.stroke();ell(0,0,26*s,9*s);X.stroke();ell(0,0,12*s,4*s);X.stroke();break;}
  case 'lily':{X.fillStyle='rgba(0,30,50,.3)';ell(4,6,20*s,12*s);X.fill();X.fillStyle=rg(0,0,20*s,'#6ac05a','#1f6a2a');X.beginPath();X.moveTo(0,0);X.arc(0,0,20*s,d.g,d.g+5.6);X.closePath();X.fill();X.fillStyle='rgba(255,255,255,.15)';ell(-6*s,-5*s,8*s,4*s);X.fill();if(d.c<2){X.fillStyle=rg(0,-4*s,6*s,'#fff','#ffb0d0');for(let k=0;k<6;k++){ell(Math.cos(k*1.05)*5*s,-4*s+Math.sin(k*1.05)*3*s,4*s,2.5*s,k*1.05);X.fill();}X.fillStyle='#ffe040';ell(0,-4*s,2.5*s,2.5*s);X.fill();}break;}
  case 'reed':{X.strokeStyle='#2a6a3a';X.lineWidth=2.2;X.beginPath();const sw=Math.sin(d.g)*4;X.moveTo(0,0);X.quadraticCurveTo(sw,-18*s,sw*1.6,-36*s);X.moveTo(5,2);X.quadraticCurveTo(5+sw,-14*s,5+sw*1.5,-28*s);X.stroke();X.fillStyle='#6a4a20';ell(sw*1.6,-36*s,2.5,7*s);X.fill();break;}
  case 'bubble':X.strokeStyle='rgba(255,255,255,.5)';X.lineWidth=1;ell(0,0,3*s,3*s);X.stroke();X.fillStyle='rgba(255,255,255,.5)';ell(-1,-1,1,1);X.fill();break;
  case 'orchrow':X.fillStyle=rg(0,0,90*s,'#c88a3a','#7a4a1a');ell(0,0,120*s,34*s);X.fill();break;
  case 'appletree':{X.fillStyle='rgba(0,0,0,.22)';ell(12*s,12*s,26*s,12*s);X.fill();X.fillStyle=rg(0,0,24*s,'#e0a040','#7a3a10');for(let k=0;k<4;k++){ell(Math.cos(k*1.6+d.g)*10*s,Math.sin(k*1.6+d.g)*8*s,15*s,13*s);X.fill();}X.fillStyle='#e0302a';for(let k=0;k<5;k++){ell(Math.cos(k*1.3+d.g)*12*s,Math.sin(k*1.3+d.g)*9*s,3*s,3*s);X.fill();}X.fillStyle='rgba(255,255,255,.2)';ell(-8*s,-8*s,8*s,5*s);X.fill();break;}
  case 'leaf':X.fillStyle=['#e05a20','#ffb020','#c02a10','#ffd860','#a04010'][d.c];X.rotate(d.g+t*.01);X.beginPath();X.moveTo(0,-6*s);X.quadraticCurveTo(5*s,0,0,6*s);X.quadraticCurveTo(-5*s,0,0,-6*s);X.fill();break;
  case 'apple':X.fillStyle='rgba(0,0,0,.2)';ell(2,3,6*s,3*s);X.fill();X.fillStyle=rg(0,0,6*s,'#ff7060','#8a0a00');ell(0,0,5.5*s,5.5*s);X.fill();X.strokeStyle='#4a2a10';X.lineWidth=1.2;X.beginPath();X.moveTo(0,-4*s);X.lineTo(1.5,-8*s);X.stroke();break;
  case 'darktree':{X.fillStyle=rg(0,0,34*s,'#2a3c66','#0b1228');for(let k=0;k<4;k++){ell(Math.cos(k*1.7+d.g)*12*s,Math.sin(k*1.7+d.g)*9*s,20*s,17*s);X.fill();}X.fillStyle='rgba(160,190,255,.12)';ell(-9*s,-9*s,10*s,6*s);X.fill();break;}
  case 'mushroom':{X.fillStyle='rgba(0,0,0,.3)';ell(3,6,8*s,4*s);X.fill();X.fillStyle='#d8d0c0';X.fillRect(-2.5*s,-2*s,5*s,8*s);X.fillStyle=rg(0,-4*s,9*s,['#ff4040','#c070ff','#60e0ff','#ffb040','#ff6080'][d.c],'#301040');ell(0,-4*s,9*s,5*s);X.fill();X.fillStyle='rgba(255,255,255,.7)';ell(-3*s,-5*s,1.6*s,1.2*s);X.fill();ell(3*s,-4*s,1.2*s,1*s);X.fill();X.fillStyle=['rgba(255,80,80,.18)','rgba(200,120,255,.2)','rgba(100,220,255,.2)','rgba(255,180,60,.18)','rgba(255,100,140,.18)'][d.c];ell(0,-2*s,18*s,12*s);X.fill();break;}
  case 'fog':X.fillStyle='rgba(150,170,220,.10)';ell(0,0,120*s,30*s);X.fill();break;
  case 'spark':{const g=(Math.sin(t*.1+d.g)+1)/2;X.fillStyle=`rgba(220,255,140,${.3+g*.6})`;ell(0,0,1.5+g*1.5,1.5+g*1.5);X.fill();X.fillStyle=`rgba(220,255,140,${g*.15})`;ell(0,0,8,8);X.fill();break;}
  case 'comb':{X.strokeStyle='rgba(60,30,0,.35)';X.lineWidth=3;X.fillStyle=['rgba(255,200,80,.25)','rgba(255,170,40,.3)','rgba(200,120,20,.25)','rgba(255,220,120,.2)','rgba(180,100,10,.3)'][d.c];X.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3;X.lineTo(Math.cos(a)*34*s,Math.sin(a)*34*s);}X.closePath();X.fill();X.stroke();X.strokeStyle='rgba(255,240,180,.25)';X.lineWidth=1.5;X.beginPath();for(let k=3;k<6;k++){const a=k*Math.PI/3;X.lineTo(Math.cos(a)*30*s,Math.sin(a)*30*s);}X.stroke();break;}
  case 'drip':X.fillStyle=rg(0,0,8*s,'#ffe070','#c07010');X.beginPath();X.moveTo(0,-14*s);X.quadraticCurveTo(8*s,4*s,0,10*s);X.quadraticCurveTo(-8*s,4*s,0,-14*s);X.fill();X.fillStyle='rgba(255,255,255,.5)';ell(-2*s,-2*s,1.6*s,4*s);X.fill();break;
  case 'cell':X.fillStyle='rgba(60,30,0,.4)';X.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3;X.lineTo(Math.cos(a)*14*s,Math.sin(a)*14*s);}X.closePath();X.fill();X.fillStyle=rg(0,0,10*s,'#fff0a0','#e0a020');ell(0,0,9*s,9*s);X.fill();break;
  case 'dust':X.fillStyle='rgba(255,240,160,.7)';ell(0,0,1.6*s,1.6*s);X.fill();break;
 }X.restore();}
function drawWorld(){const th=LV(),want=(stage-1)%NL;if(want!==palB){palA=palB;palB=want;palMix=0;}if(palMix<1)palMix=Math.min(1,palMix+.02);
 artSync();const artB=ART['level'+(palB+1)],artA=ART['level'+(palA+1)];
 if(artB){if(artA&&palMix<1)drawArt(artA,1,PXD[palA+1]);drawArt(artB,artA?palMix:1,PXD[palB+1]);
  // calm the picture a little so bugs, shots and treats stay the loudest thing on screen
  X.fillStyle='rgba(0,0,0,.14)';X.fillRect(0,0,W,H);return;}
 const scroll=state==='play'&&!paused?1:.4;
 const g=X.createLinearGradient(0,0,0,H);g.addColorStop(0,lerpC(THEMES[palA].sky[1],THEMES[palB].sky[1],palMix));g.addColorStop(.25,lerpC(THEMES[palA].ground[0],THEMES[palB].ground[0],palMix));g.addColorStop(1,lerpC(THEMES[palA].ground[1],THEMES[palB].ground[1],palMix));X.fillStyle=g;X.fillRect(-20,-20,W+40,H+40);
 if(th.stars){X.fillStyle='#fff';X.globalAlpha=.55;for(let i=0;i<50;i++){const sx=(i*137.5)%W,sy=(i*89.3)%H;X.fillRect(sx,sy,1.5,1.5);}X.globalAlpha=1;X.fillStyle='rgba(200,215,255,.25)';ell(400,90,60,60);X.fill();X.fillStyle=rg(400,90,26,'#fff','#c0d0ff');ell(400,90,26,26);X.fill();}
 let layer=-1;for(const d of decor){if(d.l!==layer){layer=d.l;X.globalAlpha=layer===0?.75:1;}d.y+=LSP[d.l]*scroll*(1+d.s*.1);if(d.y>H+60){d.y=-60;d.x=R(-20,W+20);}drawDecorItem(d,th);}X.globalAlpha=1;
}
