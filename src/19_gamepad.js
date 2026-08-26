// ---------- gamepad ----------
// firing is automatic, so a pad only needs: move, bomb, slow, pause, confirm.
const PAD={x:0,y:0,slow:0,on:false,_bomb:0,_start:0,_ok:0,_lr:0};
function padTick(){
 if(!navigator.getGamepads)return;
 let g=null;const gs=navigator.getGamepads();
 for(let i=0;i<gs.length;i++){if(gs[i]&&gs[i].connected){g=gs[i];break;}}
 if(!g){if(PAD.on){PAD.on=false;PAD.x=PAD.y=PAD.slow=0;}return;}
 if(!PAD.on){PAD.on=true;say('CONTROLLER CONNECTED');}
 const dz=v=>Math.abs(v)<.22?0:(v-Math.sign(v)*.22)/.78, b=g.buttons, pressed=i=>!!(b[i]&&b[i].pressed);
 const dl=pressed(14),dr=pressed(15),du=pressed(12),dd=pressed(13);
 PAD.x=Math.max(-1,Math.min(1,dz(g.axes[0]||0)+(dr?1:0)-(dl?1:0)));
 PAD.y=Math.max(-1,Math.min(1,dz(g.axes[1]||0)+(dd?1:0)-(du?1:0)));
 PAD.slow=(pressed(6)||pressed(4))?1:0;                        // LT / LB = precision move
 const bomb=(pressed(0)||pressed(1)||pressed(5)||pressed(7))?1:0;  // A / B / RB / RT = bomb
 const start=pressed(9)?1:0, ok=(pressed(0)||pressed(9))?1:0;
 if(state==='play'){if(bomb&&!PAD._bomb)wantBomb=1;
  if(start&&!PAD._start){if(resumeCountdown>0){resumeCountdown=0;paused=false;}else paused=!paused;}}
 else{
  const lr=(PAD.x>.5?1:PAD.x<-.5?-1:0);
  if(lr&&!PAD._lr)pickStage(startStage+lr);
  PAD._lr=lr;
  if(ok&&!PAD._ok){audioWake();if(state==='won')continueGame();else if(!armed)arm();else start();}
 }
 PAD._bomb=bomb;PAD._start=start;PAD._ok=ok;
}

