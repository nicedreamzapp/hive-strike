#!/bin/bash
# Play each scene forward then backward so the loop never resets -- there is no cut to hide,
# because the last frame of the forward pass IS the first frame of the reverse pass.
cd ~/Desktop/PROJECTS/hive-strike/art/clip
for N in $(seq 1 16); do
  RAW=$(ls -t v${N}_*.mp4 2>/dev/null | head -1)
  [ -z "$RAW" ] && { echo "level$N no source"; continue; }
  # slower than before: 3.6x with motion interpolation so it stays smooth video
  ffmpeg -y -loglevel error -i "$RAW" -vf "setpts=3.6*PTS,minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:vsbmc=1" \
    -an -c:v libx264 -pix_fmt yuv420p -crf 21 "/tmp/fwd$N.mp4" 2>/dev/null
  [ -f "/tmp/fwd$N.mp4" ] || { echo "level$N slow failed"; continue; }
  # drop the duplicate turnaround frame on the reverse leg so it does not hitch at the ends
  ffmpeg -y -loglevel error -i "/tmp/fwd$N.mp4" -vf "reverse,trim=start_frame=1,setpts=PTS-STARTPTS" \
    -an -c:v libx264 -pix_fmt yuv420p -crf 21 "/tmp/rev$N.mp4" 2>/dev/null
  printf "file '/tmp/fwd%s.mp4'\nfile '/tmp/rev%s.mp4'\n" "$N" "$N" > "/tmp/cat$N.txt"
  ffmpeg -y -loglevel error -f concat -safe 0 -i "/tmp/cat$N.txt" -an -c:v libx264 -pix_fmt yuv420p \
    -crf 21 -movflags +faststart "level$N.mp4" 2>/dev/null
  rm -f "/tmp/fwd$N.mp4" "/tmp/rev$N.mp4" "/tmp/cat$N.txt"
  echo "level$N $(ffprobe -v quiet -show_entries format=duration -of csv=p=0 level$N.mp4)s ping-pong"
done
echo PINGPONG_DONE
