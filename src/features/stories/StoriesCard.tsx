import { useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Glyph } from '../../components/Glyph';
import { STORIES } from '../../data/stories';
import { toBanglaDigits } from '../../lib/bangla';
import { useProgress } from '../../state/ProgressContext';
import type { Story } from '../../types';
import { StoryReader } from './StoryReader';

/** The home page's "read a story" card, opening the list of stories and then a story. */
export function StoriesCard() {
  const { progress } = useProgress();
  const [list, setList] = useState(false);
  const [story, setStory] = useState<Story | null>(null);
  const read = progress.storiesRead ?? [];
  if (!STORIES.length) return null;

  return (
    <>
      <button className="rc sc home-rise" style={{ animationDelay: '200ms' }} onClick={() => setList(true)}>
        <span className="rc-icon sc-icon" aria-hidden="true">
          <Glyph name="book" size={20} />
        </span>
        <span className="rc-text">
          <strong lang="bn">গল্প পড়ো</strong>
          <small lang="bn">
            {toBanglaDigits(STORIES.length)}টা ছোট গল্প · {toBanglaDigits(read.length)}টা পড়া হয়েছে
          </small>
        </span>
        <Glyph name="chevron" size={16} className="pf-chevron" />
      </button>

      {list &&
        createPortal(
          <div className="gt" role="dialog" aria-label="Stories">
            <header className="lp-bar">
              <button className="lp-back" onClick={() => setList(false)} aria-label="Back">
                <Glyph name="back" size={20} />
              </button>
              <span className="lp-bar-title" lang="bn">
                গল্প
              </span>
              <span className="cl-num" lang="bn">
                {toBanglaDigits(read.length)}/{toBanglaDigits(STORIES.length)}
              </span>
            </header>
            <div className="gt-body">
              <div className="pf-list">
                {STORIES.map((s) => (
                  <button key={s.id} className="pf-row" onClick={() => setStory(s)} style={{ '--u': s.color } as CSSProperties}>
                    <span className="pf-icon" style={{ background: s.color }}>
                      <Glyph name={read.includes(s.id) ? 'check' : 'book'} size={16} />
                    </span>
                    <span className="pf-row-text">
                      <span>{s.title}</span>
                      <small lang="bn">
                        {s.titleBn} · {toBanglaDigits(s.lines.length)} লাইন
                      </small>
                    </span>
                    <Glyph name="chevron" size={16} className="pf-chevron" />
                  </button>
                ))}
              </div>
            </div>
            {story && <StoryReader key={story.id} story={story} onClose={() => setStory(null)} />}
          </div>,
          document.body,
        )}
    </>
  );
}
