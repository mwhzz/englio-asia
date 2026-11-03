import { expect, test } from '@playwright/test';
import { openTab, signIn } from './helpers';

/** Opens settings → backup code and reads the code once it arrives. */
async function backupCodeOf(page: import('@playwright/test').Page): Promise<string> {
  await openTab(page, 4);
  await page.getByText('ব্যাকআপ কোড').click();
  const code = page.locator('.bk-code');
  await expect(code).toHaveText(/^[A-Z2-9]{5}-[A-Z2-9]{5}$/);
  return (await code.textContent())!;
}

test('a backup code brings progress to a new phone', async ({ page, browser }) => {
  await signIn(page, 'Karim', { xp: 77, xpByDay: { [new Date().toISOString().slice(0, 10)]: 77 } });
  const code = await backupCodeOf(page);

  const phone = await browser.newPage();
  await phone.goto('/');
  await phone.getByText('আগে শিখেছ? অগ্রগতি ফিরিয়ে আনো').click();
  await phone.getByLabel('Backup code').fill(code.toLowerCase());
  await phone.getByText('ফিরিয়ে আনো', { exact: true }).click();
  await expect(phone.locator('.home-greeting')).toContainText('Karim');
  await expect(phone.locator('.home-pills')).toContainText('77');
});

test('a wrong backup code says so', async ({ page }) => {
  await page.goto('/');
  await page.getByText('আগে শিখেছ? অগ্রগতি ফিরিয়ে আনো').click();
  await page.getByLabel('Backup code').fill('AAAAA-AAAAA');
  await page.getByText('ফিরিয়ে আনো', { exact: true }).click();
  await expect(page.locator('.bk-error')).toContainText('মিলল না');
});

test('the delete page erases a learner by their backup code', async ({ page }) => {
  await signIn(page, 'Mina');
  const code = await backupCodeOf(page);

  await page.goto('/delete.html');
  page.on('dialog', (d) => d.accept());
  await page.locator('#code').fill(code);
  await page.locator('#go').click();
  await expect(page.locator('#result')).toContainText('মুছে ফেলা হয়েছে');

  // The code no longer works.
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByText('আগে শিখেছ? অগ্রগতি ফিরিয়ে আনো').click();
  await page.getByLabel('Backup code').fill(code);
  await page.getByText('ফিরিয়ে আনো', { exact: true }).click();
  await expect(page.locator('.bk-error')).toContainText('মিলল না');
});
