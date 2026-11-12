import { useEffect } from 'react';
import { checkLesson, type CheckUnit } from '../lib/lessonCheck';
import { useAdminData } from './useAdminData';

/**
 * The lesson designer's check (docs/LEARNING_DESIGN.md): about 5 new words, each word seen often in the
 * lesson and its unit, and no word (or Arabic letter) that wasn't taught in this or an earlier lesson.
 * `stamp` changes after every save, so the check runs again.
 */
export function LessonCheck({ lessonId, lang, stamp, onUnauthorized }: { lessonId: string; lang: string; stamp: string; onUnauthorized: () => void }) {
  const { data, reload } = useAdminData<{ units: CheckUnit[] }>(`/course?lang=${lang}`, onUnauthorized);
  useEffect(reload, [stamp, reload]);
  const report = data && checkLesson(data.units, lessonId);
  if (!report) return null;
  const fewOrMany = report.words < 3 || report.words > 6;
  const ok = !fewOrMany && !report.untaught.length && report.exposure.every((w) => w.inUnit >= 15);
  return (
    <section className="ad-card ad-check" lang="bn">
      <div className="ad-section-head">
        <h2>
          লেসন চেক <em className={ok ? 'is-ok' : 'ad-warn'}>{ok ? 'সব ঠিক' : 'দেখো'}</em>
        </h2>
      </div>
      <p className={fewOrMany ? 'ad-warn' : 'ad-muted'}>
        নতুন শব্দ {report.words}টা {fewOrMany ? '· নিয়ম: একটা লেসনে ৫টা' : '· ঠিক আছে'}
      </p>
      {report.exposure.length > 0 && (
        <table className="ad-table">
          <thead>
            <tr>
              <th>শব্দ</th>
              <th>এই লেসনের বাক্যে</th>
              <th>পুরো ইউনিটে (১৫+)</th>
            </tr>
          </thead>
          <tbody>
            {report.exposure.map((w) => (
              <tr key={w.en}>
                <td lang="en">{w.en}</td>
                <td className={w.inLesson < 2 ? 'ad-warn' : ''}>{w.inLesson}</td>
                <td className={w.inUnit < 15 ? 'ad-warn' : ''}>{w.inUnit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="ad-muted">অ্যাপ নিজেও প্রতিটা নতুন শব্দ ছবি-বাছাই আর মেলানোতে ৬+ বার দেখায়; বাক্যে যত বেশি আসে, তত ভালো মনে থাকে।</p>
      {report.untaught.length > 0 ? (
        <div className="ad-warn">
          <strong>আগে শেখানো হয়নি</strong> (এই লেসনের শব্দে যোগ করো, বা বাক্য বদলাও):
          <ul className="ad-chips" lang="en">
            {report.untaught.map((p) => (
              <li key={p}>{p.replace(/^word /, '').replace(/^letter /, 'অক্ষর ')}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="ad-muted">সব শব্দ আগেই শেখানো হয়েছে।</p>
      )}
    </section>
  );
}
