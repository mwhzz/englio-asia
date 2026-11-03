import { useEffect, useState, type RefObject } from 'react';

/** True once the element has scrolled into view (and stays true). */
export function useInView(ref: RefObject<Element | null>): boolean {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setSeen(true), { threshold: 0.6 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, seen]);
  return seen;
}
