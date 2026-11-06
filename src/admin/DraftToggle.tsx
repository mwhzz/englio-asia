import { useEffect, useState } from 'react';
import { adminApi } from './adminApi';

/**
 * খসড়া / প্রকাশিত for a lesson, story or grammar topic: a draft is kept from learners (the admin and its
 * previews still see it) until it's published.
 */
export function DraftToggle({ kind, id }: { kind: 'lesson' | 'story' | 'grammar'; id: string }) {
  const [draft, setDraft] = useState<boolean | null>(null);
  useEffect(() => {
    adminApi<Record<string, string[]>>('GET', '/drafts')
      .then((d) => setDraft((d[kind === 'lesson' ? 'lessons' : kind === 'story' ? 'stories' : 'grammar'] ?? []).includes(id)))
      .catch(() => setDraft(null));
  }, [kind, id]);
  if (draft === null) return null;
  const change = (next: boolean) =>
    adminApi('POST', '/draft', { kind, id, draft: next })
      .then(() => setDraft(next))
      .catch((e: Error) => alert(e.message));
  return (
    <span className="ad-seg" role="radiogroup" aria-label="Draft or published" lang="bn">
      <button type="button" role="radio" aria-checked={draft} className={draft ? 'is-on' : ''} onClick={() => change(true)}>
        খসড়া
      </button>
      <button type="button" role="radio" aria-checked={!draft} className={!draft ? 'is-on' : ''} onClick={() => change(false)}>
        প্রকাশিত
      </button>
    </span>
  );
}
