import { toBanglaDigits } from '../../lib/bangla';
import { minutesUntil, nextHeartAt } from '../../lib/hearts';
import { useProgress } from '../../state/ProgressContext';
import { LESSON_XP } from '../lesson/rewards';
import type { Lesson, Unit } from '../../types';
import { unlimitedHearts } from '../../lib/appSettings';

export type StopState = 'done' | 'current' | 'locked';

/** What the card needs to know about a lesson's place in the course. */
export interface LessonPlace {
  lesson: Lesson;
  unit: Unit;
  lessonIndex: number;
  unitIndex: number;
}

interface Props {
  stop: LessonPlace;
  state: StopState;
  onStart: () => void;
}

/** The glass card that opens under a lesson on the path. */
export function StopPopover({ stop, state, onStart }: Props) {
  const { progress } = useProgress();
  const refill = nextHeartAt(progress);
  const { lesson, unit, lessonIndex, unitIndex } = stop;

  return (
    <div className="rpop" role="dialog" aria-label={lesson.title}>
      <strong>{lesson.title}</strong>
      <span className="rpop-bn" lang="bn">
        {lesson.titleBn}
      </span>
      <small lang="bn">
        ইউনিট {toBanglaDigits(unitIndex + 1)} · লেসন {toBanglaDigits(lessonIndex + 1)}/{toBanglaDigits(unit.lessons.length)}
      </small>

      {state === 'locked' ? (
        <p className="rpop-note" lang="bn">
          আগের লেসনগুলো শেষ করলে খুলবে
        </p>
      ) : progress.hearts <= 0 && !unlimitedHearts() ? (
        <p className="rpop-note" lang="bn">
          হার্ট শেষ · {toBanglaDigits(refill ? minutesUntil(refill) : 0)} মিনিটে ফিরবে
        </p>
      ) : (
        <button className="rpop-go" onClick={onStart}>
          <span lang="bn">{state === 'done' ? 'আবার করো' : 'শুরু করো'}</span>
          <small lang="bn">+{toBanglaDigits(LESSON_XP)} XP</small>
        </button>
      )}
    </div>
  );
}
