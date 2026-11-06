import { useState } from 'react';
import { Glyph } from '../../components/Glyph';
import { toBanglaDigits } from '../../lib/bangla';
import { haptic } from '../../lib/haptics';
import { currentStreak } from '../../lib/streak';
import { useProgress } from '../../state/ProgressContext';
import { HelpPage } from '../help/HelpPage';
import { nextLesson } from './nextLesson';

const KEY = 'englio-streak-lost-seen';

/**
 * A streak that ended (days missed, no freeze to cover them) is said out loud instead of silently showing 0:
 * "your 9-day streak ended, start a new one today", with the next lesson, and a way to ask for it back
 * when it was lost by a bug or a lost phone. Goes away once dismissed or after the next lesson.
 */
export function StreakLost({ onStart }: { onStart: (lessonId: string) => void }) {
  const { progress } = useProgress();
  const [help, setHelp] = useState(false);
  const [seen, setSeen] = useState(() => {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  });
  const next = nextLesson(progress.completed);
  const id = `${progress.lastActiveDay}:${progress.streak}`;
  if (progress.streak < 2 || currentStreak(progress) > 0 || seen === id) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, id);
    } catch {
      // Hidden for now; shown again next time.
    }
    setSeen(id);
  };

  return (
    <div className="rc sl home-rise">
      <span className="rc-icon sl-icon" aria-hidden="true">
        <Glyph name="flame" size={20} />
      </span>
      <span className="rc-text">
        <strong lang="bn">{toBanglaDigits(progress.streak)} দিনের স্ট্রিক শেষ হয়ে গেছে</strong>
        <small lang="bn">
          আজ একটা লেসন করে নতুন স্ট্রিক শুরু করো।{' '}
          <button className="sl-link" onClick={() => setHelp(true)}>
            ভুলে চলে গেছে? জানাও
          </button>
        </small>
      </span>
      {next && (
        <button
          className="rc-go sl-go"
          lang="bn"
          onClick={() => {
            haptic();
            dismiss();
            onStart(next.lesson.id);
          }}
        >
          শুরু
        </button>
      )}
      <button className="sl-close" aria-label="Close" onClick={dismiss}>
        <Glyph name="close" size={14} />
      </button>
      {help && <HelpPage onClose={() => setHelp(false)} />}
    </div>
  );
}
