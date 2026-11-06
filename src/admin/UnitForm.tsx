import { useState } from 'react';
import { forLang, useMeaningLang } from './useAdminLang';

export interface Tip {
  title: string;
  body: string;
  examples: string[];
}

export interface UnitDraft {
  title: string;
  titleBn: string;
  color: string;
  tips: Tip[];
}

interface Props {
  initial: UnitDraft;
  onSave: (unit: UnitDraft) => Promise<void>;
  onCancel: () => void;
}

/** A unit's name, color and guidebook tips. */
export function UnitForm({ initial, onSave, onCancel }: Props) {
  const meaning = useMeaningLang();
  const [unit, setUnit] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const setTip = (i: number, tip: Partial<Tip>) => setUnit({ ...unit, tips: unit.tips.map((t, j) => (j === i ? { ...t, ...tip } : t)) });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await onSave(unit);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <form className="ad-form" onSubmit={submit}>
      <div className="ad-grid">
        <label className="ad-field">
          <span>Title (English)</span>
          <input className="ad-input" value={unit.title} onChange={(e) => setUnit({ ...unit, title: e.target.value })} />
        </label>
        <label className="ad-field">
          <span>{forLang('Title (Bangla)', meaning.name)}</span>
          <input className="ad-input" lang="bn" value={unit.titleBn} onChange={(e) => setUnit({ ...unit, titleBn: e.target.value })} />
        </label>
        <label className="ad-field">
          <span>Color</span>
          <input className="ad-color" type="color" value={unit.color} onChange={(e) => setUnit({ ...unit, color: e.target.value })} />
        </label>
      </div>

      <h3>Guidebook tips</h3>
      {unit.tips.map((tip, i) => (
        <fieldset key={i} className="ad-tip">
          <input className="ad-input" placeholder="Tip title" value={tip.title} onChange={(e) => setTip(i, { title: e.target.value })} />
          <textarea
            className="ad-input"
            lang="bn"
            rows={3}
            placeholder={forLang('Explanation (Bangla)', meaning.name)}
            value={tip.body}
            onChange={(e) => setTip(i, { body: e.target.value })}
          />
          <textarea
            className="ad-input"
            rows={2}
            placeholder="Examples, one per line"
            value={tip.examples.join('\n')}
            onChange={(e) => setTip(i, { examples: e.target.value.split('\n') })}
          />
          <button type="button" className="ad-btn is-small is-danger" onClick={() => setUnit({ ...unit, tips: unit.tips.filter((_, j) => j !== i) })}>
            Remove tip
          </button>
        </fieldset>
      ))}
      <button type="button" className="ad-btn is-small" onClick={() => setUnit({ ...unit, tips: [...unit.tips, { title: '', body: '', examples: [] }] })}>
        + Add tip
      </button>

      {error && <p className="ad-error">{error}</p>}
      <div className="ad-row">
        <button type="button" className="ad-btn" onClick={onCancel}>
          Cancel
        </button>
        <button className="ad-btn is-primary">Save</button>
      </div>
    </form>
  );
}
