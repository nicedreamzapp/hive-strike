# Submitting Hive Strike — the checklist, and every trap we have actually hit

Written 2026-09-15 after shipping 1.4.0 to both stores. Matt: *"that's usually something we do
wrong, and I'm hoping you learn from your mistakes in the past."* So: every mistake below is one
that really happened, with the symptom that made it hard to spot.

**Run `tools/submission_audit.py` on the mini after every submission and read all 21 lines before
telling Matt it is done.** Do not report a submission as complete on the strength of an API call
returning 200. Every failure in this project's history looked like success at the call site.

---

## The traps, in the order they bit us

### 1. A build cannot be attached until its encryption question is answered
**Killed the September 4 submission. Hit again on 2026-09-15.**
`PATCH /v1/appStoreVersions/{id}/relationships/build` answers:

    HTTP 409: The specified pre-release build could not be added.

Nothing in that message mentions encryption. The fix is one call, first:

    PATCH /v1/builds/{buildId}  {"attributes": {"usesNonExemptEncryption": false}}

Then the attach succeeds immediately. **Always answer it right after upload**, before anything else.

### 2. The web payload is not rebuilt by `assemble.py`
`python3 tools/assemble.py` only rewrites `index.html`. The thing that actually ships is `dist/`,
written by `tools/build_mobile.py`, and copied into the native projects by `npx cap sync`.
On 2026-09-15 the Android bundle still held the **September 3** game — twelve days of work were
missing and nothing complained. Always: `npm run build && npx cap sync`, then check the dates:

    ls -la index.html dist/index.html android/app/src/main/assets/public/index.html ios/App/App/public/index.html

### 3. Check what is already in review before submitting anything
On 2026-09-15 app-watch reported Apple `REJECTED`, but the live API said `WAITING_FOR_REVIEW` —
a resubmission had gone in that morning and the cached status was stale. Submitting on top of that
silently cancels a queued review. **Read the live state first** (`asc_state.py`), never a cache.

### 4. Reuse the pending version record, do not create a new one
If the version has not been reviewed yet, `PATCH` its `versionString` and swap the build. That
keeps description, keywords, screenshots, age rating, reviewer notes and the IAP exactly as they
are. Creating a fresh version means rebuilding all of it, which is where metadata gets lost.

### 5. Two errors that are NORMAL and are not failures
- `whatsNew cannot be edited at this time` — there are no release notes on a first release.
- `'inAppPurchaseV2' is not a relationship on reviewSubmissionItems` — a brand new in-app
  purchase rides along with the app version; it cannot be attached separately.

### 6. Bump all four version numbers, not two
`package.json`, `android/app/build.gradle` (**versionName AND versionCode**), and
`ios/App/App.xcodeproj/project.pbxproj` (**MARKETING_VERSION AND CURRENT_PROJECT_VERSION**, which
appear twice each, once per configuration). A repeated versionCode is rejected at upload; a
repeated iOS build number is rejected after a successful-looking upload.

### 7. iOS export needs the profile named explicitly
`xcodebuild -exportArchive` fails with *"requires a provisioning profile"* unless the export
plist carries `signingStyle: manual` and a `provisioningProfiles` dict mapping
`com.nicedreamz.hivestrike` to **HiveStrike AppStore M5 20260911**.

---

## The sequence that worked

    npm run build && npx cap sync                       # payload -> dist -> native
    node tools/hud_overlap.mjs                          # HUD sane at every life/bomb count
    node tools/difficulty_curve.mjs                     # the curve still rises
    node tools/playtest.mjs 3                            # play it through with real lives
    # versions: package.json, build.gradle x2, project.pbxproj x4

    # Android (on the mini, it holds the keystore)
    rsync android/app/src/main/assets/public/ + build.gradle -> mini
    JAVA_HOME=/opt/homebrew/opt/openjdk@21 ./gradlew bundleRelease
    play_upload.py internal "<notes>"   then   play_promote.py <code> "<notes>"

    # iOS (this Mac has Xcode and the distribution identity)
    xcodebuild -workspace ios/App/App.xcworkspace -scheme App -configuration Release \
      -sdk iphoneos -archivePath /tmp/HS.xcarchive archive -allowProvisioningUpdates
    xcodebuild -exportArchive ... (see trap 7)
    scp the ipa to the mini, then:
    API_PRIVATE_KEYS_DIR=~/.appstoreconnect/private_keys xcrun altool --upload-app \
      -f /tmp/HS.ipa -t ios --apiKey VSXKZZ79TK --apiIssuer 1ab8acba-26d0-4a22-b2e4-96398ed7ade5
    # answer the encryption question (trap 1), attach the build, then asc_submit.py

    ssh mini-vps 'python3 submission_audit.py'          # 21 checks, all must pass
