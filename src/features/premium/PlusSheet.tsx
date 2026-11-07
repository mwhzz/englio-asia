import { useEffect, useState } from 'react';
import { dateLocale } from '../../lib/learnerLang';
import { Modal } from '../../components/Modal';
import { toBanglaDigits } from '../../lib/bangla';
import { haptic } from '../../lib/haptics';
import { buyPlus, plusInfo, redeemCode, startTrial, trialUsed, type PlusInfo } from '../../lib/premium';

const dateOf = (iso: string) => new Intl.DateTimeFormat(dateLocale(), { day: 'numeric', month: 'long' }).format(new Date(iso));

/**
 * Getting Englio Plus: the free trial (once), the monthly or yearly plan with bKash (website only), and a
 * promo code from a school or campaign. What isn't on (no trial, no yearly plan, no bKash in the Play app) is left out.
 */
export function PlusSheet({ onClose, onChange }: { onClose: () => void; onChange: (until: string) => void }) {
  const [info, setInfo] = useState<PlusInfo | null>(null);
  const [usedTrial, setUsedTrial] = useState(true);
  const [code, setCode] = useState('');
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    plusInfo().then(setInfo);
    trialUsed().then(setUsedTrial);
  }, []);

  const run = async (fn: () => Promise<string>, done: (until: string) => string, failed: (status?: number) => string) => {
    haptic();
    setBusy(true);
    setNote(null);
    try {
      const until = await fn();
      onChange(until);
      setNote({ ok: true, text: done(until) });
    } catch (e) {
      setNote({ ok: false, text: failed((e as { status?: number }).status) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="ps" lang="bn">
        <h2>Englio Plus</h2>
        <p className="muted">অফুরন্ত হার্ট, আর লক করা সব ইউনিট।</p>

        {info && info.trialDays > 0 && !usedTrial && (
          <button
            className="cta"
            disabled={busy}
            onClick={() =>
              run(
                startTrial,
                (u) => `চালু হয়েছে! ${dateOf(u)} পর্যন্ত ফ্রি।`,
                () => 'ট্রায়াল চালু করা গেল না। আগে নিয়ে থাকলে আর পাওয়া যায় না।',
              ).then(() => setUsedTrial(true))
            }
          >
            <span>{toBanglaDigits(info.trialDays)} দিন ফ্রি চালু করো</span>
          </button>
        )}

        {info?.available && (
          <div className="ps-plans">
            <button className="ps-plan" disabled={busy} onClick={() => (haptic(), buyPlus('month').catch(() => setNote({ ok: false, text: 'bKash খোলা গেল না।' })))}>
              <strong>{toBanglaDigits(info.price)} টাকা</strong>
              <small>{toBanglaDigits(info.days)} দিন</small>
            </button>
            {info.yearPrice > 0 && (
              <button className="ps-plan is-best" disabled={busy} onClick={() => (haptic(), buyPlus('year').catch(() => setNote({ ok: false, text: 'bKash খোলা গেল না।' })))}>
                <strong>{toBanglaDigits(info.yearPrice)} টাকা</strong>
                <small>১ বছর{info.price * 12 > info.yearPrice ? ` · ${toBanglaDigits(Math.round(100 - (100 * info.yearPrice) / (info.price * 12)))}% কম` : ''}</small>
              </button>
            )}
          </div>
        )}

        <form
          className="ps-code"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim())
              run(
                () => redeemCode(code),
                (u) => `কোডটা কাজ করেছে! ${dateOf(u)} পর্যন্ত Plus।`,
                (status) => (status === 409 ? 'এই কোডটা তুমি আগেই ব্যবহার করেছ।' : 'কোডটা কাজ করছে না। বানান দেখে আবার লেখো।'),
              );
          }}
        >
          <input className="rp-note" placeholder="প্রোমো কোড আছে?" value={code} onChange={(e) => setCode(e.target.value)} autoCapitalize="characters" />
          <button className="cta-text" disabled={busy || !code.trim()}>
            <span>ব্যবহার করো</span>
          </button>
        </form>

        {note && <p className={note.ok ? 'ps-ok' : 'ps-bad'}>{note.text}</p>}
        <button className="cta-text" onClick={onClose}>
          <span>বন্ধ করো</span>
        </button>
      </div>
    </Modal>
  );
}
