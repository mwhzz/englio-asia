import { adminApi } from './adminApi';
import { useAdminData } from './useAdminData';
import { go } from './useHashRoute';

interface StoryRow {
  id: string;
  title: string;
  titleBn: string;
  color: string;
  lines: number;
  quiz: number;
}

/** Every short story: open one to edit it, add a new one, reorder or delete. */
export function StoriesAdmin({ onUnauthorized }: { onUnauthorized: () => void }) {
  const { data: stories, error, reload } = useAdminData<StoryRow[]>('/stories', onUnauthorized);
  if (error) return <p className="ad-error">{error}</p>;
  if (!stories) return <p className="ad-muted">Loading…</p>;

  const act = (fn: () => Promise<unknown>) =>
    fn()
      .then(reload)
      .catch((e: Error) => alert(e.message));

  return (
    <div className="ad-page">
      <header className="ad-head">
        <h1>
          Stories <span lang="bn">· গল্প</span>
        </h1>
        <button className="ad-btn is-primary" onClick={() => go('story', 'new')}>
          + New story
        </button>
      </header>
      <p className="ad-muted">{stories.length} stories. Learners see them on the home page after their first lesson.</p>

      <section className="ad-card">
        <ul className="ad-list">
          {stories.map((s, i) => (
            <li key={s.id} className="ad-item">
              <span className="ad-dot" style={{ background: s.color }} />
              <button className="ad-item-open" onClick={() => go('story', s.id)}>
                <strong>{s.title}</strong> <span lang="bn">{s.titleBn}</span>
                <small>
                  {s.id} · {s.lines} lines · {s.quiz} questions
                </small>
              </button>
              <button className="ad-btn is-small" disabled={i === 0} onClick={() => act(() => adminApi('POST', `/stories/${s.id}/move`, { dir: -1 }))}>
                ↑
              </button>
              <button className="ad-btn is-small" disabled={i === stories.length - 1} onClick={() => act(() => adminApi('POST', `/stories/${s.id}/move`, { dir: 1 }))}>
                ↓
              </button>
              <button className="ad-btn is-small is-danger" onClick={() => confirm(`Delete "${s.title}"?`) && act(() => adminApi('DELETE', `/stories/${s.id}`))}>
                Delete
              </button>
            </li>
          ))}
          {!stories.length && <li className="ad-empty">None yet.</li>}
        </ul>
      </section>
    </div>
  );
}
