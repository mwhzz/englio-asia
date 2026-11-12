import { useState } from 'react';
import { Glyph, type GlyphName } from '../../components/Glyph';
import { toBanglaDigits, possessive } from '../../lib/bangla';
import { haptic } from '../../lib/haptics';
import { canListen } from '../../lib/listen';
import { conversationsFor, ROUND } from '../../lib/speakListen';
import { useProgress } from '../../state/ProgressContext';
import type { Dialog } from '../../types';
import { StoriesCard } from '../stories/StoriesCard';
import { ReviewCard } from '../home/ReviewCard';
import { Conversation } from './Conversation';

type Part = 'listen' | 'speak';

interface Props {
  onListening: () => void;
  onSpeaking: () => void;
  /** Today's returning words and missed items (the same as on Home). */
  onReview?: () => void;
}

function Card({ icon, color, title, note, onClick, disabled }: { icon: GlyphName; color: string; title: string; note: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      className="rc sl-card"
      style={{ boxShadow: `inset 0 0 0 1.5px color-mix(in srgb, ${color} 35%, transparent)` }}
      disabled={disabled}
      onClick={() => {
        haptic();
        onClick();
      }}
    >
      <span className="rc-icon" style={{ background: color }} aria-hidden="true">
        <Glyph name={icon} size={20} />
      </span>
      <span className="rc-text">
        <strong lang="bn">{title}</strong>
        <small lang="bn">{note}</small>
      </span>
      <Glyph name="chevron" size={16} className="pf-chevron" />
    </button>
  );
}

/** The "শোনা ও বলা" tab: listening rounds and stories, pronunciation rounds and acted-out conversations. */
export default function SpeakListenView({ onListening, onSpeaking, onReview }: Props) {
  const { progress } = useProgress();
  const [part, setPart] = useState<Part>('listen');
  const [talk, setTalk] = useState<Dialog | null>(null);
  const mic = canListen();
  const conversations = conversationsFor(progress);

  return (
    <div className="sl">
      <header className="pf-head">
        <h1 lang="bn">শোনা ও বলা</h1>
        <small>Listening &amp; speaking</small>
      </header>
      {onReview && <ReviewCard onStart={onReview} />}

      <div className="pf-segmented sl-parts" role="tablist">
        {(
          [
            ['listen', 'শোনা'],
            ['speak', 'বলা'],
          ] as const
        ).map(([id, bn]) => (
          <button key={id} role="tab" aria-selected={part === id} className={part === id ? 'is-on' : undefined} onClick={() => setPart(id)}>
            <span lang="bn">{bn}</span>
          </button>
        ))}
      </div>

      {part === 'listen' ? (
        <div className="sl-list">
          <Card icon="speaker" color="var(--ios-blue)" title="শোনার অনুশীলন" note={`${toBanglaDigits(ROUND)}টা বাক্য: শুনে মানে বাছো, সাজাও, লেখো`} onClick={onListening} />
          <StoriesCard />
          <p className="sl-tip" lang="bn">
            টিপ: প্রথমে না দেখে শোনো। না বুঝলে ধীরে শোনার বোতাম চাপো।
          </p>
        </div>
      ) : (
        <div className="sl-list">
          {!mic && (
            <p className="sl-tip is-warn" lang="bn">
              এই ব্রাউজারে কথা শোনার সুবিধা নেই। Android-এ Chrome দিয়ে খুললে বলার অনুশীলন করা যাবে।
            </p>
          )}
          <Card icon="mic" color="var(--ios-pink)" title="উচ্চারণ অনুশীলন" note="শব্দ আর বাক্য বলো, প্রতিটা শব্দ ধরে নম্বর" disabled={!mic} onClick={onSpeaking} />
          <h2 className="pf-list-title" lang="bn">
            কথোপকথন
          </h2>
          <div className="pf-list">
            {conversations.map((d, i) => (
              <button key={i} className="pf-row" onClick={() => setTalk(d)}>
                <span className="pf-icon" style={{ background: 'var(--ios-pink)' }}>
                  <Glyph name="person" size={16} />
                </span>
                <span className="pf-row-text">
                  <span>{d.lines[0].en}</span>
                  <small lang="bn">
                    {possessive(d.with)} সাথে · {toBanglaDigits(d.lines.length)} লাইন
                  </small>
                </span>
                <Glyph name="chevron" size={16} className="pf-chevron" />
              </button>
            ))}
            {!conversations.length && (
              <p className="sl-tip" lang="bn">
                লেসন করলে এখানে কথোপকথন আসবে।
              </p>
            )}
          </div>
        </div>
      )}

      {talk && <Conversation dialog={talk} onClose={() => setTalk(null)} />}
    </div>
  );
}
