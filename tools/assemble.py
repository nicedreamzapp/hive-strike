#!/usr/bin/env python3
"""index.html is one 1600-line file. src/*.js is the same code, split at its own section
banners so a change means opening one small file instead of scrolling past everything.

  python3 tools/assemble.py --split    read index.html -> write src/*.js   (one time)
  python3 tools/assemble.py            read src/*.js  -> write index.html  (the normal direction)

The join is pure concatenation in filename order, so the produced index.html is
byte-identical to the one the pieces came from. --split refuses to run if that is
ever not true, and the normal direction prints the hash it wrote.
"""
import hashlib, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = os.path.join(ROOT, "index.html")
SRC  = os.path.join(ROOT, "src")
NAMES = ["boot","audio","bug_voices","music","art","state","player_fire","levels","enemies",
         "world_hazards","waves","bosses","boss_phase_two","pickups","update","draw_helpers",
         "world_ground","ambient","scene_motion","gamepad","suspend_resume"]

def parts_of(html):
    m = re.search(r"(<script>\n?)(.*)(\n?</script>)", html, re.S)
    if not m: sys.exit("index.html: no <script> block")
    return m.group(1), m.group(2), m.group(3), m.start(), m.end()

def do_split():
    html = open(HTML, encoding="utf-8").read()
    open_tag, body, close_tag, _, _ = parts_of(html)
    cuts = [m.start() for m in re.finditer(r"^// -{10} ", body, re.M)]
    chunks = [body[:cuts[0]]] + [body[a:b] for a,b in zip(cuts, cuts[1:]+[len(body)])]
    if len(chunks) != len(NAMES):
        sys.exit(f"expected {len(NAMES)} sections, found {len(chunks)} — update NAMES in this script")
    os.makedirs(SRC, exist_ok=True)
    for i,(name,chunk) in enumerate(zip(NAMES, chunks)):
        open(os.path.join(SRC, f"{i:02d}_{name}.js"), "w", encoding="utf-8").write(chunk)
    if "".join(chunks) != body:
        sys.exit("split is not lossless — refusing")
    print(f"split into {len(chunks)} files under src/")
    print("round-trip check:", "IDENTICAL" if join()==html else "DIFFERENT — do not commit")

def join():
    html = open(HTML, encoding="utf-8").read()
    open_tag, body, close_tag, s, e = parts_of(html)
    files = sorted(f for f in os.listdir(SRC) if f.endswith(".js"))
    new_body = "".join(open(os.path.join(SRC,f), encoding="utf-8").read() for f in files)
    return html[:s] + open_tag + new_body + close_tag + html[e:]

if "--split" in sys.argv:
    do_split()
else:
    if not os.path.isdir(SRC): sys.exit("no src/ yet — run with --split first")
    out = join()
    before = hashlib.sha256(open(HTML,"rb").read()).hexdigest()[:12]
    open(HTML,"w",encoding="utf-8").write(out)
    after = hashlib.sha256(out.encode()).hexdigest()[:12]
    print(f"index.html {before} -> {after}" + ("  (unchanged)" if before==after else ""))
