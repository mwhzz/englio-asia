import { Glyph, type GlyphName } from '../../components/Glyph';
import { haptic } from '../../lib/haptics';
import { feature } from '../../lib/appSettings';

export type Tab = 'learn' | 'speak' | 'grammar' | 'profile';

const TABS: { id: Tab; icon: GlyphName; bn: string }[] = [
  { id: 'learn', icon: 'path', bn: 'শেখো' },
  { id: 'speak', icon: 'chat', bn: 'শোনা-বলা' },
  { id: 'grammar', icon: 'letters', bn: 'ব্যাকরণ' },
  { id: 'profile', icon: 'person', bn: 'প্রোফাইল' },
];

/** Floating Liquid Glass tab bar (iOS 26 style). */
export function TabBar({ tab, onChange }: { tab: Tab; onChange: (tab: Tab) => void }) {
  return (
    <nav className="tabbar" aria-label="Main">
      <div className="tabbar-glass">
        {TABS.filter((t) => t.id !== 'speak' || feature('speaking')).map((t) => (
          <button
            key={t.id}
            className={`tabbar-item${tab === t.id ? ' is-on' : ''}`}
            aria-current={tab === t.id ? 'page' : undefined}
            onClick={() => {
              if (tab !== t.id) haptic();
              onChange(t.id);
            }}
          >
            <Glyph name={t.icon} size={22} filled={tab === t.id} />
            <span lang="bn">{t.bn}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
