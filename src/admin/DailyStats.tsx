import { useState } from 'react';
import { toBanglaDigits } from '../lib/bangla';
import { useAdminData } from './useAdminData';

interface Stats {
  since: string;
  daily: { day: string; signups: number; active: number }[];
  retention: { after: number; cohort: number; back: number; rate: number | null }[];
  onboarding: { step: string; n: number }[];
  reminders: { subscribed: number; asked: number; said_yes: number; later: number; blocked: number; sent: number; opened: number; activeTodayWith: number; activeTodayWithout: number };
  plus: { active: number; paid: number; revenue: number; started: number };
  versions: { version: string; n: number }[];
  sources: { source: string; n: number }[];
  reminderVariants: { variant: string; sent: number; opened: number }[];
  activeWeek: number;
  activeMonth: number;
  crashes: { version: string; n: number; errors: number }[];
}

const STEP_BN: Record<string, string> = {
  welcome: 'স্বাগতম দেখেছে',
  district: 'জেলা বেছেছে',
  name: 'নাম দিয়েছে',
  class: 'ক্লাস বেছেছে',
  done: 'শেষ করেছে',
  'first-lesson': 'প্রথম লেসন শুরু',
};
const n = (v: number) => toBanglaDigits(v.toLocaleString('en'));
const pct = (a: number, b: number) => (b ? `${toBanglaDigits(Math.round((100 * a) / b))}%` : '—');

/** The owner's daily numbers (server/stats.ts): growth, retention, onboarding drop-off, reminders, Plus and app versions. */
export function DailyStats({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [days, setDays] = useState(30);
  const { data, error } = useAdminData<Stats>(`/stats?days=${days}`, onUnauthorized);
  if (error) return <p className="ad-error">{error}</p>;
  if (!data) return null;
  const top = Math.max(1, ...data.daily.map((d) => Math.max(d.active, d.signups)));
  const signups = data.daily.reduce((a, d) => a + d.signups, 0);
  const firstStep = Math.max(1, data.onboarding[0]?.n ?? 0);
  const r = data.reminders;
  const subscribedShare = r.subscribed;

  return (
    <>
      <section className="ad-card">
        <div className="ad-section-head">
          <h2>প্রতিদিন</h2>
          <span className="ad-seg" role="radiogroup" aria-label="Days">
            {[7, 30, 90].map((d) => (
              <button key={d} role="radio" aria-checked={days === d} className={days === d ? 'is-on' : ''} onClick={() => setDays(d)}>
                {toBanglaDigits(d)} দিন
              </button>
            ))}
          </span>
        </div>
        <p className="ad-muted">
          নতুন যোগ দিয়েছে {n(signups)} জন। ৭ দিনে শিখেছে {n(data.activeWeek)} জন, ৩০ দিনে {n(data.activeMonth)} জন
          {data.activeMonth ? ` (রোজ আসে ${pct(data.daily.at(-1)?.active ?? 0, data.activeMonth)})` : ''}। গাঢ় দাগ = সেদিন শিখেছে, হালকা = নতুন এসেছে।
        </p>
        <div className="ad-chart" role="img" aria-label="Active learners and sign-ups per day">
          {data.daily.map((d) => (
            <span key={d.day} className="ad-chart-day" title={`${d.day}: ${d.active} সক্রিয়, ${d.signups} নতুন`}>
              <i className="is-active" style={{ height: `${(100 * d.active) / top}%` }} />
              <i className="is-new" style={{ height: `${(100 * d.signups) / top}%` }} />
            </span>
          ))}
        </div>
        <div className="ad-chart-axis">
          <small>{data.daily[0]?.day}</small>
          <small>আজ</small>
        </div>
      </section>

      <div className="ad-two">
        <section className="ad-card">
          <h2>ফিরে আসছে কি? (রিটেনশন)</h2>
          <p className="ad-muted">যারা যোগ দিয়েছে, তাদের কতজন ১, ৭ আর ৩০ দিন পর আবার শিখেছে (গত ৯০ দিনে যোগ দেওয়া)।</p>
          <div className="ad-stats is-small">
            {data.retention.map((x) => (
              <div key={x.after} className="ad-stat">
                <small>দিন {toBanglaDigits(x.after)}</small>
                <strong>{x.rate === null ? '—' : `${toBanglaDigits(x.rate)}%`}</strong>
                <small>
                  {n(x.back)}/{n(x.cohort)}
                </small>
              </div>
            ))}
          </div>
        </section>
        <section className="ad-card">
          <h2>শুরুর ধাপে কে কোথায় থামছে</h2>
          <ul className="ad-bars">
            {data.onboarding.map((s) => (
              <li key={s.step}>
                <span>{STEP_BN[s.step] ?? s.step}</span>
                <span className="ad-bar">
                  <i style={{ width: `${(100 * s.n) / firstStep}%` }} />
                </span>
                <em>
                  {n(s.n)} · {pct(s.n, firstStep)}
                </em>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="ad-two">
        <section className="ad-card">
          <h2>রিমাইন্ডার</h2>
          <dl className="ad-dl">
            <div>
              <dt>চালু আছে</dt>
              <dd>{n(subscribedShare)} জন</dd>
            </div>
            <div>
              <dt>জিজ্ঞেস করা হয়েছে → হ্যাঁ</dt>
              <dd>
                {n(r.asked)} → {n(r.said_yes)} ({pct(r.said_yes, r.asked)}) · পরে {n(r.later)} · ব্লক {n(r.blocked)}
              </dd>
            </div>
            <div>
              <dt>পাঠানো → খুলেছে</dt>
              <dd>
                {n(r.sent)} → {n(r.opened)} ({pct(r.opened, r.sent)})
              </dd>
            </div>
            <div>
              <dt>আজ শিখেছে</dt>
              <dd>
                রিমাইন্ডার আছে {n(r.activeTodayWith)} জন · নেই {n(r.activeTodayWithout)} জন
              </dd>
            </div>
          </dl>
          {data.reminderVariants.length > 0 && (
            <ul className="ad-bars">
              {data.reminderVariants.map((v) => (
                <li key={v.variant}>
                  <span>{v.variant}</span>
                  <em>
                    {n(v.sent)} → {n(v.opened)} ({pct(v.opened, v.sent)})
                  </em>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="ad-card">
          <h2>Englio Plus</h2>
          <dl className="ad-dl">
            <div>
              <dt>এখন Plus</dt>
              <dd>{n(data.plus.active)} জন</dd>
            </div>
            <div>
              <dt>পেমেন্ট শুরু → সফল</dt>
              <dd>
                {n(data.plus.started)} → {n(data.plus.paid)} ({pct(data.plus.paid, data.plus.started)})
              </dd>
            </div>
            <div>
              <dt>আয়</dt>
              <dd>৳{n(data.plus.revenue)}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="ad-card">
        <h2>নতুনরা কোথা থেকে এল</h2>
        <p className="ad-muted">লিংকে ?utm_source=facebook&utm_campaign=launch দিলে এখানে আলাদা দেখাবে।</p>
        <ul className="ad-bars">
          {data.sources.map((x) => (
            <li key={x.source}>
              <span>{x.source}</span>
              <em>{n(x.n)} জন</em>
            </li>
          ))}
          {!data.sources.length && <li className="ad-empty">এখনো কেউ আসেনি।</li>}
        </ul>
      </section>

      <div className="ad-two">
        <section className="ad-card">
          <h2>অ্যাপ ভার্সন (এই সপ্তাহে)</h2>
          <ul className="ad-bars">
            {data.versions.map((v) => (
              <li key={v.version}>
                <span>v{v.version}</span>
                <em>{n(v.n)} জন</em>
              </li>
            ))}
            {!data.versions.length && <li className="ad-empty">এখনো কিছু নেই।</li>}
          </ul>
        </section>
        <section className="ad-card">
          <h2>ক্র্যাশ, ভার্সন অনুযায়ী</h2>
          <ul className="ad-bars">
            {data.crashes.map((c) => (
              <li key={c.version}>
                <span>v{c.version}</span>
                <em>
                  {n(c.n)} বার · {n(c.errors)} রকম
                </em>
              </li>
            ))}
            {!data.crashes.length && <li className="ad-empty">কোনো ক্র্যাশ নেই।</li>}
          </ul>
        </section>
      </div>
    </>
  );
}
