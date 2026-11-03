export interface Sky {
  id: 'dawn' | 'day' | 'golden' | 'dusk' | 'night';
  /** The soft glow at the top of the page for this time of day. */
  glow: string;
}

/** The header glow for a given hour (0–23), from sunrise to night. */
export function skyFor(hour: number): Sky {
  if (hour >= 5 && hour < 7) return { id: 'dawn', glow: '#ff8a7a' };
  if (hour >= 7 && hour < 15) return { id: 'day', glow: '#3ba4f6' };
  if (hour >= 15 && hour < 18) return { id: 'golden', glow: '#fd9a45' };
  if (hour >= 18 && hour < 19) return { id: 'dusk', glow: '#c0618a' };
  return { id: 'night', glow: '#5e5ce6' };
}

/** Bangla and English greetings for the time of day. */
export function greetingFor(hour: number): { bn: string; en: string } {
  if (hour >= 5 && hour < 12) return { bn: 'শুভ সকাল', en: 'Good morning' };
  if (hour >= 12 && hour < 15) return { bn: 'শুভ দুপুর', en: 'Good afternoon' };
  if (hour >= 15 && hour < 18) return { bn: 'শুভ বিকেল', en: 'Good afternoon' };
  if (hour >= 18 && hour < 21) return { bn: 'শুভ সন্ধ্যা', en: 'Good evening' };
  return { bn: 'শুভ রাত্রি', en: 'Good night' };
}
