import { deviceId } from '../state/useProgressSync';
import { API_BASE } from './api';

/** This week's district league, as the server's /api/leaderboard returns it (see server/leaderboard.ts). */
export interface League {
  /** The league week, Saturday to Friday ("2026-10-31" … "2026-11-06"). */
  since: string;
  ends: string;
  districts: { districtId: string; xp: number; learners: number }[];
  learners: { name: string; xp: number; isMe: boolean }[];
  me: { rank: number; xp: number } | null;
  myDistrictRank: number | null;
}

/** Fetches the league for a district; null when offline or the server can't be reached. */
export async function fetchLeague(districtId: string | null | undefined): Promise<League | null> {
  const q = new URLSearchParams({ me: deviceId() });
  if (districtId) q.set('district', districtId);
  try {
    const res = await fetch(`${API_BASE}/leaderboard?${q}`);
    return res.ok ? ((await res.json()) as League) : null;
  } catch {
    return null;
  }
}

/** Me and my friends by this week's XP (see server/friends.ts); `code` is mine to share. */
export interface FriendsLeague {
  since: string;
  ends: string;
  code: string;
  people: { name: string; code: string; xp: number; isMe: boolean }[];
}

export async function fetchFriends(): Promise<FriendsLeague | null> {
  try {
    const res = await fetch(`${API_BASE}/users/${deviceId()}/friends`);
    return res.ok ? ((await res.json()) as FriendsLeague) : null;
  } catch {
    return null;
  }
}

/** Adds a friend by code; throws with the server's reason (wrong code, your own code…). */
export async function addFriend(code: string): Promise<void> {
  const res = await fetch(`${API_BASE}/users/${deviceId()}/friends`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code }) });
  if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status, reason: ((await res.json().catch(() => ({}))) as { error?: string }).error });
}

export async function removeFriend(code: string): Promise<void> {
  await fetch(`${API_BASE}/users/${deviceId()}/friends/${encodeURIComponent(code)}`, { method: 'DELETE' }).catch(() => undefined);
}

/** Days left in the league week, today included (Friday is the last day). */
export const daysLeft = (ends: string, today = new Date()) => {
  const local = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const [y, m, d] = ends.split('-').map(Number);
  return Math.max(1, Math.round((new Date(y, m - 1, d).getTime() - local) / 86_400_000) + 1);
};
