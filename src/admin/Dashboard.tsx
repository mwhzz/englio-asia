import { toBanglaDigits } from '../lib/bangla';
import { DailyStats } from './DailyStats';
import { LessonFunnel } from './LessonFunnel';
import { className, districtName } from './names';
import { useAdminData } from './useAdminData';
import { go } from './useHashRoute';
import { downloadCsv } from './csv';

interface Summary {
  users: number;
  activeToday: number;
  activeWeek: number;
  totalXp: number;
  units: number;
  lessons: number;
  items: number;
  grammar: number;
  openReports: number;
  newReports: number;
  crashesToday: number;
  stuckPayments: number;
  districts: { id: string; users: number; xp: number }[];
  classes: { id: string; users: number }[];
}

/** The owner's day at a glance: headline numbers, growth and retention (DailyStats), districts, classes and the lesson funnel. */
export function Dashboard({ onUnauthorized, owner = true }: { onUnauthorized: () => void; owner?: boolean }) {
  const { data, error } = useAdminData<Summary>('/summary', onUnauthorized);
  if (error) return <p className="ad-error">{error}</p>;
  if (!data) return <p className="ad-muted">লোড হচ্ছে…</p>;

  const stats = [
    ['শিক্ষার্থী', data.users],
    ['আজ সক্রিয়', data.activeToday],
    ['এই সপ্তাহে সক্রিয়', data.activeWeek],
    ['খোলা রিপোর্ট', data.openReports],
    ['মোট XP', data.totalXp],
    ['লেসন', data.lessons],
    ['কনটেন্ট', data.items],
    ['ব্যাকরণ টপিক', data.grammar],
  ] as const;
  const topXp = Math.max(1, ...data.districts.map((d) => d.xp));
  const topClass = Math.max(1, ...data.classes.map((c) => c.users));

  return (
    <div className="ad-page" lang="bn">
      <header className="ad-head">
        <h1>ড্যাশবোর্ড</h1>
      </header>

      {/* What needs the owner today, first (also on a phone). */}
      <section className="ad-card ad-today">
        <h2>আজ যা দেখতে হবে</h2>
        <div className="ad-stats is-small">
          <button className="ad-stat" onClick={() => go('reports')}>
            <small>নতুন রিপোর্ট</small>
            <strong className={data.newReports ? 'is-alert' : undefined}>{toBanglaDigits(data.newReports)}</strong>
          </button>
          <button className="ad-stat" onClick={() => go('errors')}>
            <small>২৪ ঘণ্টায় ক্র্যাশ</small>
            <strong className={data.crashesToday ? 'is-alert' : undefined}>{toBanglaDigits(data.crashesToday)}</strong>
          </button>
          <button className="ad-stat" onClick={() => owner && go('users')}>
            <small>আটকে থাকা পেমেন্ট</small>
            <strong className={data.stuckPayments ? 'is-alert' : undefined}>{toBanglaDigits(data.stuckPayments)}</strong>
          </button>
        </div>
        {owner && (
          <button className="ad-link" onClick={() => downloadCsv('/export/payments', 'englio-payments').catch((e: Error) => alert(e.message))}>
            সব পেমেন্ট CSV-তে নামাও
          </button>
        )}
      </section>

      <div className="ad-stats">
        {stats.map(([label, value]) => (
          <button key={label} className="ad-card ad-stat" onClick={label === 'খোলা রিপোর্ট' ? () => go('reports') : undefined}>
            <small>{label}</small>
            <strong>{toBanglaDigits(value.toLocaleString('en'))}</strong>
          </button>
        ))}
      </div>

      {owner && <DailyStats onUnauthorized={onUnauthorized} />}

      <div className="ad-two">
        <section className="ad-card">
          <h2>XP-তে সেরা জেলা</h2>
          <ul className="ad-bars">
            {data.districts.map((d) => (
              <li key={d.id}>
                <span>{districtName(d.id)}</span>
                <span className="ad-bar">
                  <i style={{ width: `${(100 * d.xp) / topXp}%` }} />
                </span>
                <em>
                  {d.xp} XP · {d.users} জন
                </em>
              </li>
            ))}
          </ul>
        </section>
        <section className="ad-card">
          <h2>ক্লাস অনুযায়ী শিক্ষার্থী</h2>
          <ul className="ad-bars">
            {data.classes.map((c) => (
              <li key={c.id}>
                <span>{className(c.id)}</span>
                <span className="ad-bar">
                  <i style={{ width: `${(100 * c.users) / topClass}%` }} />
                </span>
                <em>{c.users}</em>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <LessonFunnel onUnauthorized={onUnauthorized} />
    </div>
  );
}
