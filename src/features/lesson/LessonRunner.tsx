import { useEffect, useState } from 'react';
import { ALL_LESSONS } from '../../data/course';
import { dayKey } from '../../lib/days';
import { buildLesson, buildPractice } from '../../lib/lesson';
import { canListen } from '../../lib/listen';
import { clearResume, loadResume, saveResume } from '../../lib/lessonResume';
import { buildReview } from '../../lib/review';
import { buildListening, buildSpeaking } from '../../lib/speakListen';
import { track } from '../../lib/track';
import { useProgress } from '../../state/ProgressContext';
import { shouldAskReminder } from '../reminder/askOnce';
import { ReminderAsk } from '../reminder/ReminderAsk';
import { LessonComplete } from './LessonComplete';
import { LessonView } from './LessonView';
import { applyRewards, type LessonResult } from './rewards';
import { feature } from '../../lib/appSettings';

const PRACTICE_COLOR = '#af52de';
const MODE_COLOR = { listening: '#007aff', speaking: '#ff2d55' } as const;

interface Props {
  /** null runs a practice session built from completed lessons (or, with `review`, the missed items due today). */
  lessonId: string | null;
  review?: boolean;
  /** With no lessonId: a listening or speaking round from what's been learned (the শোনা ও বলা tab). */
  mode?: 'listening' | 'speaking';
  onExit: () => void;
  onPractice: () => void;
}

export function LessonRunner({ lessonId, review = false, mode, onExit, onPractice }: Props) {
  const { progress, update } = useProgress();
  // A lesson left halfway in the last few hours carries on where it stopped.
  const [resume] = useState(() => (lessonId ? loadResume(lessonId) : null));
  const [exercises] = useState(() =>
    resume
      ? resume.queue
      : lessonId
      ? buildLesson(lessonId, { speak: canListen() && navigator.onLine })
      : mode === 'listening'
        ? buildListening(progress)
        : mode === 'speaking'
          ? buildSpeaking(progress)
          : review
            ? buildReview(progress)
            : buildPractice(progress.completed),
  );
  const [result, setResult] = useState<LessonResult | null>(null);
  // After a real lesson, offer the daily reminder once per phone (see features/reminder).
  const [askReminder, setAskReminder] = useState(false);
  useEffect(() => {
    if (lessonId) track('lesson_start', lessonId);
  }, [lessonId]);

  const accent = ALL_LESSONS.find((x) => x.lesson.id === lessonId)?.unit.color ?? (mode ? MODE_COLOR[mode] : PRACTICE_COLOR);

  if (result) {
    const next = () => (lessonId && feature('reminders') && shouldAskReminder(progress.reminder?.on ?? false) ? setAskReminder(true) : onExit());
    return (
      <>
        <LessonComplete result={result} accent={accent} onContinue={next} />
        {askReminder && <ReminderAsk onDone={onExit} />}
      </>
    );
  }

  return (
    <LessonView
      exercises={exercises}
      practice={lessonId === null}
      accent={accent}
      where={lessonId ? `lesson:${lessonId}` : (mode ?? (review ? 'review' : 'practice'))}
      resume={resume}
      onSave={lessonId ? (state) => saveResume({ lessonId, ...state }) : undefined}
      onQuit={() => {
        clearResume();
        onExit();
      }}
      onLater={lessonId ? onExit : undefined}
      onPractice={onPractice}
      onFinish={(stats) => {
        const today = dayKey();
        if (lessonId) track('lesson_done', lessonId);
        clearResume();
        setResult(applyRewards(progress, lessonId, stats, today).result);
        update((p) => applyRewards(p, lessonId, stats, today).progress);
      }}
    />
  );
}
