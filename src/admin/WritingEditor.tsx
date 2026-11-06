import { useEffect, useState } from 'react';
import { WRITING_KINDS } from '../data/writing/kinds';
import type { WritingTask } from '../data/writing/types';
import { LEVELS } from '../lib/levelCourse';
import type { Level } from '../types';
import { adminApi, Unauthorized } from './adminApi';
import { forLang, useAdminLang, useMeaningLang } from './useAdminLang';
import { go } from './useHashRoute';

const EMPTY: WritingTask = { id: '', kind: 'paragraph', levels: [], title: '', titleBn: '', prompt: '', hints: [], phrases: [], model: '', minWords: 100 };

/** Write or edit one writing task; the server checks it (server/adminWriting.ts) before saving. */
export function WritingEditor({ id, onUnauthorized }: { id: string; onUnauthorized: () => void }) {
  const isNew = id === 'new';
  const lang = useAdminLang();
  const meaning = useMeaningLang();
  const [task, setTask] = useState<WritingTask | null>(isNew ? EMPTY : null);
  const [hints, setHints] = useState('');
  const [phrases, setPhrases] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNew) return;
    adminApi<WritingTask>('GET', `/writing/${id}`)
      .then((t) => (setTask(t), setHints(t.hints.join('\n')), setPhrases(t.phrases.join('\n'))))
      .catch((e: Error) => (e instanceof Unauthorized ? onUnauthorized() : setError(e.message)));
  }, [id, isNew, onUnauthorized]);
  if (!task) return error ? <p className="ad-error">{error}</p> : <p className="ad-muted">লোড হচ্ছে…</p>;

  const set = <K extends keyof WritingTask>(key: K, value: WritingTask[K]) => setTask({ ...task, [key]: value });
  const toggleLevel = (l: Level) => set('levels', task.levels.includes(l) ? task.levels.filter((x) => x !== l) : [...task.levels, l]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const body = { ...task, lang, hints: hints.split('\n'), phrases: phrases.split('\n') };
    try {
      if (isNew) {
        const made = await adminApi<{ id: string }>('POST', '/writing', body);
        go('writing-task', made.id);
      } else {
        await adminApi('PUT', `/writing/${id}`, body);
        go('writing');
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="ad-page">
      <button className="ad-link" onClick={() => go('writing')} lang="bn">
        ← সব লেখা
      </button>
      <form className="ad-card ad-form" onSubmit={save}>
        <div className="ad-grid">
          <label className="ad-field">
            <span>Id</span>
            <input className="ad-input" value={task.id} disabled={!isNew} onChange={(e) => set('id', e.target.value)} placeholder="e.g. my-school" />
          </label>
          <label className="ad-field">
            <span>Kind</span>
            <select className="ad-input" value={task.kind} onChange={(e) => set('kind', e.target.value as WritingTask['kind'])}>
              {WRITING_KINDS.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.en} · {k.bn}
                </option>
              ))}
            </select>
          </label>
          <label className="ad-field">
            <span>Title (English)</span>
            <input className="ad-input" value={task.title} onChange={(e) => set('title', e.target.value)} />
          </label>
          <label className="ad-field">
            <span>{forLang('Title (Bangla)', meaning.name)}</span>
            <input className="ad-input" lang={meaning.code} dir={meaning.dir} value={task.titleBn} onChange={(e) => set('titleBn', e.target.value)} />
          </label>
          <label className="ad-field">
            <span>About how many words</span>
            <input className="ad-input" type="number" min={10} max={1000} value={task.minWords} onChange={(e) => set('minWords', Number(e.target.value))} />
          </label>
        </div>
        <div className="ad-field">
          <span>For (none = everyone)</span>
          <div className="ad-row ad-quick">
            {LEVELS.map((l) => (
              <label key={l} className="ad-check">
                <input type="checkbox" checked={task.levels.includes(l)} onChange={() => toggleLevel(l)} /> {l}
              </label>
            ))}
          </div>
        </div>
        <label className="ad-field">
          <span>The task (English, as an exam sets it)</span>
          <textarea className="ad-input" rows={3} value={task.prompt} onChange={(e) => set('prompt', e.target.value)} />
        </label>
        <label className="ad-field">
          <span>Points to cover (one per line)</span>
          <textarea className="ad-input" rows={4} value={hints} onChange={(e) => setHints(e.target.value)} />
        </label>
        <label className="ad-field">
          <span>Useful words and phrases (one per line)</span>
          <textarea className="ad-input" rows={4} value={phrases} onChange={(e) => setPhrases(e.target.value)} />
        </label>
        <label className="ad-field">
          <span>Model answer (a blank line starts a new paragraph)</span>
          <textarea className="ad-input" rows={10} value={task.model} onChange={(e) => set('model', e.target.value)} />
        </label>
        {error && <p className="ad-error">{error}</p>}
        <div className="ad-row">
          <button className="ad-btn is-primary">{isNew ? 'Create task' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}
