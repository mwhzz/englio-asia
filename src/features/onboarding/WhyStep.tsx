import type { CSSProperties } from 'react';
import { haptic } from '../../lib/haptics';
import { target } from '../../lib/target';
import { ObButton } from './ObButton';

/** Why the learner is learning; kept on the profile so examples can follow it. Several can be picked. */
export const GOALS = [
  { id: 'work', bn: 'কাজ ও চাকরি', hint: 'অফিস, ইন্টারভিউ, দোকান' },
  { id: 'abroad', bn: 'বিদেশ যাওয়া', hint: 'এয়ারপোর্ট, ভিসা, কাজের জায়গা' },
  { id: 'exam', bn: 'পরীক্ষা', hint: 'SSC, HSC, IELTS' },
  { id: 'quran', bn: 'কুরআন পড়া', hint: 'হরফ, হরকত, পড়া', arabicOnly: true },
  { id: 'travel', bn: 'ঘোরাঘুরি', hint: 'হোটেল, পথ, খাবার' },
  { id: 'fun', bn: 'এমনি শখে', hint: 'গল্প, গান, সিনেমা' },
] as const;

export function WhyStep({ goals, onChange, onNext }: { goals: string[]; onChange: (goals: string[]) => void; onNext: () => void }) {
  const list = GOALS.filter((g) => !('arabicOnly' in g) || target() === 'ar');
  const toggle = (id: string) => {
    haptic();
    onChange(goals.includes(id) ? goals.filter((g) => g !== id) : [...goals, id]);
  };
  return (
    <div className="ob-screen ob-scroll">
      <header className="ob-head ob-rise">
        <h1 className="ob-title" lang="bn">
          কেন শিখছ?
        </h1>
        <p className="ob-sub" lang="bn">
          একাধিক বাছা যায়। যা বাছবে, সেই রকম উদাহরণ বেশি আসবে।
        </p>
      </header>
      <div className="ob-why ob-rise" style={{ '--i': 1 } as CSSProperties} role="group" aria-label="কেন শিখছ?">
        {list.map((g) => (
          <button key={g.id} type="button" aria-pressed={goals.includes(g.id)} className={`ob-why-chip${goals.includes(g.id) ? ' is-on' : ''}`} onClick={() => toggle(g.id)}>
            <strong lang="bn">{g.bn}</strong>
            <small lang="bn">{g.hint}</small>
          </button>
        ))}
      </div>
      <div className="ob-grow" />
      <div className="ob-sticky-cta ob-rise" style={{ '--i': 2 } as CSSProperties}>
        <ObButton onClick={onNext}>
          <span lang="bn">{goals.length ? 'পরবর্তী' : 'পরে বলব'}</span>
        </ObButton>
      </div>
    </div>
  );
}
