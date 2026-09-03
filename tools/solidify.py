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
    # Only PINHOLES get filled. binary_fill_holes on the whole silhouette also filled the daylight
    # between a bug's legs and its body with the studio backdrop (Matt 9/2: "color between their
    # legs"). A real gap is big; a keying pinhole is a few pixels.
    hard=al>140
    # a paper-white rim hugging the outside of the silhouette is the studio backdrop the old key
    # let through (the "sticker outline" you see on a dark level). Strip it: opaque, near-white,
    # low-saturation pixels within a few px of the outside are backdrop, not bug.
    mx=rgb.max(2); mn=rgb.min(2)
    dout=ndimage.distance_transform_edt(hard)
    rim=hard&(mn>float(os.environ.get("RIM_WHITE","200")))&((mx-mn)<float(os.environ.get("RIM_SAT","30")))&(dout<=float(os.environ.get("RIM_PX","12")))
    hard=hard&~rim; al=np.where(rim,0,al)
    holes=ndimage.binary_fill_holes(hard)&~hard
    lab,n=ndimage.label(holes)
    if n:
        sizes=ndimage.sum(np.ones_like(lab),lab,range(1,n+1))
        small=np.isin(lab,[i+1 for i,sz in enumerate(sizes) if sz<=int(os.environ.get("PINHOLE","300"))])
    else: small=np.zeros_like(hard)
    body=hard|small
    inner=ndimage.binary_erosion(body,iterations=2)
    edge=np.clip((al-LO)/(HI-LO),0,1)
    new=np.where(inner,1.0,edge)
    # the edge band's colour is the bug bled into the white backdrop: on a dark level that reads as
    # a pale sticker outline. Give every edge pixel the colour of the nearest solid pixel instead.
    if inner.any():
        _,idx=ndimage.distance_transform_edt(~inner,return_indices=True)
        band=(new>0)&~inner
        rgb=rgb.copy(); rgb[band]=rgb[idx[0][band],idx[1][band]]
    before=float((al[inner]/255<0.85).mean()) if inner.any() else 0
    out=np.dstack([rgb,new*255]).astype(np.uint8)
    Image.fromarray(out,'RGBA').save(p)
    print(f"{name:14s} see-through inside before {before:.2f} -> 0.00")
