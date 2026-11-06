const KEY = 'englio-android-app';

/**
 * Whether the app runs inside the Android app (the Play Store's, or the APK from the site): a Trusted Web
 * Activity opens the site with the referrer android-app://<package>. It's remembered, because the referrer
 * is only there on the first page. Inside the Android app bKash isn't offered (Google requires Play Billing
 * for digital goods sold in a Play app).
 */
export function detectAndroidApp(): void {
  try {
    if (document.referrer.startsWith('android-app://') || new URLSearchParams(location.search).get('source') === 'twa') localStorage.setItem(KEY, '1');
  } catch {
    // Not remembered; treated as the website.
  }
}

export function isAndroidApp(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}
