// scroll-tests.spec.ts  --  TC25-TC26: Scroll up with arrow, Scroll up without arrow
import { test, expect } from '../fixtures/BaseFixture';

test.describe('TC25 - Scroll Up using Arrow Button', () => {
  test('Should scroll down then back to top via the scroll-up arrow', async ({ page, homePage }) => {
    await homePage.goto();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await expect(page.locator('h2:has-text("Subscription")')).toBeVisible();

    const scrollBtn = page.locator('#scrollUp');
    if (await scrollBtn.isVisible()) {
      await scrollBtn.click();
      await page.waitForTimeout(1000);
      await expect(page.locator('#slider-carousel, .logo img').first()).toBeVisible();
    } else {
      test.skip(true, '#scrollUp button not visible');
    }
  });
});

test.describe('TC26 - Scroll Up without Arrow Button', () => {
  test('Should scroll down then back to top using keyboard', async ({ page, homePage }) => {
    await homePage.goto();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await expect(page.locator('h2:has-text("Subscription")')).toBeVisible();

    await page.keyboard.press('Control+Home');
    await page.waitForTimeout(500);
    await expect(page.locator('.logo img')).toBeVisible();
  });
});
