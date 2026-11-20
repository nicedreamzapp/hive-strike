# Contributing

Thanks for taking a look. The game runs on a lot of phones and browsers I do not own, so a bug
report from your device is useful even if you never send code.

## Reporting a problem

Open an [issue](https://github.com/nicedreamzapp/hive-strike/issues/new/choose). The things that
make it quick to fix:

- where you played: the App Store build, the Google Play build, or `index.html` in a browser
- your device and OS version (or browser and version), and the app version if you know it
- the level or boss where it happened, and whether you were using touch, keyboard or a controller
- a screenshot or short recording, and any errors from the browser console

## Running it locally

Open `index.html`. That is the whole install. If you prefer a local server:

```bash
npm run serve
```

You edit the game in `src/`, not in `index.html`. Join the pieces back together with:

```bash
python3 tools/assemble.py
```

For the phone builds, `npm run build` needs Python 3 with Pillow and ffmpeg. See
[docs/SHIPPING.md](docs/SHIPPING.md) for the full loop (`npm run build`, `npx cap sync`,
`npm run ios`, `npm run android`).

## Tests

```bash
node tools/test_walkthrough.mjs
```

It drives a headless browser through all 16 levels and reports JS errors and draw time per frame.
As written it launches Brave from its macOS install path, so it only runs on a Mac with Brave
installed. There is no CI. On other machines, play the levels you touched by hand and watch the
console.

## Pull requests

Small and focused is easiest to review. For big changes, open an issue first so we can talk it
through. Send changes to the files in `src/` and run `tools/assemble.py` so `index.html` matches.
The art, music and icons are not open licensed (see [ASSETS-LICENSE.md](ASSETS-LICENSE.md)), so
please do not send replacements for them.

Please follow the [code of conduct](CODE_OF_CONDUCT.md).
