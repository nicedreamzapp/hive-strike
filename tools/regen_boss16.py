#!/usr/bin/env python3
"""boss16.mp3 was a byte-for-byte copy of boss1.mp3 (the 9/1 fetch fell back to the Meadow boss).
Render the Crystal boss its own theme through Song Forge, whisper-check it is wordless, install."""
import json, os, subprocess, sys, time, urllib.request
API="http://127.0.0.1:8767"; ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC=os.path.join(ROOT,"music"); STAGE=os.path.join(os.environ.get("TMPDIR","/tmp"),"hs-boss16"); os.makedirs(STAGE,exist_ok=True)
STYLE="cavernous menacing instrumental, pounding taiko and bowed metal, prepared piano stabs, deep sub bass, long reverb, glowing crystal cavern, 96 bpm"
def get(p,t=15): return json.load(urllib.request.urlopen(API+p,timeout=t))
sys.path.insert(0,os.path.join(ROOT,"tools"))
for attempt in (1,2):
    body=json.dumps({"style":STYLE,"title":"Hive Strike Crystal Boss","lyrics":"[instrumental]","duration":150.0,"private":True}).encode()
    r=urllib.request.Request(API+"/api/song",data=body,headers={"Content-Type":"application/json"})
    j=json.load(urllib.request.urlopen(r,timeout=30)); jid=j.get("id") or j["ids"][0]
    print("boss16 try",attempt,jid,flush=True); dst=os.path.join(STAGE,"boss16.wav"); ok=False
    for _ in range(260):
        time.sleep(6)
        try: s=get(f"/api/song/{jid}")
        except Exception: continue
        if s.get("status")=="done":
            u=s.get("audio") or s.get("url")
            if u and u.startswith("/"): u=API+u
            if u: urllib.request.urlretrieve(u,dst); ok=True
            break
        if s.get("status")=="error": print("render error",s.get("stage"),flush=True); break
    if not ok: continue
    # wordless check, same as the level tool
    import importlib.util
    spec=importlib.util.spec_from_file_location("rl",os.path.join(ROOT,"tools","regen_level_music.py"))
    src=open(spec.origin).read(); ns={"__file__":spec.origin,"__name__":"rl"}
    exec(src.split("got = {}")[0].replace("todo = [n for n in sorted(PLAN) if not only or n in only]","todo=[]"),ns)
    words,txt=ns["has_words"](dst)
    if words: print("REJECTED singing:",txt,flush=True); os.remove(dst); continue
    out=os.path.join(MUSIC,"boss16.mp3")
    subprocess.run(["ffmpeg","-y","-loglevel","error","-i",dst,"-af","loudnorm=I=-22:TP=-1.5:LRA=11","-codec:a","libmp3lame","-b:a","160k",out],check=True)
    print("installed",out,flush=True); break
print("BOSS16 DONE",flush=True)
