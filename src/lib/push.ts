import { deviceId } from '../state/useProgressSync';
import { API_BASE } from './api';

/** The server's public VAPID key (set VITE_VAPID_PUBLIC_KEY at build time; see docs/SERVER.md). */
const VAPID = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

export type PushResult = 'on' | 'denied' | 'unsupported' | 'no-server';

const supported = () => typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;

function keyBytes(base64: string): Uint8Array {
  const raw = atob((base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/**
 * Turns on the daily reminder: asks for notification permission, subscribes this device to push,
 * and tells the server the hour to remind at. Without a VAPID key the server can't send yet ("no-server").
 */
export async function enableReminder(hour: number): Promise<PushResult> {
  if (!supported()) return 'unsupported';
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return 'denied';
  if (!VAPID) return 'no-server';
  const reg = await navigator.serviceWorker.ready;
  const subscription =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(VAPID) as BufferSource }));
  await fetch(`${API_BASE}/users/${deviceId()}/push`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ subscription: subscription.toJSON(), hour, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
  });
  return 'on';
}

/** Turns the reminder off on this device and on the server. */
export async function disableReminder(): Promise<void> {
  if (!supported()) return;
  const reg = await navigator.serviceWorker.getRegistration();
  await (await reg?.pushManager.getSubscription())?.unsubscribe();
  await fetch(`${API_BASE}/users/${deviceId()}/push`, { method: 'DELETE' }).catch(() => undefined);
}
