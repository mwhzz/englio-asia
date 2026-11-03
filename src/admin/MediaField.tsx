import { useState } from 'react';
import { mediaUrl } from '../lib/media';
import { adminUpload } from './adminApi';

/** A picture or recording for a content item: upload one, hear or see it, or remove it. */
export function MediaField({ kind, value, onChange }: { kind: 'image' | 'audio'; value: string; onChange: (file: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange((await adminUpload(file)).file);
    } catch (err) {
      setError((err as Error).message);
    }
    setBusy(false);
  }

  return (
    <div className="ad-media">
      {value && (kind === 'image' ? <img src={mediaUrl(value)} alt="" /> : <audio src={mediaUrl(value)} controls preload="none" />)}
      <input
        type="file"
        accept={kind === 'image' ? 'image/png,image/jpeg,image/webp' : 'audio/mpeg,audio/mp4,audio/webm,audio/ogg,.mp3,.m4a'}
        disabled={busy}
        onChange={(e) => upload(e.target.files?.[0])}
      />
      {value && (
        <button type="button" className="ad-btn is-small" onClick={() => onChange('')}>
          Remove
        </button>
      )}
      {busy && <small>Uploading…</small>}
      {error && <small className="ad-error">{error}</small>}
    </div>
  );
}
