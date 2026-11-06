import { useEffect, useState } from 'react';
import { API_BASE } from '../../lib/api';
import { deviceId } from '../../state/useProgressSync';
import type { MyReport } from './MyReports';

const SENT = 'englio-reported';
const SEEN = 'englio-replies-seen';

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Not remembered.
  }
};

/** Remembers that this learner sent a report, so the app checks for replies (only then). */
export const markReported = () => write(SENT, '1');

/** Marks every reply as read (the help page was opened). */
export const markRepliesSeen = () => write(SEEN, new Date().toISOString());

/** The replies to this learner's reports that came after they last opened the help page. */
export function useNewReplies(): MyReport[] {
  const [fresh, setFresh] = useState<MyReport[]>([]);
  useEffect(() => {
    if (!read(SENT)) return;
    const seen = read(SEEN) ?? '';
    fetch(`${API_BASE}/users/${deviceId()}/reports`)
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: (MyReport & { updatedAt?: string })[]) => setFresh(rows.filter((r) => r.reply && (r.updatedAt ?? '') > seen)))
      .catch(() => undefined);
  }, []);
  return fresh;
}
