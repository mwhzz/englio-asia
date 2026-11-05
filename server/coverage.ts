import type { DatabaseSync } from 'node:sqlite';
import { isForLevel, LEVELS } from '../src/lib/levelCourse.ts';
import { readBoard, readCourse, readCourses, readGrammar, readStories, readWriting } from './course.ts';

/** How much of each kind of content a full release needs (shown as the goal on the admin's Content plan). */
export const TARGETS = { lessons: 40, writing: 10, stories: 20, board: 15 };

/**
 * What's in the content and what's still missing, per level: the admin's Content plan page.
 * Units without levels count for every level ("shared").
 */
export function coverage(db: DatabaseSync) {
  const units = readCourse(db);
  const writing = readWriting(db);
  const board = readBoard(db);
  const grammar = readGrammar(db);
  const courses = readCourses(db);
  const lessons = units.flatMap((u) => u.lessons);
  const words = lessons.flatMap((l) => l.vocab);

  return {
    targets: TARGETS,
    levels: LEVELS.map((level) => {
      const mine = units.filter((u) => isForLevel(u, level));
      const own = mine.filter((u) => u.levels?.length);
      const ls = mine.flatMap((u) => u.lessons);
      return {
        level,
        units: mine.length,
        ownUnits: own.length,
        lessons: ls.length,
        ownLessons: own.reduce((n, u) => n + u.lessons.length, 0),
        words: ls.reduce((n, l) => n + l.vocab.length, 0),
        sentences: ls.reduce((n, l) => n + l.sentences.length, 0),
        writing: writing.filter((t) => !t.levels.length || t.levels.includes(level)).length,
      };
    }),
    board: { ssc: board.filter((t) => t.exam.includes('ssc')).length, hsc: board.filter((t) => t.exam.includes('hsc')).length },
    stories: readStories(db).length,
    grammar: {
      topics: grammar.length,
      withCourse: grammar.filter((t) => courses[t.id]).length,
      // Topics still without a step-by-step course, for the "to do" list.
      missingCourse: grammar.filter((t) => !courses[t.id]).map((t) => ({ id: t.id, title: t.title })),
    },
    words: { total: words.length, withPicture: words.filter((w) => w.image).length, withRecording: words.filter((w) => w.audio).length },
    // Lessons too thin to make a good lesson (fewer than 4 words + sentences).
    thinLessons: units.flatMap((u) =>
      u.lessons.filter((l) => l.vocab.length + l.sentences.length < 4).map((l) => ({ id: l.id, title: l.title, unit: u.title })),
    ),
  };
}
