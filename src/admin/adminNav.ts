import type { GlyphName } from '../components/Glyph';

export interface NavItem {
  page: string;
  label: string;
  icon: GlyphName;
  /** Learners' data, settings, the team and the log are for owners; editors work on content. */
  ownerOnly?: boolean;
}

/** The admin's menu, in groups (the sidebar on a computer, the tab bar and "আরও" sheet on a phone). */
export const NAV: { group?: string; items: NavItem[] }[] = [
  { items: [{ page: 'dashboard', label: 'ড্যাশবোর্ড', icon: 'chart' }] },
  {
    group: 'কনটেন্ট',
    items: [
      { page: 'languages', label: 'ভাষা', icon: 'globe' },
      { page: 'content', label: 'লেসন', icon: 'path' },
      { page: 'words', label: 'শব্দ', icon: 'bookmark' },
      { page: 'audio', label: 'অডিও', icon: 'speaker' },
      { page: 'grammar', label: 'ব্যাকরণ', icon: 'letters' },
      { page: 'stories', label: 'গল্প', icon: 'book' },
      { page: 'board', label: 'বোর্ড প্রস্তুতি', icon: 'trophy' },
    ],
  },
  {
    group: 'শিক্ষার্থী',
    items: [
      { page: 'users', label: 'শিক্ষার্থী', icon: 'person', ownerOnly: true },
      { page: 'reports', label: 'রিপোর্ট', icon: 'chat' },
    ],
  },
  {
    group: 'সিস্টেম',
    items: [
      { page: 'settings', label: 'সেটিংস', icon: 'gear', ownerOnly: true },
      { page: 'errors', label: 'এরর', icon: 'alert' },
      { page: 'team', label: 'টিম', icon: 'people', ownerOnly: true },
      { page: 'activity', label: 'অ্যাক্টিভিটি', icon: 'clock', ownerOnly: true },
    ],
  },
];

/** The menu without the pages this admin can't open. */
export const navFor = (owner: boolean) =>
  NAV.map((g) => ({ ...g, items: g.items.filter((i) => owner || !i.ownerOnly) })).filter((g) => g.items.length);

/** On a phone, the tab bar shows these (the rest are under "আরও"). */
export const TAB_PAGES = ['dashboard', 'content', 'users', 'reports'];
