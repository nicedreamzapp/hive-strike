# Matt feedback, 2026-08-24 11:20p (relayed from his other Claude terminal)

## 1. Background animations: scene-specific motion, no dot flashes
- the "little dot flashes" on every screen are NOT animation and he does not want them on any scene
- every background needs obvious motion that belongs to that scene:
  - volcano: the lava itself moving/flowing
  - water scenes: water shimmering or moving
  - rooftop/city: cars moving in the streets, apartment window lights flickering, street lights coming on
  - meadow/forest: leaves moving in the trees, bits of wind, clouds drifting
  - every other level: whatever that scene's obvious natural motion is
- drop the generic sparkle/dot layer everywhere, replace with per-scene motion of real scene elements

## 2. Bosses: each boss should be a DIFFERENT bug type
- he saw a couple of hornets among the boss renders (maybe still in progress)
- the world has tons of bug types, so no two bosses should be the same species
- re-roll any duplicates so all 16 bosses are distinct bugs

## DONE — 2026-08-24 11:50p (applied from Matt's other Claude session)
- ambient() rewritten: the fixed-position twinkle array (TW) is GONE. every world now gets motion
  of its own scene elements. verified by pixel-diffing the background 50 frames apart on all 16
  levels: every level now changes 1.4%-11.3% of background pixels (was ~0 real movement).
- bosses renamed + re-rendered so no two are the same bug:
  boss8 GOLIATH BEETLE -> GIANT WALKING STICK, boss9 CAVE WIDOW -> CAVE GLOWWORM,
  boss13 FROST MANTIS -> GLACIER EARWIG, boss14 GIANT HORNET -> DOBSONFLY,
  boss15 JEWEL SCARAB -> ATLAS MOTH. prompts updated in tools/gen_sprites.py too.
- full 16-level walkthrough passes, WON screen reached, 0 JS errors, 0.16 ms/frame.
