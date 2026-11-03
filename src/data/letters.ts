import type { Letter } from '../types';

const L = (upper: string, nameBn: string, soundBn: string, words: [string, string][], vowel = false): Letter => ({
  upper,
  lower: upper.toLowerCase(),
  nameBn,
  soundBn,
  vowel,
  words: words.map(([en, bn]) => ({ en, bn })),
});

/** The English alphabet: each letter's name and usual sound in Bangla script, and example words. */
export const LETTERS: Letter[] = [
  L('A', 'এ', 'অ্যা', [['apple', 'আপেল'], ['ant', 'পিঁপড়া'], ['animal', 'প্রাণী']], true),
  L('B', 'বি', 'ব', [['ball', 'বল'], ['book', 'বই'], ['boat', 'নৌকা']]),
  L('C', 'সি', 'ক / স', [['cat', 'বিড়াল'], ['cow', 'গরু'], ['city', 'শহর']]),
  L('D', 'ডি', 'ড', [['dog', 'কুকুর'], ['door', 'দরজা'], ['duck', 'হাঁস']]),
  L('E', 'ই', 'এ', [['egg', 'ডিম'], ['elephant', 'হাতি'], ['eye', 'চোখ']], true),
  L('F', 'এফ', 'ফ', [['fish', 'মাছ'], ['flower', 'ফুল'], ['father', 'বাবা']]),
  L('G', 'জি', 'গ / জ', [['girl', 'মেয়ে'], ['goat', 'ছাগল'], ['garden', 'বাগান']]),
  L('H', 'এইচ', 'হ', [['hat', 'টুপি'], ['house', 'বাড়ি'], ['hand', 'হাত']]),
  L('I', 'আই', 'ই', [['ink', 'কালি'], ['ice', 'বরফ'], ['island', 'দ্বীপ']], true),
  L('J', 'জে', 'জ', [['jug', 'জগ'], ['juice', 'রস'], ['jackfruit', 'কাঁঠাল']]),
  L('K', 'কে', 'ক', [['kite', 'ঘুড়ি'], ['key', 'চাবি'], ['king', 'রাজা']]),
  L('L', 'এল', 'ল', [['lion', 'সিংহ'], ['leaf', 'পাতা'], ['lamp', 'বাতি']]),
  L('M', 'এম', 'ম', [['mango', 'আম'], ['moon', 'চাঁদ'], ['mother', 'মা']]),
  L('N', 'এন', 'ন', [['nose', 'নাক'], ['nest', 'পাখির বাসা'], ['night', 'রাত']]),
  L('O', 'ও', 'অ / ও', [['orange', 'কমলা'], ['owl', 'পেঁচা'], ['ox', 'ষাঁড়']], true),
  L('P', 'পি', 'প', [['pen', 'কলম'], ['parrot', 'টিয়া পাখি'], ['pond', 'পুকুর']]),
  L('Q', 'কিউ', 'কু', [['queen', 'রানি'], ['question', 'প্রশ্ন'], ['quick', 'দ্রুত']]),
  L('R', 'আর', 'র', [['rice', 'ভাত'], ['river', 'নদী'], ['rain', 'বৃষ্টি']]),
  L('S', 'এস', 'স', [['sun', 'সূর্য'], ['school', 'স্কুল'], ['star', 'তারা']]),
  L('T', 'টি', 'ট', [['tiger', 'বাঘ'], ['tree', 'গাছ'], ['tea', 'চা']]),
  L('U', 'ইউ', 'আ / উ', [['umbrella', 'ছাতা'], ['up', 'উপরে'], ['uncle', 'চাচা / মামা']], true),
  L('V', 'ভি', 'ভ', [['village', 'গ্রাম'], ['van', 'ভ্যান'], ['vegetable', 'সবজি']]),
  L('W', 'ডাবলিউ', 'ও / উ', [['water', 'পানি'], ['window', 'জানালা'], ['wind', 'বাতাস']]),
  L('X', 'এক্স', 'ক্স', [['box', 'বাক্স'], ['six', 'ছয়'], ['x-ray', 'এক্স-রে']]),
  L('Y', 'ওয়াই', 'ই / য়', [['yellow', 'হলুদ'], ['year', 'বছর'], ['yes', 'হ্যাঁ']]),
  L('Z', 'জেড', 'জ', [['zebra', 'জেব্রা'], ['zoo', 'চিড়িয়াখানা'], ['zero', 'শূন্য']]),
];

export const findLetter = (upper: string) => LETTERS.find((l) => l.upper === upper);
