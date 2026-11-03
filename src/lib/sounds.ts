let soundOn = true;
let ctx: AudioContext | null = null;

export function setSoundEnabled(on: boolean): void {
  soundOn = on;
}

function tone(audio: AudioContext, freq: number, start: number, duration: number, type: OscillatorType = 'sine'): void {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(audio.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

export type SoundName = 'correct' | 'wrong' | 'tap' | 'complete';

/** Short synthesized feedback sounds, so the app ships no audio files. */
export function playSound(name: SoundName): void {
  if (!soundOn) return;
  try {
    ctx ??= new AudioContext();
  } catch {
    return;
  }
  const audio = ctx;
  const t = audio.currentTime;
  switch (name) {
    case 'correct':
      tone(audio, 660, t, 0.12);
      tone(audio, 990, t + 0.1, 0.22);
      break;
    case 'wrong':
      tone(audio, 220, t, 0.18, 'triangle');
      tone(audio, 165, t + 0.15, 0.28, 'triangle');
      break;
    case 'tap':
      tone(audio, 880, t, 0.08);
      break;
    case 'complete':
      [523, 659, 784, 1047].forEach((freq, i) => tone(audio, freq, t + i * 0.12, 0.25));
      break;
  }
}
