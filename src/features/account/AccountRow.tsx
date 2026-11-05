import { useEffect, useState } from 'react';
import { Glyph } from '../../components/Glyph';
import { linkedAccounts } from '../../lib/account';
import { haptic } from '../../lib/haptics';
import { useProgress } from '../../state/ProgressContext';
import { AccountSheet } from './AccountSheet';

/** Settings: link a phone number or Google account, so progress survives a lost or new phone. */
export function AccountRow() {
  const { progress } = useProgress();
  const [open, setOpen] = useState(false);
  const [linked, setLinked] = useState<{ kind: string; label: string }[] | null>(null);

  useEffect(() => {
    if (!open) linkedAccounts().then(setLinked);
  }, [open]);

  return (
    <>
      <button
        className="pf-row"
        onClick={() => {
          haptic();
          setOpen(true);
        }}
      >
        <span className="pf-icon" style={{ background: 'var(--ios-green)' }}>
          <Glyph name="person" size={16} />
        </span>
        <span className="pf-row-text">
          <span lang="bn">অ্যাকাউন্ট</span>
          <small lang="bn">{linked?.length ? `সেভ করা আছে: ${linked.map((a) => a.label).join(', ')}` : 'ফোন নম্বর দিয়ে অগ্রগতি সেভ করো'}</small>
        </span>
        <Glyph name="chevron" size={16} className="pf-chevron" />
      </button>
      {open && <AccountSheet progress={progress} onClose={() => setOpen(false)} />}
    </>
  );
}
