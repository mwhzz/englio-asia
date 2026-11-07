import type { Exercise } from '../../types';
import { target } from '../../lib/target';

export const INSTRUCTIONS: Record<Exercise['kind'], { en: string; bn: string }> = {
  select: { en: 'Select the correct word', bn: 'সঠিক শব্দটি বেছে নাও' },
  match: { en: 'Tap the matching pairs', bn: 'মিলিয়ে জোড়া বানাও' },
  translate: { en: 'Write this in English', bn: 'ইংরেজিতে সাজিয়ে লেখো' },
  listen: { en: 'Tap what you hear', bn: 'যা শুনছ তা সাজাও' },
  choice: { en: 'What does this mean?', bn: 'এর মানে কী?' },
  hear: { en: 'Listen and choose the meaning', bn: 'শুনে মানে বাছো' },
  type: { en: 'Type this in English', bn: 'ইংরেজিতে টাইপ করো' },
  fill: { en: 'Complete the sentence', bn: 'ফাঁকা জায়গায় বসাও' },
  gaps: { en: 'Put the words in place', bn: 'শব্দগুলো জায়গামতো বসাও' },
  grammar: { en: 'Which sentence is correct?', bn: 'কোন বাক্যটা ঠিক?' },
  dialog: { en: 'Choose the right reply', bn: 'ঠিক উত্তরটা বেছে নাও' },
  dictate: { en: 'Type what you hear', bn: 'যা শুনছ তা লেখো' },
  speak: { en: 'Say this sentence', bn: 'বাক্যটা জোরে বলো' },
};

/** The instruction for one exercise: a single word to say aloud is a word, not a sentence. */
export function instructionFor(ex: Exercise): { en: string; bn: string } {
  const plain = instructionOf(ex);
  // In a course teaching Arabic, "in English" means "in Arabic".
  return target() === 'ar' ? { en: plain.en.replace(/English/g, 'Arabic'), bn: plain.bn.replace(/ইংরেজি/g, 'আরবি') } : plain;
}

function instructionOf(ex: Exercise): { en: string; bn: string } {
  if (ex.kind === 'speak' && !/\s/.test(ex.sentence.en.trim())) return { en: 'Say this word', bn: 'শব্দটা জোরে বলো' };
  return INSTRUCTIONS[ex.kind];
}
