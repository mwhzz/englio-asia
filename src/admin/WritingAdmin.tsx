import { WRITING_KINDS } from '../data/writing/kinds';
import { toBanglaDigits } from '../lib/bangla';
import { adminApi } from './adminApi';
import { LanguagePicker } from './LanguagePicker';
import { useAdminData } from './useAdminData';
import { useAdminLang } from './useAdminLang';
import { go } from './useHashRoute';

interface TaskRow {
  id: string;
  kind: string;
  levels: string[];
  title: string;
  titleBn: string;
  minWords: number;
}

/** Writing practice tasks (paragraphs, letters, applications…) of the chosen language: open, add, reorder or delete. */
export function WritingAdmin({ onUnauthorized }: { onUnauthorized: () => void }) {
  const lang = useAdminLang();
  const { data: tasks, error, reload } = useAdminData<TaskRow[]>(`/writing?lang=${lang}`, onUnauthorized);
  if (error) return <p className="ad-error">{error}</p>;
  if (!tasks) return <p className="ad-muted">লোড হচ্ছে…</p>;
  const act = (fn: () => Promise<unknown>) =>
    fn()
      .then(reload)
      .catch((e: Error) => alert(e.message));

  return (
    <div className="ad-page" lang="bn">
      <header className="ad-head">
        <h1>লেখা</h1>
        <button className="ad-btn is-primary" onClick={() => go('writing-task', 'new')}>
          + নতুন লেখা
        </button>
      </header>
      <LanguagePicker />
      <p className="ad-muted">{toBanglaDigits(tasks.length)}টা লেখার কাজ। শিক্ষার্থীরা ব্যাকরণ ট্যাবে লেখে, তারপর মডেল উত্তরের সাথে মেলায়।</p>
      <section className="ad-card">
        <ul className="ad-list">
          {tasks.map((t, i) => (
            <li key={t.id} className="ad-item">
              <button className="ad-item-open" onClick={() => go('writing-task', t.id)}>
                <strong>{t.title}</strong> <span>{t.titleBn}</span>
                <small>
                  {WRITING_KINDS.find((k) => k.id === t.kind)?.bn ?? t.kind} · {t.minWords}+ শব্দ · {t.levels.length ? t.levels.join(', ') : 'সবার জন্য'}
                </small>
              </button>
              <button className="ad-btn is-small" disabled={i === 0} onClick={() => act(() => adminApi('POST', `/writing/${t.id}/move`, { dir: -1 }))}>
                ↑
              </button>
              <button className="ad-btn is-small" disabled={i === tasks.length - 1} onClick={() => act(() => adminApi('POST', `/writing/${t.id}/move`, { dir: 1 }))}>
                ↓
              </button>
              <button className="ad-btn is-small is-danger" onClick={() => confirm(`"${t.title}" মুছবে?`) && act(() => adminApi('DELETE', `/writing/${t.id}`))}>
                মুছো
              </button>
            </li>
          ))}
          {!tasks.length && <li className="ad-empty">এই ভাষায় এখনো কোনো লেখার কাজ নেই।</li>}
        </ul>
      </section>
    </div>
  );
}
