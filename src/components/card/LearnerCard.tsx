import type { CSSProperties } from 'react';
import { Logo } from '../Logo';
import { STAGES, type ClassLevel } from '../../data/classLevels';
import { DISTRICTS, DIVISIONS } from '../../data/districts';
import { cleanName, initialOf } from '../../lib/profile';
import { DistrictSilhouette } from './DistrictSilhouette';
import { useCardTilt } from './useCardTilt';

// Blue to indigo until a class gives the card its stage colors.
const DEFAULT_COLORS: [string, string] = ['#0a84ff', '#5e5ce6'];

interface Props {
  name: string;
  districtId: string | null;
  level?: ClassLevel;
  /** Shows a blinking caret after the name while it's being typed. */
  typing?: boolean;
  /** When the learner joined (YYYY-MM-DD); today while onboarding. */
  joinedAt?: string;
}

/** The learner's "student pass": fills in live during onboarding, heads the profile, and tilts in 3D. */
export function LearnerCard({ name, districtId, level, typing = false, joinedAt }: Props) {
  const tilt = useCardTilt<HTMLDivElement>();
  const index = DISTRICTS.findIndex((d) => d.id === districtId);
  const district = DISTRICTS[index];
  const colors = level ? STAGES[level.stage].colors : DEFAULT_COLORS;
  const adult = level?.stage === 'other';
  const shown = cleanName(name);
  const joined = (joinedAt ? new Date(joinedAt) : new Date()).toLocaleDateString('en', { month: 'short', year: 'numeric' });

  return (
    <div className="lc-stage">
      <div className="lc-float">
        <div
          ref={tilt.ref}
          className="lc"
          style={{ '--g1': colors[0], '--g2': colors[1] } as CSSProperties}
          {...tilt.handlers}
          aria-label={`Student pass for ${shown || 'you'}`}
        >
          <div className="lc-pattern" />
          <DistrictSilhouette districtId={districtId} />
          <div className="lc-holo" />

          <div className="lc-top">
            <Logo size={22} />
            <span className="lc-kind">
              {/* Adults (job / other) get a learner's card, not a student's. */}
              {adult ? 'ENGLIO PASS' : 'STUDENT PASS'}
              <small lang="bn">{adult ? 'শেখার কার্ড' : 'শিক্ষার্থী কার্ড'}</small>
            </span>
          </div>

          <div className="lc-middle">
            <div className="lc-avatar">
              <span key={initialOf(name) || 'empty'}>{initialOf(name) || '?'}</span>
            </div>
            <div className="lc-identity">
              <strong className={shown ? undefined : 'is-placeholder'}>
                {shown || <span lang="bn">তোমার নাম</span>}
                {typing && <span className="lc-caret" />}
              </strong>
              {district && (
                <small>
                  <span lang="bn">{district.bn}</span> · <span lang="bn">{DIVISIONS[district.division].bn} বিভাগ</span>
                </small>
              )}
            </div>
          </div>

          <dl className="lc-fields">
            <div>
              <dt lang="bn">{adult ? 'ধরন' : 'ক্লাস'}</dt>
              <dd key={level?.id ?? 'none'} className={level ? 'is-stamped' : undefined} lang="bn">
                {level ? level.bn : '—'}
              </dd>
            </div>
            <div>
              <dt lang="bn">শুরু</dt>
              <dd>{joined}</dd>
            </div>
            <div>
              <dt>ID</dt>
              <dd>BD-{String(index + 1).padStart(2, '0')}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
