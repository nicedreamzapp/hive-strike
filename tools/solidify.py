#!/usr/bin/env python3
"""Make a keyed sprite solid inside its own outline.

The 9/2 re-renders (pale bugs: mayfly, midge, whitefly, isopod, ice worm...) keyed with a
soft interior -- 5-28% of the pixels INSIDE the silhouette were under 85% alpha, so the
level showed through the bug. Matt: "the flies are see-through on level 11."

Inside the filled silhouette (eroded two pixels) alpha becomes 1. The edge band keeps the
dehalo ramp so the outline stays soft but the studio-shadow pool is gone.

  python3 tools/solidify.py name [name...]     (writes art/sprites/<name>.png in place)
"""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LO,HI=150,205
for name in sys.argv[1:]:
    p=os.path.join(ROOT,'art','sprites',name+'.png')
    im=Image.open(p).convert('RGBA'); A=np.asarray(im).astype(np.float32)
    rgb,al=A[...,:3],A[...,3]
    body=ndimage.binary_fill_holes(al>140)
    inner=ndimage.binary_erosion(body,iterations=2)
    edge=np.clip((al-LO)/(HI-LO),0,1)
    new=np.where(inner,1.0,edge)
    before=float((al[inner]/255<0.85).mean()) if inner.any() else 0
    out=np.dstack([rgb,new*255]).astype(np.uint8)
    Image.fromarray(out,'RGBA').save(p)
    print(f"{name:14s} see-through inside before {before:.2f} -> 0.00")
