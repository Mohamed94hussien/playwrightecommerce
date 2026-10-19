// scroll-tests.spec.ts  --  TC25-TC26: Scroll up with arrow, Scroll up without arrow
import { test, expect } from '../fixtures/BaseFixture';

test.describe('TC25 - Scroll Up using Arrow Button', () => {
  test('Should scroll down then back to top via the scroll-up arrow', async ({ homePage }) => {
    await homePage.goto();
    await homePage.scrollToBottom();
    await expect(homePage.subscriptionHeading).toBeInViewport();
    await expect(homePage.slider).not.toBeInViewport();

    await homePage.scrollUpBtn.click();

    await expect(homePage.slider).toBeInViewport();
    await expect.poll(() => homePage.getScrollY()).toBe(0);
  });
});

test.describe('TC26 - Scroll Up without Arrow Button', () => {
  test('Should scroll down then back to top using keyboard', async ({ page, homePage }) => {
    await homePage.goto();
    await homePage.scrollToBottom();
    await expect(homePage.subscriptionHeading).toBeInViewport();
    await expect(homePage.slider).not.toBeInViewport();

    await page.keyboard.press('Home');

    await expect(homePage.slider).toBeInViewport();
    await expect.poll(() => homePage.getScrollY()).toBe(0);
  });
});
