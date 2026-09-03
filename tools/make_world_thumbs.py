#!/usr/bin/env python3
"""art/worlds.png: one small thumbnail per world (8x2 grid, 96x110 each) cut from the middle of
art/levelN.png, so the title screen can show every world as a picture without loading 16 full paintings."""
import os
from PIL import Image
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TW,TH=96,110
sheet=Image.new("RGBA",(TW*8,TH*2),(0,0,0,0))
for i in range(16):
    im=Image.open(os.path.join(ROOT,"art",f"level{i+1}.png")).convert("RGB")
    w,h=im.size
    # a band around the horizon: skip the top sky and the bottom ground strip
    cw=int(w*.6); ch=int(cw*TH/TW); cx=w//2; cy=int(h*.52)
    box=(cx-cw//2, cy-ch//2, cx+cw//2, cy+ch//2)
    t=im.crop(box).resize((TW,TH),Image.LANCZOS)
    sheet.paste(t,((i%8)*TW,(i//8)*TH))
out=os.path.join(ROOT,"art","worlds.png"); sheet.save(out,optimize=True)
print(out, os.path.getsize(out)//1024,"KB")
