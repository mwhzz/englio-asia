import type { GrammarCourse } from '../data/grammarCourses/types';
import type { GrammarTopic, Story } from '../types';

/** What the admin wants to see in the app before saving (or, for a lesson, as saved). */
export type Draft =
  | { kind: 'story'; story: Story }
  | { kind: 'topic'; topic: GrammarTopic }
  | { kind: 'course'; topic: GrammarTopic; course: GrammarCourse }
  /** A saved lesson; `lang` is the course it belongs to (another language's draft course is fetched for it). */
  | { kind: 'lesson'; lessonId: string; lang?: string };

const KEY = 'englio-preview-draft';
export const PREVIEW_HASH = '#preview';

/**
 * Shows a draft in the app, in a tab of its own: the admin and the app share this browser's storage,
 * so the draft is handed over there. An open preview tab updates by itself when a new draft arrives.
 */
export function openPreview(draft: Draft): void {
  localStorage.setItem(KEY, JSON.stringify({ ...draft, at: Date.now() }));
  window.open(`./${PREVIEW_HASH}`, 'englio-preview');
}

export function readDraft(): Draft | null {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? 'null');
  } catch {
    return null;
  }
}

export const isPreview = () => typeof location !== 'undefined' && location.hash.startsWith(PREVIEW_HASH);

export const DRAFT_KEY = KEY;
