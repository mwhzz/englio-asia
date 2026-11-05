import type { DatabaseSync } from 'node:sqlite';
import type { BoardTopic } from '../src/data/board/types.ts';
import type { GrammarCourse } from '../src/data/grammarCourses/types.ts';
import type { WritingTask } from '../src/data/writing/types.ts';
import type { GrammarTopic, Lesson, Level, Story, Unit } from '../src/types.ts';

interface UnitRow {
  id: string;
  title: string;
  title_bn: string;
  color: string;
  tips: string;
  levels: string;
}
interface LessonRow {
  id: string;
  unit_id: string;
  title: string;
  title_bn: string;
}
interface ItemRow {
  lesson_id: string;
  kind: string;
  data: string;
}

// Which lesson field each item kind goes into.
const FIELD = {
  vocab: 'vocab',
  sentence: 'sentences',
  fill: 'fills',
  gaps: 'gaps',
  grammar: 'grammar',
  dialog: 'dialogs',
} as const;

/** A unit's levels, left out when it's for everyone (as in the built-in course). */
function levelsOf(json: string): Pick<Unit, 'levels'> {
  const levels = JSON.parse(json || '[]') as Level[];
  return levels.length ? { levels } : {};
}

/** The whole course from the database, in the same shape as the app's built-in course. */
export function readCourse(db: DatabaseSync): Unit[] {
  const units = db.prepare('SELECT * FROM units ORDER BY position').all() as unknown as UnitRow[];
  const lessons = db.prepare('SELECT * FROM lessons ORDER BY position').all() as unknown as LessonRow[];
  const items = db.prepare('SELECT lesson_id, kind, data FROM items ORDER BY position, id').all() as unknown as ItemRow[];

  const byLesson = new Map<string, Lesson>();
  for (const l of lessons) {
    byLesson.set(l.id, { id: l.id, title: l.title, titleBn: l.title_bn, vocab: [], sentences: [], fills: [], gaps: [], grammar: [], dialogs: [] });
  }
  for (const item of items) {
    const lesson = byLesson.get(item.lesson_id);
    const field = FIELD[item.kind as keyof typeof FIELD];
    if (lesson && field) (lesson[field] as unknown[]).push(JSON.parse(item.data));
  }

  return units.map((u) => ({
    id: u.id,
    title: u.title,
    titleBn: u.title_bn,
    color: u.color,
    ...levelsOf(u.levels),
    tips: JSON.parse(u.tips),
    lessons: lessons.filter((l) => l.unit_id === u.id).map((l) => byLesson.get(l.id)!),
  }));
}

/** Every grammar topic, in order. */
export function readGrammar(db: DatabaseSync): GrammarTopic[] {
  const rows = db.prepare('SELECT data FROM grammar ORDER BY position, id').all() as unknown as { data: string }[];
  return rows.map((r) => JSON.parse(r.data));
}

/** Every grammar course, by topic id, for topics that still exist. */
export function readCourses(db: DatabaseSync): Record<string, GrammarCourse> {
  const rows = db.prepare('SELECT c.topic_id, c.data FROM grammar_courses c JOIN grammar g ON g.id = c.topic_id').all() as unknown as { topic_id: string; data: string }[];
  return Object.fromEntries(rows.map((r) => [r.topic_id, JSON.parse(r.data)]));
}

/** Every story, in order. */
export function readStories(db: DatabaseSync): Story[] {
  const rows = db.prepare('SELECT data FROM stories ORDER BY position, id').all() as unknown as { data: string }[];
  return rows.map((r) => JSON.parse(r.data));
}

/** Every SSC/HSC board practice topic, in order. */
export function readBoard(db: DatabaseSync): BoardTopic[] {
  const rows = db.prepare('SELECT data FROM board_topics ORDER BY position, id').all() as unknown as { data: string }[];
  return rows.map((r) => JSON.parse(r.data));
}

/** Every writing task, in order. */
export function readWriting(db: DatabaseSync): WritingTask[] {
  const rows = db.prepare('SELECT data FROM writing_tasks ORDER BY position, id').all() as unknown as { data: string }[];
  return rows.map((r) => JSON.parse(r.data));
}
