import { Glyph, type GlyphName } from '../../components/Glyph';
import { ALL_LESSONS } from '../../data/course';
import { toBanglaDigits } from '../../lib/bangla';
import { currentStreak } from '../../lib/streak';
import { useProgress } from '../../state/ProgressContext';

interface Tile {
  icon: GlyphName;
  color: string;
  value: string;
  bn: string;
  en: string;
}

/** Four numbers in a 2×2 grid, each with a colored icon tile like iOS Settings. */
export function StatTiles() {
  const { progress } = useProgress();
  const done = ALL_LESSONS.filter((x) => progress.completed[x.lesson.id]);
  const words = done.reduce((sum, x) => sum + x.lesson.vocab.length, 0);

  const tiles: Tile[] = [
    {
      icon: 'flame',
      color: 'var(--ios-orange)',
      value: toBanglaDigits(currentStreak(progress)),
      bn: 'দিনের স্ট্রিক',
      en: progress.streakFreezes ? `Day streak · ${progress.streakFreezes} freeze` : 'Day streak',
    },
    { icon: 'gem', color: '#ffb800', value: toBanglaDigits(progress.xp), bn: 'মোট XP', en: 'Total XP' },
    { icon: 'book', color: 'var(--ios-green)', value: `${toBanglaDigits(done.length)}/${toBanglaDigits(ALL_LESSONS.length)}`, bn: 'লেসন শেষ', en: 'Lessons' },
    { icon: 'star', color: 'var(--ios-blue)', value: toBanglaDigits(words), bn: 'শেখা শব্দ', en: 'Words learned' },
  ];

  return (
    <div className="pf-stats">
      {tiles.map((t) => (
        <div key={t.en} className="pf-stat">
          <span className="pf-icon" style={{ background: t.color }}>
            <Glyph name={t.icon} size={17} />
          </span>
          <strong lang="bn">{t.value}</strong>
          <span className="pf-stat-label">
            <span lang="bn">{t.bn}</span>
            <small>{t.en}</small>
          </span>
        </div>
      ))}
    </div>
  );
}
