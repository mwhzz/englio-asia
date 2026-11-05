import { useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Glyph } from '../../components/Glyph';
import { SpeakButton } from '../../components/SpeakButton';
import { COURSE } from '../../data/course';
import { toBanglaDigits } from '../../lib/bangla';
import { useProgress } from '../../state/ProgressContext';
import { useBackButton } from '../../lib/backButton';

type Show = 'learned' | 'all';

/** Every word in the course by unit: the learned ones (from finished lessons) or all, searchable in English or Bangla. */
export function WordsPage({ onClose }: { onClose: () => void }) {
  useBackButton(onClose);
  const { progress } = useProgress();
  const [query, setQuery] = useState('');
  const [show, setShow] = useState<Show>('learned');
  const q = query.trim().toLowerCase();

  const units = COURSE.map((unit) => {
    const words = unit.lessons
      .filter((l) => show === 'all' || progress.completed[l.id])
      .flatMap((l) => l.vocab.map((v) => ({ ...v, learned: !!progress.completed[l.id] })))
      .filter((v, i, all) => all.findIndex((x) => x.en === v.en) === i)
      .filter((v) => !q || v.en.toLowerCase().includes(q) || v.bn.includes(q));
    return { unit, words };
  }).filter((u) => u.words.length);
  const learned = COURSE.flatMap((u) => u.lessons).filter((l) => progress.completed[l.id]).reduce((n, l) => n + l.vocab.length, 0);

  return createPortal(
    <div className="gt wd" role="dialog" aria-label="My words">
      <header className="lp-bar">
        <button className="lp-back" onClick={onClose} aria-label="Back">
          <Glyph name="back" size={20} />
        </button>
        <span className="lp-bar-title" lang="bn">
          আমার শব্দ
        </span>
        <span className="cl-num" lang="bn">
          {toBanglaDigits(learned)}
        </span>
      </header>

      <div className="gt-body">
        <label className="gr-search">
          <Glyph name="search" size={18} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search English or বাংলা" aria-label="Search words" />
        </label>
        <div className="gr-filters" role="radiogroup" aria-label="Which words">
          {(
            [
              ['learned', 'শেখা'],
              ['all', 'সব শব্দ'],
            ] as const
          ).map(([id, bn]) => (
            <button key={id} role="radio" aria-checked={show === id} className={show === id ? 'is-on' : undefined} onClick={() => setShow(id)}>
              <span lang="bn">{bn}</span>
            </button>
          ))}
        </div>

        {units.map(({ unit, words }) => (
          <section key={unit.id} className="pf-section is-plain" style={{ '--u': unit.color } as CSSProperties}>
            <h2 className="pf-list-title gr-level">
              <span className="gr-dot" />
              {unit.title} <small lang="bn">{unit.titleBn}</small>
            </h2>
            <ul className="pf-list wd-list">
              {words.map((w) => (
                <li key={w.en} className={`wd-row${w.learned ? '' : ' is-new'}`}>
                  <SpeakButton text={w.en} />
                  <span className="pf-row-text">
                    <span>{w.en}</span>
                    <small lang="bn">{w.bn}</small>
                  </span>
                  {progress.review?.[`w:${w.en}`] && (
                    <span className="wd-tag" lang="bn">
                      ঝালাই
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}

        {!units.length && (
          <p className="gr-empty" lang="bn">
            {q ? 'কোনো শব্দ পাওয়া যায়নি।' : 'লেসন শেষ করলে শেখা শব্দগুলো এখানে জমা হবে।'}
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
}
