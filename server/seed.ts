import type { DatabaseSync } from 'node:sqlite';
import { BUNDLED_COURSE } from '../src/data/course.ts';
import { DISTRICTS } from '../src/data/districts.ts';
import { BUNDLED_GRAMMAR } from '../src/data/grammar/index.ts';
import { BUNDLED_COURSES } from '../src/data/grammarCourses/index.ts';
import { BUNDLED_STORIES } from '../src/data/stories.ts';
import { BUNDLED_BOARD } from '../src/data/board/index.ts';
import type { BoardTopic } from '../src/data/board/types.ts';
import { BUNDLED_WRITING } from '../src/data/writing/tasks.ts';
import type { WritingTask } from '../src/data/writing/types.ts';
import type { GrammarCourse } from '../src/data/grammarCourses/types.ts';
import type { GrammarTopic, Story, Unit } from '../src/types.ts';
import { bumpContentVersion, transaction } from './db.ts';
import { saveProgress } from './users.ts';

const NAMES = [
  'Rahim', 'Karim', 'Nusrat', 'Tanvir', 'Ayesha', 'Fahim', 'Sadia', 'Rakib', 'Mim', 'Arif',
  'Jannat', 'Sakib', 'Tasnim', 'Imran', 'Riya', 'Hasan', 'Lamia', 'Shuvo', 'Nabila', 'Mehedi',
  'Farzana', 'Zawad', 'Sumaiya', 'Rafi', 'Tania', 'Ashik', 'Priya', 'Nayeem', 'Sharmin', 'Tamim',
];
const CLASSES = [...Array.from({ length: 12 }, (_, i) => `class-${i + 1}`), 'university', 'other'];

/** A tiny seeded random generator, so the demo data is the same every time. */
function random(seed: number) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

/** Replaces all course content with `units`. */
export function seedCourse(db: DatabaseSync, units: Unit[] = BUNDLED_COURSE): void {
  transaction(db, () => {
    // Only the Bangla course is built in; other languages' content (made in the admin) is kept.
    db.exec("DELETE FROM units WHERE lang = 'bn';");
    const unit = db.prepare('INSERT INTO units (id, position, title, title_bn, color, tips, levels) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const lesson = db.prepare('INSERT INTO lessons (id, unit_id, position, title, title_bn) VALUES (?, ?, ?, ?, ?)');
    const item = db.prepare('INSERT INTO items (lesson_id, kind, position, data) VALUES (?, ?, ?, ?)');
    units.forEach((u, ui) => {
      unit.run(u.id, ui, u.title, u.titleBn, u.color, JSON.stringify(u.tips), JSON.stringify(u.levels ?? []));
      u.lessons.forEach((l, li) => {
        lesson.run(l.id, u.id, li, l.title, l.titleBn);
        const rows: [string, unknown[]][] = [
          ['vocab', l.vocab],
          ['sentence', l.sentences],
          ['fill', l.fills],
          ['gaps', l.gaps ?? []],
          ['grammar', l.grammar ?? []],
          ['dialog', l.dialogs ?? []],
        ];
        let position = 0;
        for (const [kind, list] of rows) for (const data of list) item.run(l.id, kind, position++, JSON.stringify(data));
      });
    });
    bumpContentVersion(db);
  });
}

/** Replaces all grammar topics with `topics`. */
export function seedGrammar(db: DatabaseSync, topics: GrammarTopic[] = BUNDLED_GRAMMAR): void {
  transaction(db, () => {
    db.exec("DELETE FROM grammar WHERE lang = 'bn'");
    const insert = db.prepare('INSERT INTO grammar (id, position, data) VALUES (?, ?, ?)');
    topics.forEach((t, i) => insert.run(t.id, i, JSON.stringify(t)));
    bumpContentVersion(db);
  });
}

/** Replaces all grammar courses with `courses`. */
export function seedCourses(db: DatabaseSync, courses: Record<string, GrammarCourse> = BUNDLED_COURSES): void {
  transaction(db, () => {
    db.exec("DELETE FROM grammar_courses WHERE topic_id NOT IN (SELECT id FROM grammar WHERE lang <> 'bn')");
    const insert = db.prepare('INSERT INTO grammar_courses (topic_id, data) VALUES (?, ?)');
    for (const [topicId, course] of Object.entries(courses)) insert.run(topicId, JSON.stringify(course));
    bumpContentVersion(db);
  });
}

/** Replaces all stories with `stories`. */
export function seedStories(db: DatabaseSync, stories: Story[] = BUNDLED_STORIES): void {
  transaction(db, () => {
    db.exec("DELETE FROM stories WHERE lang = 'bn'");
    const insert = db.prepare('INSERT INTO stories (id, position, data) VALUES (?, ?, ?)');
    stories.forEach((s, i) => insert.run(s.id, i, JSON.stringify(s)));
    bumpContentVersion(db);
  });
}

/** Replaces all board practice topics with `topics`. */
export function seedBoard(db: DatabaseSync, topics: BoardTopic[] = BUNDLED_BOARD): void {
  transaction(db, () => {
    db.exec('DELETE FROM board_topics');
    const insert = db.prepare('INSERT INTO board_topics (id, position, data) VALUES (?, ?, ?)');
    topics.forEach((t, i) => insert.run(t.id, i, JSON.stringify(t)));
    bumpContentVersion(db);
  });
}

/** Replaces all writing tasks with `tasks`. */
export function seedWriting(db: DatabaseSync, tasks: WritingTask[] = BUNDLED_WRITING): void {
  transaction(db, () => {
    db.exec("DELETE FROM writing_tasks WHERE lang = 'bn'");
    const insert = db.prepare('INSERT INTO writing_tasks (id, position, data) VALUES (?, ?, ?)');
    tasks.forEach((t, i) => insert.run(t.id, i, JSON.stringify(t)));
    bumpContentVersion(db);
  });
}

/** Adds `count` made-up learners with believable progress. */
export function seedUsers(db: DatabaseSync, count = 30, now = new Date()): void {
  const rand = random(7);
  const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)];
  const lessonIds = BUNDLED_COURSE.flatMap((u) => u.lessons.map((l) => l.id));
  const day = (ago: number) => new Date(now.getTime() - ago * 86_400_000);
  const key = (d: Date) => d.toISOString().slice(0, 10);

  transaction(db, () => {
    for (let i = 0; i < count; i++) {
      const done = Math.floor(rand() * Math.min(lessonIds.length, 14));
      const seenAgo = Math.floor(rand() * rand() * 14);
      const streak = seenAgo <= 1 ? 1 + Math.floor(rand() * 20) : 0;
      const xpByDay: Record<string, number> = {};
      for (let d = 0; d < 7; d++) if (rand() < 0.6) xpByDay[key(day(seenAgo + d))] = 10 + Math.floor(rand() * 4) * 5;
      saveProgress(
        db,
        `demo-${String(i + 1).padStart(4, '0')}`,
        {
          profile: { name: NAMES[i % NAMES.length], districtId: pick(DISTRICTS).id, classId: pick(CLASSES), joinedAt: key(day(seenAgo + 3 + Math.floor(rand() * 50))) },
          xp: done * 12 + Math.floor(rand() * 40),
          completed: Object.fromEntries(lessonIds.slice(0, done).map((id) => [id, 1 + Math.floor(rand() * 2)])),
          streak,
          lastActiveDay: key(day(seenAgo)),
          hearts: 5,
          heartsUpdatedAt: 0,
          dailyGoal: pick([10, 20, 30]),
          xpByDay,
          lessonsByDay: {},
          secondsByDay: {},
          soundOn: true,
        },
        day(seenAgo),
      );
    }
  });
}
