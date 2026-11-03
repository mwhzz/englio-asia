import { useCallback, useEffect, useState } from 'react';
import { adminApi, Unauthorized } from './adminApi';

/** Loads an admin endpoint; `reload` fetches it again after a change. */
export function useAdminData<T>(path: string, onUnauthorized: () => void) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    adminApi<T>('GET', path)
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((e: Error) => (e instanceof Unauthorized ? onUnauthorized() : setError(e.message)));
  }, [path, onUnauthorized]);

  useEffect(reload, [reload]);
  return { data, error, reload };
}
