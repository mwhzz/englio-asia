import type { AppSettings } from '../data/appSettings';

/** Talking to every learner without a deploy: a notice on the home page, maintenance mode, and "please update". */
export function SettingsMessages({ draft, onChange }: { draft: AppSettings; onChange: (next: AppSettings) => void }) {
  return (
    <section className="ad-card" lang="bn">
      <div className="ad-section-head">
        <h2>সবাইকে বার্তা</h2>
      </div>
      <label className="ad-field">
        <span>হোম পেজে ঘোষণা (খালি রাখলে কিছু দেখাবে না)</span>
        <textarea
          className="ad-input"
          rows={2}
          maxLength={300}
          placeholder="যেমন: নতুন ইউনিট এসেছে! আজই শুরু করো।"
          value={draft.notice.text}
          onChange={(e) => onChange({ ...draft, notice: { ...draft.notice, text: e.target.value } })}
        />
      </label>
      <span className="ad-seg" role="radiogroup" aria-label="Notice tone">
        {(
          [
            ['info', 'সাধারণ'],
            ['warn', 'জরুরি'],
          ] as const
        ).map(([tone, bn]) => (
          <button key={tone} role="radio" aria-checked={draft.notice.tone === tone} className={draft.notice.tone === tone ? 'is-on' : ''} onClick={() => onChange({ ...draft, notice: { ...draft.notice, tone } })}>
            {bn}
          </button>
        ))}
      </span>

      <label className="ad-switch-row">
        <span className="ad-switch-text">
          <strong>রক্ষণাবেক্ষণ (maintenance)</strong>
          <small>চালু করলে অ্যাপে লেসনের বদলে নিচের বার্তা দেখাবে। কাজ শেষে বন্ধ করো।</small>
        </span>
        <input
          type="checkbox"
          role="switch"
          className="ad-switch"
          checked={draft.maintenance.on}
          onChange={(e) => onChange({ ...draft, maintenance: { ...draft.maintenance, on: e.target.checked } })}
        />
      </label>
      {draft.maintenance.on && (
        <input
          className="ad-input"
          maxLength={300}
          placeholder="যেমন: আমরা একটু কাজ করছি, ৩০ মিনিট পর আবার এসো।"
          value={draft.maintenance.text}
          onChange={(e) => onChange({ ...draft, maintenance: { ...draft.maintenance, text: e.target.value } })}
        />
      )}

      <label className="ad-field">
        <span>সর্বনিম্ন অ্যাপ ভার্সন (এর চেয়ে পুরনো অ্যাপ "আপডেট করো" দেখাবে; খালি = কোনো চেক নেই)</span>
        <input className="ad-input" placeholder="1.7.0" value={draft.minVersion} onChange={(e) => onChange({ ...draft, minVersion: e.target.value.trim() })} />
      </label>
    </section>
  );
}
