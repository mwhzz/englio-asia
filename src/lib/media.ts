import type { Unit } from '../types';
import { API_BASE } from './api';
import { audioKey as key } from './audioKey';

/** Where an uploaded picture or recording is served from. */
export const mediaUrl = (file: string) => `${API_BASE}/media/${file}`;

let recordings = new Map<string, string>();

/**
 * Remembers which texts have a recording, so speak() plays it instead of the phone's voice: the recordings on
 * words and sentences, then the ones made on the admin's Words and Audio pages (`clips`, by text), which win.
 */
export function registerRecordings(units: Unit[], clips: Record<string, string> = {}): void {
  recordings = new Map();
  for (const lesson of units.flatMap((u) => u.lessons)) {
    for (const item of [...lesson.vocab, ...lesson.sentences]) if (item.audio) recordings.set(key(item.en), mediaUrl(item.audio));
  }
  for (const [text, file] of Object.entries(clips)) recordings.set(key(text), mediaUrl(file));
}

export const recordingOf = (text: string): string | undefined => recordings.get(key(text));
