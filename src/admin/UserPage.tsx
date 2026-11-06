import { toBanglaDigits } from '../lib/bangla';
import { adminApi } from './adminApi';
import { ago, className, districtName } from './names';
import { STATUS_BN, KIND_BN } from './reportLabels';
import { UserActions } from './UserActions';
import { useAdminData } from './useAdminData';
import { go } from './useHashRoute';

export interface UserData {
  id: string;
  name: string | null;
  district_id: string | null;
  class_id: string | null;
  xp: number;
  streak: number;
  lessons_done: number;
  joined_at: string | null;
  last_seen: string;
  blocked: number;
  app_version: string | null;
  device: string | null;
  plusUntil: string | null;
  backupCode: string | null;
  reminder: { hour: number; timeZone: string } | null;
  accounts: { kind: string; subject: string; label: string | null }[];
  payments: { id: string; amount: number; status: string; trxId: string | null; at: string }[];
  reports: { id: number; at: string; question: string; kind: string; status: string; reply: string }[];
  progress: {
    completed?: Record<string, number>;
    xpByDay?: Record<string, number>;
    hearts?: number;
    dailyGoal?: number;
    streakFreezes?: number;
    lastActiveDay?: string | null;
  };
}

const date = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleDateString() : '—');

/** One learner end to end: who, their numbers, Plus and payments, sign-ins, reminder, reports, and fixes (UserActions). */
export function UserPage({ id, onUnauthorized }: { id: string; onUnauthorized: () => void }) {
  const { data: user, error, reload } = useAdminData<UserData>(`/users/${id}`, onUnauthorized);
  if (error) return <p className="ad-error">{error}</p>;
  if (!user) return <p className="ad-muted">লোড হচ্ছে…</p>;

  const days = Object.entries(user.progress.xpByDay ?? {}).sort(([a], [b]) => b.localeCompare(a)).slice(0, 14);
  const rows: [string, React.ReactNode][] = [
    ['জেলা', districtName(user.district_id)],
    ['ক্লাস', className(user.class_id)],
    ['XP', user.xp],
    ['স্ট্রিক', `${user.streak} দিন (শেষ শিখেছে ${user.progress.lastActiveDay ?? '—'})`],
    ['ফ্রিজ', user.progress.streakFreezes ?? 0],
    ['শেষ করা লেসন', user.lessons_done],
    ['দৈনিক লক্ষ্য', `${user.progress.dailyGoal ?? '—'} XP`],
    ['হার্ট', user.progress.hearts ?? '—'],
    ['Plus', user.plusUntil ? `${date(user.plusUntil)} পর্যন্ত` : 'নেই'],
    ['যোগ দিয়েছে', date(user.joined_at)],
    ['শেষ দেখা', ago(user.last_seen)],
    ['ফোন', user.device ?? '—'],
    ['অ্যাপ ভার্সন', user.app_version ?? '—'],
    ['রিমাইন্ডার', user.reminder ? `চালু, ${user.reminder.hour}টায় (${user.reminder.timeZone})` : 'বন্ধ'],
    ['ব্যাকআপ কোড', user.backupCode ? `${user.backupCode.slice(0, 5)}-${user.backupCode.slice(5)}` : 'বানায়নি'],
    ['সাইন ইন', user.accounts.length ? user.accounts.map((a) => (a.kind === 'phone' ? a.subject : a.label || 'Google')).join(', ') : 'নেই'],
    ['ডিভাইস আইডি', <code key="id">{user.id}</code>],
  ];

  async function exportData() {
    const data = await adminApi('GET', `/users/${id}/export`);
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `englio-learner-${id}.json` });
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="ad-page" lang="bn">
      <button className="ad-link" onClick={() => go('users')}>
        ← সব শিক্ষার্থী
      </button>
      <header className="ad-head">
        <h1>
          {user.name ?? 'নাম নেই'} {user.blocked ? <span className="ad-pill is-bad">ব্লক করা</span> : null}
          {user.plusUntil && <span className="ad-pill is-ok">Plus</span>}
        </h1>
        <span className="ad-row">
          <button className="ad-btn" onClick={() => exportData().catch((e: Error) => alert(e.message))}>
            ডেটা নামাও
          </button>
          <button
            className="ad-btn is-danger"
            onClick={() =>
              confirm('এই শিক্ষার্থীর সব তথ্য (অগ্রগতি, পেমেন্ট, সাইন ইন) মুছে ফেলবে? ফেরানো যাবে না।') &&
              adminApi('DELETE', `/users/${id}`)
                .then(() => go('users'))
                .catch((e: Error) => alert(e.message))
            }
          >
            মুছে ফেলো
          </button>
        </span>
      </header>

      <UserActions user={user} onDone={reload} />

      <div className="ad-two">
        <section className="ad-card">
          <dl className="ad-dl">
            {rows.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="ad-card">
          <h2>রিপোর্ট</h2>
          <ul className="ad-list">
            {user.reports.map((r) => (
              <li key={r.id} className="ad-item">
                <span className="ad-item-open">
                  <span className="ad-ticket-top">
                    <span className={`ad-pill is-${r.status}`}>{STATUS_BN[r.status] ?? r.status}</span>
                    <span className="ad-pill">{KIND_BN[r.kind] ?? r.kind}</span>
                    <small>{ago(r.at)}</small>
                  </span>
                  <strong>{r.question}</strong>
                  {r.reply && <small>উত্তর: {r.reply}</small>}
                </span>
              </li>
            ))}
            {!user.reports.length && <li className="ad-empty">কোনো রিপোর্ট নেই।</li>}
          </ul>
          {user.reports.length > 0 && (
            <button className="ad-link" onClick={() => go('reports')}>
              রিপোর্ট পেজে উত্তর দাও →
            </button>
          )}
          <h2>পেমেন্ট</h2>
          <ul className="ad-chips">
            {user.payments.map((p) => (
              <li key={p.id}>
                {date(p.at)} · ৳{toBanglaDigits(p.amount)} · <em>{p.status}</em>
                {p.trxId && ` · ${p.trxId}`}
              </li>
            ))}
            {!user.payments.length && <li className="ad-empty">কোনো পেমেন্ট নেই।</li>}
          </ul>
          <h2>শেষ করা লেসন</h2>
          <ul className="ad-chips">
            {Object.entries(user.progress.completed ?? {}).map(([lesson, times]) => (
              <li key={lesson}>
                {lesson} <em>×{times}</em>
              </li>
            ))}
          </ul>
          <h2>দিনে XP</h2>
          <ul className="ad-chips">
            {days.map(([day, xp]) => (
              <li key={day}>
                {day} <em>{xp} XP</em>
              </li>
            ))}
            {!days.length && <li className="ad-empty">এখনো কিছু শেখেনি।</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
