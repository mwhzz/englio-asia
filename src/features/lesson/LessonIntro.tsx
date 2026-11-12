import type { CSSProperties } from 'react';
import { toBanglaDigits } from '../../lib/bangla';
import { speak } from '../../lib/speech';
import type { Lesson } from '../../types';
import { useEnterKey } from './useEnterKey';
import { ALL_LESSONS } from '../../data/course';
import { GOAL_NAMES, goalOfUnit } from '../../data/goalTopics';
import { useProgress } from '../../state/ProgressContext';

/**
 * Before a lesson: what it teaches (its new words, tap to hear each) and its three parts, so the learner
 * knows where it's going. One tap starts it.
 */
export function LessonIntro({ lesson, accent, onStart, onQuit }: { lesson: Lesson; accent: string; onStart: () => void; onQuit: () => void }) {
  useEnterKey(onStart);
  const { progress } = useProgress();
  // A unit that serves the learner's goal (onboarding "why") says so.
  const unitTitle = ALL_LESSONS.find((x) => x.lesson.id === lesson.id)?.unit.title ?? '';
  const goal = goalOfUnit(unitTitle, progress.profile?.goals);
  return (
    <div className="li" style={{ '--u': accent } as CSSProperties}>
      <button type="button" className="li-close" onClick={onQuit} aria-label="বন্ধ করো">
        ×
      </button>
      <div className="li-main">
        <p className="li-kicker" lang="bn">
          আজ শিখবে
        </p>
        <h1>{lesson.title}</h1>
        <p className="li-sub" lang="bn">
          {lesson.titleBn}
        </p>
        {goal && (
          <p className="li-goal" lang="bn">
            তোমার লক্ষ্যের জন্য দরকারি: {GOAL_NAMES[goal]}
          </p>
        )}
        <div className="li-words">
          {lesson.vocab.map((w, i) => (
            <button key={w.en} type="button" className="li-word" style={{ animationDelay: `${120 + i * 70}ms` }} onClick={() => speak(w.en)}>
              <span className="li-en">{w.en}</span>
              <small lang="bn">{w.bn}</small>
            </button>
          ))}
        </div>
        <ol className="li-parts">
          <li lang="bn">
            <b>১</b> শেখো: {toBanglaDigits(lesson.vocab.length)}টা নতুন
          </li>
          <li lang="bn">
            <b>২</b> অনুশীলন: সহজ থেকে কঠিন
          </li>
          <li lang="bn">
            <b>৩</b> ফিরে আসা: আগের শেখা
          </li>
        </ol>
      </div>
      <button type="button" className="cta li-start" onClick={onStart} autoFocus>
        <span lang="bn">শুরু করো</span>
      </button>
    </div>
  );
}
