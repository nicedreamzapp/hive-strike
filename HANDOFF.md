# Hive Strike — where a new session picks up (2026-09-03, 2:50pm)

Paste this into a fresh chat:

> Finish shipping Hive Strike. Read ~/Desktop/PROJECTS/hive-strike/HANDOFF.md first — it has
> every id, every credential path, and the two things still blocking. Google Play is already
> submitted and in review. Apple is one step short. The unlock is $2, not 99 cents.

---

## Done, do not redo

**The game itself, version 1.3.1, is finished and on both phones.**
Sixteen worlds, weapons rebalanced and all reaching a boss, kill effects, quit and resume,
every sprite re-cut, photoreal hero and splash, night worlds actually dark, world label in play.

**Google Play — SUBMITTED, in review.**
App id `4973033220684195095`, package `com.nicedreamz.hivestrike`.
Production 1.3.0 on full rollout, 176 countries plus rest of world, listing complete with icon,
feature graphic and 8 screenshots. All 11 content declarations answered. Rating Everyone 10+.

**App Store — everything filled, not yet submitted.**
App id `6808332314`, version id `abe219e0-f516-4a5a-8e27-96a3c56e6670`,
build `96b1e0b2-4420-47b6-a125-4dd4132def29`, in-app purchase `6808384835`.
Version 1.3.0 with the build attached, description, keywords, subtitle, categories, privacy
policy, age rating 9+, 8 screenshots, reviewer notes, app price free, and the unlock complete
with price, review screenshot and territory availability.

---

## The two things left

### 1. Apple: answer the new social-media age questions, then submit

App Store Connect shows a banner: *"New Age Ratings Responses Required for Social Media …
Answers aren't required until September 7, 2026, unless you are submitting a new app."*
Hive Strike is a new app, so it is required. Answer them under **App Information**; the honest
answers are all no, since the game has no chat, no sharing, no user content and no accounts.

Then submit:

    ssh mini-vps 'cd ~/hs-store && python3 asc_submit.py'

That script sets the reviewer contact and notes, then attaches the version to a review
submission and marks it submitted. It currently fails with
*"This resource cannot be reviewed"* purely because of the unanswered questions above.

Note: `reviewSubmissionItems` has no `inAppPurchaseV2` relationship. A brand new in-app
purchase rides along with the version rather than being attached separately.

### 2. Play: create the in-app product

The Play in-app product does **not** exist yet. `inappproducts` is retired ("Please migrate to
the new publishing API") and the `onetimeproducts` path 404s, so make it in the console:

    Monetize with Play > Products > In-app products > Create product
    Product ID   com.nicedreamz.hivestrike.unlock   (the game looks for exactly this)
    Name         Unlock Hive Strike
    Description  The whole game forever. One payment, no subscription.
    Price        $1.99

Until it exists, the paywall on Android will say "product not found yet" after the trial ends.
Nobody hits that for thirty days, so it is not urgent, but it must exist before then.

---

## Price: $2, not 99 cents

Matt, 2026-09-03, from a customer's email: charge $2 for everything now. Song Forge is $2.99,
the rest are $2. The Apple unlock is on the **1.99** tier (Apple has no 2.00 point). The code
constant in `src/22_store.js` and all listing copy say $1.99. The paywall shows whatever price
the store reports at runtime, so the constant is only a fallback.

**Still says 99c and needs fixing:** the Play store listing (short and full description, and
the release note) — it is in review with the old price. Edit it in the console or via
`hs-store/play_listing.py` on the mini and resubmit.

---

## How to reach things

- **The mini**: `ssh mini` over the LAN, and `ssh mini-vps` when the LAN is down, which happens.
  The mini holds both store keys: `~/.playconsole/google-play-sa.json` and
  `~/.appstoreconnect/private_keys/AuthKey_VSXKZZ79TK.p8` (issuer `1ab8acba-26d0-4a22-b2e4-96398ed7ade5`).
- **Scripts on the mini**, all in `~/hs-store/`: `play_listing.py`, `asc_setup.py`, `asc_shots.py`,
  `asc_iap.py`, `asc_submit.py`, `reprice_copy.py`.
- **Browser work**: Matt's own Brave with the debug port. If it is not listening on 9222,
  `pkill -f "Brave Browser"` then `open -a "Brave Browser" --args --remote-debugging-port=9222`.
  Play Console fights automation: ordinary `.click()` is ignored, so click by dispatching real
  mouse events at an element's measured position.
- **Tracking**: `app-watch` on the mini reports both stores to the HQ dashboard twice a day.
  Apple download numbers need an API key with the Sales role; the current key returns 403.
- **Builds**: `npm run build`, then `npx cap sync`. Android AAB is built on the mini with
  `./gradlew bundleRelease` (signing from `android/keystore.properties`). iOS is
  `xcodebuild -workspace ios/App/App.xcworkspace -scheme App -configuration Release -sdk iphoneos`
  then `xcrun altool --upload-app`.
