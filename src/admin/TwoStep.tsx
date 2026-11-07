import { useState } from 'react';
import { adminApi } from './adminApi';
import { useAdminData } from './useAdminData';

/**
 * Owner: two-step sign-in. Once on, signing in to the admin needs the token and a 6-digit code from an
 * authenticator app (Google Authenticator, Microsoft Authenticator…), so a leaked token alone isn't enough.
 */
export function TwoStep({ onUnauthorized }: { onUnauthorized: () => void }) {
  const { data, reload } = useAdminData<{ on: boolean }>('/two-step', onUnauthorized);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  if (!data) return null;

  const call = (path: string, body: unknown, done: string) =>
    adminApi('POST', path, body)
      .then(() => (setNote({ ok: true, text: done }), setSecret(null), setCode(''), reload()))
      .catch((e: Error) => setNote({ ok: false, text: e.message === 'That code is not right' ? 'কোডটা মেলেনি।' : e.message }));

  return (
    <section className="ad-card" lang="bn">
      <div className="ad-section-head">
        <h2>দুই ধাপে সাইন ইন</h2>
        <span className={data.on ? 'ad-pill is-ok' : 'ad-pill'}>{data.on ? 'চালু' : 'বন্ধ'}</span>
      </div>
      <p className="ad-muted">চালু থাকলে অ্যাডমিনে ঢুকতে টোকেনের সাথে ফোনের Authenticator অ্যাপের ৬ অঙ্কের কোড লাগবে। টোকেন কেউ পেয়ে গেলেও ঢুকতে পারবে না।</p>
      {!data.on && !secret && (
        <button className="ad-btn" onClick={() => adminApi<{ secret: string }>('POST', '/two-step/start').then((r) => setSecret(r.secret))}>
          চালু করো
        </button>
      )}
      {secret && (
        <>
          <p>
            ১. ফোনে Google Authenticator খুলে “+” → “Enter a setup key” → নাম Englio, key নিচেরটা:
            <br />
            <code className="ad-secret">{secret.replace(/(.{4})/g, '$1 ').trim()}</code>
          </p>
          <p>২. অ্যাপে যে ৬ অঙ্কের কোড দেখাচ্ছে সেটা এখানে দাও:</p>
        </>
      )}
      {(secret || data.on) && (
        <div className="ad-row">
          <input className="ad-input" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} placeholder="৬ অঙ্কের কোড" />
          {secret ? (
            <button className="ad-btn is-primary" onClick={() => call('/two-step/confirm', { code }, 'চালু হয়েছে। এরপর থেকে সাইন ইনে কোড লাগবে।')}>
              নিশ্চিত করো
            </button>
          ) : (
            <button className="ad-btn is-danger" onClick={() => call('/two-step/off', { code }, 'বন্ধ হয়েছে।')}>
              বন্ধ করো
            </button>
          )}
        </div>
      )}
      {note && <p className={note.ok ? 'ad-ok' : 'ad-error'}>{note.text}</p>}
    </section>
  );
}
