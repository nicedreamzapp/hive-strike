# Shipping Hive Strike

Two native shells wrap the same web build. Nothing about the game changes between
desktop, iOS and Android — `dist/` is the app.

## The loop

```
npm run assemble   # src/*.js -> index.html  (prints the hash; build runs this for you)
npm run build      # assemble, then tools/build_mobile.py -> dist/  (incremental; --clean forces a full rebuild)
npm test           # walk all 16 levels headless, report JS errors + draw time
npx cap sync       # copy dist/ into ios/ and android/
npm run ios        # open Xcode
npm run android    # open Android Studio
```

`dist/` is a build artifact and is not in git. `npm run build` rebuilds it in about
seven minutes cold, seconds warm.

## What the build actually does

| | source | dist | why |
|---|---|---|---|
| sprites | 45.0 MB PNG | 3.7 MB WebP | they were ~800 px and get drawn at 35-80. Bugs cut to 320 px, bosses to 768 |
| backgrounds | 24 MB PNG | 1.9 MB WebP | same pixels, a format that is not from 1996 |
| music | 59.0 MB MP3 | 36.7 MB AAC | 96 kbps AAC, and the beds play at 4% volume |
| **total** | **~128 MB** | **~43 MB** | |

Level video is gone as of 2026-09-01: the backgrounds are the paintings drawn as a depth
parallax (`tools/gen_parallax.py`), which took 19 MB and three video decoders out of the app.

Store payload lands near **69 MB** per platform. Google Play's base module limit is
200 MB; Apple's over-the-air limits bite well before that. There is room to grow.

Only two file extensions differ between the source tree and `dist/` — `.png` becomes
`.webp` and `.mp3` becomes `.m4a`. `build_mobile.py` rewrites them and fails loudly if
`index.html` ever stops matching, so the two cannot drift apart silently.

## Native configuration already set

- **App ID** `com.nicedreamz.hivestrike`, name **Hive Strike**
- **Portrait locked** on both platforms, full screen, status bar hidden
- Icons and splash screens generated for every iOS and Android density from
  `assets/icon.png` and `assets/splash.png`. Regenerate with
  `npx @capacitor/assets generate --ios --android --iconBackgroundColor '#0b1a0c' --splashBackgroundColor '#0b1a0c'`
- Landscape splash drawables deleted — the app can never be in landscape

## Still needed before either store will take it

1. **Apple Developer Program** — $99/yr, enrollment can take a few days
2. **Google Play Console** — $25 once
3. A signing certificate on each (Xcode manages Apple's; Android needs a keystore
   kept somewhere safe and backed up — losing it means never updating the app again)
4. **Android Studio + a JDK** — not installed on this machine. Xcode 26.6 is.
5. Privacy policy URL, age rating, screenshots per device class, store description

## Verification before every submission

```
npm run build && npm test
```

Last run: 16/16 levels to the win screen, 0 JS errors, 0.26 ms/frame.
Touch behaviour is covered separately — finger-drag moves without bombing, the
on-screen BOMB and pause buttons fire, the bee rides above the thumb, and the play
field letterboxes inside the safe area on a notched phone.
