#!/bin/bash
cd ~/Desktop/PROJECTS/hive-strike/art/clip
# directional scenes: traffic, lava, falling and flowing water -- these must never run backwards
for N in 2 4 5 6 9 10 11 13 15; do
  RAW=$(ls -t v${N}_*.mp4 2>/dev/null | head -1); [ -z "$RAW" ] && continue
  echo "=== level$N"
  python3 ~/Desktop/PROJECTS/hive-strike/tools/seamless_loop.py "$RAW" "level$N.mp4"
done
echo RELOOP_DONE
