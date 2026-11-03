import type { ReactNode } from 'react';
import type { SceneItem } from '../riverLayout';

const shadow = (rx: number) => <ellipse cx="0" cy="1.5" rx={rx} ry={rx * 0.3} className="sc-shadow" />;

function Tree() {
  return (
    <>
      {shadow(11)}
      <rect x="-1.6" y="-9" width="3.2" height="10" rx="1.2" className="sc-trunk" />
      <circle cx="-6" cy="-12" r="6.5" className="sc-leaf" />
      <circle cx="6" cy="-12" r="6.5" className="sc-leaf-dark" />
      <circle cx="0" cy="-17" r="8.5" className="sc-leaf" />
      <circle cx="-2.6" cy="-20" r="3.6" className="sc-leaf-hi" />
    </>
  );
}

function Palm({ variant }: { variant: number }) {
  const lean = variant < 0.5 ? -1 : 1;
  const top = { x: 3 * lean, y: -27 };
  const frond = (dx: number, dy: number, cx: number, cy: number) => (
    <path d={`M${top.x} ${top.y}q${cx} ${cy} ${dx} ${dy}`} className="sc-frond" />
  );
  return (
    <>
      {shadow(9)}
      <path d={`M0 1C${lean} -9 ${3 * lean} -18 ${top.x} ${top.y}`} className="sc-palm-trunk" />
      {frond(-15, 6, -9, -6)}
      {frond(15, 6, 9, -6)}
      {frond(-11, -7, -5, -8)}
      {frond(12, -6, 6, -8)}
      {frond(-2, -12, 0, -7)}
      <circle cx={top.x - 1.6} cy={top.y + 2} r="1.7" className="sc-coconut" />
      <circle cx={top.x + 1.4} cy={top.y + 2.4} r="1.7" className="sc-coconut" />
    </>
  );
}

function Hut({ variant }: { variant: number }) {
  const tin = variant > 0.55;
  return (
    <>
      {shadow(13)}
      <rect x="-9" y="-10" width="18" height="11" rx="1" className="sc-wall" />
      <rect x="-9" y="-10" width="18" height="3" className="sc-wall-shade" />
      <path d="M-12.5 -9 L0 -20 L12.5 -9 Z" className={tin ? 'sc-roof-tin' : 'sc-roof-thatch'} />
      {!tin && <path d="M-8 -12.5h16M-5 -15.5h10" className="sc-thatch-line" />}
      <rect x="-2.6" y="-6" width="5.2" height="7" rx="0.8" className="sc-door" />
      <rect x="4" y="-7" width="3" height="3" rx="0.5" className="sc-window" />
    </>
  );
}

function Field({ variant }: { variant: number }) {
  const w = 52;
  const h = 30;
  return (
    <g transform={`rotate(${(variant - 0.5) * 16})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="5" className="sc-field-edge" />
      <rect x={-w / 2 + 2} y={-h / 2 + 2} width={w - 4} height={h - 4} rx="4" className="sc-field" />
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M${-w / 2 + 5} ${-h / 2 + 5 + i * 5}h${w - 10}`} className="sc-field-row" />
      ))}
    </g>
  );
}

function Haystack() {
  return (
    <>
      {shadow(9)}
      <path d="M-8 1 Q-9 -10 0 -15 Q9 -10 8 1 Z" className="sc-hay" />
      <path d="M-5 -6 Q0 -8 5 -6 M-6 -2 Q0 -4 6 -2" className="sc-hay-line" />
      <path d="M0 -15 v-3" className="sc-hay-pole" />
    </>
  );
}

function Bush({ variant }: { variant: number }) {
  const flower = variant < 0.5 ? 'sc-flower-pink' : 'sc-flower-yellow';
  return (
    <>
      {shadow(9)}
      <circle cx="-5" cy="-3.5" r="4.5" className="sc-leaf" />
      <circle cx="4.5" cy="-3.5" r="4.5" className="sc-leaf-dark" />
      <circle cx="0" cy="-6.5" r="5" className="sc-leaf" />
      <circle cx="-3.5" cy="-7" r="1.3" className={flower} />
      <circle cx="2.5" cy="-8.5" r="1.3" className={flower} />
      <circle cx="4.5" cy="-3" r="1.3" className={flower} />
    </>
  );
}

/** A grazing cow (গরু), head down. */
function Cow({ variant }: { variant: number }) {
  const flip = variant < 0.5 ? -1 : 1;
  return (
    <g transform={`scale(${flip} 1)`}>
      {shadow(10)}
      <path d="M-6 -2v3M-3 -2v3M3 -2v3M6 -2v3" className="sc-cow-leg" />
      <ellipse cx="0" cy="-5" rx="8.5" ry="4.6" className="sc-cow" />
      <ellipse cx="-2.5" cy="-6" rx="3" ry="2.2" className="sc-cow-patch" />
      <ellipse cx="4" cy="-4" rx="2" ry="1.6" className="sc-cow-patch" />
      <ellipse cx="10" cy="-2.5" rx="2.8" ry="2.2" className="sc-cow" />
      <path d="M9.2 -4.6l-.6 -1.6M11.2 -4.4l.8 -1.4" className="sc-cow-leg" />
      <path d="M-8.5 -6q-2.2 2 -1.4 5" className="sc-cow-tail" />
    </g>
  );
}

/** A small village pond with lily pads and reeds. */
function Pond() {
  return (
    <>
      <ellipse cx="0" cy="0" rx="22" ry="11" className="sc-pond-rim" />
      <ellipse cx="0" cy="0" rx="19" ry="8.6" className="sc-pond" />
      <path d="M-8 -1q3 -2 6 0" className="sc-ripple" />
      <circle cx="7" cy="2" r="2.6" className="sc-hyacinth" />
      <circle cx="11" cy="-1" r="2" className="sc-hyacinth-dark" />
      <circle cx="7.6" cy="1.4" r="0.9" className="sc-flower-pink" />
      <path d="M-20 -3v-7M-18 -4v-8M-16 -3v-6" className="sc-reed" />
    </>
  );
}

const DRAW: Record<SceneItem['kind'], (item: SceneItem) => ReactNode> = {
  tree: () => <Tree />,
  palm: (i) => <Palm variant={i.variant} />,
  hut: (i) => <Hut variant={i.variant} />,
  field: (i) => <Field variant={i.variant} />,
  haystack: () => <Haystack />,
  bush: (i) => <Bush variant={i.variant} />,
  cow: (i) => <Cow variant={i.variant} />,
  pond: () => <Pond />,
};

/** Everything that grows or stands on the banks. */
export function LandItems({ items }: { items: SceneItem[] }) {
  return (
    <g className="sc-land-items">
      {items.map((item, i) => (
        <g key={i} transform={`translate(${item.x.toFixed(1)} ${item.y.toFixed(1)}) scale(${item.scale.toFixed(2)})`}>
          {DRAW[item.kind](item)}
        </g>
      ))}
    </g>
  );
}
