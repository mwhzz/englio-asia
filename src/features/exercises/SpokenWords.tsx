import { toBanglaDigits } from '../../lib/bangla';
import { compareSpoken } from '../../lib/pronounce';

/** The sentence with each word green (heard) or red (missed), and how much was right. */
export function SpokenWords({ target, heard }: { target: string; heard: string }) {
  const { words, score } = compareSpoken(target, heard);
  return (
    <div className="said" aria-label={`${score}% heard right`}>
      <p className="said-words">
        {words.map((w, i) => (
          <span key={i} className={w.ok ? 'is-ok' : 'is-miss'}>
            {w.word}
          </span>
        ))}
      </p>
      <small className={`said-score${score >= 80 ? ' is-good' : ''}`} lang="bn">
        {score === 100 ? 'সব শব্দ পরিষ্কার শোনা গেছে!' : `${toBanglaDigits(score)}% শব্দ ঠিক শোনা গেছে · লাল শব্দগুলো আবার বলো`}
      </small>
    </div>
  );
}
