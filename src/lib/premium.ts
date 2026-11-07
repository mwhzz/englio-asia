import { deviceId } from '../state/useProgressSync';
import { API_BASE } from './api';
import { isAndroidApp } from './playApp';
import { learnerLang } from './learnerLang';

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

export interface PlusInfo {
  /** bKash can be used (website only; never inside the Play app). */
  available: boolean;
  price: number;
  days: number;
  /** 0: no yearly plan. */
  yearPrice: number;
  /** 0: no free trial. */
  trialDays: number;
}

/** Whether payments are switched on, and the plans (price in taka, days). */
export async function plusInfo(): Promise<PlusInfo | null> {
  try {
    const res = await fetch(`${API_BASE}/premium/info`);
    const info = res.ok ? ((await res.json()) as PlusInfo) : null;
    // Inside the Android (Play) app there is no bKash (Google requires Play Billing there); trials and codes stay.
    // bKash is for Bangladesh: other languages' learners get trials and codes.
    return info && (isAndroidApp() || learnerLang() !== 'bn') ? { ...info, available: false } : info;
  } catch {
    return null;
  }
}

/** Sends the learner to bKash to pay; they come back to the app with #premium=ok (or failed / cancelled). */
export async function buyPlus(plan: 'month' | 'year' = 'month'): Promise<void> {
  const res = await fetch(`${API_BASE}/users/${deviceId()}/premium/checkout`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ plan }) });
  if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
  location.href = ((await res.json()) as { url: string }).url;
}

/** Starts the free trial (once per learner); returns until when Plus is on. */
export async function startTrial(): Promise<string> {
  const res = await fetch(`${API_BASE}/users/${deviceId()}/premium/trial`, { method: 'POST' });
  if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
  const { until } = (await res.json()) as { until: string };
  localStorage.setItem(KEY, until);
  return until;
}

/** Uses a promo code; returns until when Plus is on. Throws with the status (404 wrong code, 409 used). */
export async function redeemCode(code: string): Promise<string> {
  const res = await fetch(`${API_BASE}/users/${deviceId()}/premium/redeem`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
  const { until } = (await res.json()) as { until: string };
  localStorage.setItem(KEY, until);
  return until;
}

/** Whether this learner already used the free trial (asks the server). */
export async function trialUsed(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/users/${deviceId()}/premium`);
    return res.ok ? !!((await res.json()) as { trialUsed?: boolean }).trialUsed : true;
  } catch {
    return true;
  }
}
