import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MixedText } from './MixedText';

describe('MixedText', () => {
  it('shows a lone Arabic mark on a dotted circle, highlighted', () => {
    const html = renderToStaticMarkup(<MixedText text="যবর ( َ ) = আ, যের ( ِ ) = ই" />);
    expect(html).toContain('<span class="ar-mark" lang="ar" dir="rtl">◌َ</span>');
    expect(html).toContain('<span class="ar-mark" lang="ar" dir="rtl">◌ِ</span>');
    expect(html).not.toContain('(');
  });
});

describe('MixedText, other lone marks', () => {
  it('a mark after a space or at the start, with the letters after it', () => {
    const html = renderToStaticMarkup(<MixedText text="ًا = আন, আর ٍ = ইন" />);
    expect(html).toContain('◌ًا</span>');
    expect(html).toContain('◌ٍ</span>');
  });

  it('Arabic words with their marks stay as they are', () => {
    expect(renderToStaticMarkup(<MixedText text="বাব = بَاب" />)).not.toContain('ar-mark');
  });
});
