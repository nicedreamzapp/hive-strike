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
PROMPT=os.environ.get("PROMPT") or ("extremely detailed photorealistic macro photograph of a honeybee, 8k, razor sharp, "
 "top-down view from directly above, the bee's HEAD pointing toward the TOP of the frame, abdomen and stinger toward the BOTTOM, "
 "the bee is perfectly symmetrical like a museum specimen: two long translucent amber wings stretched straight out to the left and right like a T, "
 "laid flat and fully visible with fine dark veins, six legs spread out to the sides, two antennae pointing up, "
 "very fuzzy bright golden thorax and head covered in fine golden hair, rich golden and black banded furry abdomen, big dark eyes, wings raised slightly upward from the shoulders, "
 "the whole bee centered and fully visible inside the frame, evenly lit, on a plain pure white background, no shadow, no ground")
SEED0=int(os.environ.get("SEED0","7100"))
with reserve('flux-hero',34):
    started=False
    if not comfy_up():
        subprocess.Popen(["bash","start.sh"],cwd=COMFY_DIR,stdout=open("/tmp/comfy_hive.log","w"),stderr=subprocess.STDOUT); started=True
        for _ in range(90):
            if comfy_up(): break
            time.sleep(2)
    for k in range(N):
        seed=SEED0+k*37
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
