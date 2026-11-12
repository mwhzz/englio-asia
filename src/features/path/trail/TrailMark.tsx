import type { Unit } from '../../../types';

/**
 * What a unit is about, as one large faint word behind its stops: its first letters in a letters unit
 * ("ا ب ت"), else its first word ("hello", "بَاب"). Typography instead of pictures keeps the page calm.
 */
export function unitMark(unit: Unit): string {
  const words = unit.lessons[0]?.vocab.map((v) => v.en) ?? [];
  if (!words.length) return unit.title;
  const letters = words.every((w) => [...w].length <= 2);
  return letters ? words.slice(0, 3).join(' ') : words[0];
}

export function TrailMark({ unit }: { unit: Unit }) {
  const mark = unitMark(unit);
  const arabic = /[؀-ۿ]/.test(mark);
  return (
    <div className="trail-mark" aria-hidden="true">
      <span className={arabic ? 'is-ar' : undefined} dir={arabic ? 'rtl' : undefined}>
        {mark}
      </span>
    </div>
  );
}
