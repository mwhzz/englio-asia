import type { BoardTopic } from '../data/board/types';
import type { GrammarCourse } from '../data/grammarCourses/types';
import type { WritingTask } from '../data/writing/types';
import type { GrammarTopic, Story, Unit } from '../types';
import { API_BASE } from './api';

const CACHE_KEY = 'englio-course-v1';
/** How long startup waits for the server before using the saved copy. */
const WAIT_MS = 1500;

export interface Content {
  units: Unit[];
  /** Missing from servers older than the grammar page. */
  grammar?: GrammarTopic[];
  /** Step-by-step grammar courses by topic id, and the short stories (missing from older servers). */
  courses?: Record<string, GrammarCourse>;
  stories?: Story[];
  /** SSC/HSC board practice topics. */
  board?: BoardTopic[];
  /** Writing practice tasks. */
  writing?: WritingTask[];
}

interface Cached extends Content {
  version: string;
}

/** Enough of a check that a broken download can never replace a working course. */
export function isCourse(units: unknown): units is Unit[] {
  return (
    Array.isArray(units) &&
    units.length > 0 &&
    units.every(
      (u) =>
        typeof u?.id === 'string' &&
        Array.isArray(u.lessons) &&
        u.lessons.every((l: { id?: unknown; vocab?: unknown; sentences?: unknown; fills?: unknown }) =>
          typeof l?.id === 'string' && Array.isArray(l.vocab) && Array.isArray(l.sentences) && Array.isArray(l.fills),
        ),
    )
  );
}

/** Grammar topics good enough to show (each has an id, a title and its lists). */
export function isGrammar(topics: unknown): topics is GrammarTopic[] {
  return (
    Array.isArray(topics) &&
    topics.every(
      (t) =>
        typeof t?.id === 'string' && typeof t.title === 'string' && Array.isArray(t.explain) && Array.isArray(t.examples) && Array.isArray(t.quiz),
    )
  );
}

/** Courses whose every lesson has an id and something to ask. */
export function isCourses(courses: unknown): courses is Record<string, GrammarCourse> {
  return (
    !!courses &&
    typeof courses === 'object' &&
    Object.values(courses).every(
      (c) =>
        Array.isArray(c?.units) &&
        c.units.every((u: { lessons?: unknown }) =>
          Array.isArray(u?.lessons) &&
          u.lessons.every((l: CourseLessonLike) => typeof l?.id === 'string' && !!l.teach && (Array.isArray(l.questions) || (Array.isArray(l.focus) && Array.isArray(l.kinds)))),
        ),
    )
  );
}

interface CourseLessonLike {
  id?: unknown;
  teach?: unknown;
  questions?: unknown;
  focus?: unknown;
  kinds?: unknown;
}

/** Board topics with their questions. */
export function isBoard(topics: unknown): topics is BoardTopic[] {
  return Array.isArray(topics) && topics.every((t) => typeof t?.id === 'string' && Array.isArray(t.exam) && Array.isArray(t.questions) && t.questions.length > 0);
}

/** Writing tasks with a task and a model answer. */
export function isWriting(tasks: unknown): tasks is WritingTask[] {
  return (
    Array.isArray(tasks) &&
    tasks.every((t) => typeof t?.id === 'string' && typeof t.prompt === 'string' && typeof t.model === 'string' && Array.isArray(t.hints) && Array.isArray(t.phrases))
  );
}

/** Stories with their lines and questions. */
export function isStories(stories: unknown): stories is Story[] {
  return Array.isArray(stories) && stories.every((s) => typeof s?.id === 'string' && Array.isArray(s.lines) && s.lines.length > 0 && Array.isArray(s.quiz));
}

function readCache(): Cached | null {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null') as Cached | null;
    return cached && isCourse(cached.units) ? cached : null;
  } catch {
    return null;
  }
}

function writeCache(cached: Cached): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  } catch {
    // Storage full or blocked: the app keeps working from the network or the built-in course.
  }
}

/**
 * The newest course, grammar, grammar courses and stories: from the server when it answers in time (only downloading when it changed),
 * else the copy saved last time, else null (use the built-in content). A late answer is saved for next time.
 */
export async function loadCourse(): Promise<Content | null> {
  const cached = readCache();
  const request = fetch(`${API_BASE}/course`, { headers: cached ? { 'if-none-match': `"course-${cached.version}"` } : {} })
    .then(async (res) => {
      if (res.status === 304) return cached;
      if (!res.ok) return null;
      const body = (await res.json()) as Cached;
      if (!isCourse(body.units)) return null;
      if (!isGrammar(body.grammar)) delete body.grammar;
      if (!isCourses(body.courses)) delete body.courses;
      if (!isStories(body.stories)) delete body.stories;
      if (!isBoard(body.board)) delete body.board;
      if (!isWriting(body.writing)) delete body.writing;
      writeCache(body);
      return body;
    })
    .catch(() => null);

  const timeout = new Promise<null>((done) => setTimeout(() => done(null), WAIT_MS));
  return (await Promise.race([request, timeout])) ?? cached;
}
