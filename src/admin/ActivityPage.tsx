import { useState } from 'react';
import { useAdminData } from './useAdminData';
import { useDebounced } from './useDebounced';

interface Entry {
  at: string;
  admin: string;
  method: string;
  path: string;
  status: number;
  detail: string;
}

const ACTIONS: Record<string, string> = { POST: 'যোগ/কাজ', PUT: 'বদল', DELETE: 'মুছেছে' };

/** "/api/admin/lessons/u1-l2/items" → "lessons / u1-l2 / items". */
const what = (path: string) => path.replace(/^\/api\/admin\//, '').split('/').join(' / ');

/** Every change made in the admin panel, newest first: who, what, what was sent, when, and whether it worked. Filter by person or by page. */
export function ActivityPage({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [who, setWho] = useState('');
  const [q, setQ] = useState('');
  const query = useDebounced(q.trim());
  const { data, error } = useAdminData<Entry[]>(`/activity?limit=300&admin=${encodeURIComponent(who)}&q=${encodeURIComponent(query)}`, onUnauthorized);
  const { data: team } = useAdminData<{ name: string }[]>('/team', onUnauthorized);
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="ad-page" lang="bn">
      <header className="ad-head">
        <h1>অ্যাক্টিভিটি · কে কী বদলাল</h1>
      </header>
      <div className="ad-row ad-filters">
        <select className="ad-input" value={who} onChange={(e) => setWho(e.target.value)} aria-label="কে">
          <option value="">সবাই</option>
          <option value="Owner">Owner</option>
          {team?.map((m) => (
            <option key={m.name} value={m.name}>
              {m.name}
            </option>
          ))}
        </select>
        <input className="ad-input" placeholder="কী: lessons, users, tickets…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {error && <p className="ad-error">{error}</p>}
      <section className="ad-card">
        <ul className="ad-list">
          {data?.map((e, i) => (
            <li key={i} className="ad-item">
              <button className="ad-item-open" onClick={() => setOpen(open === i ? null : i)}>
                <strong>
                  {e.admin} · {ACTIONS[e.method] ?? e.method} <span className="ad-muted">{what(e.path)}</span>
                  {e.status !== 200 && <span className="ad-error"> ব্যর্থ ({e.status})</span>}
                </strong>
                <small>{new Date(e.at).toLocaleString()}</small>
                {open === i && e.detail && <pre className="ad-help">{e.detail}</pre>}
              </button>
            </li>
          ))}
          {data && !data.length && <li className="ad-empty">কিছু নেই।</li>}
        </ul>
      </section>
    </div>
  );
}
