import type { CourseLesson, CourseUnit, GrammarCourse, Pos, QuestionKind, WrittenQuestion } from '../data/grammarCourses/types';

/**
 * A whole grammar course as one plain-text document, so the admin can write it like notes:
 *
 *   # Unit title | ইউনিটের নাম
 *   ## lesson-id | Lesson title | লেসনের নাম
 *   - a teaching point (one per line)
 *   > English example | বাংলা মানে
 *   ? question | card (use [word] to underline) | right answer | wrong 1; wrong 2 | why
 *   focus: n, v        (optional: parts of speech for generated questions)
 *   kinds: is, tap     (optional: generated question kinds)
 *   size: 10           (optional: how many questions)
 */
export const COURSE_HELP = `# Unit title | ইউনিটের নাম
## lesson-id | Lesson title | লেসনের নাম
- a teaching point
> English example | বাংলা মানে
? question | card, [word] is underlined | right answer | wrong 1; wrong 2 | why`;

const POS: Pos[] = ['n', 'pro', 'v', 'adj', 'adv', 'prep', 'conj', 'int'];
const KINDS: QuestionKind[] = ['is', 'which', 'tap', 'nounKind', 'pronounFill', 'formFill', 'conjFill', 'dual'];

const cardText = (q: WrittenQuestion) => (q.card && q.mark ? q.card.replace(q.mark, `[${q.mark}]`) : (q.card ?? ''));

export function courseToText(course: GrammarCourse): string {
  const out: string[] = [];
  for (const unit of course.units) {
    out.push(`# ${unit.title} | ${unit.titleBn}`, '');
    for (const l of unit.lessons) {
      out.push(`## ${l.id} | ${l.title} | ${l.titleBn}`);
      if (l.focus?.length) out.push(`focus: ${l.focus.join(', ')}`);
      if (l.kinds?.length) out.push(`kinds: ${l.kinds.join(', ')}`);
      if (l.size) out.push(`size: ${l.size}`);
      for (const p of l.teach.points) out.push(`- ${p}`);
      for (const [en, bn] of l.teach.examples) out.push(`> ${en} | ${bn}`);
      for (const q of l.questions ?? []) out.push(`? ${q.prompt} | ${cardText(q)} | ${q.correct} | ${q.wrong.join('; ')} | ${q.why}`);
      out.push('');
    }
  }
  return out.join('\n').trim() + '\n';
}

/** Reads the text back into a course; a mistake throws an error naming its line. */
export function textToCourse(topicId: string, text: string): GrammarCourse {
  const units: CourseUnit[] = [];
  let lesson: CourseLesson | null = null;

  text.split('\n').forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    const fail = (why: string): never => {
      throw new Error(`Line ${i + 1}: ${why}`);
    };
    const cells = (rest: string, n: number, what: string) => {
      const c = rest.split('|').map((x) => x.trim());
      if (c.length !== n || c.some((x, k) => !x && !(what === 'question' && k === 1))) fail(`a ${what} needs ${n} parts separated by "|"`);
      return c;
    };
    const unit = units[units.length - 1];

    if (line.startsWith('## ')) {
      if (!unit) fail('a lesson must come after a unit line ("# …")');
      const [id, title, titleBn] = cells(line.slice(3), 3, 'lesson');
      if (!/^[a-z0-9-]+$/.test(id)) fail(`lesson id "${id}" may use only a-z, 0-9 and "-"`);
      lesson = { id, title, titleBn, teach: { points: [], examples: [] } };
      unit.lessons.push(lesson);
    } else if (line.startsWith('# ')) {
      const [title, titleBn] = cells(line.slice(2), 2, 'unit');
      units.push({ title, titleBn, lessons: [] });
      lesson = null;
    } else if (!lesson) {
      fail('this line must be inside a lesson ("## …")');
    } else if (line.startsWith('- ')) {
      lesson.teach.points.push(line.slice(2).trim());
    } else if (line.startsWith('> ')) {
      const [en, bn] = cells(line.slice(2), 2, 'example');
      lesson.teach.examples.push([en, bn]);
    } else if (line.startsWith('? ')) {
      const [prompt, card, correct, wrong, why] = cells(line.slice(2), 5, 'question');
      const mark = card.match(/\[([^\]]+)\]/)?.[1];
      const wrongs = wrong.split(';').map((w) => w.trim()).filter(Boolean);
      if (wrongs.includes(correct)) fail('a wrong answer is the same as the right one');
      const q: WrittenQuestion = { prompt, correct, wrong: wrongs, why };
      if (card) q.card = card.replace(/\[([^\]]+)\]/, '$1');
      if (mark) q.mark = mark;
      (lesson.questions ??= []).push(q);
    } else {
      const m = line.match(/^(focus|kinds|size):\s*(.+)$/);
      if (!m) fail('start the line with #, ##, -, >, ? or focus:/kinds:/size:');
      const [, key, value] = m!;
      const list = value.split(',').map((v) => v.trim()).filter(Boolean);
      if (key === 'size') {
        const size = Number(value);
        if (!Number.isInteger(size) || size < 3 || size > 30) fail('size must be a whole number from 3 to 30');
        lesson.size = size;
      } else if (key === 'focus') {
        const bad = list.find((p) => !POS.includes(p as Pos));
        if (bad) fail(`"${bad}" is not one of ${POS.join(', ')}`);
        lesson.focus = list as Pos[];
      } else {
        const bad = list.find((k) => !KINDS.includes(k as QuestionKind));
        if (bad) fail(`"${bad}" is not one of ${KINDS.join(', ')}`);
        lesson.kinds = list as QuestionKind[];
      }
    }
  });

  return { topicId, units };
}
