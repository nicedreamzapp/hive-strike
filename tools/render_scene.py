#!/usr/bin/env python3
"""render_scene.py — render one level background as HD video with LTX-2.

Replaces the old t2v_all.py path, which had two faults that put garbled
watermark text into the frames (the "VINEODES" mark on the volcano):

  1. it ran the `distilled` pipeline, which has NO classifier-free guidance,
     so --negative-prompt is ignored and nothing can suppress text; and
  2. it appended "no people, no text" to the POSITIVE prompt. Diffusion
     conditioning has no negation -- "no text" is just the token *text*, so it
     steered the model toward drawing letters instead of away from them.

Here the text killers live in the negative prompt and we run `dev-two-stage-hq`
(CFG on both stages + the x2 spatial upscaler), which is what makes the
negative prompt bite and gets us real resolution.

  tools/render_scene.py 1 --seconds 20 --res 896x1344

Output: art/clip-hd/level<N>_<seconds>s_<seed>.mp4
"""
import argparse
import os
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
ART = HERE.parent / "art"
MLX_PY = Path.home() / "ai-video-bench/mlxvid-venv/bin/python"
MODEL_REPO = "prince-canuma/LTX-2-distilled"
sys.path.insert(0, str(Path.home() / "SongForgeM5"))

# Everything we never want painted into a frame. The stock-footage watermark
# vocabulary is first because that is the fault we are fixing.
NEGATIVE = (
    "text, words, letters, writing, handwriting, watermark, logo, signature, "
    "caption, subtitle, title card, timestamp, date stamp, on-screen text, "
    "stock footage watermark, brand mark, lower third, banner, sign, "
    "lettering carved into the ground, graphic overlay, user interface, "
    "insects, bugs, flying creatures, birds, animals, people, person, hands, "
    "camera movement, camera zoom, zoom in, zoom out, push in, dolly, pan, "
    "tilt, tracking shot, handheld shake, moving camera, scale change, "
    "blurry, out of focus, soft focus, low resolution, upscaled, "
    "compression artifacts, color banding, flicker, strobing, morphing, "
    "warping, distorted, deformed, low quality, worst quality, jpeg artifacts"
)

# Positive prompts describe ONLY what should be there. No "no X" phrasing --
# that is what invited the text in the first place.
LOCKED = (
    " Bright natural daylight, rich saturated colour, crisp detail from the "
    "foreground to the horizon. The camera is locked off on a tripod and never "
    "moves; the framing is identical in every frame and only the things inside "
    "the scene move."
)

SCENES = {
    # Shot from high up looking down, with the middle of the frame kept open --
    # bugs and bullets are drawn over the centre and get lost against clutter.
    1: ("A wide sunny summer meadow filmed from high above, a bird's eye view "
        "looking steeply down onto open short green grass that fills the whole "
        "middle of the frame. Drifts of white oxeye daisies, red poppies and "
        "yellow buttercups grow along the left and right edges and across the "
        "far side, leaving the centre of the meadow clear and open. Long waves "
        "of wind travel across the grass and the flower heads nod over and "
        "spring back. Soft cloud shadows slide slowly across the open ground."),
    2: ("A formal rose garden at sunset, a stone fountain running in the middle "
        "of a clipped hedge walk, water falling from the fountain bowl and "
        "ringing the basin, the hedges quivering and the rose blooms nodding."),
    3: ("A still green pond seen from above, lily pads rocking on the surface, "
        "reeds bending along the banks, rings spreading slowly across the water "
        "and the reflections wobbling."),
    4: ("An autumn apple orchard, two rows of heavy laden trees, leaves "
        "flickering and rustling, the grass in the lane bending in the wind, a "
        "couple of ripe apples letting go and dropping to the ground."),
    5: ("A moonlit pine forest at night, a fast stream tumbling white over dark "
        "rocks, glowing blue and purple mushrooms along the banks, mist creeping "
        "between the trunks, moonlight glinting on the rapids."),
    6: ("The inside of a honeycomb, warm golden light travelling along the wax "
        "walls, honey glistening and sliding slowly down the comb, a few slow "
        "honey drips falling."),
    7: ("A misty swamp at dawn, dead trees standing in still black water, mist "
        "drifting sideways between the trunks, cattails and reeds bending, "
        "duckweed shifting on the surface and the reflections wobbling."),
    8: ("A desert of tall sand dunes at sunset, sand streaming off the crest of "
        "each dune in the wind, the ripple lines on the sand travelling, heat "
        "shimmering above the far horizon."),
    9: ("A rainforest canopy, a waterfall falling into a green pool, big leaves "
        "fluttering and turning, hanging vines swinging, orchid blooms nodding, "
        "shafts of light brightening and dimming through the leaves."),
    10: ("A deep limestone cave, a stream flowing over rocks with a visible "
         "current, glints travelling downstream, drips falling from the ceiling "
         "into the pool and spreading rings."),
    11: ("A high alpine meadow below snow peaks, alpine flowers and grasses "
         "bending and springing back in the wind, waves rippling through the "
         "tall grass, sunlight glints travelling across the meadow."),
    12: ("A rocky tide pool shore, waves rolling in and breaking, foam sliding "
         "up the wet sand and retreating, glints moving across the water, "
         "seaweed swaying underwater."),
    13: ("A volcanic plain of cracked black basalt at dusk, a river of molten "
         "lava flowing along the crack with a visible current, its crust glowing "
         "brighter and dimmer as it moves, heat shimmering above it."),
    14: ("An arctic sea of drifting ice, slabs of ice rocking and drifting slowly "
         "on the water, meltwater rippling between them, glints of light sliding "
         "across the ice."),
    15: ("A city street at dusk seen from above, cars moving along the street "
         "with headlights and tail lights travelling, lit windows switching on "
         "and off in the buildings, the sunset glow shifting at the end of the "
         "street."),
    16: ("A glowing crystal cavern, water on the chasm floor rippling with glints "
         "travelling across it, curtains of northern lights rippling slowly "
         "across the sky above, the crystal glow pulsing."),
}


def main():
    p = argparse.ArgumentParser()
    p.add_argument("level", type=int)
    p.add_argument("--seconds", type=float, default=20.0)
    p.add_argument("--res", default="896x1344", help="WIDTHxHEIGHT, multiples of 32")
    p.add_argument("--fps", type=int, default=24)
    p.add_argument("--seed", type=int, default=None)
    p.add_argument("--steps", type=int, default=30)
    p.add_argument("--cfg-scale", type=float, default=3.0)
    p.add_argument("--pipeline", default="dev-two-stage-hq")
    p.add_argument("--out-dir", default=str(ART / "clip-hd"))
    # 41 frames at 896x1344 peaked at 45.7GB; the VAE decode grows with frame
    # count, so a long clip asks for more and tiles the decode.
    p.add_argument("--mem-gb", type=float, default=60.0)
    p.add_argument("--tiling", default="aggressive",
                   choices=["auto", "none", "default", "aggressive",
                            "conservative", "spatial", "temporal"],
                   help="VAE decode tiling; 'auto' picks spatial-only and "
                        "leaves temporal off, which is what blows up on long "
                        "clips")
    p.add_argument("--tag", default="")
    # Chaining: anchor frame 0 of this segment on the last frame of the previous
    # one, so several short renders join into one continuous long clip. A single
    # 473-frame pass thrashed swap at 7.9GB/min on a 128GB box (2026-08-26);
    # segments are the only way to get real length at this resolution.
    p.add_argument("--from-image", default=None,
                   help="PNG to start this segment from (previous segment's "
                        "last frame)")
    p.add_argument("--image-strength", type=float, default=0.95,
                   help="how hard frame 0 is pinned to --from-image")
    a = p.parse_args()

    if a.level not in SCENES:
        sys.exit(f"no scene prompt for level {a.level}")
    w, h = (int(x) for x in a.res.split("x"))
    if w % 32 or h % 32:
        sys.exit(f"--res must be multiples of 32; got {w}x{h}")

    # LTX-2 samples on an (N*8+1) frame grid.
    n = max(9, int(a.seconds * a.fps))
    n = ((n - 1) // 8) * 8 + 1
    seed = a.seed if a.seed is not None else 7000 + a.level

    out_dir = Path(a.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    tag = f"_{a.tag}" if a.tag else ""
    out = out_dir / f"level{a.level}_{int(n/a.fps)}s_{w}x{h}_s{seed}{tag}.mp4"

    cmd = [
        str(MLX_PY), "-m", "mlx_video.models.ltx_2.generate",
        "--model-repo", MODEL_REPO,
        "--prompt", SCENES[a.level] + LOCKED,
        "--negative-prompt", NEGATIVE,
        "--pipeline", a.pipeline,
        "--width", str(w), "--height", str(h),
        "--num-frames", str(n), "--fps", str(a.fps),
        "--steps", str(a.steps), "--cfg-scale", str(a.cfg_scale),
        "--seed", str(seed),
        "--tiling", a.tiling,
        "--output-path", str(out), "--verbose",
    ]
    if a.from_image:
        cmd += ["--image", a.from_image,
                "--image-strength", str(a.image_strength)]
    env = dict(os.environ, HF_HUB_DISABLE_XET="1")

    print(f"[scene] level {a.level}  {w}x{h}  {n}f @ {a.fps}fps "
          f"({n/a.fps:.1f}s)  pipeline={a.pipeline}  seed={seed}", flush=True)
    print(f"[scene] -> {out}", flush=True)

    # Song Forge keeps a permanent seat on this box; ask the guard for the rest
    # instead of loading 19B straight into RAM and pushing a customer to swap.
    lease = None
    try:
        from mem_client import acquire, release
        lease = acquire("hive-ltx2-render", a.mem_gb, timeout=1800, ttl=36000)
        print(f"[scene] memory lease {lease}", flush=True)
    except Exception as e:
        print(f"[scene] forge_guard unavailable ({e}); proceeding", flush=True)
        release = None

    t0 = time.time()
    try:
        rc = subprocess.run(cmd, env=env).returncode
    finally:
        if lease and release:
            try:
                release(lease)
            except Exception:
                pass

    el = time.time() - t0
    if rc != 0 or not out.exists():
        sys.exit(f"[scene] FAILED rc={rc} after {el:.0f}s")
    print(f"[scene] done in {el:.0f}s ({el/60:.1f} min) -> {out}", flush=True)
    print(f"[scene] {el/n:.2f}s per frame", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
