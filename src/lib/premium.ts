import { deviceId } from '../state/useProgressSync';
import { API_BASE } from './api';
import { isAndroidApp } from './playApp';

const KEY = 'englio-plus-until';

/** Englio Plus (unlimited hearts) until this time, as last confirmed by the server; kept so it works offline. */
export function plusUntil(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export const isPlus = (now = new Date()) => {
  const until = plusUntil();
  return !!until && until > now.toISOString();
};

/** Asks the server (the only place a payment is confirmed) and remembers the answer. */
export async function refreshPlus(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/users/${deviceId()}/premium`);
    if (!res.ok) return plusUntil();
    const { until } = (await res.json()) as { until: string | null };
    if (until) localStorage.setItem(KEY, until);
    else localStorage.removeItem(KEY);
    return until;
  } catch {
    return plusUntil();
  }
}

/** Whether payments are switched on, and the plan (price in taka, days). */
export async function plusInfo(): Promise<{ available: boolean; price: number; days: number } | null> {
  // Inside the Android (Play) app there is no bKash: Google requires Play Billing there.
  if (isAndroidApp()) return null;
  try {
    const res = await fetch(`${API_BASE}/premium/info`);
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

/** Sends the learner to bKash to pay; they come back to the app with #premium=ok (or failed / cancelled). */
export async function buyPlus(): Promise<void> {
  const res = await fetch(`${API_BASE}/users/${deviceId()}/premium/checkout`, { method: 'POST' });
  if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
  location.href = ((await res.json()) as { url: string }).url;
}
