import { defineConfig, devices } from '@playwright/test';
import { env } from './config/env';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['html', { outputFolder: 'reports/html-report', open: 'never' }],
    ['list'],
    ['json', { outputFile: 'reports/results.json' }],
  ],
  use: {
    baseURL: env.baseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 0,
    },
  },
  projects: [
    // Setup/teardown is scoped to add-user.spec.ts only: the dedicated
    // admin-add-user project is the sole project carrying dependencies: ['setup'],
    // so chromium (every other spec) never triggers them. teardown is declared on
    // setup so cleanup still runs when the add-user test fails or is interrupted.
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      teardown: 'teardown',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'teardown',
      testMatch: /.*\.teardown\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      // add-user.spec.ts is excluded here too; otherwise chromium would collect and
      // run it directly, without setup having created the employee first.
      testIgnore: [/.*\.(setup|teardown)\.ts/, /add-user\.spec\.ts/],
    },
    {
      name: 'admin-add-user',
      testMatch: /add-user\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
});
