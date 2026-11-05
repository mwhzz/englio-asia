import { createApi } from './app.ts';
import { DB_PATH, openDb } from './db.ts';
import { seedWriting } from './seed.ts';

const PORT = Number(process.env.PORT ?? 8787);
const DEV_TOKEN = 'englio-admin';
const token = process.env.ADMIN_TOKEN ?? DEV_TOKEN;

const db = openDb();
// A database made before writing practice existed gets the built-in tasks once (later edits are the admin's).
if (!db.prepare(`SELECT 1 FROM meta WHERE key = 'writing_seeded'`).get()) {
  if (!db.prepare('SELECT 1 FROM writing_tasks').get()) seedWriting(db);
  db.prepare(`INSERT INTO meta (key, value) VALUES ('writing_seeded', '1')`).run();
}
createApi(db, token).listen(PORT, () => {
  console.log(`Englio API on http://localhost:${PORT}  (database: ${DB_PATH})`);
  if (token === DEV_TOKEN) console.log(`Admin token: "${DEV_TOKEN}" — set ADMIN_TOKEN before putting this online.`);
});
