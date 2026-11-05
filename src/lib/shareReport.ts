import { toBanglaDigits } from './bangla';
import type { WeekTotals } from './weekReport';

/** The weekly report as a short message for a parent or teacher (WhatsApp, Messenger, SMS). */
export function reportText(name: string, now: WeekTotals, before: WeekTotals, streak: number): string {
  const b = toBanglaDigits;
  const trend = now.xp > before.xp ? 'গত সপ্তাহের চেয়ে বেশি' : now.xp < before.xp ? 'গত সপ্তাহের চেয়ে একটু কম' : 'গত সপ্তাহের মতোই';
  return [
    `${name} এই সপ্তাহে Englio-তে ইংরেজি শিখেছে:`,
    `• ${b(now.activeDays)} দিন শিখেছে, মোট ${b(now.minutes)} মিনিট`,
    `• ${b(now.lessons)}টা লেসন, ${b(now.xp)} XP (${trend})`,
    streak > 1 ? `• টানা ${b(streak)} দিনের স্ট্রিক` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

/** Opens the phone's share sheet, or WhatsApp where there is none (most desktop browsers). */
export async function shareReport(text: string): Promise<void> {
  if (navigator.share) {
    await navigator.share({ text }).catch(() => undefined);
    return;
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
}
