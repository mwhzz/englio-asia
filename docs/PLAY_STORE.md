# Publishing on the Play Store

Englio is a PWA, so the Android app is a thin **Trusted Web Activity (TWA)** wrapper around the website, made with Google's Bubblewrap. Do the server steps in `SERVER.md` first, because the app must be live on HTTPS.

## What's already in the repo

| File | What it is |
| --- | --- |
| `public/manifest.webmanifest` | name, colors, PNG and maskable icons |
| `public/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` | made from `icon.svg` / `icon-maskable.svg` by `scripts/make-icons.cjs` |
| `public/privacy.html` | privacy policy (Bangla, with an English summary). **Change the contact email in it.** |
| `public/.well-known/assetlinks.json` | proves the website and the app belong together. **Fill in the fingerprint (step 3).** |
| Settings → "আমার সব তথ্য মুছে ফেলো" | in-app data deletion, which Google requires |

## Steps

1. **Developer account**: [play.google.com/console](https://play.google.com/console), a one-time fee of $25.
2. **Make the Android project**:
   ```bash
   npm i -g @bubblewrap/cli
   bubblewrap init --manifest https://yourdomain.com/manifest.webmanifest
   ```
   Use package id `app.englio.twa`, or change it in `assetlinks.json` to match. Bubblewrap creates a signing key: **keep the key file and its password safe forever**, because without them you can't update the app.
3. **Link the site to the app**: in Play Console → *Setup → App signing*, copy the **SHA-256 certificate fingerprint**. Put it in `public/.well-known/assetlinks.json` and redeploy the site. Check that `https://yourdomain.com/.well-known/assetlinks.json` opens. Without this, the app shows a browser bar at the top.
4. **Build**: `bubblewrap build` gives `app-release-bundle.aab`. Upload it under *Testing → Internal testing* first and try it on a phone.
5. **Store listing**: short and full description (Bangla and English), at least 2 phone screenshots, a 512×512 icon (`public/icon-512.png`), and a 1024×500 feature graphic.
6. **App content forms**:
   - Privacy policy URL: `https://yourdomain.com/privacy.html`
   - Data safety: *collected*: name and app activity (learning progress), *for*: app functionality and analytics, *not shared*, *not sold*, *deletion*: in the app. No location, contacts, phone number or email.
   - Target audience: if you include children under 13, Google's Families policy applies (no ads SDKs, which Englio doesn't have anyway).
   - Content rating questionnaire: Education, no violence and so on.
7. **Production**: new personal developer accounts must run a closed test with at least 12 testers for 14 days before going to production.

## Updating

Content and app updates go live from the website and admin panel; nobody needs to update the Play Store app. Rebuild the `.aab` only when the app name, icon or package details change.
