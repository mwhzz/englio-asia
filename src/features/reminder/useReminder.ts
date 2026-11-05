import { useState } from 'react';
import { haptic } from '../../lib/haptics';
import { disableReminder, enableReminder } from '../../lib/push';
import { useProgress } from '../../state/ProgressContext';

const NOTES = {
  denied: 'নোটিফিকেশনের অনুমতি দাওনি। ফোনের সেটিংসে গিয়ে Englio-র নোটিফিকেশন চালু করো।',
  unsupported: 'এই ব্রাউজারে নোটিফিকেশন চলে না। অ্যাপটা ইনস্টল করে নিলে কাজ করবে।',
  'no-server': 'রিমাইন্ডার চালু হয়েছে। নোটিফিকেশন সার্ভার চালু হলেই আসা শুরু হবে।',
} as const;

/**
 * The daily reminder setting, shared by Settings and the sheet after a lesson: turning it on asks
 * the phone for permission and tells the server the hour. `turn` resolves to whether it's on now.
 */
export function useReminder() {
  const { progress, update } = useProgress();
  const reminder = progress.reminder ?? { on: false, hour: 20 };
  const [note, setNote] = useState<string | null>(null);

  async function turn(on: boolean, hour = reminder.hour): Promise<boolean> {
    haptic();
    setNote(null);
    if (!on) {
      update((p) => ({ ...p, reminder: { on: false, hour } }));
      await disableReminder();
      return false;
    }
    const result = await enableReminder(hour).catch(() => 'unsupported' as const);
    if (result === 'denied' || result === 'unsupported') {
      setNote(NOTES[result]);
      return false;
    }
    update((p) => ({ ...p, reminder: { on: true, hour } }));
    if (result === 'no-server') setNote(NOTES['no-server']);
    return true;
  }

  return { reminder, note, turn };
}
