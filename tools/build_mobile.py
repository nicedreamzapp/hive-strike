#!/usr/bin/env python3
"""Build dist/ — the same game with store-sized assets.

The dev tree keeps full-quality art. This produces the bundle that actually ships:
sprites cut to the size they are really drawn at, backgrounds and masks as WebP,
video re-encoded to the play field, music as AAC. Nothing in index.html changes
except the three file extensions.

Usage:  python3 tools/build_mobile.py [--fast]
"""
import os, re, shutil, subprocess, sys, concurrent.futures as cf
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")
FAST = "--fast" in sys.argv

# Bugs are drawn 35-80 css px, bosses up to ~260. Times a 3x device pixel ratio that is
# 240 and 780. Anything above that is bytes the screen can never show.
BUG_MAX, BOSS_MAX, BG_Q, SPR_Q = 320, 768, 80, 82

def sh(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: print("  FAIL", " ".join(cmd[:6]), r.stderr.strip()[:200])
    return r.returncode == 0

def webp_from_png(src, dst, max_dim, q):
    im = Image.open(src)
    if max(im.size) > max_dim:
        sc = max_dim / max(im.size)
        im = im.resize((max(1, round(im.width*sc)), max(1, round(im.height*sc))), Image.LANCZOS)
    if im.mode not in ("RGBA", "RGB"): im = im.convert("RGBA")
    im.save(dst, "WEBP", quality=q, method=4 if FAST else 6)

def enc_video(src, dst):
    return sh(["ffmpeg","-y","-loglevel","error","-i",src,
        "-vf","scale=480:720:flags=lanczos","-c:v","libx264","-profile:v","high","-level","4.0",
        "-crf","30" if not FAST else "32","-preset","medium" if FAST else "slow",
        "-pix_fmt","yuv420p","-g","48","-an","-movflags","+faststart",dst])

def enc_audio(src, dst):
    return sh(["ffmpeg","-y","-loglevel","error","-i",src,
        "-c:a","aac","-b:a","96k","-ar","44100","-movflags","+faststart",dst])

def sz(p):
    t=0
    for r,_,fs in os.walk(p):
        for f in fs: t+=os.path.getsize(os.path.join(r,f))
    return t/1e6

def main():
    if "--clean" in sys.argv and os.path.exists(DIST): shutil.rmtree(DIST)
    for d in ("art/sprites","art/clip","music"): os.makedirs(os.path.join(DIST,d), exist_ok=True)
    jobs=[]
    # sprites
    S=os.path.join(ROOT,"art","sprites")
    for f in sorted(os.listdir(S)):
        if not f.endswith(".png"): continue
        mx = BOSS_MAX if f.startswith("boss") or f.startswith("centi") else BUG_MAX
        jobs.append(("spr", os.path.join(S,f), os.path.join(DIST,"art","sprites",f[:-4]+".webp"), mx, SPR_Q))
    # backgrounds, masks, splash
    A=os.path.join(ROOT,"art")
    for f in sorted(os.listdir(A)):
        if f.endswith(".png") and os.path.isfile(os.path.join(A,f)):
            jobs.append(("spr", os.path.join(A,f), os.path.join(DIST,"art",f[:-4]+".webp"), 1248, BG_Q))
    # video + music
    V=os.path.join(ROOT,"art","clip")
    for f in sorted(os.listdir(V)):
        if f.endswith(".mp4"): jobs.append(("vid", os.path.join(V,f), os.path.join(DIST,"art","clip",f), 0,0))
    M=os.path.join(ROOT,"music")
    for f in sorted(os.listdir(M)):
        if f.endswith(".mp3"): jobs.append(("aud", os.path.join(M,f), os.path.join(DIST,"music",f[:-4]+".m4a"), 0,0))

    fresh=lambda src,dst: os.path.exists(dst) and os.path.getmtime(dst)>=os.path.getmtime(src)
    skipped=len(jobs); jobs=[j for j in jobs if not fresh(j[1],j[2])]; skipped-=len(jobs)
    print(f"{len(jobs)} assets to encode ({skipped} already current) ->", DIST)
    def run(j):
        kind,src,dst,mx,q = j
        try:
            if kind=="spr": webp_from_png(src,dst,mx,q)
            elif kind=="vid": enc_video(src,dst)
            else: enc_audio(src,dst)
            return True
        except Exception as e:
            print("  ERR",os.path.basename(src),e); return False
    with cf.ThreadPoolExecutor(max_workers=6) as ex:
        done=0
        for _ in ex.map(run, jobs):
            done+=1
            if done%20==0: print(f"  {done}/{len(jobs)}")

    # index.html: only the extensions move
    html=open(os.path.join(ROOT,"index.html"),encoding="utf-8").read()
    subs=[("'art/sprites/'+k+'.png'","'art/sprites/'+k+'.webp'"),
          ("'art/'+k+'.png'","'art/'+k+'.webp'"),
          ("'art/mask'+n+'.png'","'art/mask'+n+'.webp'"),
          ("'music/'+k+'.mp3'","'music/'+k+'.m4a'")]
    for a,b in subs:
        n=html.count(a)
        if n==0: print(f"  !! rewrite '{a}' matched nothing — index.html changed shape"); sys.exit(1)
        html=html.replace(a,b)   # onerror handlers repeat the path, so replace every one
        print(f"  path rewrite {a} -> {b}  ({n}x)")
    open(os.path.join(DIST,"index.html"),"w",encoding="utf-8").write(html)

    src_mb = sz(os.path.join(ROOT,"art"))+sz(os.path.join(ROOT,"music"))
    print(f"\nsource assets {src_mb:6.1f} MB")
    print(f"dist          {sz(DIST):6.1f} MB")
    for d in ("art/sprites","art/clip","music"): print(f"  {d:14s} {sz(os.path.join(DIST,d)):6.1f} MB")
    print(f"  art (bg+mask)  {sz(os.path.join(DIST,'art'))-sz(os.path.join(DIST,'art/sprites'))-sz(os.path.join(DIST,'art/clip')):6.1f} MB")

main()
