import type { Exercise } from '../../types';

export const INSTRUCTIONS: Record<Exercise['kind'], { en: string; bn: string }> = {
  select: { en: 'Select the correct word', bn: 'সঠিক শব্দটি বেছে নাও' },
  match: { en: 'Tap the matching pairs', bn: 'মিলিয়ে জোড়া বানাও' },
  translate: { en: 'Write this in English', bn: 'ইংরেজিতে সাজিয়ে লেখো' },
  listen: { en: 'Tap what you hear', bn: 'যা শুনছ তা সাজাও' },
  choice: { en: 'What does this mean?', bn: 'এর মানে কী?' },
  type: { en: 'Type this in English', bn: 'ইংরেজিতে টাইপ করো' },
  fill: { en: 'Fill in the blank', bn: 'শূন্যস্থান পূরণ করো' },
  gaps: { en: 'Fill in the gaps', bn: 'খালি জায়গাগুলো পূরণ করো' },
  grammar: { en: 'Which sentence is correct?', bn: 'কোন বাক্যটা ঠিক?' },
  dialog: { en: 'Choose the right reply', bn: 'ঠিক উত্তরটা বেছে নাও' },
  dictate: { en: 'Type what you hear', bn: 'যা শুনছ তা লেখো' },
  speak: { en: 'Say this sentence', bn: 'বাক্যটা জোরে বলো' },
};
