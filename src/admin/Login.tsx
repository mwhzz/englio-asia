import { useState } from 'react';
import { Logo } from '../components/Logo';
import { API_BASE } from '../lib/api';
import { setToken } from './adminApi';

/**
 * Sign in: the admin token (ADMIN_TOKEN or a team member's) is traded for a 30-day session, which is what the
 * browser keeps. With two-step sign-in on, a 6-digit code from the authenticator app is asked for too.
 */
export function Login({ onDone }: { onDone: () => void }) {
  const [token, setValue] = useState('');
  const [code, setCode] = useState('');
  const [needCode, setNeedCode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token: token.trim(), code: needCode ? code.trim() : undefined }),
      });
      if (res.status === 428) {
        setError(needCode ? 'কোডটা মেলেনি। অ্যাপে নতুন কোড দেখে আবার দাও।' : null);
        setNeedCode(true);
        return;
      }
      if (res.status === 401) return setError('টোকেনটা ঠিক নয়।');
      if (!res.ok) return setError(`সাইন ইন হলো না (${res.status})।`);
      setToken(((await res.json()) as { session: string }).session);
      onDone();
    } catch {
      setError('সার্ভারে পৌঁছানো গেল না।');
    }
  }

  return (
    <form className="ad-login" onSubmit={submit} lang="bn">
      <Logo size={44} />
      <h1>Admin</h1>
      <p className="ad-muted">অ্যাডমিন টোকেন দাও: সার্ভারের ADMIN_TOKEN, অথবা owner তোমাকে যেটা দিয়েছে।</p>
      <input className="ad-input" type="password" value={token} onChange={(e) => setValue(e.target.value)} placeholder="Admin token" autoFocus />
      {needCode && (
        <input
          className="ad-input"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Authenticator অ্যাপের ৬ অঙ্কের কোড"
          autoFocus
        />
      )}
      {error && <p className="ad-error">{error}</p>}
      <button className="ad-btn is-primary" disabled={!token.trim() || (needCode && code.trim().length < 6)}>
        Sign in
      </button>
    </form>
  );
}
