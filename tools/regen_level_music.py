#!/usr/bin/env python3
"""Rebuild the level beds in the only three languages Matt has approved.

2026-08-26: the previous version of this file chased "one distinct genre per world so
no two levels sound alike" -- folk with a pennywhistle, surf rock, jazz funk, industrial.
Matt heard it in the game and called it gimmicky. Asked which of the sixteen actually
worked he named exactly three: 5, 6 and 10. Every one he rejected is a TUNE with a
melody hook. All three he kept are ATMOSPHERE. That is the whole rule now.

Levels 5, 6 and 10 are never re-rendered -- they are the wins, kept verbatim.
The other thirteen are rendered from those three style strings, changed only by the
one scene word, per [[feedback_dont_iterate_past_a_win]].

Length goes 90s -> 180s because Matt's other complaint was that it "just repeats and
goes on a loop". The tracks he liked on the radio were 180-200s.

  python3 tools/regen_level_music.py            # the 13
  ONLY=1,3,4 python3 tools/regen_level_music.py # just those
"""
import json, os, re, subprocess, sys, time, urllib.request

API  = "http://127.0.0.1:8767"
MUSIC= os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "music")
STAGE= "/private/tmp/claude-501/-Users-dtribe/f91cad9b-e1f1-4345-9017-fd2d1b47d5d9/scratchpad/beds"
DUR  = 180.0
KEEP = {5, 6, 10}          # approved 2026-08-26 -- do not regenerate, do not "improve"

# the three approved languages, quoted from the tracks Matt kept
A = "dark cinematic instrumental, celesta over low strings, sparse {scene} mystery, 70 bpm"
B = "driving tribal percussion instrumental, taiko and shakers, buzzing synth bass, hypnotic, {scene}, 128 bpm"
C = "cavernous instrumental, sparse prepared piano and bowed metal, long reverb, no drone, {scene}, 62 bpm"

PLAN = {
 1:  (A, "sunlit meadow"),      2:  (C, "walled garden"),   3:  (A, "still water"),
 4:  (A, "orchard dusk"),       7:  (B, "humid swamp"),     8:  (B, "desert wind"),
 9:  (A, "jungle canopy"),      11: (C, "alpine snow"),     12: (A, "tide pool"),
 13: (B, "volcanic"),           14: (C, "frozen tundra"),   15: (B, "night city"),
 16: (C, "crystal"),
}
WORLDS = {1:"Meadow",2:"Garden",3:"Pond",4:"Orchard",7:"Swamp",8:"Dunes",9:"Canopy",
          11:"Alpine",12:"Tide Pool",13:"Volcano",14:"Tundra",15:"Rooftops",16:"Crystal"}

only = [int(x) for x in os.environ.get("ONLY","").split(",") if x.strip()]
todo = [n for n in sorted(PLAN) if not only or n in only]
os.makedirs(STAGE, exist_ok=True)

def get(p, t=15): return json.load(urllib.request.urlopen(API+p, timeout=t))

MINE = set()
def wait_for_customers():
    """a paying customer never waits behind game music"""
    while True:
        try:
            st = get("/api/status", 8)
            outside = st.get("queue_depth", 0) - len(MINE)
            if outside <= 0: return
            print(f"  [pause] {outside} customer job(s) ahead of us", flush=True)
        except Exception:
            return
        time.sleep(20)

def submit(n):
    tmpl, scene = PLAN[n]
    style = tmpl.format(scene=scene)
    body = json.dumps({"style": style, "title": f"Hive Strike {WORLDS[n]}",
                       "lyrics": "[instrumental]", "duration": DUR, "private": True}).encode()
    r = urllib.request.Request(API+"/api/song", data=body, headers={"Content-Type":"application/json"})
    j = json.load(urllib.request.urlopen(r, timeout=30))
    return (j.get("id") or j["ids"][0]), style

def has_words(path):
    """these are beds, not songs -- any singing is a reject"""
    tmp = os.path.join(STAGE, "_probe16.wav")
    subprocess.run(["ffmpeg","-y","-loglevel","error","-i",path,"-ar","16000","-ac","1","-t","70",tmp], check=False)
    r = subprocess.run(["/opt/homebrew/bin/whisper-cli","-m",os.path.expanduser("~/whisper-models/ggml-small.en.bin"),
                        "-f",tmp,"-np"], capture_output=True, text=True)
    w = re.sub(r"\[.*?\]|\(.*?\)|♪|-->|[\d:.\s]", "", "".join(r.stdout.splitlines()))
    return len(w) > 12, w[:70]

got = {}
for n in todo:
    for attempt in (1, 2):
        wait_for_customers()
        try: jid, style = submit(n)
        except Exception as e:
            print(f"level{n} submit failed: {e}", flush=True); break
        MINE.add(jid)
        print(f"level{n} ({WORLDS[n]}) try {attempt}: {style}", flush=True)
        dst = os.path.join(STAGE, f"level{n}.wav")
        ok = False
        for _ in range(260):
            time.sleep(6)
            try: s = get(f"/api/song/{jid}")
            except Exception: continue
            if s.get("status") == "done":
                u = s.get("audio") or s.get("url")
                if not u: break
                if u.startswith("/"): u = API + u
                urllib.request.urlretrieve(u, dst); ok = True
                break
            if s.get("status") == "error":
                print(f"  level{n} render error: {s.get('stage')}", flush=True); break
        if not ok:
            print(f"  level{n} produced nothing", flush=True); continue
        words, txt = has_words(dst)
        if words:
            print(f"  level{n} REJECTED, singing detected: {txt!r}", flush=True)
            os.remove(dst); continue
        got[n] = dst
        print(f"  level{n} OK -> {dst}", flush=True)
        break

print(f"\n{len(got)}/{len(todo)} rendered clean")
if len(got) == len(todo):
    for n, src in got.items():
        out = os.path.join(MUSIC, f"level{n}.mp3")
        subprocess.run(["ffmpeg","-y","-loglevel","error","-i",src,
                        "-af","loudnorm=I=-22:TP=-1.5:LRA=11","-codec:a","libmp3lame","-b:a","160k",out], check=True)
        print("installed", out, flush=True)
    print("\nkept untouched (Matt approved 2026-08-26): levels", sorted(KEEP))
    print("now run: python3 tools/build_mobile.py && npx cap sync")
else:
    print("NOT installing a partial set -- music/ untouched. Re-run to finish.")
