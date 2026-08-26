#!/usr/bin/env python3
"""Render one looping animated background per level with LTX i2v, seeded from that level's art.
Each prompt describes only what that photograph should actually do -- Matt's notes, level by level.
Then ffmpeg crossfades the tail into the head so the loop never pops."""
import os, subprocess, sys, time
sys.path.insert(0, os.path.expanduser("~/SongForgeM5"))
from mem_client import reserve

ART = os.path.expanduser("~/Desktop/PROJECTS/hive-strike/art")
OUT = os.path.join(ART, "clip"); os.makedirs(OUT, exist_ok=True)
PY  = os.path.expanduser("~/Desktop/PROJECTS/AI/ComfyUI/venv/bin/python")
BIN = os.path.expanduser("~/Desktop/PROJECTS/story-forge/bin/make-ltx-lightricks")
NEG = ("no insects, no bugs, no animals, no people, no text, "
       "no morphing, no warping, no camera shake, everything stays in place")

SCENES = {
 1:  "only the tree branches and leaves overhead sway gently in a light breeze, the tall grass and wildflowers in the foreground ripple slowly in the same breeze, thin clouds drift across the distant hills, the hanging hive sways a little, static camera",
 2:  "the fountain in the middle runs, water falling and rippling in the basin, the hedges and rose bushes breathe slightly in a light breeze, long shadows hold still, static camera",
 3:  "the surface of the pond ripples naturally, small wind ripples travelling across the water, lily pads bobbing gently, reeds at the banks swaying slightly, reflections wobbling on the water, static camera",
 4:  "the apple tree leaves rustle in a light breeze on both sides, the grass lane in the middle ripples, one or two apples drop from the branches, static camera",
 5:  "moonlit pines sway very slightly, the spider web trembles in the breeze, the glowing mushrooms pulse softly, a few fireflies drift slowly between the trunks, static camera",
 6:  "warm light shifts slowly along the honeycomb walls, a few slow honey drips run down the comb, the glow at the end of the corridor breathes, static camera",
 7:  "the still swamp water ripples gently, mist drifts slowly between the tree trunks, cattails and reeds sway a little, reflections wobble on the water, static camera",
 8:  "fine sand drifts slowly over the crests of the dunes, heat shimmers above the far horizon, everything else perfectly still, static camera",
 9:  "the big leaves and the hanging vines move slightly in a humid breeze, shafts of light shift softly through the canopy, nothing crosses the frame, static camera",
 10: "the stream on the cave floor actually flows downhill over the rocks, water rippling and catching the blue glow, slow drips falling from the ceiling into it, static camera",
 11: "the alpine flowers and grasses in the foreground move gently in the breeze, sunlight glistens and glints across them, a cloud shadow drifts slowly over the slope, static camera",
 12: "only the sea water moves, waves lapping and glistening, foam sliding up the wet sand and back, the rocks and coral are completely still, static camera",
 13: "the molten lava flows steadily down the glowing crack toward the viewer, bright orange and yellow, embers lifting off it, the cracked ground around it stays perfectly still, static camera",
 14: "the slabs of ice float and drift very slowly in the dark meltwater, the water between them ripples gently, pale sun glinting off the ice, static camera",
 15: "cars drive down the city street with headlights and tail lights moving, apartment windows lit in the buildings on both sides, the sunset glows at the end of the street, static camera",
 16: "the water on the floor of the crystal chasm glistens and ripples gently, a few faint northern lights ripple slowly across the sky above the chasm, the crystal walls stay still, static camera",
}
STYLE = ", photoreal, cinematic, smooth calm realistic motion, subtle, "

only = [int(x) for x in os.environ.get("ONLY", "").split(",") if x.strip()] or list(range(1, 17))
for n in only:
    src = os.path.join(ART, f"level{n}.png")
    if not os.path.exists(src):
        print(f"level{n} MISSING ART", flush=True); continue
    label = f"lv{n}"
    t0 = time.time()
    r = subprocess.run([PY, BIN, "--i2v", src, "--duration", "5", "--res", "448x672",
                        "--seed", str(4200 + n), "--label", label, "--out-dir", OUT,
                        SCENES[n] + STYLE + NEG],
                       capture_output=True, text=True)
    made = sorted([f for f in os.listdir(OUT) if f.startswith(label + "_") and f.endswith(".mp4")])
    if not made:
        print(f"level{n} FAILED {r.stderr.strip()[-200:]}", flush=True); continue
    raw = os.path.join(OUT, made[-1])
    dst = os.path.join(OUT, f"level{n}.mp4")
    # crossfade the last 0.7s onto the first 0.7s so the loop is seamless
    dur = float(subprocess.run(["ffprobe","-v","quiet","-show_entries","format=duration","-of","csv=p=0",raw],
                               capture_output=True,text=True).stdout.strip() or 5)
    xf = 0.7
    subprocess.run(["ffmpeg","-y","-loglevel","error","-i",raw,"-filter_complex",
        f"[0:v]split[a][b];[a]trim=0:{dur-xf},setpts=PTS-STARTPTS[main];"
        f"[b]trim={dur-xf}:{dur},setpts=PTS-STARTPTS[tail];"
        f"[main][tail]xfade=transition=fade:duration={xf}:offset={dur-2*xf}[v]",
        "-map","[v]","-an","-c:v","libx264","-pix_fmt","yuv420p","-crf","22","-movflags","+faststart",dst],
        capture_output=True)
    if not os.path.exists(dst):
        subprocess.run(["ffmpeg","-y","-loglevel","error","-i",raw,"-an","-c:v","libx264",
                        "-pix_fmt","yuv420p","-crf","22","-movflags","+faststart",dst],capture_output=True)
    print(f"level{n} ok  ({int(time.time()-t0)}s)", flush=True)
print("CLIPS DONE", flush=True)
