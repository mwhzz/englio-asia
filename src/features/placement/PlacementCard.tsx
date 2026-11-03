import { Glyph } from '../../components/Glyph';
import { findClassLevel } from '../../data/classLevels';
import { useProgress } from '../../state/ProgressContext';

/** On the home page for new learners: offers the level test, worded for their class. */
export function PlacementCard({ onStart }: { onStart: () => void }) {
  const { progress, update } = useProgress();
  const level = findClassLevel(progress.profile?.classId);
  const young = level?.stage === 'primary';

  return (
    <div className="pc">
      <span className="pc-icon" aria-hidden="true">
        <Glyph name="target" size={20} />
      </span>
      <span className="pc-text">
        <strong lang="bn">আগে থেকে ইংরেজি জানো?</strong>
        <small lang="bn">
          {young ? 'শুরু থেকে করাই ভালো, তবে চাইলে লেভেল টেস্ট দিতে পারো।' : '২–৫ মিনিটের লেভেল টেস্ট দাও, জানা ইউনিটগুলো পার হয়ে যাবে।'}
        </small>
        <span className="pc-actions">
          <button className="pc-go" onClick={onStart}>
            <span lang="bn">লেভেল টেস্ট দাও</span>
          </button>
          <button className="pc-skip" onClick={() => update((p) => ({ ...p, placementTaken: true }))}>
            <span lang="bn">দরকার নেই</span>
          </button>
        </span>
      </span>
    </div>
  );
}
