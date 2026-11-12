import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { haptic } from '../../lib/haptics';
import { playSound } from '../../lib/sounds';
import { speak } from '../../lib/speech';
import { target } from '../../lib/target';
import { track } from '../../lib/track';
import { ObButton } from './ObButton';
import { TASTES } from '../../data/taste';

/**
 * A 30-second first taste, before any question about the learner: hear a letter or word, pick the answer
 * (a wrong pick just says "listen again", it can't fail), then the words a Bangla speaker already knows.
 * Used by the first-run onboarding and by a course's intro (features/courseIntro).
 */
export function TasteStep({ onNext }: { onNext: () => void }) {
  const t = TASTES[target()];
  const options = useMemo(() => [t.answer, ...t.wrong].sort(() => Math.random() - 0.5), [t]);
  const [picked, setPicked] = useState<string | null>(null);
  const right = picked === t.answer;

  useEffect(() => {
    const timer = setTimeout(() => speak(t.say), 500);
    return () => clearTimeout(timer);
  }, [t]);

  function pick(option: string) {
    haptic();
    setPicked(option);
    if (option === t.answer) {
      playSound('correct');
      track('onboard', 'taste-right');
    } else {
      playSound('wrong');
      setTimeout(() => speak(t.say, true), 300);
    }
  }

  return (
    <div className="ob-screen ob-scroll ob-taste">
      <header className="ob-head ob-rise">
        <p className="ob-kicker" lang="bn">
          ৩০ সেকেন্ডের প্রথম স্বাদ
        </p>
        <h1 className="ob-title" lang="bn">
          {t.ask}
        </h1>
      </header>

      <button type="button" className={`ob-taste-card ob-rise${target() === 'ar' ? ' is-ar' : ''}`} style={{ '--i': 1 } as CSSProperties} onClick={() => speak(t.say)} aria-label="আবার শোনো">
        <span className="ob-taste-big">{t.show}</span>
        <span className="ob-taste-hear" lang="bn">
          আবার শোনো
        </span>
      </button>

      {!right && (
        <div className="ob-taste-options ob-rise" style={{ '--i': 2 } as CSSProperties}>
          {options.map((o) => (
            <button key={o} type="button" className={`ob-taste-option${picked === o ? ' is-wrong' : ''}`} onClick={() => pick(o)} lang="bn">
              {o}
            </button>
          ))}
          {picked && (
            <p className="ob-taste-again" lang="bn">
              প্রায় হয়েছে! আরেকবার শোনো।
            </p>
          )}
        </div>
      )}

      {right && (
        <div className="ob-taste-win">
          <p className="ob-taste-right" lang="bn">
            ঠিক! {t.why}
          </p>
          <p className="ob-taste-known-title" lang="bn">
            তুমি আগেই এগুলো জানো
          </p>
          <div className="ob-taste-known">
            {t.known.map((k) => (
              <span key={k.word} className="ob-taste-chip">
                <span className={target() === 'ar' ? 'ob-ar' : undefined}>{k.word}</span>
                <small lang="bn">{k.bn}</small>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="ob-grow" />
      {right && (
        <div className="ob-sticky-cta">
          <ObButton onClick={onNext}>
            <span lang="bn">দারুণ, চলো</span>
          </ObButton>
        </div>
      )}
    </div>
  );
}
