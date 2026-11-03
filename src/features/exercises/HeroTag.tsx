import { toBanglaDigits } from '../../lib/bangla';
import type { Exercise } from '../../types';

// A short Bangla name for each kind of question.
const LABELS: Record<Exercise['kind'], string> = {
  select: 'নতুন শব্দ',
  match: 'জোড়া মেলাও',
  translate: 'অনুবাদ',
  listen: 'শোনো',
  choice: 'মানে বোঝো',
  type: 'লেখো',
  fill: 'শব্দ বসাও',
  gaps: 'শূন্যস্থান',
  grammar: 'ব্যাকরণ',
  dialog: 'কথোপকথন',
  dictate: 'শুনে লেখো',
  speak: 'বলো',
};

/** The top line of the question card: what kind of question it is, and which one of how many. */
export function HeroTag({ kind, number, total }: { kind: Exercise['kind']; number: number; total: number }) {
  return (
    <div className="hero-tag">
      <span className="hero-kind" lang="bn">
        {LABELS[kind]}
      </span>
      <span className="hero-count" lang="bn">
        প্রশ্ন {toBanglaDigits(number)}/{toBanglaDigits(total)}
      </span>
    </div>
  );
}
