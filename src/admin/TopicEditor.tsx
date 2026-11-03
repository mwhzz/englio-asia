import { useEffect, useState } from 'react';
import { LEVELS } from '../data/grammar';
import type { GrammarLevel, GrammarTopic } from '../types';
import { adminApi, Unauthorized } from './adminApi';
import { EMPTY_TOPIC, fromFields, slug, toFields, type TopicFields } from './topicForm';
import { openPreview } from '../preview/draft';
import { go } from './useHashRoute';

type TextKey = Exclude<keyof TopicFields, 'level'>;

const FIELDS: { key: TextKey; label: string; rows?: number; hint?: string; bn?: boolean }[] = [
  { key: 'title', label: 'Title (English)' },
  { key: 'titleBn', label: 'Title (Bangla)', bn: true },
  { key: 'summary', label: 'One-line summary (Bangla)', bn: true },
  { key: 'explain', label: 'Explanation (Bangla)', rows: 6, bn: true, hint: 'Leave a blank line between paragraphs. English words are highlighted automatically.' },
  { key: 'formulas', label: 'Patterns', rows: 3, hint: 'One per line: "label: Subject + Verb + Object".' },
  { key: 'table', label: 'Table (optional)', rows: 4, hint: 'One row per line, cells separated by "|". The first row is the header.' },
  { key: 'examples', label: 'Examples', rows: 4, hint: 'One per line: "English sentence | বাংলা মানে".' },
  { key: 'mistakes', label: 'Common mistakes', rows: 3, hint: 'One per line: "wrong | right | why (Bangla)".' },
  { key: 'quiz', label: 'Quiz', rows: 4, hint: 'One per line: "question | right answer | wrong 1; wrong 2 | why (Bangla)".' },
];

/** Write or edit one grammar topic as plain text fields; the server checks it before saving. */
export function TopicEditor({ id, onUnauthorized }: { id: string; onUnauthorized: () => void }) {
  const isNew = id === 'new';
  const [fields, setFields] = useState<TopicFields | null>(isNew ? EMPTY_TOPIC : null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isNew) return;
    adminApi<GrammarTopic>('GET', `/grammar/${id}`)
      .then((t) => setFields(toFields(t)))
      .catch((e: Error) => (e instanceof Unauthorized ? onUnauthorized() : setError(e.message)));
  }, [id, isNew, onUnauthorized]);

  if (!fields) return error ? <p className="ad-error">{error}</p> : <p className="ad-muted">Loading…</p>;

  const set = (key: keyof TopicFields, value: string) => {
    setSaved(false);
    setFields({ ...fields, [key]: value, ...(isNew && key === 'title' ? { id: slug(value) } : {}) });
  };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const topic = fromFields(fields!);
      if (isNew) {
        await adminApi('POST', '/grammar', topic);
        go('topic', topic.id);
      } else {
        await adminApi('PUT', `/grammar/${id}`, topic);
        setSaved(true);
      }
    } catch (err) {
      if (err instanceof Unauthorized) onUnauthorized();
      else setError((err as Error).message);
    }
  }

  return (
    <div className="ad-page">
      <button className="ad-link" onClick={() => go('grammar')}>
        ← All topics
      </button>
      <header className="ad-head">
        <h1>{isNew ? 'New topic' : fields.title}</h1>
        {!isNew && (
          <button className="ad-btn" onClick={() => go('course', id)}>
            Step-by-step course →
          </button>
        )}
      </header>

      <form className="ad-card ad-form" onSubmit={save}>
        <div className="ad-grid">
          <label className="ad-field">
            <span>Id</span>
            <input className="ad-input" value={fields.id} disabled={!isNew} onChange={(e) => set('id', e.target.value)} />
            <small>{isNew ? 'Made from the title; a–z, 0–9 and "-".' : 'Can’t change: learners’ progress refers to it.'}</small>
          </label>
          <label className="ad-field">
            <span>Level</span>
            <select className="ad-input" value={fields.level} onChange={(e) => set('level', e.target.value as GrammarLevel)}>
              {LEVELS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.en} · {l.bn}
                </option>
              ))}
            </select>
          </label>
        </div>

        {FIELDS.map((f) => (
          <label key={f.key} className="ad-field">
            <span>{f.label}</span>
            {f.rows ? (
              <textarea className="ad-input" rows={f.rows} lang={f.bn ? 'bn' : undefined} value={fields[f.key]} onChange={(e) => set(f.key, e.target.value)} />
            ) : (
              <input className="ad-input" lang={f.bn ? 'bn' : undefined} value={fields[f.key]} onChange={(e) => set(f.key, e.target.value)} />
            )}
            {f.hint && <small>{f.hint}</small>}
          </label>
        ))}

        {error && <p className="ad-error">{error}</p>}
        <div className="ad-row">
          <button className="ad-btn is-primary">{isNew ? 'Create topic' : 'Save'}</button>
          <button type="button" className="ad-btn" onClick={() => openPreview({ kind: 'topic', topic: fromFields(fields) })}>
            Preview in app ↗
          </button>
          {saved && <span className="ad-muted">Saved.</span>}
        </div>
      </form>
    </div>
  );
}
