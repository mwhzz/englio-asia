import { useState } from 'react';
import { adminApi } from './adminApi';
import { useAdminData } from './useAdminData';

interface Member {
  id: number;
  name: string;
  role: 'owner' | 'editor' | 'support';
  createdAt: string;
  lastUsed: string | null;
}

const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString() : 'never');

/** The owner's list of admin team members: add one (their token is shown once) or remove one. */
export function TeamPage({ onUnauthorized }: { onUnauthorized: () => void }) {
  const { data: team, error, reload } = useAdminData<Member[]>('/team', onUnauthorized);
  const [name, setName] = useState('');
  const [role, setRole] = useState<Member['role']>('editor');
  const [made, setMade] = useState<{ name: string; token: string } | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  if (error) return <p className="ad-error">{error}</p>;
  if (!team) return <p className="ad-muted">লোড হচ্ছে…</p>;

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setProblem(null);
    try {
      const member = await adminApi<{ name: string; token: string }>('POST', '/team', { name, role });
      setMade(member);
      setName('');
      reload();
    } catch (err) {
      setProblem((err as Error).message);
    }
  }

  return (
    <div className="ad-page">
      <header className="ad-head">
        <h1>
          টিম
        </h1>
      </header>
      <p className="ad-muted">
        Editor: লেসন, ব্যাকরণ, গল্প আর অডিও। Support: শিক্ষার্থী আর তাদের রিপোর্ট (অভিযোগের উত্তর, Plus দেওয়া, স্ট্রিক ফেরানো), কনটেন্ট বা
        সেটিংস না। Owner: সবকিছু। সার্ভারের ADMIN_TOKEN সবসময় owner।
      </p>

      <form className="ad-card ad-form" onSubmit={add}>
        <div className="ad-grid">
          <label className="ad-field">
            <span>নাম</span>
            <input className="ad-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Shila (content writer)" />
          </label>
          <label className="ad-field">
            <span>ভূমিকা</span>
            <select className="ad-input" value={role} onChange={(e) => setRole(e.target.value as Member['role'])}>
              <option value="editor">Editor: শুধু কনটেন্ট</option>
              <option value="support">Support: শিক্ষার্থী আর রিপোর্ট</option>
              <option value="owner">Owner: সবকিছু</option>
            </select>
          </label>
        </div>
        {problem && <p className="ad-error">{problem}</p>}
        <div className="ad-row">
          <button className="ad-btn is-primary" disabled={!name.trim()}>
            সদস্য যোগ করো
          </button>
        </div>
        {made && (
          <div className="ad-token">
            <strong>{made.name}’s sign-in token</strong>
            <code>{made.token}</code>
            <small>Copy it now and send it to them privately. It won’t be shown again; if it’s lost, remove them and add them again.</small>
          </div>
        )}
      </form>

      <section className="ad-card">
        <ul className="ad-list">
          {team.map((m) => (
            <li key={m.id} className="ad-item">
              <span className="ad-item-open">
                <strong>{m.name}</strong> <span className="ad-muted">{m.role}</span>
                <small>
                  added {day(m.createdAt)} · last used {day(m.lastUsed)}
                </small>
              </span>
              <button
                className="ad-btn is-small is-danger"
                onClick={() =>
                  confirm(`Remove ${m.name}? Their token stops working at once.`) &&
                  adminApi('DELETE', `/team/${m.id}`)
                    .then(reload)
                    .catch((e: Error) => alert(e.message))
                }
              >
                সরাও
              </button>
            </li>
          ))}
          {!team.length && <li className="ad-empty">Only you (the owner) so far.</li>}
        </ul>
      </section>
    </div>
  );
}
