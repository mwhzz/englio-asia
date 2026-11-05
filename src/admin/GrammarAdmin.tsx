import { LEVELS } from '../data/grammar';
import type { GrammarLevel } from '../types';
import { adminApi } from './adminApi';
import { useAdminData } from './useAdminData';
import { go } from './useHashRoute';
import { LanguagePicker } from './LanguagePicker';
import { useAdminLang } from './useAdminLang';

interface TopicRow {
  id: string;
  level: GrammarLevel;
  title: string;
  titleBn: string;
  quiz: number;
  examples: number;
  courseLessons: number;
}

/** Every grammar topic by level: open one to edit it, add a new one, reorder or delete. */
export function GrammarAdmin({ onUnauthorized }: { onUnauthorized: () => void }) {
  const lang = useAdminLang();
  const { data: topics, error, reload } = useAdminData<TopicRow[]>(`/grammar?lang=${lang}`, onUnauthorized);
  if (error) return <p className="ad-error">{error}</p>;
  if (!topics) return <p className="ad-muted">Loading…</p>;

  const act = (fn: () => Promise<unknown>) =>
    fn()
      .then(reload)
      .catch((e: Error) => alert(e.message));

  return (
    <div className="ad-page">
      <header className="ad-head">
        <h1>
          Grammar <span lang="bn">· ব্যাকরণ</span>
        </h1>
        <button className="ad-btn is-primary" onClick={() => go('topic', 'new')}>
          + New topic
        </button>
      </header>
      <LanguagePicker />
      <p className="ad-muted">{topics.length} topics. Changes reach the app the next time it opens.</p>

      {LEVELS.map((level) => {
        const list = topics.filter((t) => t.level === level.id);
        return (
          <section key={level.id} className="ad-card">
            <div className="ad-section-head">
              <h2>
                {level.en} <span lang="bn">{level.bn}</span> <em>{list.length}</em>
              </h2>
            </div>
            <ul className="ad-list">
              {list.map((t) => {
                const i = topics.indexOf(t);
                return (
                  <li key={t.id} className="ad-item">
                    <button className="ad-item-open" onClick={() => go('topic', t.id)}>
                      <strong>{t.title}</strong> <span lang="bn">{t.titleBn}</span>
                      <small>
                        {t.id} · {t.examples} examples · {t.quiz} quiz{t.courseLessons ? ` · course of ${t.courseLessons} lessons` : ''}
                      </small>
                    </button>
                    <button className="ad-btn is-small" onClick={() => go('course', t.id)}>
                      {t.courseLessons ? 'Course' : '+ Course'}
                    </button>
                    <button className="ad-btn is-small" disabled={i === 0} onClick={() => act(() => adminApi('POST', `/grammar/${t.id}/move`, { dir: -1 }))}>
                      ↑
                    </button>
                    <button
                      className="ad-btn is-small"
                      disabled={i === topics.length - 1}
                      onClick={() => act(() => adminApi('POST', `/grammar/${t.id}/move`, { dir: 1 }))}
                    >
                      ↓
                    </button>
                    <button
                      className="ad-btn is-small is-danger"
                      onClick={() => confirm(`Delete "${t.title}"?`) && act(() => adminApi('DELETE', `/grammar/${t.id}`))}
                    >
                      Delete
                    </button>
                  </li>
                );
              })}
              {!list.length && <li className="ad-empty">None yet.</li>}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
