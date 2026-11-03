import type { CSSProperties } from 'react';
import { Logo } from '../../components/Logo';
import { ObButton } from './ObButton';

interface Props {
  mapSlot: (el: HTMLDivElement | null) => void;
  onNext: () => void;
}

export function WelcomeStep({ mapSlot, onNext }: Props) {
  return (
    <div className="ob-screen ob-welcome">
      <header className="ob-brand ob-rise">
        <Logo size={38} />
      </header>

      <div ref={mapSlot} className="ob-map-slot" />

      <div className="ob-copy">
        <h1 className="ob-title ob-rise" style={{ '--i': 1 } as CSSProperties} lang="bn">
          ইংরেজি শেখো,
          <br />
          নিজের মতো করে।
        </h1>
        <p className="ob-sub ob-rise" style={{ '--i': 2 } as CSSProperties}>
          Learn English, made for learners in all 64 districts of Bangladesh.
        </p>
      </div>

      <div className="ob-rise" style={{ '--i': 3 } as CSSProperties}>
        <ObButton onClick={onNext}>
          <span lang="bn">শুরু করো</span>
        </ObButton>
      </div>
    </div>
  );
}
