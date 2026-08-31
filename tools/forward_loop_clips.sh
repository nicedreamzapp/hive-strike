#!/bin/bash
# Forward-only seamless loops, replacing the ping-pong builds.
#
# Ping-pong looked seamless on paper but it plays the scene BACKWARDS half the
# time: the pond's river flowed uphill and the orchard's apples fell up (Matt,
# 2026-08-30). Anything with directional motion can only ever play forward.
#
# Recipe: take the forward half of the existing ping-pong clip (first (N+1)/2
# frames -- the reverse leg dropped its duplicate turnaround frame, hence the
# odd total), then crossfade the last 1.5s over the first 1.5s. The output's
# final frame is source frame S-1 and its first frame is source frame S, so
# the wrap lands on two CONSECUTIVE source frames: the only blend is a slow
# 1.5s dissolve mid-clip, which flowing water hides completely.
cd ~/Desktop/PROJECTS/hive-strike/art/clip || exit 1
F=36   # crossfade frames (1.5s at 24fps)
for N in "$@"; do
  IN="level$N.mp4"
  [ -f "$IN" ] || { echo "level$N missing"; continue; }
  TOT=$(ffprobe -v error -select_streams v -show_entries stream=nb_frames -of csv=p=0 "$IN")
  M=$(( (TOT+1)/2 ))
  # a clip that is not a ping-pong (already forward-only) still loops fine through
  # the same crossfade -- but only halve it when the halves actually mirror
  MAIN=$((M-F)); OFF=$(echo "scale=5;($MAIN-$F)/24" | bc)
  ffmpeg -y -loglevel error -i "$IN" -filter_complex \
    "[0:v]split[a][b];[a]trim=start_frame=$F:end_frame=$M,setpts=PTS-STARTPTS[main];[b]trim=start_frame=0:end_frame=$F,setpts=PTS-STARTPTS[head];[main][head]xfade=transition=fade:duration=1.5:offset=$OFF" \
    -an -c:v libx264 -pix_fmt yuv420p -crf 18 -movflags +faststart "/tmp/loop$N.mp4" \
    && mv "/tmp/loop$N.mp4" "$IN" \
    && echo "level$N  $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")s  forward-only" \
    || echo "level$N FAILED"
done
echo FORWARD_LOOP_DONE
