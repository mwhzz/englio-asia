import { Glyph } from '../../components/Glyph';
import { useSyncStatus } from '../../state/useProgressSync';

/** A quiet note while progress couldn't reach the server: it's safe on the phone and goes up when online. */
export function SyncNote() {
  const status = useSyncStatus();
  if (status !== 'offline') return null;
  return (
    <p className="sync-note" role="status" lang="bn">
      <Glyph name="clock" size={14} />
      ইন্টারনেট নেই। অগ্রগতি ফোনে সেভ আছে, নেট এলেই সার্ভারে যাবে।
    </p>
  );
}
