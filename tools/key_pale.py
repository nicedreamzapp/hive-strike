#!/usr/bin/env python3
"""Key a PALE bug off its white studio plate by luminance alone (the texture/colour key in
gen_sprites eats a cream or white body: the ice weta lost its whole back, 9/3).
Anything darker than LUM is bug; the soft drop shadow is lighter than that and goes.
  LUM=238 python3 tools/key_pale.py boss10       (raw/<name>.png -> art/sprites/<name>.png, then run solidify)"""
import os, sys, numpy as np
from PIL import Image
from scipy import ndimage
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); S=os.path.join(ROOT,'art','sprites')
LUM=float(os.environ.get("LUM","238"))
for name in sys.argv[1:]:
    q=np.asarray(Image.open(os.path.join(S,'raw',name+'.png')).convert('RGB')).astype(np.float32)
    lum=q.mean(2); mx=q.max(2); mn=q.min(2)
    # darker than the plate, or coloured, or TEXTURED while still lighter than paper: a pale bug's
    # back is patterned grey, the drop shadow under it is smooth. Texture = local std over 5px.
    m=ndimage.uniform_filter(lum,5); m2=ndimage.uniform_filter(lum*lum,5); tex=np.sqrt(np.maximum(m2-m*m,0))
    TEX=float(os.environ.get("TEX","5")); PAPER=float(os.environ.get("PAPER","247"))
    bug=(lum<LUM)|((mx-mn)>28)|((lum<PAPER)&(tex>TEX))
    bug=ndimage.binary_opening(bug,iterations=1)      # drop lone specks of shadow
    lab,n=ndimage.label(bug); 
    if n>1:                                            # keep the big pieces only (the bug, its legs)
        sizes=ndimage.sum(bug,lab,range(1,n+1)); keep=[i+1 for i,sz in enumerate(sizes) if sz>=0.0005*bug.size]
        bug=np.isin(lab,keep)
    bug=ndimage.binary_closing(bug,iterations=3)
    edge=ndimage.binary_dilation(bug,iterations=2)&~bug
    a=np.where(bug,1.0,np.where(edge,.5,0.0))
    out=np.dstack([q,a*255]).astype(np.uint8); Image.fromarray(out,'RGBA').save(os.path.join(S,name+'.png')); print(name,'keyed by luminance',flush=True)
