import { Glyph } from '../../components/Glyph';
import { HOURS, hourLabel } from '../reminder/reminderHours';
import { useReminder } from '../reminder/useReminder';

/** The daily reminder setting: a switch and the hour; the server sends it only on days the learner hasn't practised. */
export function ReminderRow() {
  const { reminder, note, turn } = useReminder();

  return (
    <div className="pf-row rm">
      <span className="pf-icon" style={{ background: 'var(--ios-red)' }}>
        <Glyph name="clock" size={17} />
      </span>
      <span className="rm-main">
        <span className="rm-head">
          <span className="pf-row-text">
            <span lang="bn">দৈনিক রিমাইন্ডার</span>
            <small lang="bn">যেদিন শেখা হয়নি, সেদিন মনে করিয়ে দেবে</small>
          </span>
          <input type="checkbox" role="switch" className="pf-switch" checked={reminder.on} onChange={(e) => turn(e.target.checked)} aria-label="Daily reminder" />
        </span>
        {reminder.on && (
          <select className="rm-hour" value={reminder.hour} onChange={(e) => turn(true, Number(e.target.value))} aria-label="Reminder time" lang="bn">
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {hourLabel(h)}
              </option>
            ))}
          </select>
        )}
        {note && (
          <small className="rm-note" lang="bn">
            {note}
          </small>
        )}
      </span>
    </div>
  );
}
