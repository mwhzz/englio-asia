// The lesson just finished, so Home can show it turning done on the path (a small pop), once.
const KEY = 'englio-just-done';

export function markJustDone(lessonId: string): void {
  try {
    sessionStorage.setItem(KEY, lessonId);
  } catch {
    // Without storage there's no pop, nothing more.
  }
}

/** The lesson to pop on the path, read once. */
export function takeJustDone(): string | null {
  try {
    const id = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return id;
  } catch {
    return null;
  }
}
