const KEY = 'englio:reminder-asked';

/**
 * Whether to offer the daily reminder after a lesson: once per phone (push is per phone), only where
 * notifications can work, and not when it's already on or the learner has blocked notifications.
 */
export function shouldAskReminder(alreadyOn: boolean): boolean {
  if (alreadyOn || typeof window === 'undefined') return false;
  if (!('Notification' in window) || !('PushManager' in window) || Notification.permission === 'denied') return false;
  try {
    return localStorage.getItem(KEY) === null;
  } catch {
    return false;
  }
}

export function markReminderAsked(): void {
  try {
    localStorage.setItem(KEY, String(Date.now()));
  } catch {
    // Private mode: it may ask again next time, which is fine.
  }
}
