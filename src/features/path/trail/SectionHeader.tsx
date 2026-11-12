import type { Section } from '../../../data/sections';
import { toBanglaDigits } from '../../../lib/bangla';

/** The start of a section on the path: its number and level, its name, what it teaches, how far along. */
export function SectionHeader({ section, number, done, total }: { section: Section; number: number; done: number; total: number }) {
  return (
    <header className="sec-head">
      <p className="sec-kicker" lang="bn">
        সেকশন {toBanglaDigits(number)} · {section.level}
      </p>
      <h2 lang="bn">{section.title}</h2>
      {section.goal && (
        <p className="sec-goal" lang="bn">
          {section.goal}
        </p>
      )}
      <div className="sec-bar" aria-label={`${done}/${total}`}>
        <span style={{ width: `${total ? (100 * done) / total : 0}%` }} />
      </div>
      <p className="sec-count" lang="bn">
        {toBanglaDigits(done)}/{toBanglaDigits(total)} লেসন
      </p>
    </header>
  );
}
