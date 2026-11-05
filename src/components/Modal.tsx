import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useBackButton } from '../lib/backButton';

/**
 * An iOS bottom sheet over a dimmed screen. It renders into <body>, so a parent with a
 * transform or animation (which would trap a fixed element) can't squeeze it into itself.
 */
export function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  useBackButton(onClose);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="overlay" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body,
  );
}
