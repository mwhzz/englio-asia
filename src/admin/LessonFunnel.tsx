import { useAdminData } from './useAdminData';

interface Analytics {
  since: string;
  lessons: { lessonId: string; started: number; finished: number; title: string | null }[];
  mistakes: { key: string; n: number }[];
  stories: { storyId: string; n: number }[];
}

/** "w:apple" → "Word · apple", "s:I am…" → "Sentence · I am…"; other exercises show their kind and id. */
const mistakeLabel = (key: string) => {
  const [kind, ...rest] = key.split(':');
  const text = rest.join(':');
  return kind === 'w' ? `Word · ${text}` : kind === 's' ? `Sentence · ${text}` : `${kind} · ${text}`;
};

/** The last 30 days from the apps' anonymous counts: where learners stop, and what they get wrong most. */
export function LessonFunnel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const { data, error } = useAdminData<Analytics>('/analytics?days=30', onUnauthorized);
  if (error) return <p className="ad-error">{error}</p>;
  if (!data) return null;
  const topStart = Math.max(1, ...data.lessons.map((l) => l.started));
  const topMistake = Math.max(1, ...data.mistakes.map((m) => m.n));

  return (
    <div className="ad-two">
      <section className="ad-card">
        <h2 lang="bn">লেসন: শুরু → শেষ (কোর্সের ক্রমে)</h2>
        <p className="ad-muted" lang="bn">{data.since} থেকে। শেষ করার হার কম মানে লেসনটা কঠিন বা লম্বা।</p>
        <ul className="ad-bars">
          {data.lessons.map((l) => {
            const rate = Math.round((100 * l.finished) / Math.max(1, l.started));
            return (
              <li key={l.lessonId}>
                <span title={l.lessonId}>{l.title ? `${l.lessonId} · ${l.title}` : l.lessonId}</span>
                <span className="ad-bar">
                  <i style={{ width: `${(100 * l.started) / topStart}%`, opacity: 0.35 }} />
                  <i style={{ width: `${(100 * l.finished) / topStart}%`, marginTop: -8 }} />
                </span>
                <em className={rate < 60 ? 'ad-warn' : undefined}>
                  {l.finished}/{l.started} · {rate}%
                </em>
              </li>
            );
          })}
          {!data.lessons.length && <li className="ad-empty">এখনো কেউ লেসন করেনি।</li>}
        </ul>
      </section>
      <section className="ad-card">
        <h2 lang="bn">সবচেয়ে বেশি ভুল</h2>
        <p className="ad-muted" lang="bn">এগুলোর জন্য ভালো টিপ বা সহজ উদাহরণ দাও।</p>
        <ul className="ad-bars">
          {data.mistakes.map((m) => (
            <li key={m.key}>
              <span title={m.key}>{mistakeLabel(m.key)}</span>
              <span className="ad-bar">
                <i style={{ width: `${(100 * m.n) / topMistake}%`, background: '#ff3b30' }} />
              </span>
              <em>{m.n}</em>
            </li>
          ))}
          {!data.mistakes.length && <li className="ad-empty">এখনো কোনো ভুল গোনা হয়নি।</li>}
        </ul>
      </section>
    </div>
  );
}
