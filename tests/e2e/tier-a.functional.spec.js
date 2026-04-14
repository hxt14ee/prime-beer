import { expect, test } from '@playwright/test';
import { openCatalog, revealScrollToTopFab, scrollToTopFab } from '../helpers/app.js';

test.describe('Tier-A Functional', () => {
  test('scroll-to-top FAB returns list to top and stays clickable', async ({ page }) => {
    await openCatalog(page);
    await revealScrollToTopFab(page);

    const fab = scrollToTopFab(page);
    await expect(fab).toBeVisible();
    await expect(fab).toBeEnabled();
    await fab.click();

    const main = page.locator('main');
    await expect
      .poll(async () => main.evaluate((el) => Math.round(el.scrollTop)))
      .toBeLessThan(20);
  });
});
