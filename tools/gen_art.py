#!/usr/bin/env python3
"""Generate Hive Strike level backgrounds + splash with local Flux (ComfyUI), one consistent style.
Runs under a forge_guard lease, starts ComfyUI if it is down, and shuts it down afterwards."""
import os, subprocess, sys, time, urllib.request
sys.path.insert(0, os.path.expanduser("~/SongForgeM5"))
from mem_client import reserve

ART = os.path.expanduser("~/Desktop/PROJECTS/hive-strike/art"); os.makedirs(ART, exist_ok=True)
COMFY_DIR = os.path.expanduser("~/Desktop/PROJECTS/AI/ComfyUI")
W, H = 832, 1248   # 2:3 = the 480x720 play field

STYLE = ("semi-realistic digital matte painting, natural photoreal textures, painterly but believable, warm golden-hour lighting, "
         "soft atmospheric depth, high-angle bird's-eye view looking down at the ground, wide open space in the middle, "
         "no characters, no text, no letters, portrait orientation, ")
SCENES = {
 "level1": "sunny wildflower meadow seen from above, rolling green hills, a winding dirt path, daisies and poppies, "
           "a big papery hornet nest hanging from an oak branch in one corner with a few angry hornets buzzing around it",
 "level2": "sunset rose garden seen from above, clipped hedges, stone fountain, wooden trellis with climbing roses, "
           "warm orange and pink evening light, a praying mantis shaped topiary bush casting a long shadow",
 "level3": "calm blue pond seen from above, lily pads with white lotus flowers, tall reeds and cattails, "
           "ripples on the water, a large dragonfly shadow on the surface, cool teal palette",
 "level4": "autumn apple orchard seen from above, rows of trees with red apples, fallen leaves and apples on amber grass, "
           "an old hollow log with a huge stag beetle horn shape carved into the bark",
 "level5": "moonlit night forest seen from above, dark pine trees, glowing blue and purple mushrooms, fireflies, "
           "a giant dew-covered spider web strung between the trees glistening in moonlight, deep blue palette",
 "level7": "misty swamp seen from above, dark still water, cattails, lily pads, gnarled cypress roots, drifting fog, empty scenery only, no insects, no bugs, no animals, "
           "a giant mosquito silhouette looming in the mist, muted green and grey palette",
 "level8": "desert sand dunes at sunset seen from above, rippled sand, a few cactus and scattered rocks, scorpion tracks in the sand, "
           "warm orange and gold light, long shadows",
 "level9": "rainforest canopy seen from above, giant leaves, hanging vines, orchids, shafts of humid light, a huge goliath beetle silhouette on a branch, empty scenery only, no insects, no bugs, no animals, ",
 "level10": "deep cave seen from above, wet stone floor, stalagmites, glowing blue fungus, a trickle of underground water, a giant spider web in the dark",
 "level11": "alpine mountain meadow seen from above, patches of snow, grey rock, edelweiss and tiny wildflowers, thin cold light",
 "level12": "rocky tide pool at the beach seen from above, clear shallow water, sea anemones, kelp, wet sand, a horseshoe crab shape in the sand",
 "level13": "volcanic ash field seen from above, black cracked ground, glowing orange lava cracks, drifting embers, hot haze",
 "level14": "frozen tundra seen from above, blue ice, snow drifts, frost patterns, pale low sun, a frozen insect in the ice, empty scenery only, no insects, no bugs, no animals, ",
 "level15": "city rooftop at dusk seen from above, tar roof, air vents, a water tower, neon glow from the street below, a giant hornet nest under an eave",
 "level16": "crystal cavern seen from above, glowing purple and teal crystals, still mirror pool, sparkling mineral floor, magical light",
 "level6": "inside a giant beehive seen from above, amber honeycomb wax cells, dripping golden honey, "
           "dark centipede tunnels bored through the comb, warm gold and brown palette",
}
SPLASH = ("epic video game title splash art, bold cel-shaded storybook illustration, rich saturated colors, "
          "a calm serious heroic cartoon honeybee hero flying toward the viewer, steady focused eyes, closed mouth, "
          "composed and brave like a quiet guardian, no anger, no snarl, no grin, upright confident posture, wings blurred with speed, "
          "behind it looming menacing silhouettes of six giant insect villains: a crowned hornet queen, a praying mantis, "
          "a dragonfly, a horned stag beetle, an orb weaver spider and a centipede, dramatic golden sunset light, "
          "highly detailed, intricate fur and wing texture, rich lighting, cinematic depth, richly rendered environment with flowers and grass, "
          "empty sky space at the top for a title, no text, no letters, portrait orientation")

def comfy_up():
    try:
        urllib.request.urlopen("http://127.0.0.1:8188/system_stats", timeout=3); return True
    except Exception:
        return False

def gen(prompt, out, seed):
    r = subprocess.run([sys.executable, os.path.expanduser("~/Scripts/flux_t2i.py"), prompt, "--out", out,
                        "--w", str(W), "--h", str(H), "--seed", str(seed)], capture_output=True, text=True, timeout=900)
    print(out, "->", (r.stdout.strip() or r.stderr.strip())[-200:], flush=True)

with reserve("flux-hive-art", 34):
    started = False
    if not comfy_up():
        subprocess.Popen(["bash", "start.sh"], cwd=COMFY_DIR, stdout=open("/tmp/comfy_hive.log", "w"), stderr=subprocess.STDOUT)
        started = True
        for _ in range(120):
            if comfy_up(): break
            time.sleep(2)
        else:
            sys.exit("ComfyUI did not come up")
    seed = 42_000
    if os.environ.get("ONLY_KEYS"):
        for i, name in enumerate(os.environ["ONLY_KEYS"].split(",")):
            gen(STYLE + SCENES[name], os.path.join(ART, name + ".png"), int(os.environ.get("SEED","61000")) + i)
    elif os.environ.get("ONLY_LEVELS"):
        seed = 52_000
        for name, scene in SCENES.items():
            gen(STYLE + scene, os.path.join(ART, name + "_real.png"), seed); seed += 1
    elif os.environ.get("ONLY_SPLASH"):
        for i, sd in enumerate([9_001, 9_002, 9_003]):
            gen(SPLASH, os.path.join(ART, f"splash_hd_{'abc'[i]}.png"), sd)
    else:
        for name, scene in SCENES.items():
            gen(STYLE + scene, os.path.join(ART, name + ".png"), seed); seed += 1
        gen(SPLASH, os.path.join(ART, "splash.png"), seed)
    if started:
        subprocess.run("lsof -ti :8188 | xargs kill 2>/dev/null", shell=True)
print("ALL DONE", flush=True)
