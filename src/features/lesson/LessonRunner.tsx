import { useEffect, useState } from 'react';
import { ALL_LESSONS } from '../../data/course';
import { dayKey } from '../../lib/days';
import { buildLesson, buildPractice } from '../../lib/lesson';
import { canListen } from '../../lib/listen';
import { buildReview } from '../../lib/review';
import { track } from '../../lib/track';
import { useProgress } from '../../state/ProgressContext';
import { LessonComplete } from './LessonComplete';
import { LessonView } from './LessonView';
import { applyRewards, type LessonResult } from './rewards';

const PRACTICE_COLOR = '#af52de';

interface Props {
  /** null runs a practice session built from completed lessons (or, with `review`, the missed items due today). */
  lessonId: string | null;
  review?: boolean;
  onExit: () => void;
  onPractice: () => void;
}

export function LessonRunner({ lessonId, review = false, onExit, onPractice }: Props) {
  const { progress, update } = useProgress();
  const [exercises] = useState(() => (lessonId ? buildLesson(lessonId, { speak: canListen() }) : review ? buildReview(progress) : buildPractice(progress.completed)));
  const [result, setResult] = useState<LessonResult | null>(null);
  useEffect(() => {
    if (lessonId) track('lesson_start', lessonId);
  }, [lessonId]);

  const accent = ALL_LESSONS.find((x) => x.lesson.id === lessonId)?.unit.color ?? PRACTICE_COLOR;

  if (result) return <LessonComplete result={result} accent={accent} onContinue={onExit} />;

  return (
    <LessonView
      exercises={exercises}
      practice={lessonId === null}
      accent={accent}
      onQuit={onExit}
      onPractice={onPractice}
      onFinish={(stats) => {
        const today = dayKey();
        if (lessonId) track('lesson_done', lessonId);
        setResult(applyRewards(progress, lessonId, stats, today).result);
        update((p) => applyRewards(p, lessonId, stats, today).progress);
      }}
    />
  );
}
