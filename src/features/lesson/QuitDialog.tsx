import { Modal } from '../../components/Modal';

/**
 * An iOS bottom sheet asking whether to leave the lesson. A lesson can be left for later (it carries on
 * from the same question when opened again within a few hours, lib/lessonResume.ts) or given up.
 */
export function QuitDialog({ onStay, onQuit, onLater }: { onStay: () => void; onQuit: () => void; onLater?: () => void }) {
  return (
    <Modal onClose={onStay}>
      <h2 lang="bn">লেসন ছেড়ে যাবে?</h2>
      <p className="muted" lang="bn">
        {onLater ? 'পরে চালিয়ে গেলে এই প্রশ্ন থেকেই শুরু হবে। ছেড়ে দিলে এই লেসনের অগ্রগতি মুছে যাবে।' : 'এখন বের হলে এই অনুশীলনের অগ্রগতি হারিয়ে যাবে।'}
      </p>
      <div className="cta-stack">
        <button className="cta" onClick={onStay}>
          <span lang="bn">শিখতে থাকি</span>
        </button>
        {onLater && (
          <button className="cta-text" onClick={onLater}>
            <span lang="bn">পরে চালিয়ে যাব</span>
          </button>
        )}
        <button className="cta-text is-danger" onClick={onQuit}>
          <span lang="bn">লেসন ছেড়ে দাও</span>
        </button>
      </div>
    </Modal>
  );
}
