import { learnerLang, liveLanguages, setLearnerLang } from '../../lib/learnerLang';

/**
 * On the welcome screen, when more than one learner language is live: the learner's own language, each in its
 * own script (বাংলা · العربية), so anyone can find theirs. Picking another reloads the app in it.
 */
export function LanguagePick() {
  const languages = liveLanguages();
  if (languages.length < 2) return null;
  const current = learnerLang();
  return (
    <div className="ob-langs" role="radiogroup" aria-label="Your language" data-no-translate>
      {languages.map((l) => (
        <button
          key={l.code}
          type="button"
          role="radio"
          aria-checked={l.code === current}
          className={`ob-lang${l.code === current ? ' is-on' : ''}`}
          lang={l.code}
          dir={l.dir}
          onClick={() => setLearnerLang(l.code)}
        >
          {l.native}
        </button>
      ))}
    </div>
  );
}
