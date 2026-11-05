import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../components/Modal';
import { GOOGLE_CLIENT_ID, loadGoogle, sendCode, signInWithGoogle, verifyCode } from '../../lib/account';
import type { Progress } from '../../lib/progress';

const PROBLEMS: Record<number, string> = {
  400: 'নম্বরটা ঠিক নেই। এভাবে লেখো: 01712345678',
  401: 'কোডটা মেলেনি। SMS-এর ৬ অঙ্কের কোডটা আবার দেখো।',
  404: 'এই অ্যাকাউন্টে আগে কোনো অগ্রগতি সেভ করা হয়নি। আগে শুরু করো, তারপর প্রোফাইল থেকে সেভ করো।',
  410: 'কোডের সময় শেষ। নতুন কোড চাও।',
  429: 'অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পরে আবার করো।',
  502: 'SMS পাঠানো গেল না। একটু পরে আবার চেষ্টা করো।',
};
const problemOf = (err: unknown) => PROBLEMS[(err as { status?: number }).status ?? 0] ?? 'সার্ভারে পৌঁছানো গেল না। ইন্টারনেট দেখে আবার চেষ্টা করো।';

/**
 * Sign in with a phone number (a 6-digit code by SMS) or Google. From settings it saves this learner's
 * progress to the account; on a new phone it brings the account's progress back.
 */
export function AccountSheet({ progress, onClose }: { progress: Progress | null; onClose: () => void }) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const googleBox = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clientId = GOOGLE_CLIENT_ID;
    if (!clientId || !googleBox.current) return;
    loadGoogle()
      .then((g) => {
        g.initialize({
          client_id: clientId,
          callback: ({ credential }) =>
            signInWithGoogle(credential, progress).then(
              (r) => r === 'linked' && setDone(true),
              (err) => setProblem(problemOf(err)),
            ),
        });
        if (googleBox.current) g.renderButton(googleBox.current, { theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', width: 280 });
      })
      .catch(() => undefined);
  }, [progress]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setProblem(null);
    try {
      const r = await sendCode(phone);
      setSent(true);
      if (r.devCode) setCode(r.devCode);
    } catch (err) {
      setProblem(problemOf(err));
    }
    setBusy(false);
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setProblem(null);
    try {
      if ((await verifyCode(phone, code, progress)) === 'linked') setDone(true);
    } catch (err) {
      setProblem(problemOf(err));
      setBusy(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="bk acc">
        {done ? (
          <>
            <h2 lang="bn">সেভ হয়ে গেছে</h2>
            <p className="muted" lang="bn">
              এখন যেকোনো ফোনে এই নম্বর বা Google দিয়ে ঢুকলেই তোমার সব অগ্রগতি ফিরে আসবে।
            </p>
            <button className="cta" onClick={onClose}>
              <span lang="bn">ঠিক আছে</span>
            </button>
          </>
        ) : (
          <>
            <h2 lang="bn">{progress?.profile ? 'অ্যাকাউন্টে সেভ করো' : 'অ্যাকাউন্ট দিয়ে ঢোকো'}</h2>
            <p className="muted" lang="bn">
              {progress?.profile ? 'ফোন হারালে বা বদলালেও অগ্রগতি হারাবে না।' : 'যে নম্বর বা Google অ্যাকাউন্টে অগ্রগতি সেভ করেছিলে, সেটা দিয়ে ঢোকো।'}
            </p>
            {!sent ? (
              <form className="acc-form" onSubmit={send}>
                <input
                  className="bk-input acc-input"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  aria-label="Phone number"
                />
                <button className="cta" disabled={busy || phone.replace(/\D/g, '').length < 11}>
                  <span lang="bn">{busy ? 'পাঠাচ্ছে…' : 'কোড পাঠাও'}</span>
                </button>
              </form>
            ) : (
              <form className="acc-form" onSubmit={verify}>
                <p className="acc-sent" lang="bn">
                  {phone}-এ একটা ৬ অঙ্কের কোড পাঠানো হয়েছে।
                </p>
                <input
                  className="bk-input acc-input"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="১২৩৪৫৬"
                  aria-label="Code"
                  autoFocus
                />
                <button className="cta" disabled={busy || code.length !== 6}>
                  <span lang="bn">{busy ? 'যাচাই করছে…' : 'যাচাই করো'}</span>
                </button>
                <button type="button" className="cta-text" onClick={() => (setSent(false), setCode(''))}>
                  <span lang="bn">নম্বর বদলাও</span>
                </button>
              </form>
            )}
            {problem && (
              <p className="bk-error" lang="bn">
                {problem}
              </p>
            )}
            {GOOGLE_CLIENT_ID && (
              <>
                <p className="acc-or" lang="bn">
                  অথবা
                </p>
                <div ref={googleBox} className="acc-google" />
              </>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
