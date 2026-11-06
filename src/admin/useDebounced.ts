import { useEffect, useState } from 'react';

/** The value once it has stopped changing for `ms` (so a search box asks the server once, not on every letter). */
export function useDebounced<T>(value: T, ms = 350): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setSettled(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return settled;
}
