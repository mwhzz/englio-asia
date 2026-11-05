import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Glyph } from '../../components/Glyph';
import { SpeakButton } from '../../components/SpeakButton';
import { toBanglaDigits } from '../../lib/bangla';
import { dayKey } from '../../lib/days';
import { haptic } from '../../lib/haptics';
import { recordLesson } from '../../lib/progress';
import { speak } from '../../lib/speech';
import { track } from '../../lib/track';
import { useProgress } from '../../state/ProgressContext';
import type { Story } from '../../types';
import { TopicQuiz } from '../grammar/TopicQuiz';
import { useBackButton } from '../../lib/backButton';
import { TapText } from '../../components/TapText';

const STORY_XP = 10;

/**
 * A story, one line at a time: each new line is read aloud, tapping a line shows its Bangla meaning,
 * and after the last line come a few questions. Finishing them the first time gives XP.
 */
export function StoryReader({ story, onClose }: { story: Story; onClose: () => void }) {
  useBackButton(onClose);
  const { progress, update } = useProgress();
  const [shown, setShown] = useState(1);
  const [meaning, setMeaning] = useState<number | null>(null);
  const [startedAt] = useState(() => Date.now());
  const end = useRef<HTMLDivElement>(null);
  const allShown = shown >= story.lines.length;
  const read = progress.storiesRead?.includes(story.id);

  useEffect(() => {
    speak(story.lines[shown - 1].en);
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [shown, story]);

  function finish() {
    track('story_done', story.id);
    if (read) return;
    update((p) => ({
      ...recordLesson(p, null, STORY_XP, dayKey(), Math.round((Date.now() - startedAt) / 1000)),
      storiesRead: [...new Set([...(p.storiesRead ?? []), story.id])],
    }));
  }

  return createPortal(
    <div className="gt st" role="dialog" aria-label={story.title} style={{ '--u': story.color } as CSSProperties}>
      <header className="lp-bar">
        <button className="lp-back" onClick={onClose} aria-label="Close story">
          <Glyph name="close" size={16} />
        </button>
        <div className="lg-progress" aria-hidden="true">
          <span style={{ width: `${(100 * shown) / story.lines.length}%`, background: story.color }} />
        </div>
        <span className="cl-num" lang="bn">
          {toBanglaDigits(shown)}/{toBanglaDigits(story.lines.length)}
        </span>
      </header>

      <div className="gt-body">
        <div className="gt-hero">
          <h1>{story.title}</h1>
          <p className="gt-bn" lang="bn">
            {story.titleBn}
          </p>
          <p className="gt-summary" lang="bn">
            লাইনে চাপ দিলে বাংলা মানে, কোনো শব্দে চাপ দিলে সেই শব্দের মানে
          </p>
        </div>

        <ol className="st-lines">
          {story.lines.slice(0, shown).map((line, i) => (
            <li key={i} className={`st-line${line.who ? ' is-said' : ''}`}>
              <SpeakButton text={line.en} />
              <button className="st-text" onClick={() => setMeaning(meaning === i ? null : i)}>
                {line.who && <small className="st-who">{line.who}</small>}
                <span>
                  <TapText text={line.en} />
                </span>
                {meaning === i && (
                  <span className="st-bn" lang="bn">
                    {line.bn}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ol>

        {!allShown ? (
          <button
            className="cta st-next"
            onClick={() => {
              haptic();
              setShown(shown + 1);
              setMeaning(null);
            }}
          >
            <span lang="bn">পরের লাইন</span>
          </button>
        ) : (
          <section className="gt-card">
            <h2 lang="bn">গল্পটা বুঝেছ?</h2>
            <TopicQuiz quiz={story.quiz} title={story.title} where={`story:${story.id}`} color={story.color} onPassed={finish} passedText={read ? 'দারুণ! আবারও সব ঠিক।' : `দারুণ! গল্প শেষ · +${toBanglaDigits(STORY_XP)} XP`} />
          </section>
        )}
        <div ref={end} />
      </div>
    </div>,
    document.body,
  );
}
