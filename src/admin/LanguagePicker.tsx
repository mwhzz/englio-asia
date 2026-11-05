import { setAdminLang, useAdminLang, useLanguages } from './useAdminLang';

/**
 * Which language's content a page shows and edits: one pill per language (a draft one is marked). Shown on
 * top of the Lessons, Grammar and Stories pages; hidden while Bangla is the only language.
 */
export function LanguagePicker() {
  const lang = useAdminLang();
  const languages = useLanguages();
  if (!languages || languages.length < 2) return null;
  return (
    <div className="ad-langs" role="radiogroup" aria-label="Content language">
      {languages.map((l) => (
        <button key={l.code} role="radio" aria-checked={lang === l.code} className={lang === l.code ? 'is-on' : undefined} onClick={() => setAdminLang(l.code)}>
          <span dir={l.dir}>{l.native}</span>
          {l.status === 'draft' && <small lang="bn">খসড়া</small>}
        </button>
      ))}
    </div>
  );
}
