import { useEffect, useRef } from 'react';

/**
 * The phone's Back button (and the browser's back). The app's pages are React state, not URLs, so
 * without this Back leaves the app. Each open page or sheet adds one history step; Back closes the
 * one on top. Only the number of steps matters, so they don't need to know about each other.
 */
interface Entry {
  onBack: () => void;
  /** Its history step was used up by Back. */
  used: boolean;
}

const stack: Entry[] = [];
/** History steps the app removes itself (a page closed by its own button), not Back. */
let ownBacks = 0;
/**
 * Steps of pages just closed, removed a moment later, so a page opening in the same moment (the next
 * screen, or React mounting a page twice in development) takes over the step instead.
 */
let toRemove = 0;
let removeTimer: ReturnType<typeof setTimeout> | null = null;

function removeLater() {
  toRemove++;
  removeTimer ??= setTimeout(() => {
    removeTimer = null;
    if (!toRemove) return;
    ownBacks++;
    history.go(-toRemove);
    toRemove = 0;
  }, 0);
}

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    if (ownBacks > 0) {
      ownBacks--;
      return;
    }
    const top = stack[stack.length - 1];
    if (!top) return;
    top.used = true;
    top.onBack();
    // Still open (it asked "are you sure?" instead of closing): give it a new step for the next Back.
    setTimeout(() => {
      if (stack.includes(top) && top.used) {
        top.used = false;
        history.pushState({ englio: true }, '');
      }
    }, 0);
  });
}

/** While `active`, Back calls `onBack` (usually: close this page) instead of leaving the app. */
export function useBackButton(onBack: () => void, active = true): void {
  const latest = useRef(onBack);
  latest.current = onBack;

  useEffect(() => {
    if (!active) return;
    const entry: Entry = { onBack: () => latest.current(), used: false };
    stack.push(entry);
    if (toRemove > 0) toRemove--;
    else history.pushState({ englio: true }, '');
    return () => {
      stack.splice(stack.indexOf(entry), 1);
      // Closed by its own button: take back the history step it added.
      if (!entry.used) removeLater();
    };
  }, [active]);
}
