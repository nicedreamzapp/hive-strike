#!/usr/bin/env python3
"""Wait for named Song Forge jobs (argv keys), whisper-gate, save mp3, normalize."""
import json,os,re,subprocess,sys,time,urllib.request
M=os.path.expanduser("~/Desktop/PROJECTS/hive-strike/music");jobs=json.load(open(f"{M}/jobs_levels.json"));keys=sys.argv[1:];done={}
while len(done)<len(keys):
    for k in keys:
        if k in done: continue
        jid=jobs[k]
        try: j=json.load(urllib.request.urlopen(f"http://127.0.0.1:8767/api/song/{jid}",timeout=10))
        except Exception as e: continue
        if j.get("status")=="error": done[k]="ERROR";print(k,"ERROR",flush=True);continue
        if j.get("status")!="done" or not j.get("audio"): continue
        wav=f"/tmp/hs_{k}.wav";urllib.request.urlretrieve("http://127.0.0.1:8767"+j["audio"],wav)
        subprocess.run(["ffmpeg","-y","-loglevel","error","-i",wav,"-ar","16000","-ac","1","-t","60","/tmp/hs16.wav"])
        r=subprocess.run(["/opt/homebrew/bin/whisper-cli","-m",os.path.expanduser("~/whisper-models/ggml-small.en.bin"),"-f","/tmp/hs16.wav","-np"],capture_output=True,text=True)
        words=re.sub(r"\[.*?\]|\(.*?\)|♪|-->|[\d:.\s]","","".join(r.stdout.splitlines()))
        if len(words)>12: done[k]="LYRICS?";print(k,"LYRICS?",words[:60],flush=True);continue
        subprocess.run(["ffmpeg","-y","-loglevel","error","-i",wav,"-af","loudnorm=I=-22:TP=-3:LRA=9","-codec:a","libmp3lame","-q:a","4",f"{M}/{k}.mp3"])
        done[k]="ok";print(k,"ok",flush=True)
    time.sleep(12)
print("DONE",json.dumps(done),flush=True)
