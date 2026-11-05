import { useMemo, useState } from 'react';
import { toBanglaDigits } from '../lib/bangla';
import { adminApi, adminUpload } from './adminApi';
import { AudioCell } from './AudioCell';
import { LanguagePicker } from './LanguagePicker';
import { useAdminData } from './useAdminData';
import { useAdminLang } from './useAdminLang';

interface Spoken {
  key: string;
  text: string;
  kinds: string[];
  where: string;
  audio: string | null;
}

const KIND_BN: Record<string, string> = {
  word: 'শব্দ',
  sentence: 'বাক্য',
  fill: 'শূন্যস্থান',
  grammar: 'ব্যাকরণের বাক্য',
  dialog: 'কথোপকথন',
  story: 'গল্প',
  example: 'ব্যাকরণের উদাহরণ',
};

/** A file name or a text, reduced to letters and single spaces, so "Thank_you-very much.mp3" finds "Thank you very much." */
const loose = (s: string) =>
  s
    .replace(/\.[a-z0-9]+$/i, '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^a-z0-9' ]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Everything the app says aloud in a language's course (words, sentences, dialogues, stories, grammar
 * examples), each once, with its recording: record or upload one per row, or upload many files at once
 * named after their text. A recording plays wherever its text is spoken, in every language's course.
 */
export function AudioPage({ onUnauthorized }: { onUnauthorized: () => void }) {
  const lang = useAdminLang();
  const { data: spoken, error, reload } = useAdminData<Spoken[]>(`/audio?lang=${lang}`, onUnauthorized);
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('');
  const [show, setShow] = useState<'all' | 'missing' | 'done'>('missing');
  const [bulk, setBulk] = useState<string | null>(null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (spoken ?? []).filter(
      (s) =>
        (!kind || s.kinds.includes(kind)) &&
        (show === 'all' || (show === 'missing' ? !s.audio : !!s.audio)) &&
        (!q || s.text.toLowerCase().includes(q)),
    );
  }, [spoken, query, kind, show]);

  if (error) return <p className="ad-error">{error}</p>;
  if (!spoken) return <p className="ad-muted">লোড হচ্ছে…</p>;

  const done = spoken.filter((s) => s.audio).length;
  const percent = spoken.length ? Math.round((100 * done) / spoken.length) : 0;
  const setAudio = (text: string) => async (file: string) => {
    await adminApi('PUT', '/audio', { text, file });
    reload();
  };
  const clearAudio = (text: string) => async () => {
    await adminApi('DELETE', `/audio?text=${encodeURIComponent(text)}`);
    reload();
  };

  async function uploadMany(files: FileList | null) {
    if (!files?.length || !spoken) return;
    const byText = new Map(spoken.map((s) => [loose(s.text), s.text]));
    const unmatched: string[] = [];
    let matched = 0;
    setBulk(`আপলোড হচ্ছে… ০/${toBanglaDigits(files.length)}`);
    for (const [i, file] of [...files].entries()) {
      const text = byText.get(loose(file.name));
      if (!text) unmatched.push(file.name);
      else {
        try {
          const { file: uploaded } = await adminUpload(file);
          await adminApi('PUT', '/audio', { text, file: uploaded });
          matched++;
        } catch (err) {
          unmatched.push(`${file.name} (${(err as Error).message})`);
        }
      }
      setBulk(`আপলোড হচ্ছে… ${toBanglaDigits(i + 1)}/${toBanglaDigits(files.length)}`);
    }
    setBulk(`${toBanglaDigits(matched)}টা ফাইল বসেছে।${unmatched.length ? ` মেলেনি: ${unmatched.join(', ')}` : ''}`);
    reload();
  }

  return (
    <div className="ad-page" lang="bn">
      <header className="ad-head">
        <h1>অডিও</h1>
        <label className="ad-btn is-primary ad-file-btn">
          অনেক ফাইল একসাথে
          <input type="file" multiple hidden accept="audio/mpeg,audio/mp4,audio/webm,audio/ogg,.mp3,.m4a" onChange={(e) => uploadMany(e.target.files).finally(() => (e.target.value = ''))} />
        </label>
      </header>
      <LanguagePicker />
      <p className="ad-muted">
        অ্যাপে যা যা জোরে পড়া হয়, সব এখানে একবার করে। যেটার অডিও নেই, সেটা ফোনের নিজের কণ্ঠে পড়া হয়। একটা লেখার অডিও সব জায়গায় আর সব ভাষার কোর্সে বাজে।
        "অনেক ফাইল একসাথে" দিলে ফাইলের নাম লেখার সাথে মিলিয়ে বসে যায় (যেমন thank you very much.mp3)।
      </p>
      <div className="ad-lang-progress">
        <span>
          {toBanglaDigits(done)}/{toBanglaDigits(spoken.length)} · {toBanglaDigits(percent)}%
        </span>
        <span className="ad-meter">
          <span style={{ width: `${percent}%` }} />
        </span>
      </div>
      {bulk && <p className="ad-ok">{bulk}</p>}

      <div className="ad-row ad-filters">
        <input className="ad-input" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="খোঁজো" aria-label="Search" />
        <select className="ad-input" value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Kind">
          <option value="">সব ধরন</option>
          {Object.entries(KIND_BN).map(([k, bn]) => (
            <option key={k} value={k}>
              {bn}
            </option>
          ))}
        </select>
        <span className="ad-seg" role="radiogroup" aria-label="Show">
          {(
            [
              ['missing', 'অডিও নেই'],
              ['done', 'আছে'],
              ['all', 'সব'],
            ] as const
          ).map(([id, bn]) => (
            <button key={id} role="radio" aria-checked={show === id} className={show === id ? 'is-on' : undefined} onClick={() => setShow(id)}>
              {bn}
            </button>
          ))}
        </span>
      </div>

      <div className="ad-card">
        <ul className="ad-list">
          {shown.slice(0, 300).map((s) => (
            <li key={s.key} className="ad-item ad-spoken">
              <span className="ad-item-text">
                <strong lang="en">{s.text}</strong>
                <small className="ad-muted">
                  {s.kinds.map((k) => KIND_BN[k] ?? k).join(' · ')} · {s.where}
                </small>
              </span>
              <AudioCell file={s.audio} onSet={setAudio(s.text)} onClear={clearAudio(s.text)} />
            </li>
          ))}
        </ul>
        {!shown.length && <p className="ad-empty">{show === 'missing' && spoken.length ? 'সবকিছুর অডিও আছে।' : 'কিছু নেই।'}</p>}
        {shown.length > 300 && <p className="ad-muted">প্রথম ৩০০টা দেখানো হচ্ছে; খুঁজে বা ধরন বেছে ছোট করো।</p>}
      </div>
    </div>
  );
}
