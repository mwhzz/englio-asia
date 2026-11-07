import { useState } from 'react';
import { toBanglaDigits } from '../lib/bangla';
import { adminApi } from './adminApi';
import { LanguagePicker } from './LanguagePicker';
import { useAdminData } from './useAdminData';
import { useAdminLang, useMeaningLang } from './useAdminLang';
import { useDebounced } from './useDebounced';

interface Row {
  source: string;
  text: string;
}

/**
 * The app's own text in a learner language (server/uiTexts.ts): every Bangla text the app shows, next to its
 * translation. A translator fixes or fills one and it's saved when they leave the box; learners get it the
 * next time they open the app. {0}, {1} stand for numbers or names and must stay in the translation.
 */
export function UiTextPage({ onUnauthorized }: { onUnauthorized: () => void }) {
  const lang = useAdminLang();
  const meaning = useMeaningLang();
  const { data, error, reload } = useAdminData<{ total: number; done: number; rows: Row[] }>(`/ui?lang=${lang}`, onUnauthorized);
  const [q, setQ] = useState('');
  const [missing, setMissing] = useState(false);
  const query = useDebounced(q.trim().toLowerCase());
  const [saved, setSaved] = useState<string | null>(null);

  if (lang === 'bn') {
    return (
      <div className="ad-page" lang="bn">
        <header className="ad-head">
          <h1>অ্যাপের লেখা</h1>
        </header>
        <LanguagePicker />
        <p className="ad-muted">অ্যাপ বাংলায় লেখা, তাই বাংলার জন্য এখানে কিছু করার নেই। উপর থেকে অন্য ভাষা বেছে নাও (যেমন আরবি)।</p>
      </div>
    );
  }

  const rows = (data?.rows ?? []).filter((r) => (!missing || !r.text) && (!query || r.source.toLowerCase().includes(query) || r.text.toLowerCase().includes(query)));

  async function save(source: string, text: string) {
    try {
      await adminApi('PUT', '/ui', { lang, source, text });
      setSaved(source);
      reload();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  return (
    <div className="ad-page" lang="bn">
      <header className="ad-head">
        <h1>অ্যাপের লেখা</h1>
        {data && (
          <span className="ad-pill">
            {toBanglaDigits(data.done)}/{toBanglaDigits(data.total)} অনুবাদ
          </span>
        )}
      </header>
      <LanguagePicker />
      <p className="ad-muted">
        অ্যাপের প্রতিটা বাংলা লেখা আর তার {meaning.name} অনুবাদ। বক্স থেকে বের হলেই সেভ হয়। {'{0}'}, {'{1}'} মানে সংখ্যা বা নাম: অনুবাদেও রাখতে হবে।
      </p>
      <div className="ad-row ad-filters">
        <input className="ad-input" placeholder="খোঁজো" value={q} onChange={(e) => setQ(e.target.value)} />
        <label className="ad-check">
          <input type="checkbox" checked={missing} onChange={(e) => setMissing(e.target.checked)} /> শুধু অনুবাদ বাকি
        </label>
      </div>
      {error && <p className="ad-error">{error}</p>}
      <section className="ad-card">
        <ul className="ad-list ad-ui-list">
          {rows.map((r) => (
            <li key={r.source} className="ad-item ad-ui-row">
              <span className="ad-ui-source">{r.source}</span>
              <textarea
                className="ad-input"
                dir={meaning.dir}
                lang={meaning.code}
                rows={Math.min(4, Math.ceil(r.source.length / 60))}
                defaultValue={r.text}
                onBlur={(e) => e.target.value.trim() !== r.text && save(r.source, e.target.value)}
              />
              {saved === r.source && <small className="ad-ok">সেভ হয়েছে</small>}
            </li>
          ))}
          {data && !rows.length && <li className="ad-empty">কিছু নেই।</li>}
        </ul>
      </section>
    </div>
  );
}
