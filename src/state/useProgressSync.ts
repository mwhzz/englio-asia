import { appHeaders } from '../lib/appHeaders';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { API_BASE } from '../lib/api';
import { sameProgress } from '../lib/mergeProgress';
import type { Progress } from '../lib/progress';

export const DEVICE_KEY = 'englio-device-id';
/** Wait for a quiet moment so a lesson's many small changes go up as one request. */
const DEBOUNCE_MS = 3000;

/** A random id for this device, kept in storage (until there are real accounts). */
export function deviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return 'no-storage';
  }
}

/** saved: the server has everything. waiting: a change is about to go up. offline: it couldn't, and will retry. */
export type SyncStatus = 'saved' | 'waiting' | 'offline';

let status: SyncStatus = 'saved';
const listeners = new Set<() => void>();
const setStatus = (next: SyncStatus) => {
  if (next === status) return;
  status = next;
  listeners.forEach((fn) => fn());
};

/** The sync status, for the "not saved to the server yet" note. */
export const useSyncStatus = () =>
  useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => status,
  );

/**
 * Sends progress to the server a few seconds after it changes (and once at startup), once onboarding
 * is done. The server merges it with what it has (another phone may have added to it, see
 * lib/mergeProgress.ts) and answers with the result, which this phone then takes. When the network is
 * down it tries again as soon as it's back.
 */
export function useProgressSync(progress: Progress, enabled: boolean, adopt: (merged: Progress) => void): void {
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const again = () => setRetry((n) => n + 1);
    window.addEventListener('online', again);
    return () => window.removeEventListener('online', again);
  }, []);

  useEffect(() => {
    if (!enabled || !progress.profile) return;
    setStatus('waiting');
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/users/${deviceId()}`, {
          method: 'PUT',
          headers: appHeaders(),
          body: JSON.stringify({ progress }),
          keepalive: true,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const merged = ((await res.json()) as { progress?: Progress }).progress;
        setStatus('saved');
        if (merged && !sameProgress(merged, progress)) adopt(merged);
      } catch {
        setStatus('offline');
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [progress, enabled, retry, adopt]);
}
