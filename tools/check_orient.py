#!/usr/bin/env python3
"""Nothing should ever come out upside down.

No classifier can be trusted to judge which way a bug faces -- the vision model measured
about 70% accurate on this art, and a wrong call ships a boss facing away from the player.
So this does NOT try to judge orientation. It records that a human LOOKED at each sprite
and approved it, then flags any sprite whose pixels changed since that approval.

  python3 tools/check_orient.py            # report anything that drifted since approval
  python3 tools/check_orient.py --approve  # re-approve every sprite as it stands NOW

Run the plain form after ANY pass that touches art/sprites. Anything it lists must be
looked at by eye before it ships. Never --approve without having actually looked.
"""
import hashlib, json, os, sys, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPR  = os.path.join(ROOT, 'art', 'sprites')
LOCK = os.path.join(ROOT, 'tools', 'orient_lock.json')

def digest(p):
    h = hashlib.sha256()
    with open(p, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()

def sprites():
    return sorted(f for f in os.listdir(SPR) if f.endswith('.png'))

def approve():
    stamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
    data = {'approved': stamp, 'sprites': {f: digest(os.path.join(SPR, f)) for f in sprites()}}
    json.dump(data, open(LOCK, 'w'), indent=1)
    print(f"approved {len(data['sprites'])} sprites as head-down at {stamp}")

def check():
    if not os.path.exists(LOCK):
        print('no orient_lock.json yet -- run with --approve after looking at every sprite')
        return 1
    lock = json.load(open(LOCK))
    old, changed, added, gone = lock['sprites'], [], [], []
    for f in sprites():
        d = digest(os.path.join(SPR, f))
        if f not in old: added.append(f)
        elif old[f] != d: changed.append(f)
    gone = [f for f in old if not os.path.exists(os.path.join(SPR, f))]
    if not (changed or added or gone):
        print(f"OK -- all {len(old)} sprites unchanged since {lock['approved']}, orientation still approved")
        return 0
    print(f"DRIFT since {lock['approved']} -- LOOK AT THESE BY EYE BEFORE SHIPPING:")
    for f in changed: print('  changed:', f)
    for f in added:   print('  new    :', f)
    for f in gone:    print('  missing:', f)
    print('\nRender them with the contact-sheet method and confirm every head points DOWN,')
    print('then re-run with --approve. Do not approve on a classifier\'s say-so.')
    return 1

sys.exit(approve() if '--approve' in sys.argv else check())
