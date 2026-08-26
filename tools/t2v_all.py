#!/usr/bin/env python3
"""Regenerate every level background as REAL video with LTX-2 text-to-video.
No still to fight, so the whole scene moves. Style matches the existing painted look."""
import os, subprocess, sys, time
ART=os.path.expanduser("~/Desktop/PROJECTS/hive-strike/art"); OUT=os.path.join(ART,"clip")
BIN=os.path.expanduser("~/AI/videopipe/bin/make-ltx2")
STYLE=(", semi-realistic digital matte painting, painterly but believable, natural textures, "
       "high angle bird's eye view looking down, wide open space in the middle, portrait orientation, "
       "locked-off camera on a tripod, the camera never moves, no zoom, no insects, no bugs, no animals, no people, no text")
S={
 5:"a fast forest stream rushing and tumbling over dark rocks, white water churning and splashing, foam swirling downstream, running through a moonlit pine forest at night, glowing blue and purple mushrooms along the banks, mist over the water, moonlight glinting on the rapids",
}
only=[int(x) for x in os.environ.get("ONLY","").split(",") if x.strip()] or list(range(1,17))
for n in only:
    t0=time.time()
    r=subprocess.run([BIN,"--duration","6","--res","512x768","--seed",str(150000+n*29),
                      "--label",f"v{n}","--out-dir",OUT,S[n]+STYLE],capture_output=True,text=True)
    made=sorted([f for f in os.listdir(OUT) if f.startswith(f"v{n}_") and f.endswith(".mp4")])
    print(f"level{n} {'ok' if made else 'FAILED'} ({int(time.time()-t0)}s)",flush=True)
print("T2V DONE",flush=True)
