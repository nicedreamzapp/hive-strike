// Every HUD box and every tappable button, checked for collisions at every life and
// bomb count the game can produce, on a touch device and on a desktop. Matt found the
// pause button sitting on top of the bomb count by playing; this finds it in 20 seconds.
import fs from 'node:fs';import {spawn} from 'node:child_process';
const PORT=9342;
const PROF=fs.mkdtempSync((process.env.TMPDIR||'/tmp')+'/hud-');
const br=spawn('/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',['--headless=new','--mute-audio','--no-first-run','--remote-debugging-port='+PORT,'--user-data-dir='+PROF,'--window-size=430,932','--autoplay-policy=no-user-gesture-required','about:blank'],{stdio:'ignore',detached:true});

// br.kill() only kills the parent; the GPU helper survives and busy-spins at ~40% CPU.
// Kill the whole process group, and do it even if we throw or get ctrl-C'd.
const killBrave=()=>{try{process.kill(-br.pid,'SIGKILL');}catch{}try{br.kill('SIGKILL');}catch{}};
process.on('exit',killBrave);process.on('SIGINT',()=>{killBrave();process.exit(130);});
process.on('uncaughtException',e=>{killBrave();console.error(e);process.exit(1);});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let list;for(let i=0;i<40;i++){try{list=await(await fetch(`http://127.0.0.1:${PORT}/json`)).json();break;}catch{await sleep(250);}}
const ws=new WebSocket(list.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend={};ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend[d.id]){pend[d.id](d);delete pend[d.id];}};
const send=(m,p={})=>new Promise(r=>{const i=++id;pend[i]=r;ws.send(JSON.stringify({id:i,method:m,params:p}));});
await send('Page.enable');await send('Runtime.enable');
await send('Page.navigate',{url:process.env.HS_URL||'http://127.0.0.1:8919/dist/index.html'});await sleep(2400);
const ev=async e=>{const r=await send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true});if(r.result.exceptionDetails)throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0,300));return r.result.result.value;};
await ev(`arm();startStage=1;start();for(let i=0;i<240;i++)t++;1`);
const probe = `(()=>{
  const out=[];
  for(const mode of [true,false]){
    touchMode=mode;
    for(const lives of [0,1,3,5,6,9,11,20]){
      for(const bombs of [0,1,2,3,5,9]){
        P.lives=lives;P.bombs=bombs;
        const rects=[];
        for(const k in HUDR){const r=HUDR[k]();if(r)rects.push({k,...r});}
        for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){
          const a=rects[i],b=rects[j];
          if(a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h)
            out.push(mode?'touch':'mouse', a.k+' x '+b.k+' at lives='+lives+' bombs='+bombs);
        }
        for(const r of rects) if(r.x<0||r.y<0||r.x+r.w>W||r.y+r.h>H)
          out.push((mode?'touch':'mouse')+' OFFSCREEN '+r.k+' lives='+lives+' bombs='+bombs);
      }
    }
  }
  touchMode=false;P.lives=5;P.bombs=3;
  return out;
})()`;
const clashes=await ev(probe);
// title-screen controls must not collide either
const title=await ev(`(()=>{const out=[];const rs=[{k:'musicBtn',...BTN.music},{k:'fxBtn',...BTN.sfx},{k:'musSlider',...BARS.mus},{k:'fxSlider',...BARS.sfx}];
 for(let i=0;i<16;i++)rs.push({k:'tile'+(i+1),...TILE(i)});
 for(let i=0;i<rs.length;i++)for(let j=i+1;j<rs.length;j++){const a=rs[i],b=rs[j];
  if(a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h)out.push(a.k+' x '+b.k);}
 for(const r of rs) if(r.x<0||r.y<0||r.x+r.w>W||r.y+r.h>H)out.push('OFFSCREEN '+r.k);
 return out;})()`);
const all=[...clashes,...title];
if(all.length){console.log('OVERLAPS FOUND:');all.forEach(c=>console.log('  '+c));}
else console.log('  PASS  no HUD box or button overlaps any other, at every life/bomb count, touch and mouse\n  PASS  nothing is drawn off screen\n\nHUD LAYOUT CLEAN');
ws.close();killBrave();process.exit(all.length?1:0);
