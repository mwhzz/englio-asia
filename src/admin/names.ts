import { findClassLevel } from '../data/classLevels';
import { findDistrict } from '../data/districts';

/** "Dhaka · ঢাকা" for a district id, or the id itself if unknown. */
export const districtName = (id: unknown) => {
  const d = findDistrict(id as string);
  return d ? `${d.en} · ${d.bn}` : String(id ?? '—');
};

export const className = (id: unknown) => findClassLevel(id as string)?.en ?? String(id ?? '—');

/** "3 h ago", "2 d ago" for an ISO date. */
export function ago(iso: unknown, now = Date.now()): string {
  if (typeof iso !== 'string') return '—';
  const minutes = Math.round((now - Date.parse(iso)) / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)} min ago`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} h ago`;
  return `${Math.round(minutes / 60 / 24)} d ago`;
}
