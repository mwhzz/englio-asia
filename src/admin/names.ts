import { findClassLevel } from '../data/classLevels';
import { findDistrict } from '../data/districts';
import { toBanglaDigits } from '../lib/bangla';

/** "Dhaka · ঢাকা" for a district id, or the id itself if unknown. */
export const districtName = (id: unknown) => {
  const d = findDistrict(id as string);
  return d ? `${d.en} · ${d.bn}` : String(id ?? '—');
};

export const className = (id: unknown) => findClassLevel(id as string)?.en ?? String(id ?? '—');

/** "৩ ঘণ্টা আগে", "২ দিন আগে" for an ISO date (the admin is in Bangla). */
export function ago(iso: unknown, now = Date.now()): string {
  if (typeof iso !== 'string') return '—';
  const minutes = Math.round((now - Date.parse(iso)) / 60000);
  if (minutes < 60) return `${toBanglaDigits(Math.max(1, minutes))} মিনিট আগে`;
  if (minutes < 60 * 24) return `${toBanglaDigits(Math.round(minutes / 60))} ঘণ্টা আগে`;
  return `${toBanglaDigits(Math.round(minutes / 60 / 24))} দিন আগে`;
}
