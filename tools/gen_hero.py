#!/usr/bin/env python3
"""The hero bee as a painted sprite (Matt 9/2: the drawn one is plain, no character; wings on top,
seen from above, more like a bee). Renders N seeds with Flux in the splash's look, keys each off
white, writes candidates + a contact sheet. Pick one, then: cp candidate art/sprites/hero.png.
  OUT=/dir SEEDS=4 python3 tools/gen_hero.py"""
import importlib.util, os, subprocess, sys, time
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec=importlib.util.spec_from_file_location("gs", os.path.join(ROOT,"tools","gen_sprites.py"))
# definitions only, not its render loop
src=open(spec.origin).read().split('if os.environ.get("REKEY"):')[0]; ns={"__file__":spec.origin,"__name__":"gs"}; exec(compile(src,spec.origin,"exec"),ns)
gen,key_white,comfy_up,COMFY_DIR,reserve=ns["gen"],ns["key_white"],ns["comfy_up"],ns["COMFY_DIR"],ns["reserve"]
OUT=os.environ.get("OUT",os.path.join(ROOT,"art","hero_candidates")); os.makedirs(OUT,exist_ok=True)
N=int(os.environ.get("SEEDS","4"))
PROMPT=("a cute cartoon bumblebee hero, Pixar style 3D render, fluffy round golden and black striped fuzzy body, "
 "big expressive amber eyes with determined furrowed brows, small brave frown, two black antennae, six small black legs, "
 "four large golden translucent wings spread wide out to both sides, laid flat, fully visible with fine veins, "
 "viewed from directly above, top-down view, head pointing toward the TOP of the frame, abdomen and stinger toward the bottom, "
 "the whole bee centered and fully visible inside the frame, evenly lit, on a plain pure white background, no shadow, no ground")
with reserve('flux-hero',34):
    started=False
    if not comfy_up():
        subprocess.Popen(["bash","start.sh"],cwd=COMFY_DIR,stdout=open("/tmp/comfy_hive.log","w"),stderr=subprocess.STDOUT); started=True
        for _ in range(90):
            if comfy_up(): break
            time.sleep(2)
    for k in range(N):
        seed=7100+k*37
        raw=os.path.join(OUT,f"raw_{seed}.png"); dst=os.path.join(OUT,f"hero_{seed}.png")
        t0=time.time(); ok=os.path.exists(raw) or gen(PROMPT,raw,seed,1024)
        print(f"seed {seed}: {'ok' if ok else 'FAILED'} {time.time()-t0:.0f}s",flush=True)
        if ok: key_white(raw,dst); print("keyed",dst,flush=True)
from PIL import Image, ImageDraw
cands=sorted(f for f in os.listdir(OUT) if f.startswith("hero_"))
T=360; sheet=Image.new("RGB",(T*len(cands),T+20),(60,90,60)); d=ImageDraw.Draw(sheet)
for i,f in enumerate(cands):
    im=Image.open(os.path.join(OUT,f)).convert("RGBA"); im.thumbnail((T-10,T-10)); sheet.paste(im,(i*T+5,5),im); d.text((i*T+6,T+4),f,fill=(255,255,255))
sheet.save(os.path.join(OUT,"sheet.png")); print("sheet",os.path.join(OUT,"sheet.png"),flush=True)
if started: subprocess.run("lsof -ti :8188 | xargs kill 2>/dev/null",shell=True)
