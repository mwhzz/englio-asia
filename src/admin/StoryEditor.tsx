import { useEffect, useState } from 'react';
import type { Story } from '../types';
import { adminApi, Unauthorized } from './adminApi';
import { EMPTY_STORY, fieldsToStory, storyToFields, type StoryFields } from './storyForm';
import { openPreview } from '../preview/draft';
import { slug } from './topicForm';
import { go } from './useHashRoute';
import { useAdminLang } from './useAdminLang';

/** Write or edit one short story; the server checks it before saving. */
export function StoryEditor({ id, onUnauthorized }: { id: string; onUnauthorized: () => void }) {
  const isNew = id === 'new';
  const lang = useAdminLang();
  const [fields, setFields] = useState<StoryFields | null>(isNew ? EMPTY_STORY : null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isNew) return;
    adminApi<Story>('GET', `/stories/${id}`)
      .then((s) => setFields(storyToFields(s)))
      .catch((e: Error) => (e instanceof Unauthorized ? onUnauthorized() : setError(e.message)));
  }, [id, isNew, onUnauthorized]);

  if (!fields) return error ? <p className="ad-error">{error}</p> : <p className="ad-muted">Loading…</p>;

  const set = (key: keyof StoryFields, value: string) => {
    setSaved(false);
    setFields({ ...fields, [key]: value, ...(isNew && key === 'title' ? { id: slug(value) } : {}) });
  };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const story = fieldsToStory(fields!);
      if (isNew) {
        await adminApi('POST', '/stories', { ...story, lang });
        go('story', story.id);
      } else {
        await adminApi('PUT', `/stories/${id}`, story);
        setSaved(true);
      }
    } catch (err) {
      if (err instanceof Unauthorized) onUnauthorized();
      else setError((err as Error).message);
    }
  }

  return (
    <div className="ad-page">
      <button className="ad-link" onClick={() => go('stories')}>
        ← All stories
      </button>
      <header className="ad-head">
        <h1>{isNew ? 'New story' : fields.title}</h1>
      </header>

      <form className="ad-card ad-form" onSubmit={save}>
        <div className="ad-grid">
          <label className="ad-field">
            <span>Title (English)</span>
            <input className="ad-input" value={fields.title} onChange={(e) => set('title', e.target.value)} />
          </label>
          <label className="ad-field">
            <span>Title (Bangla)</span>
            <input className="ad-input" lang="bn" value={fields.titleBn} onChange={(e) => set('titleBn', e.target.value)} />
          </label>
          <label className="ad-field">
            <span>Id</span>
            <input className="ad-input" value={fields.id} disabled={!isNew} onChange={(e) => set('id', e.target.value)} />
            <small>{isNew ? 'Made from the title.' : 'Can’t change: learners’ progress refers to it.'}</small>
          </label>
          <label className="ad-field">
            <span>Color</span>
            <input className="ad-color" type="color" value={fields.color} onChange={(e) => set('color', e.target.value)} />
          </label>
        </div>

        <label className="ad-field">
          <span>Lines</span>
          <textarea className="ad-input" rows={10} lang="bn" value={fields.lines} onChange={(e) => set('lines', e.target.value)} />
          <small>One per line: "English | বাংলা", or "Speaker | English | বাংলা" when someone speaks. Keep lines short; each is read aloud.</small>
        </label>
        <label className="ad-field">
          <span>Questions</span>
          <textarea className="ad-input" rows={4} lang="bn" value={fields.quiz} onChange={(e) => set('quiz', e.target.value)} />
          <small>One per line: "question | right answer | wrong 1; wrong 2 | why (Bangla)".</small>
        </label>

        {error && <p className="ad-error">{error}</p>}
        <div className="ad-row">
          <button className="ad-btn is-primary">{isNew ? 'Create story' : 'Save'}</button>
          <button type="button" className="ad-btn" onClick={() => openPreview({ kind: 'story', story: fieldsToStory(fields) })}>
            Preview in app ↗
          </button>
          {saved && <span className="ad-muted">Saved.</span>}
        </div>
      </form>
    </div>
  );
}
