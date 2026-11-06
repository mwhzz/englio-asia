import { expect, test } from '@playwright/test';
import { openTab, signIn } from './helpers';

test('a phone number saves progress, and brings it back on a new phone', async ({ page, browser }) => {
  await signIn(page, 'Farhana', { xp: 55, xpByDay: { [new Date().toISOString().slice(0, 10)]: 55 } });
  await openTab(page, 4);
  await page.getByText('অ্যাকাউন্ট', { exact: true }).click();
  await page.getByLabel('Phone number').fill('01712345678');
  await page.getByText('কোড পাঠাও').click();
  // The test server returns the code instead of texting it (OTP_DEV_ECHO).
  await expect(page.getByLabel('Code')).toHaveValue(/^\d{6}$/);
  await page.getByText('যাচাই করো').click();
  await expect(page.getByText('সেভ হয়ে গেছে')).toBeVisible();

  const phone = await browser.newPage();
  await phone.goto('/');
  await phone.getByText('আগে শিখেছ? অগ্রগতি ফিরিয়ে আনো').click();
  await phone.getByText('ফোন নম্বর বা Google দিয়ে ঢোকো').click();
  await phone.getByLabel('Phone number').fill('+880 1712-345678');
  await phone.getByText('কোড পাঠাও').click();
  await expect(phone.getByLabel('Code')).toHaveValue(/^\d{6}$/);
  await phone.getByText('যাচাই করো').click();
  await expect(phone.locator('.home-greeting')).toContainText('Farhana');
});

test('board practice: pick a topic, answer a round, and the best score is kept', async ({ page }) => {
  await signIn(page, 'Sumon', { profile: { name: 'Sumon', districtId: 'dhaka', classId: 'class-10', joinedAt: '2026-10-01' } });
  await page.getByText('SSC বোর্ড প্রস্তুতি').click();
  await page.getByText('Articles').first().click();
  await page.getByText(/অনুশীলন শুরু/).click();
  for (let i = 0; i < 10; i++) {
    await page.locator('.cq-options .gq-option').first().click();
    await page.locator('.gq-why .cta').click();
  }
  await expect(page.getByText(/টার মধ্যে/)).toBeVisible();
  await page.getByText('শেষ', { exact: true }).click();
  await expect(page.locator('.bd-row').first().locator('.bd-best')).toContainText('%');
});

test('a lesson left halfway carries on where it stopped', async ({ page }) => {
  await signIn(page);
  await page.locator('.upnext').click();
  for (let i = 0; i < 2; i++) {
    await page.locator('.lesson-stage .row').first().click();
    await page.locator('.lesson-foot .cta').click();
    await page.locator('.lesson-foot .cta').click();
  }
  await page.reload();
  await page.locator('.upnext').click();
  await expect(page.getByText('যেখানে থেমেছিলে, সেখান থেকে')).toBeVisible();
  await expect(page.getByText(/প্রশ্ন ৩\//)).toBeVisible();
});

test('friends add each other by code and see each other in the league', async ({ page, browser }) => {
  await signIn(page, 'Rafi');
  await page.waitForTimeout(3500); // the progress reaches the server
  await page.locator('.lgc').click();
  await page.getByRole('tab', { name: 'বন্ধু' }).click();
  const code = (await page.locator('.fr-code-value').textContent())!;

  const friend = await browser.newPage();
  await signIn(friend, 'Nila');
  await friend.waitForTimeout(3500);
  await friend.locator('.lgc').click();
  await friend.getByRole('tab', { name: 'বন্ধু' }).click();
  await friend.getByLabel('Friend code').fill(code);
  await friend.getByRole('button', { name: 'যোগ করো', exact: true }).click();
  await expect(friend.locator('.lgp-people')).toContainText('Rafi');
});

test('the owner’s notice and maintenance reach the app, and today’s quests show on home', async ({ page, request }) => {
  const API = 'http://localhost:8799/api';
  const auth = { authorization: 'Bearer e2e-admin' };
  const current = await (await request.get(`${API}/admin/settings`, { headers: auth })).json();
  const { paymentsReady: _, ...settings } = current;
  const put = (s: object) => request.put(`${API}/admin/settings`, { headers: auth, data: s });

  await put({ ...settings, notice: { text: 'নতুন ইউনিট এসেছে!', tone: 'info' } });
  await signIn(page);
  await expect(page.locator('.nb')).toContainText('নতুন ইউনিট এসেছে!');
  await expect(page.locator('.qc')).toContainText('আজকের কাজ');
  await page.locator('.nb-close').click();
  await expect(page.locator('.nb')).toHaveCount(0);

  await put({ ...settings, maintenance: { on: true, text: '৩০ মিনিট পর এসো' } });
  await page.reload();
  await expect(page.locator('.gate')).toContainText('৩০ মিনিট পর এসো');

  await put(settings);
  await page.reload();
  await expect(page.locator('.home-greeting')).toBeVisible();
});
