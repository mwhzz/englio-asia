import type { DatabaseSync } from 'node:sqlite';
import { HttpError, type Request } from './http.ts';

const REASONS = new Set(['wrong-answer', 'mistake', 'audio', 'unclear', 'other']);
const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

/** A learner's "this question is wrong" report (see src/features/report/ReportButton.tsx). No learner id is kept. */
export function addReport(db: DatabaseSync, { body }: Request, now = new Date()) {
  const b = (body ?? {}) as Record<string, unknown>;
  const where = clip(b.where, 120);
  const question = clip(b.question, 500);
  const reason = typeof b.reason === 'string' && REASONS.has(b.reason) ? b.reason : 'other';
  if (!where || !question) throw new HttpError(400, '"where" and "question" are required');
  db.prepare('INSERT INTO reports (at, place, question, answer, reason, note, done) VALUES (?, ?, ?, ?, ?, ?, 0)').run(
    now.toISOString(),
    where,
    question,
    clip(b.answer, 300),
    reason,
    clip(b.note, 300),
  );
  return { ok: true };
}

/** For the admin: open reports, the same question grouped with how many learners reported it. */
export function listReports(db: DatabaseSync) {
  return db
    .prepare(
      `SELECT place, question, COUNT(*) AS n, MAX(at) AS lastAt,
              json_group_array(json_object('id', id, 'reason', reason, 'answer', answer, 'note', note)) AS items
       FROM reports WHERE done = 0 GROUP BY place, question ORDER BY n DESC, lastAt DESC LIMIT 200`,
    )
    .all()
    .map((r) => ({ ...(r as object), items: JSON.parse((r as { items: string }).items) }));
}

/** Marks every report about one question as handled. */
export function closeReports(db: DatabaseSync, { body }: Request) {
  const b = (body ?? {}) as Record<string, unknown>;
  db.prepare('UPDATE reports SET done = 1 WHERE place = ? AND question = ?').run(clip(b.where, 120), clip(b.question, 500));
  return { ok: true };
}
