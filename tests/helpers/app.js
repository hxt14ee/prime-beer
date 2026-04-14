import { expect } from '@playwright/test';

export async function openCatalog(page) {
  await page.goto('/');

  const confirmAdult = page.locator('button', { hasText: /18/ }).first();
  if (await confirmAdult.count()) {
    const visible = await confirmAdult.isVisible().catch(() => false);
    if (visible) {
      await confirmAdult.click();
    }
  }

  await expect(page.locator('main')).toBeVisible();
}

export async function revealScrollToTopFab(page) {
  const main = page.locator('main');
  await main.evaluate((el) => {
    el.scrollTo({ top: el.scrollHeight, behavior: 'auto' });
  });
  await page.waitForTimeout(250);
}

export function scrollToTopFab(page) {
  return page.locator('button[aria-label="Наверх"]');
}
