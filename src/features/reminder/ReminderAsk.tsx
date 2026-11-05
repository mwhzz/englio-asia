import { useEffect, useState } from 'react';
import { Modal } from '../../components/Modal';
import { track } from '../../lib/track';
import { markReminderAsked } from './askOnce';
import { hourLabel } from './reminderHours';
import { useReminder } from './useReminder';

const CHOICES = [7, 12, 18, 20];

/** After the first lesson on a phone: "remind me every day?" with the hour, in one tap. */
export function ReminderAsk({ onDone }: { onDone: () => void }) {
  const { reminder, note, turn } = useReminder();
  const [hour, setHour] = useState(CHOICES.includes(reminder.hour) ? reminder.hour : 20);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    markReminderAsked();
    track('reminder_ask', 'shown');
  }, []);

  async function accept() {
    setBusy(true);
    const on = await turn(true, hour);
    setBusy(false);
    track('reminder_ask', on ? `on:${hour}` : 'blocked');
    if (on) onDone();
  }

  function later() {
    track('reminder_ask', 'later');
    onDone();
  }

  return (
    <Modal onClose={later}>
      <span className="ra-bell" aria-hidden="true">
        🔔
      </span>
      <h2 lang="bn">রোজ মনে করিয়ে দেব?</h2>
      <p className="muted" lang="bn">
        যেদিন শেখা হবে না, শুধু সেদিন একটা নোটিফিকেশন আসবে। রোজ ৫ মিনিটেই ইংরেজি পাকা হয়।
      </p>
      <div className="ra-hours" role="radiogroup" aria-label="Reminder time">
        {CHOICES.map((h) => (
          <button key={h} role="radio" aria-checked={hour === h} className={`ra-hour${hour === h ? ' is-on' : ''}`} onClick={() => setHour(h)} lang="bn">
            {hourLabel(h)}
          </button>
        ))}
      </div>
      {note && (
        <p className="ra-note" lang="bn">
          {note}
        </p>
      )}
      <div className="cta-stack">
        {note ? (
          <button className="cta" onClick={onDone}>
            <span lang="bn">ঠিক আছে</span>
          </button>
        ) : (
          <button className="cta" onClick={accept} disabled={busy}>
            <span lang="bn">চালু করো</span>
          </button>
        )}
        {!note && (
          <button className="cta-text" onClick={later}>
            <span lang="bn">এখন না</span>
          </button>
        )}
      </div>
    </Modal>
  );
}
