import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { defineConfig, devices } from '@playwright/test';

const matrixPath = path.resolve('config/mobile-device-matrix.json');
const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
const runFullScope = process.env.MOBILE_TEST_SCOPE === 'full';

function buildProjects(devicesByTier, tierName) {
  return devicesByTier.map((item) => ({
    name: `${tierName}-${item.id}`,
    testDir: 'tests',
    use: {
      ...devices[item.playwrightDevice],
      browserName: item.browserEngine,
      locale: 'ru-RU',
      timezoneId: 'Europe/Moscow',
      colorScheme: 'light',
    },
    metadata: {
      tier: tierName,
      role: item.role,
    },
  }));
}

const tierAProjects = buildProjects(matrix.tiers.tierA, 'tier-a');
const tierBProjects = buildProjects(matrix.tiers.tierB, 'tier-b');
const projects = runFullScope ? [...tierAProjects, ...tierBProjects] : tierAProjects;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 45_000,
  expect: {
    timeout: 8_000,
  },
  outputDir: 'artifacts/playwright-output',
  reporter: [
    ['line'],
    ['html', { outputFolder: 'artifacts/playwright-html', open: 'never' }],
    ['json', { outputFile: 'artifacts/playwright/results.json' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects,
});
