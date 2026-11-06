import { useEffect, useState } from 'react';
import { API_BASE } from '../../lib/api';
import { appSettings, setAppSettings } from '../../lib/appSettings';

/**
 * The owner's settings, fresh from /api/settings when the app opens and whenever it comes back to the
 * front (so a notice or maintenance switch shows within moments). Offline, the copy from the course stays.
 */
export function useLiveSettings() {
  const [, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    const load = () =>
      fetch(`${API_BASE}/settings`, { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((s) => {
          if (!live || !s) return;
          setAppSettings(s);
          setTick((n) => n + 1);
        })
        .catch(() => undefined);
    load();
    const onShow = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onShow);
    return () => {
      live = false;
      document.removeEventListener('visibilitychange', onShow);
    };
  }, []);
  return appSettings();
}
