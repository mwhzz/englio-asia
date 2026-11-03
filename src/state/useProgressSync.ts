import { useEffect } from 'react';
import { API_BASE } from '../lib/api';
import type { Progress } from '../lib/progress';

const DEVICE_KEY = 'englio-device-id';
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

/** Sends progress to the server a few seconds after it changes, once onboarding is done. Failures are ignored. */
export function useProgressSync(progress: Progress): void {
  useEffect(() => {
    if (!progress.profile) return;
    const timer = setTimeout(() => {
      fetch(`${API_BASE}/users/${deviceId()}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ progress }),
        keepalive: true,
      }).catch(() => {
        // Offline: the next change sends everything again.
      });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [progress]);
}
