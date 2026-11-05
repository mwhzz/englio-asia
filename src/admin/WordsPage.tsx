import { useMemo, useState } from 'react';
import { mediaUrl } from '../lib/media';
import { toBanglaDigits } from '../lib/bangla';
import { adminApi } from './adminApi';
import { AudioCell } from './AudioCell';
import { LanguagePicker } from './LanguagePicker';
import { MediaField } from './MediaField';
import { useAdminData } from './useAdminData';
import { useAdminLang, useLanguages } from './useAdminLang';
import { go } from './useHashRoute';

interface Word {
  id: number;
  en: string;
  bn: string;
  emoji: string;
  image: string | null;
  audio: string | null;
  lessonId: string;
  lesson: string;
  unitId: string;
  unit: string;
}

interface UnitRow {
  id: string;
  title: string;
  lessons: { id: string; title: string }[];
}

const EMPTY = { lessonId: '', en: '', bn: '', emoji: '', image: '', audio: '' };

/**
 * Every word of a language's course in one list: add a word to a lesson, and give each word its recording
 * (record it here or upload a file). A word's recording plays wherever that word is spoken in the app.
 */
export function WordsPage({ onUnauthorized }: { onUnauthorized: () => void }) {
  const lang = useAdminLang();
  const languages = useLanguages();
  const dir = languages?.find((l) => l.code === lang)?.dir ?? 'ltr';
  const { data: words, error, reload } = useAdminData<Word[]>(`/words?lang=${lang}`, onUnauthorized);
  const { data: units } = useAdminData<UnitRow[]>(`/units?lang=${lang}`, onUnauthorized);
  const [query, setQuery] = useState('');
  const [unitId, setUnitId] = useState('');
  const [missing, setMissing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [problem, setProblem] = useState<string | null>(null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (words ?? []).filter(
      (w) => (!unitId || w.unitId === unitId) && (!missing || !w.audio) && (!q || w.en.toLowerCase().includes(q) || w.bn.toLowerCase().includes(q)),
    );
  }, [words, query, unitId, missing]);

  if (error) return <p className="ad-error">{error}</p>;
  if (!words || !units) return <p className="ad-muted">লোড হচ্ছে…</p>;

  const withAudio = words.filter((w) => w.audio).length;
  const setAudio = (text: string) => async (file: string) => {
    await adminApi('PUT', '/audio', { text, file });
    reload();
  };
  const clearAudio = (w: Word) => async () => {
    await adminApi('DELETE', `/audio?text=${encodeURIComponent(w.en)}`).catch(async () => {
      // The recording was on the word itself (added in the lesson editor): take it off there.
      await adminApi('PUT', `/items/${w.id}`, { data: { en: w.en, bn: w.bn, emoji: w.emoji, ...(w.image ? { image: w.image } : {}) } });
    });
    reload();
  };

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setProblem(null);
    try {
      const data = { en: form.en.trim(), bn: form.bn.trim(), emoji: form.emoji.trim(), ...(form.image ? { image: form.image } : {}) };
      await adminApi('POST', `/lessons/${form.lessonId}/items`, { kind: 'vocab', data });
      if (form.audio) await adminApi('PUT', '/audio', { text: data.en, file: form.audio });
      setForm({ ...EMPTY, lessonId: form.lessonId });
      reload();
    } catch (err) {
      setProblem((err as Error).message);
    }
  }

  return (
    <div className="ad-page" lang="bn">
      <header className="ad-head">
        <h1>শব্দ</h1>
        <button className="ad-btn is-primary" onClick={() => setAdding(!adding)} disabled={!units.length}>
          {adding ? 'বন্ধ করো' : '+ নতুন শব্দ'}
        </button>
      </header>
      <LanguagePicker />
      <p className="ad-muted">
        {toBanglaDigits(words.length)}টা শব্দ · {toBanglaDigits(withAudio)}টায় অডিও আছে। কোনো শব্দের অডিও অ্যাপে সেই শব্দ যেখানেই বলা হয়, সেখানেই বাজে।
      </p>
      {!units.length && <p className="ad-empty">এই ভাষায় এখনো কোনো লেসন নেই। আগে লেসন পাতায় ইউনিট আর লেসন যোগ করো।</p>}

      {adding && (
        <form className="ad-card ad-form" onSubmit={add}>
          <div className="ad-grid">
            <label className="ad-field">
              <span>কোন লেসনে</span>
              <select className="ad-input" value={form.lessonId} onChange={(e) => setForm({ ...form, lessonId: e.target.value })} required>
                <option value="">লেসন বাছো</option>
                {units.map((u) => (
                  <optgroup key={u.id} label={u.title}>
                    {u.lessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
            <label className="ad-field">
              <span>ইংরেজি শব্দ</span>
              <input className="ad-input" lang="en" value={form.en} onChange={(e) => setForm({ ...form, en: e.target.value })} placeholder="e.g. house" required />
            </label>
            <label className="ad-field">
              <span>অর্থ ({languages?.find((l) => l.code === lang)?.native ?? 'নিজের ভাষায়'})</span>
              <input className="ad-input" dir={dir} value={form.bn} onChange={(e) => setForm({ ...form, bn: e.target.value })} required />
            </label>
            <label className="ad-field">
              <span>ইমোজি (ঐচ্ছিক)</span>
              <input className="ad-input" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} placeholder="🏠" />
            </label>
          </div>
          <div className="ad-grid">
            <div className="ad-field">
              <span>ছবি (ঐচ্ছিক)</span>
              <MediaField kind="image" value={form.image} onChange={(image) => setForm({ ...form, image })} />
            </div>
            <div className="ad-field">
              <span>উচ্চারণ (ঐচ্ছিক)</span>
              <AudioCell
                file={form.audio || null}
                onSet={async (audio) => setForm((f) => ({ ...f, audio }))}
                onClear={async () => setForm((f) => ({ ...f, audio: '' }))}
              />
            </div>
          </div>
          {problem && <p className="ad-error">{problem}</p>}
          <div className="ad-row">
            <button className="ad-btn is-primary" disabled={!form.lessonId || !form.en.trim() || !form.bn.trim()}>
              শব্দ যোগ করো
            </button>
          </div>
        </form>
      )}

      <div className="ad-row ad-filters">
        <input className="ad-input" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="খোঁজো: ইংরেজি বা অর্থ" aria-label="Search words" />
        <select className="ad-input" value={unitId} onChange={(e) => setUnitId(e.target.value)} aria-label="Unit">
          <option value="">সব ইউনিট</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.title}
            </option>
          ))}
        </select>
        <label className="ad-check">
          <input type="checkbox" checked={missing} onChange={(e) => setMissing(e.target.checked)} /> শুধু অডিও ছাড়া
        </label>
      </div>

      <div className="ad-card ad-table-wrap">
        <table className="ad-table ad-words">
          <thead>
            <tr>
              <th />
              <th>শব্দ</th>
              <th>অর্থ</th>
              <th>লেসন</th>
              <th>অডিও</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {shown.map((w) => (
              <tr key={w.id}>
                <td className="ad-word-pic">{w.image ? <img src={mediaUrl(w.image)} alt="" /> : w.emoji}</td>
                <td lang="en">
                  <strong>{w.en}</strong>
                </td>
                <td dir={dir}>{w.bn}</td>
                <td className="ad-muted">
                  {w.unit} · {w.lesson}
                </td>
                <td>
                  <AudioCell file={w.audio} onSet={setAudio(w.en)} onClear={clearAudio(w)} />
                </td>
                <td className="ad-row-actions">
                  <button className="ad-btn is-small" onClick={() => go('lesson', w.lessonId)}>
                    লেসন খোলো
                  </button>
                  <button
                    className="ad-btn is-small is-danger"
                    onClick={() => confirm(`"${w.en}" মুছে ফেলবে?`) && adminApi('DELETE', `/items/${w.id}`).then(reload, (err: Error) => alert(err.message))}
                  >
                    মুছো
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!shown.length && <p className="ad-empty">কোনো শব্দ নেই।</p>}
      </div>
    </div>
  );
}
