#!/usr/bin/env python3
"""Splash clip: animate art/splash.png with LTX i2v (multi-scale Lightricks path) under a forge_guard lease."""
import os, subprocess, sys
sys.path.insert(0, os.path.expanduser("~/SongForgeM5"))
from mem_client import reserve
ART=os.path.expanduser("~/Desktop/PROJECTS/hive-strike/art"); OUT=os.path.join(ART,"clip"); os.makedirs(OUT,exist_ok=True)
PROMPT=("the whole scene is alive: the bee hovers with wings fluttering in a soft blur, sun rays shimmer and pulse, thin clouds drift slowly across the sky, "
        "the giant insect silhouettes behind sway and breathe menacingly, grass and wildflowers in the foreground sway in a breeze, "
        "gentle slow camera push-in, cinematic, smooth calm motion, no morphing")
with reserve("ltx-splash", 58):
    # exec so the LTX process IS the leased pid (forge_guard kills unregistered children when swap climbs)
    py=os.path.expanduser("~/Desktop/PROJECTS/AI/ComfyUI/venv/bin/python")
    os.execv(py,[py,os.path.expanduser("~/Desktop/PROJECTS/story-forge/bin/make-ltx-lightricks"),
        "--i2v", os.path.join(ART,"splash.png"), "--duration","4", "--res","448x672", "--seed","21",
        "--label","splash_21", "--out-dir",OUT, PROMPT])
