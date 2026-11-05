import type { Exercise } from '../types';

const KEY = 'englio-lesson-resume';
/** An unfinished lesson is picked up again for this long; after that it starts over. */
const KEEP_MS = 6 * 60 * 60 * 1000;

/** Where a lesson stopped: its exercises (missed ones re-queued at the end), the current one, and the counts so far. */
export interface LessonSnapshot {
  lessonId: string;
  queue: Exercise[];
  index: number;
  solved: number;
  mistakes: number;
  savedAt: number;
}

/** The unfinished state of this lesson, if it was left recently (the app closed, the phone switched off…). */
export function loadResume(lessonId: string, now = Date.now()): LessonSnapshot | null {
  try {
    const snap = JSON.parse(localStorage.getItem(KEY) ?? 'null') as LessonSnapshot | null;
    if (!snap || snap.lessonId !== lessonId || now - snap.savedAt > KEEP_MS || !snap.queue?.[snap.index]) return null;
    return snap;
  } catch {
    return null;
  }
}

export function saveResume(snap: Omit<LessonSnapshot, 'savedAt'>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...snap, savedAt: Date.now() }));
  } catch {
    // Not saved: the lesson just starts over next time.
  }
}

export function clearResume(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
}
