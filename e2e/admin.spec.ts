import { expect, test } from '@playwright/test';
import { ADMIN_TOKEN, openTab, signIn, adminGo } from './helpers';

test('the admin writes a story and learners see it', async ({ page }) => {
  await page.goto('/admin.html');
  await page.getByPlaceholder('Admin token').fill(ADMIN_TOKEN);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await adminGo(page, 'গল্প');
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
  await adminGo(page, 'গল্প');
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
  await adminGo(page, 'টিম');
  await page.getByLabel('Name').fill('Shila');
  await page.getByRole('button', { name: 'Add member' }).click();
  const token = (await page.locator('.ad-token code').textContent())!;

  const editor = await browser.newPage();
  await editor.goto('/admin.html');
  await editor.getByPlaceholder('Admin token').fill(token);
  await editor.getByRole('button', { name: 'Sign in' }).click();
  await expect(editor.getByText('Shila · editor')).toBeVisible();
  // Editors see the content pages, but not learners or settings.
  await editor.locator('.ad-tabbar').getByRole('button', { name: 'আরও' }).click();
  await expect(editor.locator('.ad-more').getByRole('button', { name: 'গল্প', exact: true })).toBeVisible();
  await expect(editor.getByRole('button', { name: 'শিক্ষার্থী', exact: true })).toHaveCount(0);
  await expect(editor.getByRole('button', { name: 'সেটিংস', exact: true })).toHaveCount(0);

  await adminGo(page, 'অ্যাক্টিভিটি');
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

test('the owner switches a feature off and makes a unit Plus-only, and the app follows', async ({ page, context, request }) => {
  await page.goto('/admin.html');
  await page.getByPlaceholder(/token/i).fill(ADMIN_TOKEN);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await adminGo(page, 'সেটিংস');
  await page.locator('.ad-switch-row', { hasText: 'লিগ' }).first().locator('input').uncheck();
  await page.getByRole('radiogroup', { name: 'Unit 1 access' }).getByRole('radio', { name: 'Plus' }).click();
  await page.getByRole('button', { name: 'সেভ করো' }).click();
  await expect(page.getByText('সেভ হয়েছে')).toBeVisible();

  const app = await context.newPage();
  await signIn(app);
  await expect(app.locator('.lgc')).toHaveCount(0);
  await expect(app.locator('.upnext .plus-badge')).toBeVisible();
  await app.locator('.upnext').click();
  await expect(app.getByText('এই ইউনিট Englio Plus-এ')).toBeVisible();

  // Back to everything on and free, for the other tests.
  const res = await request.put('http://localhost:8799/api/admin/settings', {
    headers: { authorization: `Bearer ${ADMIN_TOKEN}` },
    data: { features: { hearts: true, league: true, stories: true, board: true, speaking: true, reminders: true, plus: true }, lockedUnits: [], plus: { price: 99, days: 30 } },
  });
  expect(res.ok()).toBe(true);
});

test('the owner adds a language (empty, in draft) and the content pages switch to it', async ({ page }) => {
  await page.goto('/admin.html');
  await page.getByPlaceholder(/token/i).fill(ADMIN_TOKEN);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await adminGo(page, 'ভাষা');
  await page.getByRole('button', { name: 'العربية' }).click();
  await page.getByRole('button', { name: 'ভাষা যোগ করো' }).click();
  const arabic = page.locator('.ad-lang', { hasText: 'Arabic' });
  await expect(arabic.getByText('খসড়া')).toBeVisible();
  await expect(arabic.getByRole('button', { name: 'চালু করো' })).toBeDisabled();

  await arabic.getByRole('button', { name: 'কনটেন্ট দেখো' }).click();
  await expect(page.getByRole('radio', { name: /العربية/ })).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByText('এই ভাষায় এখনো কোনো ইউনিট নেই')).toBeVisible();

  // Back to Bangla and remove the empty language, for the other tests.
  await page.getByRole('radio', { name: 'বাংলা' }).click();
  await expect(page.getByText('First Steps')).toBeVisible();
  await adminGo(page, 'ভাষা');
  page.once('dialog', (d) => d.accept());
  await page.locator('.ad-lang', { hasText: 'Arabic' }).getByRole('button', { name: 'মুছে ফেলো' }).click();
  await expect(page.locator('.ad-lang', { hasText: 'Arabic' })).toHaveCount(0);
});

test('the admin adds a word with its recording, and uploads many recordings named after their text', async ({ page }) => {
  await page.goto('/admin.html');
  await page.getByPlaceholder(/token/i).fill(ADMIN_TOKEN);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await adminGo(page, 'শব্দ');
  await page.getByRole('button', { name: '+ নতুন শব্দ' }).click();
  await page.getByLabel('কোন লেসনে').selectOption({ label: 'Greetings' });
  await page.getByLabel('ইংরেজি শব্দ').fill('welcome');
  await page.getByLabel(/অর্থ/).fill('স্বাগতম');
  await page.locator('form .ad-audio input[type=file]').setInputFiles({ name: 'w.mp3', mimeType: 'audio/mpeg', buffer: Buffer.from('ID3 fake welcome') });
  await expect(page.locator('form .ad-audio').getByRole('button', { name: 'Play' })).toBeVisible();
  await page.getByRole('button', { name: 'শব্দ যোগ করো' }).click();
  await expect(page.locator('tr', { hasText: 'welcome' }).getByRole('button', { name: 'Play' })).toBeVisible();

  await adminGo(page, 'অডিও');
  await page.locator('.ad-file-btn input[type=file]').setInputFiles([
    { name: 'Good morning, teacher.mp3', mimeType: 'audio/mpeg', buffer: Buffer.from('ID3 fake gm') },
    { name: 'nothing like this.mp3', mimeType: 'audio/mpeg', buffer: Buffer.from('ID3 fake x') },
  ]);
  await expect(page.getByText(/১টা ফাইল বসেছে। মেলেনি: nothing like this.mp3/)).toBeVisible();

  const course = await page.request.get('http://localhost:8799/api/course').then((r) => r.json());
  expect(Object.keys(course.audio)).toEqual(expect.arrayContaining(['welcome', 'good morning, teacher.']));
});
