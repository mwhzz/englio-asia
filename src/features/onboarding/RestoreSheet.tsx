import { useState } from 'react';
import { Modal } from '../../components/Modal';
import { restoreFrom } from '../../lib/backup';
import { AccountSheet } from '../account/AccountSheet';

const ERRORS: Record<number, string> = {
  404: 'এই কোডটা মিলল না। অক্ষরগুলো আরেকবার দেখে নাও।',
  429: 'অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করো।',
};

/** Type the backup code from the old phone to bring its progress here. */
export function RestoreSheet({ onClose }: { onClose: () => void }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready = code.replace(/[^a-z0-9]/gi, '').length === 10;
  const [byPhone, setByPhone] = useState(false);
  if (byPhone) return <AccountSheet progress={null} onClose={onClose} />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await restoreFrom(code);
    } catch (err) {
      setBusy(false);
      setError(ERRORS[(err as { status?: number }).status ?? 0] ?? 'সার্ভারে পৌঁছানো গেল না। ইন্টারনেট চালু করে আবার চেষ্টা করো।');
    }
  }

  return (
    <Modal onClose={onClose}>
      <form className="bk" onSubmit={submit}>
        <h2 lang="bn">আগের অগ্রগতি ফিরিয়ে আনো</h2>
        <p className="muted" lang="bn">
          পুরোনো ফোনের প্রোফাইল → সেটিংস → "ব্যাকআপ কোড"-এ যে কোডটা আছে, সেটা এখানে লেখো। এই ফোনে যা শিখেছ, সেটাও থেকে যাবে।
        </p>
        <input
          className="bk-input"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ABCDE-23456"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          maxLength={13}
          aria-label="Backup code"
          autoFocus
        />
        {error && (
          <p className="bk-error" lang="bn">
            {error}
          </p>
        )}
        <div className="cta-stack">
          <button className="cta" disabled={!ready || busy}>
            <span lang="bn">{busy ? 'আনছে…' : 'ফিরিয়ে আনো'}</span>
          </button>
          <button type="button" className="cta-text" onClick={() => setByPhone(true)}>
            <span lang="bn">ফোন নম্বর বা Google দিয়ে ঢোকো</span>
          </button>
          <button type="button" className="cta-text" onClick={onClose}>
            <span lang="bn">বাতিল</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
