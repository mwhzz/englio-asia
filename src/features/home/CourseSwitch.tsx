import { useState } from 'react';
import { Modal } from '../../components/Modal';
import { haptic } from '../../lib/haptics';
import { coursesForMe, learnerLang, setLearnerLang, uiLang, type LiveLanguage } from '../../lib/learnerLang';

/** A course's name as the learner sees it: what it teaches. */
const courseName = (c: LiveLanguage) => (c.code === uiLang() ? 'English' : c.target === 'ar' ? 'العربية' : c.native);
/** A short mark for the pill. */
const courseMark = (c: LiveLanguage) => (c.code === uiLang() ? 'Aa' : c.target === 'ar' ? 'ع' : c.native.slice(0, 2));

/**
 * Like Duolingo: the course being learned sits at the top of Home; one tap opens every course, another
 * switches (the app reloads in it). XP, streak and the league are shared; each course keeps its own path.
 * Shown only when more than one course is live for the learner.
 */
export function CourseSwitch() {
  const [open, setOpen] = useState(false);
  const courses = coursesForMe();
  const current = courses.find((c) => c.code === learnerLang()) ?? courses[0];
  if (courses.length < 2 || !current) return null;

  return (
    <>
      <button
        type="button"
        className="cs-pill"
        aria-label={`এখন শিখছ: ${courseName(current)}। ভাষা বদলাও`}
        onClick={() => {
          haptic();
          setOpen(true);
        }}
      >
        <span className={`cs-mark${current.target === 'ar' ? ' is-ar' : ''}`} aria-hidden="true">
          {courseMark(current)}
        </span>
        <span className="cs-name">{courseName(current)}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <Modal onClose={() => setOpen(false)}>
          <div className="cs-sheet">
            <h2 lang="bn">কী শিখবে?</h2>
            <p className="cs-note" lang="bn">
              একসাথে একাধিক ভাষা শেখা যায়। স্ট্রিক আর XP সবগুলোতে একসাথে, প্রতিটা ভাষার পথ আলাদা।
            </p>
            <div className="cs-list" role="radiogroup" aria-label="কী শিখবে?">
              {courses.map((c) => {
                const on = c.code === current.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    className={`cs-row${on ? ' is-on' : ''}`}
                    onClick={() => (on ? setOpen(false) : setLearnerLang(c.code))}
                  >
                    <span className={`cs-mark${c.target === 'ar' ? ' is-ar' : ''}`} aria-hidden="true">
                      {courseMark(c)}
                    </span>
                    <span className="cs-row-name">{courseName(c)}</span>
                    {on && (
                      <span className="cs-now" lang="bn">
                        এখন
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
