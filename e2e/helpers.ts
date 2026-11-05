import type { Page } from '@playwright/test';

export const ADMIN_TOKEN = 'e2e-admin';

/** A learner who finished onboarding and the first lesson, so the home page shows everything. */
export async function signIn(page: Page, name = 'Rina', extra: Record<string, unknown> = {}) {
  await page.goto('/');
  await page.evaluate(
    ([name, extra]) =>
      localStorage.setItem(
        'englio-progress-v1',
        JSON.stringify({
          profile: { name, districtId: 'dhaka', classId: 'class-8', joinedAt: '2026-10-01' },
          xp: 10,
          hearts: 5,
          completed: { 'u1-l1': 1 },
          xpByDay: { [new Date().toISOString().slice(0, 10)]: 10 },
          placementTaken: true,
          ...extra,
        }),
      ),
    [name, extra] as const,
  );
  await page.reload();
  await page.locator('.home-greeting').waitFor();
}

/** Opens a tab of the bottom bar: 1 শেখো, 2 অক্ষর, 3 ব্যাকরণ, 4 প্রোফাইল. */
export const openTab = (page: Page, n: 1 | 2 | 3 | 4) => page.locator(`.tabbar-item:nth-child(${n})`).click();

/** Opens an admin page on the phone layout: from the tab bar, or else from the "আরও" sheet. */
export async function adminGo(page: Page, label: string) {
  const tab = page.locator('.ad-tabbar').getByRole('button', { name: label, exact: true });
  if (await tab.count()) return tab.click();
  await page.locator('.ad-tabbar').getByRole('button', { name: 'আরও' }).click();
  await page.locator('.ad-more').getByRole('button', { name: label, exact: true }).click();
}
