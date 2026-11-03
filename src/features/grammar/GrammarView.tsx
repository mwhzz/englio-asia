import { useState, type CSSProperties } from 'react';
import { Glyph } from '../../components/Glyph';
import { GRAMMAR, LEVELS } from '../../data/grammar';
import { COURSES, lessonsOf } from '../../data/grammarCourses';
import { toBanglaDigits } from '../../lib/bangla';
import { useProgress } from '../../state/ProgressContext';
import type { GrammarLevel, GrammarTopic } from '../../types';
import { searchTopics } from './searchTopics';
import { TopicPage } from './TopicPage';

type Filter = 'all' | GrammarLevel | 'saved';

const FILTERS: { id: Filter; bn: string }[] = [
  { id: 'all', bn: 'সব' },
  ...LEVELS.map((l) => ({ id: l.id, bn: l.bn })),
  { id: 'saved', bn: 'সংরক্ষিত' },
];

const toggle = (list: string[] = [], id: string, on: boolean) => (on ? [...new Set([...list, id])] : list.filter((x) => x !== id));

/** The grammar page: search, filter by level or bookmarks, and every topic grouped by level. */
export default function GrammarView() {
  const { progress, update } = useProgress();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [open, setOpen] = useState<string | null>(null);
  const learned = progress.grammarLearned ?? [];
  const saved = progress.grammarSaved ?? [];

  const found = searchTopics(GRAMMAR, query).filter((t) => (filter === 'all' ? true : filter === 'saved' ? saved.includes(t.id) : t.level === filter));
  const groups = LEVELS.map((level) => ({ level, topics: found.filter((t) => t.level === level.id) })).filter((g) => g.topics.length);
  const openIndex = GRAMMAR.findIndex((t) => t.id === open);
  const topic = GRAMMAR[openIndex];

  const row = (t: GrammarTopic, n: number) => (
    <button key={t.id} className="pf-row gr-row" onClick={() => setOpen(t.id)}>
      <span className="gr-num" lang="bn">
        {learned.includes(t.id) ? <Glyph name="check" size={14} /> : toBanglaDigits(n)}
      </span>
      <span className="pf-row-text">
        <span className="gr-title">
          {t.title}
          {saved.includes(t.id) && <Glyph name="bookmark" size={12} className="gr-saved" />}
        </span>
        <small lang="bn">{t.titleBn}</small>
      </span>
      {COURSES[t.id] && (
        <span className="gr-course" lang="bn">
          {toBanglaDigits(lessonsOf(COURSES[t.id]).length)} লেসন
        </span>
      )}
      <Glyph name="chevron" size={16} className="pf-chevron" />
    </button>
  );

  return (
    <div className="gr">
      <header className="pf-head">
        <h1 lang="bn">ব্যাকরণ</h1>
        <small>Grammar</small>
      </header>

      <label className="gr-search">
        <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
          <path d="M15.5 15.5 20 20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search: tense, article, voice…" aria-label="Search topics" />
        {query && (
          <button onClick={() => setQuery('')} aria-label="Clear search">
            <Glyph name="close" size={12} />
          </button>
        )}
      </label>

      <div className="gr-filters" role="radiogroup" aria-label="Filter topics">
        {FILTERS.map((f) => (
          <button key={f.id} role="radio" aria-checked={filter === f.id} className={filter === f.id ? 'is-on' : undefined} onClick={() => setFilter(f.id)}>
            <span lang="bn">{f.bn}</span>
          </button>
        ))}
      </div>

      <p className="lt-progress" lang="bn">
        <span className="lt-progress-bar" aria-hidden="true">
          <span style={{ width: `${(100 * learned.length) / Math.max(1, GRAMMAR.length)}%` }} />
        </span>
        {toBanglaDigits(learned.length)}/{toBanglaDigits(GRAMMAR.length)} টপিক শেখা হয়েছে
      </p>

      {groups.map(({ level, topics }) => (
        <section key={level.id} className="pf-section is-plain" style={{ '--u': level.color } as CSSProperties}>
          <h2 className="pf-list-title gr-level">
            <span className="gr-dot" />
            <span lang="bn">{level.bn}</span> <small>{level.en}</small>
          </h2>
          <div className="pf-list">{topics.map((t) => row(t, GRAMMAR.indexOf(t) + 1))}</div>
        </section>
      ))}

      {!groups.length && (
        <p className="gr-empty" lang="bn">
          {filter === 'saved' && !query ? 'এখনো কোনো টপিক সংরক্ষণ করোনি। টপিকের উপরে ডানের চিহ্নে চাপ দাও।' : 'কিছু পাওয়া যায়নি।'}
        </p>
      )}

      {topic && (
        <TopicPage
          topic={topic}
          next={GRAMMAR[openIndex + 1]}
          learned={learned.includes(topic.id)}
          saved={saved.includes(topic.id)}
          onLearned={(on) => update((p) => ({ ...p, grammarLearned: toggle(p.grammarLearned, topic.id, on) }))}
          onSaved={(on) => update((p) => ({ ...p, grammarSaved: toggle(p.grammarSaved, topic.id, on) }))}
          onGo={setOpen}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}
