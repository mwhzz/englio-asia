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

- **`ADMIN_TOKEN`**: make it long and random, for example from `openssl rand -hex 24`. The default `englio-admin` is only for development.
- Keep the server running with `pm2` or a systemd service, and put **Caddy** or **nginx** in front for HTTPS, e.g. `api.yourdomain.com → localhost:8787`.
- `DB_PATH` sets where the database file is kept (default `server/englio.db`).

## 2. Host the app

```bash
VITE_API_URL=https://api.yourdomain.com/api VITE_VAPID_PUBLIC_KEY=<public key from step 4> npm run build
```

Upload `dist/` to any static host (Cloudflare Pages, Netlify, Vercel). It has to be HTTPS, because the service worker, install and notifications only work over HTTPS. `public/card-autofill.html` is an unrelated test page; delete it from `public/` before building if it shouldn't go online.

## 3. Back up the database

Everything (content, learners, reminders, analytics) is the single SQLite file. Copy it safely once a day:

```bash
sqlite3 server/englio.db ".backup '/backups/englio-$(date +%F).db'"
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

## 5. Things to know

- **District league** (`GET /api/leaderboard`): the week's totals are counted once and reused for 5 minutes, so heavy traffic is cheap.
- **Analytics** (`POST /api/events`): anonymous daily counts only (no device id). The admin dashboard shows the last 30 days.
- **Delete my data** (`DELETE /api/users/:id`): the app's settings page calls this. The Play Store asks for it.
- **Scaling**: one server with SQLite comfortably handles tens of thousands of daily learners. Beyond that, move the same tables to Postgres and run several API servers behind a load balancer.
- **Not built yet** (needs paid services, so it's your call): login with a phone number via SMS OTP, or with Google. Today a learner is a random id on the device, so a new phone means a fresh start.
