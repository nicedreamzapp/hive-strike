#!/usr/bin/env python3
"""chain_scene.py — build ONE long HD level clip out of several short renders.

Why this exists: a single 473-frame pass at 896x1344 does not fit. It ran
stage 1 for 25 minutes on a 128GB box with Song Forge shut down and every byte
free, and still drove swap at 7,886 MB/min without finishing -- MLX cannot keep
that attention working set wired, so macOS pages it and the render never lands.
89 frames completes in 8m49s at a 45.7GB peak. So: render short, chain, join.

Each segment after the first is anchored on the LAST FRAME of the one before,
so the picture is continuous across the joins. The duplicated frame is dropped
when they are concatenated, and the result is a single mp4 the game loads
exactly like any other level clip.

  tools/chain_scene.py 1 --segments 3 --seconds 6.7

Output: art/clip-hd/level<N>_chain_<total>s.mp4
"""
import argparse
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
ART = HERE.parent / "art"
OUT_DIR = ART / "clip-hd"
WORK = OUT_DIR / "_chain"


def run(cmd):
    r = subprocess.run(cmd)
    if r.returncode != 0:
        sys.exit(f"[chain] step failed rc={r.returncode}: {' '.join(map(str, cmd))}")


def last_frame(mp4, png):
    """Pull the final frame. -sseof lands on the last keyframe-decodable frame,
    which is what the next segment has to continue from."""
    run(["ffmpeg", "-y", "-v", "error", "-sseof", "-0.1", "-i", str(mp4),
         "-update", "1", "-q:v", "1", str(png)])


def main():
    p = argparse.ArgumentParser()
    p.add_argument("level", type=int)
    p.add_argument("--segments", type=int, default=3)
    p.add_argument("--seconds", type=float, default=6.7,
                   help="length of EACH segment")
    p.add_argument("--res", default="896x1344")
    p.add_argument("--fps", type=int, default=24)
    p.add_argument("--seed", type=int, default=None)
    p.add_argument("--mem-gb", type=float, default=48.0)
    a = p.parse_args()

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    WORK.mkdir(parents=True, exist_ok=True)
    base_seed = a.seed if a.seed is not None else 7000 + a.level

    t0 = time.time()
    segs = []
    prev_png = None
    for i in range(a.segments):
        tag = f"chain{i+1}"
        cmd = [sys.executable, str(HERE / "render_scene.py"), str(a.level),
               "--seconds", str(a.seconds), "--res", a.res, "--fps", str(a.fps),
               # Walk the seed so the segments do not all sample identically;
               # the anchor frame is what keeps them continuous, not the seed.
               "--seed", str(base_seed + i),
               "--mem-gb", str(a.mem_gb), "--tag", tag,
               "--out-dir", str(WORK)]
        if prev_png:
            cmd += ["--from-image", str(prev_png)]
        print(f"\n[chain] === segment {i+1}/{a.segments} ===", flush=True)
        run(cmd)

        made = sorted(WORK.glob(f"level{a.level}_*_{tag}.mp4"),
                      key=lambda f: f.stat().st_mtime)
        if not made:
            sys.exit(f"[chain] segment {i+1} produced no file in {WORK}")
        seg = made[-1]
        segs.append(seg)
        print(f"[chain] segment {i+1} -> {seg.name}", flush=True)

        if i + 1 < a.segments:
            prev_png = WORK / f"level{a.level}_anchor{i+1}.png"
            last_frame(seg, prev_png)
            print(f"[chain] anchor for next segment -> {prev_png.name}",
                  flush=True)

    # Join. Every segment after the first opens ON the previous segment's last
    # frame, so that duplicate is trimmed -- otherwise the motion visibly
    # hitches on a held frame at each seam.
    parts = []
    for i, seg in enumerate(segs):
        if i == 0:
            parts.append(seg)
            continue
        trimmed = WORK / f"trim{i}.mp4"
        run(["ffmpeg", "-y", "-v", "error", "-i", str(seg),
             "-vf", "select=gte(n\\,1),setpts=PTS-STARTPTS",
             "-an", "-c:v", "libx264", "-crf", "16", "-preset", "slow",
             "-pix_fmt", "yuv420p", str(trimmed)])
        parts.append(trimmed)

    listing = WORK / "concat.txt"
    listing.write_text("".join(f"file '{p.resolve()}'\n" for p in parts))
    total = sum(1 for _ in segs) * a.seconds
    out = OUT_DIR / f"level{a.level}_chain_{int(round(total))}s.mp4"
    run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0",
         "-i", str(listing), "-an", "-c:v", "libx264", "-crf", "16",
         "-preset", "slow", "-pix_fmt", "yuv420p", str(out)])

    el = time.time() - t0
    print(f"\n[chain] DONE in {el/60:.1f} min -> {out}", flush=True)
    run(["ffprobe", "-v", "error", "-show_entries",
         "stream=width,height,nb_frames,duration", "-of", "default=nw=1",
         str(out)])
    return 0


if __name__ == "__main__":
    sys.exit(main())
