import { useState } from 'react';
import { Modal } from '../../components/Modal';
import { API_BASE } from '../../lib/api';
import { STORAGE_KEY } from '../../state/ProgressContext';
import { DEVICE_KEY, deviceId } from '../../state/useProgressSync';

/** Asks first, then erases everything about this learner: on the server and on this device. */
export function DeleteAccount({ onClose }: { onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function erase() {
    setBusy(true);
    setFailed(false);
    try {
      const res = await fetch(`${API_BASE}/users/${deviceId()}`, { method: 'DELETE' });
      // 404: the server never had this learner, which is fine.
      if (!res.ok && res.status !== 404) throw new Error();
    } catch {
      setBusy(false);
      return setFailed(true);
    }
    try {
      // Only this learner's data: the theme, the saved course and an admin's sign-in on this browser stay.
      for (const key of [STORAGE_KEY, DEVICE_KEY, 'englio-voice-hint-off', 'englio-lesson-resume']) localStorage.removeItem(key);
    } catch {
      // Storage blocked: nothing was saved here anyway.
    }
    location.reload();
  }

  return (
    <Modal onClose={onClose}>
      <h2 lang="bn">তোমার সব তথ্য মুছে ফেলবে?</h2>
      <p className="muted" lang="bn">
        নাম, জেলা, অগ্রগতি সব মুছে যাবে, এই ফোন থেকে আর আমাদের সার্ভার থেকেও। এটা আর ফেরানো যাবে না।
      </p>
      {failed && (
        <p className="muted" lang="bn" style={{ color: 'var(--ios-red)' }}>
          সার্ভারে পৌঁছানো গেল না। ইন্টারনেট চালু করে আবার চেষ্টা করো।
        </p>
      )}
      <div className="cta-stack">
        <button className="cta cta-red" onClick={erase} disabled={busy}>
          <span lang="bn">{busy ? 'মুছছে…' : 'সব মুছে ফেলো'}</span>
        </button>
        <button className="cta-text" onClick={onClose}>
          <span lang="bn">বাতিল</span>
        </button>
      </div>
    </Modal>
  );
}
