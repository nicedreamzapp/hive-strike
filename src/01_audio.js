// ---------- audio ----------
let AC=null;let NB=null;let MASTER=null,VOL=localStorage.hs_vol!=null?+localStorage.hs_vol:.55;
function out(){if(!MASTER){MASTER=AC.createGain();MASTER.connect(AC.destination);}MASTER.gain.value=VOL;return MASTER;}
function ctx(){AC=AC||new (window.AudioContext||webkitAudioContext)();if(!NB){NB=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}return AC;}
function noise(t,v=.05,f=2000,q=1,slide=0,type='bandpass'){v*=gainScale;try{const a=ctx(),n=a.createBufferSource(),g=a.createGain(),bp=a.createBiquadFilter(),s0=a.currentTime;n.buffer=NB;n.loop=true;n.loopStart=R(0,.5);bp.type=type;bp.frequency.value=f;bp.Q.value=q;if(slide)bp.frequency.exponentialRampToValueAtTime(slide,s0+t);g.gain.setValueAtTime(0,s0);g.gain.linearRampToValueAtTime(v,s0+.008);g.gain.exponentialRampToValueAtTime(.001,s0+t);n.connect(bp).connect(g).connect(out());n.start(s0,R(0,.5));n.stop(s0+t+.02);}catch(e){}}
const J=(f,p=.08)=>f*(1+R(-p,p));
// fire sounds are deliberately soft and sparse — the interesting audio is the hits, kills, pickups and jingles
// buzz(): oscillator with a wobble (vibrato) — the basis of every insect voice
function buzz(f,dur,type='sawtooth',v=.03,wob=30,rate=25,lp=1200,slide=0){v*=gainScale;f*=pitchScale;if(slide)slide*=pitchScale;try{const a=ctx(),o=a.createOscillator(),g=a.createGain(),l=a.createOscillator(),lg=a.createGain(),fl=a.createBiquadFilter(),n=a.currentTime;o.type=type;o.frequency.value=f;if(slide)o.frequency.exponentialRampToValueAtTime(slide,n+dur);l.type='sine';l.frequency.value=rate;lg.gain.value=wob;l.connect(lg).connect(o.frequency);fl.type='lowpass';fl.frequency.value=lp;g.gain.setValueAtTime(0,n);g.gain.linearRampToValueAtTime(v,n+.01);g.gain.exponentialRampToValueAtTime(.001,n+dur);o.connect(fl).connect(g).connect(out());o.start(n);l.start(n);o.stop(n+dur+.02);l.stop(n+dur+.02);}catch(e){}}
// seven guns, seven layered voices (every sound is a stack of 2-3 parts so it has body, not a beep)
function tone(f,dur,type='sine',v=.03,slide=0,lp=0,attack=.006){v*=gainScale;f*=pitchScale;if(slide)slide*=pitchScale;try{const a=ctx(),o=a.createOscillator(),g=a.createGain(),n=a.currentTime;o.type=type;o.frequency.value=f;if(slide)o.frequency.exponentialRampToValueAtTime(slide,n+dur);g.gain.setValueAtTime(0,n);g.gain.linearRampToValueAtTime(v,n+attack);g.gain.exponentialRampToValueAtTime(.001,n+dur);let outn=g;if(lp){const f2=a.createBiquadFilter();f2.type='lowpass';f2.frequency.value=lp;g.connect(f2);outn=f2;}o.connect(g);outn.connect(out());o.start(n);o.stop(n+dur+.02);}catch(e){}}
// gun sounds are NOT per shot (auto-fire would turn any sound into a loop). While you fire, one soft random variant plays every 45-90 frames.
let fireNext=0;function fireGate(){if(t<fireNext)return false;fireNext=t+RI(45,90);return true;}
const FIRE={
 honey(){if(!fireGate())return;[()=>{tone(J(420,.25),.09,'sine',.03,260,1200,.01);noise(.06,.02,1200,.6,400,'lowpass');},()=>{noise(.09,.025,900,.6,300,'lowpass');tone(J(520,.2),.06,'triangle',.015,300);},()=>tone(J(360,.2),.12,'sine',.025,200,900,.02)][RI(0,2)]();},
 stinger(){if(!fireGate())return;[()=>{tone(J(2800,.15),.09,'sawtooth',.014,420,4000);noise(.06,.01,6000,.5,2500,'bandpass');},()=>tone(J(3600,.2),.06,'square',.008,900,5000),()=>{noise(.12,.012,5000,.4,2000,'bandpass');tone(J(2200,.2),.08,'sawtooth',.01,600,3500);}][RI(0,2)]();},
 pollen(){if(!fireGate())return;[()=>{noise(.12,.025,1000,.5,300,'lowpass');},()=>{for(let i=0;i<3;i++)setTimeout(()=>tone(J(1500+i*500,.2),.05,'sine',.01,2600),i*35);},()=>{noise(.1,.02,800,.5,250,'lowpass');tone(J(900,.2),.06,'sine',.01,1400);}][RI(0,2)]();},
 water(){if(!fireGate())return;[()=>{tone(J(2100,.2),.07,'sine',.02,1300);tone(J(650,.2),.05,'sine',.012,1000,0,.012);},()=>tone(J(1700,.25),.08,'sine',.018,900),()=>{tone(J(2600,.2),.05,'sine',.015,1800);setTimeout(()=>tone(J(1900,.2),.05,'sine',.012,1300),60);}][RI(0,2)]();},
 wax(){if(!fireGate())return;[()=>{tone(J(140,.2),.2,'sine',.03,70,300,.03);noise(.09,.03,500,.8,150,'lowpass');},()=>{noise(.14,.02,1800,.4,600,'bandpass');tone(J(180,.2),.14,'sine',.025,90,300,.02);},()=>tone(J(120,.2),.22,'triangle',.025,60,250,.04)][RI(0,2)]();},
 thorn(){if(!fireGate())return;[()=>{click(2600,.03);noise(.1,.035,3200,.5,700,'bandpass');},()=>{noise(.08,.03,2400,.5,600,'bandpass');tone(J(400,.2),.05,'square',.01,150);},()=>{click(1900,.025);click(2800,.02);}][RI(0,2)]();},
 petal(){jingle([880,1320,1760],'sine',.02,.05);},
 lance(){if(!fireGate())return;[()=>{swell(220,.5,'sine',.035,.08,110);jingle([1320,1760],'sine',.012,.06);},()=>{noise(.3,.02,1200,.5,300,'lowpass');tone(J(300,.2),.25,'triangle',.02,120,900,.03);},()=>swell(180,.45,'triangle',.03,.1,90)][RI(0,2)]();},
 drones(){buzz(J(260),.5,'sawtooth',.03,30,30,1200);setTimeout(()=>buzz(J(300),.4,'sawtooth',.025,30,32,1200),120);},
 static(){if(!fireGate())return;[()=>{noise(.2,.02,5000,.4,2000,'bandpass');click(3500,.02);},()=>{for(let i=0;i<4;i++)setTimeout(()=>click(R(2500,4500),.015),i*30);},()=>tone(J(1800,.2),.12,'square',.008,900,3000)][RI(0,2)]();},
 saw(){if(!fireGate())return;[()=>buzz(J(380),.35,'square',.018,120,70,2500,600),()=>buzz(J(300),.3,'sawtooth',.015,100,60,2000,500),()=>{buzz(J(450),.25,'square',.015,150,80,2600);}][RI(0,2)]();},
 rain(){if(!fireGate())return;[()=>{for(let i=0;i<4;i++)setTimeout(()=>tone(J(1800,.3),.05,'sine',.012,900),i*60);},()=>noise(.3,.015,2500,.4,800,'bandpass'),()=>tone(J(1400,.3),.08,'sine',.012,700)][RI(0,2)]();},
 lure(){swell(500,.6,'sine',.03,.2,900);jingle([700,900,1100],'sine',.015,.08);},
 grenade(){if(!fireGate())return;[()=>{tone(J(300,.2),.08,'triangle',.02,120);noise(.06,.02,900,.6,300,'lowpass');},()=>tone(J(240,.2),.1,'sine',.02,100),()=>noise(.1,.02,700,.6,250,'lowpass')][RI(0,2)]();},
 wall(){noise(.25,.03,600,.6,200,'lowpass');tone(J(180),.3,'triangle',.025,90,400,.05);},
 lash(){if(!fireGate())return;[()=>tone(J(900,.2),.3,'sawtooth',.012,1100,1400,.08),()=>{noise(.25,.012,3000,.4,1200,'bandpass');tone(J(1200,.2),.2,'sine',.01,1500,0,.06);},()=>tone(J(700,.2),.35,'triangle',.012,900,1200,.1)][RI(0,2)]();},
 petalDart(){if(!fireGate())return;[()=>{noise(.07,.012,2500,.6,900,'bandpass');tone(J(1600,.2),.05,'sine',.01,2400);},()=>tone(J(1300,.25),.07,'sine',.012,2000),()=>noise(.1,.012,2000,.5,800,'bandpass')][RI(0,2)]();},
};
// every bug has its own voice: enter = it just flew on screen, hit = your shot landed, die = it popped
const VOICE={
 katydid:{enter(){cricket(3800,4,.02);},hit(){cricket(4400,2,.018);},die(){cricket(3200,5,.02);tone(J(500),.12,'sine',.02,200);}},
 strider:{enter(){tone(J(900),.06,'sine',.02,1400);tone(J(1300),.05,'sine',.012,1900);},hit(){noise(.05,.02,1800,.5,600,'bandpass');},die(){noise(.25,.03,1500,.5,400,'bandpass');tone(J(700),.12,'sine',.02,300);}},
 weevil:{enter(){buzz(J(200),.3,'square',.02,20,80,1500);},hit(){click(1200,.02);},die(){buzz(220,.25,'square',.03,30,90,1500,80);noise(.1,.03,800,.7,200,'lowpass');}},
 glowworm:{enter(){tone(J(1100),.25,'sine',.015,1300,0,.1);},hit(){tone(J(1500),.05,'sine',.015);},die(){jingle([1100,1400,1760],'sine',.02,.06);}},
 termite:{enter(){chitter(4,2000,.012,25);},hit(){click(2200,.015);},die(){chitter(5,1800,.015,18);}},
 horsefly:{enter(){buzz(J(150),.35,'sawtooth',.035,40,35,1300);},hit(){buzz(J(180),.06,'sawtooth',.02,40,40,1300);},die(){buzz(160,.3,'sawtooth',.04,80,25,1500,50);}},
 dungbeetle:{enter(){noise(.3,.03,400,.7,150,'lowpass');snd(J(80),.2,'triangle',.03,50);},hit(){snd(J(100),.05,'square',.015,70);},die(){noise(.5,.045,500,.5,100,'lowpass');snd(60,.4,'sawtooth',.045,30);}},
 butterfly:{enter(){noise(.2,.012,1200,.4,500,'lowpass');},hit(){noise(.05,.015,1000,.6,400,'lowpass');},die(){noise(.3,.02,900,.4,200,'lowpass');tone(J(1200),.15,'sine',.012,600);}},
 spiderling:{enter(){chitter(4,1500,.015,30);},hit(){click(1800,.02);},die(){chitter(6,1200,.02,20);tone(J(300),.1,'sine',.02,120);}},
 snail:{enter(){noise(.3,.02,700,.5,250,'lowpass');},hit(){noise(.06,.025,500,.7,250,'lowpass');},die(){noise(.4,.035,600,.4,120,'lowpass');tone(J(180),.25,'sine',.025,60);}},
 earwig:{enter(){chitter(3,900,.02,45);},hit(){click(1400,.02);},die(){rattle(6,.02);tone(J(260),.12,'sawtooth',.02,90);}},
 grasshopper:{enter(){cricket(4400,3,.02);},hop(){snd(J(260),.16,'sine',.03,900);},hit(){cricket(5000,2,.02);},die(){snd(J(700),.2,'sine',.03,180);noise(.1,.03,800,.7,200,'lowpass');}},
 stinkbug:{enter(){noise(.35,.03,1500,.5,300,'lowpass');},gas(){noise(.5,.035,900,.4,200,'lowpass');snd(J(120),.4,'sine',.02,60);},hit(){noise(.06,.03,600,.6,300,'lowpass');},die(){noise(.6,.045,1200,.4,150,'lowpass');snd(60,.5,'sawtooth',.04,30);}},
 hornet:{enter(){buzz(J(280),.35,'sawtooth',.035,60,55,2200);},hit(){buzz(J(320),.06,'square',.02,60,60,2000);},die(){buzz(300,.3,'sawtooth',.04,100,40,2200,70);}},
 cicada:{enter(){buzz(J(2400),.4,'square',.018,400,45,6000);},scream(){buzz(J(2800),.6,'square',.03,600,60,7000,3400);},hit(){click(3000,.025);},die(){buzz(2600,.5,'square',.03,500,30,7000,600);}},
 fly:     {enter(){buzz(J(240),.18,'sawtooth',.02,25,30,900);},           hit(){buzz(J(300),.05,'sawtooth',.015,40,40,1200);},   die(){buzz(280,.16,'sawtooth',.03,60,18,1400,90);}},
 mosquito:{enter(){buzz(J(980),.25,'sine',.018,40,9,4000);},               hit(){snd(J(1400),.04,'sine',.015,1800);},              die(){buzz(1100,.18,'sine',.03,120,14,4000,300);}},
 wasp:    {enter(){buzz(J(170),.22,'sawtooth',.03,30,40,1600);},           hit(){buzz(J(200),.06,'square',.015,40,50,1600);},     die(){buzz(190,.22,'sawtooth',.04,80,25,2000,60);}},
 beetle:  {enter(){snd(J(90),.16,'triangle',.035,60);snd(J(700),.03,'square',.01);},hit(){snd(J(110),.05,'square',.015,80);},        die(){snd(70,.35,'sawtooth',.05,30);noise(.12,.04,500,.8,120,'lowpass');}},
 moth:    {enter(){noise(.22,.02,500,.6,250,'lowpass');},                   hit(){noise(.05,.018,700,.8,400,'lowpass');},           die(){noise(.25,.035,600,.5,150,'lowpass');snd(J(400),.2,'sine',.015,150);}},
 gnat:    {enter(){snd(J(2400),.03,'square',.008,3000);},                   hit(){snd(J(2800),.02,'square',.01);},                  die(){snd(J(2600),.05,'square',.015,900);}},
 ant:     {enter(){snd(J(700),.025,'square',.015);setTimeout(()=>snd(J(700),.025,'square',.015),70);},hit(){snd(J(900),.03,'square',.012,600);},die(){snd(J(600),.06,'square',.02,200);snd(J(900),.06,'square',.02,300);}},
 ladybug: {enter(){snd(J(500),.14,'sine',.025,820);},                       hit(){snd(J(700),.05,'sine',.015,900);},               die(){snd(J(620),.18,'sine',.03,1100);snd(J(1240),.12,'sine',.015,1800);}},
 firefly: {enter(){snd(J(1320),.2,'sine',.02);snd(J(1980),.16,'sine',.012);},hit(){snd(J(1760),.06,'sine',.015);},                 die(){jingle([1320,1760,2640],'sine',.02,.05);}},
 dragon:  {enter(){noise(.25,.03,2400,.7,500,'bandpass');},                hit(){noise(.05,.02,1800,.8,800,'bandpass');},          die(){noise(.3,.04,2000,.6,200,'bandpass');snd(J(240),.25,'sawtooth',.02,60);}},
};
function hiss(dur=.35,v=.03,f=5000,to=1800){noise(dur,v,f,.5,to,'bandpass');}
function click(f=1800,v=.03){snd(J(f,.15),.018,'square',v,f*.5);}
function chitter(n=5,f=1500,v=.02,gap=28){v*=gainScale;for(let i=0;i<n;i++)setTimeout(()=>click(f+R(-300,300),v),i*gap);}
// each boss keeps making noise while it lives — hisses, clicks, buzzes, growls — to rattle you
const BOSSVOICE=[
 ()=>{const r=Math.random();if(r<.4)buzz(J(140),.45,'sawtooth',.045,40,30,1400);else if(r<.7)hiss(.4,.035);else chitter(4,1200,.025,40);},        // hornet queen
 ()=>{const r=Math.random();if(r<.5)chitter(7,2200,.03,22);else if(r<.8)hiss(.5,.03,6000,2500);else snd(J(90),.3,'sawtooth',.03,60);},            // mantis
 ()=>{const r=Math.random();if(r<.5)chitter(9,900,.03,18);else if(r<.8)hiss(.6,.03,3000,900);else snd(J(60),.5,'sawtooth',.035,40);},             // orb weaver
 ()=>{const r=Math.random();if(r<.6)buzz(J(700),.4,'square',.02,200,60,3000,400);else noise(.35,.04,2500,.6,600,'bandpass');},                    // dragonfly
 ()=>{const r=Math.random();if(r<.5)chitter(5,500,.035,60);else if(r<.8)snd(J(50),.6,'sawtooth',.05,30);else hiss(.3,.03,4000,1200);},           // stag beetle
 ()=>{const r=Math.random();if(r<.6)chitter(12,1600,.03,14);else hiss(.7,.04,5500,1500);},                                                        // centipede
 ()=>{const r=Math.random();if(r<.6)buzz(J(900),.6,'sine',.03,80,12,4000);else hiss(.4,.03,6000,2500);},                                              // mosquito matriarch: high whine
 ()=>{const r=Math.random();if(r<.5)chitter(6,700,.03,50);else if(r<.8)hiss(.5,.035,4000,1200);else snd(J(60),.4,'sawtooth',.04,35);},              // scorpion king: clicks + hiss
];
// idle noise from live bugs (throttled): wasps buzz, mosquitos whine, ants click, beetles creak, fireflies chime
const IDLE={katydid:()=>cricket(R(3600,4400),3,.016),strider:()=>tone(J(1000),.05,'sine',.01,1500),weevil:()=>buzz(J(200),.15,'square',.012,20,80,1500),glowworm:()=>tone(J(1200),.15,'sine',.008,1400),termite:()=>chitter(3,2000,.01,30),horsefly:()=>buzz(J(150),.25,'sawtooth',.02,40,35,1300),dungbeetle:()=>noise(.2,.015,400,.7,150,'lowpass'),butterfly:()=>noise(.15,.008,1100,.4,500,'lowpass'),spiderling:()=>chitter(2,1500,.012,40),snail:()=>noise(.2,.012,600,.5,250,'lowpass'),earwig:()=>rattle(3,.012),grasshopper:()=>cricket(R(4000,5000),RI(2,4),.02),stinkbug:()=>noise(.2,.02,1200,.5,400,'lowpass'),hornet:()=>buzz(J(280),.25,'sawtooth',.02,60,55,2200),cicada:()=>buzz(J(2400),.3,'square',.012,400,45,6000),wasp:()=>Math.random()<.6?buzz(J(180),.3,'sawtooth',.025,30,40,1500):rattle(6,.02),mosquito:()=>Math.random()<.5?buzz(J(1000),.3,'sine',.015,60,10,4000):squeal(1600,.02),ant:()=>Math.random()<.6?chitter(3,800,.02,50):cricket(3800,3,.018),beetle:()=>Math.random()<.5?snd(J(80),.2,'triangle',.025,60):rattle(9,.025),firefly:()=>Math.random()<.5?snd(J(1500),.15,'sine',.015):cricket(4600,5,.02),gnat:()=>Math.random()<.5?buzz(J(2000),.15,'sine',.012,200,30,5000):squeak(1500,.025),fly:()=>Math.random()<.5?buzz(J(260),.2,'sawtooth',.016,30,28,900):squeak(800,.025),moth:()=>squeak(600,.02),ladybug:()=>Math.random()<.5?cricket(4000,4,.02):squeak(1100,.025),dragon:()=>squeal(1200,.02)};
function squeak(f=900,v=.03){snd(J(f,.2),.09,'sine',v,f*2.6);}
function squeal(f=1400,v=.025){buzz(J(f,.15),.22,'sawtooth',v,120,18,4000,f*2.2);}
function cricket(f=4200,n=4,v=.02){for(let i=0;i<n;i++)setTimeout(()=>snd(J(f,.05),.03,'sine',v),i*45);}
function rattle(n=8,v=.02){for(let i=0;i<n;i++)setTimeout(()=>click(R(600,1100),v),i*RI(18,34));}
const CHORUS=[()=>squeak(R(700,1600)),()=>squeal(R(900,1800)),()=>cricket(R(3600,5200),RI(3,6)),()=>rattle(RI(5,10)),()=>buzz(J(R(150,320)),.25,'sawtooth',.018,30,30,1200),()=>chitter(RI(3,7),R(900,2200),.02,RI(20,40)),()=>hiss(.25,.018,R(3000,6000),R(800,2000)),()=>buzz(J(R(2200,2800)),.3,'square',.012,R(300,600),R(30,60),6500),()=>snd(J(R(220,320)),.14,'sine',.025,R(700,1000)),()=>noise(.3,.02,R(900,1500),.5,R(200,400),'lowpass')];
let chorusT=0;function bugChorus(){if(!enemies.length&&!boss)return;if(t<chorusT)return;chorusT=t+RI(28,70);CHORUS[RI(0,CHORUS.length-1)]();}
let idleT=0;function sfxIdle(e){if(t-idleT<10)return;const f=IDLE[A(e.type)];if(!f)return;idleT=t;voiced(e,f);}
// ambient beds: two persistent looping noise/hum sources whose gains follow the scene (wind, water, hum) + timed events (birds, frogs, crickets, owls, leaves)
const AMB={made:false,wind:null,water:null,hum:null,target:{wind:0,water:0,hum:0},ev:0};
function ambMake(){if(AMB.made)return;try{const a=ctx();const mk=(type,f,q,osc)=>{const g=a.createGain();g.gain.value=0;const fl=a.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;let src;if(osc){src=a.createOscillator();src.type='sawtooth';src.frequency.value=osc;}else{src=a.createBufferSource();src.buffer=NB;src.loop=true;}src.connect(fl).connect(g).connect(out());src.start();const l=a.createOscillator(),lg=a.createGain();l.type='sine';l.frequency.value=.13;lg.gain.value=osc?0:f*.35;l.connect(lg).connect(fl.frequency);l.start();return g;};AMB.wind=mk('lowpass',260,.5);AMB.water=mk('bandpass',700,1.2);AMB.hum=mk('lowpass',180,1,58);AMB.made=true;}catch(e){}}
const AMBSET={dunes:{wind:.009,water:0,hum:0},meadow:{wind:.006,water:0,hum:0},garden:{wind:.004,water:0,hum:0},pond:{wind:.003,water:.010,hum:0},orchard:{wind:.007,water:0,hum:0},night:{wind:.003,water:0,hum:0},hive:{wind:.003,water:0,hum:0}};
const bird=(f=2600)=>{for(let i=0;i<3;i++)setTimeout(()=>tone(J(f,.08),.07,'sine',.02,f*1.4),i*90);};
const cricketsAmb=()=>{for(let i=0;i<6;i++)setTimeout(()=>tone(4300,.025,'sine',.014),i*40);};
const frog=()=>buzz(J(190),.14,'triangle',.016,10,25,700,150);
const owl=()=>{tone(J(430),.3,'sine',.03,380,600,.05);setTimeout(()=>tone(J(400),.35,'sine',.03,350,600,.05),380);};
const leaves=()=>noise(.4,.012,1600,.5,700,'bandpass');
const knock=(n=4)=>{for(let i=0;i<n;i++)setTimeout(()=>click(1200,.03),i*90);};
const hiveSwell=()=>noise(.5,.010,900,.5,400,'bandpass');
// one ambience per world, not per decor type: the back half of the game used to replay the front
// half's sounds. every world now has its own voices and its own bed level.
const gull=()=>{tone(J(1500),.12,'sine',.016,900,3000,.02);setTimeout(()=>tone(J(1300),.14,'sine',.014,800),190);};
const plop=()=>{tone(J(420),.09,'sine',.02,140,900,.004);};
const woodpeck=(n=6)=>{for(let i=0;i<n;i++)setTimeout(()=>click(900,.022),i*52);};
const cicadaWall=()=>noise(1.1,.010,3800,3,3200,'bandpass');
const batSqueak=()=>{for(let i=0;i<3;i++)setTimeout(()=>tone(J(6200,.12),.03,'sine',.010,4800),i*70);};
const echoDrip=()=>{plop();setTimeout(()=>tone(J(380),.16,'sine',.008,180,700,.01),150);};
const stoneTick=()=>{click(R(500,900),.016);setTimeout(()=>click(R(400,700),.010),RI(60,150));};
const iceCrack=()=>{click(R(1800,2600),.022);setTimeout(()=>noise(.18,.012,1200,2,500,'bandpass'),40);};
const lavaPop=()=>{click(R(180,340),.018);setTimeout(()=>noise(.22,.012,700,1.2,260,'lowpass'),30);};
const steamHiss=()=>hiss(.7,.012,2600,900);
const rockfall=()=>{for(let i=0;i<RI(3,6);i++)setTimeout(()=>click(R(300,600),.012),i*RI(45,110));};
const marmot=()=>tone(J(2200),.09,'sine',.016,2600,4000,.01);
const chime=()=>{const f=[880,1174,1318,1760][RI(0,3)];tone(J(f,.01),.9,'sine',.014,0,0,.02);setTimeout(()=>tone(J(f*1.5,.01),.7,'sine',.008),120);};
const crystalRing=()=>{tone(J(1560,.02),1.4,'sine',.010,0,0,.05);};
const traffic=()=>noise(1.6,.011,420,.7,220,'lowpass');
const farHorn=()=>{tone(J(430),.28,'sawtooth',.010,0,700,.05);setTimeout(()=>tone(J(360),.22,'sawtooth',.008,0,600,.05),240);};
const neonTick=()=>{for(let i=0;i<RI(2,5);i++)setTimeout(()=>click(R(2600,3600),.007),i*RI(30,90));};
const waxTick=()=>{for(let i=0;i<RI(3,7);i++)setTimeout(()=>click(R(1400,2200),.008),i*RI(40,110));};
const wingSwell=()=>noise(.6,.011,1000,.6,500,'bandpass');
const reedRustle=()=>noise(.5,.011,1900,.6,900,'bandpass');
const heron=()=>{tone(J(700),.2,'sawtooth',.012,420,1400,.02);};
const tropicBird=()=>{for(let i=0;i<3;i++)setTimeout(()=>tone(J(2100+i*260,.06),.08,'sine',.015,3000),i*130);};
const gateCreak=()=>tone(J(320),.5,'sawtooth',.008,520,900,.12);
const shellClick=()=>{for(let i=0;i<RI(2,5);i++)setTimeout(()=>click(R(2200,3200),.010),i*RI(35,80));};
const hawk=()=>{tone(J(1800),.28,'sine',.014,900,3000,.02);};
const AMBEV={
 'THE MEADOW':[[bird,120,300],[cricketsAmb,300,600],[leaves,500,900]],
 'THE GARDEN':[[()=>bird(1900),200,420],[leaves,700,1200],[gateCreak,900,1800],[()=>chitter(3,1300,.010,60),400,800]],
 'THE POND':[[frog,150,360],[plop,180,400],[reedRustle,400,800],[()=>tone(J(900),.06,'sine',.012,1400),240,520]],
 'THE ORCHARD':[[leaves,400,800],[woodpeck,600,1100],[()=>bird(2200),300,600],[()=>click(300,.02),700,1400]],
 'THE NIGHT WOOD':[[cricketsAmb,60,120],[owl,500,900],[leaves,700,1300]],
 'THE HIVE':[[wingSwell,150,320],[waxTick,220,460],[()=>chitter(4,1100,.010,60),260,520]],
 'THE SWAMP':[[frog,140,320],[plop,200,420],[heron,700,1400],[()=>buzz(J(1900),.5,'sawtooth',.008,120,30,3000),300,700]],
 'THE DUNES':[[()=>noise(.9,.012,800,.4,360,'lowpass'),260,520],[hawk,700,1400],[rockfall,600,1200]],
 'THE CANOPY':[[tropicBird,200,420],[cicadaWall,300,600],[echoDrip,400,800],[leaves,500,1000]],
 'THE CAVE':[[echoDrip,120,300],[batSqueak,500,1000],[stoneTick,400,900]],
 'THE ALPINE':[[marmot,400,900],[rockfall,600,1300],[()=>noise(.9,.011,1400,.5,600,'bandpass'),300,700]],
 'THE TIDE POOL':[[gull,300,700],[()=>noise(1.3,.014,700,.5,300,'lowpass'),200,420],[shellClick,400,900],[plop,300,650]],
 'THE VOLCANO':[[lavaPop,110,260],[steamHiss,300,700],[stoneTick,400,900]],
 'THE TUNDRA':[[iceCrack,260,600],[()=>noise(1.1,.012,1100,.5,450,'bandpass'),240,520],[()=>tone(J(600),.4,'sine',.008,420,1200,.1),800,1600]],
 'THE ROOFTOPS':[[traffic,180,400],[farHorn,600,1300],[neonTick,300,700]],
 'THE CRYSTAL':[[chime,260,600],[crystalRing,500,1100],[()=>click(R(3000,4200),.008),300,700]],
};
const AMBBED={
 'THE MEADOW':{wind:.006,water:0},'THE GARDEN':{wind:.004,water:.004},'THE POND':{wind:.002,water:.009},
 'THE ORCHARD':{wind:.007,water:0},'THE NIGHT WOOD':{wind:.003,water:0},'THE HIVE':{wind:.003,water:0},
 'THE SWAMP':{wind:.003,water:.006},'THE DUNES':{wind:.010,water:0},'THE CANOPY':{wind:.005,water:.003},
 'THE CAVE':{wind:.002,water:.007},'THE ALPINE':{wind:.011,water:0},'THE TIDE POOL':{wind:.006,water:.012},
 'THE VOLCANO':{wind:.007,water:0},'THE TUNDRA':{wind:.012,water:.004},'THE ROOFTOPS':{wind:.004,water:0},
 'THE CRYSTAL':{wind:.002,water:.005},
};
function ambTick(){if(state!=='play'||paused){for(const k in AMB.target)AMB.target[k]=0;}else{const set=AMBBED[LV().name]||AMBSET[LV().decor]||{wind:.005,water:0};AMB.target.wind=set.wind||0;AMB.target.water=set.water||0;AMB.target.hum=0;}
 if(!AMB.made){if(AC)ambMake();return;}
 // gusts, not a drone: three slow waves that fall past zero, so the bed genuinely goes quiet between swells
 for(const k of ['wind','water']){const g=AMB[k].gain,i=k==='wind'?0:1.7;
  const env=Math.max(0,Math.sin(t*.0031+i*2.1)*.5+Math.sin(t*.0013+i*4.7)*.35+Math.sin(t*.0007+i)*.3);
  g.value+=(AMB.target[k]*VOL*2*env-g.value)*.015;}
 if(AMB.hum)AMB.hum.gain.value=0;
 if(state==='play'&&!paused&&VOL>0){if(--AMB.ev<=0){const evs=AMBEV[LV().name]||AMBEV['THE MEADOW'];const [fn,lo,hi]=evs[RI(0,evs.length-1)];fn();AMB.ev=RI(lo,hi)*5+(Math.random()<.45?RI(2400,5200):0);}}}
let bossVoiceT=0;function sfxBossIdle(b){if(t<bossVoiceT)return;bossVoiceT=t+RI(35,90);pitchScale=[1,1,1,1,1,1,1,1,.7,1.2,1.3,.6,1.1,1.25,.9,1.15][LV().boss];try{BOSSVOICE[BARCH[LV().boss]]();}finally{pitchScale=1;}}
