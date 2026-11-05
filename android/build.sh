#!/usr/bin/env bash
# Builds the signed Play Store bundle (.aab) and an installable .apk into android/release/. Run in Git Bash on Windows:
#   bash android/build.sh
# Needs: JDK 17 in ~/.bubblewrap, the Android SDK, and the signing key in ../englio-keys (see docs/PLAY_STORE.md).
# Before each Play Store upload, raise appVersionCode (and appVersionName) in app/build.gradle and twa-manifest.json.
set -euo pipefail
cd "$(dirname "$0")"

KEYS=${KEYS:-../../englio-keys}
JDK=$(ls -d ~/.bubblewrap/jdk-17* | head -1)
SDK=${ANDROID_HOME:-$LOCALAPPDATA/Android/Sdk}
BT=$(ls -d "$SDK"/build-tools/* | sort -V | tail -1)
PASS=$(sed -n 's/^keystore password: //p' "$KEYS/PASSWORDS.txt")
VERSION=$(sed -n 's/.*versionName "\(.*\)"/\1/p' app/build.gradle)

export JAVA_HOME=$(cygpath -w "$JDK") ANDROID_HOME=$(cygpath -w "$SDK") PATH="$JDK/bin:$PATH"
printf 'sdk.dir=%s\n' "$(cygpath -m "$SDK")" > local.properties
./gradlew.bat assembleRelease bundleRelease --no-daemon -q

mkdir -p release
"$BT/zipalign.exe" -f -p 4 app/build/outputs/apk/release/app-release-unsigned.apk release/aligned.apk
"$BT/apksigner.bat" sign --ks "$(cygpath -w "$KEYS/englio-upload.jks")" --ks-key-alias englio --ks-pass "pass:$PASS" --key-pass "pass:$PASS" --out "release/englio-$VERSION.apk" release/aligned.apk
rm release/aligned.apk
cp app/build/outputs/bundle/release/app-release.aab "release/englio-$VERSION.aab"
jarsigner -keystore "$(cygpath -w "$KEYS/englio-upload.jks")" -storepass "$PASS" -keypass "$PASS" "release/englio-$VERSION.aab" englio >/dev/null
ls -lh release
