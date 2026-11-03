import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MixedText } from './MixedText';

describe('MixedText', () => {
  it('marks English runs inside Bangla text', () => {
    const html = renderToStaticMarkup(<MixedText text="I এর সাথে am, he / she / it এর সাথে is" />);
    expect(html).toBe('<span lang="en">I</span> এর সাথে <span lang="en">am</span>, <span lang="en">he / she / it</span> এর সাথে <span lang="en">is</span>');
  });

  it('leaves plain Bangla alone', () => {
    expect(renderToStaticMarkup(<MixedText text="আমি ভালো আছি।" />)).toBe('আমি ভালো আছি।');
  });
});
