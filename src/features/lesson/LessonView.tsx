import { useState, type CSSProperties } from 'react';
import type { Exercise } from '../../types';
import { ExerciseView } from '../exercises/ExerciseView';
import { HeroTag } from '../exercises/HeroTag';
import { INSTRUCTIONS } from '../exercises/instructions';
import { LessonFooter } from './LessonFooter';
import { LessonHeader } from './LessonHeader';
import { OutOfHearts } from './OutOfHearts';
import { QuitDialog } from './QuitDialog';
import { useEnterKey } from './useEnterKey';
import { useLessonSession, type LessonStats } from './useLessonSession';

interface Props {
  exercises: Exercise[];
  practice: boolean;
  /** The unit's color, used for the progress bar and the soft glow at the top. */
  accent: string;
  onQuit: () => void;
  onPractice: () => void;
  onFinish: (stats: LessonStats) => void;
}

export function LessonView({ exercises, practice, accent, onQuit, onPractice, onFinish }: Props) {
  const session = useLessonSession(exercises, practice, onFinish);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const { exercise, feedback } = session;
  useEnterKey(() => (feedback ? session.next() : session.check()));

  if (session.outOfHearts) return <OutOfHearts onPractice={onPractice} onQuit={onQuit} />;

  const instruction = INSTRUCTIONS[exercise.kind];
  return (
    <div className="lesson" style={{ '--u': accent } as CSSProperties}>
      <LessonHeader
        done={session.solved}
        total={exercises.length}
        hearts={practice ? null : session.hearts}
        onQuit={() => (session.started ? setConfirmQuit(true) : onQuit())}
      />

      <main className={`lesson-body${feedback?.result === 'wrong' ? ' is-wrong' : ''}`} key={exercise.id}>
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
          <HeroTag kind={exercise.kind} number={session.position} total={session.count} />
          <ExerciseView ex={exercise} disabled={feedback !== null} onChange={session.answerChanged} />
        </div>
      </main>

      <LessonFooter
        exercise={exercise}
        canCheck={session.answer !== null}
        feedback={feedback}
        combo={session.combo}
        onCheck={() => session.check()}
        onNext={session.next}
      />

      {confirmQuit && <QuitDialog onStay={() => setConfirmQuit(false)} onQuit={onQuit} />}
    </div>
  );
}
