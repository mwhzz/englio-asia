import { useEffect, useState } from 'react';
import { grade } from '../../lib/grade';
import { loseHeart } from '../../lib/hearts';
import { noteMistake, noteRight, reviewKey } from '../../lib/review';
import { playSound } from '../../lib/sounds';
import { speak } from '../../lib/speech';
import { track } from '../../lib/track';
import { useProgress } from '../../state/ProgressContext';
import type { Exercise, Grade } from '../../types';
import { unlimitedHearts } from '../../lib/appSettings';

export interface LessonStats {
  mistakes: number;
  attempts: number;
  seconds: number;
}

/** Where an unfinished lesson stopped, to carry on from (see lib/lessonResume.ts). */
export interface SessionState {
  queue: Exercise[];
  index: number;
  solved: number;
  mistakes: number;
}

/**
 * The lesson's state machine: answer → check → feedback → next exercise. It can start from a saved
 * `resume` state, and reports its state after each answered exercise through `onSave`.
 */
export function useLessonSession(
  exercises: Exercise[],
  practice: boolean,
  onFinish: (stats: LessonStats) => void,
  resume?: SessionState | null,
  onSave?: (state: SessionState) => void,
) {
  const { progress, update } = useProgress();
  const [queue, setQueue] = useState(resume?.queue ?? exercises);
  const [index, setIndex] = useState(resume?.index ?? 0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Grade | null>(null);
  const [solved, setSolved] = useState(resume?.solved ?? 0);
  const [mistakes, setMistakes] = useState(resume?.mistakes ?? 0);
  /** Right answers in a row. */
  const [combo, setCombo] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const [outOfHearts, setOutOfHearts] = useState(false);
  const exercise = queue[index];
  // The lesson's own questions (missed ones asked again end in "r").
  const total = queue.filter((e) => !e.id.endsWith('r')).length;

  function check(value = answer) {
    if (value === null || feedback) return;
    const result = grade(exercise, value);
    setFeedback(result);
    // Missed words and sentences come back in a later review; right ones move a step on.
    const key = reviewKey(exercise);
    if (key) update((p) => (result.result === 'wrong' ? noteMistake(p, key) : noteRight(p, key)));

    if (result.result === 'wrong') {
      track('mistake', key ?? `${exercise.kind}:${exercise.id.replace(/r+$/, '')}`);
      playSound('wrong');
      setMistakes((m) => m + 1);
      setCombo(0);
      // Missed exercises come back at the end, like flash cards.
      setQueue((q) => [...q, { ...exercise, id: `${exercise.id}r` }]);
      // Englio Plus learners (and everyone, when hearts are switched off) have unlimited hearts.
      if (!practice && !unlimitedHearts()) update((p) => loseHeart(p, Date.now()));
    } else {
      playSound('correct');
      setSolved((s) => s + 1);
      setCombo((c) => c + 1);
    }

    const k = exercise.kind;
    if (k === 'translate' || k === 'type' || k === 'fill' || k === 'gaps' || k === 'grammar' || k === 'dialog') {
      setTimeout(() => speak(result.solution), 350);
    }
  }

  // After each move on, so a lesson cut off halfway can carry on from here.
  useEffect(() => {
    if (solved + mistakes > 0) onSave?.({ queue, index, solved, mistakes });
  }, [index]);

  function next() {
    if (!practice && progress.hearts <= 0 && !unlimitedHearts()) {
      setOutOfHearts(true);
      return;
    }
    if (index + 1 >= queue.length) {
      onFinish({ mistakes, attempts: solved + mistakes, seconds: Math.round((Date.now() - startedAt) / 1000) });
      return;
    }
    setIndex(index + 1);
    setAnswer(null);
    setFeedback(null);
  }

  function answerChanged(value: string | null) {
    setAnswer(value);
    // Matching has no Check button: it is graded once every pair is found.
    if (exercise.kind === 'match' && value) check(value);
  }

  return {
    exercise,
    /**
     * Which of the lesson's own questions this is (1-based). A missed one comes back at the end marked
     * "আবার", and the total the learner sees doesn't grow.
     */
    position: Math.min(queue.slice(0, index + 1).filter((e) => !e.id.endsWith('r')).length, total),
    count: total,
    /** A missed question asked again. */
    again: exercise?.id.endsWith('r') ?? false,
    /** Where in the queue (for resuming). */
    index,
    answer,
    feedback,
    solved,
    combo,
    started: solved + mistakes > 0,
    outOfHearts,
    hearts: progress.hearts,
    check,
    next,
    answerChanged,
  };
}
