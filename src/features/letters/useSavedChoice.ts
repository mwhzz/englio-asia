import { useState } from 'react';

/** A small choice (like the writing style) remembered on this device. */
export function useSavedChoice<T extends string>(key: string, allowed: readonly T[], fallback: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key) as T | null;
      return saved && allowed.includes(saved) ? saved : fallback;
    } catch {
      return fallback;
    }
  });

  const set = (next: T) => {
    setValue(next);
    try {
      localStorage.setItem(key, next);
    } catch {
      // Not remembered this time.
    }
  };

  return [value, set] as const;
}
