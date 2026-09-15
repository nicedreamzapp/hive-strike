#!/usr/bin/env python3
"""Audit a Hive Strike submission on BOTH stores. Every check prints PASS or FAIL with the
actual value, so nothing is assumed.

    ssh mini-vps 'cd ~/hs-store && python3 /path/to/submission_audit.py'

Run it AFTER every submission, both stores, before telling Matt it is done. Submissions are the
part of this project that has gone wrong most often, and every failure so far has been silent --
an API call that returned 200 while the thing you wanted did not happen. See store/SUBMITTING.md
for the traps this exists to catch.

Lives in the repo; needs the mini, which holds both sets of store keys."""
import importlib.util, json, os, urllib.request, urllib.error
spec = importlib.util.spec_from_file_location("aw", os.path.expanduser("~/scripts/app-watch/app_watch.py"))
aw = importlib.util.module_from_spec(spec); spec.loader.exec_module(aw)
ok = fail = 0
def chk(cond, label, got):
    global ok, fail
    if cond: ok += 1; print(f"  PASS  {label}: {got}")
    else:    fail += 1; print(f"  FAIL  {label}: {got}")

print("=== GOOGLE PLAY ===")
TOK = aw.g_token("https://www.googleapis.com/auth/androidpublisher")
PKG = "com.nicedreamz.hivestrike"
B = "https://androidpublisher.googleapis.com/androidpublisher/v3/applications/" + PKG
def gq(m, u):
    r = urllib.request.Request(u, method=m, headers={"Authorization": "Bearer " + TOK})
    with urllib.request.urlopen(r, timeout=120) as f:
        t = f.read().decode(); return json.loads(t) if t.strip() else {}
eid = gq("POST", B + "/edits")["id"]
tr = gq("GET", B + "/edits/" + eid + "/tracks/production")
rel = (tr.get("releases") or [{}])[0]
chk(rel.get("name") == "1.4.0", "production version name", rel.get("name"))
chk(rel.get("versionCodes") == ["3"], "production versionCode", rel.get("versionCodes"))
chk(rel.get("status") == "completed", "release status", rel.get("status"))
chk(rel.get("userFraction") in (None, 1, 1.0), "rollout fraction (None = 100%)", rel.get("userFraction"))
notes = rel.get("releaseNotes") or []
chk(len(notes) > 0 and len(notes[0].get("text","")) > 20, "release notes present", (notes[0]["text"][:60]+"...") if notes else "MISSING")
try:
    bl = gq("GET", B + "/edits/" + eid + "/bundles")
    codes = sorted(int(b["versionCode"]) for b in bl.get("bundles", []))
    chk(3 in codes, "AAB 3 uploaded", codes[-4:])
except Exception as e:
    chk(False, "bundle list", str(e)[:70])
try:
    p = gq("GET", B + "/oneTimeProducts") if False else None
except Exception: pass
gq("DELETE", B + "/edits/" + eid)

print("\n=== APP STORE ===")
src = open(os.path.expanduser("~/hs-store/asc_submit.py")).read().split("def step(")[0]
ns = {"__name__": "x"}; exec(compile(src, "a", "exec"), ns)
call, APP, V, IAP = ns["call"], ns["APP"], ns["VERSION_ID"], ns["IAP"]
v = call(f"/v1/appStoreVersions/{V}")["data"]["attributes"]
chk(v["versionString"] == "1.4.0", "version string", v["versionString"])
chk(v["appStoreState"] in ("WAITING_FOR_REVIEW","IN_REVIEW","PENDING_DEVELOPER_RELEASE","READY_FOR_SALE"),
    "version state", v["appStoreState"])
b = call(f"/v1/appStoreVersions/{V}/build")["data"]["attributes"]
chk(b["version"] == "5", "attached build number", b["version"])
chk(b["processingState"] == "VALID", "build processing state", b["processingState"])
bid = call(f"/v1/appStoreVersions/{V}/build")["data"]["id"]
enc = call(f"/v1/builds/{bid}")["data"]["attributes"].get("usesNonExemptEncryption")
chk(enc is False, "export-encryption question answered (THE Sept-4 killer)", enc)
subs = [s for s in call(f"/v1/reviewSubmissions?filter[app]={APP}&limit=10")["data"]]
live = [s for s in subs if s["attributes"]["state"] in ("WAITING_FOR_REVIEW","IN_REVIEW")]
chk(len(live) == 1, "exactly one live review submission", [(s["id"][:8], s["attributes"]["state"]) for s in live])
if live:
    items = call("/v1/reviewSubmissions/" + live[0]["id"] + "/items")["data"]
    chk(len(items) >= 1, "version attached to the submission", [i["attributes"].get("state") for i in items])
locs = call(f"/v1/appStoreVersions/{V}/appStoreVersionLocalizations")["data"]
for l in locs:
    a = l["attributes"]
    chk(bool(a.get("description")), f"description [{a.get('locale')}]", (a.get("description") or "")[:50] + "...")
    chk(bool(a.get("keywords")), f"keywords [{a.get('locale')}]", a.get("keywords"))
    sets = call("/v1/appStoreVersionLocalizations/" + l["id"] + "/appScreenshotSets")["data"]
    tot = 0
    for s in sets:
        shots = call("/v1/appScreenshotSets/" + s["id"] + "/appScreenshots")["data"]
        bad = [x for x in shots if x["attributes"].get("assetDeliveryState",{}).get("state") != "COMPLETE"]
        tot += len(shots)
        chk(not bad, f"screenshots complete [{s['attributes'].get('screenshotDisplayType')}]", f"{len(shots)} shots, {len(bad)} incomplete")
    chk(tot > 0, f"screenshot count [{a.get('locale')}]", tot)
rd = call(f"/v1/appStoreVersions/{V}/appStoreReviewDetail")["data"]["attributes"]
chk(bool(rd.get("notes")), "reviewer notes", (rd.get("notes") or "")[:50] + "...")
chk(bool(rd.get("contactEmail")) and bool(rd.get("contactPhone")), "reviewer contact",
    f"{rd.get('contactFirstName')} {rd.get('contactEmail')}")
try:
    ip = call(f"/v2/inAppPurchases/{IAP}")["data"]["attributes"]
    chk(ip.get("state") in ("APPROVED","READY_TO_SUBMIT","WAITING_FOR_REVIEW","IN_REVIEW"),
        "in-app purchase state", ip.get("state"))
except Exception as e:
    chk(False, "in-app purchase", str(e)[:80])
print(f"\n=== {ok} passed, {fail} failed ===")
