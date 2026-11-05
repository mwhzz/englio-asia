import { useEffect, useState } from 'react';
import { Modal } from '../../components/Modal';
import { refreshPlus } from '../../lib/premium';

const MESSAGES = {
  ok: ['Englio Plus চালু হয়েছে!', 'এখন থেকে ভুল করলেও হার্ট কমবে না। মন খুলে শেখো।'],
  failed: ['পেমেন্ট হয়নি', 'bKash-এ টাকা কাটেনি। চাইলে আবার চেষ্টা করো।'],
  cancelled: ['পেমেন্ট বাতিল', 'কিছু কাটা হয়নি। পরে যেকোনো সময় নেওয়া যাবে।'],
} as const;

/** After bKash sends the learner back (#premium=ok / failed / cancelled): confirm with the server and say how it went. */
export function PlusReturn() {
  const [result] = useState(() => {
    const m = location.hash.match(/^#premium=(ok|failed|cancelled)$/);
    return (m?.[1] as keyof typeof MESSAGES | undefined) ?? null;
  });
  const [open, setOpen] = useState(!!result);

  useEffect(() => {
    if (!result) return;
    history.replaceState(null, '', location.pathname + location.search);
    refreshPlus();
  }, [result]);

  if (!result || !open) return null;
  const [title, text] = MESSAGES[result];
  return (
    <Modal onClose={() => setOpen(false)}>
      <h2 lang="bn">{title}</h2>
      <p className="muted" lang="bn">
        {text}
      </p>
      <button className="cta" onClick={() => setOpen(false)}>
        <span lang="bn">ঠিক আছে</span>
      </button>
    </Modal>
  );
}
