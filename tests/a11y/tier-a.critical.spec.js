import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openCatalog } from '../helpers/app.js';

test.describe('Tier-A Accessibility', () => {
  test('no critical axe violations on catalog screen', async ({ page }, testInfo) => {
    await openCatalog(page);

    const results = await new AxeBuilder({ page }).analyze();
    const critical = results.violations.filter((item) => item.impact === 'critical');

    await testInfo.attach('axe-report.json', {
      body: JSON.stringify(results, null, 2),
      contentType: 'application/json',
    });

    expect(critical).toEqual([]);
  });
});
