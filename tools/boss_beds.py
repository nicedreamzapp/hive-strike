#!/usr/bin/env python3
"""Boss themes from Matt's own Song Forge instrumentals.

The library stores a whisper transcript in the lyrics field, and whisper hallucinates
on instrumental audio -- "whatwhatwhatwhat", "Thanks for watching!", "Mmm. Mmm." So a
non-empty lyrics field does NOT mean the track has singing. Everything titled
Instrumental is a candidate; this re-checks the AUDIO with whisper and only ships the
ones that are genuinely wordless.

Builds a single preview montage so Matt can hear all the candidates in one scrub.
"""
import json, os, re, subprocess, sys, urllib.request, datetime

API="http://127.0.0.1:8767"
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC=os.path.join(ROOT,"music")
CACHE="/private/tmp/claude-501/-Users-dtribe/f91cad9b-e1f1-4345-9017-fd2d1b47d5d9/scratchpad/lib"
os.makedirs(CACHE,exist_ok=True)
INSTALL = "--install" in sys.argv

songs=json.load(urllib.request.urlopen(API+"/api/songs",timeout=20))
songs=songs if isinstance(songs,list) else songs.get("songs") or songs.get("items") or []
songs=[s for s in songs if s.get("status")=="done" and s.get("audio")]

LEVEL_IDS=set()
beds=os.path.join(ROOT,"docs","BEDS.md")
if os.path.exists(beds):
    LEVEL_IDS={m for m in re.findall(r"`([0-9a-f]{8})`",open(beds).read())}

cands=[s for s in songs if "instrumental" in s["title"].lower() and s["id"][:8] not in LEVEL_IDS]
cands.sort(key=lambda s: float(s.get("created_at") or 0))
print(f"{len(cands)} instrumental candidates not already used on a level\n")

def fetch(s):
    p=os.path.join(CACHE,s["id"]+".wav")
    if not os.path.exists(p):
        u=s["audio"]; u=API+u if u.startswith("/") else u
        urllib.request.urlretrieve(u,p)
    return p

def sings(path):
    """whisper the real audio. hallucination patterns don't count as singing."""
    tmp=os.path.join(CACHE,"_p16.wav")
    subprocess.run(["ffmpeg","-y","-loglevel","error","-i",path,"-ar","16000","-ac","1","-t","80",tmp],check=False)
    r=subprocess.run(["/opt/homebrew/bin/whisper-cli","-m",os.path.expanduser("~/whisper-models/ggml-small.en.bin"),
                      "-f",tmp,"-np"],capture_output=True,text=True)
    raw="".join(r.stdout.splitlines())
    txt=re.sub(r"\[.*?\]|\(.*?\)|♪|-->|[\d:.]","",raw).strip()
    junk=re.sub(r"(?i)\b(what|mmm+|oh|ah+|uh|la|na|hmm|yeah|thanks for watching|subscribe|you)\b|[\s,.!?'-]","",txt)
    return len(junk)>25, txt[:90]

ok=[]
for s in cands:
    p=fetch(s)
    bad,txt=sings(p)
    mark="SINGING" if bad else "clean  "
    print(f"  {mark}  {s['title'][:42]:<42} {txt!r}"[:150])
    if not bad: ok.append((s,p))

print(f"\n{len(ok)} clean instrumentals available for bosses")
if not ok: sys.exit(1)

# preview montage: 22s from the middle of each, so he hears the body not the intro
lst=os.path.join(CACHE,"_montage.txt"); parts=[]
for i,(s,p) in enumerate(ok):
    seg=os.path.join(CACHE,f"_seg{i}.wav")
    dur=float(s.get("duration") or 160)
    subprocess.run(["ffmpeg","-y","-loglevel","error","-ss",str(max(0,dur*0.35)),"-i",p,"-t","22",
                    "-af","afade=t=in:st=0:d=1,afade=t=out:st=21:d=1","-ar","44100","-ac","2",seg],check=True)
    parts.append(seg)
with open(lst,"w") as f:
    for p in parts: f.write(f"file '{p}'\n")
MONT="/private/tmp/claude-501/-Users-dtribe/f91cad9b-e1f1-4345-9017-fd2d1b47d5d9/scratchpad/BOSS-CANDIDATES.mp3"
subprocess.run(["ffmpeg","-y","-loglevel","error","-f","concat","-safe","0","-i",lst,
                "-codec:a","libmp3lame","-b:a","192k",MONT],check=True)
print("\npreview montage (22s each, in this order):")
for i,(s,_) in enumerate(ok):
    print(f"  {str(i*22//60).rjust(2)}:{str(i*22%60).zfill(2)}  {s['title']}")
print("\n->",MONT)

if INSTALL:
    print()
    for n in range(1,17):
        s,p=ok[(n-1)%len(ok)]
        out=os.path.join(MUSIC,f"boss{n}.mp3")
        subprocess.run(["ffmpeg","-y","-loglevel","error","-i",p,
                        "-af","loudnorm=I=-22:TP=-1.5:LRA=11","-codec:a","libmp3lame","-b:a","160k",out],check=True)
        print(f"  boss{n}.mp3 <- {s['title'][:44]}")
    with open(os.path.join(ROOT,"docs","BEDS.md"),"a") as f:
        f.write("\n## Boss themes\n\n| boss | library track | id |\n|---|---|---|\n")
        for n in range(1,17):
            s,_=ok[(n-1)%len(ok)]
            f.write(f"| {n} | {s['title']} | `{s['id'][:8]}` |\n")
    print("\nappended boss map to docs/BEDS.md")
