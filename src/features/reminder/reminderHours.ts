import { toBanglaDigits } from '../../lib/bangla';

/** The hours a learner can pick for the daily reminder (local time). */
export const HOURS = [7, 9, 12, 16, 18, 20, 21, 22];

const part = (h: number) => (h < 12 ? 'সকাল' : h < 16 ? 'দুপুর' : h < 18 ? 'বিকেল' : h < 20 ? 'সন্ধ্যা' : 'রাত');

/** "রাত ৮টা" for 20. */
export const hourLabel = (h: number) => `${part(h)} ${toBanglaDigits(h > 12 ? h - 12 : h)}টা`;
