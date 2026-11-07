import { useState } from 'react';
import { Glyph } from '../../components/Glyph';
import { useProgress } from '../../state/ProgressContext';
import { BackupCode } from '../profile/BackupCode';

const KEY = 'englio-backup-seen';

/** The learner has seen their backup code (opened it here or in Profile), so the nudge stops. */
export function markBackupSeen(): void {
  try {
    localStorage.setItem(KEY, '1');
  } catch {
    // Shown again next time; harmless.
  }
}

const seen = () => {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return true;
  }
};

/**
 * After a few lessons, once: "write down your backup code", so a lost, shared or new phone doesn't mean
 * lost progress. Goes away once the code was opened (here or in Profile) or the card is closed.
 */
export function BackupNudge() {
  const { progress } = useProgress();
  const [hidden, setHidden] = useState(seen);
  const [open, setOpen] = useState(false);
  if (hidden || Object.keys(progress.completed).length < 3) return null;
  return (
    <>
      <div className="rc bn home-rise">
        <span className="rc-icon bn-icon" aria-hidden="true">
          <Glyph name="lock" size={20} />
        </span>
        <button className="rc-text bn-open" onClick={() => setOpen(true)}>
          <strong lang="bn">তোমার ব্যাকআপ কোডটা লিখে রাখো</strong>
          <small lang="bn">ফোন হারালে বা বদলালে এই কোড দিয়েই সব অগ্রগতি ফিরে পাবে।</small>
        </button>
        <button className="sl-close" aria-label="Close" onClick={() => (markBackupSeen(), setHidden(true))}>
          <Glyph name="close" size={14} />
        </button>
      </div>
      {open && <BackupCode onClose={() => (setOpen(false), setHidden(true))} />}
    </>
  );
}
