import { useState } from 'react';
import { Glyph } from '../../components/Glyph';
import { toBanglaDigits } from '../../lib/bangla';
import { haptic } from '../../lib/haptics';
import { DAILY_GOALS } from '../../lib/progress';
import { savedTheme, setTheme, type Theme } from '../../lib/theme';
import { useProgress } from '../../state/ProgressContext';
import { BackupCode } from './BackupCode';
import { DeleteAccount } from './DeleteAccount';
import { InstallRow } from './InstallRow';
import { RedoSetup } from './RedoSetup';
import { ReminderRow } from './ReminderRow';
import { ResetProgress } from './ResetProgress';

/** Settings as an iOS inset grouped list: daily goal, sound, then the profile actions. */
export function SettingsList({ onPlacement }: { onPlacement: () => void }) {
  const { progress, update } = useProgress();
  const [sheet, setSheet] = useState<'redo' | 'reset' | 'delete' | 'backup' | null>(null);
  const [theme, chooseTheme] = useState<Theme>(savedTheme);

  return (
    <section className="pf-section is-plain">
      <h2 className="pf-list-title">
        <span lang="bn">সেটিংস</span> <small>Settings</small>
      </h2>

      <div className="pf-list">
        <div className="pf-row is-tall">
          <span className="pf-icon" style={{ background: 'var(--ios-blue)' }}>
            <Glyph name="target" size={17} />
          </span>
          <span className="pf-row-main">
            <span className="pf-row-text">
              <span lang="bn">দৈনিক লক্ষ্য</span>
              <small>Daily goal</small>
            </span>
            <span className="pf-segmented" role="radiogroup" aria-label="Daily goal">
              {DAILY_GOALS.map((goal) => (
                <button
                  key={goal}
                  role="radio"
                  aria-checked={progress.dailyGoal === goal}
                  className={progress.dailyGoal === goal ? 'is-on' : undefined}
                  onClick={() => {
                    haptic();
                    update((p) => ({ ...p, dailyGoal: goal }));
                  }}
                >
                  <span lang="bn">{toBanglaDigits(goal)}</span> XP
                </button>
              ))}
            </span>
          </span>
        </div>

        <div className="pf-row is-tall">
          <span className="pf-icon" style={{ background: 'var(--ios-indigo, #5856d6)' }}>
            <Glyph name="moon" size={16} />
          </span>
          <span className="pf-row-main">
            <span className="pf-row-text">
              <span lang="bn">থিম</span>
              <small>Appearance</small>
            </span>
            <span className="pf-segmented" role="radiogroup" aria-label="Appearance">
              {(
                [
                  ['auto', 'অটো'],
                  ['light', 'লাইট'],
                  ['dark', 'ডার্ক'],
                ] as const
              ).map(([id, bn]) => (
                <button
                  key={id}
                  role="radio"
                  aria-checked={theme === id}
                  className={theme === id ? 'is-on' : undefined}
                  onClick={() => {
                    haptic();
                    setTheme(id);
                    chooseTheme(id);
                  }}
                >
                  <span lang="bn">{bn}</span>
                </button>
              ))}
            </span>
          </span>
        </div>

        <label className="pf-row">
          <span className="pf-icon" style={{ background: 'var(--ios-pink)' }}>
            <Glyph name="speaker" size={17} />
          </span>
          <span className="pf-row-text">
            <span lang="bn">শব্দ</span>
            <small>Sound effects</small>
          </span>
          <input
            type="checkbox"
            role="switch"
            className="pf-switch"
            checked={progress.soundOn}
            onChange={(e) => {
              haptic();
              update((p) => ({ ...p, soundOn: e.target.checked }));
            }}
          />
        </label>

        <ReminderRow />
      </div>

      <div className="pf-list">
        <InstallRow />
        <button className="pf-row" onClick={() => setSheet('backup')}>
          <span className="pf-icon" style={{ background: 'var(--ios-blue)' }}>
            <Glyph name="lock" size={16} />
          </span>
          <span className="pf-row-text">
            <span lang="bn">ব্যাকআপ কোড</span>
            <small lang="bn">ফোন বদলালেও অগ্রগতি সাথে থাকবে</small>
          </span>
          <Glyph name="chevron" size={16} className="pf-chevron" />
        </button>
        <button className="pf-row" onClick={onPlacement}>
          <span className="pf-icon" style={{ background: 'var(--ios-orange)' }}>
            <Glyph name="target" size={17} />
          </span>
          <span className="pf-row-text">
            <span lang="bn">লেভেল টেস্ট</span>
            <small>Find where to start</small>
          </span>
          <Glyph name="chevron" size={16} className="pf-chevron" />
        </button>
        <button className="pf-row" onClick={() => setSheet('redo')}>
          <span className="pf-icon" style={{ background: 'var(--ios-green)' }}>
            <Glyph name="person" size={17} />
          </span>
          <span className="pf-row-text">
            <span lang="bn">প্রোফাইল বদলাও</span>
            <small>District, name and class</small>
          </span>
          <Glyph name="chevron" size={16} className="pf-chevron" />
        </button>
        <button className="pf-row is-danger" onClick={() => setSheet('reset')}>
          <span className="pf-icon" style={{ background: 'var(--ios-red)' }}>
            <Glyph name="close" size={15} />
          </span>
          <span className="pf-row-text">
            <span lang="bn">অগ্রগতি মুছে ফেলো</span>
            <small>Reset XP, streak and lessons</small>
          </span>
        </button>
      </div>

      <div className="pf-list">
        <a className="pf-row" href="./privacy.html" target="_blank" rel="noreferrer">
          <span className="pf-icon" style={{ background: 'var(--ios-gray, #8e8e93)' }}>
            <Glyph name="lock" size={16} />
          </span>
          <span className="pf-row-text">
            <span lang="bn">প্রাইভেসি পলিসি</span>
            <small>What we keep and why</small>
          </span>
          <Glyph name="chevron" size={16} className="pf-chevron" />
        </a>
        <button className="pf-row is-danger" onClick={() => setSheet('delete')}>
          <span className="pf-icon" style={{ background: 'var(--ios-red)' }}>
            <Glyph name="person" size={16} />
          </span>
          <span className="pf-row-text">
            <span lang="bn">আমার সব তথ্য মুছে ফেলো</span>
            <small>Delete my data from this phone and the server</small>
          </span>
        </button>
      </div>

      {sheet === 'redo' && <RedoSetup onClose={() => setSheet(null)} />}
      {sheet === 'reset' && <ResetProgress onClose={() => setSheet(null)} />}
      {sheet === 'delete' && <DeleteAccount onClose={() => setSheet(null)} />}
      {sheet === 'backup' && <BackupCode onClose={() => setSheet(null)} />}
    </section>
  );
}
