import type { ReactNode } from 'react';

/** The sentence to work with, as the colored hero card of the exercise. */
export function PromptCard({ children }: { children: ReactNode }) {
  return <div className="qcard hero">{children}</div>;
}
