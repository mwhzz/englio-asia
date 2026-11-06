const KEY = 'englio-source';

/**
 * Where a new learner came from: `?utm_source=facebook` (or `?ref=`, `?src=`) on the link they opened,
 * else "android-app" or another site, else "direct". Kept from the first visit and saved with the profile,
 * so the admin can see sign-ups by source (which campaign worked).
 */
export function captureSource(): void {
  try {
    if (localStorage.getItem(KEY)) return;
    const q = new URLSearchParams(location.search);
    const tagged = q.get('utm_source') ?? q.get('ref') ?? q.get('src');
    const campaign = q.get('utm_campaign');
    const referrer = document.referrer.startsWith('android-app://') ? 'android-app' : document.referrer ? new URL(document.referrer).hostname : '';
    const source = (tagged ? `${tagged}${campaign ? `/${campaign}` : ''}` : referrer || 'direct').toLowerCase().replace(/[^a-z0-9./_-]/g, '').slice(0, 60);
    localStorage.setItem(KEY, source || 'direct');
  } catch {
    // Unknown source; fine.
  }
}

export function signupSource(): string {
  try {
    return localStorage.getItem(KEY) ?? 'direct';
  } catch {
    return 'direct';
  }
}
