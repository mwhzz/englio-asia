import { expect, test, type Page } from '@playwright/test';
import { signIn } from './helpers';

// The smallest common Android screen, with the largest text (Profile → লেখার সাইজ → আরও বড়).
test.use({ viewport: { width: 360, height: 640 } });

async function largest(page: Page) {
  await page.addInitScript(() => localStorage.setItem('englio-text-size', 'larger'));
}

/** Nothing sticks out sideways, and the element is fully on screen. */
async function fits(page: Page, selector: string) {
  const box = await page.locator(selector).first().boundingBox();
  expect(box, selector).not.toBeNull();
  expect(box!.x, `${selector} left`).toBeGreaterThanOrEqual(-1);
  expect(box!.x + box!.width, `${selector} right`).toBeLessThanOrEqual(362);
  expect(box!.y, `${selector} top`).toBeGreaterThanOrEqual(-1);
  expect(box!.y + box!.height, `${selector} bottom`).toBeLessThanOrEqual(641);
}
const noSideScroll = async (page: Page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(361);

test('with the largest text on a small phone, the tab bar fits the screen', async ({ page }) => {
  await largest(page);
  await signIn(page);
  await fits(page, '.tabbar-glass');
  await fits(page, '.tabbar-item:nth-child(4)');
  await noSideScroll(page);
});

test('with the largest text on a small phone, the lesson header stays on screen', async ({ page }) => {
  await largest(page);
  await signIn(page);
  await page.locator('.upnext').click();
  await page.locator('.lesson-stage').waitFor();
  await fits(page, '.lesson-top');
  await fits(page, '.lesson-foot .cta');
  await noSideScroll(page);
});

test('with the largest text on a small phone, a story fits the screen', async ({ page }) => {
  await largest(page);
  await signIn(page);
  await page.locator('.sc').click();
  await page.locator('.gt').waitFor();
  await page.locator('.gt .pf-row').first().click();
  await page.locator('.gt.st').waitFor();
  await fits(page, '.gt.st .lp-back');
  await fits(page, '.gt.st .st-next');
  await noSideScroll(page);
});
