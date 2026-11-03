import { adminApi } from './adminApi';
import { ago, className, districtName } from './names';
import { useAdminData } from './useAdminData';
import { go } from './useHashRoute';

interface UserData {
  id: string;
  name: string | null;
  district_id: string | null;
  class_id: string | null;
  xp: number;
  streak: number;
  lessons_done: number;
  joined_at: string | null;
  last_seen: string;
  progress: { completed?: Record<string, number>; xpByDay?: Record<string, number>; hearts?: number; dailyGoal?: number };
}

/** One learner: profile, numbers, finished lessons and the last days' XP. */
export function UserPage({ id, onUnauthorized }: { id: string; onUnauthorized: () => void }) {
  const { data: user, error } = useAdminData<UserData>(`/users/${id}`, onUnauthorized);
  if (error) return <p className="ad-error">{error}</p>;
  if (!user) return <p className="ad-muted">Loading…</p>;

  const days = Object.entries(user.progress.xpByDay ?? {}).sort(([a], [b]) => b.localeCompare(a)).slice(0, 14);
  const rows = [
    ['District', districtName(user.district_id)],
    ['Class', className(user.class_id)],
    ['XP', user.xp],
    ['Streak', `${user.streak} days`],
    ['Lessons done', user.lessons_done],
    ['Daily goal', `${user.progress.dailyGoal ?? '—'} XP`],
    ['Hearts', user.progress.hearts ?? '—'],
    ['Joined', user.joined_at ?? '—'],
    ['Last seen', ago(user.last_seen)],
    ['Device id', user.id],
  ];

  return (
    <div className="ad-page">
      <button className="ad-link" onClick={() => go('users')}>
        ← All learners
      </button>
      <header className="ad-head">
        <h1>{user.name ?? 'No name'}</h1>
        <button
          className="ad-btn is-danger"
          onClick={() => confirm('Delete this learner’s data?') && adminApi('DELETE', `/users/${id}`).then(() => go('users'))}
        >
          Delete
        </button>
      </header>

      <div className="ad-two">
        <section className="ad-card">
          <dl className="ad-dl">
            {rows.map(([label, value]) => (
              <div key={label as string}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="ad-card">
          <h2>Finished lessons</h2>
          <ul className="ad-chips">
            {Object.entries(user.progress.completed ?? {}).map(([lesson, times]) => (
              <li key={lesson}>
                {lesson} <em>×{times}</em>
              </li>
            ))}
          </ul>
          <h2>XP by day</h2>
          <ul className="ad-chips">
            {days.map(([day, xp]) => (
              <li key={day}>
                {day} <em>{xp} XP</em>
              </li>
            ))}
            {!days.length && <li className="ad-empty">No activity yet.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
