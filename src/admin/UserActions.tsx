import { useState } from 'react';
import { adminApi } from './adminApi';
import type { UserData } from './UserPage';

/**
 * Fixing one learner's account from a complaint: give Englio Plus, fill hearts, give streak freezes,
 * give back a lost streak, bring a second phone's progress in, or block a cheater out of the league.
 * Changes to progress reach the phone on its next sync (the admin's copy is the newest).
 */
export function UserActions({ user, onDone }: { user: UserData; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  async function act(body: Record<string, unknown>, done: string) {
    setBusy(true);
    try {
      await adminApi('POST', `/users/${user.id}/action`, body);
      setNote({ ok: true, text: done });
      onDone();
    } catch (e) {
      setNote({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }
  const ask = (question: string, fallback: string) => {
    const v = prompt(question, fallback);
    return v === null ? null : v.trim();
  };

  return (
    <section className="ad-card ad-actions">
      <div className="ad-section-head">
        <h2>অ্যাকাউন্ট ঠিক করো</h2>
      </div>
      <div className="ad-row ad-quick">
        <button
          className="ad-btn"
          disabled={busy}
          onClick={() => {
            const days = ask('কত দিনের Plus দেবে?', '30');
            if (days) act({ action: 'plus', days: Number(days) }, `${days} দিনের Plus দেওয়া হলো।`);
          }}
        >
          Plus দাও
        </button>
        {user.plusUntil && (
          <button className="ad-btn" disabled={busy} onClick={() => confirm('Plus বন্ধ করবে?') && act({ action: 'end-plus' }, 'Plus বন্ধ হলো।')}>
            Plus বন্ধ
          </button>
        )}
        <button className="ad-btn" disabled={busy} onClick={() => act({ action: 'hearts' }, 'হার্ট ভরে দেওয়া হলো।')}>
          হার্ট ভরে দাও
        </button>
        <button
          className="ad-btn"
          disabled={busy}
          onClick={() => {
            const n = ask('কয়টা স্ট্রিক ফ্রিজ দেবে?', '1');
            if (n) act({ action: 'freezes', count: Number(n) }, `${n}টা ফ্রিজ দেওয়া হলো।`);
          }}
        >
          ফ্রিজ দাও
        </button>
        <button
          className="ad-btn"
          disabled={busy}
          onClick={() => {
            const n = ask('স্ট্রিক কত দিন ছিল? (ফিরিয়ে দেওয়া হবে)', String(Math.max(user.streak, 1)));
            if (n) act({ action: 'streak', days: Number(n) }, `স্ট্রিক ${n} দিনে ফেরানো হলো।`);
          }}
        >
          স্ট্রিক ফেরাও
        </button>
        <button
          className="ad-btn"
          disabled={busy}
          onClick={() => {
            const from = ask('অন্য ফোনের ডিভাইস আইডি বা ব্যাকআপ কোড (সেটার অগ্রগতি এখানে যোগ হবে)', '');
            if (from) act({ action: 'merge', from }, 'অন্য ফোনের অগ্রগতি যোগ হলো।');
          }}
        >
          অন্য ফোন জোড়ো
        </button>
        {user.blocked ? (
          <button className="ad-btn" disabled={busy} onClick={() => act({ action: 'unblock' }, 'আনব্লক করা হলো।')}>
            আনব্লক
          </button>
        ) : (
          <button className="ad-btn is-danger" disabled={busy} onClick={() => confirm('লিগ থেকে বাদ দেবে (ব্লক)?') && act({ action: 'block' }, 'ব্লক করা হলো: লিগে আর দেখাবে না।')}>
            ব্লক
          </button>
        )}
      </div>
      {note && <p className={note.ok ? 'ad-ok' : 'ad-error'}>{note.text}</p>}
      <p className="ad-muted">অগ্রগতির বদল (হার্ট, ফ্রিজ, স্ট্রিক) শিক্ষার্থীর ফোনে পরের বার অ্যাপ খুললে পৌঁছাবে।</p>
    </section>
  );
}
