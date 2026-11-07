import { speechLang } from './target';
// The browser's speech recognition (Chrome/Edge/Android: webkitSpeechRecognition). Not every browser has it.

interface Recognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type RecognitionCtor = new () => Recognition;

function ctor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export const canListen = () => ctor() !== null;

/**
 * Listens for one English sentence. `onText` gets the words as they're heard; `onDone` the final text
 * (or '' when nothing was heard), or an error such as "not-allowed" when the mic is blocked.
 * Returns a function that stops listening.
 */
export function listenOnce(onText: (text: string) => void, onDone: (text: string, error?: string) => void): () => void {
  const Ctor = ctor();
  if (!Ctor) {
    onDone('', 'unsupported');
    return () => undefined;
  }
  const rec = new Ctor();
  rec.lang = speechLang();
  rec.interimResults = true;
  rec.maxAlternatives = 1;
  let text = '';
  let failed: string | undefined;
  rec.onresult = (e) => {
    text = Array.from(e.results)
      .map((r) => r[0].transcript)
      .join(' ')
      .trim();
    onText(text);
  };
  rec.onerror = (e) => {
    failed = e.error;
  };
  rec.onend = () => onDone(text, failed === 'no-speech' ? undefined : failed);
  rec.start();
  return () => rec.stop();
}
