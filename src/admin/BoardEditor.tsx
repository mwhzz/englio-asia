import { useEffect, useState } from 'react';
import type { BoardTopic, Exam } from '../data/board/types';
import { adminApi, Unauthorized } from './adminApi';
import { boardToFields, EMPTY_BOARD, fieldsToBoard, type BoardFields } from './boardForm';
import { slug } from './topicForm';
import { go } from './useHashRoute';

/** Write or edit one board practice topic; the server checks it before saving. */
export function BoardEditor({ id, onUnauthorized }: { id: string; onUnauthorized: () => void }) {
  const isNew = id === 'new';
  const [fields, setFields] = useState<BoardFields | null>(isNew ? EMPTY_BOARD : null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isNew) return;
    adminApi<BoardTopic>('GET', `/board/${id}`)
      .then((t) => setFields(boardToFields(t)))
      .catch((e: Error) => (e instanceof Unauthorized ? onUnauthorized() : setError(e.message)));
  }, [id, isNew, onUnauthorized]);

  if (!fields) return error ? <p className="ad-error">{error}</p> : <p className="ad-muted">Loading…</p>;

  const set = (patch: Partial<BoardFields>) => {
    setSaved(false);
    setFields({ ...fields, ...patch, ...(isNew && patch.title !== undefined ? { id: slug(patch.title) } : {}) });
  };
  const toggle = (exam: Exam) => set({ exam: fields.exam.includes(exam) ? fields.exam.filter((e) => e !== exam) : [...fields.exam, exam] });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const topic = fieldsToBoard(fields!);
      if (isNew) {
        await adminApi('POST', '/board', topic);
        go('board-topic', topic.id);
      } else {
        await adminApi('PUT', `/board/${id}`, topic);
        setSaved(true);
      }
    } catch (err) {
      if (err instanceof Unauthorized) onUnauthorized();
      else setError((err as Error).message);
    }
  }

  return (
    <div className="ad-page">
      <button className="ad-link" onClick={() => go('board')}>
        ← All board topics
      </button>
      <header className="ad-head">
        <h1>{isNew ? 'New board topic' : fields.title}</h1>
      </header>
      <form className="ad-card ad-form" onSubmit={save}>
        <div className="ad-grid">
          <label className="ad-field">
            <span>Title (English)</span>
            <input className="ad-input" value={fields.title} onChange={(e) => set({ title: e.target.value })} />
          </label>
          <label className="ad-field">
            <span>Title (Bangla)</span>
            <input className="ad-input" lang="bn" value={fields.titleBn} onChange={(e) => set({ titleBn: e.target.value })} />
          </label>
          <label className="ad-field">
            <span>Id</span>
            <input className="ad-input" value={fields.id} disabled={!isNew} onChange={(e) => set({ id: e.target.value })} />
          </label>
          <div className="ad-field">
            <span>Exams</span>
            <span className="ad-row">
              {(['ssc', 'hsc'] as Exam[]).map((exam) => (
                <label key={exam} className="ad-check">
                  <input type="checkbox" checked={fields.exam.includes(exam)} onChange={() => toggle(exam)} /> {exam.toUpperCase()}
                </label>
              ))}
            </span>
          </div>
        </div>
        <label className="ad-field">
          <span>Rule to remember (Bangla, one line)</span>
          <input className="ad-input" lang="bn" value={fields.tip} onChange={(e) => set({ tip: e.target.value })} />
        </label>
        <label className="ad-field">
          <span>Questions</span>
          <textarea className="ad-input ad-code" rows={18} lang="bn" value={fields.questions} onChange={(e) => set({ questions: e.target.value })} />
          <small>
            One per line: "Bangla instruction: English sentence | right answer | wrong 1; wrong 2 | why (Bangla)". The English after the colon is shown on
            the card. Use ___ for a blank.
          </small>
        </label>
        {error && <p className="ad-error">{error}</p>}
        <div className="ad-row">
          <button className="ad-btn is-primary">{isNew ? 'Create topic' : 'Save'}</button>
          {saved && <span className="ad-muted">Saved.</span>}
        </div>
      </form>
    </div>
  );
}
