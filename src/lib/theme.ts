export type Theme = 'auto' | 'light' | 'dark';

const KEY = 'englio-theme';

/** The learner's choice; light (white) unless they picked dark or "follow the phone" in Settings. */
export function savedTheme(): Theme {
  try {
    const t = localStorage.getItem(KEY);
    return t === 'dark' || t === 'auto' ? t : 'light';
  } catch {
    return 'light';
  }
}

/** Applies a theme: "auto" follows the phone; light/dark set <html data-theme> (see the dark blocks in the CSS). */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'auto') delete root.dataset.theme;
  else root.dataset.theme = theme;
}

export function setTheme(theme: Theme): void {
  applyTheme(theme);
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // Applied for now; not remembered.
  }
}
