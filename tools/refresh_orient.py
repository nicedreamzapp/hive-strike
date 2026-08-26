#!/usr/bin/env python3
"""Keep the game's head-down sprite list in step with the regeneration batch.

The batch rewrites sprites one at a time. Anything already regenerated is drawn unrotated;
anything still on the old art gets flipped. A stale list is worse than no list -- every sprite
that lands after the snapshot ends up upside down -- so this refreshes it until the batch is done,
then removes the bridge entirely."""
import os, time, json, subprocess, sys

ROOT = os.path.expanduser("~/Desktop/PROJECTS/hive-strike")
SPR  = os.path.join(ROOT, "art/sprites")
IDX  = os.path.join(ROOT, "index.html")
CUT  = time.mktime(time.strptime("2026-08-25 21:24", "%Y-%m-%d %H:%M"))

def newart():
    return sorted(f[:-4] for f in os.listdir(SPR)
                  if f.endswith(".png") and os.path.getmtime(os.path.join(SPR, f)) > CUT)

def write(names, final=False):
    s = open(IDX).read()
    i = s.index("const NEWART="); j = s.index("\n", i)
    if final:
        s = s[:i] + "const NEWART=null;const faceRot=k=>0;  // every sprite is head-down art now" + s[s.index("\n", s.index("const faceRot=", i)):]
    else:
        s = s[:i] + "const NEWART=new Set(" + json.dumps(names) + ");" + s[j:]
    open(IDX, "w").write(s)

while True:
    running = subprocess.run(["pgrep", "-f", "gen_sprites.py"], capture_output=True).returncode == 0
    n = newart()
    write(n)
    print(f"{time.strftime('%H:%M:%S')}  head-down sprites: {len(n)}", flush=True)
    if not running:
        time.sleep(5)
        n = newart(); write(n)
        if len(n) >= 80:
            write(n, final=True)
            print("batch finished — bridge removed, all rotations zero", flush=True)
        else:
            print(f"batch stopped with only {len(n)} regenerated — keeping the bridge", flush=True)
        break
    time.sleep(10)
