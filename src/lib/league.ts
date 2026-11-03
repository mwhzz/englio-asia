import { deviceId } from '../state/useProgressSync';
import { API_BASE } from './api';

/** This week's district league, as the server's /api/leaderboard returns it (see server/leaderboard.ts). */
export interface League {
  since: string;
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
