import { useEffect, useState } from 'react';
import { DISTRICT_SHAPES } from './districtShapes';

const WORDS = ['Hello!', 'Thank you', 'Good morning', 'I can!', 'Welcome', 'How are you?', "Let's learn", 'Nice to meet you', 'Yes!', 'Well done'];
const EVERY_MS = 900;
const LIFETIME_MS = 2800;
const START_AFTER_MS = 2200;

interface Bubble {
  id: number;
  x: number;
  y: number;
  word: string;
}

/** English speech bubbles popping out of random districts while the welcome screen is open. */
export function MapBubbles() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let id = 0;
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      timer = setInterval(() => {
        const shape = DISTRICT_SHAPES[Math.floor(Math.random() * DISTRICT_SHAPES.length)];
        const bubble = { id: id++, x: shape.cx, y: shape.cy, word: WORDS[id % WORDS.length] };
        setBubbles((list) => [...list.slice(-3), bubble]);
        setTimeout(() => setBubbles((list) => list.filter((b) => b.id !== bubble.id)), LIFETIME_MS);
      }, EVERY_MS);
    }, START_AFTER_MS);
    return () => {
      clearTimeout(start);
      clearInterval(timer);
    };
  }, []);

  return (
    <g className="bdmap-bubbles" aria-hidden="true">
      {bubbles.map((b) => {
        const w = b.word.length * 9.4 + 26;
        return (
          <g key={b.id} transform={`translate(${b.x} ${b.y}) scale(1.6)`}>
            <g className="bdmap-bubble">
              <circle r="5" className="bdmap-bubble-dot" />
              <path d={`M${-w / 2} -52a15 15 0 0 1 15-15h${w - 30}a15 15 0 0 1 15 15v0a15 15 0 0 1-15 15h${-(w - 30) / 2 + 8}l-8 9-8-9h${-(w - 30) / 2 + 8}a15 15 0 0 1-15-15z`} />
              <text y="-52">{b.word}</text>
            </g>
          </g>
        );
      })}
    </g>
  );
}
