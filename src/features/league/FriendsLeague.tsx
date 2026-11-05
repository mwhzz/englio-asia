import { useEffect, useState } from 'react';
import { toBanglaDigits } from '../../lib/bangla';
import { haptic } from '../../lib/haptics';
import { addFriend, fetchFriends, removeFriend, type FriendsLeague as League } from '../../lib/league';

const PROBLEMS: Record<number, string> = {
  404: 'এই কোডের কাউকে পাওয়া গেল না। অক্ষরগুলো আবার দেখো।',
  400: 'এটা তোমার নিজের কোড, অথবা বন্ধু ৫০ জন হয়ে গেছে।',
  429: 'অনেকবার চেষ্টা হয়েছে, একটু পরে আবার করো।',
};

/** The friends tab of the league: my code to share, adding a friend's code, and us all by this week's XP. */
export function FriendsLeague() {
  const [league, setLeague] = useState<League | null | undefined>(undefined);
  const [code, setCode] = useState('');
  const [problem, setProblem] = useState<string | null>(null);
  const [shared, setShared] = useState(false);
  const reload = () => fetchFriends().then(setLeague);

  useEffect(() => {
    reload();
  }, []);

  if (league === undefined) return <p className="lgp-note" lang="bn">আনছে…</p>;
  if (league === null) return <p className="lgp-note" lang="bn">ইন্টারনেট লাগবে। নেট চালু করে আবার খোলো।</p>;

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setProblem(null);
    try {
      await addFriend(code);
      haptic();
      setCode('');
      reload();
    } catch (err) {
      setProblem(PROBLEMS[(err as { status?: number }).status ?? 0] ?? 'যোগ করা গেল না, আবার চেষ্টা করো।');
    }
  }

  async function share() {
    haptic();
    const text = `Englio-তে আমার সাথে ইংরেজি শেখো! আমার বন্ধু কোড: ${league!.code}`;
    if (navigator.share) await navigator.share({ text }).catch(() => undefined);
    else await navigator.clipboard?.writeText(league!.code).catch(() => undefined);
    setShared(true);
  }

  return (
    <>
      <section className="gt-card fr-code">
        <h2 lang="bn">তোমার বন্ধু কোড</h2>
        <div className="fr-code-row">
          <strong className="fr-code-value">{league.code}</strong>
          <button className="fr-share" onClick={share}>
            <span lang="bn">{shared ? 'পাঠানো হয়েছে' : 'বন্ধুকে পাঠাও'}</span>
          </button>
        </div>
        <form className="fr-add" onSubmit={add}>
          <input
            className="fr-input"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="বন্ধুর কোড"
            maxLength={8}
            autoCapitalize="characters"
            spellCheck={false}
            aria-label="Friend code"
            lang="bn"
          />
          <button className="cta" disabled={code.replace(/[^A-Z0-9]/gi, '').length !== 6}>
            <span lang="bn">যোগ করো</span>
          </button>
        </form>
        {problem && (
          <p className="bk-error" lang="bn">
            {problem}
          </p>
        )}
      </section>

      <section className="gt-card">
        <h2 lang="bn">এই সপ্তাহে বন্ধুদের মধ্যে</h2>
        <ol className="lgp-people">
          {league.people.map((p, i) => (
            <li key={p.code} className={p.isMe ? 'is-me' : undefined}>
              <span className="lgp-pos">{toBanglaDigits(i + 1)}</span>
              <span className="lgp-avatar" aria-hidden="true">
                {p.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="lgp-name">
                {p.name}
                {p.isMe && <small lang="bn"> (তুমি)</small>}
              </span>
              <span className="lgp-xp">{toBanglaDigits(p.xp)} XP</span>
              {!p.isMe && (
                <button className="fr-remove" aria-label={`Remove ${p.name}`} onClick={() => confirm(`${p.name}-কে বন্ধু তালিকা থেকে সরাবে?`) && removeFriend(p.code).then(reload)}>
                  ×
                </button>
              )}
            </li>
          ))}
        </ol>
        {league.people.length === 1 && (
          <p className="lgp-note" lang="bn">
            এখনো কোনো বন্ধু নেই। তোমার কোডটা পাঠাও, অথবা বন্ধুর কোড যোগ করো।
          </p>
        )}
      </section>
    </>
  );
}
