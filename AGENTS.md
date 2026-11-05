# Englio: notes for coding agents

Englio is a Duolingo-style app that teaches English to Bangla speakers. It is a React + TypeScript PWA (`src/`), a small Node/SQLite API (`server/`), an admin panel (`admin.html`, `src/admin/`), and an Android app that wraps the website (`android/`, a Trusted Web Activity). The owner talks in Banglish (Bangla in Latin letters) and is new to hosting and app publishing, so explain in Banglish, simply, and say what each step does.

## Commands

```bash
npm install
npm run seed     # once: local database with the course and 30 demo learners
npm run server   # API on :8787
npm run dev      # app on :5173, admin on :5173/admin.html (token: englio-admin)
npm test         # unit + content + API tests (must pass)
npm run e2e      # phone-sized browser tests (first time: npx playwright install chromium)
npm run build    # type-checks app and server, then builds dist/
```

**Done means:** `npm run build`, `npm test` and `npm run e2e` all pass. If something can't be checked (e.g. a real phone), say so plainly.

## How to write code here

- **One feature per file.** A new feature gets its own component/hook/module (see `src/features/*`); don't grow big files.
- **Fast, light, scalable.** React is the only runtime dependency. Don't add packages without asking. The server uses only Node 24 built-ins (`node:sqlite`, `node:http`); Node runs the `.ts` files directly.
- **Look and feel:** follow `docs/STYLE_GUIDE.md` (plain iOS look, Inter + Anek Bangla, no emoji inside exercises).
- **Thumb reach:** answers and buttons sit at the bottom of the screen; feedback comes up as a bottom sheet (`components/Modal.tsx`).
- **Tabs** are শেখো · শোনা-বলা · ব্যাকরণ · প্রোফাইল. The letters tab was removed on purpose; don't bring it back.
- New content kinds must be validated by the server (`server/validate.ts`) so the app can always solve them, and have tests.
- Bangla text in the UI, English learning content inside it via `MixedText`.

## How updates reach users (important)

The Android app only opens `https://<domain>/`. Almost every change goes live **from the server, without a new APK**:

| Change | What to do | Users |
| --- | --- | --- |
| Lessons, grammar, stories, board questions | Edit in the admin panel and save | Get it the next time they open the app |
| App or server code (features, fixes, design) | Deploy to the server (below) | Get it the next time they open the app (on a slow network, the time after) |
| App name, icon, domain, package id, Android settings (e.g. notifications) | Rebuild the APK/AAB and upload to Play | Update from the Play Store |

The service worker (`public/sw.js`) loads the page from the network for up to 3 s, then falls back to the saved copy. Hashed files in `dist/assets/` never change. If you change caching rules, bump `CACHE` in `sw.js`.

## Versions

- **App (web) version:** `version` in `package.json`, [semver](https://semver.org): patch `x.y.Z` for fixes, minor `x.Y.0` for new features, major `X.0.0` for big changes. Currently `0.1.0`. The first public launch is `1.0.0`.
- **Android version:** `versionCode` (integer, +1 on every Play upload) and `versionName` in `android/app/build.gradle`, and the same in `android/twa-manifest.json`. Change them **only** when a new APK/AAB is built.
- The version is baked into the app at build time (`src/lib/version.ts`), shown at the bottom of Profile, and sent with crash reports, so a report says which version broke.
- **While working:** add a plain-words line under `## Unreleased` in `CHANGELOG.md` for anything a learner or admin would notice.
- **Releasing** (from `main`, everything committed): `npm run release -- patch|minor|major`. It checks the changelog has notes, builds, runs unit and browser tests (stops on any failure), bumps `package.json`, dates the changelog entry, commits `Release vX.Y.Z`, tags `vX.Y.Z`, pushes, then waits until `/api/health` on the site reports the new version (the server deploys it by itself). Flags: `--dry-run` (checks and tests only, changes nothing), `--skip-e2e`, `--no-deploy` (don't wait). Code: `scripts/release.mjs`, `scripts/releaseVersion.mjs`.
- To undo a bad release: check out the previous tag's code on a branch, fix forward, and release a new patch (don't move or delete published tags).

## Git

- GitHub: `https://github.com/mwhzz/englio-asia` (**public**, so anything committed is visible to everyone).
- Commit or push **only when the owner asks**. Do work on a branch and merge it into `main` when it's ready; `main` is what gets released and what the server runs.
- Never commit secrets: no `.env`, no tokens, no passwords, no `*.jks`/keystore, nothing from `../englio-keys/`. `android/.gitignore` already ignores builds and keys.
- `.gitattributes` keeps `*.sh` with LF line endings (they run on Linux). Keep it that way.

## The server (demo, live)

- **Domain:** `webpstudio.com` (demo; a final domain comes later). **Server:** DigitalOcean droplet, Singapore, Ubuntu 24.04, 1 GB, IP `165.22.253.84`, login `root` over SSH. The password is the owner's; never write it in the repo or in files.
- **Set up by** `deploy/setup.sh <domain> [email]` (safe to run again; keeps data and keys). Step-by-step in Bangla: `docs/DEPLOY_BN.md`. Every setting: `docs/SERVER.md`.

| What | Where |
| --- | --- |
| Code | `/opt/englio` (built app in `/opt/englio/dist`) |
| Database and uploads | `/var/lib/englio/englio.db`, `/var/lib/englio/media/` |
| Secrets and settings (admin token, push keys, domain) | `/etc/englio.env` (root:englio, 640). Don't print the token into logs or chat unless the owner asks |
| API service | `systemctl status englio-api`, logs `journalctl -u englio-api -f` |
| Web server (HTTPS, static files, `/api` proxy) | Caddy, `/etc/caddy/Caddyfile` |
| Auto-deploy (every minute), hourly reminders, nightly backup (03:30) | `/etc/cron.d/englio`; logs `journalctl -t englio-deploy`, `-t englio-reminders`, `-t englio-backup` |
| Backups (14 days) | `/var/backups/englio` (root only) |
| Downloadable APK for testers | `/opt/englio/public/englio.apk` → `https://<domain>/englio.apk` (server only, not in git) |

### Deploying a change

- **Auto-deploy: every push to `main` goes live by itself.** Every minute the server (`deploy/autodeploy.sh`) checks GitHub; on a new commit it runs `deploy/update.sh`, which builds into `dist-next`, runs `npm test`, and only then swaps it in and restarts the API. If the build or tests fail, the code goes back to the previous commit, the live site is untouched, and that commit isn't retried (push a fix). Log: `journalctl -t englio-deploy -n 80`. So **never push untested or half-done work to `main`**: work on a branch and merge when it's ready. By hand on the server: `sudo bash /opt/englio/deploy/update.sh` (`--no-pull` to rebuild what's there).
- After deploying, check: `curl https://<domain>/api/health` returns `{"ok":true,"version":"<new version>"}`, and the app opens without console errors.
- Test a reminder right away: `cd /opt/englio && set -a && . /etc/englio.env && set +a && node server/sendReminders.ts --test <device id>` (device id from admin → Learners).

### Moving to the final domain

1. Point the new domain's DNS `A` record to the server IP.
2. Run `sudo bash deploy/setup.sh <new-domain> [email]` again.
3. Regenerate and rebuild the Android app for the new domain (same package id, same key) and raise `versionCode`.
4. Progress saved on phones is tied to the old domain: testers bring it back with their backup code or phone sign-in. So launch on Play with the final domain, not the demo one.

## The Android app

- **Project:** `android/` (package `app.englio.twa`, notifications on so reminders show as the app's own, minSdk 24 = Android 7+). Made by `scripts/twa-generate.cjs` from the live site's manifest; run it again only when the domain, name or icons change.
- **Build:** `bash android/build.sh` (Git Bash on Windows) → `android/release/englio-<version>.apk` (install directly) and `.aab` (Play Store), both signed. It needs JDK 17 in `~/.bubblewrap/jdk-17*` (Bubblewrap requires 17; the system JDK 21 is not used) and the Android SDK in `%LOCALAPPDATA%\Android\Sdk`.
- **Signing key:** `C:\Users\tp\Documents\zawad\englio-keys\` (`englio-upload.jks`, `PASSWORDS.txt`), outside the repo. Without it the Play app can never be updated. Never move it into the repo, print it, or upload it anywhere.
- **Site ↔ app link:** `public/.well-known/assetlinks.json` lists the upload key's SHA-256. After the first Play upload, **add** Play's *App signing key* SHA-256 (Play Console → Setup → App signing) to the same list and deploy; otherwise the Play version shows a browser bar.
- Play Store steps, forms and policies: `docs/PLAY_STORE.md`. Englio Plus (bKash) stays hidden in the app until bKash keys are set on the server; Google requires Play Billing for digital goods sold inside a Play app, so keep it hidden in the Play version.

## Docs

`README.md` (overview and layout) · `docs/STYLE_GUIDE.md` (design) · `docs/SERVER.md` (server settings) · `docs/DEPLOY_BN.md` (deploy guide in Bangla) · `docs/PLAY_STORE.md` (publishing). Update the relevant doc when you change how something works.
