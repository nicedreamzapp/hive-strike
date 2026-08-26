#!/usr/bin/env python3
"""Assign every one of Matt's Song Forge instrumentals across all 32 music slots.

Matt, 2026-08-26: "as long as he uses separate ones then the gameplay i guess it'll be
ok" -- so the rule is no track plays twice anywhere near itself. Play order is
L1, B1, L2, B2 ... L16, B16, and tracks are laid down in that order, so any unavoidable
repeat is pushed to the very end, as far from its twin as the game allows.

Nothing is generated. Every bed is a track already in his library, whisper-checked to
be genuinely wordless (the library's lyrics field holds a whisper transcript, and
whisper hallucinates "whatwhatwhat" on instrumental audio -- it is not evidence of
singing).

  python3 tools/assign_beds.py --dry        show the map
  python3 tools/assign_beds.py              install + write docs/BEDS.md
  SWAP=L7=<id> python3 tools/assign_beds.py   repoint one slot  (L7 or B7)
"""
import json, os, re, subprocess, sys, urllib.request, datetime

API="http://127.0.0.1:8767"
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC=os.path.join(ROOT,"music"); CACHE="/private/tmp/claude-501/-Users-dtribe/f91cad9b-e1f1-4345-9017-fd2d1b47d5d9/scratchpad/lib"
os.makedirs(CACHE,exist_ok=True)
DRY="--dry" in sys.argv
WORLDS=["Meadow","Garden","Pond","Orchard","Night Wood","Hive","Swamp","Dunes",
        "Canopy","Cave","Alpine","Tide Pool","Volcano","Tundra","Rooftops","Crystal"]

songs=json.load(urllib.request.urlopen(API+"/api/songs",timeout=20))
songs=songs if isinstance(songs,list) else songs.get("songs") or songs.get("items") or []
cands=[s for s in songs if s.get("status")=="done" and s.get("audio") and "instrumental" in s["title"].lower()]
cands.sort(key=lambda s: float(s.get("created_at") or 0))

def fetch(s):
    p=os.path.join(CACHE,s["id"]+".wav")
    if not os.path.exists(p):
        u=s["audio"]; u=API+u if u.startswith("/") else u
        urllib.request.urlretrieve(u,p)
    return p

def sings(path):
    tmp=os.path.join(CACHE,"_p16.wav")
    subprocess.run(["ffmpeg","-y","-loglevel","error","-i",path,"-ar","16000","-ac","1","-t","80",tmp],check=False)
    r=subprocess.run(["/opt/homebrew/bin/whisper-cli","-m",os.path.expanduser("~/whisper-models/ggml-small.en.bin"),
                      "-f",tmp,"-np"],capture_output=True,text=True)
    txt=re.sub(r"\[.*?\]|\(.*?\)|♪|-->|[\d:.]","","".join(r.stdout.splitlines())).strip()
    junk=re.sub(r"(?i)\b(what|mmm+|oh|ah+|uh|la|na|hmm|yeah|thanks for watching|subscribe|you)\b|[\s,.!?'-]","",txt)
    return len(junk)>25

pool=[s for s in cands if not sings(fetch(s))]
print(f"{len(pool)} wordless instrumentals in the library, 32 slots to fill\n")

# lay them down in play order so a repeat lands as late as possible
slots=[("L",n) for n in range(1,17)]
order=[]
for n in range(1,17): order.append(("L",n)); order.append(("B",n))
pick={}
for i,slot in enumerate(order):
    pick[slot]=pool[i % len(pool)]

swap=os.environ.get("SWAP","")
if swap and "=" in swap:
    k,sid=swap.split("=",1); kind,n=k[0].upper(),int(k[1:])
    p=next((s for s in pool if s["id"].startswith(sid)),None)
    if not p: sys.exit(f"no wordless library track starting {sid}")
    pick[(kind,n)]=p; print(f"swapped {kind}{n} -> {p['title']}\n")

seen={}
dups=[]
for slot in order:
    t=pick[slot]["id"]
    if t in seen: dups.append((seen[t],slot))
    else: seen[t]=slot
for n in range(1,17):
    L,B=pick[("L",n)],pick[("B",n)]
    print(f"  {n:>2}  {WORLDS[n-1]:<11} level: {L['title'][:38]:<38}  boss: {B['title'][:38]}")
if dups:
    print(f"\n  {len(dups)} unavoidable repeat(s) -- {len(pool)} tracks for 32 slots:")
    for a,b in dups: print(f"    {b[0]}{b[1]} reuses the track on {a[0]}{a[1]}")
else:
    print("\n  every slot is a different track")
if DRY: sys.exit(0)

print()
for slot in order:
    kind,n=slot; s=pick[slot]
    out=os.path.join(MUSIC, ("level" if kind=="L" else "boss")+f"{n}.mp3")
    subprocess.run(["ffmpeg","-y","-loglevel","error","-i",fetch(s),
                    "-af","loudnorm=I=-22:TP=-1.5:LRA=11","-codec:a","libmp3lame","-b:a","160k",out],check=True)
print(f"installed {len(order)} beds")

os.makedirs(os.path.join(ROOT,"docs"),exist_ok=True)
with open(os.path.join(ROOT,"docs","BEDS.md"),"w") as f:
    f.write("# Music\n\nEvery bed in the game is one of Matt's own Song Forge instrumentals, pulled from\n"
            "his library and normalised to -22 LUFS. Nothing was generated for the game.\n\n"
            "Don't like one? `SWAP=B5=<id> python3 tools/assign_beds.py` then rebuild.\n\n"
            "| world | | level bed | id | boss theme | id |\n|---|---|---|---|---|---|\n")
    for n in range(1,17):
        L,B=pick[("L",n)],pick[("B",n)]
        f.write(f"| {n} | {WORLDS[n-1]} | {L['title']} | `{L['id'][:8]}` | {B['title']} | `{B['id'][:8]}` |\n")
print("wrote docs/BEDS.md")
