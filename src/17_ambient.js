// ---------- ambient life ----------
// no blinking dots anywhere. every world moves the way that world would really move:
// lava crawls, water shimmers and swells, wind carries leaves and petals, snow blows sideways,
// city windows flick on and off while headlights slide along the street below.
const CLOUDS=[{x:80,y:-200,s:280,sp:.3},{x:360,y:300,s:240,sp:.24}];
function cloudShadows(alpha){if(LOW)return;for(const c of CLOUDS){c.y+=c.sp;if(c.y>H+c.s)c.y=-c.s;X.globalAlpha=alpha;X.fillStyle='#000';if(!LOW)X.filter='blur(28px)';ell(c.x,c.y,c.s,c.s*.55);X.fill();ell(c.x-c.s*.5,c.y+30,c.s*.6,c.s*.4);X.fill();X.filter='none';}X.globalAlpha=1;}
function mist(col,alpha){if(LOW)return;for(const c of CLOUDS){X.globalAlpha=alpha;X.fillStyle=col;if(!LOW)X.filter='blur(22px)';ell(c.x+120,H-c.y*.5,c.s*.9,c.s*.3);X.fill();X.filter='none';}X.globalAlpha=1;}
// real cloud banks that travel across the sky instead of sitting still
const SKY=Array.from({length:5},(_,i)=>({x:R(-120,W+120),y:R(18,H*.30),w:R(90,190),h:R(16,32),sp:R(.10,.28)*(i%2?1:-1)}));
function skyClouds(col,alpha){for(const c of SKY){c.x+=c.sp;if(c.x-c.w>W)c.x=-c.w;if(c.x+c.w<0)c.x=W+c.w;X.globalAlpha=alpha;X.fillStyle=col;if(!LOW)X.filter='blur(16px)';ell(c.x,c.y,c.w,c.h);X.fill();ell(c.x+c.w*.45,c.y+c.h*.4,c.w*.55,c.h*.8);X.fill();X.filter='none';}X.globalAlpha=1;}
