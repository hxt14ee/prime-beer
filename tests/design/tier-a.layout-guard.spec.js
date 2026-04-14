import { expect, test } from '@playwright/test';
import { openCatalog, revealScrollToTopFab, scrollToTopFab } from '../helpers/app.js';

const MAX_OVERFLOW_PX = 1;
const MIN_TAP_TARGET_PX = 44;

test.describe('Tier-A Design Guard', () => {
  test('layout stays inside viewport and FAB stays in right corner', async ({ page }, testInfo) => {
    await openCatalog(page);
    await revealScrollToTopFab(page);

    const fab = scrollToTopFab(page);
    await expect(fab).toBeVisible();

    const measurements = await page.evaluate(() => {
      const root = document.documentElement;
      const fabNode = document.querySelector('button[aria-label="Наверх"]');
      if (!fabNode) return null;
      const rect = fabNode.getBoundingClientRect();
      const css = window.getComputedStyle(fabNode);
      return {
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        scrollWidth: root.scrollWidth,
        scrollHeight: root.scrollHeight,
        fab: {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
          position: css.position,
          pointerEvents: css.pointerEvents,
        },
      };
    });

    expect(measurements).not.toBeNull();
    expect(measurements.scrollWidth).toBeLessThanOrEqual(measurements.viewportWidth + MAX_OVERFLOW_PX);
    expect(measurements.fab.position).toBe('fixed');
    expect(measurements.fab.pointerEvents).toBe('auto');
    expect(measurements.fab.width).toBeGreaterThanOrEqual(MIN_TAP_TARGET_PX);
    expect(measurements.fab.height).toBeGreaterThanOrEqual(MIN_TAP_TARGET_PX);
    expect(measurements.fab.left).toBeGreaterThan(measurements.viewportWidth - 96);
    expect(measurements.fab.right).toBeLessThanOrEqual(measurements.viewportWidth);
    expect(measurements.fab.top).toBeGreaterThanOrEqual(0);
    expect(measurements.fab.bottom).toBeLessThanOrEqual(measurements.viewportHeight);

    await testInfo.attach('tier-a-layout-screenshot', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  });
});
