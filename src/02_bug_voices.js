// ---------- a voice for every bug ----------
// 27 of the 49 types had no VOICE entry at all and fell through to a fallback that did not exist,
// so most of the roster shared whatever happened to be nearest. every type now gets its own
// enter / hit / die built from the sound a real one of these actually makes.
const V2={
 // flies and midges: thin wing whine, pitch is the whole personality
 fly:        {e:()=>buzz(J(320),.28,'sawtooth',.026,45,42,2200),      h:()=>buzz(J(360),.05,'sawtooth',.02,40,50,2200), d:()=>{buzz(300,.26,'sawtooth',.03,90,30,2400,70);noise(.12,.02,900,.6,220,'lowpass');}},
 horsefly:   {e:()=>buzz(J(150),.35,'sawtooth',.035,40,35,1300),      h:()=>buzz(J(180),.06,'sawtooth',.02,40,40,1300), d:()=>buzz(160,.3,'sawtooth',.04,80,25,1500,50)},
 shorefly:   {e:()=>buzz(J(420),.22,'sawtooth',.02,50,55,2600),       h:()=>click(2400,.016),                          d:()=>buzz(400,.2,'sawtooth',.026,90,40,2800,90)},
 mosquito:   {e:()=>buzz(J(620),.4,'sawtooth',.016,25,70,4200),       h:()=>buzz(J(700),.05,'sawtooth',.014,30,80,4200),d:()=>buzz(600,.3,'sawtooth',.02,120,60,4600,140)},
 // wasps and hornets: heavier, angrier buzz with a rasp under it
 wasp:       {e:()=>{buzz(J(230),.32,'sawtooth',.032,55,30,1800);noise(.1,.012,2600,.8,1200,'bandpass');}, h:()=>buzz(J(260),.06,'sawtooth',.024,50,36,1900), d:()=>{buzz(240,.3,'sawtooth',.038,100,26,2000,80);hiss(.2,.02,3000,900);}},
 hornet:     {e:()=>{buzz(J(190),.36,'sawtooth',.036,60,26,1500);}, h:()=>buzz(J(215),.06,'sawtooth',.026,55,32,1600), d:()=>{buzz(200,.34,'sawtooth',.042,110,22,1700,70);noise(.14,.022,700,.6,200,'lowpass');}},
 jewelwasp:  {e:()=>{buzz(J(300),.26,'square',.024,45,44,2600);tone(J(1800),.08,'sine',.012,2400);}, h:()=>click(2800,.018), d:()=>{buzz(290,.22,'square',.03,90,40,2800,110);jingle([1500,1900,2400],'sine',.014,.05);}},
 // beetles: a low dry drone and a hard shell clack
 beetle:     {e:()=>{snd(J(110),.22,'triangle',.03,70);noise(.14,.02,500,.8,180,'lowpass');}, h:()=>click(900,.022), d:()=>{snd(90,.3,'sawtooth',.04,40);noise(.3,.035,420,.6,120,'lowpass');}},
 dungbeetle: {e:()=>{noise(.3,.03,400,.7,150,'lowpass');snd(J(80),.2,'triangle',.03,50);}, h:()=>snd(J(100),.05,'square',.015,70), d:()=>{noise(.5,.045,500,.5,100,'lowpass');snd(60,.4,'sawtooth',.045,30);}},
 blisterbeetle:{e:()=>{snd(J(130),.2,'square',.026,80);hiss(.16,.016,2200,700);}, h:()=>click(1100,.02), d:()=>{hiss(.34,.03,2600,500);snd(100,.26,'square',.03,50);}},
 weevil:     {e:()=>buzz(J(200),.3,'square',.02,20,80,1500),          h:()=>click(1200,.02),                           d:()=>{buzz(220,.25,'square',.03,30,90,1500,80);noise(.1,.03,800,.7,200,'lowpass');}},
 ladybug:    {e:()=>{tone(J(760),.12,'sine',.02,980);noise(.1,.012,1400,.5,600,'lowpass');}, h:()=>click(1500,.018), d:()=>{tone(J(700),.2,'sine',.024,320);noise(.16,.018,900,.5,300,'lowpass');}},
 harlequin:  {e:()=>{snd(J(160),.18,'triangle',.026,110);click(1700,.014);}, h:()=>click(1600,.02), d:()=>{snd(140,.26,'triangle',.032,60);jingle([900,700,520],'triangle',.018,.05);}},
 lanternbug: {e:()=>{tone(J(880),.2,'sine',.02,1250,0,.08);}, h:()=>tone(J(1150),.05,'sine',.016), d:()=>jingle([1250,980,760,560],'sine',.02,.055)},
 // crickets, hoppers and katydids: chirp trains
 grasshopper:{e:()=>cricket(3200,4,.02),  h:()=>cricket(3600,2,.016), d:()=>{cricket(2600,6,.022);tone(J(420),.14,'sine',.02,180);}},
 katydid:    {e:()=>cricket(3800,4,.02),  h:()=>cricket(4400,2,.018), d:()=>{cricket(3200,5,.02);tone(J(500),.12,'sine',.02,200);}},
 cavecricket:{e:()=>cricket(2600,5,.02),  h:()=>cricket(3000,2,.016), d:()=>{cricket(2200,7,.022);noise(.2,.02,600,.6,200,'lowpass');}},
 lavacricket:{e:()=>{cricket(2900,4,.02);hiss(.14,.014,2000,600);}, h:()=>cricket(3300,2,.016), d:()=>{cricket(2400,6,.022);noise(.26,.03,500,.5,140,'lowpass');}},
 sandhopper: {e:()=>{cricket(4200,3,.016);noise(.1,.014,1800,.5,700,'bandpass');}, h:()=>click(2000,.016), d:()=>{cricket(3600,4,.018);noise(.22,.024,1200,.5,300,'bandpass');}},
 snowflea:   {e:()=>cricket(5200,3,.012), h:()=>click(3000,.012),     d:()=>cricket(4600,4,.014)},
 springtail: {e:()=>cricket(4800,3,.012), h:()=>click(2800,.012),     d:()=>cricket(4200,4,.014)},
 // cicadas and hoppers: a dry rattling rasp
 cicada:     {e:()=>{noise(.5,.022,3200,3,2600,'bandpass');}, h:()=>noise(.07,.02,3600,3,3000,'bandpass'), d:()=>{noise(.7,.03,2800,2.5,900,'bandpass');snd(J(180),.2,'sawtooth',.024,80);}},
 leafhopper: {e:()=>rattle(4,.014),       h:()=>click(2600,.014),     d:()=>{rattle(7,.018);tone(J(900),.1,'sine',.014,400);}},
 planthopper:{e:()=>rattle(5,.014),       h:()=>click(2400,.014),     d:()=>{rattle(8,.018);tone(J(800),.1,'sine',.014,360);}},
 psyllid:    {e:()=>rattle(3,.012),       h:()=>click(3000,.012),     d:()=>rattle(6,.015)},
 lacebug:    {e:()=>rattle(3,.010),       h:()=>click(3400,.010),     d:()=>rattle(5,.013)},
 stinkbug:   {e:()=>{hiss(.3,.02,2600,800);}, h:()=>hiss(.06,.016,3000,1400), d:()=>{hiss(.5,.03,2200,500);snd(J(140),.18,'square',.024,70);}},
 // moths and butterflies: soft papery wingbeats, no buzz at all
 moth:       {e:()=>noise(.26,.014,1100,.4,420,'lowpass'), h:()=>noise(.05,.016,900,.6,380,'lowpass'), d:()=>{noise(.34,.022,800,.4,180,'lowpass');tone(J(900),.16,'sine',.012,420);}},
 ashmoth:    {e:()=>noise(.3,.016,800,.4,300,'lowpass'),   h:()=>noise(.05,.016,700,.6,260,'lowpass'), d:()=>{noise(.4,.026,600,.4,140,'lowpass');tone(J(700),.18,'sine',.012,300);}},
 woollybear: {e:()=>noise(.34,.02,600,.5,220,'lowpass'),   h:()=>noise(.06,.018,520,.6,200,'lowpass'), d:()=>{noise(.46,.03,460,.4,110,'lowpass');snd(J(120),.2,'triangle',.026,60);}},
 butterfly:  {e:()=>noise(.2,.012,1200,.4,500,'lowpass'),  h:()=>noise(.05,.015,1000,.6,400,'lowpass'),d:()=>{noise(.3,.02,900,.4,200,'lowpass');tone(J(1200),.15,'sine',.012,600);}},
 morpho:     {e:()=>{noise(.22,.012,1400,.4,600,'lowpass');tone(J(1500),.1,'sine',.01,1900);}, h:()=>noise(.05,.014,1100,.6,400,'lowpass'), d:()=>{noise(.3,.02,1000,.4,240,'lowpass');jingle([1600,1300,1000],'sine',.014,.05);}},
 apollo:     {e:()=>noise(.24,.012,1300,.4,560,'lowpass'), h:()=>noise(.05,.014,1050,.6,420,'lowpass'),d:()=>{noise(.32,.02,950,.4,220,'lowpass');tone(J(1050),.16,'sine',.012,480);}},
 glasswing:  {e:()=>{noise(.18,.010,1800,.4,900,'lowpass');tone(J(2100),.08,'sine',.008,2600);}, h:()=>click(2600,.012), d:()=>jingle([2100,1700,1300],'sine',.012,.05)},
 scorpionfly:{e:()=>{buzz(J(380),.22,'triangle',.02,40,50,2400);}, h:()=>click(2200,.016), d:()=>{buzz(360,.2,'triangle',.026,80,44,2600,100);click(1400,.018);}},
 stonefly:   {e:()=>noise(.22,.012,1600,.5,700,'lowpass'), h:()=>noise(.05,.014,1300,.6,500,'lowpass'),d:()=>{noise(.3,.02,1200,.5,300,'lowpass');tone(J(800),.14,'sine',.012,340);}},
 mayfly:     {e:()=>noise(.16,.010,2000,.4,900,'lowpass'), h:()=>click(2800,.010),                     d:()=>noise(.22,.016,1500,.4,400,'lowpass')},
 // dragonflies: a hard four-wing clatter
 dragon:     {e:()=>{rattle(6,.016);tone(J(1300),.1,'sine',.012,1700);}, h:()=>click(2200,.02), d:()=>{rattle(9,.02);tone(J(1000),.18,'sine',.018,380);}},
 // ants and termites: mandible clicks and scuttling
 ant:        {e:()=>chitter(4,1300,.016,26), h:()=>click(1600,.018),  d:()=>{chitter(6,1100,.02,20);snd(J(150),.14,'square',.02,70);}},
 leafcutter: {e:()=>chitter(5,1500,.016,24), h:()=>click(1800,.018),  d:()=>{chitter(7,1250,.02,18);noise(.16,.02,900,.6,300,'lowpass');}},
 termite:    {e:()=>chitter(4,2000,.012,25), h:()=>click(2200,.015),  d:()=>chitter(5,1800,.015,18)},
 bedbug:     {e:()=>chitter(3,1700,.014,30), h:()=>click(1900,.016),  d:()=>{chitter(5,1450,.018,22);noise(.14,.018,700,.6,240,'lowpass');}},
 cockroach:  {e:()=>{chitter(5,1200,.016,20);noise(.2,.018,1500,.6,600,'bandpass');}, h:()=>click(1400,.02), d:()=>{chitter(7,1000,.022,16);noise(.3,.03,900,.5,220,'bandpass');}},
 earwig:     {e:()=>{click(900,.022);chitter(3,1100,.014,34);}, h:()=>click(1000,.02), d:()=>{chitter(5,900,.02,22);snd(J(130),.16,'square',.022,60);}},
 silverfish: {e:()=>noise(.2,.014,2400,.7,1100,'bandpass'), h:()=>click(2600,.014), d:()=>noise(.3,.022,1800,.6,500,'bandpass')},
 // crawlers: wet, dragging, many-legged
 millipede:  {e:()=>noise(.34,.018,700,.6,260,'lowpass'), h:()=>click(800,.018), d:()=>{noise(.5,.028,560,.5,150,'lowpass');snd(J(100),.22,'triangle',.026,50);}},
 whipscorpion:{e:()=>{hiss(.26,.018,2000,600);click(700,.02);}, h:()=>click(750,.02), d:()=>{hiss(.42,.028,1600,380);snd(J(110),.22,'sawtooth',.03,50);}},
 isopod:     {e:()=>{click(1000,.02);noise(.18,.016,900,.6,320,'lowpass');}, h:()=>click(1050,.018), d:()=>{noise(.3,.026,700,.5,200,'lowpass');click(600,.022);}},
 snail:      {e:()=>noise(.4,.016,500,.5,160,'lowpass'), h:()=>noise(.07,.018,600,.5,200,'lowpass'), d:()=>{noise(.6,.03,420,.4,100,'lowpass');tone(J(320),.22,'sine',.02,120);}},
 iceworm:    {e:()=>noise(.36,.016,900,.5,300,'lowpass'), h:()=>click(1300,.016), d:()=>{noise(.5,.026,720,.5,180,'lowpass');tone(J(600),.2,'sine',.016,220);}},
 spiderling: {e:()=>chitter(4,1500,.015,30), h:()=>click(1800,.02), d:()=>{chitter(6,1300,.018,22);noise(.18,.02,1000,.6,300,'bandpass');}},
 strider:    {e:()=>{tone(J(900),.06,'sine',.02,1400);tone(J(1300),.05,'sine',.012,1900);}, h:()=>noise(.05,.02,1800,.5,600,'bandpass'), d:()=>{noise(.25,.03,1500,.5,400,'bandpass');tone(J(700),.12,'sine',.02,300);}},
 glowworm:   {e:()=>tone(J(1100),.25,'sine',.015,1300,0,.1), h:()=>tone(J(1500),.05,'sine',.015), d:()=>jingle([1100,1400,1760],'sine',.02,.06)},
 firefly:    {e:()=>{tone(J(1400),.16,'sine',.016,1750,0,.06);}, h:()=>tone(J(1800),.05,'sine',.014), d:()=>jingle([1750,1400,1100,880],'sine',.018,.05)},
 crystalmite:{e:()=>tone(J(2600),.08,'sine',.010,3200), h:()=>click(3600,.010), d:()=>jingle([3200,2600,2100],'sine',.012,.04)},
};
// the tiny swarm bugs: same family, each with its own pitch so a midge cloud is not a thrips cloud
for(const [k,f] of [['gnat',1],['midge',1.18],['aphid',.86],['thrips',1.32],['fruitfly',1.06],
                    ['sandfly',.94],['blackfly',.78],['whitefly',1.44],['fungusgnat',.9],
                    ['noseeum',1.55]]){
 V2[k]={e:()=>{pitchScale*=f;try{buzz(J(520),.18,'sawtooth',.012,30,64,3600);}finally{pitchScale/=f;}},
        h:()=>{pitchScale*=f;try{click(2600,.012);}finally{pitchScale/=f;}},
        d:()=>{pitchScale*=f;try{buzz(500,.14,'sawtooth',.016,80,58,3800,120);}finally{pitchScale/=f;}}};
}
// merge, do not replace: some voices carry extra calls (cicada.scream) the game relies on
for(const k in V2){VOICE[k]=Object.assign({},VOICE[k]||{},{enter:V2[k].e,hit:V2[k].h,die:V2[k].d});}
let hitT=0,enterT=0,impT=0,gnatT=-999;const lastLabel={};const IMPACT={honey:()=>{noise(.07,.035,700,.9,250,'lowpass');tone(J(240),.06,'sine',.02,120);},stinger:()=>{tone(J(3200),.03,'square',.014,1800);click(4000,.015);},pollen:()=>{noise(.1,.025,500,.6,200,'lowpass');tone(J(2200),.04,'sine',.01,3000);},water:()=>{noise(.09,.03,1800,.5,600,'bandpass');tone(J(900),.04,'sine',.012,1600);},wax:()=>{noise(.12,.035,400,.8,150,'lowpass');tone(J(110),.08,'sine',.025,60);},thorn:()=>{click(2200,.02);click(1600,.015);},petal:()=>{noise(.05,.015,1200,.6,500,'bandpass');tone(J(1760),.04,'sine',.01);},lance:()=>{tone(J(160),.12,'sine',.03,70);noise(.08,.03,800,.7,250,'lowpass');},drone:()=>{buzz(J(320),.08,'square',.015,40,60,1800);},static:()=>{click(R(3000,5000),.02);noise(.05,.015,6000,.4,2500,'bandpass');},saw:()=>{click(1800,.02);noise(.06,.025,2200,.5,700,'bandpass');},lash:()=>{tone(J(2400),.04,'sine',.01,3000);},rain:()=>{tone(J(1600),.04,'sine',.012,900);},lure:()=>{tone(J(900),.05,'sine',.012);},grenade:()=>{rumble(.25,.04);noise(.15,.03,800,.6,200,'lowpass');},wall:()=>{click(900,.02);noise(.05,.015,600,.7,200,'lowpass');},shard:()=>{click(1500,.015);}};function sfxImpact(){if(t-impT<4)return;impT=t;(IMPACT[P.wpn]||IMPACT.honey)();}
function voiced(e,fn){pitchScale=PITCH[e.type]||1;try{fn();}finally{pitchScale=1;}}
function sfxEnter(e){if(t-enterT<5)return;enterT=t;voiced(e,()=>(VOICE[A(e.type)]||VOICE.fly).enter());}
function sfxHit(e){if(t-hitT<3)return;hitT=t;voiced(e,()=>(VOICE[A(e.type)]||VOICE.fly).hit());}
function sfxKill(e){gainScale=.4;try{voiced(e,()=>(VOICE[A(e.type)]||VOICE.fly).die());if(e.elite){snd(J(880),.12,'sine',.03,1320);}}finally{gainScale=1;}}
let bossHitT=0;function sfxBossHit(){if(t-bossHitT<6)return;bossHitT=t;snd(J(90),.08,'sawtooth',.03,50);if(Math.random()<.15)click(2400,.03);}
function jingle(notes,type='sine',v=.04,dt=.09){try{const a=ctx();notes.forEach((f,i)=>{const o=a.createOscillator(),g=a.createGain(),n=a.currentTime+i*dt;o.type=type;o.frequency.value=f;g.gain.setValueAtTime(0,n);g.gain.linearRampToValueAtTime(v,n+.01);g.gain.exponentialRampToValueAtTime(.001,n+dt*1.8);o.connect(g).connect(out());o.start(n);o.stop(n+dt*2);});}catch(e){}}
const SFX={
 nectar(){jingle([660,880,1320],'sine',.04,.07);},
 weapon(k){const b={honey:440,stinger:660,pollen:550,water:587,wax:392,thorn:494,petal:698,lance:784,drones:466,static:622,saw:523,lash:880,rain:740,lure:415,grenade:349,wall:311}[k]||500;jingle([b,b*1.25,b*1.5,b*2],{honey:'triangle',stinger:'sine',pollen:'square',water:'sine',wax:'triangle',thorn:'square',petal:'sine'}[k]||'sine',.035,.08);},
 bomb(){snd(160,.25,'sawtooth',.05,60);snd(80,.4,'sine',.05,40);},
 life(){jingle([523,659,784,1047,1319],'triangle',.045,.09);},
 levelStart(){jingle([392,523,659,784],'triangle',.04,.12);},
 levelClear(){jingle([784,880,988,1175,1319,1568],'sine',.045,.1);},
 heartbeat(){snd(55,.12,'sine',.08,40);},
};
let gainScale=1,pitchScale=1;
// swell(): a slow-attack tone (no click, no boing) for big moments
function swell(f,dur,type='sine',v=.05,attack=.35,slide=0){v*=gainScale;try{const a=ctx(),o=a.createOscillator(),g=a.createGain(),fl=a.createBiquadFilter(),n=a.currentTime;o.type=type;o.frequency.value=f;if(slide)o.frequency.linearRampToValueAtTime(slide,n+dur);fl.type='lowpass';fl.frequency.value=600;g.gain.setValueAtTime(0,n);g.gain.linearRampToValueAtTime(v,n+attack);g.gain.linearRampToValueAtTime(0,n+dur);o.connect(fl).connect(g).connect(out());o.start(n);o.stop(n+dur+.05);}catch(e){}}
function rumble(dur=1.2,v=.06){try{const a=ctx(),n=a.createBufferSource(),g=a.createGain(),fl=a.createBiquadFilter(),s0=a.currentTime;ctx();n.buffer=NB;n.loop=true;fl.type='lowpass';fl.frequency.value=140;g.gain.setValueAtTime(0,s0);g.gain.linearRampToValueAtTime(v*gainScale,s0+.4);g.gain.linearRampToValueAtTime(0,s0+dur);n.connect(fl).connect(g).connect(out());n.start(s0);n.stop(s0+dur+.05);}catch(e){}}
function snd(f,t,type='square',v=.05,slide=0,lp=0){v*=gainScale;f*=pitchScale;if(slide)slide*=pitchScale;try{const a=ctx(),o=a.createOscillator(),g=a.createGain(),n=a.currentTime;o.type=type;o.frequency.value=f;if(slide)o.frequency.exponentialRampToValueAtTime(slide,n+t);g.gain.setValueAtTime(0,n);g.gain.linearRampToValueAtTime(v,n+.006);g.gain.exponentialRampToValueAtTime(.001,n+t);let outn=g;if(lp){const f2=a.createBiquadFilter();f2.type='lowpass';f2.frequency.value=lp;g.connect(f2);outn=f2;}o.connect(g);outn.connect(out());o.start();o.stop(n+t+.02);}catch(e){}}

