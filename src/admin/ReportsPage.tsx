import { useState } from 'react';
import { adminApi } from './adminApi';
import { ContentReports } from './ContentReports';
import { TicketRow, type Ticket } from './TicketRow';
import { useAdminData } from './useAdminData';
import { useDebounced } from './useDebounced';
import { KIND_BN } from './reportLabels';

const VIEWS = [
  ['open', 'খোলা'],
  ['new', 'নতুন'],
  ['doing', 'দেখছি'],
  ['fixed', 'ঠিক হয়েছে'],
  ['closed', 'বন্ধ'],
  ['', 'সব'],
] as const;

/**
 * Learners' reports. "সব রিপোর্ট" lists each one (from lessons and the app's help page) with the learner,
 * app version and phone; set its status, who handles it, and a reply the learner reads in the app.
 * "লেসনের ভুল" groups the same lesson question reported by many learners: fix the content, then mark it fixed.
 */
export function ReportsPage({ onUnauthorized, people = true }: { onUnauthorized: () => void; people?: boolean }) {
  // Editors fix lesson content; learners' own reports are for the owner and support.
  const [tab, setTab] = useState<'tickets' | 'content'>(people ? 'tickets' : 'content');
  const [status, setStatus] = useState('open');
  const [kind, setKind] = useState('');
  const [q, setQ] = useState('');
  const query = useDebounced(q);
  const { data, error, reload } = useAdminData<{ tickets: Ticket[]; counts: Record<string, number> }>(
    people ? `/tickets?status=${status}&kind=${kind}&q=${encodeURIComponent(query)}` : '/reports',
    onUnauthorized,
  );
  const { data: team } = useAdminData<{ name: string }[]>(people ? '/team' : '/me', () => undefined);

  const save = (id: number, change: Partial<Ticket>) =>
    adminApi('PUT', `/tickets/${id}`, change)
      .then(reload)
      .catch((e: Error) => alert(e.message));

  return (
    <div className="ad-page" lang="bn">
      <header className="ad-head">
        <h1>রিপোর্ট</h1>
        {people && (
        <span className="ad-seg" role="radiogroup" aria-label="Which reports">
          <button role="radio" aria-checked={tab === 'tickets'} className={tab === 'tickets' ? 'is-on' : ''} onClick={() => setTab('tickets')}>
            সব রিপোর্ট
          </button>
          <button role="radio" aria-checked={tab === 'content'} className={tab === 'content' ? 'is-on' : ''} onClick={() => setTab('content')}>
            লেসনের ভুল
          </button>
        </span>
        )}
      </header>

      {tab === 'content' ? (
        <ContentReports onUnauthorized={onUnauthorized} />
      ) : (
        <>
          <p className="ad-muted">
            শিক্ষার্থীরা লেসনের "সমস্যা জানাও" আর প্রোফাইল → সাহায্য ও অভিযোগ থেকে পাঠায়। উত্তর লিখলে শিক্ষার্থী অ্যাপের সাহায্য পেজে দেখতে পায়।
          </p>
          <div className="ad-row ad-filters">
            <input className="ad-input" placeholder="লেখা দিয়ে খোঁজো" value={q} onChange={(e) => setQ(e.target.value)} />
            <select className="ad-input" value={kind} onChange={(e) => setKind(e.target.value)} aria-label="ধরন">
              <option value="">সব ধরন</option>
              {Object.entries(KIND_BN).map(([k, bn]) => (
                <option key={k} value={k}>
                  {bn}
                </option>
              ))}
            </select>
          </div>
          <div className="ad-row ad-filters ad-scroll-x">
            <span className="ad-seg" role="radiogroup" aria-label="Status">
              {VIEWS.map(([id, bn]) => (
                <button key={id} role="radio" aria-checked={status === id} className={status === id ? 'is-on' : ''} onClick={() => setStatus(id)}>
                  {bn}
                  {id && id !== 'open' && data?.counts[id] ? ` ${data.counts[id]}` : ''}
                </button>
              ))}
            </span>
          </div>
          {error && <p className="ad-error">{error}</p>}
          {!data ? (
            <p className="ad-muted">লোড হচ্ছে…</p>
          ) : (
            <section className="ad-card">
              <ul className="ad-list">
                {data.tickets.map((t) => (
                  <TicketRow key={t.id} ticket={t} team={Array.isArray(team) ? team.map((m) => m.name) : []} onSave={(change) => save(t.id, change)} />
                ))}
                {!data.tickets.length && <li className="ad-empty">এখানে কোনো রিপোর্ট নেই।</li>}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
