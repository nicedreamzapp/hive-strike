# Security policy

## Reporting a vulnerability

Please do not open a public issue for security problems.

Report them privately through GitHub: go to the **Security** tab of this repo and click **Report a vulnerability** ([direct link](https://github.com/nicedreamzapp/hive-strike/security/advisories/new)). Only the maintainer sees the report.

Helpful details: what you found, how to reproduce it, which build (App Store, Google Play or browser) and version, and your device and OS version.

I aim to reply within 3 days and to ship a fix or a clear plan within 30 days, depending on severity. You will be credited in the advisory unless you ask not to be.

## Supported versions

Fixes go into the latest App Store and Google Play builds and the latest code on `main`. Please update the app before reporting if you are on an older build.

## What matters most here

The parts where a mistake could hurt someone:

- the in-app purchase flow in `src/22_store.js`, which uses `cordova-plugin-purchase` and keeps the trial start and unlock state in `localStorage`
- the native shells in `ios/` and `android/`, including release signing in `android/app/build.gradle`, which reads the keystore and its passwords from `keystore.properties` or environment variables that must never be committed
- the mobile build in `tools/build_mobile.py` and the billing check in `tools/check_billing_payload.sh`, which decide what ships to the stores
- the privacy promise in `store/privacy.html` that the game collects no personal information
