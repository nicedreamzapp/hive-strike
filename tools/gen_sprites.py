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
 "dragon":"a large blue dragonfly seen from directly above filling the frame: four long transparent veined wings spread wide to the sides, a long slender blue and black striped abdomen, huge compound eyes",
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
 "glowworm":"a glowworm larva: a long flat segmented wingless insect larva shaped like a worm or a flattened centipede, dark brown armored plates along its back, six tiny legs at the front, the last few tail segments glowing bright yellow-green, NO wing cases, NOT a beetle shape",
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
 "snowflea":"a snow flea springtail: a tiny plump soft-bodied insect with a rounded charcoal-grey body like a small grub, matte skin, exactly six short legs, two short antennae, a forked spring tail folded under the belly, evenly lit on a plain pure white background with no coloured light and no blue glow, an insect with six legs, not a spider, not a beetle, no shiny wing cases",
 "sandhopper":"a sand hopper amphipod, curled grey-brown body",
 "isopod":"a sea slater woodlouse, a pill bug roly-poly seen from directly above: a grey oval body made of many overlapping curved armor plates across its back like a tiny armadillo, seven pairs of small legs along the sides, two long antennae, a crustacean, not a beetle, no wing cases",
 "shorefly":"a small shiny green shore fly",
 "lavacricket":"a lava cricket, a field cricket seen from above: black body with orange highlights, exactly six legs with two very large folded hind jumping legs, two very long thin antennae, a cricket insect, not a spider",
 "ashmoth":"a grey ash-colored moth with dusty wings spread",
 "blisterbeetle":"a metallic green blister beetle",
 "scorpionfly":"a snow scorpionfly with a curled scorpion-like tail",
 "iceworm":"an ice worm, an earthworm-like annelid worm: a thin smooth segmented tube body with no legs, no head shell, no antennae, no wings, dark translucent blue-black, curled in a gentle S shape, a worm and nothing else",
 "woollybear":"a woolly bear caterpillar seen from above: a long tubular segmented caterpillar body, thickly covered in short stiff bristles, black bristles at both ends and rust-orange bristles in the middle band, a tiny dark head at one end, rows of tiny prolegs, a caterpillar larva, not a beetle, not a bee, no wings",
 "cockroach":"a shiny brown cockroach with long antennae",
 "silverfish":"a silverfish: a wingless flat teardrop-shaped insect that tapers to the tail, covered in shiny metallic silver scales, three long tail bristles fanning out behind, two long antennae in front, NOT a beetle, no wing cases",
 "bedbug":"a flat reddish-brown bed bug",
 "glasswing":"a glasswing butterfly with wings spread flat: the wing membranes are completely transparent like clear glass so the pure white background shows straight through them, only thin dark brown wing edges and veins and a small orange tint at the edge remain visible, slim dark body, delicate",
 "jewelwasp":"a metallic emerald jewel wasp",
 "lanternbug":"a lantern bug with a long colorful snout and patterned wings",
 "midge":"a midge: a tiny delicate grey two-winged fly with feathery plumed antennae and long thin legs, mosquito-like, NOT a spider","aphid":"a green aphid, a tiny soft-bodied pear-shaped plant louse: a plump translucent pale green teardrop abdomen, small head, two long thin antennae, six thin legs, two tiny tube-like horns at the rear, no hard shell, no wing cases, not a beetle","thrips":"a tiny slender yellow thrips","fruitfly":"a tiny tan fruit fly with red eyes",
 "sandfly":"a tiny hairy sand fly","blackfly":"a tiny black fly","whitefly":"a whitefly: a tiny moth-like insect with powdery pure white wings held like a roof over a pale yellow body, white all over, tiny red eyes","springtail":"a springtail, a tiny insect with a soft plump rounded purple body like a little grub, exactly six short legs, two short antennae, a forked spring tail folded under the belly, an INSECT with six legs, absolutely not a spider, no eight legs",
 "leafhopper":"a tiny green leafhopper","fungusgnat":"a fungus gnat: a tiny delicate dark mosquito-like fly with very long thin legs, long antennae and one pair of smoky grey wings, NOT an ant","mayfly":"a mayfly: a slender pale insect with two large clear upright wings and two very long thin tail filaments trailing behind, tiny legs","noseeum":"a biting midge: a tiny two-winged fly like a very small mosquito, slender grey body, long thin legs, two narrow clear wings, small head, NOT a spider",
 "psyllid":"a psyllid: a tiny golden cicada-like jumping plant louse with clear wings held like a roof over its body, strong hind legs, NOT a spider","lacebug":"a lace bug: a tiny flat insect whose wings and hood are made of delicate lacy see-through netting like white lace, tiny dark body underneath","planthopper":"a planthopper: a tiny wedge-shaped blue bug with wings held like a tent over its body, a pointed head and strong jumping hind legs, NOT a beetle","crystalmite":"a tiny violet mite",
 "hoverfly":"a hoverfly with yellow and black bands that mimic a wasp, huge eyes, two clear wings spread",
 "rosechafer":"a metallic green rose chafer beetle with a bronze sheen, wing cases closed",
 "divingbeetle":"a great diving beetle, dark olive oval body with a yellow rim, hind legs like oars",
 "tigermoth":"a garden tiger moth with brown-and-cream patterned forewings and bright orange hindwings with blue-black spots, wings spread",
 "lunamoth":"a pale green luna moth with long curved tails on its hindwings and feathered antennae, wings spread",
 "damselfly":"a slender electric blue damselfly with clear wings held together over its back",
 "antlion":"an antlion larva: a fat oval sandy-brown bristled grub with a flat head and two enormous curved sickle-shaped jaws pointing forward, six short legs, NOT a spider",
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
    seed=70_000+int(os.environ.get('SEED_OFFSET','0'))
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
