#!/bin/bash
# Slow every rendered level loop to ~16s and crossfade it into itself so it loops seamlessly.
cd ~/Desktop/PROJECTS/hive-strike/art/clip
for N in $(seq 1 16); do
  RAW=$(ls -t lv${N}_ltxL_*.mp4 2>/dev/null | head -1)
  [ -z "$RAW" ] && { echo "level$N no raw"; continue; }
  ffmpeg -y -loglevel error -i "$RAW" -vf "setpts=3.6*PTS,minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:vsbmc=1" \
    -an -c:v libx264 -pix_fmt yuv420p -crf 22 "/tmp/slow$N.mp4" 2>/dev/null
  [ -f "/tmp/slow$N.mp4" ] || { echo "level$N slow FAILED"; continue; }
  D=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "/tmp/slow$N.mp4")
  XF=2.0
  END=$(python3 -c "print(round(max(0.1,$D-$XF),3))")
  OFF=$(python3 -c "print(round(max(0.1,$D-2*$XF),3))")
  ffmpeg -y -loglevel error -i "/tmp/slow$N.mp4" -filter_complex \
    "[0:v]split[a][b];[a]trim=0:$END,setpts=PTS-STARTPTS[main];[b]trim=$END:$D,setpts=PTS-STARTPTS[tail];[main][tail]xfade=transition=fade:duration=$XF:offset=$OFF[v]" \
    -map "[v]" -an -c:v libx264 -pix_fmt yuv420p -crf 22 -movflags +faststart "level$N.mp4" 2>/dev/null
  [ -f "level$N.mp4" ] || cp "/tmp/slow$N.mp4" "level$N.mp4"
  rm -f "/tmp/slow$N.mp4"
  echo "level$N finished $(ffprobe -v quiet -show_entries format=duration -of csv=p=0 level$N.mp4)s"
done
echo "FINISH DONE"
