import { useEffect, useState } from 'react';
import { FEATURES, type AppSettings, type FeatureId } from '../data/appSettings';
import { toBanglaDigits } from '../lib/bangla';
import { adminApi } from './adminApi';
import { useAdminData } from './useAdminData';
import { SettingsMessages } from './SettingsMessages';

interface UnitRow {
  id: string;
  title: string;
  titleBn: string;
  color: string;
}

/** The settings themselves (without what the server adds, like paymentsReady). */
const pick = (d: AppSettings): AppSettings => ({
  features: d.features,
  lockedUnits: d.lockedUnits,
  plus: d.plus,
  appUnitsFree: d.appUnitsFree,
  notice: d.notice,
  maintenance: d.maintenance,
  minVersion: d.minVersion,
});

/**
 * The owner's switches for the whole app: features on or off, which units need Englio Plus, and the Plus
 * plan. Apps pick the change up the next time they open (it travels with the course), no new APK needed.
 */
export function SettingsPage({ onUnauthorized }: { onUnauthorized: () => void }) {
  const { data, error, reload } = useAdminData<AppSettings & { paymentsReady: boolean }>('/settings', onUnauthorized);
  const { data: units } = useAdminData<UnitRow[]>('/units', onUnauthorized);
  const [draft, setDraft] = useState<AppSettings | null>(null);
  const [freeCount, setFreeCount] = useState(3);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setDraft(pick(data));
  }, [data]);

  if (error) return <p className="ad-error">{error}</p>;
  if (!data || !draft || !units) return <p className="ad-muted">লোড হচ্ছে…</p>;

  const saved = JSON.stringify(pick(data));
  const dirty = JSON.stringify(draft) !== saved;
  const change = (next: AppSettings) => {
    setDraft(next);
    setStatus(null);
  };
  const setFeature = (id: FeatureId, on: boolean) => change({ ...draft, features: { ...draft.features, [id]: on } });
  const setLocked = (unitId: string, locked: boolean) =>
    change({ ...draft, lockedUnits: locked ? [...draft.lockedUnits, unitId] : draft.lockedUnits.filter((u) => u !== unitId) });

  async function save() {
    setSaving(true);
    try {
      await adminApi('PUT', '/settings', draft);
      setStatus({ ok: true, text: 'সেভ হয়েছে। সবার অ্যাপে পরের বার খোলার সময় চালু হবে।' });
      reload();
    } catch (err) {
      setStatus({ ok: false, text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  const lockedButNoSale = draft.lockedUnits.length > 0 && (!data.paymentsReady || !draft.features.plus);

  return (
    <div className="ad-page">
      <header className="ad-head">
        <h1 lang="bn">সেটিংস</h1>
        <button className="ad-btn is-primary" onClick={save} disabled={!dirty || saving}>
          {saving ? 'সেভ হচ্ছে…' : 'সেভ করো'}
        </button>
      </header>
      <p className="ad-muted" lang="bn">
        এখানে যা বদলাবে, সবার অ্যাপে পরের বার খোলার সময় চালু হবে। নতুন APK লাগবে না।
      </p>
      {status && <p className={status.ok ? 'ad-ok' : 'ad-error'}>{status.text}</p>}

      <SettingsMessages draft={draft} onChange={change} />

      <section className="ad-card">
        <div className="ad-section-head">
          <h2 lang="bn">ফিচার চালু/বন্ধ</h2>
        </div>
        <div className="ad-switches">
          {FEATURES.map((f) => (
            <label key={f.id} className="ad-switch-row">
              <span className="ad-switch-text" lang="bn">
                <strong>{f.bn}</strong>
                <small>{f.hint}</small>
              </span>
              <input type="checkbox" role="switch" className="ad-switch" checked={draft.features[f.id]} onChange={(e) => setFeature(f.id, e.target.checked)} />
            </label>
          ))}
        </div>
      </section>

      <section className="ad-card">
        <div className="ad-section-head">
          <h2 lang="bn">ইউনিট লক</h2>
          <span className="ad-muted" lang="bn">
            {toBanglaDigits(units.length - draft.lockedUnits.length)}টা ফ্রি · {toBanglaDigits(draft.lockedUnits.length)}টা Plus
          </span>
        </div>
        <p className="ad-muted" lang="bn">
          Plus ইউনিটের লেসন আর টেস্ট খুলতে Englio Plus লাগবে। অন্যদের সেখানে Plus কেনার পাতা দেখাবে।
        </p>
        {lockedButNoSale && (
          <p className="ad-warn" lang="bn">
            {!data.paymentsReady ? 'সার্ভারে bKash এখনো চালু হয়নি' : '"Englio Plus কেনা" বন্ধ'}, তাই লক করা ইউনিট এখন কেউ খুলতে পারবে না। শিক্ষার্থীরা
            "শিগগিরই আসছে" দেখবে।
          </p>
        )}
        <div className="ad-row ad-quick" lang="bn">
          <button className="ad-btn" onClick={() => change({ ...draft, lockedUnits: [] })}>
            সব ফ্রি
          </button>
          <span>প্রথম</span>
          <input
            className="ad-input ad-num"
            type="number"
            min={0}
            max={units.length}
            value={freeCount}
            onChange={(e) => setFreeCount(Math.max(0, Math.min(units.length, Number(e.target.value) || 0)))}
            aria-label="Free units"
          />
          <span>টা ইউনিট ফ্রি, বাকি Plus</span>
          <button className="ad-btn" onClick={() => change({ ...draft, lockedUnits: units.slice(freeCount).map((u) => u.id) })}>
            এভাবে সাজাও
          </button>
        </div>
        <ul className="ad-list">
          {units.map((u, i) => {
            const locked = draft.lockedUnits.includes(u.id);
            return (
              <li key={u.id} className="ad-item">
                <span className="ad-dot" style={{ background: u.color }} />
                <span className="ad-item-text">
                  <strong>
                    ইউনিট {toBanglaDigits(i + 1)}: {u.title}
                  </strong>{' '}
                  <span lang="bn">{u.titleBn}</span>
                </span>
                <span className="ad-seg" role="radiogroup" aria-label={`Unit ${i + 1} access`}>
                  <button role="radio" aria-checked={!locked} className={!locked ? 'is-on' : undefined} onClick={() => setLocked(u.id, false)}>
                    ফ্রি
                  </button>
                  <button role="radio" aria-checked={locked} className={locked ? 'is-on is-plus' : undefined} onClick={() => setLocked(u.id, true)}>
                    Plus
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="ad-card">
        <div className="ad-section-head">
          <h2 lang="bn">Englio Plus</h2>
          <span className={data.paymentsReady ? 'ad-pill is-ok' : 'ad-pill'} lang="bn">
            {data.paymentsReady ? 'bKash চালু' : 'bKash চালু হয়নি'}
          </span>
        </div>
        <div className="ad-grid">
          <label className="ad-field" lang="bn">
            <span>দাম (টাকা)</span>
            <input
              className="ad-input"
              type="number"
              min={1}
              value={draft.plus.price}
              onChange={(e) => change({ ...draft, plus: { ...draft.plus, price: Math.round(Number(e.target.value)) } })}
            />
          </label>
          <label className="ad-field" lang="bn">
            <span>কত দিনের জন্য</span>
            <input
              className="ad-input"
              type="number"
              min={1}
              value={draft.plus.days}
              onChange={(e) => change({ ...draft, plus: { ...draft.plus, days: Math.round(Number(e.target.value)) } })}
            />
          </label>
        </div>
        <p className="ad-muted" lang="bn">
          Plus-এ পাওয়া যায়: অফুরন্ত হার্ট আর লক করা সব ইউনিট। bKash শুধু ওয়েবসাইটে দেখায়; Android অ্যাপে (Play Store) Google-এর নিয়মে bKash দেখানো যায় না,
          সেখানে বিক্রির জন্য পরে Google Play Billing লাগবে।
        </p>
        <label className="ad-switch-row" lang="bn">
          <span className="ad-switch-text">
            <strong>Android অ্যাপে Plus ইউনিট ফ্রি</strong>
            <small>চালু: অ্যাপে লক করা ইউনিটও সবাই খুলতে পারবে (কেনার উপায় নেই বলে)। বন্ধ: অ্যাপে লক থাকবে, "শিগগিরই আসছে" দেখাবে।</small>
          </span>
          <input type="checkbox" role="switch" className="ad-switch" checked={draft.appUnitsFree} onChange={(e) => change({ ...draft, appUnitsFree: e.target.checked })} />
        </label>
      </section>
    </div>
  );
}
