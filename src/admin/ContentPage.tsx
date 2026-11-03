import { useState, type CSSProperties } from 'react';
import { adminApi } from './adminApi';
import { KIND_ORDER, SCHEMAS } from './itemSchemas';
import { UnitForm, type Tip, type UnitDraft } from './UnitForm';
import { useAdminData } from './useAdminData';
import { go } from './useHashRoute';

interface UnitRow {
  id: string;
  title: string;
  titleBn: string;
  color: string;
  tips: Tip[];
  lessons: { id: string; title: string; titleBn: string; counts: Record<string, number> }[];
}

const NEW_UNIT: UnitDraft = { title: '', titleBn: '', color: '#007aff', tips: [] };

/** Every unit and its lessons: add, rename, reorder, delete; open a lesson to edit its content. */
export function ContentPage({ onUnauthorized }: { onUnauthorized: () => void }) {
  const { data: units, error, reload } = useAdminData<UnitRow[]>('/units', onUnauthorized);
  const [editing, setEditing] = useState<string | null>(null);

  if (error) return <p className="ad-error">{error}</p>;
  if (!units) return <p className="ad-muted">Loading…</p>;

  const act = (fn: () => Promise<unknown>) =>
    fn()
      .then(reload)
      .catch((e: Error) => alert(e.message));

  const addLesson = (unitId: string) => {
    const title = prompt('Lesson title (English)');
    const titleBn = title && prompt('Lesson title (Bangla)');
    if (title && titleBn) act(() => adminApi<{ id: string }>('POST', `/units/${unitId}/lessons`, { title, titleBn }).then((l) => go('lesson', l.id)));
  };

  return (
    <div className="ad-page">
      <header className="ad-head">
        <h1>
          Lessons <span lang="bn">· লেসন</span>
        </h1>
        <button className="ad-btn is-primary" onClick={() => setEditing('new')}>
          + New unit
        </button>
      </header>
      <p className="ad-muted">Changes reach the app the next time it opens.</p>

      {editing === 'new' && (
        <div className="ad-card">
          <UnitForm
            initial={NEW_UNIT}
            onCancel={() => setEditing(null)}
            onSave={async (unit) => {
              await adminApi('POST', '/units', unit);
              setEditing(null);
              reload();
            }}
          />
        </div>
      )}

      {units.map((unit, i) => (
        <section key={unit.id} className="ad-card ad-unit" style={{ '--u': unit.color } as CSSProperties}>
          {editing === unit.id ? (
            <UnitForm
              initial={unit}
              onCancel={() => setEditing(null)}
              onSave={async (draft) => {
                await adminApi('PUT', `/units/${unit.id}`, draft);
                setEditing(null);
                reload();
              }}
            />
          ) : (
            <div className="ad-section-head">
              <h2>
                <span className="ad-dot" /> Unit {i + 1}: {unit.title} <span lang="bn">{unit.titleBn}</span>
                <em>{unit.tips.length} tips</em>
              </h2>
              <div className="ad-row">
                <button className="ad-btn is-small" title="Move up" disabled={i === 0} onClick={() => act(() => adminApi('POST', `/units/${unit.id}/move`, { dir: -1 }))}>
                  ↑
                </button>
                <button
                  className="ad-btn is-small"
                  title="Move down"
                  disabled={i === units.length - 1}
                  onClick={() => act(() => adminApi('POST', `/units/${unit.id}/move`, { dir: 1 }))}
                >
                  ↓
                </button>
                <button className="ad-btn is-small" onClick={() => setEditing(unit.id)}>
                  Edit
                </button>
                <button
                  className="ad-btn is-small is-danger"
                  onClick={() => confirm(`Delete "${unit.title}" and all its lessons?`) && act(() => adminApi('DELETE', `/units/${unit.id}`))}
                >
                  Delete
                </button>
              </div>
            </div>
          )}

          <ul className="ad-list">
            {unit.lessons.map((lesson, j) => (
              <li key={lesson.id} className="ad-item">
                <button className="ad-item-open" onClick={() => go('lesson', lesson.id)}>
                  <strong>{lesson.title}</strong> <span lang="bn">{lesson.titleBn}</span>
                  <small>
                    {KIND_ORDER.filter((k) => lesson.counts[k])
                      .map((k) => `${lesson.counts[k]} ${SCHEMAS[k].title.toLowerCase()}`)
                      .join(' · ') || 'empty'}
                  </small>
                </button>
                <button
                  className="ad-btn is-small"
                  disabled={j === 0}
                  onClick={() => act(() => adminApi('POST', `/lessons/${lesson.id}/move`, { dir: -1 }))}
                >
                  ↑
                </button>
                <button
                  className="ad-btn is-small"
                  disabled={j === unit.lessons.length - 1}
                  onClick={() => act(() => adminApi('POST', `/lessons/${lesson.id}/move`, { dir: 1 }))}
                >
                  ↓
                </button>
                <button
                  className="ad-btn is-small is-danger"
                  onClick={() => confirm(`Delete "${lesson.title}"?`) && act(() => adminApi('DELETE', `/lessons/${lesson.id}`))}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
          <button className="ad-btn is-small" onClick={() => addLesson(unit.id)}>
            + Add lesson
          </button>
        </section>
      ))}
    </div>
  );
}
