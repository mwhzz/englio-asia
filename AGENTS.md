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
- **Brand:** app icon = the "e." (B), logo mark = the learning path (D), never merged; blue night `#2F3BD8` + yellow dot `#FFC93C`, dark = black `#141A2E` + lime `#C6F432`. Files and rules: `brand/README.md`; redraw PNGs with `PW=@playwright/test node scripts/make-icons.cjs`.
- **Owner settings** (feature switches, Plus-only units, Plus price/days) live in `src/data/appSettings.ts` (shared rules), `server/settings.ts` (stored in `meta`, sent with `/api/course`) and `src/lib/appSettings.ts` (`feature()`, `unitLocked()`, `unlimitedHearts()`). A new switchable feature: add it to `FEATURES` and gate it with `feature('id')`. Unit lock is enforced in the app only (the course itself is public).
- **Admin UI** is in Bangla and looks like the app; its menu is `src/admin/adminNav.ts` (sidebar on a computer, tab bar + "আরও" sheet on a phone). Agreed admin plan: memory/`admin-plan` (Settings → Learners → Content → Reports).
- **Languages** (the learner's own language; see memory/global-vision): table `languages` (code, name, native, dir, draft/live), and a `lang` column on `units`, `grammar`, `stories`, `writing_tasks` (old content is `bn`). New content in another language gets ids prefixed with its code (`ar-u1`, `server/languages.ts` `idIn`). `/api/course?lang=` serves one language (Bangla by default; board prep is Bangla only) plus the live languages. In content, the `bn`/`titleBn` fields hold the meaning in *that* language. The admin's language bar is `src/admin/LanguagePicker.tsx` / `useAdminLang.ts`. Seeding only replaces the Bangla content. Next steps: translatable app UI strings + RTL, then a language choice in the app.
- **Audio:** recordings are kept per English text in `audio_clips` (key = `src/lib/audioKey.ts`), set on the admin's শব্দ and অডিও pages (`server/adminAudio.ts`), sent with the course as `audio`, and played by `speak()` (lib/media.ts) instead of the phone's voice; a clip wins over a recording stored on the item itself. One recording serves every lesson, story and language that says that text.
- **Starter content for a language** can be added from a JSON file with `node server/importLanguage.ts <file>` (same checks as the admin; all or nothing; refused if the language already has content). `content/ar-starter.json` is the Arabic starter (3 units, 6 lessons, 3 grammar topics), drafted by AI in Modern Standard Arabic: it needs a native speaker's review before Arabic goes live. Don't add content for the owner unless they ask.
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
| Code | `/opt/englio` (git clone of `main`); the live app is `/opt/englio/dist`, a symlink to the current build in `/opt/englio/releases/` |
| Database and uploads | `/var/lib/englio/englio.db`, `/var/lib/englio/media/` |
| Secrets and settings (admin token, push keys, domain) | `/etc/englio.env` (root:englio, 640). Don't print the token into logs or chat unless the owner asks |
| API service | `systemctl status englio-api`, logs `journalctl -u englio-api -f` |
| Web server (HTTPS, static files, `/api` proxy) | Caddy, `/etc/caddy/Caddyfile` |
| Auto-deploy (every 15 s) | `systemctl status englio-deploy.timer`; logs `journalctl -u englio-deploy`; history `/var/lib/englio/deploys.log` |
| Hourly reminders, nightly backup (03:30) | `/etc/cron.d/englio`; logs `journalctl -t englio-reminders`, `-t englio-backup` |
| Backups (14 days) | `/var/backups/englio` (root only) |
| Downloadable APK for testers | `/opt/englio/public/englio.apk` → `https://<domain>/englio.apk` (server only, not in git) |

### Deploying a change

- **Auto-deploy: every push to `main` goes live by itself, usually within a minute.** A systemd timer (`englio-deploy.timer`) runs `deploy/autodeploy.sh` every 15 s; on a new commit it runs `deploy/update.sh`, which runs `npm ci` only if `package-lock.json` changed, builds into `dist-next`, runs `npm test`, moves the build to `releases/<time>-<commit>` and switches the live `dist` symlink to it in one atomic step (no half-built moment). The API restarts only when `server/` or the version changed. If anything fails, the code goes back to the previous commit, the live site is untouched, and that commit isn't retried (push a fix). **Logs:** `journalctl -u englio-deploy -n 80`; **history** (time, OK/FAILED(step), commit): `/var/lib/englio/deploys.log`. The last 3 builds are kept in `releases/`. So **never push untested or half-done work to `main`**: work on a branch and merge when it's ready. To undo a bad change: `git revert` it and push (it deploys like any commit). By hand on the server: `sudo bash /opt/englio/deploy/update.sh` (`--no-pull` to rebuild what's there).
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

## Review agents

Three read-only reviewers live in `.claude/agents/` (Claude Code picks them up; with other tools, give the agent that file as its brief). Run them before a release or launch, and after big changes:

- `language-auditor`: can a new learner language be added and reach learners using only the admin? Lists what's missing.
- `learner-tester`: uses the app end to end as a new learner on a phone-sized browser (own throwaway server) and reports bugs, dead ends and missing features.
- `admin-ops-auditor`: can the owner run the app at scale (e.g. 1,000 new learners a day, many complaints) with the admin as it is? Lists missing data, workflows and server risks.

They never edit files, push, or touch the live server. Their findings are collected in `docs/GAPS.md`.

## Docs

`README.md` (overview and layout) · `docs/STYLE_GUIDE.md` (design) · `docs/SERVER.md` (server settings) · `docs/DEPLOY_BN.md` (deploy guide in Bangla) · `docs/PLAY_STORE.md` (publishing). Update the relevant doc when you change how something works.
