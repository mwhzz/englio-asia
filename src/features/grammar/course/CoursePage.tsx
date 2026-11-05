import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Glyph } from '../../../components/Glyph';
import { lessonsOf } from '../../../data/grammarCourses';
import type { GrammarCourse } from '../../../data/grammarCourses/types';
import { toBanglaDigits } from '../../../lib/bangla';
import { useProgress } from '../../../state/ProgressContext';
import type { GrammarTopic } from '../../../types';
import { CourseLesson } from './CourseLesson';
import { useBackButton } from '../../../lib/backButton';

/** A topic's course: every lesson by unit, done ones ticked, the next one ready, later ones locked. */
export function CoursePage({ topic, course, onClose }: { topic: GrammarTopic; course: GrammarCourse; onClose: () => void }) {
  useBackButton(onClose);
  const { progress } = useProgress();
  const lessons = lessonsOf(course);
  const done = new Set(progress.grammarLessonsDone ?? []);
  const nextIndex = lessons.findIndex((l) => !done.has(l.id));
  const [open, setOpen] = useState<number | null>(null);
  const count = lessons.filter((l) => done.has(l.id)).length;

  return createPortal(
    <div className="gt cp" role="dialog" aria-label={`${topic.title} course`}>
      <header className="lp-bar">
        <button className="lp-back" onClick={onClose} aria-label="Back to the topic">
          <Glyph name="back" size={20} />
        </button>
        <span className="gt-level" lang="bn">
          পুরো কোর্স
        </span>
        <span className="cl-num" lang="bn">
          {toBanglaDigits(count)}/{toBanglaDigits(lessons.length)}
        </span>
      </header>

      <div className="gt-body">
        <div className="gt-hero">
          <h1>{topic.title}</h1>
          <p className="gt-bn" lang="bn">
            {topic.titleBn} · {toBanglaDigits(lessons.length)}টি লেসন
          </p>
          <span className="cp-bar" aria-hidden="true">
            <span style={{ width: `${(100 * count) / lessons.length}%` }} />
          </span>
          <p className="gt-summary" lang="bn">
            {count === lessons.length
              ? 'পুরো কোর্স শেষ! চাইলে যেকোনো লেসন আবার করতে পারো।'
              : 'প্রতিটা লেসনে আগের শেখা জিনিসও ফিরে আসে, যাতে কিছু ভুলে না যাও।'}
          </p>
        </div>

        {course.units.map((unit, u) => (
          <section key={unit.title} className="pf-section is-plain">
            <h2 className="pf-list-title">
              <span lang="bn">
                {toBanglaDigits(u + 1)}. {unit.titleBn}
              </span>{' '}
              <small>{unit.title}</small>
            </h2>
            <div className="pf-list">
              {unit.lessons.map((l) => {
                const index = lessons.indexOf(l);
                const state = done.has(l.id) ? 'done' : index === nextIndex ? 'next' : 'locked';
                return (
                  <button key={l.id} className={`pf-row cp-row is-${state}`} disabled={state === 'locked'} onClick={() => setOpen(index)}>
                    <span className="cp-num" lang="bn">
                      {state === 'done' ? <Glyph name="check" size={14} /> : state === 'locked' ? <Glyph name="lock" size={13} /> : toBanglaDigits(index + 1)}
                    </span>
                    <span className="pf-row-text">
                      <span>{l.title}</span>
                      <small lang="bn">{l.titleBn}</small>
                    </span>
                    {state === 'next' && (
                      <span className="cp-go" lang="bn">
                        শুরু করো
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {open !== null && (
        <CourseLesson
          key={lessons[open].id}
          lesson={lessons[open]}
          number={open + 1}
          earlier={lessons.slice(0, open)}
          finishesTopic={open === lessons.length - 1 ? topic.id : undefined}
          onNext={open + 1 < lessons.length ? () => setOpen(open + 1) : undefined}
          onClose={() => setOpen(null)}
        />
      )}
    </div>,
    document.body,
  );
}
