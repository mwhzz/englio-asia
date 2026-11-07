import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { ADMIN_TOKEN, signIn } from './helpers';

const API = 'http://localhost:8799/api';
const auth = { authorization: `Bearer ${ADMIN_TOKEN}` };
const STARTER = JSON.parse(readFileSync('content/ar-starter.json', 'utf8'));

test('an Arabic-speaking learner gets the app in Arabic, right to left, with the Arabic course', async ({ page, request }) => {
  // The owner adds Arabic, its starter course, and puts it live.
  await request.post(`${API}/admin/languages`, { headers: auth, data: STARTER.language });
  const added = await request.post(`${API}/admin/import`, { headers: auth, data: { ...STARTER, language: undefined, lang: 'ar', draft: false } });
  expect(added.ok()).toBe(true);
  await request.put(`${API}/admin/languages/ar`, { headers: auth, data: { status: 'live' } });

  // A new learner picks العربية on the first screen.
  await page.goto('/');
  await page.getByRole('radio', { name: 'العربية' }).click();
  await page.waitForLoadState('load');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('.ob')).toContainText('تعلّم الإنجليزية');
  await page.screenshot({ path: 'test-results/ar-welcome.png' });

  await signIn(page, 'Ahmad', { completed: {}, profile: { name: 'Ahmad', districtId: '', classId: 'other', joinedAt: '2026-11-01', lang: 'ar' } });
  await expect(page.locator('.tabbar')).toContainText('القواعد');
  await expect(page.locator('.upnext')).toContainText('الخطوات الأولى');
  await page.screenshot({ path: 'test-results/ar-home.png' });
  await page.locator('.upnext').click();
  await expect(page.locator('.lesson-stage')).toBeVisible();
  await page.screenshot({ path: 'test-results/ar-lesson.png' });

  // Back to draft for the other tests.
  await request.put(`${API}/admin/languages/ar`, { headers: auth, data: { status: 'draft' } });
});

test('a Bangla speaker can learn Arabic too: picks it on the first screen, and lessons are in Arabic', async ({ page, request }) => {
  const COURSE = JSON.parse(readFileSync('content/bn-ar-batch-01.json', 'utf8'));
  await request.post(`${API}/admin/languages`, { headers: auth, data: { ...COURSE.language, target: 'ar' } });
  const added = await request.post(`${API}/admin/import`, { headers: auth, data: { units: COURSE.units, lang: 'bn-ar', draft: false } });
  expect(added.ok()).toBe(true);
  await request.put(`${API}/admin/languages/bn-ar`, { headers: auth, data: { status: 'live' } });

  await page.goto('/');
  await expect(page.locator('.ob-courses')).toContainText('কী শিখবে?');
  await page.locator('.ob-courses').getByRole('radio', { name: 'العربية' }).click();
  await page.waitForLoadState('load');
  await expect(page.locator('html')).toHaveAttribute('data-target', 'ar');
  // The app stays in Bangla (it's a Bangla speaker), left to right.
  await expect(page.locator('html')).not.toHaveAttribute('dir', 'rtl');

  await signIn(page, 'Tania', { completed: {} });
  await expect(page.locator('.upnext')).toContainText('সালাম ও পরিচয়');
  await page.locator('.upnext').click();
  await expect(page.locator('.lesson-stage')).toBeVisible();
  await page.screenshot({ path: 'test-results/bn-ar-lesson.png' });

  await request.put(`${API}/admin/languages/bn-ar`, { headers: auth, data: { status: 'draft' } });
});
