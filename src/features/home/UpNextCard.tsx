import type { CSSProperties } from 'react';
import { Glyph } from '../../components/Glyph';
import { toBanglaDigits } from '../../lib/bangla';
import { haptic } from '../../lib/haptics';
import { minutesUntil, nextHeartAt } from '../../lib/hearts';
import { useProgress } from '../../state/ProgressContext';
import { LESSON_XP } from '../lesson/rewards';
import { nextLesson } from './nextLesson';
import { unitLocked, unlimitedHearts } from '../../lib/appSettings';
import { PlusBadge } from '../premium/PlusBadge';

interface Props {
  onStart: (lessonId: string) => void;
  onPractice: () => void;
}

/** One big card that resumes learning with a single tap. */
export function UpNextCard({ onStart, onPractice }: Props) {
  const { progress } = useProgress();
  // Plus-only units are skipped: "next" is the next lesson the learner can actually open.
  const next = nextLesson(progress.completed, unitLocked);
  const lockedAhead = !next && !!nextLesson(progress.completed);
  const outOfHearts = progress.hearts <= 0 && !unlimitedHearts();
  const refill = nextHeartAt(progress);
  // Practice works from the first day (it uses the first lesson's words before anything is finished).
  const canPractice = true;

  if (!next || outOfHearts) {
    const title = outOfHearts && next ? 'হার্ট শেষ' : lockedAhead ? 'ফ্রি লেসন সব শেষ!' : 'সব লেসন শেষ!';
    const sub =
      outOfHearts && next
        ? `${toBanglaDigits(refill ? minutesUntil(refill) : 0)} মিনিটে একটা হার্ট ফিরবে · এখনই অনুশীলন করে হার্ট নাও`
        : lockedAhead
          ? 'পরের ইউনিটগুলো Plus-এ। ততক্ষণ অনুশীলন, গল্প আর ব্যাকরণে শেখা ধরে রাখো'
          : 'অনুশীলন করে শেখা ধরে রাখো';
    return (
      <button
        className="upnext is-muted"
        onClick={() => canPractice && (haptic(), onPractice())}
        disabled={!canPractice}
        style={{ '--u': '#5856d6' } as CSSProperties}
      >
        <span className="upnext-kicker" lang="bn">
          {outOfHearts && next ? 'হার্ট শেষ' : 'অনুশীলন'}
        </span>
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
        <span lang="bn">পরের লেসন · ইউনিট {toBanglaDigits(unitNumber)}</span> · <span lang="bn">{unit.titleBn}</span> {unitLocked(unit.id) && <PlusBadge />}
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
