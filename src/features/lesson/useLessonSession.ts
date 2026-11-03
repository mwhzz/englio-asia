import { useState } from 'react';
import { grade } from '../../lib/grade';
import { loseHeart } from '../../lib/hearts';
import { noteMistake, noteRight, reviewKey } from '../../lib/review';
import { playSound } from '../../lib/sounds';
import { speak } from '../../lib/speech';
import { track } from '../../lib/track';
import { useProgress } from '../../state/ProgressContext';
import type { Exercise, Grade } from '../../types';

export interface LessonStats {
  mistakes: number;
  attempts: number;
  seconds: number;
}

/** The lesson's state machine: answer → check → feedback → next exercise. */
export function useLessonSession(exercises: Exercise[], practice: boolean, onFinish: (stats: LessonStats) => void) {
  const { progress, update } = useProgress();
  const [queue, setQueue] = useState(exercises);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Grade | null>(null);
  const [solved, setSolved] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  /** Right answers in a row. */
  const [combo, setCombo] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const [outOfHearts, setOutOfHearts] = useState(false);
  const exercise = queue[index];

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
      if (!practice) update((p) => loseHeart(p, Date.now()));
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

  function next() {
    if (!practice && progress.hearts <= 0) {
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
    /** 1-based place of this exercise, and how many there are (missed ones are added at the end). */
    position: index + 1,
    count: queue.length,
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
