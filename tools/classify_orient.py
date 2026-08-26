#!/usr/bin/env python3
"""Ask the local vision model which way each sprite's head points.

Rotating the PNG once is better than flipping at draw time: no runtime table to keep in step,
and it fixes the art for good. Automatic pixel heuristics only scored 50%, so this asks a model
that can actually see the insect."""
import os, sys, json
sys.path.insert(0, os.path.expanduser("~/Desktop/PROJECTS/story-forge/pipeline-tools"))
from film_qc import vl_ask

SPR = os.path.expanduser("~/Desktop/PROJECTS/hive-strike/art/sprites")
Q = ("This is a single insect on a plain background, seen from directly above. "
     "Is the insect's HEAD (its eyes, mandibles and antennae) toward the TOP of the image "
     "or toward the BOTTOM of the image? Answer with exactly one word: TOP or BOTTOM.")

names = sys.argv[1:] or sorted(f[:-4] for f in os.listdir(SPR) if f.endswith(".png"))
out = {}
for n in names:
    p = os.path.join(SPR, n + ".png")
    try:
        a = vl_ask(p, Q).upper()
    except Exception as e:
        print(f"{n}\tERROR {e}", flush=True); continue
    v = "TOP" if "TOP" in a and "BOTTOM" not in a else ("BOTTOM" if "BOTTOM" in a else "?")
    out[n] = v
    print(f"{n}\t{v}\t{a[:40]!r}", flush=True)
json.dump(out, open("/tmp/orient.json", "w"))
print("wrote /tmp/orient.json", flush=True)
