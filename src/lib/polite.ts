import { learnerLang } from './learnerLang';
import { addTextSwap, removeTextSwap } from './textSwap';

/**
 * "আপনি" for adult learners: the app's Bangla is written with তুমি; for a learner who chose "চাকরি / অন্যান্য"
 * (or switched it on in Profile) every Bangla text on screen is turned into the polite form, word by word.
 * Only words that always speak to the learner are changed (তুমি, তোমার, commands like করো, and "you" verb
 * forms like পারো), so sentences about someone else stay as they are.
 */
const WORDS: Record<string, string> = {
  তুমি: 'আপনি',
  তোমার: 'আপনার',
  তোমাকে: 'আপনাকে',
  তোমায়: 'আপনাকে',
  তোমরা: 'আপনারা',
  তোমাদের: 'আপনাদের',
  // Commands.
  করো: 'করুন',
  দাও: 'দিন',
  নাও: 'নিন',
  যাও: 'যান',
  খোলো: 'খুলুন',
  দেখো: 'দেখুন',
  শেখো: 'শিখুন',
  শোনো: 'শুনুন',
  বলো: 'বলুন',
  লেখো: 'লিখুন',
  পড়ো: 'পড়ুন',
  চাপো: 'চাপুন',
  রাখো: 'রাখুন',
  ধরো: 'ধরুন',
  বসাও: 'বসান',
  সাজাও: 'সাজান',
  মেলাও: 'মেলান',
  বানাও: 'বানান',
  জানাও: 'জানান',
  আনো: 'আনুন',
  এসো: 'আসুন',
  খুঁজো: 'খুঁজুন',
  বাছো: 'বাছুন',
  ফেরাও: 'ফেরান',
  চালাও: 'চালান',
  ছাড়ো: 'ছাড়ুন',
  থাকো: 'থাকুন',
  ভাবো: 'ভাবুন',
  মুছো: 'মুছুন',
  পাঠাও: 'পাঠান',
  নামাও: 'নামান',
  বাঁচাও: 'বাঁচান',
  খাও: 'খান',
  // "You" verb forms.
  পারো: 'পারেন',
  পারবে: 'পারবেন',
  আছ: 'আছেন',
  করছ: 'করছেন',
  শিখছ: 'শিখছেন',
  এনেছ: 'এনেছেন',
  করেছ: 'করেছেন',
  পেয়েছ: 'পেয়েছেন',
  শিখেছ: 'শিখেছেন',
  দিয়েছ: 'দিয়েছেন',
  জানো: 'জানেন',
  চাও: 'চান',
  বোঝো: 'বোঝেন',
  পাবে: 'পাবেন',
  শিখবে: 'শিখবেন',
  দেখবে: 'দেখবেন',
};

const BN = '\\u0980-\\u09FF';
const PATTERN = new RegExp(`(?<![${BN}])(${Object.keys(WORDS).map((w) => w.replace(/[?]/g, '\\?')).join('|')})(?![${BN}])`, 'g');

/** The same Bangla text, speaking to the learner as আপনি. */
export const polite = (text: string): string => text.replace(PATTERN, (w) => WORDS[w] ?? w);

const swap = (text: string) => polite(text);

/** Turns the polite form on (or off) for everything on screen now and drawn later (lib/textSwap.ts). */
export function setPolite(on: boolean): void {
  if (on) addTextSwap(swap);
  else removeTextSwap(swap);
}

const KEY = 'englio-polite';

/** The learner's choice in Profile ("on" / "off"), or null to follow their class (adults get আপনি). */
export function politeChoice(): 'on' | 'off' | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'on' || v === 'off' ? v : null;
  } catch {
    return null;
  }
}

export function setPoliteChoice(v: 'on' | 'off'): void {
  try {
    localStorage.setItem(KEY, v);
  } catch {
    // For now only.
  }
}

/** Whether to speak to this learner as আপনি: their choice, else yes for job / other learners. */
export const wantsPolite = (stage: string | undefined) => {
  // Bangla only (other languages have their own text).
  if (learnerLang() !== 'bn' && !learnerLang().startsWith('bn-')) return false;
  const choice = politeChoice();
  return choice ? choice === 'on' : stage === 'other';
};
