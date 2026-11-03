import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { regenHearts } from '../lib/hearts';
import { DEFAULT_PROGRESS, type Progress } from '../lib/progress';
import { setSoundEnabled } from '../lib/sounds';
import { useProgressSync } from './useProgressSync';

export const STORAGE_KEY = 'englio-progress-v1';

interface ProgressApi {
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
}

const ProgressCtx = createContext<ProgressApi | null>(null);

function load(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_PROGRESS, ...JSON.parse(raw) };
  } catch {
    // Storage blocked or corrupt: start fresh.
  }
  return DEFAULT_PROGRESS;
}

/** `memoryOnly`: fresh progress that is never saved or synced (the admin's preview tab). */
export function ProgressProvider({ children, memoryOnly = false }: { children: ReactNode; memoryOnly?: boolean }) {
  const [progress, setProgress] = useState(() => (memoryOnly ? DEFAULT_PROGRESS : regenHearts(load(), Date.now())));

  useEffect(() => {
    setSoundEnabled(progress.soundOn);
    if (memoryOnly) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Progress just won't persist in this browser.
    }
  }, [progress, memoryOnly]);

  useEffect(() => {
    const timer = setInterval(() => setProgress((p) => regenHearts(p, Date.now())), 15_000);
    return () => clearInterval(timer);
  }, []);

  useProgressSync(progress, !memoryOnly);

  return <ProgressCtx.Provider value={{ progress, update: setProgress }}>{children}</ProgressCtx.Provider>;
}

export function useProgress(): ProgressApi {
  const api = useContext(ProgressCtx);
  if (!api) throw new Error('useProgress must be used inside <ProgressProvider>');
  return api;
}
