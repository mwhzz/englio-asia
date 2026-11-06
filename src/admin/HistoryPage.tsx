import { useState } from 'react';
import { adminApi } from './adminApi';
import { ago } from './names';
import { useAdminData } from './useAdminData';
import { useDebounced } from './useDebounced';

interface Entry {
  id: number;
  at: string;
  admin: string;
  action: 'change' | 'delete';
  kind: string;
  entity: string;
  label: string;
}

const KIND_BN: Record<string, string> = {
  unit: 'ইউনিট',
  lesson: 'লেসন',
  item: 'প্রশ্ন/শব্দ',
  grammar: 'ব্যাকরণ',
  course: 'ব্যাকরণ কোর্স',
  story: 'গল্প',
  writing: 'লেখা',
  board: 'বোর্ড',
};

/**
 * Every content change and delete of the last 90 days (server/history.ts): "ফিরিয়ে আনো" puts it back as it
 * was before that change, or brings a deleted thing back (a unit or lesson with everything in it).
 */
export function HistoryPage({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [action, setAction] = useState<'' | 'delete' | 'change'>('');
  const [q, setQ] = useState('');
  const query = useDebounced(q.trim());
  const { data, error, reload } = useAdminData<Entry[]>(`/history?action=${action}&q=${encodeURIComponent(query)}`, onUnauthorized);
  const [note, setNote] = useState<string | null>(null);

  async function restore(e: Entry) {
    const what = `${KIND_BN[e.kind] ?? e.kind} "${e.label || e.entity}"`;
    if (!confirm(e.action === 'delete' ? `${what} ফিরিয়ে আনবে?` : `${what} এই বদলের আগের মতো করবে? এর পরের বদলগুলো চলে যাবে।`)) return;
    try {
      await adminApi('POST', `/history/${e.id}/restore`);
      setNote(`${what} ফিরিয়ে আনা হয়েছে।`);
      reload();
    } catch (err) {
      setNote((err as Error).message);
    }
  }

  return (
    <div className="ad-page" lang="bn">
      <header className="ad-head">
        <h1>ইতিহাস ও ট্র্যাশ</h1>
      </header>
      <p className="ad-muted">কনটেন্টের প্রতিটা বদল আর মুছে ফেলার আগের কপি ৯০ দিন রাখা হয়। ভুল হলে এখান থেকে ফিরিয়ে আনো।</p>
      <div className="ad-row ad-filters">
        <span className="ad-seg" role="radiogroup" aria-label="Which">
          {(
            [
              ['', 'সব'],
              ['delete', 'মুছে ফেলা (ট্র্যাশ)'],
              ['change', 'বদল'],
            ] as const
          ).map(([id, bn]) => (
            <button key={id} role="radio" aria-checked={action === id} className={action === id ? 'is-on' : ''} onClick={() => setAction(id)}>
              {bn}
            </button>
          ))}
        </span>
        <input className="ad-input" placeholder="নাম বা id দিয়ে খোঁজো" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {note && <p className="ad-ok">{note}</p>}
      {error && <p className="ad-error">{error}</p>}
      <section className="ad-card">
        <ul className="ad-list">
          {data?.map((e) => (
            <li key={e.id} className="ad-item">
              <span className="ad-item-open">
                <span className="ad-ticket-top">
                  <span className={`ad-pill${e.action === 'delete' ? ' is-bad' : ''}`}>{e.action === 'delete' ? 'মুছেছে' : 'বদলেছে'}</span>
                  <span className="ad-pill">{KIND_BN[e.kind] ?? e.kind}</span>
                  <small>
                    {e.admin} · {ago(e.at)}
                  </small>
                </span>
                <strong>{e.label || e.entity}</strong>
                <small>{e.entity}</small>
              </span>
              <button className="ad-btn is-small" onClick={() => restore(e)}>
                ফিরিয়ে আনো
              </button>
            </li>
          ))}
          {data && !data.length && <li className="ad-empty">কিছু নেই।</li>}
        </ul>
      </section>
    </div>
  );
}
