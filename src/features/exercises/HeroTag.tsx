import { toBanglaDigits } from '../../lib/bangla';
import type { Exercise } from '../../types';

// A short Bangla name for each kind of question.
const LABELS: Record<Exercise['kind'], string> = {
  select: 'নতুন শব্দ',
  hearWord: 'শুনে বাছো',
  match: 'জোড়া মেলাও',
  translate: 'অনুবাদ',
  listen: 'শোনো',
  choice: 'মানে বোঝো',
  hear: 'শুনে বোঝো',
  type: 'লেখো',
  fill: 'শব্দ বসাও',
  gaps: 'শূন্যস্থান',
  grammar: 'ব্যাকরণ',
  dialog: 'কথোপকথন',
  dictate: 'শুনে লেখো',
  speak: 'বলো',
};

/** The top line of the question card: what kind of question it is, and which one of how many. */
export function HeroTag({ kind, number, total, again = false }: { kind: Exercise['kind']; number: number; total: number; again?: boolean }) {
  return (
    <div className="hero-tag">
      <span className="hero-kind" lang="bn">
        {LABELS[kind]}
      </span>
      <span className="hero-count" lang="bn">
        {again ? 'আবার · ' : ''}প্রশ্ন {toBanglaDigits(number)}/{toBanglaDigits(total)}
      </span>
    </div>
  );
}
