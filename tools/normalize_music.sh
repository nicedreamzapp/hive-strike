#!/bin/bash
# bring every music track to the same quiet loudness (-22 LUFS) so no scene's song jumps out over the bugs
cd "$(dirname "$0")/../music" || exit 1
for f in *.mp3; do
  ffmpeg -y -loglevel error -i "$f" -af "loudnorm=I=-22:TP=-3:LRA=9" -codec:a libmp3lame -q:a 4 "norm_$f" && mv "norm_$f" "$f" && echo "normalized $f"
done
