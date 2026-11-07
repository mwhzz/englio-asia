import { recordingOf } from './media';
import { isLowData } from './offline';
import { speechLang, target } from './target';

let voice: SpeechSynthesisVoice | null = null;
let playing: HTMLAudioElement | null = null;

/**
 * How good a voice sounds: natural/neural voices (Edge, newer Android) and Google's or Apple's
 * best English voices first, American before other English. Online voices don't work offline.
 */
function score(v: SpeechSynthesisVoice, online: boolean): number {
  // The language being learned (English, or Arabic in an Arabic course).
  const want = target();
  if (!v.lang.toLowerCase().startsWith(want)) return -1;
  if (!online && !v.localService) return -1;
  let s = want === 'ar' ? 1 : v.lang === 'en-US' || v.lang === 'en_US' ? 3 : v.lang.startsWith('en-GB') ? 2 : 1;
  if (/natural|neural|enhanced|premium/i.test(v.name)) s += 6;
  if (/google/i.test(v.name)) s += 4;
  if (/samantha|ava|allison|aria|jenny|guy|daniel|karen/i.test(v.name)) s += 3;
  if (/compact|espeak/i.test(v.name)) s -= 3;
  return s;
}

function pickVoice(): SpeechSynthesisVoice | null {
  const online = typeof navigator === 'undefined' || navigator.onLine;
  let best: SpeechSynthesisVoice | null = null;
  for (const v of speechSynthesis.getVoices()) if (score(v, online) >= 0 && (!best || score(v, online) > score(best, online))) best = v;
  return best;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  // Voices arrive late in Chrome, and online voices stop working offline: choose again when either changes.
  speechSynthesis.addEventListener?.('voiceschanged', () => (voice = null));
  window.addEventListener('online', () => (voice = null));
  window.addEventListener('offline', () => (voice = null));
}

/**
 * Reads English text aloud: the recording uploaded for it if there is one, else the browser's speech
 * engine (also when the recording can't play, e.g. offline). `onEnd` runs when it has finished.
 */
export function speak(text: string, slow = false, onEnd?: () => void): void {
  if (typeof window === 'undefined') return;
  playing?.pause();
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  const recording = isLowData() ? undefined : recordingOf(text);
  if (recording) {
    const audio = new Audio(recording);
    audio.playbackRate = slow ? 0.7 : 1;
    audio.onended = () => onEnd?.();
    playing = audio;
    audio.play().catch(() => playing === audio && speakAloud(text, slow, onEnd));
    return;
  }
  speakAloud(text, slow, onEnd);
}

function speakAloud(text: string, slow: boolean, onEnd?: () => void): void {
  if (!('speechSynthesis' in window)) return;
  voice ??= pickVoice();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = speechLang();
  if (voice) utterance.voice = voice;
  utterance.rate = slow ? 0.6 : 0.95;
  if (onEnd) utterance.onend = utterance.onerror = onEnd;
  speechSynthesis.speak(utterance);
}

/**
 * Whether this phone can read English aloud. 'unknown' until the browser has listed its voices
 * (some list none until asked), so only 'none' means it really can't.
 */
export function englishVoice(): 'yes' | 'none' | 'unknown' {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return 'none';
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return 'unknown';
  return voices.some((v) => v.lang.toLowerCase().startsWith(target())) ? 'yes' : 'none';
}
