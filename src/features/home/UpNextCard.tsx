import type { CSSProperties } from 'react';
import { Glyph } from '../../components/Glyph';
import { toBanglaDigits } from '../../lib/bangla';
import { haptic } from '../../lib/haptics';
import { minutesUntil, nextHeartAt } from '../../lib/hearts';
import { useProgress } from '../../state/ProgressContext';
import { LESSON_XP } from '../lesson/rewards';
import { nextLesson } from './nextLesson';

interface Props {
  onStart: (lessonId: string) => void;
  onPractice: () => void;
}

/** One big card that resumes learning with a single tap. */
export function UpNextCard({ onStart, onPractice }: Props) {
  const { progress } = useProgress();
  const next = nextLesson(progress.completed);
  const outOfHearts = progress.hearts <= 0;
  const refill = nextHeartAt(progress);
  const canPractice = Object.keys(progress.completed).length > 0;

  if (!next || outOfHearts) {
    const title = !next ? 'সব লেসন শেষ!' : 'হার্ট শেষ';
    const sub = !next
      ? 'অনুশীলন করে শেখা ধরে রাখো'
      : `${toBanglaDigits(refill ? minutesUntil(refill) : 0)} মিনিটে একটি হার্ট ফিরবে`;
    return (
      <button
        className="upnext is-muted"
        onClick={() => canPractice && (haptic(), onPractice())}
        disabled={!canPractice}
        style={{ '--u': '#5856d6' } as CSSProperties}
      >
        <span className="upnext-kicker">{!next ? 'COURSE COMPLETE' : 'OUT OF HEARTS'}</span>
        <strong className="upnext-title" lang="bn">
          {title}
        </strong>
        <span className="upnext-meta" lang="bn">
          {sub}
        </span>
        {canPractice && (
          <span className="upnext-play" aria-hidden="true">
            <Glyph name="dumbbell" size={24} />
          </span>
        )}
      </button>
    );
  }

  const { unit, lesson, unitNumber, lessonNumber, doneInUnit } = next;
  const percent = (100 * doneInUnit) / unit.lessons.length;

  return (
    <button
      className="upnext"
      style={{ '--u': unit.color } as CSSProperties}
      onClick={() => {
        haptic();
        onStart(lesson.id);
      }}
      aria-label={`Start ${lesson.title}, unit ${unitNumber}`}
    >
      <span className="upnext-kicker">
        UP NEXT · UNIT {unitNumber} · <span lang="bn">{unit.titleBn}</span>
      </span>
      <strong className="upnext-title">{lesson.title}</strong>
      <span className="upnext-bn" lang="bn">
        {lesson.titleBn}
      </span>
      <span className="upnext-meta" lang="bn">
        লেসন {toBanglaDigits(lessonNumber)}/{toBanglaDigits(unit.lessons.length)} · +{toBanglaDigits(LESSON_XP)} XP
      </span>
      <span className="upnext-progress" aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </span>
      <span className="upnext-play" aria-hidden="true">
        <Glyph name="play" size={26} />
      </span>
    </button>
  );
}
