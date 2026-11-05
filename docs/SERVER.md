# Putting Englio online

The app side is done. These are the remaining server steps, in order.

## 1. Host the API

Any small Linux server with **Node 24** works (a $5–6/month VPS from DigitalOcean, Hetzner or Vultr is plenty to start with).

```bash
git clone <repo> englio && cd englio
npm install
npm run seed                 # once: creates server/englio.db with all built-in content
ADMIN_TOKEN='<long random secret>' PORT=8787 npm run server
```

- **`ADMIN_TOKEN`**: make it long and random, for example from `openssl rand -hex 24`. The default `englio-admin` is only for development. Whoever has it is the **owner**. Give other people their own token from the admin panel's **Team** page (editors can change content only; every change is listed under **Activity**).
- Keep the server running with `pm2` or a systemd service, and put **Caddy** or **nginx** in front for HTTPS, e.g. `api.yourdomain.com → localhost:8787`.
- **`TRUST_PROXY=1`**: set this when Caddy, nginx or Cloudflare is in front. Without it, every request seems to come from the proxy, and the rate limits (300 requests per 5 minutes per address; 10 backup-code tries and 20 wrong admin tokens per 15 minutes) would hit everyone at once.
- `DB_PATH` sets where the database file is kept (default `server/englio.db`), and `MEDIA_DIR` where uploaded pictures and recordings go (default `server/media/`).

## 2. Host the app

```bash
VITE_API_URL=https://api.yourdomain.com/api VITE_VAPID_PUBLIC_KEY=<public key from step 4> npm run build
```

Upload `dist/` to any static host (Cloudflare Pages, Netlify, Vercel). It has to be HTTPS, because the service worker, install and notifications only work over HTTPS.

## 3. Back up the database

Everything (content, learners, reminders, analytics) is the single SQLite file, plus the uploaded pictures and recordings in `server/media/`. Copy both once a day:

```bash
sqlite3 server/englio.db ".backup '/backups/englio-$(date +%F).db'"
rsync -a server/media/ /backups/media/
```

Keep a copy off the server too, e.g. on Backblaze B2 or Google Drive, and delete copies older than about 30 days.

## 4. Daily reminders (push notifications)

The app already asks for permission, subscribes, and stores each learner's hour (`PUT /api/users/:id/push`). The service worker shows the notification. To start sending:

```bash
npm install web-push
npx web-push generate-vapid-keys          # gives a public and a private key
```

1. Build the app with `VITE_VAPID_PUBLIC_KEY=<public key>` (step 2).
2. Run the sender once an hour, at five past the hour:

```cron
5 * * * * cd /path/englio && VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=mailto:you@yourdomain.com node server/sendReminders.ts
```

It only notifies learners at their chosen hour (in their own time zone) on days they haven't earned XP yet, and it forgets subscriptions the phone has turned off.

## 5. Sign-in with a phone number or Google

The app's Settings → অ্যাকাউন্ট links a phone number (a 6-digit code by SMS) or Google account to a learner's progress.

- **SMS**: set `SMS_API_URL` to your Bangladeshi SMS gateway's send URL, with `{to}` and `{text}` where the number and message go, e.g. `https://gateway.example/api/send?api_key=KEY&to={to}&msg={text}`. Without it the code is only printed in the server log (fine for development). Each code is valid for 10 minutes and 5 tries, and requests are rate-limited.
- **Never set `OTP_DEV_ECHO=1` on a real server**: it returns the code in the response, and is only for the automated tests.
- **Google**: create an OAuth "Web application" client in Google Cloud Console (authorized JavaScript origin: your app's address), then set `GOOGLE_CLIENT_ID` on the server and `VITE_GOOGLE_CLIENT_ID` (the same value) when building the app. The button only appears once it's set.

## 6. Englio Plus (bKash)

Plus gives unlimited hearts. It's off (and hidden in the app) until all of these are set:

```
BKASH_BASE_URL=https://tokenized.pay.bka.sh/v1.2.0-beta      # sandbox: https://tokenized.sandbox.bka.sh/v1.2.0-beta
BKASH_APP_KEY=…  BKASH_APP_SECRET=…  BKASH_USERNAME=…  BKASH_PASSWORD=…   # from your bKash merchant (PGW) account
PUBLIC_API_URL=https://api.yourdomain.com/api                # bKash sends the learner back to PUBLIC_API_URL/premium/callback
APP_URL=https://yourdomain.com                               # …and the server then forwards them to the app
PREMIUM_PRICE=99   PREMIUM_DAYS=30                           # optional: the plan
```

Get a merchant account with bKash's "Tokenized Checkout" (PGW). Test with their sandbox credentials first. A payment is only counted after the server confirms it with bKash ("execute"), and paying again adds days on top. Payments are in the `payments` table, and who has Plus until when is in `premium`.

## 7. Things to know

- **District league** (`GET /api/leaderboard`): the week's totals are counted once and reused for 5 minutes, so heavy traffic is cheap.
- **Analytics** (`POST /api/events`): anonymous daily counts only (no device id). The admin dashboard shows the last 30 days.
- **Delete my data** (`DELETE /api/users/:id`): the app's settings page calls this. People without the app can use `delete.html` with their backup code (`POST /api/delete-by-code`). The Play Store asks for both.
- **Backup codes** (`POST /api/users/:id/code`, `POST /api/restore`): a learner's 10-character code brings their progress to a new phone. This is the "account" until there's a real login.
- **Fair play**: a learner's own progress is stored as the app sends it, but the league and the admin's XP numbers count at most 600 XP a day and ignore future dates, so a hand-edited phone can't top the league.
- **Scaling**: one server with SQLite comfortably handles tens of thousands of daily learners. Beyond that, move the same tables to Postgres and run several API servers behind a load balancer.
- **Not built yet** (needs paid services, so it's your call): login with a phone number via SMS OTP, or with Google. Until then, a learner moves to a new phone with their backup code (Profile → Settings → ব্যাকআপ কোড).
