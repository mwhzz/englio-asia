import { API_BASE } from './api';

/**
 * Anonymous counts for the admin's lesson funnel: which lessons are started and finished, and which
 * exercises are missed most. No device id is sent, and events are batched into one small request.
 */
export type EventName = 'lesson_start' | 'lesson_done' | 'mistake' | 'story_done' | 'course_done' | 'reminder_ask';

const FLUSH_MS = 30_000;
const counts = new Map<string, number>();
let timer: ReturnType<typeof setTimeout> | null = null;

export function track(name: EventName, key: string): void {
  // The admin trying a draft isn't a learner.
  if (location.hash.startsWith('#preview')) return;
  const id = `${name}\n${key.slice(0, 120)}`;
  counts.set(id, (counts.get(id) ?? 0) + 1);
  timer ??= setTimeout(flush, FLUSH_MS);
}

/** Sends what's counted so far; sendBeacon survives the tab closing. */
export function flush(): void {
  if (timer) clearTimeout(timer);
  timer = null;
  if (!counts.size) return;
  const events = [...counts].map(([id, n]) => {
    const [name, key] = id.split('\n');
    return { name, key, n };
  });
  counts.clear();
  const body = JSON.stringify({ events });
  const url = `${API_BASE}/events`;
  try {
    if (navigator.sendBeacon?.(url, body)) return;
  } catch {
    // Fall through to fetch.
  }
  fetch(url, { method: 'POST', body, keepalive: true }).catch(() => undefined);
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && flush());
}
