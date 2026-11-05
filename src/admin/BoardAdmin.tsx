import { adminApi } from './adminApi';
import { useAdminData } from './useAdminData';
import { go } from './useHashRoute';

interface Row {
  id: string;
  exam: string[];
  title: string;
  titleBn: string;
  questions: number;
}

/** Every SSC/HSC board practice topic: open one to edit its questions, add, reorder or delete. */
export function BoardAdmin({ onUnauthorized }: { onUnauthorized: () => void }) {
  const { data, error, reload } = useAdminData<Row[]>('/board', onUnauthorized);
  if (error) return <p className="ad-error">{error}</p>;
  if (!data) return <p className="ad-muted">Loading…</p>;
  const act = (fn: () => Promise<unknown>) =>
    fn()
      .then(reload)
      .catch((e: Error) => alert(e.message));

  return (
    <div className="ad-page">
      <header className="ad-head">
        <h1>
          Board prep <span lang="bn">· বোর্ড প্রস্তুতি</span>
        </h1>
        <button className="ad-btn is-primary" onClick={() => go('board-topic', 'new')}>
          + New topic
        </button>
      </header>
      <p className="ad-muted">
        {data.length} topics, {data.reduce((n, t) => n + t.questions, 0)} questions. A practice round asks 10 of a topic; a model test mixes 20.
      </p>
      <section className="ad-card">
        <ul className="ad-list">
          {data.map((t, i) => (
            <li key={t.id} className="ad-item">
              <button className="ad-item-open" onClick={() => go('board-topic', t.id)}>
                <strong>{t.title}</strong> <span lang="bn">{t.titleBn}</span>
                <small>
                  {t.id} · {t.exam.join(' + ').toUpperCase()} · {t.questions} questions
                </small>
              </button>
              <button className="ad-btn is-small" disabled={i === 0} onClick={() => act(() => adminApi('POST', `/board/${t.id}/move`, { dir: -1 }))}>
                ↑
              </button>
              <button className="ad-btn is-small" disabled={i === data.length - 1} onClick={() => act(() => adminApi('POST', `/board/${t.id}/move`, { dir: 1 }))}>
                ↓
              </button>
              <button className="ad-btn is-small is-danger" onClick={() => confirm(`Delete "${t.title}"?`) && act(() => adminApi('DELETE', `/board/${t.id}`))}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
