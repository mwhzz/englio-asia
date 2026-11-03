let voice: SpeechSynthesisVoice | null = null;

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === 'en-US' && /Google|Samantha|Aria|Jenny|Natural/.test(v.name)) ??
    voices.find((v) => v.lang === 'en-US') ??
    voices.find((v) => v.lang.startsWith('en')) ??
    null
  );
}

/** Reads English text aloud with the browser's built-in speech engine; null when there is none. */
export function speak(text: string, slow = false): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  voice ??= pickVoice();
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  if (voice) utterance.voice = voice;
  utterance.rate = slow ? 0.6 : 0.95;
  speechSynthesis.speak(utterance);
  return utterance;
}
