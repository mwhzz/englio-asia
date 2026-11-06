import { useState } from 'react';
import { adminApi } from './adminApi';
import { useAdminData } from './useAdminData';

interface Group {
  place: string;
  question: string;
  n: number;
  lastAt: string;
  items: { id: number; reason: string; answer: string; note: string; version: string | null; device: string | null }[];
}

const REASONS: Record<string, string> = {
  'wrong-answer': 'আমার উত্তরটাও ঠিক ছিল',
  mistake: 'প্রশ্ন বা উত্তরে ভুল',
  audio: 'অডিও / উচ্চারণ',
  unclear: 'বোঝা যাচ্ছে না',
  other: 'অন্য কিছু',
};

/** The same lesson question reported by many learners, most-reported first. Fix the lesson, then mark it fixed: each learner is told. */
export function ContentReports({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [done, setDone] = useState(false);
  const { data, error, reload } = useAdminData<Group[]>(`/reports${done ? '?status=done' : ''}`, onUnauthorized);
  if (error) return <p className="ad-error">{error}</p>;
  if (!data) return <p className="ad-muted">লোড হচ্ছে…</p>;

  return (
    <>
      <div className="ad-row ad-filters">
        <span className="ad-seg" role="radiogroup" aria-label="Open or fixed">
          <button role="radio" aria-checked={!done} className={!done ? 'is-on' : ''} onClick={() => setDone(false)}>
            খোলা
          </button>
          <button role="radio" aria-checked={done} className={done ? 'is-on' : ''} onClick={() => setDone(true)}>
            ঠিক করা
          </button>
        </span>
      </div>
      <p className="ad-muted">একই প্রশ্ন অনেকে জানালে একটা সারি। লেসনটা ঠিক করো, তারপর "ঠিক করেছি" চাপো: যারা জানিয়েছিল সবাই অ্যাপে উত্তর পাবে।</p>
      <section className="ad-card">
        <ul className="ad-list">
          {data.map((r) => (
            <li key={r.place + r.question} className="ad-item ad-report">
              <span className="ad-item-open">
                <strong>{r.question}</strong>
                <small>
                  {r.n} জন · {r.place} · শেষ {new Date(r.lastAt).toLocaleDateString()}
                </small>
                <ul className="ad-report-items">
                  {r.items.slice(0, 5).map((i) => (
                    <li key={i.id}>
                      {REASONS[i.reason] ?? i.reason}
                      {i.answer && <> · উত্তর “{i.answer}”</>}
                      {i.note && <> · “{i.note}”</>}
                      {i.version && <> · v{i.version}</>}
                    </li>
                  ))}
                </ul>
              </span>
              {!done && (
                <button
                  className="ad-btn is-small"
                  onClick={() =>
                    adminApi('POST', '/reports/close', { where: r.place, question: r.question })
                      .then(reload)
                      .catch((e: Error) => alert(e.message))
                  }
                >
                  ঠিক করেছি
                </button>
              )}
            </li>
          ))}
          {!data.length && <li className="ad-empty">{done ? 'এখনো কিছু ঠিক করা হয়নি।' : 'কোনো খোলা রিপোর্ট নেই।'}</li>}
        </ul>
      </section>
    </>
  );
}
