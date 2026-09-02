#!/usr/bin/env python3
"""Photoreal bug + boss sprites with local Flux: each rendered top-down on pure white, then keyed to alpha PNGs in art/sprites/."""
import os, subprocess, sys, time, urllib.request
sys.path.insert(0, os.path.expanduser("~/SongForgeM5"))
from mem_client import reserve
import numpy as np
from PIL import Image, ImageFilter
ART=os.path.expanduser("~/Desktop/PROJECTS/hive-strike/art/sprites"); os.makedirs(ART, exist_ok=True)
RAW=os.path.join(ART,"raw"); os.makedirs(RAW, exist_ok=True)
COMFY_DIR=os.path.expanduser("~/Desktop/PROJECTS/AI/ComfyUI")
STYLE=("the insect is oriented with its HEAD pointing toward the BOTTOM of the frame and its abdomen toward the top, head-on toward the viewer, mandibles and eyes clearly at the bottom, photorealistic macro photograph, top-down view from directly above, the whole insect centered and fully visible, "
       "isolated on a pure white background, soft studio lighting, sharp focus, high detail, no shadow, no text, ")
BUGS={
 "fly":"a common house fly with translucent wings spread and big red compound eyes",
 "mosquito":"a mosquito with long thin legs and a needle proboscis",
 "wasp":"a yellow and black paper wasp with a narrow waist, wings spread",
 "beetle":"an iridescent purple scarab beetle",
 "moth":"a tan and brown moth with feathered antennae and patterned wings spread",
 "gnat":"a tiny grey gnat",
 "ant":"a red fire ant",
 "ladybug":"a red seven-spotted ladybug",
 "firefly":"a firefly beetle with a glowing yellow-green tail",
 "dragon":"a blue dragonfly with four long transparent wings spread wide",
 "grasshopper":"a green grasshopper with big folded hind legs",
 "stinkbug":"a brown mottled shield-shaped stink bug",
 "hornet":"an orange and dark brown hornet with wings spread",
 "cicada":"a cicada with large clear veined wings folded over a dark body and red eyes",
 "butterfly":"an orange monarch butterfly with wings spread",
 "spiderling":"a small grey jumping spider",
 "snail":"a garden snail with a spiral brown shell",
 "earwig":"a brown earwig with pincers at the tail",
 "katydid":"a green katydid that looks like a leaf, long antennae",
 "strider":"a water strider with very long thin legs",
 "weevil":"a brown weevil with a long curved snout",
 "glowworm":"a glowworm larva with glowing green tail segments",
 "termite":"a pale cream termite worker",
 "horsefly":"a large dark horsefly with big green iridescent eyes",
 "dungbeetle":"a black dung beetle pushing a round dung ball",
 "leafcutter":"a leafcutter ant carrying a piece of green leaf",
 "morpho":"a blue morpho butterfly with iridescent blue wings spread",
 "harlequin":"a harlequin beetle with very long front legs and red-black patterned shell",
 "cavecricket":"a pale tan cave cricket with very long legs and antennae",
 "millipede":"a dark brown millipede coiled slightly, many legs",
 "whipscorpion":"a whip scorpion (vinegaroon) with long whip tail and pincers",
 "stonefly":"a grey stonefly with folded flat wings and two tail filaments",
 "apollo":"an apollo butterfly, white wings with red eyespots, spread",
 "snowflea":"a tiny dark springtail snow flea",
 "sandhopper":"a sand hopper amphipod, curled grey-brown body",
 "isopod":"a grey sea slater isopod with segmented armor",
 "shorefly":"a small shiny green shore fly",
 "lavacricket":"a black lava cricket with orange highlights",
 "ashmoth":"a grey ash-colored moth with dusty wings spread",
 "blisterbeetle":"a metallic green blister beetle",
 "scorpionfly":"a snow scorpionfly with a curled scorpion-like tail",
 "iceworm":"a small dark ice worm",
 "woollybear":"a fuzzy orange and black woolly bear caterpillar",
 "cockroach":"a shiny brown cockroach with long antennae",
 "silverfish":"a silverfish insect, dark slate-grey body covered in shiny metallic silver scales, three long tail bristles, long antennae, high contrast",
 "bedbug":"a flat reddish-brown bed bug",
 "glasswing":"a glasswing butterfly with transparent wings spread",
 "jewelwasp":"a metallic emerald jewel wasp",
 "lanternbug":"a lantern bug with a long colorful snout and patterned wings",
 "midge":"a tiny grey midge","aphid":"a tiny green aphid","thrips":"a tiny slender yellow thrips","fruitfly":"a tiny tan fruit fly with red eyes",
 "sandfly":"a tiny hairy sand fly","blackfly":"a tiny black fly","whitefly":"a tiny white whitefly with powdery wings","springtail":"a tiny purple springtail",
 "leafhopper":"a tiny green leafhopper","fungusgnat":"a tiny dark fungus gnat","mayfly":"a tiny pale mayfly with long tails","noseeum":"a tiny grey biting midge",
 "psyllid":"a tiny golden psyllid","lacebug":"a tiny lace bug with lacy transparent wings","planthopper":"a tiny blue planthopper","crystalmite":"a tiny violet mite",
 "hoverfly":"a hoverfly with yellow and black bands that mimic a wasp, huge eyes, two clear wings spread",
 "rosechafer":"a metallic green rose chafer beetle with a bronze sheen, wing cases closed",
 "divingbeetle":"a great diving beetle, dark olive oval body with a yellow rim, hind legs like oars",
 "tigermoth":"a garden tiger moth with brown-and-cream patterned forewings and bright orange hindwings with blue-black spots, wings spread",
 "lunamoth":"a pale green luna moth with long curved tails on its hindwings and feathered antennae, wings spread",
 "damselfly":"a slender electric blue damselfly with clear wings held together over its back",
 "antlion":"an antlion larva with a fat sandy bristled body and huge curved sickle jaws",
 "rhinobeetle":"a rhinoceros beetle with a huge curved black horn and glossy dark armor",
 "assassinbug":"a wheel bug assassin bug, grey armored body with a cog-shaped crest on its back and a curved beak",
 "jewelbeetle":"a metallic rainbow jewel beetle, elongated body shimmering green, gold and violet",
}
BOSS_STYLE=("the insect is oriented with its HEAD pointing toward the BOTTOM of the frame and its abdomen toward the top, head-on toward the viewer, mandibles and eyes clearly at the bottom, extremely detailed photorealistic macro photograph, 8k, top-down view from directly above, the whole creature centered and fully visible, "
       "isolated on a pure white background, dramatic rim lighting, every hair and armor plate visible, sharp focus, menacing aggressive pose, "
       "glowing eyes, no text, no shadow, ")
BOSSES={
 "centihead":"the head of a giant red centipede seen from directly above, a FLAT WEDGE-SHAPED head plate, two very long thin antennae sweeping forward, a pair of large curved venomous forcipule fangs either side of the mouth, glossy dark red armor, the first three body segments behind it with jointed legs, glowing eyes",
    "centiseg":"ONE single isolated segment cut from the body of a giant red centipede, photographed from directly above on a pure white background, a single dark red glossy armored plate with exactly one pair of long jointed orange legs, one leg going left and one going right, nothing else in frame",
    "boss0":"a huge menacing hornet queen with a crown of golden spikes, wings spread, fierce glowing red eyes",
 "boss1":"a huge menacing green praying mantis, triangular head with big eyes, long thorax, two raised barbed grasping forelegs held up in front, folded wings, glowing red eyes",
 "boss2":"a huge menacing black orb weaver spider with a red hourglass marking and glowing red eyes",
 "boss3":"a huge menacing metallic blue dragonfly with four long wings spread and glowing eyes",
 "boss4":"a huge menacing stag beetle with enormous antler-like jaws and a dark armored shell, glowing eyes",
 "boss5":"a huge menacing red centipede coiled, many legs, glowing eyes",
 "boss6":"a huge menacing mosquito matriarch with a long needle proboscis and huge wings, glowing red eyes",
 "boss7":"a huge menacing desert scorpion king with raised pincers and a curled stinger tail, armored, glowing eyes",
 "boss8":"a huge menacing giant walking stick insect, long twig-like green-brown body and spiny legs stretched wide, glowing eyes",
 "boss9":"a huge menacing giant cave glowworm larva, segmented dark blue armored body with thin electric blue light lines along its back, crisp hard edges, NO glow around the body, NO light bloom, NO aura, NO haze, glowing eyes",
 "boss10":"a huge menacing ice-white weta cricket with spiny legs and frost on its armor, glowing eyes",
 "boss11":"a huge menacing horseshoe crab with a spiked shell and long tail spine, glowing eyes",
 "boss12":"a huge menacing fire ant queen glowing with heat, huge jaws, embers, glowing eyes",
 "boss13":"a huge menacing glacier earwig, armored icy blue body with enormous rear pincers raised, frost on its shell, glowing eyes",
 "boss14":"a huge menacing dobsonfly with enormous curved mandibles and long lacy veined wings spread wide, glowing eyes",
 "boss15":"a huge menacing atlas moth with vast patterned wings, snake-head wingtips, glowing violet and copper scales, glowing eyes",
}
def comfy_up():
    try: urllib.request.urlopen("http://127.0.0.1:8188/system_stats", timeout=3); return True
    except Exception: return False
def gen(prompt, out, seed, size):
    r=subprocess.run([sys.executable, os.path.expanduser("~/Scripts/flux_t2i.py"), prompt, "--out", out, "--w", str(size), "--h", str(size), "--seed", str(seed)], capture_output=True, text=True, timeout=900)
    return os.path.exists(out)
def key_white(src, dst):
    """Pull the insect off its white studio background.

    The previous matte derived alpha from `saturated OR dark`, which works for a beetle and
    destroys a pale one: the ice weta is cream on white, so it scored near zero saturation
    and near zero darkness, its body was keyed away, and the unpremultiply drove what was
    left to black. You could see the level through the boss.

    Alpha here comes from three signals, whichever is strongest: colour, darkness, and
    TEXTURE. An insect carries fine detail at pixel scale; the studio backdrop and its soft
    drop shadow are smooth. Texture is what saves a pale bug. Whatever survives is then
    checked against a flood from the frame border through paper-white, so any genuinely
    empty region still gets cleared.
    """
    import numpy as np
    from scipy import ndimage
    im = Image.open(src).convert("RGB")
    q = np.asarray(im).astype(np.float32)
    mx = q.max(axis=2); mn = q.min(axis=2); lum = q.mean(axis=2)
    sat = mx - mn
    # local contrast: std of luminance in a small window, which the backdrop simply does not have
    m1 = ndimage.uniform_filter(lum, 5)
    m2 = ndimage.uniform_filter(lum * lum, 5)
    tex = np.sqrt(np.maximum(m2 - m1 * m1, 0))
    a = np.maximum.reduce([
        np.clip((sat - 14.0) / 26.0, 0, 1),
        np.clip((140.0 - lum) / 55.0, 0, 1),
        np.clip((tex - 2.5) / 5.0, 0, 1),
    ])
    # clear anything the outside can still reach through paper-white
    passable = (a < 0.25) & (mn >= 200)
    lab, n = ndimage.label(passable)
    if n:
        edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
        if edge:
            a[np.isin(lab, list(edge))] = 0.0
    # close pinholes so no bug ends up with the level showing through its own body
    solid = a > 0.55
    a[ndimage.binary_fill_holes(solid) & ~solid] = 1.0
    a = ndimage.gaussian_filter(a, 0.6)
    a3 = a[..., None]
    with np.errstate(divide="ignore", invalid="ignore"):
        rgb = (q - 255.0 * (1.0 - a3)) / np.where(a3 > 0.02, a3, 1.0)
    out = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), a * 255.0]).astype(np.uint8), "RGBA")
    aa = np.asarray(out)[..., 3]
    rows = np.where(aa.max(axis=1) > 12)[0]; cols = np.where(aa.max(axis=0) > 12)[0]
    if len(rows) and len(cols):
        out = out.crop((max(0, cols.min() - 6), max(0, rows.min() - 6),
                        min(out.width, cols.max() + 7), min(out.height, rows.max() + 7)))
    out.save(dst)

if os.environ.get("REKEY"):
    for f in sorted(os.listdir(RAW)):
        if f.endswith(".png") and not f.startswith("boss"):
            key_white(os.path.join(RAW,f), os.path.join(ART,f)); print("rekeyed",f,flush=True)
    sys.exit(0)
with reserve("flux-sprites", int(os.environ.get("RESERVE_GB","34"))):
    started=False
    if not comfy_up():
        subprocess.Popen(["bash","start.sh"],cwd=COMFY_DIR,stdout=open("/tmp/comfy_hive.log","w"),stderr=subprocess.STDOUT); started=True
        for _ in range(120):
            if comfy_up(): break
            time.sleep(2)
    seed=70_000
    only=os.environ.get("ONLY","").split(",") if os.environ.get("ONLY") else None
    for name,desc in list(BUGS.items())+list(BOSSES.items()):
        seed+=1
        if only and name not in only: continue
        dst=os.path.join(ART,name+".png")
        if os.path.exists(dst) and not os.environ.get("FORCE"): continue
        raw=os.path.join(RAW,name+".png")
        size=1024
        prompt=BOSS_STYLE+desc
        ok=os.path.exists(raw) and not os.environ.get("FORCE")   # a raw render already on disk only needs keying
        if not ok: ok=gen(prompt, raw, seed, size)
        if not ok: ok=gen(prompt, raw, seed+500, size)
        if ok: key_white(raw,dst); print(name,"ok",flush=True)
        else: print(name,"FAILED",flush=True)
    if started: subprocess.run("lsof -ti :8188 | xargs kill 2>/dev/null", shell=True)
print("SPRITES DONE",flush=True)
