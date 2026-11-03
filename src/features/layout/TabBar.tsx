import { Glyph, type GlyphName } from '../../components/Glyph';
import { haptic } from '../../lib/haptics';

export type Tab = 'learn' | 'letters' | 'grammar' | 'profile';

const TABS: { id: Tab; icon: GlyphName; bn: string }[] = [
  { id: 'learn', icon: 'home', bn: 'শেখো' },
  { id: 'letters', icon: 'letters', bn: 'অক্ষর' },
  { id: 'grammar', icon: 'book', bn: 'ব্যাকরণ' },
  { id: 'profile', icon: 'person', bn: 'প্রোফাইল' },
];

/** Floating Liquid Glass tab bar (iOS 26 style). */
export function TabBar({ tab, onChange }: { tab: Tab; onChange: (tab: Tab) => void }) {
  return (
    <nav className="tabbar" aria-label="Main">
      <div className="tabbar-glass">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tabbar-item${tab === t.id ? ' is-on' : ''}`}
            aria-current={tab === t.id ? 'page' : undefined}
            onClick={() => {
              if (tab !== t.id) haptic();
              onChange(t.id);
            }}
          >
            <Glyph name={t.icon} size={22} />
            <span lang="bn">{t.bn}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
