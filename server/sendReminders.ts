import { openDb } from './db.ts';
import { deletePush, dueReminders, reminderMessage } from './reminders.ts';
import { countEvent } from './events.ts';

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

// `node server/sendReminders.ts --test <learner id>`: sends one reminder to that learner right now, to check it arrives.
const testId = process.argv[process.argv.indexOf('--test') + 1];
if (process.argv.includes('--test')) {
  const row = db
    .prepare('SELECT p.subscription, u.name, u.streak FROM push_subs p JOIN users u ON u.id = p.user_id WHERE p.user_id = ?')
    .get(testId ?? '') as { subscription: string; name: string | null; streak: number } | undefined;
  if (!row) {
    console.error(`No reminder is turned on for "${testId}". Turn it on in the app first (Profile → দৈনিক রিমাইন্ডার).`);
    process.exit(1);
  }
  await webpush.default.sendNotification(JSON.parse(row.subscription), JSON.stringify(reminderMessage(row)));
  console.log(`Test reminder sent to ${testId}.`);
  process.exit(0);
}

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
// Counted for the admin's reminder numbers (sent vs opened).
countEvent(db, 'reminder_sent', 'sent', sent);
console.log(`Sent ${sent} reminders.`);
