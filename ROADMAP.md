# Hive Strike — post-1.0 roadmap

Locked 2026-08-30. The diagnosis: firing is automatic, so interest has to come from
*where you stand* and *what the world does to you*. Rules over wallpaper. Nothing here
touches the binary sitting in App Store review.

## The taboo list (permanent)

- No more worlds. 16 is already long for a phone session.
- No more weapons. Too many are already "bullets, but angled."
- No skill tree / XP grind / permanent upgrades — they fight the one-HTML-file purity
  and would make a daily seed meaningless (players with different stats can't compare scores).
- No cloud features in gameplay. Local seed, screenshotable score. Leaderboards/accounts/iCloud wait.
- No manual fire. Auto-fire is correct for touch.
- No verb that changes how the *thumb* feels (water drag, ice oversteer, sand slip).
  If a stage rule would need App Store notes starting "controls may feel…", it does not ship.
  Verbs change the STAGE, never the input.

## 1.0.1 — day-one patch  ✅ built 2026-08-30

- `grazeTick()`/`chainTick()` were defined but never called — the whole graze economy and
  chain decay were dead code in 1.0. Now wired into `update()`.
- HOT bullets: a shot whose path clips the bee within 16 frames gets a pulsing green ring.
  Grazing a hot bullet pays double (score + bomb counter). The ring is on the bullet that
  matters, not a random sparkle — greed at the right bullet is the skill.
- Point-blank kills (bee within 84px) score 2× and feed the chain an extra step.
  First-time teach lines for both, same `learned` pattern as chain/graze.

## 1.1 — the second-run hook (zero level-code touch)  ✅ built 2026-08-30

- **Daily Hive**: roster + 1 modifier seeded from the device date. Pure seeder on top of
  `D()` and the loop variable — no new collision, no new movement, no network.
- **Queen's Contract**: pick 2 of ~5 pre-run modifiers (more nectar / smaller hitbox /
  extra bomb / longer chain window / visible graze radius). Score multiplier scales with
  contract greed.
- Modifier ideas for both: boss starts raged, no bombs, graze-only bullets (harmless until
  they blink red), nectar toxic unless you bomb first, reverse-roster night.
- Maybe: Bug-Dex — encyclopedia card per bug type defeated. `BUGINFO` facts already exist
  in 05_state.js; this is a collection screen over data we already have.

## 1.1/1.2 — bosses change JOB at 50%, not just pattern  ✅ 4 of 4 built 2026-08-30
(centipede split · scorpion turret · walking-stick camo · atlas wing-shields —
all verified by tools/test_newsystems.mjs)

PHASE2 today is hp<50% → cry, shake, sp×1.15, one pattern key. That's a difficulty bump,
not a fight. Same HP budget, different question.

**Prove ONE first: Centipede Mother splits into two shorter snakes that pinch** (segment
motion already exists — no new body system). If a 30-second clip of that fight reads as
"new game", clone the approach; if it reads as "two weaker bosses", redesign before cloning.

Then, reusing existing art only:
- Scorpion — tail plants as a turret, body flanks.
- Atlas Moth — wings become two destructible shields; a broken wing side fills with
  grazeable scales.
- Walking Stick — camouflages into the canopy video; only twig-sway gives it away.

## 1.2 — four stage verbs (dedicated QA milestone: full walkthrough + device pass)

Only rules that change the stage, not the thumb:
1. **Crystal** — shots ricochet; your own volley is the puzzle.  ✅ built 2026-08-30
2. **Cave** — light radius around the bee.  ✅ already shipped in worldOverlay()
3. **Hive** — wax drag underfoot.  ✅ already shipped in worldForce() (comb-cell version stays a maybe)
4. **Volcano** — rising ember columns usable as cover or get cooked.  ✅ built 2026-08-30

Wave grammar (fits any milestone, no new species — roles: fodder, shield, sniper, bomber, farmer):
- Elite mid-wave bug with a tiny health bar: kill it to skip the wave, farm it for score.
- Snail as a moving cover plate; ladybugs drop nectar only if they exit alive;
  gnat cloud reaching the bottom becomes a screen-wide bite.

## Set pieces (cheaper than a 17th world, this is what people send to someone)

- Hive collapse: Centipede Mother dies → comb video tears → you fall straight into the
  next world, no score screen between.
- Rooftop blackout: city lights die 4 seconds, only muzzle flash and fireflies.
- Atlas Moth death: music stops (per-world tracks exist), one wingbeat, credits on the loop.
