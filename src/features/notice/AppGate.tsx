import type { ReactNode } from 'react';
import { Logo } from '../../components/Logo';
import { olderThan } from '../../data/appSettings';
import { APP_VERSION } from '../../lib/version';
import { useLiveSettings } from './useLiveSettings';
import '../../styles/notice.css';

/** Gets the newest app: the service worker drops its saved copy, then the page loads fresh from the server. */
async function updateNow() {
  try {
    const regs = (await navigator.serviceWorker?.getRegistrations()) ?? [];
    await Promise.all(regs.map((r) => r.update().catch(() => undefined)));
    const keys = (await caches?.keys()) ?? [];
    await Promise.all(keys.map((k) => caches.delete(k)));
  } catch {
    // Reload anyway.
  }
  location.reload();
}

/**
 * Before the app: maintenance mode (the owner's message instead of lessons) and "please update" for an
 * app older than the owner's minimum version. Both are switched in the admin (সেটিংস → সবাইকে বার্তা).
 */
export function AppGate({ children }: { children: ReactNode }) {
  const settings = useLiveSettings();
  if (settings.maintenance.on) {
    return (
      <div className="gate" role="alert">
        <Logo size={44} />
        <h1 lang="bn">একটু কাজ চলছে</h1>
        <p lang="bn">{settings.maintenance.text || 'আমরা অ্যাপটা আরো ভালো করছি। একটু পরে আবার এসো।'}</p>
        <p className="gate-note" lang="bn">
          তোমার অগ্রগতি নিরাপদে আছে।
        </p>
        <button className="cta" onClick={() => location.reload()}>
          <span lang="bn">আবার দেখো</span>
        </button>
      </div>
    );
  }
  if (settings.minVersion && olderThan(APP_VERSION, settings.minVersion)) {
    return (
      <div className="gate" role="alert">
        <Logo size={44} />
        <h1 lang="bn">নতুন ভার্সন এসেছে</h1>
        <p lang="bn">অ্যাপের নতুন ভার্সন লাগবে। এক চাপেই হয়ে যাবে, অগ্রগতি যেমন আছে তেমনই থাকবে।</p>
        <button className="cta" onClick={updateNow}>
          <span lang="bn">আপডেট করো</span>
        </button>
      </div>
    );
  }
  return <>{children}</>;
}
