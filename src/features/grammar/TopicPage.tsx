import { useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Glyph } from '../../components/Glyph';
import { MixedText } from '../../components/MixedText';
import { SpeakButton } from '../../components/SpeakButton';
import { levelOf } from '../../data/grammar';
import { COURSES, lessonsOf } from '../../data/grammarCourses';
import { toBanglaDigits } from '../../lib/bangla';
import { useProgress } from '../../state/ProgressContext';
import type { GrammarTopic } from '../../types';
import { CoursePage } from './course/CoursePage';
import { TopicQuiz } from './TopicQuiz';
import { useBackButton } from '../../lib/backButton';
import { TapText } from '../../components/TapText';

interface Props {
  topic: GrammarTopic;
  next?: GrammarTopic;
  learned: boolean;
  saved: boolean;
  onLearned: (learned: boolean) => void;
  onSaved: (saved: boolean) => void;
  onGo: (id: string) => void;
  onClose: () => void;
}

/** One grammar topic, full screen: explanation, patterns, table, examples, common mistakes and a quiz. */
export function TopicPage({ topic, next, learned, saved, onLearned, onSaved, onGo, onClose }: Props) {
  useBackButton(onClose);
  const level = levelOf(topic.level);
  const { progress } = useProgress();
  const course = COURSES[topic.id];
  const courseLessons = course ? lessonsOf(course) : [];
  const courseDone = courseLessons.filter((l) => progress.grammarLessonsDone?.includes(l.id)).length;
  const [courseOpen, setCourseOpen] = useState(false);

  return createPortal(
    <div className="gt" role="dialog" aria-label={topic.title} style={{ '--u': level.color } as CSSProperties}>
      <header className="lp-bar">
        <button className="lp-back" onClick={onClose} aria-label="Back to topics">
          <Glyph name="back" size={20} />
        </button>
        <span className="gt-level" lang="bn">
          {level.bn} · {level.en}
        </span>
        <button className={`gt-save${saved ? ' is-on' : ''}`} onClick={() => onSaved(!saved)} aria-pressed={saved} aria-label="Bookmark">
          <Glyph name="bookmark" size={18} />
        </button>
      </header>

      <div className="gt-body" key={topic.id}>
        <div className="gt-hero">
          <h1>{topic.title}</h1>
          <p className="gt-bn" lang="bn">
            {topic.titleBn}
          </p>
          <p className="gt-summary" lang="bn">
            <MixedText text={topic.summary} />
          </p>
        </div>

        {course && (
          <button className="gt-course" onClick={() => setCourseOpen(true)}>
            <span className="gt-course-icon" aria-hidden="true">
              <Glyph name="book" size={20} />
            </span>
            <span className="gt-course-text">
              <strong lang="bn">পুরো কোর্স · {toBanglaDigits(courseLessons.length)}টি লেসন</strong>
              <small lang="bn">
                {courseDone === 0
                  ? 'শুরু থেকে শেষ পর্যন্ত ধাপে ধাপে শেখো'
                  : `${toBanglaDigits(courseDone)}/${toBanglaDigits(courseLessons.length)} লেসন শেষ`}
              </small>
              <span className="cp-bar" aria-hidden="true">
                <span style={{ width: `${(100 * courseDone) / courseLessons.length}%` }} />
              </span>
            </span>
            <span className="gt-course-go" lang="bn">
              {courseDone === 0 ? 'শুরু করো' : courseDone === courseLessons.length ? 'দেখো' : 'চালিয়ে যাও'}
            </span>
          </button>
        )}

        <section className="gt-card">
          <h2 lang="bn">বুঝে নাও</h2>
          {topic.explain.map((p, i) => (
            <p key={i} className="gt-para" lang="bn">
              <MixedText text={p} />
            </p>
          ))}
        </section>

        {topic.formulas.length > 0 && (
          <section className="gt-card">
            <h2 lang="bn">গঠন</h2>
            <ul className="gt-formulas">
              {topic.formulas.map((f) => (
                <li key={f.label}>
                  <small lang="bn">{f.label}</small>
                  <span className="gt-parts">
                    {f.parts.map((part, i) => (
                      <span key={i} className="gt-part-wrap">
                        {i > 0 && <span className="gt-plus">+</span>}
                        <span className={`gt-part is-${i % 4}`}>{part}</span>
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {topic.table && (
          <section className="gt-card">
            <h2 lang="bn">ছক</h2>
            <div className="gt-table-wrap">
              <table className="gt-table">
                <thead>
                  <tr>
                    {topic.table[0].map((cell, i) => (
                      <th key={i} lang="bn">
                        <MixedText text={cell} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topic.table.slice(1).map((row, r) => (
                    <tr key={r}>
                      {row.map((cell, i) => (
                        <td key={i} lang="bn">
                          <MixedText text={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="gt-card">
          <h2 lang="bn">উদাহরণ</h2>
          <ul className="gt-examples">
            {topic.examples.map((e) => (
              <li key={e.en}>
                <SpeakButton text={e.en.split(' → ').pop()!} />
                <span>
                  <strong>
                    <TapText text={e.en} />
                  </strong>
                  <small lang="bn">
                    <MixedText text={e.bn} />
                  </small>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {topic.mistakes.length > 0 && (
          <section className="gt-card">
            <h2 lang="bn">সাধারণ ভুল</h2>
            <ul className="gt-mistakes">
              {topic.mistakes.map((m) => (
                <li key={m.wrong}>
                  <span className="gt-wrong">
                    <Glyph name="close" size={12} />
                    <s>{m.wrong}</s>
                  </span>
                  <span className="gt-right">
                    <Glyph name="check" size={13} />
                    {m.right}
                  </span>
                  <small lang="bn">
                    <MixedText text={m.note} />
                  </small>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="gt-card">
          <h2 lang="bn">যাচাই করো</h2>
          <TopicQuiz key={topic.id} quiz={topic.quiz} title={topic.title} where={`topic:${topic.id}`} color={level.color} onPassed={() => onLearned(true)} />
        </section>

        <div className="gt-foot">
          <button className={`gt-learned${learned ? ' is-on' : ''}`} onClick={() => onLearned(!learned)} aria-pressed={learned}>
            <Glyph name="check" size={16} />
            <span lang="bn">{learned ? 'শেখা হয়েছে' : 'শেখা হয়েছে হিসেবে চিহ্নিত করো'}</span>
          </button>
          {next && (
            <button className="gt-next" onClick={() => onGo(next.id)}>
              <span>
                <small lang="bn">পরের টপিক</small>
                <strong>{next.title}</strong>
              </span>
              <Glyph name="chevron" size={16} className="pf-chevron" />
            </button>
          )}
        </div>
      </div>
      {course && courseOpen && <CoursePage topic={topic} course={course} onClose={() => setCourseOpen(false)} />}
    </div>,
    document.body,
  );
}
