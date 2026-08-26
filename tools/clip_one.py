#!/usr/bin/env python3
"""Render ONE level's animated loop under a forge_guard lease.
exec so the LTX process itself is the leased pid -- unleased renders get killed at the VAE step,
which is why the first batch sampled fine and then vanished without writing a file."""
import os, sys

n = int(sys.argv[1])
ART = os.path.expanduser("~/Desktop/PROJECTS/hive-strike/art")
OUT = os.path.join(ART, "clip"); os.makedirs(OUT, exist_ok=True)
PY  = os.path.expanduser("~/Desktop/PROJECTS/AI/ComfyUI/venv/bin/python")
BIN = os.path.expanduser("~/Desktop/PROJECTS/story-forge/bin/make-ltx-lightricks")
NEG = ("camera movement, camera zoom, zoom in, zoom out, push in, dolly, pan, tilt, tracking shot, "
       "moving camera, scale change, the frame changes, insects, bugs, flying creatures, birds, people, text, "
       "worst quality, inconsistent motion, blurry, jittery, distorted, low quality, deformed, morphing")
STYLE = (". the camera is locked off on a tripod and never moves, the framing is identical in every frame, "
         "nothing zooms, only the things inside the scene move. photoreal, natural motion. ")
SCENES = {
 1:  "the leaves on the tree flutter and shake, the branches bend and spring back, blades of grass bend over and straighten, red poppies and white daisies nod on their stems, waves of wind run across the meadow grass in the distance, the hanging hive swings slightly on its branch",
 2:  "water falls from the fountain and the basin surface ripples outward, the hedge leaves quiver, the rose blooms nod on their stems, the topiary shivers in the breeze",
 3:  "the pond surface ripples continuously and the reflections wobble, the lily pads rock gently on the water, the reeds along the banks bend and sway, small rings spread across the water",
 4:  "the apple tree leaves rustle and flicker on both rows, the grass in the lane bends in the wind, a couple of apples let go of the branches and fall to the ground",
 5:  "the pine branches sway slowly, the spider web trembles and flexes in the breeze, the mushroom caps brighten and dim as they glow, mist creeps slowly between the trunks",
 6:  "warm light travels along the honeycomb walls, honey glistens and slides slowly down the wax, a couple of slow honey drips fall",
 7:  "the swamp water ripples and the reflections wobble on it, mist drifts sideways between the tree trunks, the cattails and reeds bend, the duckweed shifts on the surface",
 8:  "sand streams off the crest of each dune in the wind, the ripple lines on the sand shift and travel, heat shimmers above the far horizon",
 9:  "the big leaves flutter and turn, the hanging vines swing gently, the orchid blooms nod, the shafts of light brighten and dim through the canopy",
 10: "the stream water flows over the rocks with a visible current, glints on the surface travel downstream, drips fall from the ceiling into the pool and spread rings",
 11: "the alpine flowers and grasses bend and spring back in the wind, waves ripple through the tall grass, sunlight glints travel across the meadow, haze drifts by the snow peaks",
 12: "the waves roll in and break, foam slides up the wet sand and retreats, glints move across the water surface, seaweed sways underwater, the rocks stay completely still",
 13: "the molten lava flows along the crack with a visible current, its crust glowing brighter and dimmer as it moves, heat shimmers above it, the cracked ground stays completely still",
 14: "the slabs of ice rock and drift slowly on the water, the meltwater between them ripples, glints of light slide across the ice",
 15: "cars move along the city street, their headlights and tail lights travelling, lit windows switch on and off in the buildings, the sunset glow shifts at the end of the street",
 16: "the water on the chasm floor ripples with glints travelling across it, curtains of northern lights ripple slowly across the sky above, the crystal glow pulses, the walls stay still",
}
os.execv(PY, [PY, BIN, "--i2v", os.path.join(ART, f"level{n}.png"),
                  "--duration", "2", "--res", "512x768", "--seed", str(4200 + n),
              "--label", f"t{n}", "--out-dir", OUT, "--negative-prompt", NEG, "--cond-strength", "1.0", SCENES[n] + STYLE])
