import { useEffect, type CSSProperties } from 'react';
import { Glyph } from '../../components/Glyph';
import { toBanglaDigits } from '../../lib/bangla';
import { playSound } from '../../lib/sounds';
import { useTween } from '../home/useTween';
import type { Vocab } from '../../types';
import { LearnedWords } from './LearnedWords';
import type { LessonResult } from './rewards';
import { useEnterKey } from './useEnterKey';

function formatTime(seconds: number): string {
  return toBanglaDigits(`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`);
}

/** Twelve dots that burst out of the mark, in the iOS colors. */
const BURST = Array.from({ length: 12 }, (_, i) => i);

/** One big number with its label. */
function Stat({ value, label, tone }: { value: string; label: string; tone: string }) {
  return (
    <div className="done-stat" style={{ '--tone': tone } as CSSProperties}>
      <strong>{value}</strong>
      <span lang="bn">{label}</span>
    </div>
  );
}

/**
 * End of a lesson: a mark with a burst of dots, three big numbers, the streak, then the words just learned
 * (tap to hear) and when they come back.
 */
export function LessonComplete({ result, accent, words = [], onContinue }: { result: LessonResult; accent: string; words?: Vocab[]; onContinue: () => void }) {
  useEffect(() => {
    playSound('complete');
  }, []);
  useEnterKey(onContinue);
  const xp = Math.round(useTween(result.xp, 800, 400));
  const accuracy = Math.round(useTween(result.accuracy, 800, 400));

  const title = result.practice ? 'অনুশীলন শেষ!' : result.perfect ? 'নিখুঁত লেসন!' : 'লেসন শেষ!';
  const sub = result.practice ? 'যা শিখেছ, আরও পাকা হলো' : result.perfect ? 'একটাও ভুল হয়নি, ৫ বোনাস XP' : 'দারুণ, আরেক ধাপ এগোলে';

  return (
    <div className="done-screen" style={{ '--u': accent } as CSSProperties}>
      <div className="done-main">
        <div className="done-hero">
          <span className="done-burst" aria-hidden="true">
            {BURST.map((i) => (
              <span key={i} style={{ '--a': `${i * 30}deg`, '--i': i } as CSSProperties} />
            ))}
          </span>
          <span className="done-mark" aria-hidden="true">
            <Glyph name={result.perfect ? 'trophy' : 'check'} size={44} />
          </span>
        </div>
        <h1 lang="bn">{title}</h1>
        <p className="done-sub" lang="bn">
          {sub}
        </p>

        <div className="done-stats">
          <Stat value={`+${toBanglaDigits(xp)}`} label="XP" tone="var(--ios-orange)" />
          <Stat value={`${toBanglaDigits(accuracy)}%`} label="সঠিক" tone="var(--ios-green)" />
          <Stat value={formatTime(result.seconds)} label="সময়" tone="var(--ios-blue)" />
        </div>
        {result.streakUp && (
          <p className="done-streak" lang="bn">
            <Glyph name="flame" size={16} />
            {toBanglaDigits(result.streak)} দিন টানা
          </p>
        )}

        {!result.practice && <LearnedWords words={words} />}
      </div>

      <button className="cta" onClick={onContinue} autoFocus>
        <span lang="bn">পরবর্তী</span>
      </button>
    </div>
  );
}
