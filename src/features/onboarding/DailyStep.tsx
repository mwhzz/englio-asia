import type { CSSProperties } from 'react';
import { haptic } from '../../lib/haptics';
import { ObButton } from './ObButton';
import { TextSizeToggle } from './TextSizeToggle';

/** Minutes a day, as the daily XP goal (one lesson ≈ 10 XP ≈ 5 minutes). */
export const DAILY = [
  { minutes: '৫', xp: 10, hint: 'একটা লেসন। ব্যস্ত দিনের জন্য।' },
  { minutes: '১০', xp: 20, hint: 'একটা লেসন আর আজ যা ফিরছে।', best: true },
  { minutes: '১৫', xp: 30, hint: 'দুটো লেসন। দ্রুত এগোতে।' },
] as const;

/** When to be reminded, in the learner's day rather than on a clock (the hour it means, local time). */
export const MOMENTS = [
  { hour: 9, bn: 'সকালে নাস্তার পরে' },
  { hour: 18, bn: 'কাজ বা স্কুল থেকে ফিরে' },
  { hour: 21, bn: 'এশার নামাজের পরে' },
  { hour: 22, bn: 'রাতে ঘুমানোর আগে' },
] as const;

interface Props {
  goal: number;
  hour: number;
  polite: boolean;
  onGoal: (xp: number) => void;
  onHour: (hour: number) => void;
  onPolite: (on: boolean) => void;
  onNext: () => void;
}

export function DailyStep({ goal, hour, polite, onGoal, onHour, onPolite, onNext }: Props) {
  const tap = (f: () => void) => () => {
    haptic();
    f();
  };
  return (
    <div className="ob-screen ob-scroll">
      <header className="ob-head ob-rise">
        <h1 className="ob-title" lang="bn">
          রোজ কতক্ষণ?
        </h1>
        <p className="ob-sub" lang="bn">
          ছোট লক্ষ্য রোজ রাখা, বড় লক্ষ্য মাঝে মাঝে রাখার চেয়ে ভালো।
        </p>
      </header>

      <div className="ob-list ob-rise" style={{ '--i': 1 } as CSSProperties} role="radiogroup" aria-label="রোজ কতক্ষণ?">
        {DAILY.map((d) => (
          <button key={d.xp} type="button" role="radio" aria-checked={goal === d.xp} className={`ob-list-row${goal === d.xp ? ' is-on' : ''}`} onClick={tap(() => onGoal(d.xp))}>
            <span className="ob-list-text">
              <strong lang="bn">
                {d.minutes} মিনিট
                {'best' in d && <span className="ob-badge"> বেশিরভাগ মানুষ</span>}
              </strong>
              <small lang="bn">{d.hint}</small>
            </span>
            <span className="ob-radio" aria-hidden="true" />
          </button>
        ))}
      </div>

      <p className="ob-list-label ob-rise" style={{ '--i': 2 } as CSSProperties} lang="bn">
        কখন মনে করাব?
      </p>
      <div className="ob-moments ob-rise" style={{ '--i': 2 } as CSSProperties} role="radiogroup" aria-label="কখন মনে করাব?">
        {MOMENTS.map((m) => (
          <button key={m.hour} type="button" role="radio" aria-checked={hour === m.hour} className={`ob-moment${hour === m.hour ? ' is-on' : ''}`} onClick={tap(() => onHour(m.hour))} lang="bn">
            {m.bn}
          </button>
        ))}
      </div>

      <div className="ob-list ob-rise" style={{ '--i': 3 } as CSSProperties}>
        <button type="button" role="switch" aria-checked={polite} className="ob-list-row" onClick={tap(() => onPolite(!polite))}>
          <span className="ob-list-text">
            <strong lang="bn">আমাকে “আপনি” বলে ডাকো</strong>
          </span>
          <span className={`ob-switch${polite ? ' is-on' : ''}`} aria-hidden="true" />
        </button>
        <div className="ob-list-row ob-list-plain">
          <span className="ob-list-text">
            <strong lang="bn">লেখা বড় করো</strong>
          </span>
          <TextSizeToggle />
        </div>
      </div>

      <div className="ob-grow" />
      <div className="ob-sticky-cta ob-rise" style={{ '--i': 4 } as CSSProperties}>
        <ObButton onClick={onNext}>
          <span lang="bn">প্রথম লেসন শুরু করো</span>
        </ObButton>
      </div>
    </div>
  );
}
