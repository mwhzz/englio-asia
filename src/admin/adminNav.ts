import type { GlyphName } from '../components/Glyph';

export type Role = 'owner' | 'editor' | 'support';

export interface NavItem {
  page: string;
  label: string;
  icon: GlyphName;
  /** Who sees it (server/team.ts): content is for editors, learners and reports for support, the rest for owners. Missing = everyone. */
  roles?: Role[];
}

const CONTENT: Role[] = ['owner', 'editor'];
const PEOPLE: Role[] = ['owner', 'support'];
const OWNER: Role[] = ['owner'];

/** The admin's menu, in groups (the sidebar on a computer, the tab bar and "আরও" sheet on a phone). */
export const NAV: { group?: string; items: NavItem[] }[] = [
  { items: [{ page: 'dashboard', label: 'ড্যাশবোর্ড', icon: 'chart' }] },
  {
    group: 'কনটেন্ট',
    items: [
      { page: 'languages', label: 'ভাষা', icon: 'globe', roles: CONTENT },
      { page: 'content', label: 'লেসন', icon: 'path', roles: CONTENT },
      { page: 'words', label: 'শব্দ', icon: 'bookmark', roles: CONTENT },
      { page: 'audio', label: 'অডিও', icon: 'speaker', roles: CONTENT },
      { page: 'grammar', label: 'ব্যাকরণ', icon: 'letters', roles: CONTENT },
      { page: 'stories', label: 'গল্প', icon: 'book', roles: CONTENT },
      { page: 'writing', label: 'লেখা', icon: 'pencil', roles: CONTENT },
      { page: 'board', label: 'বোর্ড প্রস্তুতি', icon: 'trophy', roles: CONTENT },
      { page: 'history', label: 'ইতিহাস ও ট্র্যাশ', icon: 'clock', roles: CONTENT },
    ],
  },
  {
    group: 'শিক্ষার্থী',
    items: [
      { page: 'users', label: 'শিক্ষার্থী', icon: 'person', roles: PEOPLE },
      { page: 'reports', label: 'রিপোর্ট', icon: 'chat' },
    ],
  },
  {
    group: 'সিস্টেম',
    items: [
      { page: 'settings', label: 'সেটিংস', icon: 'gear', roles: OWNER },
      { page: 'errors', label: 'এরর', icon: 'alert' },
      { page: 'team', label: 'টিম', icon: 'people', roles: OWNER },
      { page: 'activity', label: 'অ্যাক্টিভিটি', icon: 'clock', roles: OWNER },
    ],
  },
];

/** The menu without the pages this admin's role can't open. */
export const navFor = (role: Role) =>
  NAV.map((g) => ({ ...g, items: g.items.filter((i) => !i.roles || i.roles.includes(role)) })).filter((g) => g.items.length);

/** On a phone, the tab bar shows these (the rest are under "আরও"). */
export const TAB_PAGES = ['dashboard', 'content', 'users', 'reports'];
