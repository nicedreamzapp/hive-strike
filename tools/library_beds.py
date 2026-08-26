#!/usr/bin/env python3
"""Use Matt's OWN Song Forge instrumentals as the level beds.

2026-08-26. Generated prompts kept producing gimmicky arcade tunes. Matt: "just do all
the instrumental you see from my song forge and i will say yes or no when im playing and
we can change it." So this stops generating anything -- it pulls every lyric-free track
already in his library, normalises it the same way the old beds were (-22 LUFS), and
installs it as a level bed.

Writes docs/BEDS.md so that when he says "level 7, no" we know exactly which library
track that was and can swap it in one line.

  python3 tools/library_beds.py            # assign and install all of them
  python3 tools/library_beds.py --dry      # just show the assignment
  SWAP=7=<library-id> python3 tools/library_beds.py   # repoint one level
"""
import json, os, subprocess, sys, urllib.request, datetime

API   = "http://127.0.0.1:8767"
ROOT  = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC = os.path.join(ROOT, "music")
CACHE = "/private/tmp/claude-501/-Users-dtribe/f91cad9b-e1f1-4345-9017-fd2d1b47d5d9/scratchpad/lib"
DRY   = "--dry" in sys.argv
os.makedirs(CACHE, exist_ok=True)

WORLDS = ["Meadow","Garden","Pond","Orchard","Night Wood","Hive","Swamp","Dunes",
          "Canopy","Cave","Alpine","Tide Pool","Volcano","Tundra","Rooftops","Crystal"]

songs = json.load(urllib.request.urlopen(API+"/api/songs", timeout=20))
songs = songs if isinstance(songs, list) else songs.get("songs") or songs.get("items") or []
inst  = [s for s in songs if not (s.get("lyrics") or "").strip() and s.get("status")=="done" and s.get("audio")]
inst.sort(key=lambda s: float(s.get("created_at") or 0))
if not inst: sys.exit("no instrumentals found in the library")

# the one that reads as a finale goes on world 16; everything else lands in library order
finale = next((s for s in inst if "dance" in s["title"].lower()), None)
rest   = [s for s in inst if s is not finale]
pool   = rest or inst
order  = [pool[i % len(pool)] for i in range(16)]   # fewer tracks than worlds: wrap around
if finale: order[15] = finale                       # world 16 is the ending, give it the big one

swap = os.environ.get("SWAP","")
if swap and "=" in swap:
    n,sid = swap.split("=",1); n=int(n)
    pick = next((s for s in inst if s["id"].startswith(sid)), None)
    if not pick: sys.exit(f"no library track starting {sid}")
    order[n-1] = pick; print(f"swapped level{n} -> {pick['title']}")

print(f"{len(inst)} instrumentals in the library\n")
rows=[]
for i,s in enumerate(order, start=1):
    ts=float(s.get("created_at") or 0)
    when=datetime.datetime.fromtimestamp(ts).strftime("%b %d") if ts else "?"
    print(f"  level{i:<3} {WORLDS[i-1]:<11} <- {s['title'][:46]:<46} {s.get('duration','?')}s  {when}")
    rows.append((i, WORLDS[i-1], s["title"], s["id"], s.get("duration","?"), when))
if DRY: sys.exit(0)

print()
for i,s in enumerate(order, start=1):
    src=os.path.join(CACHE, s["id"]+".wav")
    if not os.path.exists(src):
        u=s["audio"]; u = API+u if u.startswith("/") else u
        urllib.request.urlretrieve(u, src)
    out=os.path.join(MUSIC, f"level{i}.mp3")
    subprocess.run(["ffmpeg","-y","-loglevel","error","-i",src,
                    "-af","loudnorm=I=-22:TP=-1.5:LRA=11","-codec:a","libmp3lame","-b:a","160k",out], check=True)
    print(f"  installed level{i}.mp3  ({s['title'][:44]})")

os.makedirs(os.path.join(ROOT,"docs"), exist_ok=True)
with open(os.path.join(ROOT,"docs","BEDS.md"),"w") as f:
    f.write("# Level beds\n\nEvery level bed is one of Matt's own Song Forge instrumentals, "
            "pulled straight from his library and normalised to -22 LUFS. Nothing here was "
            "generated for the game.\n\nTo change one:\n\n```\nSWAP=7=<library-id> python3 tools/library_beds.py\n"
            "python3 tools/build_mobile.py && npx cap sync\n```\n\n")
    f.write("| level | world | library track | id | length | made |\n|---|---|---|---|---|---|\n")
    for i,w,t,sid,dur,when in rows:
        f.write(f"| {i} | {w} | {t} | `{sid[:8]}` | {dur}s | {when} |\n")
print("\nwrote docs/BEDS.md")
