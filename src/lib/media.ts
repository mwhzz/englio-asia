import type { Unit } from '../types';
import { API_BASE } from './api';

/** Where an uploaded picture or recording is served from. */
export const mediaUrl = (file: string) => `${API_BASE}/media/${file}`;

const key = (text: string) => text.trim().toLowerCase().replace(/\s+/g, ' ');
let recordings = new Map<string, string>();

/** Remembers which words and sentences have a recording, so speak() plays it instead of the phone's voice. */
export function registerRecordings(units: Unit[]): void {
  recordings = new Map();
  for (const lesson of units.flatMap((u) => u.lessons)) {
    for (const item of [...lesson.vocab, ...lesson.sentences]) if (item.audio) recordings.set(key(item.en), mediaUrl(item.audio));
  }
}

export const recordingOf = (text: string): string | undefined => recordings.get(key(text));
