#!/usr/bin/env python3
"""rebuild_levels.py — re-render level backgrounds in HD and install them.

The recipe that worked for level 1 on 2026-08-26, applied level by level:

  1. render 89 frames at 896x1344 with render_scene.py (dev-two-stage-hq, text
     killers in the NEGATIVE prompt where they actually bite)
  2. slow 3.6x with motion interpolation, then ping-pong forward+reverse, which
     is how the old clips got their length
  3. back up the old clip, drop the new one in as art/clip/levelN.mp4

Do NOT try to make length by rendering long. A single 473-frame pass took 98
minutes and came back unusable: same 15+3 sampling steps spread over 5x the
tokens, so nothing resolved. Chaining short segments drifts instead -- the
camera pulls back a little each segment and by the third you are looking at a
different landscape. 89 frames is the length this model actually holds.

  tools/rebuild_levels.py 2 3 4        # specific levels
  tools/rebuild_levels.py --all        # 2..16
"""
import argparse
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
ART = HERE.parent / "art"
CLIP = ART / "clip"
HD = ART / "clip-hd"
ORIG = ART / "clip-originals"
SLOW = 3.6          # matches pingpong_clips.sh, which set the existing pacing
CRF = "18"


def sh(cmd, **kw):
    r = subprocess.run(cmd, **kw)
    if r.returncode != 0:
        raise RuntimeError(f"failed rc={r.returncode}: {' '.join(map(str, cmd))}")


def pingpong(src, dst):
    """Slow it down, then play it forward and back. There is no cut to hide
    because the last frame of the forward pass IS the first of the reverse."""
    fwd, rev, lst = Path("/tmp/_pp_fwd.mp4"), Path("/tmp/_pp_rev.mp4"), Path("/tmp/_pp.txt")
    sh(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-vf",
        f"setpts={SLOW}*PTS,minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:vsbmc=1",
        "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", CRF, str(fwd)])
    # trim the turnaround frame or the motion visibly hitches at each end
    sh(["ffmpeg", "-y", "-loglevel", "error", "-i", str(fwd), "-vf",
        "reverse,trim=start_frame=1,setpts=PTS-STARTPTS",
        "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", CRF, str(rev)])
    lst.write_text(f"file '{fwd}'\nfile '{rev}'\n")
    sh(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0",
        "-i", str(lst), "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p",
        "-crf", CRF, "-movflags", "+faststart", str(dst)])
    for f in (fwd, rev, lst):
        f.unlink(missing_ok=True)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("levels", nargs="*", type=int)
    p.add_argument("--all", action="store_true", help="levels 2..16")
    p.add_argument("--res", default="896x1344")
    p.add_argument("--seconds", type=float, default=4.0)
    p.add_argument("--mem-gb", type=float, default=48.0)
    a = p.parse_args()

    levels = list(range(2, 17)) if a.all else a.levels
    if not levels:
        sys.exit("give level numbers or --all")
    for d in (HD, ORIG):
        d.mkdir(parents=True, exist_ok=True)

    t0 = time.time()
    done, failed = [], []
    for n in levels:
        t1 = time.time()
        print(f"\n=== level {n} ({levels.index(n)+1}/{len(levels)}) ===", flush=True)
        try:
            tag = "hd"
            sh([sys.executable, str(HERE / "render_scene.py"), str(n),
                "--seconds", str(a.seconds), "--res", a.res,
                "--mem-gb", str(a.mem_gb), "--tag", tag, "--out-dir", str(HD)])
            made = sorted(HD.glob(f"level{n}_*_{tag}.mp4"),
                          key=lambda f: f.stat().st_mtime)
            if not made:
                raise RuntimeError("render produced no file")
            raw = made[-1]

            pp = HD / f"level{n}_hd_pingpong.mp4"
            pingpong(raw, pp)

            live = CLIP / f"level{n}.mp4"
            if live.exists():
                backup = ORIG / f"level{n}.old-512x768.mp4"
                if not backup.exists():
                    sh(["cp", str(live), str(backup)])
            sh(["cp", str(pp), str(live)])

            dur = subprocess.run(
                ["ffprobe", "-v", "error", "-show_entries", "format=duration",
                 "-of", "csv=p=0", str(live)],
                capture_output=True, text=True).stdout.strip()
            el = (time.time() - t1) / 60
            print(f"[level{n}] installed {a.res} {float(dur):.1f}s  ({el:.1f} min)",
                  flush=True)
            done.append(n)
        except Exception as e:
            print(f"[level{n}] FAILED: {e}", flush=True)
            failed.append(n)

    print(f"\n=== ALL DONE in {(time.time()-t0)/60:.0f} min ===", flush=True)
    print(f"installed: {done}", flush=True)
    print(f"failed:    {failed}", flush=True)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
