import { adminApi } from './adminApi';
import { useAdminData } from './useAdminData';

interface Report {
  place: string;
  question: string;
  n: number;
  lastAt: string;
  items: { id: number; reason: string; answer: string; note: string }[];
}

const REASONS: Record<string, string> = {
  'wrong-answer': 'My answer was right too',
  mistake: 'Mistake in the question or answer',
  audio: 'Audio / pronunciation',
  unclear: 'Hard to understand',
  other: 'Something else',
};

/** What learners flagged with "সমস্যা জানাও", most-reported first. Fix the content, then mark it done. */
export function ReportsPage({ onUnauthorized }: { onUnauthorized: () => void }) {
  const { data, error, reload } = useAdminData<Report[]>('/reports', onUnauthorized);
  if (error) return <p className="ad-error">{error}</p>;
  if (!data) return <p className="ad-muted">Loading…</p>;

  return (
    <div className="ad-page">
      <header className="ad-head">
        <h1>
          Reports <span lang="bn">· শিক্ষার্থীদের জানানো সমস্যা</span>
        </h1>
      </header>
      <p className="ad-muted">Learners tap “সমস্যা জানাও” after an answer. The same question from many learners is one row.</p>
      <section className="ad-card">
        <ul className="ad-list">
          {data.map((r) => (
            <li key={r.place + r.question} className="ad-item ad-report">
              <span className="ad-item-open">
                <strong lang="bn">{r.question}</strong>
                <small>
                  {r.n} report{r.n > 1 ? 's' : ''} · {r.place} · last {new Date(r.lastAt).toLocaleDateString()}
                </small>
                <ul className="ad-report-items">
                  {r.items.slice(0, 5).map((i) => (
                    <li key={i.id} lang="bn">
                      {REASONS[i.reason] ?? i.reason}
                      {i.answer && <> · answered “{i.answer}”</>}
                      {i.note && <> · “{i.note}”</>}
                    </li>
                  ))}
                </ul>
              </span>
              <button
                className="ad-btn is-small"
                onClick={() =>
                  adminApi('POST', '/reports/close', { where: r.place, question: r.question })
                    .then(reload)
                    .catch((e: Error) => alert(e.message))
                }
              >
                Done
              </button>
            </li>
          ))}
          {!data.length && <li className="ad-empty">No open reports.</li>}
        </ul>
      </section>
    </div>
  );
}
