import { useState } from 'react';
import { adminApi } from './adminApi';
import { useAdminData } from './useAdminData';

interface AppError {
  id: string;
  message: string;
  stack: string;
  place: string;
  agent: string;
  version: string | null;
  device: string | null;
  firstAt: string;
  lastAt: string;
  n: number;
}

/** Crashes phones reported (see server/errors.ts): the same error from many phones is one row with a count. */
export function ErrorsPage({ onUnauthorized }: { onUnauthorized: () => void }) {
  const { data, error, reload } = useAdminData<AppError[]>('/errors', onUnauthorized);
  const [open, setOpen] = useState<string | null>(null);
  if (error) return <p className="ad-error">{error}</p>;
  if (!data) return <p className="ad-muted">Loading…</p>;

  return (
    <div className="ad-page">
      <header className="ad-head">
        <h1>
          Errors <span lang="bn">· অ্যাপের ভুল</span>
        </h1>
      </header>
      <p className="ad-muted">When the app breaks on a phone, the learner sees “something went wrong” and the error comes here. Fix it, then mark it done.</p>
      <section className="ad-card">
        <ul className="ad-list">
          {data.map((e) => (
            <li key={e.id} className="ad-item ad-err">
              <button className="ad-item-open" onClick={() => setOpen(open === e.id ? null : e.id)}>
                <strong>{e.message}</strong>
                <small>
                  {e.n}× · v{e.version ?? '?'} · {e.device ?? '?'} · {e.place} · last {new Date(e.lastAt).toLocaleString()}
                </small>
                {open === e.id && (
                  <pre className="ad-help">
                    {e.stack || '(no stack)'}
                    {'\n\n'}
                    {e.agent}
                  </pre>
                )}
              </button>
              <button
                className="ad-btn is-small"
                onClick={() =>
                  adminApi('DELETE', `/errors/${e.id}`)
                    .then(reload)
                    .catch((err: Error) => alert(err.message))
                }
              >
                Done
              </button>
            </li>
          ))}
          {!data.length && <li className="ad-empty">No errors. Nice.</li>}
        </ul>
      </section>
    </div>
  );
}
