# Android build — Nepal Navigator

> Brand: **Nepal Navigator** (launcher label, app name). Package ID stays
> **`np.nepaready.app`** and the on-device database/keys are unchanged, so
> existing installs update without losing bookmarks or downloads.

Status: see `docs/DATA_COMPLETENESS.md` §6 for the latest verified artifact. (`np.nepaready.app`)

Status: **Android Studio project scaffolded and synced** (`client/android/`).
✅ Debug APK built & installed 2026-10-11: `client/android/app/build/outputs/apk/debug/app-debug.apk`
(11 MB) — assembled here with JDK 21 + SDK 36, installed on a Realme RMX3997
via `adb install`, launch verified (`mCurrentFocus=np.nepaready.app/.MainActivity`).
Build toolchain used: AGP 8.13.0, Gradle 8.14.3, `ANDROID_HOME=$HOME/android-sdk`.

## 1. Requirements

- Android Studio (Hedgehog or newer) with Android SDK Platform 34+
- JDK 17 (bundled with Android Studio)
- Node.js 18+, npm 9+

## 2. Build the web bundle and sync it into the native shell

```bash
cd client
npm install
npm run build                      # outputs client/dist/ (7–8 MB incl. photos)
npx cap sync android               # copies dist → android/app/src/main/assets/public
```

## 3. Debug APK (for testing on your own phones)

```bash
cd client/android
./gradlew assembleDebug            # first run downloads the Gradle distribution
# Output: client/android/app/build/outputs/apk/debug/app-debug.apk
```

Install it on a phone with `adb install app-debug.apk`, or copy the file to
the phone and open it (see §5 Unknown sources).

## 4. Release APK (signed, for distribution)

The keystore lives **outside the repo** (`~/nepnav-release.jks`) and is never
committed. Signing is wired through environment variables only:

```bash
export NEPNAV_KEYSTORE=$HOME/nepnav-release.jks NEPNAV_KEYALIAS=nepnav
export NEPNAV_STOREPASS=$(cat $HOME/nepnav-keystore.pass)
export NEPNAV_KEYPASS=$(cat $HOME/nepnav-keystore.pass)
./gradlew assembleRelease
# Output: client/android/app/build/outputs/apk/release/app-release.apk
# Verify:  apksigner verify --print-certs app-release.apk
```

Without those variables `assembleRelease` still runs but produces an
unsigned APK. To recreate the keystore (do this once, back it up — losing it
bricks future updates):

```bash
keytool -genkeypair -keystore ~/nepnav-release.jks -alias nepnav \
  -keyalg RSA -keysize 2048 -validity 10000
```

## 5. Installing without the Play Store (sideloading)

Android blocks unknown apps by default. On the phone:
**Settings → Security → Install unknown apps → allow** the browser/file
manager you will open the APK with, then open the APK and tap Install.
Debug builds are signed with a debug key — they install fine but cannot
update a release-signed install (uninstall first when switching).

## 6. Permissions & behavior notes

- Location is requested **only** when the user taps a locate/distance
  feature; denying it never crashes the app (distances simply hide).
- No login, no tracking SDKs, no background location.
- Back button: goes back inside the app, exits from Home/Welcome
  (`client/src/native.js` via `@capacitor/app`).
- Status bar: dark `#0B192C` to match the theme.
