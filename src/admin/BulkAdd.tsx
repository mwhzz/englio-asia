import { useState } from 'react';
import { adminApi } from './adminApi';
import { BULK, parseRows } from './bulkRows';
import type { ItemKind } from './itemSchemas';

/** Adds many items at once: paste rows from Excel / Google Sheets, or open a CSV file. All or nothing. */
export function BulkAdd({ lessonId, kind, onDone, onCancel }: { lessonId: string; kind: ItemKind; onDone: () => void; onCancel: () => void }) {
  const bulk = BULK[kind]!;
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const rows = parseRows(kind, text);

  async function add() {
    setError(null);
    try {
      await adminApi('POST', `/lessons/${lessonId}/items/bulk`, { kind, rows });
      onDone();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="ad-form ad-bulk">
      <label className="ad-field">
        <span>Paste rows</span>
        <textarea className="ad-input ad-code" rows={8} lang="bn" placeholder={bulk.example} value={text} onChange={(e) => setText(e.target.value)} />
        <small>
          One per row: {bulk.columns}. Copy cells straight from Excel or Google Sheets, or write them with "|" between. A header row is skipped.
        </small>
      </label>
      <label className="ad-field">
        <span>…or open a CSV file</span>
        <input type="file" accept=".csv,.tsv,.txt" onChange={async (e) => setText((await e.target.files?.[0]?.text()) ?? text)} />
      </label>
      {error && <p className="ad-error">{error}</p>}
      <div className="ad-row">
        <button type="button" className="ad-btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="ad-btn is-primary" disabled={!rows.length} onClick={add}>
          Add {rows.length || ''} {rows.length === 1 ? 'item' : 'items'}
        </button>
      </div>
    </div>
  );
}
