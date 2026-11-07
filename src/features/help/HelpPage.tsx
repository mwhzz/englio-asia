import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Glyph } from '../../components/Glyph';
import { API_BASE } from '../../lib/api';
import { appHeaders } from '../../lib/appHeaders';
import { useBackButton } from '../../lib/backButton';
import { haptic } from '../../lib/haptics';
import { deviceId } from '../../state/useProgressSync';
import { FAQ } from './faq';
import { MyReports, type MyReport } from './MyReports';
import { markReported, markRepliesSeen } from './useReplies';
import '../../styles/help.css';

const KINDS = [
  ['bug', 'অ্যাপে সমস্যা'],
  ['account', 'অগ্রগতি / অ্যাকাউন্ট'],
  ['payment', 'পেমেন্ট / Plus'],
  ['content', 'লেসনে ভুল'],
  ['idea', 'পরামর্শ'],
  ['other', 'অন্য কিছু'],
] as const;

/**
 * সাহায্য: answers to common questions, a form to tell the team about any problem (it reaches the admin's
 * reports with the learner's progress, app version and phone), and the learner's reports with the replies.
 */
export function HelpPage({ onClose }: { onClose: () => void }) {
  useBackButton(onClose);
  const [open, setOpen] = useState<number | null>(null);
  const [kind, setKind] = useState<string>('bug');
  const [text, setText] = useState('');
  const [contact, setContact] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [mine, setMine] = useState<MyReport[] | null>(null);

  const load = () =>
    fetch(`${API_BASE}/users/${deviceId()}/reports`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setMine, () => setMine([]));
  useEffect(() => {
    load();
    markRepliesSeen();
  }, []);

  async function send() {
    if (text.trim().length < 5) return;
    haptic();
    setState('sending');
    try {
      const res = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: appHeaders(),
        body: JSON.stringify({ where: 'help', kind, question: text.trim(), contact: contact.trim(), userId: deviceId() }),
      });
      if (!res.ok) throw new Error();
      markReported();
      setState('sent');
      setText('');
      load();
    } catch {
      setState('failed');
    }
  }

  return createPortal(
    <div className="gt hp" role="dialog" aria-label="Help">
      <header className="lp-bar">
        <button className="lp-back" onClick={onClose} aria-label="Back">
          <Glyph name="back" size={20} />
        </button>
        <span className="lp-bar-title" lang="bn">
          সাহায্য ও অভিযোগ
        </span>
        <span />
      </header>

      <div className="gt-body">
        {mine && mine.length > 0 && <MyReports reports={mine} />}

        <section className="pf-section is-plain">
          <h2 className="pf-list-title">
            <span lang="bn">সাধারণ প্রশ্ন</span> <small>FAQ</small>
          </h2>
          <ul className="pf-list hp-faq">
            {FAQ.map((f, i) => (
              <li key={f.q}>
                <button className="hp-q" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
                  <span lang="bn">{f.q}</span>
                  <Glyph name="chevron" size={16} className="hp-chev" />
                </button>
                {open === i && (
                  <p className="hp-a" lang="bn">
                    {f.a}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="pf-section is-plain">
          <h2 className="pf-list-title">
            <span lang="bn">আমাদের জানাও</span> <small>Contact us</small>
          </h2>
          <div className="hp-form">
            <div className="hp-kinds" role="radiogroup" aria-label="What about">
              {KINDS.map(([id, bn]) => (
                <button key={id} type="button" role="radio" aria-checked={kind === id} className={`rp-reason${kind === id ? ' is-on' : ''}`} onClick={() => setKind(id)}>
                  <span lang="bn">{bn}</span>
                </button>
              ))}
            </div>
            <textarea
              className="rp-note"
              lang="bn"
              rows={4}
              maxLength={1000}
              placeholder="কী হয়েছে, একটু খুলে লেখো"
              value={text}
              onChange={(e) => (setText(e.target.value), setState('idle'))}
            />
            <input className="rp-note hp-contact" lang="bn" maxLength={80} placeholder="ফোন বা ইমেইল (না দিলেও চলবে)" value={contact} onChange={(e) => setContact(e.target.value)} />
            {state === 'sent' && (
              <p className="hp-note is-ok" lang="bn">
                ধন্যবাদ! পেয়েছি। উত্তর এলে এই পেজের উপরে দেখতে পাবে।
              </p>
            )}
            {state === 'failed' && (
              <p className="hp-note is-bad" lang="bn">
                পাঠানো যায়নি। ইন্টারনেট দেখে আবার চেষ্টা করো।
              </p>
            )}
            <button className="cta" onClick={send} disabled={text.trim().length < 5 || state === 'sending'}>
              <span lang="bn">{state === 'sending' ? 'পাঠানো হচ্ছে…' : 'পাঠাও'}</span>
            </button>
          </div>
        </section>
      </div>
    </div>,
    document.body,
  );
}
