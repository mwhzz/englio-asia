import type { WritingKind } from './types.ts';

/** Every kind of writing task, with its Bangla name, in the order the app lists them. */
export const WRITING_KINDS: { id: WritingKind; en: string; bn: string }[] = [
  { id: 'paragraph', en: 'Paragraph', bn: 'অনুচ্ছেদ' },
  { id: 'letter', en: 'Letter', bn: 'চিঠি' },
  { id: 'application', en: 'Application', bn: 'দরখাস্ত' },
  { id: 'email', en: 'Email', bn: 'ইমেইল' },
  { id: 'composition', en: 'Composition', bn: 'রচনা' },
  { id: 'story', en: 'Story', bn: 'গল্প' },
  { id: 'dialogue', en: 'Dialogue', bn: 'সংলাপ' },
  { id: 'report', en: 'Report', bn: 'প্রতিবেদন' },
];
