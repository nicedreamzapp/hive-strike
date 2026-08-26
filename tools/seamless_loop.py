#!/usr/bin/env python3
"""Make a forward-only loop that does not visibly reset.

Ping-pong is wrong for anything directional -- cars, lava, falling water read as absurd in reverse.
Instead: scan the clip for the pair of frames that look most alike, cut the loop between exactly
those two, and hide the join with a short crossfade. The seam lands where the picture is already
repeating itself, so there is nothing to notice."""
import subprocess, sys, os, numpy as np

src, dst = sys.argv[1], sys.argv[2]
SLOW = float(os.environ.get("SLOW", "3.6"))
XF   = float(os.environ.get("XF", "0.45"))

tmp = "/tmp/_slow_%d.mp4" % os.getpid()
subprocess.run(["ffmpeg","-y","-loglevel","error","-i",src,"-vf",
                f"setpts={SLOW}*PTS,minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:vsbmc=1",
                "-an","-c:v","libx264","-pix_fmt","yuv420p","-crf","21",tmp],check=True)

w,h = 96,144
raw = subprocess.run(["ffmpeg","-v","quiet","-i",tmp,"-vf",f"scale={w}:{h}","-f","rawvideo","-pix_fmt","gray","-"],
                     capture_output=True).stdout
n = len(raw)//(w*h)
F = np.frombuffer(raw[:n*w*h],dtype=np.uint8).reshape(n,h,w).astype(np.float32)
fps = 24.0
minlen = int(fps*float(os.environ.get("MINLEN","13")))   # keep loops long so they rarely come round

best=(None,1e18)
for i in range(0, max(1,int(n*0.22))):
    lo = i+minlen
    if lo >= n: break
    d = np.abs(F[lo:n] - F[i]).mean(axis=(1,2))
    # a longer loop is worth a slightly worse seam, so bias the score toward length
    length = np.arange(lo, n) - i
    scored = d * (1.0 - 0.28*np.clip(length/float(n), 0, 1))
    k = int(np.argmin(scored))
    if scored[k] < best[1]: best=((i, k+lo), float(scored[k]))
(i,j), score = best
print(f"loop {i}..{j} ({(j-i)/fps:.1f}s) match={score:.2f}", flush=True)

a, b = i/fps, j/fps
seg = "/tmp/_seg_%d.mp4" % os.getpid()
subprocess.run(["ffmpeg","-y","-loglevel","error","-i",tmp,"-ss",str(a),"-to",str(b),
                "-an","-c:v","libx264","-pix_fmt","yuv420p","-crf","21",seg],check=True)
D = float(subprocess.run(["ffprobe","-v","quiet","-show_entries","format=duration","-of","csv=p=0",seg],
                         capture_output=True,text=True).stdout.strip())
end, off = max(.1,D-XF), max(.1,D-2*XF)
subprocess.run(["ffmpeg","-y","-loglevel","error","-i",seg,"-filter_complex",
  f"[0:v]split[x][y];[x]trim=0:{end},setpts=PTS-STARTPTS[main];[y]trim={end}:{D},setpts=PTS-STARTPTS[tail];"
  f"[main][tail]xfade=transition=fade:duration={XF}:offset={off}[v]",
  "-map","[v]","-an","-c:v","libx264","-pix_fmt","yuv420p","-crf","21","-movflags","+faststart",dst],check=True)
for f in (tmp,seg):
    try: os.remove(f)
    except OSError: pass
print("wrote", os.path.basename(dst), flush=True)
