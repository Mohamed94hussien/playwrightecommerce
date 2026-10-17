import { FullConfig } from '@playwright/test';

/**
 * Global setup runs once before all tests.
 * Useful for seeding data, checking connectivity, or setting environment vars.
 */
async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0]?.use?.baseURL ?? 'https://automationexercise.com';
  console.log(`\n[Global Setup] Running tests against: ${baseURL}`);
}

export default globalSetup;
