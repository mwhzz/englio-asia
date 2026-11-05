import { Glyph } from '../../components/Glyph';

/** A small "Plus" tag with a lock, on units the owner made Plus-only (see the admin's Settings). */
export function PlusBadge() {
  return (
    <span className="plus-badge">
      <Glyph name="lock" size={13} />
      Plus
    </span>
  );
}
