import { useState } from 'react';
import { Logo } from '../components/Logo';
import { adminApi, setToken, Unauthorized } from './adminApi';

/** Asks for the admin token and checks it against the server. */
export function Login({ onDone }: { onDone: () => void }) {
  const [token, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setToken(token.trim());
    try {
      await adminApi('GET', '/summary');
      onDone();
    } catch (err) {
      setError(err instanceof Unauthorized ? 'That token is not right.' : 'Can’t reach the server. Is it running (npm run server)?');
    }
  }

  return (
    <form className="ad-login" onSubmit={submit}>
      <Logo size={44} />
      <h1>Admin</h1>
      <p className="ad-muted">Enter the admin token (ADMIN_TOKEN on the server).</p>
      <input className="ad-input" type="password" value={token} onChange={(e) => setValue(e.target.value)} placeholder="Admin token" autoFocus />
      {error && <p className="ad-error">{error}</p>}
      <button className="ad-btn is-primary" disabled={!token.trim()}>
        Sign in
      </button>
    </form>
  );
}
