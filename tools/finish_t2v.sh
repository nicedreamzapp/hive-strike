#!/bin/bash
# Slow each generated scene to ~14s with motion interpolation, then crossfade it into a seamless loop.
cd ~/Desktop/PROJECTS/hive-strike/art/clip
for N in $(seq 1 16); do
  RAW=$(ls -t v${N}_*.mp4 2>/dev/null | head -1)
  [ -z "$RAW" ] && continue
  [ -f "level$N.mp4" ] && [ "level$N.mp4" -nt "$RAW" ] && continue
  ffmpeg -y -loglevel error -i "$RAW" -vf "setpts=2.6*PTS,minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:vsbmc=1" \
    -an -c:v libx264 -pix_fmt yuv420p -crf 21 "/tmp/s$N.mp4" 2>/dev/null
  [ -f "/tmp/s$N.mp4" ] || continue
  D=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "/tmp/s$N.mp4")
  END=$(python3 -c "print(round(max(0.1,$D-2.0),3))"); OFF=$(python3 -c "print(round(max(0.1,$D-4.0),3))")
  ffmpeg -y -loglevel error -i "/tmp/s$N.mp4" -filter_complex \
    "[0:v]split[a][b];[a]trim=0:$END,setpts=PTS-STARTPTS[main];[b]trim=$END:$D,setpts=PTS-STARTPTS[tail];[main][tail]xfade=transition=fade:duration=2.0:offset=$OFF[v]" \
    -map "[v]" -an -c:v libx264 -pix_fmt yuv420p -crf 21 -movflags +faststart "level$N.mp4" 2>/dev/null
  [ -f "level$N.mp4" ] || cp "/tmp/s$N.mp4" "level$N.mp4"
  rm -f "/tmp/s$N.mp4"
  echo "level$N live $(ffprobe -v quiet -show_entries format=duration -of csv=p=0 level$N.mp4)s $(date +%H:%M:%S)"
done
