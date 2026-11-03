import { expect, test } from '@playwright/test';
import { openTab, signIn } from './helpers';

test('a new learner sees the welcome screen with a way to bring old progress back', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('ইংরেজি শেখো,')).toBeVisible();
  await page.getByText('আগে শিখেছ? অগ্রগতি ফিরিয়ে আনো').click();
  await expect(page.getByLabel('Backup code')).toBeVisible();
});

test('home shows the next lesson, stories and league, and every tab opens', async ({ page }) => {
  await signIn(page);
  await expect(page.locator('.upnext')).toBeVisible();
  await expect(page.locator('.sc')).toContainText('গল্প পড়ো');
  await expect(page.locator('.lgc')).toContainText('জেলা লিগ');
  await expect(page.locator('.trail-doodle').first()).toBeAttached();

  await openTab(page, 2);
  await expect(page.locator('.lt-grid')).toBeVisible();
  await openTab(page, 3);
  await expect(page.getByText('Parts of Speech').first()).toBeVisible();
  await openTab(page, 4);
  await expect(page.getByText('ব্যাকআপ কোড')).toBeVisible();
});

test('a lesson starts, checks an answer and moves on', async ({ page }) => {
  await signIn(page);
  await page.locator('.upnext').click();
  await expect(page.getByText(/প্রশ্ন ১\//)).toBeVisible();
  await page.locator('.lesson-stage .row').first().click();
  await page.locator('.lesson-foot .cta').click();
  await expect(page.locator('.feedback')).toBeVisible();
  await page.locator('.lesson-foot .cta').click();
  await expect(page.getByText(/প্রশ্ন ২\//)).toBeVisible();
});

test('grammar course answers sit in the bottom half of the screen (thumb reach)', async ({ page }) => {
  await signIn(page);
  await openTab(page, 3);
  await page.getByText('Parts of Speech').first().click();
  await page.getByText('শুরু করো').first().click();
  await page.locator('.cp-go').first().click();
  await page.locator('.cl .cta').last().click();
  const options = page.locator('.cq-options');
  await expect(options).toBeVisible();
  const box = (await options.boundingBox())!;
  const height = page.viewportSize()!.height;
  expect(box.y).toBeGreaterThan(height / 2);
});

test('the app loads nothing from other sites (works offline once installed)', async ({ page }) => {
  const outside: string[] = [];
  page.on('request', (r) => {
    const url = new URL(r.url());
    if (url.hostname !== 'localhost') outside.push(r.url());
  });
  await signIn(page);
  await page.waitForLoadState('networkidle');
  expect(outside).toEqual([]);
});
