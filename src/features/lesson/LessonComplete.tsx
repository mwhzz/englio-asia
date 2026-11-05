import { useEffect, type CSSProperties } from 'react';
import { Glyph, type GlyphName } from '../../components/Glyph';
import { toBanglaDigits } from '../../lib/bangla';
import { playSound } from '../../lib/sounds';
import { useTween } from '../home/useTween';
import type { LessonResult } from './rewards';
import { useEnterKey } from './useEnterKey';

function formatTime(seconds: number): string {
  return toBanglaDigits(`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`);
}

/** One row of the results list, with a colored icon tile like iOS Settings. */
function Row({ icon, color, label, value }: { icon: GlyphName; color: string; label: string; value: string }) {
  return (
    <li className="done-row">
      <span className="done-icon" style={{ background: color }}>
        <Glyph name={icon} size={16} />
      </span>
      <span lang="bn">{label}</span>
      <strong lang="bn">{value}</strong>
    </li>
  );
}

/** End of a lesson: a check in the unit's color, then the results as an iOS grouped list. */
export function LessonComplete({ result, accent, onContinue }: { result: LessonResult; accent: string; onContinue: () => void }) {
  useEffect(() => {
    playSound('complete');
  }, []);
  useEnterKey(onContinue);
  const xp = Math.round(useTween(result.xp, 800, 400));
  const accuracy = Math.round(useTween(result.accuracy, 800, 400));

  const title = result.practice ? 'অনুশীলন শেষ!' : result.perfect ? 'নিখুঁত লেসন!' : 'লেসন শেষ!';
  const sub = result.practice ? 'Practice complete · you earned a heart' : 'Lesson complete';

  return (
    <div className="done-screen" style={{ '--u': accent } as CSSProperties}>
      <div className="done-main">
        <span className="done-mark" aria-hidden="true">
          <Glyph name={result.perfect ? 'trophy' : 'check'} size={44} />
        </span>
        <h1 lang="bn">{title}</h1>
        <p className="done-sub">{sub}</p>

        <ul className="done-list">
          <Row icon="gem" color="var(--ios-orange)" label="XP পেয়েছ" value={`+${toBanglaDigits(xp)}`} />
          <Row icon="target" color="var(--ios-green)" label="সঠিক উত্তর" value={`${toBanglaDigits(accuracy)}%`} />
          <Row icon="clock" color="var(--ios-blue)" label="সময়" value={formatTime(result.seconds)} />
          {result.streakUp && <Row icon="flame" color="var(--ios-red)" label="টানা দিন" value={toBanglaDigits(result.streak)} />}
        </ul>
        {result.perfect && !result.practice && (
          <p className="done-note" lang="bn">
            একটাও ভুল হয়নি, তাই ৫ বোনাস XP যোগ হয়েছে।
          </p>
        )}
      </div>

      <button className="cta" onClick={onContinue} autoFocus>
        <span lang="bn">পরবর্তী</span>
      </button>
    </div>
  );
}
