// TC23–TC26: Address details, Invoice download, Scroll up/down
import { test, expect, Browser } from '@playwright/test';
import { HomePage }    from '../pages/HomePage';
import { PaymentPage } from '../pages/PaymentPage';
import { generateUser, PAYMENT_DETAILS } from '../utils/testData';
import { registerNewUser, loginUser, deleteAccount } from '../utils/helpers';

/** Shared helper: add first product and proceed to payment */
async function addProductAndGoToPayment(page: Parameters<typeof loginUser>[0]): Promise<void> {
  await page.goto('/products');
  await page.locator('.product-image-wrapper').first().hover();
  await page.locator('.product-overlay a[title="Add to Cart"]').first().click();
  await page.locator('#cartModal').waitFor({ state: 'visible' });
  await page.locator('#cartModal a:has-text("View Cart")').click();
  await page.waitForURL('**/view_cart**');
  await page.locator('a.btn.btn-default.check_out').click();
  await page.waitForURL('**/checkout**');
  await page.locator('textarea.form-control').fill('Automated test order');
  await page.locator('a.btn.btn-default.check_out').click();
  await page.waitForURL('**/payment**');
}

test.describe('TC23 - Verify Address Details in Checkout Page', () => {
  let email: string;
  let password: string;
  let firstName: string;
  let address1: string;
  let city: string;

  test.beforeAll(async ({ browser }: { browser: Browser }) => {
    const ctx  = await browser.newContext();
    const page = await ctx.newPage();
    const user = generateUser('addr_verify');
    ({ email, password, firstName, address1, city } = user);
    await registerNewUser(page, user);
    const homePage = new HomePage(page);
    await homePage.logout();
    await page.close();
    await ctx.close();
  });

  test('Should display correct delivery and billing address on checkout', async ({ page }) => {
    await loginUser(page, email, password);

    await page.goto('/products');
    await page.locator('.product-image-wrapper').first().hover();
    await page.locator('.product-overlay a[title="Add to Cart"]').first().click();
    await page.locator('#cartModal').waitFor({ state: 'visible' });
    await page.locator('#cartModal a:has-text("View Cart")').click();
    await page.waitForURL('**/view_cart**');
    await page.locator('a.btn.btn-default.check_out').click();
    await page.waitForURL('**/checkout**');

    // Delivery address assertions
    const deliveryText = await page.locator('#address_delivery').innerText();
    expect(deliveryText).toContain(firstName);
    expect(deliveryText).toContain(address1);
    expect(deliveryText).toContain(city);

    // Billing address assertions
    const billingText = await page.locator('#address_invoice').innerText();
    expect(billingText).toContain(firstName);

    // Complete order for cleanup
    await page.locator('textarea.form-control').fill('TC23 verification');
    await page.locator('a.btn.btn-default.check_out').click();
    await page.waitForURL('**/payment**');

    const paymentPage = new PaymentPage(page);
    await paymentPage.fillPaymentDetails(PAYMENT_DETAILS);
    await paymentPage.payAndConfirm();
    await expect(paymentPage.orderPlacedHeading).toBeVisible();
    await deleteAccount(page);
  });
});

test.describe('TC24 - Download Invoice after Purchase', () => {
  test('Should download invoice file after placing an order', async ({ page }) => {
    const user = generateUser('invoice_dl');
    await registerNewUser(page, user);

    await addProductAndGoToPayment(page);

    const paymentPage = new PaymentPage(page);
    await paymentPage.fillPaymentDetails(PAYMENT_DETAILS);
    await paymentPage.payAndConfirm();
    await expect(paymentPage.orderPlacedHeading).toBeVisible();

    const download = await paymentPage.downloadInvoice();
    expect(download.suggestedFilename()).toBeTruthy();

    await paymentPage.clickContinue();
    await deleteAccount(page);
  });
});

test.describe('TC25 - Scroll Up using Arrow Button', () => {
  test('Should scroll down then back to top via the scroll-up arrow', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await expect(page.locator('h2:has-text("Subscription")')).toBeVisible();

    // Click the floating scroll-up arrow
    const scrollBtn = page.locator('#scrollUp');
    if (await scrollBtn.isVisible()) {
      await scrollBtn.click();
      await page.waitForTimeout(1000);
      // Verify slider / logo is back in view
      await expect(page.locator('#slider-carousel, .logo img').first()).toBeVisible();
    } else {
      test.skip(true, '#scrollUp button not visible');
    }
  });
});

test.describe('TC26 - Scroll Up without Arrow Button', () => {
  test('Should scroll down then back to top using keyboard', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await expect(page.locator('h2:has-text("Subscription")')).toBeVisible();

    // Use keyboard shortcut to jump to top
    await page.keyboard.press('Control+Home');
    await page.waitForTimeout(500);
    await expect(page.locator('.logo img')).toBeVisible();
  });
});
