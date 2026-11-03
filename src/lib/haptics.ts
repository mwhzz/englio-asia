/** A tiny vibration on supported phones (Android); silently does nothing elsewhere. */
export function haptic(ms = 8): void {
  try {
    navigator.vibrate?.(ms);
  } catch {
    // Not supported.
  }
}
