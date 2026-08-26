#!/usr/bin/env python3
"""Wait for the per-level Song Forge jobs, whisper-gate each (no lyrics), save as music/levelN.mp3 / bossN.mp3."""
import json,os,re,subprocess,time,urllib.request
M=os.path.expanduser("~/Desktop/PROJECTS/hive-strike/music");jobs=json.load(open(f"{M}/jobs_levels.json"))
done={}
while len(done)<len(jobs):
    for k,jid in jobs.items():
        if k in done: continue
        try: j=json.load(urllib.request.urlopen(f"http://127.0.0.1:8767/api/song/{jid}",timeout=10))
        except Exception as e: print(k,"poll err",e,flush=True);continue
        if j.get("status")=="error": done[k]="ERROR";print(k,"ERROR",j.get("error"),flush=True);continue
        if j.get("status")!="done" or not j.get("audio"): continue
        wav=f"{M}/{k}.wav";urllib.request.urlretrieve("http://127.0.0.1:8767"+j["audio"],wav)
        subprocess.run(["ffmpeg","-y","-loglevel","error","-i",wav,"-ar","16000","-ac","1","-t","60","/tmp/hs16.wav"])
        r=subprocess.run(["/opt/homebrew/bin/whisper-cli","-m",os.path.expanduser("~/whisper-models/ggml-small.en.bin"),"-f","/tmp/hs16.wav","-np"],capture_output=True,text=True)
        words=re.sub(r"\[.*?\]|\(.*?\)|♪|-->|[\d:.\s]","","".join(r.stdout.splitlines()))
        if len(words)>12: done[k]="LYRICS?";print(k,"LYRICS? ->",words[:80],flush=True);continue
        subprocess.run(["ffmpeg","-y","-loglevel","error","-i",wav,"-codec:a","libmp3lame","-q:a","4",f"{M}/{k}.mp3"])
        done[k]="ok";print(k,"ok",flush=True)
    time.sleep(15)
print("MUSIC DONE",json.dumps(done),flush=True)
