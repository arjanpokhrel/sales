# Android build — NepaReady (`np.nepaready.app`)

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

## 4. Release APK / AAB (for distribution / Play)

1. Create a keystore once (keep the passwords safe — losing them bricks updates):
   ```bash
   keytool -genkeypair -v -keystore nepready-release.jks -alias nepready \
     -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Add signing config to `client/android/app/build.gradle` (or via
   `gradle.properties`, never commit the passwords).
3. Build:
   ```bash
   ./gradlew assembleRelease        # APK
   ./gradlew bundleRelease          # AAB (Play Store)
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
