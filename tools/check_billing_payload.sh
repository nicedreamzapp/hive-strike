#!/bin/zsh
# Fail loudly if a built .ipa or .aab is missing the billing plugin.
# 1.4.1 (iOS 7, Android 4) shipped with an EMPTY cordova_plugins.js and no plugins/ folder,
# because it was built from the mini's tree, where `npx cap sync` cannot run. The buy button
# then said "no store on this device" and Apple rejected it under 2.1(b) on 2026-09-21.
# Run this on every artifact before it is uploaded.   usage: check_billing_payload.sh FILE
set -u
f=$1; fail=0
case $f in
 *.ipa) pub=Payload/App.app/public; fw=$(unzip -l "$f" | grep -c 'Frameworks/CordovaPlugins.framework/') ;;
 *.aab) pub=base/assets/public
        fw=0; for d in $(unzip -Z1 "$f" 'base/dex/*.dex'); do n=$(unzip -p "$f" "$d" | strings | grep -c 'cc/fovea'); fw=$((fw+n)); done ;;
 *) echo "not an ipa or aab: $f"; exit 2 ;;
esac
unzip -p "$f" "$pub/cordova_plugins.js" 2>/dev/null | grep -q 'cordova-plugin-purchase' \
  && echo "ok   cordova_plugins.js lists cordova-plugin-purchase" || { echo "FAIL cordova_plugins.js does not list the billing plugin"; fail=1; }
unzip -l "$f" | grep -q "$pub/plugins/cordova-plugin-purchase/www/store.js" \
  && echo "ok   plugins/cordova-plugin-purchase/www/store.js present" || { echo "FAIL plugin JavaScript missing"; fail=1; }
[ "$fw" -gt 0 ] && echo "ok   native plugin code present" || { echo "FAIL native plugin code missing"; fail=1; }
unzip -p "$f" "$pub/index.html" | grep -q 'hs-store' \
  && echo "ok   index.html carries the current store code" || { echo "FAIL index.html is stale"; fail=1; }
[ $fail = 0 ] && echo "PASS $f" || echo "BLOCKED: do not upload $f"
exit $fail
