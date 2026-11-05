import { useRef, useState } from 'react';
import { Glyph } from '../components/Glyph';
import { mediaUrl } from '../lib/media';
import { adminUpload } from './adminApi';

/** The best recording format this browser can make (Chrome: WebM/Opus, Safari: MP4/AAC), all accepted by the server. */
const FORMAT = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'].find(
  (t) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported?.(t),
);

/**
 * One text's recording, in a list row: play it, record a new one with the microphone, upload a file, or
 * remove it. `onSet` gets the uploaded file's name; the page saves it where it belongs.
 */
export function AudioCell({ file, onSet, onClear }: { file: string | null; onSet: (file: string) => Promise<void>; onClear?: () => Promise<void> }) {
  const [state, setState] = useState<'idle' | 'recording' | 'saving'>('idle');
  const [error, setError] = useState<string | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function save(blob: Blob, type: string) {
    setState('saving');
    setError(null);
    try {
      const { file: uploaded } = await adminUpload(new File([blob], 'recording', { type: type.split(';')[0] }));
      await onSet(uploaded);
    } catch (err) {
      setError((err as Error).message);
    }
    setState('idle');
  }

  async function record() {
    if (state === 'recording') {
      recorder.current?.stop();
      return;
    }
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream, FORMAT ? { mimeType: FORMAT } : undefined);
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        save(new Blob(chunks, { type: rec.mimeType }), rec.mimeType || 'audio/webm');
      };
      recorder.current = rec;
      rec.start();
      setState('recording');
    } catch {
      setError('মাইক্রোফোন চালু করা যায়নি');
    }
  }

  return (
    <span className="ad-audio" lang="bn">
      {file && (
        <button type="button" className="ad-icon-btn" aria-label="Play" title="শোনো" onClick={() => new Audio(mediaUrl(file)).play().catch(() => undefined)}>
          <Glyph name="play" size={16} />
        </button>
      )}
      <button
        type="button"
        className={`ad-icon-btn${state === 'recording' ? ' is-recording' : ''}`}
        aria-label={state === 'recording' ? 'Stop recording' : 'Record'}
        title={state === 'recording' ? 'থামাও' : 'রেকর্ড করো'}
        disabled={state === 'saving' || !FORMAT}
        onClick={record}
      >
        <Glyph name={state === 'recording' ? 'close' : 'mic'} size={16} />
      </button>
      <button type="button" className="ad-icon-btn" aria-label="Upload" title="ফাইল দাও" disabled={state !== 'idle'} onClick={() => input.current?.click()}>
        <Glyph name="upload" size={16} />
      </button>
      <input
        ref={input}
        type="file"
        hidden
        accept="audio/mpeg,audio/mp4,audio/webm,audio/ogg,.mp3,.m4a"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (f) save(f, f.type || 'audio/mpeg');
        }}
      />
      {file && onClear && (
        <button
          type="button"
          className="ad-icon-btn is-danger"
          aria-label="Remove recording"
          title="অডিও মুছে ফেলো"
          disabled={state !== 'idle'}
          onClick={() => confirm('এই অডিও মুছে ফেলবে?') && onClear().catch((err: Error) => setError(err.message))}
        >
          <Glyph name="close" size={14} />
        </button>
      )}
      {state === 'recording' && <small className="ad-rec">রেকর্ড হচ্ছে…</small>}
      {state === 'saving' && <small className="ad-muted">সেভ হচ্ছে…</small>}
      {error && <small className="ad-error">{error}</small>}
    </span>
  );
}
