import { useEffect, useState } from 'react';
import { Modal } from '../../components/Modal';
import { getBackupCode } from '../../lib/backup';
import { haptic } from '../../lib/haptics';
import { useProgress } from '../../state/ProgressContext';
import { RestoreSheet } from '../onboarding/RestoreSheet';

/** Shows this learner's backup code, to bring their progress to a new phone. */
export function BackupCode({ onClose }: { onClose: () => void }) {
  const { progress } = useProgress();
  const [code, setCode] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    getBackupCode(progress)
      .then(setCode)
      .catch(() => setFailed(true));
    // Only once when opened; later progress changes don't change the code.
  }, []);

  if (restoring) return <RestoreSheet onClose={onClose} />;

  return (
    <Modal onClose={onClose}>
      <div className="bk">
        <h2 lang="bn">ব্যাকআপ কোড</h2>
        <p className="muted" lang="bn">
          নতুন ফোনে Englio খুলে "আগের অগ্রগতি ফিরিয়ে আনো" চাপো আর এই কোডটা দাও। কোডটা কাউকে দেখিও না।
        </p>
        <div className="bk-code" aria-live="polite">
          {code ?? (failed ? '–' : '·····-·····')}
        </div>
        {failed && (
          <p className="bk-error" lang="bn">
            সার্ভারে পৌঁছানো গেল না। ইন্টারনেট চালু করে আবার খোলো।
          </p>
        )}
        <div className="cta-stack">
          <button
            className="cta"
            disabled={!code}
            onClick={() => {
              haptic();
              navigator.clipboard?.writeText(code!).then(() => setCopied(true), () => undefined);
            }}
          >
            <span lang="bn">{copied ? 'কপি হয়েছে' : 'কপি করো'}</span>
          </button>
          <button className="cta-text" onClick={() => setRestoring(true)}>
            <span lang="bn">অন্য ফোনের অগ্রগতি এখানে আনো</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
