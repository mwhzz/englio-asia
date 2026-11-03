import { Glyph } from '../../components/Glyph';
import { toBanglaDigits } from '../../lib/bangla';

/** A small caption on the result after three or more right answers in a row. */
export function ComboPill({ combo }: { combo: number }) {
  return (
    <p className="combo" key={combo} role="status" lang="bn">
      <Glyph name="flame" size={13} />
      {toBanglaDigits(combo)}টা একটানা ঠিক!
    </p>
  );
}
