import { useState } from 'react';
import { Glyph } from '../../components/Glyph';
import { toBanglaDigits } from '../../lib/bangla';
import { useProgress } from '../../state/ProgressContext';
import { COURSE } from '../../data/course';
import { CertificatesPage } from '../unittest/CertificatesPage';
import { WordsPage } from '../words/WordsPage';
import { HelpPage } from '../help/HelpPage';

/** Shortcuts from the profile to what the learner has collected: their words and certificates. */
export function LearningLinks() {
  const { progress } = useProgress();
  const [open, setOpen] = useState<'words' | 'certificates' | 'help' | null>(null);
  const certificates = Object.keys(progress.unitTests ?? {}).length;
  const words = COURSE.flatMap((u) => u.lessons)
    .filter((l) => progress.completed[l.id])
    .reduce((n, l) => n + l.vocab.length, 0);

  return (
    <section className="pf-section is-plain">
      <h2 className="pf-list-title">
        <span lang="bn">আমার সংগ্রহ</span> <small>Collection</small>
      </h2>
      <div className="pf-list">
        <button className="pf-row" onClick={() => setOpen('words')}>
          <span className="pf-icon" style={{ background: 'var(--ios-blue)' }}>
            <Glyph name="letters" size={17} />
          </span>
          <span className="pf-row-text">
            <span lang="bn">আমার শব্দ</span>
            <small lang="bn">{toBanglaDigits(words)}টা শেখা শব্দ, শুনে ঝালাই করো</small>
          </span>
          <Glyph name="chevron" size={16} className="pf-chevron" />
        </button>
        <button className="pf-row" onClick={() => setOpen('certificates')}>
          <span className="pf-icon" style={{ background: '#ffb800' }}>
            <Glyph name="trophy" size={17} />
          </span>
          <span className="pf-row-text">
            <span lang="bn">সার্টিফিকেট</span>
            <small lang="bn">{certificates ? `${toBanglaDigits(certificates)}টা ইউনিট টেস্টে পাস` : 'ইউনিট টেস্টে পাস করলে পাবে'}</small>
          </span>
          <Glyph name="chevron" size={16} className="pf-chevron" />
        </button>
        <button className="pf-row" onClick={() => setOpen('help')}>
          <span className="pf-icon" style={{ background: 'var(--ios-green, #34c759)' }}>
            <Glyph name="chat" size={17} />
          </span>
          <span className="pf-row-text">
            <span lang="bn">সাহায্য ও অভিযোগ</span>
            <small lang="bn">প্রশ্নের উত্তর, সমস্যা জানাও, উত্তর দেখো</small>
          </span>
          <Glyph name="chevron" size={16} className="pf-chevron" />
        </button>
      </div>
      {open === 'help' && <HelpPage onClose={() => setOpen(null)} />}
      {open === 'words' && <WordsPage onClose={() => setOpen(null)} />}
      {open === 'certificates' && <CertificatesPage onClose={() => setOpen(null)} />}
    </section>
  );
}
