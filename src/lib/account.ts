import { deviceId } from '../state/useProgressSync';
import { API_BASE } from './api';
import { becomeLearner, post } from './backup';
import type { Progress } from './progress';

/** Set VITE_GOOGLE_CLIENT_ID at build time to show "Sign in with Google" (see docs/SERVER.md). */
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

interface Linked {
  id: string;
  progress: Progress;
  isNew: boolean;
}

/** Saves this phone's progress to the server first, so a new account has something to link to. */
async function saveFirst(progress: Progress | null) {
  if (!progress?.profile) return;
  await fetch(`${API_BASE}/users/${deviceId()}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ progress }) });
}

/** Texts a sign-in code to the number. Returns the code itself only on a development server. */
export const sendCode = (phone: string) => post<{ ok: true; devCode?: string }>('/auth/phone/start', { phone });

/**
 * After signing in: if the account belongs to another learner (signed in on a new phone), this phone
 * becomes them (keeping what it learned too) and reloads; otherwise the account is now linked here.
 */
function settle(r: Linked): 'linked' | 'switched' {
  if (r.id === deviceId()) return 'linked';
  becomeLearner(r.id, r.progress);
  return 'switched';
}

export async function verifyCode(phone: string, code: string, progress: Progress | null): Promise<'linked' | 'switched'> {
  await saveFirst(progress);
  return settle(await post<Linked>('/auth/phone/verify', { phone, code, deviceId: deviceId() }));
}

export async function signInWithGoogle(idToken: string, progress: Progress | null): Promise<'linked' | 'switched'> {
  await saveFirst(progress);
  return settle(await post<Linked>('/auth/google', { idToken, deviceId: deviceId() }));
}

/** What's linked to this learner: e.g. [{ kind: 'phone', label: '+880 17•• •••678' }]. */
export async function linkedAccounts(): Promise<{ kind: string; label: string }[] | null> {
  try {
    const res = await fetch(`${API_BASE}/users/${deviceId()}/accounts`);
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

/** Loads Google's sign-in button script (only when Google sign-in is set up and the sheet opens). */
export function loadGoogle(): Promise<GoogleIdentity> {
  const w = window as unknown as { google?: { accounts: { id: GoogleIdentity } } };
  if (w.google) return Promise.resolve(w.google.accounts.id);
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = () => (w.google ? resolve(w.google.accounts.id) : reject(new Error('no google')));
    s.onerror = reject;
    document.head.append(s);
  });
}

export interface GoogleIdentity {
  initialize(o: { client_id: string; callback: (r: { credential: string }) => void }): void;
  renderButton(el: HTMLElement, o: Record<string, unknown>): void;
}
