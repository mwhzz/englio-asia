import { useState } from 'react';
import { Glyph } from '../../components/Glyph';
import { HelpPage } from './HelpPage';
import { useNewReplies } from './useReplies';

/** On the home page when the team answered one of the learner's reports: opens the help page to read it. */
export function ReplyCard() {
  const replies = useNewReplies();
  const [open, setOpen] = useState(false);
  const [gone, setGone] = useState(false);
  if (!replies.length || gone) return null;
  return (
    <>
      <button className="rc rpc home-rise" onClick={() => setOpen(true)}>
        <span className="rc-icon rpc-icon" aria-hidden="true">
          <Glyph name="chat" size={20} />
        </span>
        <span className="rc-text">
          <strong lang="bn">তোমার রিপোর্টের উত্তর এসেছে</strong>
          <small lang="bn">{replies[0].reply.slice(0, 70)}</small>
        </span>
        <Glyph name="chevron" size={16} className="pf-chevron" />
      </button>
      {open && <HelpPage onClose={() => (setOpen(false), setGone(true))} />}
    </>
  );
}
