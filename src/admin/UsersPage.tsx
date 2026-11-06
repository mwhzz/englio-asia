import { useState } from 'react';
import { toBanglaDigits } from '../lib/bangla';
import { ago, className, districtName } from './names';
import { useAdminData } from './useAdminData';
import { useDebounced } from './useDebounced';
import { go } from './useHashRoute';
import { downloadCsv } from './csv';

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
  blocked: number;
  version: string | null;
}

const SORTS = [
  ['seen', 'শেষ দেখা'],
  ['xp', 'XP'],
  ['joined', 'যোগ দিয়েছে'],
  ['name', 'নাম'],
] as const;

const FILTERS = [
  ['', 'সবাই'],
  ['plus', 'Plus'],
  ['reminder', 'রিমাইন্ডার চালু'],
  ['blocked', 'ব্লক করা'],
] as const;

/**
 * Every learner, 50 at a time. Find one by name, device id, backup code, phone number (the last digits) or
 * Google email (what a learner can tell support); a row opens everything about them.
 */
export function UsersPage({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<string>('seen');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(0);
  const query = useDebounced(q.trim());
  const { data, error } = useAdminData<{ users: UserRow[]; total: number; page: number; pageSize: number }>(
    `/users?sort=${sort}&filter=${filter}&page=${page}&q=${encodeURIComponent(query)}`,
    onUnauthorized,
  );
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="ad-page" lang="bn">
      <header className="ad-head">
        <h1>শিক্ষার্থী</h1>
        <span className="ad-row">
          {data && <span className="ad-pill">{toBanglaDigits(data.total)} জন</span>}
          <button className="ad-btn" onClick={() => downloadCsv('/export/users', 'englio-learners').catch((e: Error) => alert(e.message))}>
            CSV নামাও
          </button>
        </span>
      </header>
      <div className="ad-row ad-tools">
        <input
          className="ad-input"
          placeholder="নাম, ব্যাকআপ কোড, ফোন নম্বর, ডিভাইস আইডি বা ইমেইল"
          value={q}
          onChange={(e) => (setQ(e.target.value), setPage(0))}
        />
        <select className="ad-input" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="সাজাও">
          {SORTS.map(([key, label]) => (
            <option key={key} value={key}>
              সাজাও: {label}
            </option>
          ))}
        </select>
      </div>
      <div className="ad-row ad-filters">
        <span className="ad-seg" role="radiogroup" aria-label="Filter">
          {FILTERS.map(([id, bn]) => (
            <button key={id} role="radio" aria-checked={filter === id} className={filter === id ? 'is-on' : ''} onClick={() => (setFilter(id), setPage(0))}>
              {bn}
            </button>
          ))}
        </span>
      </div>
      {error && <p className="ad-error">{error}</p>}

      <div className="ad-card ad-table-wrap">
        <table className="ad-table ad-users">
          <thead>
            <tr>
              <th>নাম</th>
              <th>জেলা</th>
              <th>ক্লাস</th>
              <th className="num">XP</th>
              <th className="num">স্ট্রিক</th>
              <th className="num">লেসন</th>
              <th>শেষ দেখা</th>
            </tr>
          </thead>
          <tbody>
            {data?.users.map((u) => (
              <tr key={u.id} onClick={() => go('user', u.id)}>
                <td data-label="নাম">
                  {u.name ?? '—'} {u.blocked ? <span className="ad-pill is-bad">ব্লক</span> : null}
                </td>
                <td data-label="জেলা">{districtName(u.districtId)}</td>
                <td data-label="ক্লাস">{className(u.classId)}</td>
                <td data-label="XP" className="num">
                  {u.xp}
                </td>
                <td data-label="স্ট্রিক" className="num">
                  {u.streak}
                </td>
                <td data-label="লেসন" className="num">
                  {u.lessonsDone}
                </td>
                <td data-label="শেষ দেখা">{ago(u.lastSeen)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && !data.users.length && <p className="ad-empty">কাউকে পাওয়া যায়নি।</p>}
      </div>
      {pages > 1 && (
        <div className="ad-row ad-pager">
          <button className="ad-btn is-small" disabled={page === 0} onClick={() => setPage(page - 1)}>
            ← আগের
          </button>
          <span className="ad-muted">
            পাতা {toBanglaDigits(page + 1)} / {toBanglaDigits(pages)}
          </span>
          <button className="ad-btn is-small" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>
            পরের →
          </button>
        </div>
      )}
    </div>
  );
}
