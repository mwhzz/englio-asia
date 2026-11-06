import { useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Glyph } from "../../components/Glyph";
import { findDistrict, type District } from "../../data/districts";
import { toBanglaDigits, possessive } from "../../lib/bangla";
import { daysLeft, type League } from "../../lib/league";
import { FriendsLeague } from "./FriendsLeague";
import { useBackButton } from "../../lib/backButton";

const GOLD = "#ffcc00";

/** The leagues: my district against the others (and my district's top learners), or me against my friends. */
export function LeaguePage({
  league,
  district,
  onClose,
}: {
  league: League;
  district: District;
  onClose: () => void;
}) {
  useBackButton(onClose);
  const [tab, setTab] = useState<"district" | "friends">("district");
  const top = league.districts[0]?.xp || 1;
  const left = daysLeft(league.ends);

  return createPortal(
    <div
      className="gt lgp"
      role="dialog"
      aria-label="District league"
      style={{ "--u": GOLD } as CSSProperties}
    >
      <header className="lp-bar">
        <button className="lp-back" onClick={onClose} aria-label="Back">
          <Glyph name="back" size={20} />
        </button>
        <span className="lp-bar-title" lang="bn">
          লিগ
        </span>
        <span className="lp-bar-space" />
      </header>

      <div className="gt-body">
        <div className="pf-segmented lgp-tabs" role="tablist">
          {(
            [
              ["district", "জেলা"],
              ["friends", "বন্ধু"],
            ] as const
          ).map(([id, bn]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              className={tab === id ? "is-on" : undefined}
              onClick={() => setTab(id)}
            >
              <span lang="bn">{bn}</span>
            </button>
          ))}
        </div>
        <p className="lgp-week" lang="bn">
          সপ্তাহ শেষ হতে আর {toBanglaDigits(left)} দিন · শনিবার থেকে নতুন
          সপ্তাহ, সবার XP শূন্য থেকে
        </p>

        {tab === "friends" ? (
          <FriendsLeague />
        ) : (
          <>
            <div className="gt-hero lgp-hero">
              <span className="lgp-rank" lang="bn">
                {league.myDistrictRank
                  ? `#${toBanglaDigits(league.myDistrictRank)}`
                  : "–"}
              </span>
              <h1 lang="bn">{district.bn}</h1>
              <p className="gt-summary" lang="bn">
                {league.me
                  ? `এই সপ্তাহে তুমি ${toBanglaDigits(league.me.xp)} XP এনেছ, জেলায় ${toBanglaDigits(league.me.rank)} নম্বরে।`
                  : "এই সপ্তাহে এখনো পয়েন্ট নেই। একটা লেসন করলেই তোমার জেলা এগোবে।"}
              </p>
            </div>

            <section className="gt-card">
              <h2 lang="bn">সেরা জেলা</h2>
              <ol className="lgp-bars">
                {league.districts.map((d, i) => {
                  const mine = d.districtId === district.id;
                  return (
                    <li
                      key={d.districtId}
                      className={mine ? "is-mine" : undefined}
                    >
                      <span className="lgp-pos">{toBanglaDigits(i + 1)}</span>
                      <span className="lgp-bar-main">
                        <span className="lgp-bar-label">
                          <span lang="bn">
                            {findDistrict(d.districtId)?.bn ?? d.districtId}
                          </span>
                          <small lang="bn">
                            {toBanglaDigits(d.xp)} XP ·{" "}
                            {toBanglaDigits(d.learners)} জন
                          </small>
                        </span>
                        <span className="lgp-track">
                          <span
                            style={{
                              width: `${Math.max(4, (100 * d.xp) / top)}%`,
                            }}
                          />
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ol>
            </section>

            {league.learners.length > 0 && (
              <section className="gt-card">
                <h2 lang="bn">{possessive(district.bn)} সেরা শিক্ষার্থী</h2>
                <ol className="lgp-people">
                  {league.learners.map((l, i) => (
                    <li key={i} className={l.isMe ? "is-me" : undefined}>
                      <span className="lgp-pos">{toBanglaDigits(i + 1)}</span>
                      <span className="lgp-avatar" aria-hidden="true">
                        {l.name.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="lgp-name">
                        {l.name}
                        {l.isMe && <small lang="bn"> (তুমি)</small>}
                      </span>
                      <span className="lgp-xp">{toBanglaDigits(l.xp)} XP</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
