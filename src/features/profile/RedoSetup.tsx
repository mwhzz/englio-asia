import { Modal } from '../../components/Modal';
import { useProgress } from '../../state/ProgressContext';

/** Asks first, then clears the profile so onboarding runs again. Learning progress is kept. */
export function RedoSetup({ onClose }: { onClose: () => void }) {
  const { update } = useProgress();

  return (
    <Modal onClose={onClose}>
      <h2 lang="bn">প্রোফাইল আবার সেট আপ করবে?</h2>
      <p className="muted" lang="bn">
        জেলা, নাম আর ক্লাস আবার বেছে নেবে। তোমার XP, স্ট্রিক আর লেসন যেমন আছে তেমনই থাকবে।
      </p>
      <div className="cta-stack">
        <button className="cta" onClick={() => update((p) => ({ ...p, profile: null }))}>
          <span lang="bn">শুরু করো</span>
        </button>
        <button className="cta-text" onClick={onClose}>
          <span lang="bn">বাতিল</span>
        </button>
      </div>
    </Modal>
  );
}
