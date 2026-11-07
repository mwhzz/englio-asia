import { useState } from 'react';
import { toBanglaDigits } from '../lib/bangla';
import { adminApi } from './adminApi';
import { useAdminData } from './useAdminData';

interface Promo {
  code: string;
  days: number;
  usesLeft: number;
  used: number;
  expires: string | null;
  note: string;
}

/** Promo codes worth days of Englio Plus (server/promo.ts): for a school, a campaign or a giveaway. */
export function PromoCodes({ onUnauthorized }: { onUnauthorized: () => void }) {
  const { data, error, reload } = useAdminData<Promo[]>('/promos', onUnauthorized);
  const [form, setForm] = useState({ code: '', days: 30, uses: 100, expires: '', note: '' });
  const [problem, setProblem] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setProblem(null);
    try {
      await adminApi('POST', '/promos', form);
      setForm({ ...form, code: '', note: '' });
      reload();
    } catch (err) {
      setProblem((err as Error).message);
    }
  }

  return (
    <section className="ad-card" lang="bn">
      <div className="ad-section-head">
        <h2>প্রোমো কোড</h2>
      </div>
      <p className="ad-muted">শিক্ষার্থী প্রোফাইল → Englio Plus-এ কোডটা দিলে এত দিনের Plus পায় (একজন একবার)। স্কুল, ক্যাম্পেইন বা উপহারের জন্য।</p>
      <form className="ad-grid" onSubmit={add}>
        <label className="ad-field">
          <span>কোড (খালি = নিজে বানাবে)</span>
          <input className="ad-input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SCHOOL30" />
        </label>
        <label className="ad-field">
          <span>কত দিনের Plus</span>
          <input className="ad-input" type="number" min={1} value={form.days} onChange={(e) => setForm({ ...form, days: Number(e.target.value) })} />
        </label>
        <label className="ad-field">
          <span>কতজন ব্যবহার করতে পারবে</span>
          <input className="ad-input" type="number" min={1} value={form.uses} onChange={(e) => setForm({ ...form, uses: Number(e.target.value) })} />
        </label>
        <label className="ad-field">
          <span>শেষ তারিখ (না দিলে সবসময়)</span>
          <input className="ad-input" type="date" value={form.expires} onChange={(e) => setForm({ ...form, expires: e.target.value })} />
        </label>
        <label className="ad-field">
          <span>নোট (কার জন্য)</span>
          <input className="ad-input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </label>
        <div className="ad-row">
          <button className="ad-btn is-primary">কোড বানাও</button>
        </div>
      </form>
      {(problem || error) && <p className="ad-error">{problem || error}</p>}
      <ul className="ad-list">
        {data?.map((p) => (
          <li key={p.code} className="ad-item">
            <span className="ad-item-open">
              <strong>{p.code}</strong>
              <small>
                {toBanglaDigits(p.days)} দিন · ব্যবহার {toBanglaDigits(p.used)}, বাকি {toBanglaDigits(p.usesLeft)}
                {p.expires ? ` · শেষ ${p.expires.slice(0, 10)}` : ''}
                {p.note ? ` · ${p.note}` : ''}
              </small>
            </span>
            <button
              className="ad-btn is-small is-danger"
              onClick={() =>
                confirm(`${p.code} মুছবে? যারা পেয়েছে তাদের Plus থাকবে।`) &&
                adminApi('DELETE', `/promos/${p.code}`)
                  .then(reload)
                  .catch((e: Error) => alert(e.message))
              }
            >
              মুছো
            </button>
          </li>
        ))}
        {data && !data.length && <li className="ad-empty">এখনো কোনো কোড নেই।</li>}
      </ul>
    </section>
  );
}
