import { useAdminData } from './useAdminData';

interface Entry {
  at: string;
  admin: string;
  method: string;
  path: string;
  status: number;
}

const ACTIONS: Record<string, string> = { POST: 'added', PUT: 'changed', DELETE: 'deleted' };

/** "/api/admin/lessons/u1-l2/items" → "lessons / u1-l2 / items". */
const what = (path: string) => path.replace(/^\/api\/admin\//, '').split('/').join(' / ');

/** Every change made in the admin panel, newest first: who, what, when, and whether it worked. */
export function ActivityPage({ onUnauthorized }: { onUnauthorized: () => void }) {
  const { data, error } = useAdminData<Entry[]>('/activity?limit=200', onUnauthorized);
  if (error) return <p className="ad-error">{error}</p>;
  if (!data) return <p className="ad-muted">Loading…</p>;

  return (
    <div className="ad-page">
      <header className="ad-head">
        <h1>
          Activity <span lang="bn">· কে কী বদলাল</span>
        </h1>
      </header>
      <section className="ad-card">
        <table className="ad-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Who</th>
              <th>What</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.map((e, i) => (
              <tr key={i}>
                <td>{new Date(e.at).toLocaleString()}</td>
                <td>{e.admin}</td>
                <td>
                  {ACTIONS[e.method] ?? e.method} <span className="ad-muted">{what(e.path)}</span>
                </td>
                <td>{e.status === 200 ? '' : <span className="ad-error">failed ({e.status})</span>}</td>
              </tr>
            ))}
            {!data.length && (
              <tr>
                <td colSpan={4} className="ad-empty">
                  No changes yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
