import { useState } from 'react';
import { ago } from './names';
import { KIND_BN, STATUS_BN } from './reportLabels';
import { go } from './useHashRoute';

export interface Ticket {
  id: number;
  at: string;
  place: string;
  question: string;
  answer: string;
  reason: string;
  note: string;
  kind: string;
  status: 'new' | 'doing' | 'fixed' | 'closed';
  reply: string;
  assignee: string | null;
  handledBy: string | null;
  updatedAt: string | null;
  userId: string | null;
  userName: string | null;
  version: string | null;
  device: string | null;
  contact: string;
}

const REPLIES = [
  'ধন্যবাদ! ঠিক করে দিয়েছি। অ্যাপটা একবার বন্ধ করে আবার খোলো।',
  'ধন্যবাদ, আমরা দেখছি। ঠিক হলে এখানেই জানাব।',
  'তোমার স্ট্রিক / অগ্রগতি ফিরিয়ে দিয়েছি।',
];

/** One report: what the learner wrote, who and on which phone, and the admin's status, owner and reply. */
export function TicketRow({ ticket: t, team, onSave }: { ticket: Ticket; team: string[]; onSave: (change: Partial<Ticket>) => void }) {
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState(t.reply);

  return (
    <li className={`ad-item ad-ticket is-${t.status}`}>
      <button className="ad-item-open" onClick={() => setOpen(!open)}>
        <span className="ad-ticket-top">
          <span className={`ad-pill is-${t.status}`}>{STATUS_BN[t.status]}</span>
          <span className="ad-pill">{KIND_BN[t.kind] ?? t.kind}</span>
          <small>
            {ago(t.at)}
            {t.place !== 'help' ? ` · ${t.place}` : ''}
          </small>
        </span>
        <strong className="ad-ticket-text">{t.question}</strong>
        {(t.answer || t.note) && (
          <small>
            {t.answer && <>উত্তর দিয়েছিল “{t.answer}” · </>}
            {t.note}
          </small>
        )}
        <small>
          {t.userName ?? 'নাম নেই'} · {t.device ?? 'ফোন জানা নেই'} · v{t.version ?? '?'}
          {t.contact && ` · যোগাযোগ: ${t.contact}`}
          {t.assignee && ` · দেখছে: ${t.assignee}`}
        </small>
      </button>

      {open && (
        <div className="ad-ticket-edit">
          <div className="ad-row">
            <select className="ad-input" value={t.status} onChange={(e) => onSave({ status: e.target.value as Ticket['status'] })} aria-label="অবস্থা">
              {Object.entries(STATUS_BN).map(([k, bn]) => (
                <option key={k} value={k}>
                  {bn}
                </option>
              ))}
            </select>
            <select className="ad-input" value={t.kind} onChange={(e) => onSave({ kind: e.target.value })} aria-label="ধরন">
              {Object.entries(KIND_BN).map(([k, bn]) => (
                <option key={k} value={k}>
                  {bn}
                </option>
              ))}
            </select>
            <select className="ad-input" value={t.assignee ?? ''} onChange={(e) => onSave({ assignee: e.target.value })} aria-label="কে দেখবে">
              <option value="">কেউ না</option>
              <option value="Owner">Owner</option>
              {team.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            {t.userId && (
              <button className="ad-btn is-small" onClick={() => go('user', t.userId!)}>
                শিক্ষার্থী দেখো →
              </button>
            )}
          </div>
          <textarea className="ad-input" rows={3} maxLength={1000} placeholder="শিক্ষার্থীকে উত্তর (অ্যাপের সাহায্য পেজে দেখবে)" value={reply} onChange={(e) => setReply(e.target.value)} />
          <div className="ad-row ad-quick">
            {REPLIES.map((r) => (
              <button key={r} className="ad-btn is-small" onClick={() => setReply(r)}>
                {r.slice(0, 22)}…
              </button>
            ))}
          </div>
          <div className="ad-row">
            <button className="ad-btn is-primary" disabled={reply === t.reply} onClick={() => onSave({ reply })}>
              উত্তর পাঠাও
            </button>
            <button className="ad-btn" disabled={!reply.trim()} onClick={() => onSave({ reply, status: 'fixed' })}>
              উত্তর দিয়ে "ঠিক হয়েছে"
            </button>
          </div>
          {t.handledBy && (
            <small className="ad-muted">
              শেষ বদলেছে {t.handledBy}
              {t.updatedAt ? `, ${ago(t.updatedAt)}` : ''}
            </small>
          )}
        </div>
      )}
    </li>
  );
}
