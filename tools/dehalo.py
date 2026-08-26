#!/usr/bin/env python3
"""Cut the baked studio shadow off every sprite.

Looking at the raw alpha channel settles what was really wrong: the BUG is already solid
white in alpha -- it is not see-through at all. What surrounds it is a big soft grey pool
at roughly 20-60% alpha, the drop shadow from the original render that the keying never
removed. Over a dark level that pool reads as a pale glow; over a bright one it washes the
bug out. Either way it looks like the bug is transparent.

So: keep everything the keying was confident about, ramp the last stretch, and drop the
soft pool entirely.

  python3 tools/dehalo.py            # report only
  python3 tools/dehalo.py --write    # rewrite art/sprites (originals to art/.dehalo_bak)
"""
import os, sys, shutil
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPR  = os.path.join(ROOT, 'art', 'sprites')
BAK  = os.path.join(ROOT, 'art', '.dehalo_bak')
WRITE = '--write' in sys.argv
LO, HI = 150, 205      # below LO is shadow, above HI is bug, ramp between

def fix(path):
    im  = Image.open(path).convert('RGBA')
    a   = np.asarray(im).astype(np.float32)
    rgb, al = a[..., :3], a[..., 3]
    new = np.clip((al - LO) / (HI - LO), 0, 1)
    halo = float(((al > 10) & (al < LO)).sum())
    kept = float((new > .5).sum())
    out = np.dstack([rgb, new * 255]).astype(np.uint8)
    return Image.fromarray(out, 'RGBA'), halo, kept

if WRITE:
    os.makedirs(BAK, exist_ok=True)
rows = []
for f in sorted(x for x in os.listdir(SPR) if x.endswith('.png')):
    p = os.path.join(SPR, f)
    img, halo, kept = fix(p)
    rows.append((f[:-4], halo, kept))
    if WRITE:
        if not os.path.exists(os.path.join(BAK, f)):
            shutil.copy2(p, os.path.join(BAK, f))
        img.save(p)
print(('rewrote ' if WRITE else 'would clean ') + str(len(rows)) + ' sprites')
print('shadow pixels removed vs bug pixels kept (worst offenders):')
for n, h, k in sorted(rows, key=lambda r: -r[1] / max(r[2], 1))[:8]:
    print(f'  {n:14s} shadow {int(h):7d}   bug {int(k):7d}   ratio {h/max(k,1):.2f}')
