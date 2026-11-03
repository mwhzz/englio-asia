import { expect, test } from '@playwright/test';
import { ADMIN_TOKEN, openTab, signIn } from './helpers';

test('the admin writes a story and learners see it', async ({ page }) => {
  await page.goto('/admin.html');
  await page.getByPlaceholder('Admin token').fill(ADMIN_TOKEN);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('button', { name: 'Stories' }).click();
  await page.getByRole('button', { name: '+ New story' }).click();

  await page.getByLabel('Title (English)').fill('The Red Kite');
  await page.getByLabel('Title (Bangla)').fill('লাল ঘুড়ি');
  await page.getByLabel('Lines').fill('Rafi has a red kite. | রাফির একটা লাল ঘুড়ি আছে।\nRafi | Look, it flies! | দেখো, এটা উড়ছে!');
  await page.getByLabel('Questions').fill('ঘুড়িটা কী রঙের? | Red | Blue; Green | "a red kite"');
  await page.getByRole('button', { name: 'Create story' }).click();
  await expect(page.getByRole('heading', { name: 'The Red Kite' })).toBeVisible();

  await signIn(page);
  await page.locator('.sc').click();
  await expect(page.getByText('The Red Kite')).toBeVisible();
});

test('a wrong admin token is refused', async ({ page }) => {
  await page.goto('/admin.html');
  await page.getByPlaceholder('Admin token').fill('nope');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText(/wrong|token/i).first()).toBeVisible();
});

test('settings open without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await signIn(page);
  await openTab(page, 4);
  await page.getByText('ব্যাকআপ কোড').scrollIntoViewIfNeeded();
  expect(errors).toEqual([]);
});

test('a story draft can be previewed in the app before saving, without saving anything', async ({ page, context }) => {
  await page.goto('/admin.html');
  await page.getByPlaceholder('Admin token').fill(ADMIN_TOKEN);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('button', { name: 'Stories' }).click();
  await page.getByRole('button', { name: '+ New story' }).click();
  await page.getByLabel('Title (English)').fill('Draft Only');
  await page.getByLabel('Title (Bangla)').fill('খসড়া');
  await page.getByLabel('Lines').fill('This is a draft. | এটা খসড়া।\nIt is not saved. | এটা সেভ হয়নি।');

  const [tab] = await Promise.all([context.waitForEvent('page'), page.getByRole('button', { name: 'Preview in app ↗' }).click()]);
  await expect(tab.getByText('প্রিভিউ · কিছুই সেভ হবে না')).toBeVisible();
  await expect(tab.getByRole('heading', { name: 'Draft Only' })).toBeVisible();
  expect(await tab.evaluate(() => localStorage.getItem('englio-progress-v1'))).toBeNull();

  const stories = await page.request.get('http://localhost:8799/api/course').then((r) => r.json());
  expect(stories.stories.map((s: { title: string }) => s.title)).not.toContain('Draft Only');
});

test('the owner adds an editor, who sees content but not learners', async ({ page, browser }) => {
  await page.goto('/admin.html');
  await page.getByPlaceholder('Admin token').fill(ADMIN_TOKEN);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('button', { name: 'Team' }).click();
  await page.getByLabel('Name').fill('Shila');
  await page.getByRole('button', { name: 'Add member' }).click();
  const token = (await page.locator('.ad-token code').textContent())!;

  const editor = await browser.newPage();
  await editor.goto('/admin.html');
  await editor.getByPlaceholder('Admin token').fill(token);
  await editor.getByRole('button', { name: 'Sign in' }).click();
  await expect(editor.getByText('Shila · editor')).toBeVisible();
  await expect(editor.getByRole('button', { name: 'Stories' })).toBeVisible();
  await expect(editor.getByRole('button', { name: 'Learners' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Activity' }).click();
  await expect(page.getByText('added team')).toBeVisible();
});

// A tiny valid PNG (1×1, green) and a few bytes standing in for an MP3.
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

test('the admin adds a picture and a recording to a word, and the app gets them', async ({ page }) => {
  await page.goto('/admin.html');
  await page.getByPlaceholder('Admin token').fill(ADMIN_TOKEN);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.goto('/admin.html#lesson/u1-l1');
  await page.reload();
  const words = page.locator('section.ad-card', { hasText: 'Words' });
  await words.getByRole('button', { name: 'Edit' }).first().click();
  await words.locator('input[type=file][accept^="image"]').setInputFiles({ name: 'pic.png', mimeType: 'image/png', buffer: PNG });
  await expect(words.locator('.ad-media img')).toBeVisible();
  await words.locator('input[type=file][accept^="audio"]').setInputFiles({ name: 'say.mp3', mimeType: 'audio/mpeg', buffer: Buffer.from('ID3fake') });
  await expect(words.locator('.ad-media audio')).toBeAttached();
  await words.getByRole('button', { name: 'Save' }).click();
  await expect(words.getByText('· picture · audio')).toBeVisible();

  const course = await page.request.get('http://localhost:8799/api/course').then((r) => r.json());
  const word = course.units[0].lessons[0].vocab[0];
  expect(word.image).toMatch(/\.png$/);
  expect(word.audio).toMatch(/\.mp3$/);
  const pic = await page.request.get(`http://localhost:8799/api/media/${word.image}`);
  expect(pic.headers()['content-type']).toBe('image/png');
});
