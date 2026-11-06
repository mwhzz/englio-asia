import { toBanglaDigits } from '../../lib/bangla';

export interface MyReport {
  id: number;
  at: string;
  place: string;
  question: string;
  kind: string;
  status: 'new' | 'doing' | 'fixed' | 'closed';
  reply: string;
}

const STATUS: Record<MyReport['status'], string> = {
  new: 'পাঠানো হয়েছে',
  doing: 'দেখা হচ্ছে',
  fixed: 'ঠিক করা হয়েছে',
  closed: 'বন্ধ',
};

const date = (iso: string) => {
  const d = new Date(iso);
  return `${toBanglaDigits(d.getDate())}/${toBanglaDigits(d.getMonth() + 1)}`;
};

/** The learner's own reports, newest first, with where each one stands and the team's reply. */
export function MyReports({ reports }: { reports: MyReport[] }) {
  return (
    <section className="pf-section is-plain">
      <h2 className="pf-list-title">
        <span lang="bn">আমার জানানো সমস্যা</span> <small>My reports</small>
      </h2>
      <ul className="pf-list hp-mine">
        {reports.map((r) => (
          <li key={r.id} className="hp-report">
            <div className="hp-report-top">
              <span className={`hp-status is-${r.status}`} lang="bn">
                {STATUS[r.status] ?? r.status}
              </span>
              <small>{date(r.at)}</small>
            </div>
            <p className="hp-report-text">{r.question}</p>
            {r.reply && (
              <p className="hp-reply" lang="bn">
                <strong>Englio:</strong> {r.reply}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
