import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Glyph } from '../../../components/Glyph';
import { MixedText } from '../../../components/MixedText';
import { SpeakButton } from '../../../components/SpeakButton';
import type { CourseLesson as Lesson } from '../../../data/grammarCourses/types';
import { toBanglaDigits } from '../../../lib/bangla';
import { dayKey } from '../../../lib/days';
import { haptic } from '../../../lib/haptics';
import { recordLesson } from '../../../lib/progress';
import { playSound } from '../../../lib/sounds';
import { track } from '../../../lib/track';
import { useProgress } from '../../../state/ProgressContext';
import { makeQuestions, type CourseQuestion } from './makeQuestions';
import { QuestionView } from './QuestionView';
import { useBackButton } from '../../../lib/backButton';
import { ReportButton } from '../../report/ReportButton';

const LESSON_XP = 10;

interface Props {
  lesson: Lesson;
  number: number;
  earlier: Lesson[];
  /** The topic to mark learned when this is the course's last lesson. */
  finishesTopic?: string;
  onNext?: () => void;
  onClose: () => void;
}

const rightAnswer = (q: CourseQuestion, picked: string | number) => (q.kind === 'tap' ? q.words[picked as number]?.pos === q.target : picked === q.answer);

/**
 * One course lesson, full screen: a short "learn it" screen, then its questions one by one.
 * A missed question comes back at the end, so the lesson ends with everything answered right.
 */
export function CourseLesson({ lesson, number, earlier, finishesTopic, onNext, onClose }: Props) {
  useBackButton(onClose);
  const { update } = useProgress();
  const [phase, setPhase] = useState<'teach' | 'ask' | 'done'>('teach');
  const [queue, setQueue] = useState(() => makeQuestions(lesson, earlier));
  const [total] = useState(queue.length);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [solved, setSolved] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const q = queue[i];
  const right = picked !== null && rightAnswer(q, picked);

  function pick(choice: string | number) {
    haptic();
    setPicked(choice);
    if (rightAnswer(q, choice)) {
      playSound('correct');
      setSolved((n) => n + 1);
    } else {
      playSound('wrong');
      setMistakes((m) => m + 1);
      setQueue((list) => [...list, q]);
    }
  }

  function next() {
    setPicked(null);
    if (i + 1 < queue.length) return setI(i + 1);
    playSound('complete');
    setPhase('done');
    track('course_done', lesson.id);
    update((p) => {
      const after = recordLesson(p, null, LESSON_XP, dayKey(), Math.round((Date.now() - startedAt) / 1000));
      const done = [...new Set([...(p.grammarLessonsDone ?? []), lesson.id])];
      const learned = finishesTopic ? [...new Set([...(p.grammarLearned ?? []), finishesTopic])] : p.grammarLearned;
      return { ...after, grammarLessonsDone: done, grammarLearned: learned };
    });
  }

  return createPortal(
    <div className="lg cl" role="dialog" aria-label={lesson.title}>
      <header className="lp-bar">
        <button className="lp-back" onClick={onClose} aria-label="Close lesson">
          <Glyph name="close" size={16} />
        </button>
        <div className="lg-progress" aria-hidden="true">
          <span style={{ width: `${phase === 'done' ? 100 : phase === 'teach' ? 0 : (100 * Math.min(solved, total)) / total}%` }} />
        </div>
        <span className="cl-num" lang="bn">
          {toBanglaDigits(number)}
        </span>
      </header>

      {phase === 'teach' && (
        <div className="lg-body cl-teach">
          <p className="cl-kicker" lang="bn">
            লেসন {toBanglaDigits(number)} · শিখে নাও
          </p>
          <h1 className="lg-title">
            {lesson.title}
            <small lang="bn">{lesson.titleBn}</small>
          </h1>
          <div className="gt-card">
            {lesson.teach.points.map((p, k) => (
              <p key={k} className="gt-para" lang="bn">
                <MixedText text={p} />
              </p>
            ))}
          </div>
          <ul className="gt-card gt-examples">
            {lesson.teach.examples.map(([en, bn]) => (
              <li key={en}>
                <SpeakButton text={en} />
                <span>
                  <strong>{en}</strong>
                  <small lang="bn">
                    <MixedText text={bn} />
                  </small>
                </span>
              </li>
            ))}
          </ul>
          <button className="cta" onClick={() => setPhase('ask')}>
            <span lang="bn">
              অনুশীলন শুরু করো · {toBanglaDigits(total)}টি প্রশ্ন
            </span>
          </button>
        </div>
      )}

      {phase === 'ask' && q && (
        <div className={`lg-body cl-ask${picked !== null ? ' is-answered' : ''}`} key={i}>
          <QuestionView q={q} picked={picked} onPick={pick} />
          {picked !== null && (
            <div className={`gq-why${right ? ' is-right' : ' is-wrong'}`}>
              <p lang="bn">
                <strong>{right ? 'ঠিক! ' : 'ভুল। '}</strong>
                <MixedText text={q.why} />
                {!right && ' প্রশ্নটা শেষে আবার আসবে।'}
              </p>
              <div className="qz-actions">
                <ReportButton where={`course:${lesson.id}`} question={q.kind === 'tap' ? q.words.map((w) => w.word).join(' ') : `${q.prompt} ${q.card}`.trim()} answer={String(picked)} />
                <button className="cta" onClick={next}>
                  <span lang="bn">পরবর্তী</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {phase === 'done' && (
        <div className="lg-done">
          <span className="lg-done-mark">
            <Glyph name={mistakes === 0 ? 'trophy' : 'check'} size={40} />
          </span>
          <h1 lang="bn">{finishesTopic ? 'পুরো কোর্স শেষ!' : 'লেসন শেষ!'}</h1>
          <p lang="bn">
            {mistakes === 0 ? 'একটাও ভুল হয়নি' : `${toBanglaDigits(mistakes)}টা ভুল ঠিক করে নিয়েছ`} · +{toBanglaDigits(LESSON_XP)} XP
          </p>
          <div className="cta-stack">
            {onNext && (
              <button className="cta" onClick={onNext}>
                <span lang="bn">পরের লেসন</span>
              </button>
            )}
            <button className={onNext ? 'cta-text' : 'cta'} onClick={onClose}>
              <span lang="bn">কোর্সে ফিরে যাও</span>
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
