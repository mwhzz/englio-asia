import { appHeaders } from './appHeaders';
import { STORAGE_KEY } from '../state/ProgressContext';
import { DEVICE_KEY, deviceId } from '../state/useProgressSync';
import { API_BASE } from './api';
import { mergeProgress } from './mergeProgress';
import type { Progress } from './progress';

export async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: appHeaders(),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
  return res.json() as Promise<T>;
}

/** This learner's backup code; saves the latest progress first so the code brings everything. */
export async function getBackupCode(progress: Progress): Promise<string> {
  const id = deviceId();
  await fetch(`${API_BASE}/users/${id}`, { method: 'PUT', headers: appHeaders(), body: JSON.stringify({ progress }) });
  return (await post<{ code: string }>(`/users/${id}/code`)).code;
}

/** What this phone has learned so far (null on a fresh phone or before onboarding). */
function localProgress(): Progress | null {
  try {
    const p = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Progress | null;
    return p?.profile ? p : null;
  } catch {
    return null;
  }
}

/**
 * Makes this phone the learner with `code`: takes over their id and progress, then reloads. Anything
 * already learned on this phone is kept too (merged in, see lib/mergeProgress.ts), never wiped.
 * Throws with `status` 404 when no one has that code (429 when tried too often).
 */
export async function restoreFrom(code: string): Promise<void> {
  const { id, progress } = await post<{ id: string; progress: Progress }>('/restore', { code });
  becomeLearner(id, progress);
}

/** This phone becomes learner `id` (from a backup code or a sign-in), keeping what it learned too, then reloads. */
export function becomeLearner(id: string, progress: Progress): void {
  const here = localProgress();
  localStorage.setItem(DEVICE_KEY, id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(here ? mergeProgress(progress, here) : progress));
  location.reload();
}
