import { useState } from 'react';
import { fromText, SCHEMAS, toText, type ItemData, type ItemKind } from './itemSchemas';
import { MediaField } from './MediaField';

interface Props {
  kind: ItemKind;
  initial?: ItemData;
  onSave: (data: ItemData) => Promise<void>;
  onCancel: () => void;
}

/** Add or edit one content item; the fields come from its kind's schema. The server checks it before saving. */
export function ItemForm({ kind, initial = {}, onSave, onCancel }: Props) {
  const schema = SCHEMAS[kind];
  const [values, setValues] = useState(() => Object.fromEntries(schema.fields.map((f) => [f.key, toText(f, initial[f.key])])));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // Keep fields the form doesn't show (like a word's old emoji); an empty picture or recording means none.
      const data: ItemData = { ...initial, ...Object.fromEntries(schema.fields.map((f) => [f.key, fromText(f, values[f.key])])) };
      for (const f of schema.fields) if ((f.type === 'image' || f.type === 'audio') && !data[f.key]) delete data[f.key];
      await onSave(data);
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  return (
    <form className="ad-form" onSubmit={submit}>
      {schema.fields.map((field) => (
        <label key={field.key} className="ad-field">
          <span>{field.label}</span>
          {field.type === 'image' || field.type === 'audio' ? (
            <MediaField kind={field.type} value={values[field.key]} onChange={(file) => setValues({ ...values, [field.key]: file })} />
          ) : field.type === 'text' ? (
            <input
              className="ad-input"
              lang={field.bn ? 'bn' : undefined}
              value={values[field.key]}
              onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
            />
          ) : (
            <textarea
              className="ad-input"
              lang={field.bn ? 'bn' : undefined}
              rows={field.type === 'dialog' ? 5 : field.type === 'area' ? 3 : 2}
              value={values[field.key]}
              onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
            />
          )}
          {field.hint && <small>{field.hint}</small>}
        </label>
      ))}
      {error && <p className="ad-error">{error}</p>}
      <div className="ad-row">
        <button type="button" className="ad-btn" onClick={onCancel}>
          Cancel
        </button>
        <button className="ad-btn is-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}
