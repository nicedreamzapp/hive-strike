# Hive Strike press kit

Draft for Matt to review. Anything marked **TODO-VERIFY** is not confirmed by the repo and needs checking before it goes out.

## Fact sheet

| | |
|---|---|
| **Name** | Hive Strike |
| **Developer** | Matt Macosko / Nice Dreamz (Nice Dreamz LLC) |
| **Platforms** | iPhone and iPad (App Store), Android (Google Play). The same build also runs in a desktop browser from `index.html`. |
| **Genre** | Vertical shooter (arcade). Apple: Games / Arcade, Games / Action |
| **Price** | Free download, whole game free for 30 days, then a one-time $1.99 in-app unlock. No subscription, no ads. |
| **Age rating** | Apple 9+ (infrequent cartoon or fantasy violence). Google Play / IARC Everyone 10+ |
| **Current version** | 1.4.1 (Android versionCode 5, iOS build 8), per `package.json`, `android/app/build.gradle`, `ios/App/App.xcodeproj/project.pbxproj`. **TODO-VERIFY** which build is live on each store today. |
| **App Store** | https://apps.apple.com/us/app/id6808332314 |
| **Google Play** | https://play.google.com/store/apps/details?id=com.nicedreamz.hivestrike |
| **Product page** | https://nicedreamzwholesale.com/software/hive-strike/ |
| **Source** | https://github.com/nicedreamzapp/hive-strike (code MIT; art, music, icons and the name all rights reserved) |
| **Press contact** | matt@ineedhemp.com |
| **Data collected** | None. No accounts, analytics, ads or trackers (see `store/privacy.html`). |
| **Downloads** | **TODO-VERIFY.** The README shows a live badge from nicedreamzwholesale.com; no number is stored in the repo, so none is quoted here. |

### Numbers from the repo

- 16 worlds and 16 bosses (`src/07_levels.js`, `src/11_bosses.js`)
- 16 weapons, 5 levels each (`src/05_state.js`, in-game help)
- 48 kinds of bug in the Bug-Dex (README, store listing)
- 8 Queen's Contracts including "no contract", score multipliers from x0.7 to x3 (`src/05_state.js`)
- 49 synthesized bug voices, no sample files (README)
- 3 automatic lower-detail tiers for slow phones (`src/00_boot.js`, `src/20_suspend_resume.js`)
- About 3,100 lines of game code in 24 files under `src/`
- Headless walkthrough test: 16/16 levels to the win screen, 0 JS errors, 0.36 ms per frame (README, "Testing"). It runs on a Mac with Brave installed; there is no CI.

### Release history

There are no git tags in the repo. Dates come from commit history and `HANDOFF.md`. The repo's history starts on 2026-08-30 with the game already playable, so earlier development is not in the log.

| Date | Version | What happened |
|---|---|---|
| 2026-08-30 | 1.1 / 1.2 features | First commit in the repo: Daily Hive, Queen's Contract, boss job changes, stage rules |
| 2026-09-01 | 1.0.2 to 1.1.1 | Depth parallax replaces level video, haptics, Bug-Dex, set pieces, ten new bugs |
| 2026-09-02 | 1.1.2 to 1.2.2 | Low-detail tiers for budget phones, quit and resume, night worlds made dark |
| 2026-09-03 | 1.3.0 / 1.3.1 | Store build: thirty days free then a one-time unlock, price set at $1.99 |
| 2026-09-03 | 1.3.0 | Live on Google Play (commit "Hive Strike is live on Google Play") |
| 2026-09-12 | | Gift codes added to the unlock screen; iPad billing fix |
| 2026-09-15 | 1.4.0 | Difficulty rebuilt as a formula. Live on Google Play, submitted to the App Store |
| 2026-09-16 | 1.4.0 (6), 1.4.1 | iOS scene lifecycle fix; lighter shadows so budget phones hold frame rate |
| 2026-09-21 | 1.4.1 (Android 5, iOS 8) | Billing plugin restored in both builds after an App Store rejection |
| 2026-09-27 | | App Store link added to the README. **TODO-VERIFY** the exact App Store release date. |

### Credits

Matt Macosko wrote the game and the tooling around it. It stands on other people's work:

- **FLUX.1-dev** by Black Forest Labs, run through **ComfyUI**: bug and boss sprites, the sixteen world paintings
- **Depth-Anything-V2-Small**: depth maps for the parallax backgrounds
- **ACE-Step 1.5**: the level and boss music
- **Qwen3-VL-32B-Instruct** by the Qwen team, 4-bit on Apple's **MLX**: sprite orientation checks, with a human sign-off per sprite
- **Capacitor** for the iOS and Android shells, **cordova-plugin-purchase** for the in-app purchase
- Development used Anthropic's **Claude Code**; many commits are co-authored by Claude

All models ran locally on one Mac. No cloud API was used to make the assets.

### Assets

- Icon: `store/graphics/icon-512.png`
- Feature graphic: `store/graphics/feature-1024x500.png`
- Phone screenshots: `store/screens/` (1290x2796), `store/screens_play/` (1080x1920)
- Small screenshots: `docs/shots/` (480x720 JPEGs)
- Gameplay clip, 20 seconds: `media/gameplay.mp4`

## 50-word description

Hive Strike is a vertical shooter you play with one thumb. You are one bee against sixteen worlds of bugs, and every boss changes its fight at half health. Sixteen weapons, forty-eight real insects, a daily run. Free for thirty days, then $1.99 once. No ads, no accounts, nothing collected.

## 150-word description

Hive Strike is a vertical bug shooter for iPhone, iPad and Android. You are one bee. It fires on its own, so you play with one thumb: drag anywhere and the bee rides just above your finger.

There are sixteen worlds, from a sunlit meadow to the inside of the hive, a volcano floor and a crystal cavern, and each ends in a boss. At half health the bosses change what they are doing. The Centipede Mother splits in two and pinches. The Atlas Moth turns its wings into shields.

Sixteen weapons with five levels each, forty-eight kinds of bug with a true fact about each in the Bug-Dex, a Daily Hive and eight contracts that trade risk for score.

The art and music were made on one Mac with open models, and every bug sound is synthesized in code. Free for thirty days, then $1.99 once. No ads or tracking.

## Five feature bullets

- One thumb: auto-fire, drag anywhere, one bomb button
- Sixteen worlds and sixteen bosses that change their fight halfway
- Sixteen weapons, five levels each
- Forty-eight bugs, each with a true fact in the Bug-Dex
- Free for thirty days, then $1.99 once, no ads, collects nothing

## Pitch email to app reviewers

**Subject:** Hive Strike, a one-thumb bug shooter for iPhone and Android

Hi [name],

The Centipede Mother splits into two snakes at half health and comes at you from both sides. She's the boss of world six in Hive Strike, a vertical shooter I made where you're one bee against sixteen worlds of bugs.

The bee fires on its own, so you play it with one thumb. Drag anywhere and it follows just above your finger. Every one of the sixteen bosses changes what it's doing halfway through the fight. The art and music were generated on the Mac on my desk with open models like FLUX and ACE-Step, and the bug sounds are synthesized in code.

It's free for thirty days and then $1.99 once. No ads, no subscription, no accounts, and it collects nothing.

App Store: https://apps.apple.com/us/app/id6808332314
Google Play: https://play.google.com/store/apps/details?id=com.nicedreamz.hivestrike
Press kit and screenshots: [TODO-VERIFY press kit URL]

I can send a gift code that unlocks the full game on either store.

Matt Macosko
Nice Dreamz
matt@ineedhemp.com

**Swap-in second paragraph for accessibility communities:**

You never press fire. The bee shoots on its own, you drag anywhere on the screen to move, and there's one bomb button. It also works with a keyboard or a game controller, music and effects mute separately, and the game lowers its own detail on slow phones. There's no screen reader support and no way to turn off screen shake yet, and I'd rather say that up front.
