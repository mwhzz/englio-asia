import { openDb } from './db.ts';
import { deletePush, dueReminders, reminderMessage } from './reminders.ts';

// `node server/sendReminders.ts`, run once an hour (cron: `5 * * * *`). Sends today's reminder to every
// learner whose chosen hour it is and who hasn't learned yet today. Needs the `web-push` package and
// VAPID keys (see docs/SERVER.md): VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:you@domain).

const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) {
  console.error('Set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY and VAPID_SUBJECT first (see docs/SERVER.md).');
  process.exit(1);
}

// Optional package, installed only on the server that sends reminders.
const WEB_PUSH = 'web-push';
const webpush = (await import(WEB_PUSH).catch(() => {
  console.error('Install the sender first: npm install web-push');
  process.exit(1);
})) as unknown as {
  default: {
    setVapidDetails(subject: string, publicKey: string, privateKey: string): void;
    sendNotification(subscription: unknown, payload: string): Promise<unknown>;
  };
};
webpush.default.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const db = openDb();
let sent = 0;
for (const r of dueReminders(db)) {
  try {
    await webpush.default.sendNotification(r.subscription, JSON.stringify(reminderMessage(r)));
    sent++;
  } catch (error) {
    // 404/410: the learner uninstalled or turned notifications off, so forget the subscription.
    const status = (error as { statusCode?: number }).statusCode;
    if (status === 404 || status === 410) deletePush(db, r.userId);
    else console.error(`Reminder to ${r.userId} failed:`, status ?? error);
  }
}
console.log(`Sent ${sent} reminders.`);
