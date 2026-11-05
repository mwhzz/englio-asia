export type TextSize = 'normal' | 'large' | 'larger';

const KEY = 'englio-text-size';
/** How much bigger everything is drawn (text and the buttons around it, so nothing overlaps). */
export const ZOOM: Record<TextSize, number> = { normal: 1, large: 1.12, larger: 1.25 };

export function savedTextSize(): TextSize {
  try {
    const t = localStorage.getItem(KEY);
    return t === 'large' || t === 'larger' ? t : 'normal';
  } catch {
    return 'normal';
  }
}

/** Sets <html data-text-size>; the zoom itself is in base.css (index.html applies the saved size before drawing). */
export function setTextSize(size: TextSize): void {
  const root = document.documentElement;
  if (size === 'normal') delete root.dataset.textSize;
  else root.dataset.textSize = size;
  try {
    if (size === 'normal') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, size);
  } catch {
    // Applied for now; not remembered.
  }
}
