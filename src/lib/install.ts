/** Chrome's install prompt event (not in the DOM typings yet). */
interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: InstallPrompt | null = null;
const listeners = new Set<() => void>();
const changed = () => listeners.forEach((fn) => fn());

// The event fires once, early, so it's caught here at startup and kept until the learner taps "install".
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallPrompt;
    changed();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    changed();
  });
}

export type InstallState = 'installed' | 'ready' | 'ios' | 'none';

/** Whether the app can be installed here: a ready prompt (Android/desktop Chrome), iOS's manual way, or neither. */
export function installState(): InstallState {
  if (window.matchMedia?.('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone) return 'installed';
  if (deferred) return 'ready';
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) return 'ios';
  return 'none';
}

/** Shows the browser's install dialog; true if the learner accepted. */
export async function install(): Promise<boolean> {
  if (!deferred) return false;
  await deferred.prompt();
  const { outcome } = await deferred.userChoice;
  deferred = null;
  changed();
  return outcome === 'accepted';
}

export function onInstallChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
