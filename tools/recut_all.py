#!/usr/bin/env python3
"""Re-cut every sprite from its pre-solidify matte, then solidify PINHOLES only.
The 9/2 solidify pass filled every enclosed gap (between legs and body) with the studio backdrop.
Matt: "color between their legs". Sources: a fresh raw render (keyed here) if one exists for the
names given in FRESH, else the sprite as committed just before the bad pass (git 85da648)."""
import os, subprocess, sys, importlib.util
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); S=os.path.join(ROOT,'art','sprites')
spec=importlib.util.spec_from_file_location("gs", os.path.join(ROOT,"tools","gen_sprites.py"))
src=open(spec.origin).read().split('if os.environ.get("REKEY"):')[0]; ns={"__file__":spec.origin,"__name__":"gs"}; exec(compile(src,spec.origin,"exec"),ns)
key_white=ns["key_white"]
FRESH=set(os.environ.get("FRESH","").split(",")) - {""}
BASE=os.environ.get("BASE","85da648")
names=sorted(f[:-4] for f in os.listdir(S) if f.endswith('.png'))
for n in names:
    dst=os.path.join(S,n+'.png'); raw=os.path.join(S,'raw',n+'.png')
    if n in FRESH and os.path.exists(raw):
        key_white(raw,dst); print(n,"keyed from raw",flush=True)
    else:
        r=subprocess.run(["git","show",f"{BASE}:art/sprites/{n}.png"],cwd=ROOT,capture_output=True)
        if r.returncode==0 and r.stdout: open(dst,'wb').write(r.stdout); print(n,"from",BASE,flush=True)
        elif os.path.exists(raw): key_white(raw,dst); print(n,"keyed from raw (no history)",flush=True)
        else: print(n,"NO SOURCE, left as is",flush=True)
subprocess.run([sys.executable,os.path.join(ROOT,'tools','solidify.py')]+names,cwd=ROOT,check=True)
