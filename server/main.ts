import { createApi } from './app.ts';
import { DB_PATH, openDb } from './db.ts';
import { seedWriting } from './seed.ts';
import { trimActiveDays } from './stats.ts';
import { checkStuckPayments } from './premium.ts';

const PORT = Number(process.env.PORT ?? 8787);
const DEV_TOKEN = 'englio-admin';
const token = process.env.ADMIN_TOKEN ?? DEV_TOKEN;

const db = openDb();
// A database made before writing practice existed gets the built-in tasks once (later edits are the admin's).
if (!db.prepare(`SELECT 1 FROM meta WHERE key = 'writing_seeded'`).get()) {
  if (!db.prepare('SELECT 1 FROM writing_tasks').get()) seedWriting(db);
  db.prepare(`INSERT INTO meta (key, value) VALUES ('writing_seeded', '1')`).run();
}
// Old practice days aren't needed for the numbers; forget them once a day.
trimActiveDays(db);
setInterval(() => trimActiveDays(db), 24 * 60 * 60 * 1000).unref();

// Payments left halfway (paid, but the browser closed before bKash sent the learner back) get their Plus.
setInterval(() => {
  checkStuckPayments(db)
    .then((r) => (r.credited || r.expired) && console.log(`bKash check: ${r.credited} credited, ${r.expired} expired`))
    .catch((e) => console.error('bKash check failed:', e));
}, 10 * 60 * 1000).unref();

createApi(db, token).listen(PORT, () => {
  console.log(`Englio API on http://localhost:${PORT}  (database: ${DB_PATH})`);
  if (token === DEV_TOKEN) console.log(`Admin token: "${DEV_TOKEN}" — set ADMIN_TOKEN before putting this online.`);
});
