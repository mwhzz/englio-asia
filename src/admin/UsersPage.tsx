import { useState } from 'react';
import { ago, className, districtName } from './names';
import { useAdminData } from './useAdminData';
import { go } from './useHashRoute';

interface UserRow {
  id: string;
  name: string | null;
  districtId: string | null;
  classId: string | null;
  xp: number;
  streak: number;
  lessonsDone: number;
  joinedAt: string | null;
  lastSeen: string;
}

const SORTS = [
  ['seen', 'Last seen'],
  ['xp', 'XP'],
  ['joined', 'Joined'],
  ['name', 'Name'],
] as const;

/** All learners, searchable by name and sortable; a row opens the learner. */
export function UsersPage({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<string>('seen');
  const { data: users, error } = useAdminData<UserRow[]>(`/users?sort=${sort}&q=${encodeURIComponent(q)}`, onUnauthorized);

  return (
    <div className="ad-page">
      <header className="ad-head">
        <h1>
          Learners <span lang="bn">· শিক্ষার্থী</span>
        </h1>
      </header>
      <div className="ad-row ad-tools">
        <input className="ad-input" placeholder="Search by name" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="ad-input" value={sort} onChange={(e) => setSort(e.target.value)}>
          {SORTS.map(([key, label]) => (
            <option key={key} value={key}>
              Sort: {label}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="ad-error">{error}</p>}

      <div className="ad-card ad-table-wrap">
        <table className="ad-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>District</th>
              <th>Class</th>
              <th className="num">XP</th>
              <th className="num">Streak</th>
              <th className="num">Lessons</th>
              <th>Last seen</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => (
              <tr key={u.id} onClick={() => go('user', u.id)}>
                <td>{u.name ?? '—'}</td>
                <td>{districtName(u.districtId)}</td>
                <td>{className(u.classId)}</td>
                <td className="num">{u.xp}</td>
                <td className="num">{u.streak}</td>
                <td className="num">{u.lessonsDone}</td>
                <td>{ago(u.lastSeen)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users && !users.length && <p className="ad-empty">No learners found.</p>}
      </div>
    </div>
  );
}
