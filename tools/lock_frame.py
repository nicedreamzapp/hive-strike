#!/usr/bin/env python3
"""Lock a generated clip to its first frame.

LTX drifts the whole scene (a slow slide plus about 1% scale creep), which reads as a camera
push even though nothing asked for one. This estimates each frame's shift against frame 0 by
FFT phase correlation, warps it back, and crops the wobble margin away. What survives is the
motion that is actually inside the scene: leaves, water, grass, light.
"""
import subprocess, sys, os, numpy as np
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
MARGIN = float(os.environ.get("MARGIN", "0.045"))          # crop this fraction off each edge

probe = subprocess.run(["ffprobe","-v","quiet","-select_streams","v:0",
                        "-show_entries","stream=width,height,r_frame_rate","-of","csv=p=0",src],
                       capture_output=True,text=True).stdout.strip().split(",")
W, H = int(probe[0]), int(probe[1])
num, den = probe[2].split("/"); FPS = float(num)/float(den)

raw = subprocess.run(["ffmpeg","-v","quiet","-i",src,"-f","rawvideo","-pix_fmt","rgb24","-"],
                     capture_output=True).stdout
n = len(raw)//(W*H*3)
frames = np.frombuffer(raw[:n*W*H*3], dtype=np.uint8).reshape(n, H, W, 3)

def gray_small(f):
    g = f.astype(np.float32).mean(axis=2)
    return g[::2, ::2]

ref = gray_small(frames[0])
rh, rw = ref.shape
win = np.outer(np.hanning(rh), np.hanning(rw))
Fref = np.fft.rfft2(ref * win)

shifts = []
for i in range(n):
    if i == 0:
        shifts.append((0.0, 0.0)); continue
    g = gray_small(frames[i]) * win
    Fg = np.fft.rfft2(g)
    cross = Fref * np.conj(Fg)
    mag = np.abs(cross); mag[mag == 0] = 1e-9
    corr = np.fft.irfft2(cross/mag, s=ref.shape)
    peak = np.unravel_index(np.argmax(corr), corr.shape)
    dy = peak[0] - (rh if peak[0] > rh//2 else 0)
    dx = peak[1] - (rw if peak[1] > rw//2 else 0)
    shifts.append((dx*2.0, dy*2.0))                        # back to full-res pixels

# a little smoothing so a bad estimate on one frame cannot jerk the picture
sx = np.array([s[0] for s in shifts]); sy = np.array([s[1] for s in shifts])
k = np.ones(5)/5.0
sx = np.convolve(sx, k, mode="same"); sy = np.convolve(sy, k, mode="same")

mx, my = int(W*MARGIN), int(H*MARGIN)
ow, oh = W-2*mx, H-2*my
out = subprocess.Popen(["ffmpeg","-y","-loglevel","error","-f","rawvideo","-pix_fmt","rgb24",
                        "-s",f"{ow}x{oh}","-r",f"{FPS}","-i","-","-an","-c:v","libx264",
                        "-pix_fmt","yuv420p","-crf","20","-movflags","+faststart",dst],
                       stdin=subprocess.PIPE)
for i in range(n):
    ox, oy = int(round(sx[i])), int(round(sy[i]))
    x0 = min(max(mx + ox, 0), W-ow); y0 = min(max(my + oy, 0), H-oh)
    out.stdin.write(frames[i][y0:y0+oh, x0:x0+ow].tobytes())
out.stdin.close(); out.wait()
print(f"locked {os.path.basename(dst)}  frames={n} drift x[{sx.min():.0f},{sx.max():.0f}] y[{sy.min():.0f},{sy.max():.0f}]")
