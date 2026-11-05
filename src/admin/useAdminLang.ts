import { useEffect, useState, useSyncExternalStore } from 'react';
import { adminApi } from './adminApi';

/** A language as the admin lists it, with how much content it has (see server/languages.ts). */
export interface AdminLanguage {
  code: string;
  name: string;
  native: string;
  dir: 'ltr' | 'rtl';
  status: 'draft' | 'live';
  units: number;
  lessons: number;
  items: number;
  translated: number;
  grammar: number;
  stories: number;
  writing: number;
}

// The language the content pages are working on, shared by every page and remembered on this computer.
const KEY = 'englio-admin-lang';
const listeners = new Set<() => void>();
let current = (() => {
  try {
    return localStorage.getItem(KEY) || 'bn';
  } catch {
    return 'bn';
  }
})();

export function setAdminLang(code: string): void {
  current = code;
  try {
    localStorage.setItem(KEY, code);
  } catch {
    // Not remembered; fine.
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** The chosen content language ("bn", "ar", …). */
export const useAdminLang = () => useSyncExternalStore(subscribe, () => current);

/** The admin's languages, reloaded whenever `version` changes. */
export function useLanguages(version = 0) {
  const [languages, setLanguages] = useState<AdminLanguage[] | null>(null);
  useEffect(() => {
    adminApi<AdminLanguage[]>('GET', '/languages').then(setLanguages, () => setLanguages([]));
  }, [version]);
  return languages;
}
