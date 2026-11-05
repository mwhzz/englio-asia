import { API_BASE } from './api';

/** At most this many reports per visit, so one broken screen can't flood the server. */
const MAX_REPORTS = 5;
let sent = 0;
const seen = new Set<string>();

/** Tells the server about a crash (see server/errors.ts); quiet if offline. No learner id is sent. */
export function reportError(error: unknown, where = location.hash || 'app'): void {
  const e = error instanceof Error ? error : new Error(String(error));
  const key = `${e.message}|${where}`;
  if (sent >= MAX_REPORTS || seen.has(key) || location.hash.startsWith('#preview')) return;
  seen.add(key);
  sent++;
  const body = JSON.stringify({ message: e.message || e.name, stack: e.stack ?? '', where: `${where} · ${import.meta.env.MODE}` });
  fetch(`${API_BASE}/errors`, { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true }).catch(() => undefined);
}

/** Also catches errors outside React (event handlers, timers, promises). */
export function watchErrors(): void {
  window.addEventListener('error', (e) => reportError(e.error ?? e.message, 'window'));
  window.addEventListener('unhandledrejection', (e) => reportError(e.reason, 'promise'));
}
