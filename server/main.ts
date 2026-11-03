import { createApi } from './app.ts';
import { DB_PATH, openDb } from './db.ts';

const PORT = Number(process.env.PORT ?? 8787);
const DEV_TOKEN = 'englio-admin';
const token = process.env.ADMIN_TOKEN ?? DEV_TOKEN;

const db = openDb();
createApi(db, token).listen(PORT, () => {
  console.log(`Englio API on http://localhost:${PORT}  (database: ${DB_PATH})`);
  if (token === DEV_TOKEN) console.log(`Admin token: "${DEV_TOKEN}" — set ADMIN_TOKEN before putting this online.`);
});
