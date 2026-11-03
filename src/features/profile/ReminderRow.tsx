import { useState } from 'react';
import { Glyph } from '../../components/Glyph';
import { toBanglaDigits } from '../../lib/bangla';
import { haptic } from '../../lib/haptics';
import { disableReminder, enableReminder } from '../../lib/push';
import { useProgress } from '../../state/ProgressContext';

const HOURS = [7, 9, 12, 16, 18, 20, 21, 22];
const part = (h: number) => (h < 12 ? 'সকাল' : h < 16 ? 'দুপুর' : h < 18 ? 'বিকেল' : h < 20 ? 'সন্ধ্যা' : 'রাত');
const label = (h: number) => `${part(h)} ${toBanglaDigits(h > 12 ? h - 12 : h)}টা`;

const NOTES = {
  denied: 'নোটিফিকেশনের অনুমতি দাওনি। ফোনের সেটিংসে গিয়ে Englio-র নোটিফিকেশন চালু করো।',
  unsupported: 'এই ব্রাউজারে নোটিফিকেশন চলে না। অ্যাপটা ইনস্টল করে নিলে কাজ করবে।',
  'no-server': 'রিমাইন্ডার চালু হয়েছে। নোটিফিকেশন সার্ভার চালু হলেই আসা শুরু হবে।',
} as const;

/** The daily reminder setting: a switch and the hour; the server sends it only on days the learner hasn't practised. */
export function ReminderRow() {
  const { progress, update } = useProgress();
  const reminder = progress.reminder ?? { on: false, hour: 20 };
  const [note, setNote] = useState<string | null>(null);

  async function turn(on: boolean, hour = reminder.hour) {
    haptic();
    setNote(null);
    if (!on) {
      update((p) => ({ ...p, reminder: { on: false, hour } }));
      return disableReminder();
    }
    const result = await enableReminder(hour).catch(() => 'unsupported' as const);
    if (result === 'denied' || result === 'unsupported') return setNote(NOTES[result]);
    update((p) => ({ ...p, reminder: { on: true, hour } }));
    if (result === 'no-server') setNote(NOTES['no-server']);
  }

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
                {label(h)}
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
