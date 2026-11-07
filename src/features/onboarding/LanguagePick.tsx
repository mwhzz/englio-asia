import { baseLanguages, coursesForMe, learnerLang, setLearnerLang, uiLang } from '../../lib/learnerLang';

/**
 * On the welcome screen: the learner's own language when more than one is live (each in its own script, so
 * anyone finds theirs), and what to learn when there's more than English for them (ইংরেজি · আরবি).
 * Picking another reloads the app in it.
 */
export function LanguagePick() {
  const languages = baseLanguages();
  const courses = coursesForMe();
  const current = learnerLang();
  return (
    <>
      {languages.length > 1 && (
        <div className="ob-langs" role="radiogroup" aria-label="Your language" data-no-translate>
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              role="radio"
              aria-checked={l.code === uiLang()}
              className={`ob-lang${l.code === uiLang() ? ' is-on' : ''}`}
              lang={l.code}
              dir={l.dir}
              onClick={() => setLearnerLang(l.code)}
            >
              {l.native}
            </button>
          ))}
        </div>
      )}
      {courses.length > 1 && (
        <div className="ob-langs ob-courses" role="radiogroup" aria-label="What to learn">
          <span className="ob-courses-label" lang="bn">
            কী শিখবে?
          </span>
          {courses.map((c) => (
            <button
              key={c.code}
              type="button"
              role="radio"
              aria-checked={c.code === current}
              className={`ob-lang${c.code === current ? ' is-on' : ''}`}
              onClick={() => setLearnerLang(c.code)}
            >
              {c.code === uiLang() ? 'English' : c.target === 'ar' ? 'العربية' : c.native}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
