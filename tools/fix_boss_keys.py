#!/usr/bin/env python3
"""Clean the boss sprites' mattes in place (originals kept in art/sprites/boss-prekeyfix/).

Matt, 2026-09-01: "some are see-through and some are not cut and have an extra shade that
is not part of the bug". Two faults, two fixes:
  1. HALO: pale, smooth backdrop glow (the glowworm's blue bloom, the earwig's frost, the
     fire ant's ember light) survived the key because it had colour. Anything pale AND
     texture-free that can be reached from outside the bug is background: alpha 0.
  2. SEE-THROUGH: wings and pale bodies were keyed half-transparent, so the level showed
     through the boss. Inside the silhouette (eroded 3 px so edges stay soft) alpha is
     lifted to at least 0.9.
"""
import os, sys, numpy as np
from PIL import Image
from scipy import ndimage
ART=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),"art","sprites")
def fix(path):
    im=Image.open(path).convert("RGBA"); q=np.asarray(im).astype(np.float32)
    rgb,a=q[...,:3],q[...,3]/255.0
    mn=rgb.min(axis=2); lum=rgb.mean(axis=2); sat=rgb.max(axis=2)-mn
    m1=ndimage.uniform_filter(lum,5); m2=ndimage.uniform_filter(lum*lum,5); tex=np.sqrt(np.maximum(m2-m1*m1,0))
    # 1. halo: pale (or low-alpha haze) and smooth, reachable from the outside
    # HALO_SAT/HALO_LUM widen the net for a coloured bloom (the glowworm's blue): default catches white/grey haze only
    HS=float(os.environ.get('HALO_SAT','70')); HL=float(os.environ.get('HALO_LUM','150'))
    pale=((mn>HL*.75)&(lum>HL)&(sat<HS)&(tex<4.5))|(a<.35)
    outside=a<.02
    lab,n=ndimage.label(pale|outside)
    edge=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
    halo=np.isin(lab,list(edge))&~outside&pale if edge else np.zeros_like(pale)
    halo=ndimage.binary_dilation(halo,iterations=2)
    a2=a.copy(); a2[halo]=0.0
    # 2. see-through: lift alpha inside the eroded silhouette
    body=ndimage.binary_fill_holes(a2>.5); core=ndimage.binary_erosion(body,iterations=3)
    a2[core]=np.maximum(a2[core],0.9)
    # CORE_TRIM=N (px): for a DARK bug wrapped in a light bloom (the glowworm), keep only what
    # lies within N px of its dark pixels; the bloom is light, the body and legs are not.
    ct=int(os.environ.get('CORE_TRIM','0'))
    if ct:
        dark=(lum<120)&(a2>.5); near=ndimage.binary_dilation(dark,iterations=ct); soft=ndimage.binary_dilation(near,iterations=3)
        a2=np.where(near,a2,np.where(soft,a2*.35,0.0))
    # despeckle: anything not part of the main body (or a big detached piece) is a stray fleck
    lab,n=ndimage.label(a2>.3)
    if n>1:
        sizes=ndimage.sum(np.ones_like(a2),lab,range(1,n+1)); keep=[i+1 for i,sz in enumerate(sizes) if sz>=max(sizes)*.004]
        a2=np.where(np.isin(lab,keep)|(a2<=.3),a2,0.0)
    a2=ndimage.gaussian_filter(a2,0.5)
    out=np.dstack([np.clip(rgb,0,255),np.clip(a2,0,1)*255]).astype(np.uint8)
    Image.fromarray(out,"RGBA").save(path)
    return float(halo.mean()*100), float(((a>.2)&(a<.8)&body).mean()*100)
for name in (sys.argv[1:] or [f"boss{i}" for i in range(16)]):
    p=os.path.join(ART,name+".png"); h,s=fix(p); print(f"{name}: halo removed {h:.1f}% of frame, semi-transparent body was {s:.1f}%")
