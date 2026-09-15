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
  // Ask Capacitor which platform this is. Never sniff the user agent: on iPadOS the
  // WKWebView reports "Macintosh", so /iP(hone|ad|od)/ is FALSE on every iPad, and the
  // old test registered GOOGLE_PLAY on an Apple device -> store.get() returns nothing ->
  // "product not found yet". That is exactly what App Review hit on an iPad Air M3,
  // 2026-09-12, guideline 2.1(b).
  let isApple=false;
  try{isApple=!!(window.Capacitor&&window.Capacitor.getPlatform&&window.Capacitor.getPlatform()==='ios');}catch(e){}
  plats.push(isApple?Platform.APPLE_APPSTORE:Platform.GOOGLE_PLAY);
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
let buyWait=0;
function storeBuy(retry){
 if(STORE.busy)return;
 if(!STORE.native||!window.CdvPurchase){STORE.note='no store on this device';return;}
 const n=retry||0;
 if(!n&&buyWait)return;                          // one wait at a time, however many times it is tapped
 try{const {store}=window.CdvPurchase;const p=store.get(PAY_ID);
  if(!p){
   // A cold launch can reach this button before the store has answered. Wait for it instead of
   // saying the product does not exist - that message is what App Review saw on 2026-09-12.
   if(!n){try{store.update();}catch(e){}}
   if(n<12){buyWait=1;STORE.note='asking the store...';setTimeout(()=>storeBuy(n+1),600);return;}
   buyWait=0;STORE.note='the store has not answered yet. try again in a moment.';return;}
  buyWait=0;
  const o=p.getOffer();if(!o){STORE.note='no offer yet';return;}
  STORE.busy=true;STORE.note='opening the store...';store.order(o);
 }catch(e){buyWait=0;STORE.busy=false;STORE.note='could not open the store';}
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
const PAYB={buy:{x:56,y:492,w:W-112,h:54},restore:{x:56,y:562,w:(W-122)/2,h:40},later:{x:66+(W-122)/2,y:562,w:(W-122)/2,h:40},code:{x:W/2-92,y:610,w:184,h:34}};
function payHit(p){
 if(inBtn(p,PAYB.buy)){storeBuy();return true;}
 if(inBtn(p,PAYB.code)){askCode();return true;}
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
 pill(PAYB.code,'ENTER A CODE','#cfe8ff','rgba(255,255,255,.07)','rgba(255,255,255,.3)');
 if(STORE.note){X.font='11px '+FONT;X.fillStyle='rgba(220,235,255,.8)';X.strokeStyle='rgba(0,0,0,.8)';X.lineWidth=3;X.strokeText(STORE.note,W/2,662);X.fillText(STORE.note,W/2,662);}
 X.restore();
}
// ---- gift codes ----------------------------------------------------------------------
// Matt's OWN codes, not Apple/Google promo codes. Apple's are unreadable 18-character
// strings you cannot choose and can only redeem in the App Store app; these are short words
// he can say out loud or drop in a forum post, and they work on both stores and offline.
// SHA-256, and the words themselves are deliberately NOT in this repo - a hash is one-way,
// a comment naming the code is not. To mint one:
//   echo -n YOURCODE | shasum -a 256
const CODE_HASHES=[
 '639587e1a938be5179891c4c367340f2f7063b9bcdbe8553e7d1bc7f725ce04f', // gift code 1
 'c8c8f7fe625a1a98824e4fc4887ca38b8caeb22ad91c4f40d500c3378549597e'  // owner
];
async function sha256hex(str){
 const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(str));
 return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
// Canvas cannot take keyboard input, so the field is a real HTML input laid over the game
// and removed the moment it is done. Autocapitalised, no autocorrect, Go key submits.
function askCode(){
 if(document.getElementById('codewrap'))return;
 const wrap=document.createElement('div');wrap.id='codewrap';
 wrap.setAttribute('style','position:fixed;inset:0;z-index:99;display:flex;align-items:center;justify-content:center;background:rgba(2,6,14,.88);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);padding:24px;box-sizing:border-box');
 wrap.innerHTML='<div style="width:100%;max-width:330px;text-align:center;font-family:system-ui,-apple-system,sans-serif">'
  +'<div style="color:#ffd23f;font-weight:700;font-size:17px;letter-spacing:.5px;margin-bottom:6px">ENTER YOUR CODE</div>'
  +'<div id="codemsg" style="color:#cfe8ff;font-size:12px;margin-bottom:14px">Unlocks Hive Strike for good.</div>'
  +'<input id="codein" autocapitalize="characters" autocorrect="off" autocomplete="off" spellcheck="false" enterkeyhint="go" placeholder="Your code" aria-label="Unlock code" '
  +'style="width:100%;box-sizing:border-box;height:48px;text-align:center;font-size:19px;font-weight:700;letter-spacing:2px;color:#fff;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.3);border-radius:12px;outline:none">'
  +'<div style="display:flex;gap:10px;margin-top:14px">'
  +'<button id="codecancel" style="flex:1;height:44px;border-radius:12px;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.35);color:#fff;font-size:14px;font-weight:700">CANCEL</button>'
  +'<button id="codego" style="flex:1;height:44px;border-radius:12px;border:0;background:#ffd23f;color:#1a1400;font-size:14px;font-weight:700">UNLOCK</button>'
  +'</div></div>';
 document.body.appendChild(wrap);
 const input=wrap.querySelector('#codein'),msg=wrap.querySelector('#codemsg');
 const close=()=>{input.blur();wrap.remove();};
 const submit=async()=>{
  const cleaned=(input.value||'').toUpperCase().replace(/[\s-]/g,'');
  if(!cleaned)return;
  let h='';try{h=await sha256hex(cleaned);}catch(e){msg.textContent='Could not check that code here.';return;}
  if(CODE_HASHES.indexOf(h)>=0){ownedSave(true);STORE.note='Code accepted. Unlocked for good.';payOpen=false;close();}
  else{msg.style.color='#ff9d7a';msg.textContent='That code did not match. Check it and try again.';input.select();}
 };
 wrap.querySelector('#codego').addEventListener('click',submit);
 wrap.querySelector('#codecancel').addEventListener('click',close);
 input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();submit();}});
 setTimeout(()=>input.focus(),40);
}

// The unlock button on the title screen. It used to be a caption you could not tap, and the
// paywall only appeared once the free month had run out - so for the first thirty days there
// was no way to reach the in-app purchase at all. App Review could not find it and rejected
// 1.3.0 under guideline 2.1(b) on 2026-09-15 ("we cannot locate the In-App Purchases, such as
// 'Unlock Hive Strike', within the app"). It is a real button now, on the title screen from
// the first launch, and it says the price out loud.
const TRIALB={x:W/2-150,y:H-30,w:300,h:24};
function trialBtnShown(){return STORE.native&&!STORE.owned;}
function drawTrialLine(){
 if(!trialBtnShown())return;
 const d=trialDaysLeft();
 X.save();
 X.fillStyle='rgba(0,0,0,.34)';X.beginPath();X.roundRect(TRIALB.x,TRIALB.y,TRIALB.w,TRIALB.h,TRIALB.h/2);X.fill();
 X.strokeStyle='rgba(255,210,63,.6)';X.lineWidth=1.2;X.stroke();
 const s=d>0?('UNLOCK FULL GAME  ·  '+STORE.price+'  ·  '+d+(d===1?' DAY LEFT':' DAYS LEFT'))
            :('UNLOCK FULL GAME  ·  '+STORE.price);
 X.textAlign='center';X.lineJoin='round';
 let px=11;X.font='bold '+px+'px '+FONT;                       // shrink to fit, never spill out of the pill
 while(px>8&&X.measureText(s).width>TRIALB.w-20){px-=0.5;X.font='bold '+px+'px '+FONT;}
 X.strokeStyle='rgba(0,0,0,.85)';X.lineWidth=3;X.strokeText(s,W/2,TRIALB.y+16);
 X.fillStyle='#ffd23f';X.fillText(s,W/2,TRIALB.y+16);X.restore();
}

storeInit();
