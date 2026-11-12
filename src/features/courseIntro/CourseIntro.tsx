import { useState } from 'react';
import { coursesForMe, isBangla, learnerLang, uiLang } from '../../lib/learnerLang';
import { haptic } from '../../lib/haptics';
import { markIntroSeen, requestFirstLesson } from '../../lib/courseIntro';
import { target } from '../../lib/target';
import { track } from '../../lib/track';
import { ObButton } from '../onboarding/ObButton';
import { TasteStep } from '../onboarding/TasteStep';
import '../../styles/onboarding.css';
import '../../styles/onboardingSteps.css';

/** What each course teaches, in three lines. */
const WHAT = {
  ar: ['২৮টা হরফ, ৫টা করে', 'হরকত দেখে পড়া, বিসমিল্লাহ পর্যন্ত', 'তারপর প্রথম কথা: আমি, এটা, আমার আছে'],
  en: ['নিজের পরিচয় দেওয়া', 'রোজকার কথা: বাজার, পথ, ফোন, ডাক্তার', 'A1 থেকে B2, ধাপে ধাপে'],
} as const;

/**
 * A course started for the first time on this phone (e.g. Arabic after English, or the other way): what it
 * teaches, a 30-second taste, then "new" (its first lesson opens) or "I know some" (the placement test).
 */
export function CourseIntro({ onDone, onPlacement }: { onDone: () => void; onPlacement: () => void }) {
  const [step, setStep] = useState<'what' | 'taste' | 'level'>('what');
  const course = coursesForMe().find((c) => c.code === learnerLang());
  const name = !course || course.code === uiLang() ? 'English' : course.target === 'ar' ? 'العربية' : course.native;
  const ar = target() === 'ar';

  function finish(placement: boolean) {
    haptic();
    markIntroSeen(learnerLang());
    track('onboard', `intro-${learnerLang()}-${placement ? 'placement' : 'new'}`);
    if (placement) onPlacement();
    else {
      requestFirstLesson();
      onDone();
    }
  }

  return (
    <div className="ob">
      {step === 'what' && (
        <div className="ob-screen ob-scroll">
          <div className="ob-grow" />
          <div className="ob-intro-mark ob-rise">
            <span className={ar ? 'ob-ar' : undefined}>{ar ? 'ع' : 'Aa'}</span>
          </div>
          <header className="ob-head ob-rise" style={{ textAlign: 'center' }}>
            <p className="ob-kicker" lang="bn">
              নতুন ভাষা
            </p>
            <h1 className="ob-title">
              <span className={ar ? 'ob-ar' : undefined}>{name}</span>
            </h1>
            <p className="ob-sub" lang="bn">
              স্ট্রিক আর XP আগের মতোই চলবে। এই ভাষার পথ আলাদা।
            </p>
          </header>
          <ol className="ob-what ob-rise">
            {WHAT[ar ? 'ar' : 'en'].map((line, i) => (
              <li key={i} lang="bn">
                <span aria-hidden="true">{['১', '২', '৩'][i]}</span>
                {line}
              </li>
            ))}
          </ol>
          <div className="ob-grow" />
          <div className="ob-sticky-cta">
            <ObButton onClick={() => setStep(isBangla() ? 'taste' : 'level')}>
              <span lang="bn">শুরু করি</span>
            </ObButton>
          </div>
        </div>
      )}
      {step === 'taste' && <TasteStep onNext={() => setStep('level')} />}
      {step === 'level' && (
        <div className="ob-screen ob-scroll">
          <header className="ob-head ob-rise">
            <h1 className="ob-title" lang="bn">
              কতটুকু জানো?
            </h1>
            <p className="ob-sub" lang="bn">
              ঠিক জায়গা থেকে শুরু করব, যাতে খুব সহজ বা খুব কঠিন না লাগে।
            </p>
          </header>
          <div className="ob-list ob-rise">
            <button type="button" className="ob-list-row" onClick={() => finish(false)}>
              <span className="ob-list-text">
                <strong lang="bn">একদম নতুন</strong>
                <small lang="bn">{ar ? 'হরফ থেকে শুরু, প্রথম ৫টা হরফ এখনই।' : 'প্রথম ইউনিট থেকে শুরু।'}</small>
              </span>
            </button>
            <button type="button" className="ob-list-row" onClick={() => finish(true)}>
              <span className="ob-list-text">
                <strong lang="bn">আগে থেকে কিছু জানি</strong>
                <small lang="bn">ছোট একটা লেভেল টেস্ট দিয়ে ঠিক ইউনিটে পাঠাব।</small>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
