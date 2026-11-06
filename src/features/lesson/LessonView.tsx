import { useState, type CSSProperties } from 'react';
import type { Exercise } from '../../types';
import { ExerciseView } from '../exercises/ExerciseView';
import { HeroTag } from '../exercises/HeroTag';
import { instructionFor } from '../exercises/instructions';
import { LessonFooter } from './LessonFooter';
import { LessonHeader } from './LessonHeader';
import { OutOfHearts } from './OutOfHearts';
import { QuitDialog } from './QuitDialog';
import { useEnterKey } from './useEnterKey';
import { useLessonSession, type LessonStats, type SessionState } from './useLessonSession';
import { useBackButton } from '../../lib/backButton';
import { unlimitedHearts } from '../../lib/appSettings';

interface Props {
  exercises: Exercise[];
  practice: boolean;
  /** The unit's color, used for the progress bar and the soft glow at the top. */
  accent: string;
  /** Where this session is, for "this question is wrong" reports (e.g. "lesson:u1-l2"). */
  where: string;
  /** Carry on an unfinished lesson from here, and save where it is as it goes. */
  resume?: SessionState | null;
  onSave?: (state: SessionState) => void;
  onQuit: () => void;
  /** Leaves but keeps the place, to carry on later (only lessons can be resumed). */
  onLater?: () => void;
  onPractice: () => void;
  onFinish: (stats: LessonStats) => void;
}

export function LessonView({ exercises, practice, accent, where, resume, onSave, onQuit, onLater, onPractice, onFinish }: Props) {
  const session = useLessonSession(exercises, practice, onFinish, resume, onSave);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const { exercise, feedback } = session;
  useEnterKey(() => (feedback ? session.next() : session.check()));

  useBackButton(() => (session.started ? setConfirmQuit(true) : onQuit()));
  if (session.outOfHearts) return <OutOfHearts onPractice={onPractice} onQuit={onQuit} />;

  const instruction = instructionFor(exercise);
  return (
    <div className="lesson" style={{ '--u': accent } as CSSProperties}>
      <LessonHeader
        done={session.solved}
        total={exercises.length}
        hearts={practice ? null : unlimitedHearts() ? Infinity : session.hearts}
        onQuit={() => (session.started ? setConfirmQuit(true) : onQuit())}
      />

      <main className={`lesson-body${feedback?.result === 'wrong' ? ' is-wrong' : ''}`} key={exercise.id}>
        {resume && session.index === resume.index && (
          <p className="redo-tag" lang="bn">
            ↻ যেখানে থেমেছিলে, সেখান থেকে
          </p>
        )}
        {exercise.id.endsWith('r') && (
          <p className="redo-tag" lang="bn">
            ↻ আগের ভুলটা আবার
          </p>
        )}
        <h1 className="instruction">
          <span lang="bn">{instruction.bn}</span>
          <small>{instruction.en}</small>
        </h1>
        <div className={`lesson-stage${exercise.kind === 'match' ? ' no-hero' : ''}`}>
          <HeroTag kind={exercise.kind} number={session.position} total={session.count} again={session.again} />
          <ExerciseView ex={exercise} disabled={feedback !== null} onChange={session.answerChanged} />
        </div>
      </main>

      <LessonFooter
        exercise={exercise}
        canCheck={session.answer !== null}
        feedback={feedback}
        combo={session.combo}
        where={where}
        onCheck={() => session.check()}
        onNext={session.next}
      />

      {confirmQuit && <QuitDialog onStay={() => setConfirmQuit(false)} onQuit={onQuit} onLater={onLater} />}
    </div>
  );
}
