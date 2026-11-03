import { STORAGE_KEY } from '../state/ProgressContext';
import { DEVICE_KEY, deviceId } from '../state/useProgressSync';
import { API_BASE } from './api';
import type { Progress } from './progress';

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
  return res.json() as Promise<T>;
}

/** This learner's backup code; saves the latest progress first so the code brings everything. */
export async function getBackupCode(progress: Progress): Promise<string> {
  const id = deviceId();
  await fetch(`${API_BASE}/users/${id}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ progress }) });
  return (await post<{ code: string }>(`/users/${id}/code`)).code;
}

/**
 * Makes this phone the learner with `code`: takes over their id and progress, then reloads.
 * Throws with `status` 404 when no one has that code (429 when tried too often).
 */
export async function restoreFrom(code: string): Promise<void> {
  const { id, progress } = await post<{ id: string; progress: Progress }>('/restore', { code });
  localStorage.setItem(DEVICE_KEY, id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  location.reload();
}
