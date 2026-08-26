"""Re-cut every raw render with the saturation+darkness keyer from gen_sprites.key_white,
then apply the orientation flips so the head points down. Writes to art/sprites-rekey/."""
import os, glob, numpy as np
from PIL import Image
RAW="art/sprites/raw"; OUT="art/sprites-rekey"
FLIP=set("bedbug boss15 boss4 boss3 cockroach dragon mayfly moth silverfish".split())

def key_white(src, dst):
    im = Image.open(src).convert("RGB")
    q = np.asarray(im).astype(np.float32)
    mx = q.max(axis=2); mn = q.min(axis=2); lum = q.mean(axis=2)
    sat = mx - mn
    a = np.maximum(np.clip((sat - 14.0) / 26.0, 0, 1),
                   np.clip((140.0 - lum) / 55.0, 0, 1))
    a3 = a[..., None]
    with np.errstate(divide="ignore", invalid="ignore"):
        rgb = (q - 255.0 * (1.0 - a3)) / np.where(a3 > 0.02, a3, 1.0)
    out = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), a * 255.0]).astype(np.uint8), "RGBA")
    aa = np.asarray(out)[..., 3]
    rows = np.where(aa.max(axis=1) > 12)[0]; cols = np.where(aa.max(axis=0) > 12)[0]
    if len(rows) and len(cols):
        out = out.crop((max(0, cols.min() - 6), max(0, rows.min() - 6),
                        min(out.width, cols.max() + 7), min(out.height, rows.max() + 7)))
    out.save(dst)

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    n = 0
    for f in sorted(glob.glob(RAW + "/*.png")):
        k = os.path.basename(f)[:-4]
        dst = os.path.join(OUT, k + ".png")
        key_white(f, dst)
        if k in FLIP:
            Image.open(dst).convert("RGBA").rotate(180).save(dst)
        n += 1
    print("re-keyed", n, "| flipped:", ", ".join(sorted(FLIP)))
