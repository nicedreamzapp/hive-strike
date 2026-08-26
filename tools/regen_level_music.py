#!/usr/bin/env python3
"""Regenerate the 16 level beds, one distinct genre per world, so no two levels sound alike.
Pauses itself whenever a real Song Forge customer job is running."""
import json, os, re, subprocess, time, urllib.request

M = os.path.expanduser("~/Desktop/PROJECTS/hive-strike/music")
API = "http://127.0.0.1:8767"
STYLES = {
 1:  "bright acoustic folk instrumental, fingerpicked guitar, pennywhistle, hand percussion, sunny major key, 100 bpm",
 2:  "baroque chamber instrumental, harpsichord and pizzicato strings, elegant waltz in 3/4, 96 bpm",
 3:  "minimal ambient instrumental, marimba and glass harmonica, soft water pulses, 80 bpm",
 4:  "warm americana instrumental, banjo, dobro slide, brushed drums, front porch feel, 105 bpm",
 5:  "dark cinematic instrumental, celesta over low strings, sparse moonlit mystery, 70 bpm",
 6:  "driving tribal percussion instrumental, taiko and shakers, buzzing synth bass, hypnotic, 128 bpm",
 7:  "swamp blues instrumental, slide guitar, upright bass, muted trumpet, humid and slow, 85 bpm",
 8:  "desert rock instrumental, oud and darbuka, phrygian mode, shimmering guitars, 110 bpm",
 9:  "afro latin jungle groove instrumental, congas, kalimba, bamboo flute, lush, 115 bpm",
 10: "cavernous instrumental, sparse prepared piano and bowed metal, long reverb, no drone, 62 bpm",
 11: "alpine orchestral instrumental, french horn and strings, wide open and heroic, 100 bpm",
 12: "coastal surf rock instrumental, reverb guitar, shaker, breezy and bright, 120 bpm",
 13: "heavy industrial instrumental, distorted bass, metallic percussion, urgent, 140 bpm",
 14: "icy synthwave instrumental, glassy pads and cold arpeggios, wide stereo, 95 bpm",
 15: "night city jazz funk instrumental, rhodes, wah guitar, tight drums, neon, 105 bpm",
 16: "epic finale instrumental, orchestral electronic hybrid, choir pads, big drums, triumphant, 128 bpm",
}
WORLDS = {1:"The Meadow",2:"The Garden",3:"The Pond",4:"The Orchard",5:"The Night Wood",6:"The Hive",
 7:"The Swamp",8:"The Dunes",9:"The Canopy",10:"The Cave",11:"The Alpine",12:"The Tide Pool",
 13:"The Volcano",14:"The Tundra",15:"The Rooftops",16:"The Crystal"}

def get(p, t=15):
    return json.load(urllib.request.urlopen(API + p, timeout=t))

MINE = set()
def wait_for_customers():
    """hold off only for work that is not ours, so a real customer never waits behind the game music"""
    while True:
        try:
            st = get("/api/status", 8)
            outside = st.get("queue_depth", 0) - len(MINE)
            if outside <= 0:
                return
            print("[pause] customer job ahead of us:", outside, flush=True)
        except Exception:
            return
        time.sleep(20)

def submit(n):
    body = json.dumps({"style": STYLES[n], "title": "Hive Strike " + WORLDS[n],
                       "lyrics": "[instrumental]", "duration": 90.0, "private": True}).encode()
    r = urllib.request.Request(API + "/api/song", data=body, headers={"Content-Type": "application/json"})
    j=json.load(urllib.request.urlopen(r, timeout=30));return j.get("id") or j["ids"][0]

def has_words(wav):
    subprocess.run(["ffmpeg","-y","-loglevel","error","-i",wav,"-ar","16000","-ac","1","-t","60","/tmp/hs16.wav"])
    r = subprocess.run(["/opt/homebrew/bin/whisper-cli","-m",os.path.expanduser("~/whisper-models/ggml-small.en.bin"),
                        "-f","/tmp/hs16.wav","-np"], capture_output=True, text=True)
    w = re.sub(r"\[.*?\]|\(.*?\)|♪|-->|[\d:.\s]", "", "".join(r.stdout.splitlines()))
    return len(w) > 12, w[:70]

done = {}
for n in range(1, 17):
    for attempt in (1, 2):
        wait_for_customers()
        try:
            jid = submit(n)
        except Exception as e:
            print(n, "submit failed", e, flush=True); break
        MINE.add(jid)
        print(f"level{n} submitted {jid} (try {attempt})", flush=True)
        audio = None
        for _ in range(200):
            time.sleep(6)
            try: j = get(f"/api/song/{jid}")
            except Exception: continue
            if j.get("status") == "error":
                print(f"level{n} ERROR", j.get("error"), flush=True); break
            if j.get("status") == "done" and j.get("audio"):
                audio = j["audio"]; break
        if not audio:
            MINE.discard(jid); continue
        wav = f"{M}/level{n}.new.wav"
        urllib.request.urlretrieve(API + audio, wav)
        sung, txt = has_words(wav)
        if sung:
            print(f"level{n} had vocals -> retry ({txt})", flush=True)
            os.remove(wav); MINE.discard(jid); continue
        subprocess.run(["ffmpeg","-y","-loglevel","error","-i",wav,"-codec:a","libmp3lame","-q:a","4",
                        f"{M}/level{n}.mp3"])
        os.remove(wav)
        MINE.discard(jid)
        done[n] = "ok"; print(f"level{n} ok  [{len(done)}/16]", flush=True)
        break
print("LEVEL MUSIC DONE", json.dumps(done), flush=True)
