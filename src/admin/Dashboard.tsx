import { LessonFunnel } from './LessonFunnel';
import { className, districtName } from './names';
import { useAdminData } from './useAdminData';

interface Summary {
  users: number;
  activeToday: number;
  activeWeek: number;
  totalXp: number;
  units: number;
  lessons: number;
  items: number;
  grammar: number;
  districts: { id: string; users: number; xp: number }[];
  classes: { id: string; users: number }[];
}

/** Headline numbers, the top districts by XP, learners by class, and the lesson funnel. */
export function Dashboard({ onUnauthorized }: { onUnauthorized: () => void }) {
  const { data, error } = useAdminData<Summary>('/summary', onUnauthorized);
  if (error) return <p className="ad-error">{error}</p>;
  if (!data) return <p className="ad-muted">Loading…</p>;

  const stats = [
    ['Learners', data.users],
    ['Active today', data.activeToday],
    ['Active this week', data.activeWeek],
    ['Total XP', data.totalXp],
    ['Units', data.units],
    ['Lessons', data.lessons],
    ['Content items', data.items],
    ['Grammar topics', data.grammar],
  ] as const;
  const topXp = Math.max(1, ...data.districts.map((d) => d.xp));
  const topClass = Math.max(1, ...data.classes.map((c) => c.users));

  return (
    <div className="ad-page">
      <header className="ad-head">
        <h1>
          Dashboard <span lang="bn">· ড্যাশবোর্ড</span>
        </h1>
      </header>

      <div className="ad-stats">
        {stats.map(([label, value]) => (
          <div key={label} className="ad-card ad-stat">
            <small>{label}</small>
            <strong>{value.toLocaleString()}</strong>
          </div>
        ))}
      </div>

      <div className="ad-two">
        <section className="ad-card">
          <h2>Top districts by XP</h2>
          <ul className="ad-bars">
            {data.districts.map((d) => (
              <li key={d.id}>
                <span>{districtName(d.id)}</span>
                <span className="ad-bar">
                  <i style={{ width: `${(100 * d.xp) / topXp}%` }} />
                </span>
                <em>
                  {d.xp} XP · {d.users}
                </em>
              </li>
            ))}
          </ul>
        </section>
        <section className="ad-card">
          <h2>Learners by class</h2>
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
