/** The content kinds a lesson is made of (as stored on the server). */
export type ItemKind = 'vocab' | 'sentence' | 'fill' | 'gaps' | 'grammar' | 'dialog';
export type ItemData = Record<string, unknown>;

/**
 * How a field is edited:
 * text = one line, area = a few lines, words = comma separated, lines = one per line,
 * dialog = one chat line per row, "them: English | বাংলা" or "you: English | বাংলা".
 */
type FieldType = 'text' | 'area' | 'words' | 'lines' | 'dialog' | 'image' | 'audio';

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  hint?: string;
  bn?: boolean;
}

export interface Schema {
  title: string;
  titleBn: string;
  fields: Field[];
  /** One line describing an item in the list. */
  summary: (d: ItemData) => string;
}

export const SCHEMAS: Record<ItemKind, Schema> = {
  vocab: {
    title: 'Words',
    titleBn: 'শব্দ',
    fields: [
      { key: 'en', label: 'English', type: 'text' },
      { key: 'bn', label: 'Bangla', type: 'text', bn: true },
      { key: 'image', label: 'Picture (optional)', type: 'image', hint: 'Shown on the question card. PNG, JPG or WebP under 1 MB; square works best.' },
      { key: 'audio', label: 'Recorded pronunciation (optional)', type: 'audio', hint: 'Played instead of the phone’s voice. MP3 or M4A under 2 MB.' },
    ],
    summary: (d) => `${d.en} — ${d.bn}${d.image ? ' · picture' : ''}${d.audio ? ' · audio' : ''}`,
  },
  sentence: {
    title: 'Sentences',
    titleBn: 'বাক্য',
    fields: [
      { key: 'en', label: 'English', type: 'text' },
      { key: 'bn', label: 'Bangla', type: 'text', bn: true },
      { key: 'alt', label: 'Other correct answers', type: 'lines', hint: 'Optional. One per line.' },
      { key: 'audio', label: 'Recording (optional)', type: 'audio', hint: 'Played instead of the phone’s voice. MP3 or M4A under 2 MB.' },
    ],
    summary: (d) => `${d.en} — ${d.bn}${d.audio ? ' · audio' : ''}`,
  },
  fill: {
    title: 'Fill in the blank',
    titleBn: 'শব্দ বসাও',
    fields: [
      { key: 'text', label: 'Sentence', type: 'text', hint: 'Write ___ where the blank is (exactly one).' },
      { key: 'answer', label: 'Right word', type: 'text' },
      { key: 'options', label: 'Choices', type: 'words', hint: 'Comma separated, including the right word.' },
      { key: 'bn', label: 'Bangla meaning', type: 'text', bn: true },
      { key: 'why', label: 'Why it is right (Bangla, optional)', type: 'area', bn: true, hint: 'Shown when a learner gets it wrong.' },
    ],
    summary: (d) => `${d.text} → ${d.answer}`,
  },
  gaps: {
    title: 'Fill in the gaps',
    titleBn: 'শূন্যস্থান',
    fields: [
      { key: 'text', label: 'Text', type: 'area', hint: 'Write ___ for each gap.' },
      { key: 'answers', label: 'Right words, in order', type: 'words', hint: 'Comma separated, one per ___.' },
      { key: 'extra', label: 'Wrong words for the bank', type: 'words', hint: 'Comma separated.' },
      { key: 'bn', label: 'Bangla meaning', type: 'text', bn: true },
      { key: 'why', label: 'Why it is right (Bangla, optional)', type: 'area', bn: true, hint: 'Shown when a learner gets it wrong.' },
    ],
    summary: (d) => `${d.text} → ${(d.answers as string[]).join(', ')}`,
  },
  grammar: {
    title: 'Grammar',
    titleBn: 'ব্যাকরণ',
    fields: [
      { key: 'rule', label: 'Rule (Bangla)', type: 'area', bn: true },
      { key: 'correct', label: 'Correct sentence', type: 'text' },
      { key: 'wrong', label: 'Wrong sentences', type: 'lines', hint: 'One per line.' },
      { key: 'why', label: 'Why it is right (Bangla)', type: 'area', bn: true, hint: 'Shown after checking.' },
    ],
    summary: (d) => `${d.correct}`,
  },
  dialog: {
    title: 'Dialogues',
    titleBn: 'কথোপকথন',
    fields: [
      { key: 'with', label: 'Talking with (name)', type: 'text' },
      {
        key: 'lines',
        label: 'Lines',
        type: 'dialog',
        hint: 'One line per row: "them: English | বাংলা" or "you: English | বাংলা". The last line is the learner’s answer.',
      },
      { key: 'wrong', label: 'Wrong replies', type: 'lines', hint: 'One per line.' },
      { key: 'why', label: 'Why it is right (Bangla, optional)', type: 'area', bn: true, hint: 'Shown when a learner gets it wrong.' },
    ],
    summary: (d) => {
      const lines = d.lines as { en: string }[];
      return `${d.with}: ${lines[0]?.en ?? ''} … → ${lines[lines.length - 1]?.en ?? ''}`;
    },
  },
};

export const KIND_ORDER: ItemKind[] = ['vocab', 'sentence', 'fill', 'gaps', 'grammar', 'dialog'];

interface DialogLine {
  who: 'them' | 'you';
  en: string;
  bn: string;
}

/** A field's value as the text shown in its input. */
export function toText(field: Field, value: unknown): string {
  if (field.type === 'words') return ((value as string[]) ?? []).join(', ');
  if (field.type === 'lines') return ((value as string[]) ?? []).join('\n');
  if (field.type === 'dialog') return ((value as DialogLine[]) ?? []).map((l) => `${l.who}: ${l.en} | ${l.bn}`).join('\n');
  return (value as string) ?? '';
}

/** The text typed into an input, back as the value the server expects. */
export function fromText(field: Field, text: string): unknown {
  if (field.type === 'words') return text.split(',').map((w) => w.trim()).filter(Boolean);
  if (field.type === 'lines') return text.split('\n').map((w) => w.trim()).filter(Boolean);
  if (field.type === 'dialog') {
    return text
      .split('\n')
      .map((row) => row.trim())
      .filter(Boolean)
      .map((row) => {
        const m = row.match(/^(them|you)\s*:\s*(.*?)\s*\|\s*(.*)$/i);
        return m ? { who: m[1].toLowerCase(), en: m[2], bn: m[3] } : { who: '?', en: row, bn: '' };
      });
  }
  return text;
}
