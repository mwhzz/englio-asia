import { useState } from 'react';
import { Glyph } from '../../components/Glyph';
import { haptic } from '../../lib/haptics';
import { learnerLang, liveLanguages, setLearnerLang } from '../../lib/learnerLang';

const FONT_KEY = 'englio-ar-font';

/**
 * Settings: my language (when more than one is live; the app reloads in it), and for Arabic the letter style:
 * a clean modern one or Naskh, the familiar book style.
 */
export function LanguageRows() {
  const languages = liveLanguages();
  const lang = learnerLang();
  const [font, setFont] = useState(() => {
    try {
      return localStorage.getItem(FONT_KEY) === 'naskh' ? 'naskh' : 'sans';
    } catch {
      return 'sans';
    }
  });
  const pickFont = (f: 'sans' | 'naskh') => {
    haptic();
    setFont(f);
    try {
      localStorage.setItem(FONT_KEY, f);
    } catch {
      // For now only.
    }
    if (f === 'naskh') document.documentElement.dataset.arFont = 'naskh';
    else delete document.documentElement.dataset.arFont;
  };

  return (
    <>
      {languages.length > 1 && (
        <div className="pf-row">
          <span className="pf-icon" style={{ background: '#007aff' }}>
            <Glyph name="globe" size={17} />
          </span>
          <span className="pf-row-text">
            <span lang="bn">আমার ভাষা</span>
            <small lang="bn">মানে আর অ্যাপের লেখা এই ভাষায়</small>
          </span>
          <span className="pf-segmented lr-seg" role="radiogroup" aria-label="Language" data-no-translate>
            {languages.map((l) => (
              <button key={l.code} role="radio" aria-checked={l.code === lang} className={l.code === lang ? 'is-on' : ''} lang={l.code} onClick={() => setLearnerLang(l.code)}>
                {l.native}
              </button>
            ))}
          </span>
        </div>
      )}
      {lang === 'ar' && (
        <div className="pf-row">
          <span className="pf-icon" style={{ background: '#34c759' }}>
            <Glyph name="letters" size={17} />
          </span>
          <span className="pf-row-text">
            <span>نوع الخط العربي</span>
            <small>اختر الخط الأسهل في القراءة</small>
          </span>
          <span className="pf-segmented lr-seg" role="radiogroup" aria-label="Arabic font" data-no-translate>
            <button role="radio" aria-checked={font === 'sans'} className={font === 'sans' ? 'is-on' : ''} style={{ fontFamily: 'Noto Sans Arabic Variable' }} onClick={() => pickFont('sans')}>
              عصري
            </button>
            <button role="radio" aria-checked={font === 'naskh'} className={font === 'naskh' ? 'is-on' : ''} style={{ fontFamily: 'Noto Naskh Arabic Variable' }} onClick={() => pickFont('naskh')}>
              نسخ
            </button>
          </span>
        </div>
      )}
    </>
  );
}
