"""Proper white-matte extraction: recovers alpha AND removes white spill,
instead of luminance-keying (which leaves a white halo on every soft edge)."""
import numpy as np, os, sys
from PIL import Image, ImageFilter
from scipy import ndimage

def unmatte(path, white=253.0, bg_tol=10.0):
    im = Image.open(path).convert("RGB")
    C  = np.asarray(im).astype(np.float32)
    # 1. flood-fill the true background from the border so genuinely white BUGS survive
    nearwhite = (C.min(-1) > white - bg_tol)
    lbl, n = ndimage.label(nearwhite)
    border = set(lbl[0].tolist()) | set(lbl[-1].tolist()) | set(lbl[:,0].tolist()) | set(lbl[:,-1].tolist())
    border.discard(0)
    bg = np.isin(lbl, list(border))
    # 2. alpha from the white matte: observed = F*a + W*(1-a)  ->  a = 1 - min(C)/W
    a = np.clip(1.0 - C.min(-1)/white, 0, 1)
    a[bg] = 0.0
    # solid interior: anything the background flood didn't reach and that is reasonably opaque
    interior = ndimage.binary_fill_holes(~bg & (a > 0.06))
    a = np.where(interior & (a > 0.35), 1.0, a)
    a = np.asarray(Image.fromarray((a*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.5))).astype(np.float32)/255.
    # 3. un-multiply to strip the white spill out of the edge pixels
    ae = np.maximum(a, 0.02)[..., None]
    F  = np.clip((C - white*(1.0-ae)) / ae, 0, 255)
    return Image.fromarray(np.dstack([F, a*255]).astype(np.uint8), "RGBA")

def halo(im):
    A=np.asarray(im).astype(np.float32); al=A[...,3]/255.; lum=A[...,:3].mean(-1)/255.
    semi=(al>0.03)&(al<0.85)
    return (semi&(lum>0.55)).sum()/max(1,semi.sum())

if __name__=="__main__":
    RAW=os.path.expanduser("~/Desktop/PROJECTS/hive-strike/art/sprites/raw")
    CUT=os.path.expanduser("~/Desktop/PROJECTS/hive-strike/art/sprites")
    OUT=os.environ.get("SP","")+"/unmatte" if os.environ.get("SP") else os.path.expanduser("~/Desktop/PROJECTS/hive-strike/art/sprites-unmatted")
    os.makedirs(OUT,exist_ok=True)
    args=sys.argv[1:]
    if args==["--all"]:
        import glob
        OUT=os.path.expanduser("~/Desktop/PROJECTS/hive-strike/art/sprites-unmatted"); os.makedirs(OUT,exist_ok=True)
        args=[os.path.basename(f)[:-4] for f in sorted(glob.glob(RAW+"/*.png"))]
    for n in args:
        new=unmatte(f"{RAW}/{n}.png"); new.save(f"{OUT}/{n}.png")
        old=Image.open(f"{CUT}/{n}.png").convert("RGBA")
        print(f"{n:14s} halo now={halo(old):.2f}  ->  fixed={halo(new):.2f}")

# Batch usage (writes to art/sprites-unmatted/, never over the live sprites):
#   ~/.local/mlx-server/bin/python tools/unmatte_white.py --all
