import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Glyph } from '../../components/Glyph';
import { MixedText } from '../../components/MixedText';
import { SpeakButton } from '../../components/SpeakButton';
import { toBanglaDigits } from '../../lib/bangla';
import type { Unit } from '../../types';
import { useBackButton } from '../../lib/backButton';

/** A unit's grammar tips, full screen like a grammar topic: Bangla explanations with spoken English examples. */
export function Guidebook({ unit, onClose }: { unit: Unit; onClose: () => void }) {
  useBackButton(onClose);
  return createPortal(
    <div className="gt" role="dialog" aria-label={`${unit.title} guidebook`} style={{ '--u': unit.color } as CSSProperties}>
      <header className="lp-bar">
        <button className="lp-back" onClick={onClose} aria-label="Close guidebook">
          <Glyph name="back" size={20} />
        </button>
        <span className="gt-level" lang="bn">
          গাইডবুক
        </span>
        <span className="lp-done" aria-hidden="true">
          <Glyph name="book" size={16} />
        </span>
      </header>

      <div className="gt-body">
        <div className="gt-hero">
          <h1>{unit.title}</h1>
          <p className="gt-bn" lang="bn">
            {unit.titleBn}
          </p>
          <p className="gt-summary" lang="bn">
            এই ইউনিটের লেসনগুলোর আগে {toBanglaDigits(unit.tips.length)}টা জিনিস জেনে নাও।
          </p>
        </div>

        {unit.tips.map((tip, i) => (
          <section key={tip.title} className="gt-card">
            <h2>
              <span className="gb-num" lang="bn">
                {toBanglaDigits(i + 1)}
              </span>
              {tip.title}
            </h2>
            <p className="gt-para" lang="bn">
              <MixedText text={tip.body} />
            </p>
            {tip.examples.length > 0 && (
              <ul className="gt-examples gb-examples">
                {tip.examples.map((example) => (
                  <li key={example}>
                    <SpeakButton text={example} />
                    <span>
                      <strong>{example}</strong>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <button className="cta gb-done" onClick={onClose}>
          <span lang="bn">বুঝেছি</span>
        </button>
      </div>
    </div>,
    document.body,
  );
}
