import type { GlyphName } from '../../components/Glyph';
import type { GameKind } from './gameRounds';

/** The letter games, as listed on the letters page. */
export const GAMES: { id: GameKind; icon: GlyphName; color: string; bn: string; en: string; prompt: string }[] = [
  { id: 'listen', icon: 'speaker', color: 'var(--ios-pink)', bn: 'শুনে চেনো', en: 'Hear and tap', prompt: 'কোন অক্ষরটা শুনলে?' },
  { id: 'case', icon: 'letters', color: 'var(--ios-blue)', bn: 'বড়-ছোট মেলাও', en: 'Match the cases', prompt: 'এর জোড়াটা কোনটা?' },
  { id: 'order', icon: 'shuffle', color: 'var(--ios-orange)', bn: 'ক্রম মেলাও', en: 'Missing letter', prompt: 'খালি জায়গায় কোন অক্ষর বসবে?' },
];
