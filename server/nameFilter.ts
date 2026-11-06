/**
 * What other learners may see of a name in the leagues: the first name, unless it's rude (then "Learner")
 * or the learner joined in the last few days (then "নতুন শিক্ষার্থী", so a throwaway account can't show off
 * a name at once). The learner always sees their own name.
 */

// Rude words in English, Banglish and Bangla (matched inside the name, ignoring case, spaces and symbols).
const RUDE = [
  'fuck', 'fuk', 'fck', 'shit', 'bitch', 'bastard', 'dick', 'cock', 'pussy', 'cunt', 'whore', 'slut', 'sex', 'porn', 'nigg', 'rape', 'asshole',
  'khanki', 'khankir', 'magi', 'chudi', 'chod', 'chud', 'bal', 'baal', 'sala', 'shala', 'haramjada', 'haramzada', 'kuttar', 'shuorer', 'suorer',
  'gud', 'boga', 'bokachoda', 'madarchod', 'motherchod', 'behenchod', 'bhenchod', 'lund', 'randi', 'tor maa', 'tormaa',
  'খানকি', 'মাগি', 'মাগী', 'চুদ', 'চোদ', 'বাল', 'শালা', 'হারামজাদা', 'হারামি', 'কুত্তার', 'শুয়োর', 'বোকাচোদা', 'গুদ', 'ধোন', 'বেশ্যা', 'মাদারচোদ',
];
// Short words that are rude only as a whole word ("bal" is also inside "Iqbal").
const WHOLE_ONLY = new Set(['bal', 'baal', 'sala', 'gud', 'magi', 'sex', 'dick', 'cock', 'chod', 'chud', 'boga', 'lund', 'বাল', 'গুদ']);

const squash = (s: string) => s.toLowerCase().normalize('NFKC').replace(/[\s._\-*@#$!0-9]+/g, '');

/** Whether a name has a rude word in it. */
export function isRude(name: string): boolean {
  const flat = squash(name);
  const words = name.toLowerCase().split(/[^\p{L}\p{M}]+/u).filter(Boolean);
  return RUDE.some((w) => (WHOLE_ONLY.has(w) ? words.includes(w) : flat.includes(squash(w))));
}

const NEW_DAYS = 3;

/** The name others see in a league. */
export function shownName(name: string | null, joinedAt: string | null, now = new Date()): string {
  const first = name?.trim().split(/\s+/)[0] || 'Learner';
  if (isRude(name ?? '')) return 'Learner';
  const age = joinedAt ? now.getTime() - Date.parse(joinedAt) : Infinity;
  if (age >= 0 && age < NEW_DAYS * 86_400_000) return 'নতুন শিক্ষার্থী';
  return first;
}
