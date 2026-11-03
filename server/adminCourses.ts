import type { DatabaseSync } from 'node:sqlite';
import { bumpContentVersion, transaction } from './db.ts';
import { HttpError, type Request } from './http.ts';
import { validateCourse } from './validateCourse.ts';

const changed = <T,>(db: DatabaseSync, fn: () => T): T =>
  transaction(db, () => {
    const result = fn();
    bumpContentVersion(db);
    return result;
  });

/** A topic's step-by-step course (404 if it has none yet). */
export function getCourse(db: DatabaseSync, { params }: Request) {
  const row = db.prepare('SELECT data FROM grammar_courses WHERE topic_id = ?').get(params.id) as { data: string } | undefined;
  if (!row) throw new HttpError(404, 'This topic has no course yet');
  return JSON.parse(row.data);
}

/** Creates or replaces a topic's course. */
export function saveCourse(db: DatabaseSync, { params, body }: Request) {
  if (!db.prepare('SELECT 1 FROM grammar WHERE id = ?').get(params.id)) throw new HttpError(404, 'No such topic');
  const course = validateCourse(params.id, body);
  const lessons = course.units.flatMap((u) => u.lessons.map((l) => l.id));
  return changed(db, () => {
    // Lesson ids are how learners' progress remembers lessons, so they must be unique across courses.
    const others = db.prepare('SELECT topic_id, data FROM grammar_courses WHERE topic_id != ?').all(params.id) as { topic_id: string; data: string }[];
    for (const o of others) {
      const taken = (JSON.parse(o.data) as typeof course).units.flatMap((u) => u.lessons.map((l) => l.id));
      const clash = lessons.find((id) => taken.includes(id));
      if (clash) throw new HttpError(409, `Lesson id "${clash}" is already used in the ${o.topic_id} course`);
    }
    db.prepare(
      `INSERT INTO grammar_courses (topic_id, data) VALUES (?, ?)
       ON CONFLICT(topic_id) DO UPDATE SET data = excluded.data`,
    ).run(params.id, JSON.stringify(course));
    return { ok: true, lessons: lessons.length };
  });
}

export function deleteCourse(db: DatabaseSync, { params }: Request) {
  return changed(db, () => {
    if (!db.prepare('DELETE FROM grammar_courses WHERE topic_id = ?').run(params.id).changes) throw new HttpError(404, 'This topic has no course');
    return { ok: true };
  });
}
