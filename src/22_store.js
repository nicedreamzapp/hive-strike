// ---------- store: thirty days free, then ninety-nine cents forever ----------
// Neither Apple nor Google offers a free trial on a ONE-TIME purchase; their trials exist only
// for subscriptions. So the game ships free, counts its own thirty days, and then asks once for
// the unlock (a non-consumable on Apple, a one-time product on Google Play).
//
// It fails OPEN on purpose. If the billing plugin is missing, the store is unreachable, or the
// player is on the desktop build, the game simply plays. A dollar is not worth locking someone
// out of a game they already downloaded because a network call failed.
const PAY_ID='com.nicedreamz.hivestrike.unlock';
const TRIAL_DAYS=30;
const STORE={ready:false,owned:false,price:'$1.99',busy:false,note:'',native:false};
let payOpen=false;

function native(){try{return !!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());}catch(e){return false;}}
function trialStart(){try{let v=+localStorage.hs_t0;if(!v){v=Date.now();localStorage.hs_t0=v;}return v;}catch(e){return Date.now();}}
function trialDaysLeft(){const used=(Date.now()-trialStart())/86400000;return Math.max(0,Math.ceil(TRIAL_DAYS-used));}
// locked only when there is a real store to buy from, the trial is spent, and nothing is owned
function locked(){return STORE.native&&!STORE.owned&&trialDaysLeft()<=0;}
function ownedSave(v){STORE.owned=!!v;try{localStorage.hs_owned=v?'1':'';}catch(e){}}

function storeInit(){
 STORE.native=native();
 try{if(localStorage.hs_owned)STORE.owned=true;}catch(e){}
 trialStart();
 if(!STORE.native||!window.CdvPurchase){STORE.note=STORE.native?'store unavailable':'';return;}
 try{
  const {store,ProductType,Platform}=window.CdvPurchase;
  const plats=[];
  if(window.CdvPurchase.Utils&&/iP(hone|ad|od)/.test(navigator.userAgent)){plats.push(Platform.APPLE_APPSTORE);}
  else plats.push(Platform.GOOGLE_PLAY);
  store.register(plats.map(p=>({id:PAY_ID,type:ProductType.NON_CONSUMABLE,platform:p})));
  store.when()
   .productUpdated(p=>{if(p.id===PAY_ID){const o=p.getOffer&&p.getOffer();if(o&&o.pricingPhases&&o.pricingPhases[0]&&o.pricingPhases[0].price)STORE.price=o.pricingPhases[0].price;}})
   .approved(tr=>{try{tr.verify();}catch(e){try{tr.finish();}catch(_){}ownedSave(true);}})
   .verified(rc=>{try{rc.finish();}catch(e){}ownedSave(true);STORE.busy=false;STORE.note='Thank you. Unlocked for good.';})
   .receiptsReady(()=>{try{if(store.owned(PAY_ID))ownedSave(true);}catch(e){}STORE.ready=true;});
  store.error(err=>{STORE.busy=false;STORE.note=(err&&err.message)?String(err.message).slice(0,60):'purchase failed';});
  store.initialize(plats).then(()=>{STORE.ready=true;try{if(store.owned(PAY_ID))ownedSave(true);}catch(e){}});
 }catch(e){STORE.note='store unavailable';}
}
function storeBuy(){
 if(STORE.busy)return;
 if(!STORE.native||!window.CdvPurchase){STORE.note='no store on this device';return;}
 try{const {store}=window.CdvPurchase;const p=store.get(PAY_ID);
  if(!p){STORE.note='product not found yet';return;}
  const o=p.getOffer();if(!o){STORE.note='no offer yet';return;}
  STORE.busy=true;STORE.note='opening the store...';store.order(o);
 }catch(e){STORE.busy=false;STORE.note='could not open the store';}
}
function storeRestore(){                        // Apple requires this button to exist
 if(!STORE.native||!window.CdvPurchase){STORE.note='nothing to restore here';return;}
 try{STORE.busy=true;STORE.note='checking your purchases...';
  window.CdvPurchase.store.restorePurchases().then(()=>{STORE.busy=false;
   try{if(window.CdvPurchase.store.owned(PAY_ID)){ownedSave(true);STORE.note='Restored. Thank you.';}
       else STORE.note='no purchase found on this account';}catch(e){}});
 }catch(e){STORE.busy=false;STORE.note='could not reach the store';}
}

// ---- the paywall, drawn in the title's own language: glass over the painting ----
const PAYB={buy:{x:56,y:492,w:W-112,h:54},restore:{x:56,y:562,w:(W-122)/2,h:40},later:{x:66+(W-122)/2,y:562,w:(W-122)/2,h:40}};
function payHit(p){
 if(inBtn(p,PAYB.buy)){storeBuy();return true;}
 if(inBtn(p,locked()?{x:W/2-90,y:PAYB.restore.y,w:180,h:PAYB.restore.h}:PAYB.restore)){storeRestore();return true;}
 if(inBtn(p,PAYB.later)){if(!locked()){payOpen=false;}return true;}
 return false;
}
function drawPaywall(){
 X.save();
 X.fillStyle='rgba(4,10,20,.965)';X.fillRect(0,0,W,H);
 X.textAlign='center';X.shadowColor='#000';X.shadowBlur=6;X.lineJoin='round';
 const line=(txt,y,size,col,w)=>{X.font=(size>=15?'bold ':'')+size+'px '+FONT;X.strokeStyle='rgba(0,0,0,.85)';X.lineWidth=w||3;X.strokeText(txt,W/2,y);X.fillStyle=col;X.fillText(txt,W/2,y);};
 const d=trialDaysLeft();
 line(locked()?'YOUR THIRTY DAYS ARE UP':'KEEP HIVE STRIKE',108,24,'#ffd23f',4);
 line(locked()?'One payment. Yours for good.':d+(d===1?' day left of your free month':' days left of your free month'),136,14,'#cfe8ff',3);
 {const hs=SPR.hero;X.save();X.translate(W/2,58);X.globalAlpha=.92;if(hs&&hs.width)drawSprite(hs,64,0);else bee(0,0,20,'#ffd23f','#1a1a1a','#fff');X.restore();}
 const rows=[['All sixteen worlds','and all sixteen bosses'],['Every bug in the Bug-Dex','forty-eight of them'],['No adverts, ever','and nothing else to buy'],['One payment','not a subscription']];
 let y=206;
 for(const r of rows){X.textAlign='left';X.font='bold 14px '+FONT;X.strokeStyle='rgba(0,0,0,.85)';X.lineWidth=3;
  X.strokeText('•  '+r[0],46,y);X.fillStyle='#fff';X.fillText('•  '+r[0],46,y);
  X.font='12px '+FONT;X.strokeText(r[1],66,y+17);X.fillStyle='rgba(200,225,255,.85)';X.fillText(r[1],66,y+17);y+=44;}
 X.textAlign='center';
 // the price, big
 line(STORE.price,432,46,'#ffd23f',5);
 line('once, forever',458,13,'#cfe8ff',3);
 const pill=(b,txt,fg,bg,edge)=>{X.fillStyle=bg;X.beginPath();X.roundRect(b.x,b.y,b.w,b.h,b.h/2);X.fill();X.strokeStyle=edge;X.lineWidth=1.4;X.stroke();
  X.fillStyle=fg;X.font='bold '+(b.h>44?17:13)+'px '+FONT;X.strokeStyle='rgba(0,0,0,.6)';X.lineWidth=2.5;X.strokeText(txt,b.x+b.w/2,b.y+b.h/2+5);X.fillText(txt,b.x+b.w/2,b.y+b.h/2+5);};
 pill(PAYB.buy,STORE.busy?'ONE MOMENT...':'UNLOCK FOR '+STORE.price,'#1a1400','rgba(255,210,63,.94)','rgba(255,236,160,.95)');
 if(locked())pill({x:W/2-90,y:PAYB.restore.y,w:180,h:PAYB.restore.h},'RESTORE PURCHASE','#fff','rgba(0,0,0,.35)','rgba(255,255,255,.55)');
 else{pill(PAYB.restore,'RESTORE','#fff','rgba(0,0,0,.35)','rgba(255,255,255,.55)');pill(PAYB.later,'NOT YET','#fff','rgba(0,0,0,.35)','rgba(255,255,255,.55)');}
 if(STORE.note){X.font='11px '+FONT;X.fillStyle='rgba(220,235,255,.8)';X.strokeStyle='rgba(0,0,0,.8)';X.lineWidth=3;X.strokeText(STORE.note,W/2,662);X.fillText(STORE.note,W/2,662);}
 X.restore();
}
// the quiet reminder on the title while the trial is still running
function drawTrialLine(){
 if(!STORE.native||STORE.owned)return;
 const d=trialDaysLeft();if(d>TRIAL_DAYS)return;
 X.save();X.textAlign='center';X.font='bold 10px '+FONT;X.lineJoin='round';X.strokeStyle='rgba(0,0,0,.85)';X.lineWidth=3;
 const s=d>0?('FREE MONTH  ·  '+d+(d===1?' DAY LEFT':' DAYS LEFT')):'TAP PLAY TO UNLOCK  ·  '+STORE.price;
 X.strokeText(s,W/2,H-14);X.fillStyle=d>3?'rgba(220,235,255,.85)':'#ffd23f';X.fillText(s,W/2,H-14);X.restore();
}
storeInit();
