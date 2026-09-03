#!/usr/bin/env python3
"""Audit every sprite for the four ways a cutout goes wrong (9/3, Matt: "a lot of the bugs are
still messed up ... legs and stuff, wings complete, not see-through").
  DETACHED  a second solid island away from the body  = a floating tail/pincer/wing
  CLIPPED   opaque pixels touching the frame          = a leg or wing cut off by the render
  SOFT      alpha under .85 inside the silhouette     = you can see the level through it
  BACKDROP  opaque near-white low-saturation pixels   = studio plate kept as if it were bug
  THIN      very few pixels for its box               = the key ate most of the bug
"""
import os, sys, numpy as np
from PIL import Image
from scipy import ndimage
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); S=os.path.join(ROOT,'art','sprites')
rows=[]
for f in sorted(x for x in os.listdir(S) if x.endswith('.png')):
    n=f[:-4]
    a=np.asarray(Image.open(os.path.join(S,f)).convert('RGBA')).astype(np.float32)
    rgb,al=a[...,:3],a[...,3]/255.0
    solid=al>.5; ins=al>.02
    if solid.sum()<50: rows.append((n,['EMPTY'],{})); continue
    lab,nc=ndimage.label(ndimage.binary_closing(solid,iterations=2))
    sizes=np.array(ndimage.sum(solid,lab,range(1,nc+1))) if nc else np.array([])
    big=sizes.max() if sizes.size else 1
    islands=int(((sizes>=max(200,big*0.012))).sum())
    edge=max(solid[0].mean(),solid[-1].mean(),solid[:,0].mean(),solid[:,-1].mean())
    inside=al[ins]; soft=float((inside<.85).mean()) if inside.size else 0
    mx,mn=rgb.max(2),rgb.min(2)
    back=float((solid&(mn>205)&((mx-mn)<28)).sum()/solid.sum())
    ys,xs=np.where(solid); box=(ys.max()-ys.min()+1)*(xs.max()-xs.min()+1)
    fill=solid.sum()/max(1,box)
    flags=[]
    if islands>1: flags.append(f'DETACHED x{islands}')
    # the centipede's head and body plates are MEANT to run off the frame: they tile into a snake
    if edge>.02 and not n.startswith('centi'): flags.append(f'CLIPPED {edge*100:.0f}%')
    if soft>.20:  flags.append(f'SOFT {soft*100:.0f}%')
    if back>.03:  flags.append(f'BACKDROP {back*100:.0f}%')
    if fill<.13:  flags.append(f'THIN {fill*100:.0f}%')
    rows.append((n,flags,{}))
bad=[(n,f) for n,f,_ in rows if f]
print(f"{len(rows)} sprites, {len(bad)} flagged\n")
for n,f in bad: print(f"  {n:16s} {', '.join(f)}")
print("\nCLEAN:", ' '.join(n for n,f,_ in rows if not f))
