# Publishing on the Play Store

Englio is a PWA, so the Android app is a thin **Trusted Web Activity (TWA)** wrapper around the website, made with Google's Bubblewrap. Do the server steps in `SERVER.md` first, because the app must be live on HTTPS.

## What's already in the repo

| File | What it is |
| --- | --- |
| `public/manifest.webmanifest` | name, colors, PNG and maskable icons |
| `public/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` | made from `icon.svg` / `icon-maskable.svg` by `scripts/make-icons.cjs` |
| `public/privacy.html` | privacy policy (Bangla, with an English summary). Contact: zawadzarirkhan@gmail.com. |
| `public/.well-known/assetlinks.json` | proves the website and the app belong together. **Fill in the fingerprint (step 3).** |
| Settings → "আমার সব তথ্য মুছে ফেলো" | in-app data deletion, which Google requires |
| `delete.html` | deleting data without the app (backup code or email), the web link Google also asks for. Contact: zawadzarirkhan@gmail.com. |

## Steps

1. **Developer account**: [play.google.com/console](https://play.google.com/console), a one-time fee of $25.
2. **The Android project is already made** in `android/` (package `app.englio.twa`, notifications on, Android 7+), by `scripts/twa-generate.cjs` from the live site's manifest. Run that again only when the domain, name or icons change.
3. **The signing key** is in `../englio-keys/` (outside the repo): `englio-upload.jks` and `PASSWORDS.txt`. **Back both up somewhere safe (e.g. a USB stick and a password manager).** Without them you can never update the app.
4. **Build**: `bash android/build.sh` (Git Bash) gives `android/release/englio-<version>.aab` for the Play Store and `.apk` to install directly. Before every new upload, raise `versionCode` and `versionName` in `android/app/build.gradle`.
   - **Link the site to the app**: `public/.well-known/assetlinks.json` has the upload key's fingerprint, so the directly installed APK opens without a browser bar. After the first Play upload, copy the **App signing key certificate SHA-256** from Play Console → *Setup → App signing* and **add** it to the same list (keep the first one), then redeploy. Without it, the Play Store version shows a browser bar.
   - Upload the `.aab` under *Testing → Internal testing* first and try it on a phone.
5. **Store listing**: short and full description (Bangla and English), at least 2 phone screenshots, a 512×512 icon (`public/icon-512.png`), and a 1024×500 feature graphic.
6. **App content forms**:
   - Privacy policy URL: `https://yourdomain.com/privacy.html`
   - Data deletion URL: `https://yourdomain.com/delete.html`
   - Data safety: *collected*: name, app activity (learning progress), optionally phone number or email (account sign-in), purchase history (Englio Plus via bKash), crash logs; *for*: app functionality, account management, analytics; *not shared*, *not sold*; *deletion*: in the app and on delete.html. No location or contacts.
   - Payments: Google requires Play Billing for digital goods sold *inside* a Play Store app. Englio Plus is sold through bKash, so before publishing either hide the Plus button in the Play Store version, or check Google's current rules for your region (alternative billing programs). The website/PWA can keep bKash.
   - Target audience: if you include children under 13, Google's Families policy applies (no ads SDKs, which Englio doesn't have anyway).
   - Content rating questionnaire: Education, no violence and so on.
7. **Production**: new personal developer accounts must run a closed test with at least 12 testers for 14 days before going to production.

## Updating

Content and app updates go live from the website and admin panel; nobody needs to update the Play Store app. Rebuild the `.aab` only when the app name, icon or package details change.
