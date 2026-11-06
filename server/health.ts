import { statSync } from 'node:fs';
import type { DatabaseSync } from 'node:sqlite';
import { SERVER_VERSION } from './version.ts';

/** Where the nightly backup writes "done" (deploy/backup.sh); set BACKUP_STAMP to change it. */
const STAMP = process.env.BACKUP_STAMP ?? '/var/lib/englio/last-backup';

/** For /api/health: the version, that the database answers, and how old the last backup is (hours, null if none). */
export function health(db: DatabaseSync, stamp = STAMP, now = Date.now()) {
  db.prepare('SELECT 1').get();
  let backupAgeHours: number | null = null;
  try {
    backupAgeHours = Math.round((now - statSync(stamp).mtimeMs) / 3_600_000);
  } catch {
    // No backup yet (or a computer without one, like a developer's).
  }
  return { ok: true, version: SERVER_VERSION, db: 'ok', backupAgeHours };
}
