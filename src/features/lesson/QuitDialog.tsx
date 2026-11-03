import { Modal } from '../../components/Modal';

/** An iOS bottom sheet asking whether to leave the lesson. */
export function QuitDialog({ onStay, onQuit }: { onStay: () => void; onQuit: () => void }) {
  return (
    <Modal onClose={onStay}>
      <h2 lang="bn">লেসন ছেড়ে যাবে?</h2>
      <p className="muted" lang="bn">
        এখন বের হলে এই লেসনের অগ্রগতি হারিয়ে যাবে।
      </p>
      <div className="cta-stack">
        <button className="cta" onClick={onStay}>
          <span lang="bn">শিখতে থাকি</span>
        </button>
        <button className="cta-text is-danger" onClick={onQuit}>
          <span lang="bn">লেসন ছেড়ে দাও</span>
        </button>
      </div>
    </Modal>
  );
}
