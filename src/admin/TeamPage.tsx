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
  if (!team) return <p className="ad-muted">Loading…</p>;

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
          Team <span lang="bn">· টিম</span>
        </h1>
      </header>
      <p className="ad-muted">
        Editor: lessons, grammar, stories and audio. Support: learners and their reports (answer complaints, give Plus, fix streaks), no
        content or settings. Owner: everything. The ADMIN_TOKEN on the server is always an owner.
      </p>

      <form className="ad-card ad-form" onSubmit={add}>
        <div className="ad-grid">
          <label className="ad-field">
            <span>Name</span>
            <input className="ad-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Shila (content writer)" />
          </label>
          <label className="ad-field">
            <span>Role</span>
            <select className="ad-input" value={role} onChange={(e) => setRole(e.target.value as Member['role'])}>
              <option value="editor">Editor: content only</option>
              <option value="support">Support: learners and reports</option>
              <option value="owner">Owner: everything</option>
            </select>
          </label>
        </div>
        {problem && <p className="ad-error">{problem}</p>}
        <div className="ad-row">
          <button className="ad-btn is-primary" disabled={!name.trim()}>
            Add member
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
                Remove
              </button>
            </li>
          ))}
          {!team.length && <li className="ad-empty">Only you (the owner) so far.</li>}
        </ul>
      </section>
    </div>
  );
}
