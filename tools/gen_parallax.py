#!/usr/bin/env python3
"""Measure how deep each painted background is, band by band, so the game can draw it
as a parallax that answers the player.

The stills are perspective paintings with a horizon, so they cannot tile and scroll.
What they CAN do is what a real scene does when you move sideways: the flowers at your
feet slide further than the hills. drawArt() in src/04_art.js draws each picture as
PX_STRIPS horizontal strips and shifts every strip by its depth times where the bee is.
This script produces those depths -- one number per strip, 0 = horizon, 1 = nearest --
with Depth-Anything-V2-Small from the local HF cache (MPS, ~1 s per picture), and writes
them into src/04_art.js between the PXD-BEGIN / PXD-END markers.

  ~/mflux-venv/bin/python tools/gen_parallax.py             # all 16 levels + splash
  ~/mflux-venv/bin/python tools/gen_parallax.py --debug     # also art/px_debug/*.jpg depth maps

No new game assets: the whole output is ~600 bytes of numbers inside the JS.
"""
import os, re, sys, json, numpy as np, cv2
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART  = os.path.join(ROOT, "art")
SRC  = os.path.join(ROOT, "src", "04_art.js")
DBG  = os.path.join(ART, "px_debug")
NL, STRIPS = 16, 32

_model = None
def depth(img):
    """relative depth, 0 = farthest, 1 = nearest, same HxW as img (RGB uint8)."""
    global _model
    import torch
    from transformers import AutoModelForDepthEstimation
    if _model is None:
        name = "depth-anything/Depth-Anything-V2-Small-hf"
        _model = (AutoModelForDepthEstimation.from_pretrained(name).to("mps").eval(), torch)
    mdl, torch = _model
    # the HF image processor needs torchvision, which this venv lacks; its recipe is just
    # "resize so the short side is 518 (multiples of 14), ImageNet-normalise"
    H, W = img.shape[:2]; s = 518 / min(H, W)
    nh, nw = (int(round(H*s/14))*14, int(round(W*s/14))*14)
    x = cv2.resize(img, (nw, nh), interpolation=cv2.INTER_CUBIC).astype(np.float32) / 255
    x = (x - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
    x = torch.from_numpy(x.transpose(2, 0, 1)[None].astype(np.float32)).to("mps")
    with torch.no_grad():
        d = mdl(pixel_values=x).predicted_depth[0].float().cpu().numpy()
    d = cv2.resize(d, (W, H), interpolation=cv2.INTER_CUBIC)
    return (d - d.min()) / max(1e-6, d.max() - d.min())

def profile(d):
    """mean depth per horizontal band, smoothed so neighbouring strips never jump
    (a jump would show as a shear line across a tree trunk), renormalised to 0..1."""
    H = d.shape[0]
    bands = np.array([d[int(i*H/STRIPS):int((i+1)*H/STRIPS)].mean() for i in range(STRIPS)])
    k = np.array([1, 2, 3, 2, 1], np.float32); k /= k.sum()
    bands = np.convolve(np.pad(bands, 2, mode="edge"), k, mode="valid")
    bands = (bands - bands.min()) / max(1e-6, bands.max() - bands.min())
    return [round(float(v), 2) for v in bands]

def main():
    debug = "--debug" in sys.argv
    out = {}
    for key in [f"level{n}" for n in range(1, NL+1)] + ["splash"]:
        img = np.array(Image.open(os.path.join(ART, key + ".png")).convert("RGB"))
        d = depth(img)
        out[key] = profile(d)
        print(f"{key:8s} horizon->near  {out[key][0]:.2f} .. {out[key][-1]:.2f}   "
              f"nearest strip {int(np.argmax(out[key]))}/{STRIPS-1}")
        if debug:
            os.makedirs(DBG, exist_ok=True)
            dv = cv2.applyColorMap((d*255).astype(np.uint8), cv2.COLORMAP_TURBO)[..., ::-1]
            sheet = cv2.resize(np.hstack([img, dv]), None, fx=0.35, fy=0.35, interpolation=cv2.INTER_AREA)
            Image.fromarray(sheet).save(os.path.join(DBG, key + ".jpg"), quality=85)
    # compact JS: {1:[...],...,16:[...],splash:[...]}
    js = "const PXD={" + ",".join(
        (k[5:] if k.startswith("level") else k) + ":[" + ",".join(f"{v:g}" for v in v_) + "]"
        for k, v_ in out.items()) + "};"
    s = open(SRC, encoding="utf-8").read()
    new, n = re.subn(r"(// PXD-BEGIN[^\n]*\n)(.*?)(\n// PXD-END)", lambda m: m.group(1)+js+m.group(3), s, count=1, flags=re.S)
    if n != 1: sys.exit("src/04_art.js: PXD-BEGIN / PXD-END markers not found")
    open(SRC, "w", encoding="utf-8").write(new)
    print(f"wrote {len(js)} bytes of depth into src/04_art.js")

if __name__ == "__main__":
    main()
