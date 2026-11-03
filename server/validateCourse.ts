import type { CourseLesson, GrammarCourse, Pos, QuestionKind } from '../src/data/grammarCourses/types.ts';
import { HttpError } from './http.ts';

type Obj = Record<string, unknown>;
const POS: Pos[] = ['n', 'pro', 'v', 'adj', 'adv', 'prep', 'conj', 'int'];
const KINDS: QuestionKind[] = ['is', 'which', 'tap', 'nounKind', 'pronounFill', 'formFill', 'conjFill', 'dual'];
const ID = /^[a-z0-9-]{2,60}$/;

const text = (o: Obj, key: string, where: string): string => {
  const v = o?.[key];
  if (typeof v === 'string' && v.trim()) return v.trim();
  throw new HttpError(400, `${where}: "${key}" is required`);
};
const list = (v: unknown, where: string): unknown[] => {
  if (v == null) return [];
  if (!Array.isArray(v)) throw new HttpError(400, `${where} must be a list`);
  return v;
};

function lesson(o: Obj, ids: Set<string>): CourseLesson {
  const id = text(o, 'id', 'Lesson');
  const where = `Lesson ${id}`;
  if (!ID.test(id)) throw new HttpError(400, `${where}: the id may only use a–z, 0–9 and "-"`);
  if (ids.has(id)) throw new HttpError(400, `${where}: two lessons have this id`);
  ids.add(id);

  const teach = (o.teach ?? {}) as Obj;
  const points = list(teach.points, `${where} points`).map(String);
  const examples = list(teach.examples, `${where} examples`).map((e) => {
    if (!Array.isArray(e) || e.length !== 2) throw new HttpError(400, `${where}: each example is [English, বাংলা]`);
    return [String(e[0]), String(e[1])] as [string, string];
  });
  const focus = list(o.focus, `${where} focus`) as Pos[];
  if (focus.some((p) => !POS.includes(p))) throw new HttpError(400, `${where}: unknown part of speech in focus`);
  const kinds = list(o.kinds, `${where} kinds`) as QuestionKind[];
  if (kinds.some((k) => !KINDS.includes(k))) throw new HttpError(400, `${where}: unknown question kind`);
  const questions = list(o.questions, `${where} questions`).map((x) => {
    const q = x as Obj;
    const item = {
      prompt: text(q, 'prompt', where),
      ...(typeof q.card === 'string' && q.card.trim() ? { card: q.card.trim() } : {}),
      ...(typeof q.mark === 'string' && q.mark.trim() ? { mark: q.mark.trim() } : {}),
      correct: text(q, 'correct', where),
      wrong: list(q.wrong, `${where} wrong answers`).map(String).filter(Boolean),
      why: text(q, 'why', where),
    };
    if (!item.wrong.length) throw new HttpError(400, `${where}: "${item.prompt}" needs a wrong answer`);
    if (item.wrong.includes(item.correct)) throw new HttpError(400, `${where}: "${item.prompt}" lists the right answer as wrong`);
    if (item.mark && !item.card?.includes(item.mark)) throw new HttpError(400, `${where}: the underlined word isn't in "${item.card}"`);
    return item;
  });
  const generated = focus.length > 0 && kinds.length > 0;
  if (!generated && !questions.length) throw new HttpError(400, `${where}: write at least one question`);
  const size = o.size == null ? undefined : Number(o.size);
  if (size !== undefined && (!Number.isInteger(size) || size < 3 || size > 30)) throw new HttpError(400, `${where}: size must be 3 to 30`);

  return {
    id,
    title: text(o, 'title', where),
    titleBn: text(o, 'titleBn', where),
    teach: { points, examples },
    ...(focus.length ? { focus } : {}),
    ...(kinds.length ? { kinds } : {}),
    ...(questions.length ? { questions } : {}),
    ...(size ? { size } : {}),
  };
}

/** Checks a grammar course from the admin and returns it cleaned up, so the app can always run it. */
export function validateCourse(topicId: string, body: unknown): GrammarCourse {
  if (!body || typeof body !== 'object') throw new HttpError(400, 'Course must be an object');
  const ids = new Set<string>();
  const units = list((body as Obj).units, 'Units').map((x) => {
    const u = x as Obj;
    const title = text(u, 'title', 'Unit');
    const lessons = list(u.lessons, `Unit ${title} lessons`).map((l) => lesson(l as Obj, ids));
    if (!lessons.length) throw new HttpError(400, `Unit ${title}: add at least one lesson`);
    return { title, titleBn: text(u, 'titleBn', `Unit ${title}`), lessons };
  });
  if (!units.length) throw new HttpError(400, 'Add at least one unit');
  return { topicId, units };
}
