import { useState } from 'react';
import { toBanglaDigits } from '../lib/bangla';
import { adminApi } from './adminApi';
import { setAdminLang, useLanguages, type AdminLanguage } from './useAdminLang';
import { go } from './useHashRoute';

/** Common learners' languages, to fill the form in one tap (any other can be typed in). */
const PRESETS: Pick<AdminLanguage, 'code' | 'name' | 'native' | 'dir'>[] = [
  { code: 'ar', name: 'Arabic', native: 'العربية', dir: 'rtl' },
  { code: 'ur', name: 'Urdu', native: 'اردو', dir: 'rtl' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', dir: 'ltr' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', native: '日本語', dir: 'ltr' },
  { code: 'zh', name: 'Chinese', native: '中文', dir: 'ltr' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', dir: 'ltr' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe', dir: 'ltr' },
  { code: 'es', name: 'Spanish', native: 'Español', dir: 'ltr' },
  { code: 'pt', name: 'Portuguese', native: 'Português', dir: 'ltr' },
  // Not a learner language but a course for Bangla speakers that teaches Arabic (code language-target).
  { code: 'bn-ar', name: 'Arabic for Bangla speakers', native: 'আরবি শেখা', dir: 'ltr' },
];

const EMPTY = { code: '', name: '', native: '', dir: 'ltr' as 'ltr' | 'rtl' };
const n = (x: number) => toBanglaDigits(x);

/**
 * The learners' own languages: each has its own course, written in the admin. A new language starts empty
 * and in draft (only the admin sees it); it goes live for learners once it has content.
 */
export function LanguagesPage({ owner }: { owner: boolean }) {
  const [version, setVersion] = useState(0);
  const languages = useLanguages(version);
  const [form, setForm] = useState(EMPTY);
  const [problem, setProblem] = useState<string | null>(null);
  const reload = () => setVersion((v) => v + 1);

  async function act(fn: () => Promise<unknown>) {
    setProblem(null);
    try {
      await fn();
      reload();
    } catch (err) {
      setProblem((err as Error).message);
    }
  }

  if (!languages) return <p className="ad-muted">লোড হচ্ছে…</p>;
  const added = new Set(languages.map((l) => l.code));

  return (
    <div className="ad-page" lang="bn">
      <header className="ad-head">
        <h1>ভাষা</h1>
      </header>
      <p className="ad-muted">
        যারা ইংরেজি শিখবে, তাদের নিজের ভাষা। প্রতিটা ভাষার আলাদা কোর্স: লেসনের অর্থ, ব্যাকরণের ব্যাখ্যা আর গল্প সেই ভাষায়। নতুন ভাষা খালি আর
        "খসড়া" অবস্থায় শুরু হয়, শুধু অ্যাডমিনে দেখা যায়। কনটেন্ট লেখা হলে "চালু" করলে শিক্ষার্থীরা পাবে।
      </p>
      {problem && <p className="ad-error">{problem}</p>}

      <div className="ad-lang-grid">
        {languages.map((l) => {
          const empty = l.units + l.grammar + l.stories + l.writing === 0;
          const percent = l.items ? Math.round((100 * l.translated) / l.items) : 0;
          return (
            <section key={l.code} className="ad-card ad-lang">
              <div className="ad-lang-head">
                <span className="ad-lang-native" dir={l.dir}>
                  {l.native}
                </span>
                <span className={l.status === 'live' ? 'ad-pill is-ok' : 'ad-pill'}>{l.status === 'live' ? 'চালু' : 'খসড়া'}</span>
              </div>
              <p className="ad-muted">
                {l.name} · {l.code} · {l.target === 'ar' ? 'আরবি শেখানোর কোর্স' : l.dir === 'rtl' ? 'ডান থেকে বামে লেখা' : 'বাম থেকে ডানে লেখা'}
              </p>
              <ul className="ad-lang-stats">
                <li>
                  <strong>{n(l.units)}</strong> ইউনিট · <strong>{n(l.lessons)}</strong> লেসন · <strong>{n(l.items)}</strong> শব্দ/বাক্য
                </li>
                <li>
                  <strong>{n(l.grammar)}</strong> ব্যাকরণ · <strong>{n(l.stories)}</strong> গল্প · <strong>{n(l.writing)}</strong> লেখার কাজ
                </li>
              </ul>
              {l.code !== 'bn' && l.items > 0 && (
                <div className="ad-lang-progress">
                  <span>অনুবাদ {n(percent)}%</span>
                  <span className="ad-meter">
                    <span style={{ width: `${percent}%` }} />
                  </span>
                </div>
              )}
              {empty && <p className="ad-muted">এখনো কোনো কনটেন্ট নেই। লেসন পাতায় এই ভাষা বেছে ইউনিট যোগ করো।</p>}
              <div className="ad-row">
                <label className="ad-btn ad-file-btn" title="লেখকের বানানো ইউনিটের JSON ফাইল: সব চেক করে খসড়া হিসেবে যোগ হবে">
                  JSON থেকে যোগ করো
                  <input type="file" accept="application/json,.json" hidden onChange={(e) => e.target.files?.[0] && importFile(l.code, e.target.files[0]).then(() => setVersion((v) => v + 1))} />
                </label>
                {!empty && (
                  <button className="ad-btn" title="অনুবাদকের জন্য পুরো কোর্স একটা ফাইলে (server/importLanguage.ts দিয়ে আবার যোগ করা যায়)" onClick={() => exportContent(l.code)}>
                    JSON নামাও
                  </button>
                )}
                <button
                  className="ad-btn"
                  onClick={() => {
                    setAdminLang(l.code);
                    go('content');
                  }}
                >
                  কনটেন্ট দেখো
                </button>
                {owner && l.code !== 'bn' && (
                  <button
                    className={l.status === 'live' ? 'ad-btn' : 'ad-btn is-primary'}
                    disabled={l.status === 'draft' && empty}
                    title={l.status === 'draft' && empty ? 'আগে কনটেন্ট লেখো' : undefined}
                    onClick={() => act(() => adminApi('PUT', `/languages/${l.code}`, { status: l.status === 'live' ? 'draft' : 'live' }))}
                  >
                    {l.status === 'live' ? 'খসড়া করো' : 'চালু করো'}
                  </button>
                )}
                {owner && l.code !== 'bn' && empty && (
                  <button className="ad-btn is-danger" onClick={() => confirm(`"${l.native}" মুছে ফেলবে?`) && act(() => adminApi('DELETE', `/languages/${l.code}`))}>
                    মুছে ফেলো
                  </button>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {owner && (
        <section className="ad-card ad-form">
          <div className="ad-section-head">
            <h2>নতুন ভাষা</h2>
          </div>
          <div className="ad-chips">
            {PRESETS.filter((p) => !added.has(p.code)).map((p) => (
              <button key={p.code} className="ad-btn is-small" onClick={() => setForm(p)}>
                <span dir={p.dir}>{p.native}</span>
              </button>
            ))}
          </div>
          <div className="ad-grid">
            <label className="ad-field">
              <span>কোড (২-৩ অক্ষর, যেমন ar)</span>
              <input className="ad-input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.trim().toLowerCase() })} />
            </label>
            <label className="ad-field">
              <span>ইংরেজি নাম</span>
              <input className="ad-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="ad-field">
              <span>নিজের ভাষায় নাম</span>
              <input className="ad-input" dir={form.dir} value={form.native} onChange={(e) => setForm({ ...form, native: e.target.value })} />
            </label>
            <label className="ad-field">
              <span>লেখার দিক</span>
              <select className="ad-input" value={form.dir} onChange={(e) => setForm({ ...form, dir: e.target.value as 'ltr' | 'rtl' })}>
                <option value="ltr">বাম থেকে ডানে</option>
                <option value="rtl">ডান থেকে বামে (আরবি, উর্দু)</option>
              </select>
            </label>
          </div>
          <div className="ad-row">
            <button
              className="ad-btn is-primary"
              disabled={!form.code || !form.name.trim() || !form.native.trim()}
              onClick={() => act(() => adminApi('POST', '/languages', form)).then(() => setForm(EMPTY))}
            >
              ভাষা যোগ করো
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

/** Downloads a language's whole course as JSON, in the importer's format. */
async function exportContent(code: string) {
  try {
    const data = await adminApi('GET', `/export/content?lang=${code}`);
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `englio-${code}-course.json` });
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    alert((e as Error).message);
  }
}

/** Adds a writer's batch (units, topics, stories, writing) to a language from a JSON file, as drafts. */
async function importFile(code: string, file: File) {
  try {
    const data = JSON.parse(await file.text()) as Record<string, unknown>;
    const { language: _, ...rest } = data;
    const r = await adminApi<{ units: number; lessons: number; items: number; grammar: number; stories: number }>('POST', '/import', { ...rest, lang: code });
    alert(`যোগ হয়েছে (খসড়া): ${r.units}টা ইউনিট, ${r.lessons}টা লেসন, ${r.items}টা শব্দ/বাক্য, ${r.grammar}টা ব্যাকরণ, ${r.stories}টা গল্প। লেসন পাতায় দেখে "প্রকাশিত" করো।`);
  } catch (e) {
    alert(`কিছুই যোগ হয়নি: ${(e as Error).message}`);
  }
}

