#!/bin/bash
cd ~/Desktop/PROJECTS/hive-strike
CLIP=art/clip
for N in $(seq 1 16); do
  [ -f "$CLIP/level$N.mp4" ] && { echo "level$N already done"; continue; }
  echo "=== level$N rendering $(date +%H:%M:%S) ==="
  python3 tools/clip_one.py "$N" >/dev/null 2>&1
  RAW=$(ls -t $CLIP/lv${N}_ltxL_*.mp4 2>/dev/null | head -1)
  if [ -z "$RAW" ]; then echo "level$N FAILED"; continue; fi
  DUR=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$RAW")
  XF=0.7
  OFF=$(python3 -c "print(max(0.1,$DUR-2*$XF))")
  END=$(python3 -c "print(max(0.1,$DUR-$XF))")
  ffmpeg -y -loglevel error -i "$RAW" -filter_complex \
    "[0:v]split[a][b];[a]trim=0:$END,setpts=PTS-STARTPTS[main];[b]trim=$END:$DUR,setpts=PTS-STARTPTS[tail];[main][tail]xfade=transition=fade:duration=$XF:offset=$OFF[v]" \
    -map "[v]" -an -c:v libx264 -pix_fmt yuv420p -crf 22 -movflags +faststart "$CLIP/level$N.mp4" 2>/dev/null
  [ -f "$CLIP/level$N.mp4" ] || ffmpeg -y -loglevel error -i "$RAW" -an -c:v libx264 -pix_fmt yuv420p -crf 22 -movflags +faststart "$CLIP/level$N.mp4"
  echo "level$N ok $(date +%H:%M:%S)"
done
echo "CLIPS DONE"
