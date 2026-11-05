import { useState } from 'react';
import { Modal } from '../../components/Modal';
import { API_BASE } from '../../lib/api';
import { haptic } from '../../lib/haptics';

const REASONS = [
  ['wrong-answer', 'আমার উত্তরটাও ঠিক ছিল'],
  ['mistake', 'প্রশ্ন বা উত্তরে ভুল আছে'],
  ['audio', 'উচ্চারণ বা অডিও ঠিক নেই'],
  ['unclear', 'বোঝা যাচ্ছে না'],
  ['other', 'অন্য কিছু'],
] as const;

interface Props {
  /** Where in the app, e.g. "lesson:u1-l2" or "story:rainy-day". */
  where: string;
  /** The question as the learner saw it. */
  question: string;
  /** What the learner answered, if anything. */
  answer?: string;
}

/** "This question is wrong": a small button under the answer that sends a report to the admin. */
export function ReportButton({ where, question, answer }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(REASONS[0][0]);
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);

  async function send() {
    haptic();
    await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ where, question, answer, reason, note }),
    }).catch(() => undefined);
    setSent(true);
    setTimeout(() => setOpen(false), 1200);
  }

  if (sent && !open) {
    return (
      <span className="rp-sent" lang="bn">
        ধন্যবাদ, জানানো হয়েছে
      </span>
    );
  }

  return (
    <>
      <button type="button" className="rp-btn" onClick={() => setOpen(true)}>
        <span lang="bn">সমস্যা জানাও</span>
      </button>
      {open && (
        <Modal onClose={() => setOpen(false)}>
          <div className="rp">
            <h2 lang="bn">কী সমস্যা?</h2>
            <p className="muted rp-q">{question}</p>
            <div className="rp-reasons" role="radiogroup">
              {REASONS.map(([id, bn]) => (
                <button key={id} type="button" role="radio" aria-checked={reason === id} className={`rp-reason${reason === id ? ' is-on' : ''}`} onClick={() => setReason(id)}>
                  <span lang="bn">{bn}</span>
                </button>
              ))}
            </div>
            <textarea className="rp-note" lang="bn" rows={2} maxLength={300} placeholder="চাইলে একটু লিখে দাও (না দিলেও চলবে)" value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="cta-stack">
              <button className="cta" onClick={send} disabled={sent}>
                <span lang="bn">{sent ? 'ধন্যবাদ!' : 'পাঠাও'}</span>
              </button>
              <button className="cta-text" onClick={() => setOpen(false)}>
                <span lang="bn">বাতিল</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
