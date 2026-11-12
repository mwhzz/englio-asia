import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Glyph } from '../../components/Glyph';
import { COURSE } from '../../data/course';
import { toBanglaDigits } from '../../lib/bangla';
import { useProgress } from '../../state/ProgressContext';
import { CertificateView } from './CertificateView';
import { useBackButton } from '../../lib/backButton';
import { sectionsOf } from '../../data/sections';
import { learnerLang } from '../../lib/learnerLang';
import { sectionTestId, testUnit } from '../../lib/sectionTest';

/** Every certificate earned so far, newest unit last, each ready to save or share. */
export function CertificatesPage({ onClose }: { onClose: () => void }) {
  useBackButton(onClose);
  const { progress } = useProgress();
  const units = COURSE.map((unit, i) => ({ unit, i, test: progress.unitTests?.[unit.id], label: `ইউনিট ${toBanglaDigits(i + 1)} · ${unit.titleBn}` }));
  // A section's checkpoint passed is a bigger certificate (lib/sectionTest.ts), listed first.
  const sections = sectionsOf(learnerLang(), COURSE.length).map((s, i) => {
    const found = testUnit(sectionTestId(s));
    return found && { unit: found.unit, i, test: progress.unitTests?.[sectionTestId(s)], label: `সেকশন ${toBanglaDigits(i + 1)} · ${s.title}` };
  });
  const earned = [...sections, ...units].filter((x): x is NonNullable<typeof x> => !!x?.test);

  return createPortal(
    <div className="gt" role="dialog" aria-label="Certificates">
      <header className="lp-bar">
        <button className="lp-back" onClick={onClose} aria-label="Back">
          <Glyph name="back" size={20} />
        </button>
        <span className="lp-bar-title" lang="bn">
          সার্টিফিকেট
        </span>
        <span className="cl-num" lang="bn">
          {toBanglaDigits(earned.length)}
        </span>
      </header>
      <div className="gt-body">
        {earned.map(({ unit, i, test, label }) => (
          <section key={unit.id} className="gt-card" style={{ '--u': unit.color } as CSSProperties}>
            <h2 lang="bn">{label}</h2>
            <CertificateView unit={unit} unitNumber={i + 1} score={test!.score} date={test!.date} />
          </section>
        ))}
        {!earned.length && (
          <p className="gr-empty" lang="bn">
            কোনো ইউনিটের সব লেসন শেষ করে ইউনিট টেস্টে পাস করলে সার্টিফিকেট পাবে।
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
}
