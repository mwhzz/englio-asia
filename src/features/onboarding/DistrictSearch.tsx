import { useEffect, useState } from 'react';
import { DIVISIONS, searchDistricts, type DivisionId } from '../../data/districts';
import { haptic } from '../../lib/haptics';
import { Glyph } from '../../components/Glyph';

interface Props {
  selectedId: string | null;
  onPick: (id: string) => void;
  onClose: () => void;
}

/** Bottom sheet with a search field and every district grouped by division. */
export function DistrictSearch({ selectedId, onPick, onClose }: Props) {
  const [query, setQuery] = useState('');
  const results = searchDistricts(query);
  const divisions = (Object.keys(DIVISIONS) as DivisionId[]).filter((div) => results.some((d) => d.division === div));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="ob-sheet-backdrop" onClick={onClose}>
      <div className="ob-sheet" role="dialog" aria-modal="true" aria-label="Search district" onClick={(e) => e.stopPropagation()}>
        <div className="ob-grabber" />
        <div className="ob-search-row">
          <label className="ob-search-field">
            <Glyph name="search" size={17} />
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="জেলা খুঁজো · Search district"
              enterKeyHint="search"
              onKeyDown={(e) => e.key === 'Enter' && results.length === 1 && onPick(results[0].id)}
            />
            {query && (
              <button type="button" className="ob-clear" onClick={() => setQuery('')} aria-label="Clear search">
                ✕
              </button>
            )}
          </label>
          <button type="button" className="ob-text-btn" onClick={onClose} lang="bn">
            বাতিল
          </button>
        </div>

        <div className="ob-sheet-list">
          {divisions.length === 0 && (
            <p className="ob-empty" lang="bn">
              কোনো জেলা পাওয়া যায়নি
            </p>
          )}
          {divisions.map((div) => (
            <section key={div}>
              <h3 className="ob-list-header">
                <span lang="bn">{DIVISIONS[div].bn} বিভাগ</span> · {DIVISIONS[div].en}
              </h3>
              <ul className="ob-list">
                {results
                  .filter((d) => d.division === div)
                  .map((d) => (
                    <li key={d.id}>
                      <button
                        type="button"
                        onClick={() => {
                          haptic();
                          onPick(d.id);
                        }}
                      >
                        <span lang="bn">{d.bn}</span>
                        <span className="ob-list-en">{d.en}</span>
                        {d.id === selectedId && <span className="ob-check">✓</span>}
                      </button>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
