import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/AutomationExerciseWebsite/uiTests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  // No local retries so flaky tests surface during development; CI retries absorb network blips on the public site.
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  globalSetup: './tests/AutomationExerciseWebsite/utils/Setup/globalSetup.ts',
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
    ['list'],
  ],
  use: {
    baseURL: 'https://automationexercise.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  timeout: 60_000,
});
