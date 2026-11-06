import { useState } from 'react';
import { adminApi } from './adminApi';
import { ItemForm } from './ItemForm';
import { KIND_ORDER, SCHEMAS, type ItemData, type ItemKind } from './itemSchemas';
import { useAdminData } from './useAdminData';
import { go } from './useHashRoute';
import { openPreview } from '../preview/draft';
import { BulkAdd } from './BulkAdd';
import { BULK } from './bulkRows';
import { forLang, useAdminLang, useMeaningLang } from './useAdminLang';

interface Item {
  id: number;
  kind: ItemKind;
  data: ItemData;
}
interface LessonData {
  id: string;
  unitId: string;
  title: string;
  titleBn: string;
  items: Item[];
}

/** One lesson: its name, then its words, sentences, blanks, gaps, grammar and dialogues, each editable. */
export function LessonPage({ id, onUnauthorized }: { id: string; onUnauthorized: () => void }) {
  const meaning = useMeaningLang();
  const { data: lesson, error, reload } = useAdminData<LessonData>(`/lessons/${id}`, onUnauthorized);
  const lang = useAdminLang();
  // What's being edited: an item id, "new:<kind>", or "title".
  const [editing, setEditing] = useState<string | null>(null);
  const [title, setTitle] = useState({ title: '', titleBn: '' });

  if (error) return <p className="ad-error">{error}</p>;
  if (!lesson) return <p className="ad-muted">Loading…</p>;

  const save = async (fn: () => Promise<unknown>) => {
    await fn();
    setEditing(null);
    reload();
  };

  return (
    <div className="ad-page">
      <button className="ad-link" onClick={() => go('content')}>
        ← All lessons
      </button>

      {editing === 'title' ? (
        <form
          className="ad-card ad-form"
          onSubmit={(e) => {
            e.preventDefault();
            save(() => adminApi('PUT', `/lessons/${id}`, title)).catch((err: Error) => alert(err.message));
          }}
        >
          <label className="ad-field">
            <span>Title (English)</span>
            <input className="ad-input" value={title.title} onChange={(e) => setTitle({ ...title, title: e.target.value })} />
          </label>
          <label className="ad-field">
            <span>{forLang('Title (Bangla)', meaning.name)}</span>
            <input className="ad-input" lang="bn" value={title.titleBn} onChange={(e) => setTitle({ ...title, titleBn: e.target.value })} />
          </label>
          <div className="ad-row">
            <button type="button" className="ad-btn" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button className="ad-btn is-primary">Save</button>
          </div>
        </form>
      ) : (
        <header className="ad-head">
          <div>
            <small className="ad-muted">{lesson.id}</small>
            <h1>
              {lesson.title} <span lang="bn">· {lesson.titleBn}</span>
            </h1>
          </div>
          <button
            className="ad-btn"
            onClick={() => {
              setTitle({ title: lesson.title, titleBn: lesson.titleBn });
              setEditing('title');
            }}
          >
            Rename
          </button>
          <button className="ad-btn" onClick={() => openPreview({ kind: 'lesson', lessonId: lesson.id, lang })} title="Runs the lesson as saved">
            Preview in app ↗
          </button>
        </header>
      )}

      {KIND_ORDER.map((kind) => {
        const schema = SCHEMAS[kind];
        const items = lesson.items.filter((i) => i.kind === kind);
        return (
          <section key={kind} className="ad-card">
            <div className="ad-section-head">
              <h2>
                {schema.title} <span lang="bn">{schema.titleBn}</span> <em>{items.length}</em>
              </h2>
              <span className="ad-row">
                {BULK[kind] && (
                  <button className="ad-btn is-small" onClick={() => setEditing(`bulk:${kind}`)}>
                    + Paste many
                  </button>
                )}
                <button className="ad-btn is-small" onClick={() => setEditing(`new:${kind}`)}>
                  + Add
                </button>
              </span>
            </div>

            {editing === `bulk:${kind}` && (
              <BulkAdd
                lessonId={id}
                kind={kind}
                onCancel={() => setEditing(null)}
                onDone={() => {
                  setEditing(null);
                  reload();
                }}
              />
            )}

            {editing === `new:${kind}` && (
              <ItemForm
                kind={kind}
                onCancel={() => setEditing(null)}
                onSave={(data) => save(() => adminApi('POST', `/lessons/${id}/items`, { kind, data }))}
              />
            )}

            <ul className="ad-list">
              {items.map((item) =>
                editing === String(item.id) ? (
                  <li key={item.id}>
                    <ItemForm
                      kind={kind}
                      initial={item.data}
                      onCancel={() => setEditing(null)}
                      onSave={(data) => save(() => adminApi('PUT', `/items/${item.id}`, { data }))}
                    />
                  </li>
                ) : (
                  <li key={item.id} className="ad-item">
                    <span className="ad-item-text">{schema.summary(item.data)}</span>
                    <button className="ad-btn is-small" onClick={() => setEditing(String(item.id))}>
                      Edit
                    </button>
                    <button
                      className="ad-btn is-small is-danger"
                      onClick={() => confirm('Delete this item?') && save(() => adminApi('DELETE', `/items/${item.id}`))}
                    >
                      Delete
                    </button>
                  </li>
                ),
              )}
              {!items.length && editing !== `new:${kind}` && <li className="ad-empty">None yet.</li>}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
