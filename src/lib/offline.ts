import { COURSE } from '../data/course';
import { mediaUrl } from './media';

const LOW_DATA = 'englio-low-data';

/**
 * Low-data mode (this phone only): no pictures or recordings are downloaded (the phone's voice reads
 * instead) and the league isn't fetched. On by default when the phone itself asks to save data.
 */
export function isLowData(): boolean {
  try {
    const saved = localStorage.getItem(LOW_DATA);
    if (saved) return saved === '1';
  } catch {
    // Storage blocked: follow the phone's setting.
  }
  return !!(navigator as { connection?: { saveData?: boolean } }).connection?.saveData;
}

export function setLowData(on: boolean): void {
  try {
    localStorage.setItem(LOW_DATA, on ? '1' : '0');
  } catch {
    // Not remembered; harmless.
  }
}

/** Every picture and recording in the course, for downloading ahead. */
const courseMedia = () =>
  COURSE.flatMap((u) => u.lessons)
    .flatMap((l) => [...l.vocab.flatMap((v) => [v.image, v.audio]), ...l.sentences.map((s) => s.audio)])
    .filter((f): f is string => !!f)
    .map(mediaUrl);

export const canDownload = () => typeof navigator !== 'undefined' && !!navigator.serviceWorker?.controller;

/**
 * Keeps the whole app, and the course's pictures and recordings, on this phone so it works fully
 * offline (the course itself is already saved by lib/courseSource.ts). Reports progress as it goes.
 */
export function downloadForOffline(onProgress: (done: number, total: number) => void): Promise<number> {
  return new Promise((resolve, reject) => {
    const worker = navigator.serviceWorker?.controller;
    if (!worker) return reject(new Error('no service worker'));
    const channel = new MessageChannel();
    channel.port1.onmessage = ({ data }) => {
      if (data.failed) reject(new Error('download failed'));
      else if (data.finished) resolve(data.total);
      else onProgress(data.done, data.total);
    };
    worker.postMessage({ type: 'download', media: courseMedia() }, [channel.port2]);
  });
}
