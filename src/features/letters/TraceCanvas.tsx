import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { Glyph } from '../../components/Glyph';
import { haptic } from '../../lib/haptics';

type Point = { x: number; y: number };

/** How much ink (in px) counts as having traced the letter. */
const TRACED_AT = 260;

interface Props {
  text: string;
  family: string;
  fontsReady: boolean;
  onTraced: () => void;
}

/**
 * A four-line exercise-book strip (like a school "চার লাইনের খাতা") with the letter drawn faintly on it;
 * the learner traces over it with a finger or mouse. Colors come from CSS variables, so it works in dark mode.
 */
export function TraceCanvas({ text, family, fontsReady, onTraced }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Point[][]>([]);
  const ink = useRef(0);
  const reported = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  const paint = useCallback(() => {
    const el = canvas.current;
    const ctx = el?.getContext('2d');
    if (!el || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = el.clientWidth;
    const h = el.clientHeight;
    el.width = w * dpr;
    el.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(el);
    const color = (name: string) => css.getPropertyValue(name).trim();

    // Top, middle (dashed), base (red) and descender lines.
    const top = h * 0.16;
    const mid = h * 0.43;
    const base = h * 0.7;
    const bottom = h * 0.92;
    const line = (y: number, stroke: string, dash: number[] = []) => {
      ctx.beginPath();
      ctx.setLineDash(dash);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1.5;
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    };
    line(top, color('--trace-line'));
    line(mid, color('--trace-line'), [6, 6]);
    line(base, color('--trace-base'));
    line(bottom, color('--trace-line'));
    ctx.setLineDash([]);

    // The guide letter: sized so a capital reaches from the base line to the top line.
    ctx.font = `100px "${family}"`;
    const capHeight = ctx.measureText('H').actualBoundingBoxAscent || 72;
    ctx.font = `${(100 * (base - top)) / capHeight}px "${family}"`;
    ctx.fillStyle = color('--trace-ghost');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(text, w / 2, base);

    // The learner's ink.
    ctx.strokeStyle = color('--trace-ink');
    ctx.lineWidth = Math.max(8, h * 0.045);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const stroke of strokes.current) {
      ctx.beginPath();
      stroke.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      if (stroke.length === 1) ctx.lineTo(stroke[0].x + 0.1, stroke[0].y);
      ctx.stroke();
    }
  }, [text, family]);

  // A new letter starts with a clean page.
  useEffect(() => {
    strokes.current = [];
    ink.current = 0;
    reported.current = false;
    setHasInk(false);
  }, [text]);

  useEffect(() => {
    paint();
    const observer = new ResizeObserver(paint);
    if (canvas.current) observer.observe(canvas.current);
    return () => observer.disconnect();
  }, [paint, fontsReady]);

  const at = (e: PointerEvent<HTMLCanvasElement>): Point => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  function down(e: PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    strokes.current.push([at(e)]);
    setHasInk(true);
    paint();
  }

  function move(e: PointerEvent<HTMLCanvasElement>) {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const stroke = strokes.current[strokes.current.length - 1];
    const p = at(e);
    const last = stroke[stroke.length - 1];
    ink.current += Math.hypot(p.x - last.x, p.y - last.y);
    stroke.push(p);
    paint();
    if (!reported.current && ink.current > TRACED_AT) {
      reported.current = true;
      haptic(15);
      onTraced();
    }
  }

  return (
    <div className="trace">
      <canvas
        ref={canvas}
        className="trace-canvas"
        onPointerDown={down}
        onPointerMove={move}
        aria-label={`Trace the letter ${text}`}
      />
      <div className="trace-bar">
        <span lang="bn">আঙুল দিয়ে অক্ষরের উপর লেখো</span>
        <button
          className="trace-clear"
          disabled={!hasInk}
          onClick={() => {
            strokes.current = [];
            ink.current = 0;
            setHasInk(false);
            paint();
          }}
        >
          <Glyph name="close" size={13} />
          <span lang="bn">মুছে ফেলো</span>
        </button>
      </div>
    </div>
  );
}
