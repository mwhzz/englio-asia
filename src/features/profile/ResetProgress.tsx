import { Modal } from '../../components/Modal';
import { DEFAULT_PROGRESS } from '../../lib/progress';
import { useProgress } from '../../state/ProgressContext';

/** Asks first, then erases XP, streak and lessons (the profile and settings stay). */
export function ResetProgress({ onClose }: { onClose: () => void }) {
  const { update } = useProgress();

  return (
    <Modal onClose={onClose}>
      <h2 lang="bn">সব অগ্রগতি মুছে ফেলবে?</h2>
      <p className="muted" lang="bn">
        XP, স্ট্রিক আর শেষ করা লেসন মুছে যাবে। এটা আর ফেরানো যাবে না।
      </p>
      <div className="cta-stack">
        <button
          className="cta cta-red"
          onClick={() => {
            update((p) => ({ ...DEFAULT_PROGRESS, profile: p.profile, dailyGoal: p.dailyGoal, soundOn: p.soundOn }));
            onClose();
          }}
        >
          <span lang="bn">মুছে ফেলো</span>
        </button>
        <button className="cta-text" onClick={onClose}>
          <span lang="bn">বাতিল</span>
        </button>
      </div>
    </Modal>
  );
}
