// Full-order-cycle.spec.ts  –  TC10–TC17 + TC23–TC24: Subscriptions, Cart, Full Checkout Flows, Address, Invoice
import { test, expect } from '../fixtures/BaseFixture';
import { test as baseTest, Browser, Page } from '@playwright/test';
import { generateUser } from '../utils/TestData/users';
import { DEFAULT_PAYMENT_CARD } from '../utils/TestData/paymentCard';
import { LoginPage }        from '../pages/LoginPage';
import { RegistrationPage } from '../pages/RegistrationPage';
import { HomePage }         from '../pages/HomePage';

async function registerAndLogin(page: Page, user: ReturnType<typeof generateUser>): Promise<void> {
  const loginPage = new LoginPage(page);
  const regPage   = new RegistrationPage(page);
  await loginPage.goto();
  await loginPage.signup(user.name, user.email);
  await regPage.fillAccountInfo({ password: user.password, day: user.dob.day, month: user.dob.month, year: user.dob.year, newsletter: true, offers: true });
  await regPage.fillAddressInfo({ firstName: user.firstName, lastName: user.lastName, company: user.company, address1: user.address1, address2: user.address2, country: user.country, state: user.state, city: user.city, zipcode: user.zipcode, mobile: user.mobile });
  await regPage.createAccount();
  await regPage.clickContinue();
}

async function deleteAccount(page: Page): Promise<void> {
  const hp = new HomePage(page);
  await hp.navDeleteAccount.click();
  await page.waitForURL('**/delete_account**');
}

async function addFirstProductToCart(page: Page): Promise<void> {
  await page.goto('/products');
  await page.locator('.product-image-wrapper').first().hover();
  await page.locator('.product-overlay a[title="Add to Cart"]').first().click();
  await page.locator('#cartModal').waitFor({ state: 'visible' });
  await page.locator('#cartModal a:has-text("View Cart")').click();
  await page.waitForURL('**/view_cart**');
}

async function addProductAndGoToPayment(page: Page): Promise<void> {
  await addFirstProductToCart(page);
  await page.locator('a.btn.btn-default.check_out').click();
  await page.waitForURL('**/checkout**');
  await page.locator('textarea.form-control').fill('Automated test order');
  await page.locator('a.btn.btn-default.check_out').click();
  await page.waitForURL('**/payment**');
}

test.describe('TC10 - Verify Subscription in Home Page', () => {
  test('Should subscribe with valid email on home page', async ({ page, homePage }) => {
    await homePage.goto();
    await homePage.scrollToBottom();
    await expect(page.locator('h2:has-text("Subscription")')).toBeVisible();
    await homePage.subscribeWithEmail('subscriber_home@example.com');
    await expect(homePage.subscriptionSuccess).toBeVisible();
    await expect(homePage.subscriptionSuccess).toContainText('You have been successfully subscribed!');
  });
});

test.describe('TC11 - Verify Subscription in Cart Page', () => {
  test('Should subscribe with valid email on cart page', async ({ page, homePage }) => {
    await homePage.goto();
    await homePage.clickCart();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator('h2:has-text("Subscription")')).toBeVisible();
    await page.locator('#susbscribe_email').fill('subscriber_cart@example.com');
    await page.locator('#subscribe').click();
    await expect(page.locator('.alert-success')).toBeVisible();
  });
});

test.describe('TC12 - Add Products to Cart', () => {
  test('Should add multiple products and verify cart', async ({ cartPage, productsPage, homePage }) => {
    await homePage.goto();
    await homePage.clickProducts();
    await productsPage.hoverAndAddToCart(0);
    await productsPage.continueShopping();
    await productsPage.hoverAndAddToCart(1);
    await productsPage.viewCartFromModal();
    expect(await cartPage.getCartItemCount()).toBeGreaterThanOrEqual(2);
    await expect(cartPage.cartTable).toBeVisible();
    await expect(cartPage.cartQtys.first()).toBeVisible();
    await expect(cartPage.cartTotals.first()).toBeVisible();
  });
});

test.describe('TC13 - Verify Product Quantity in Cart', () => {
  test('Should add product with quantity 4 and verify in cart', async ({ page, productDetailsPage, cartPage }) => {
    await productDetailsPage.goto(1);
    await productDetailsPage.setQuantity(4);
    await productDetailsPage.addToCart();
    await productDetailsPage.viewCart();
    await expect(cartPage.cartQtys.first()).toHaveText('4');
  });
});

test.describe('TC14 - Place Order: Register while Checkout', () => {
  test('Should register mid-checkout and complete order', async ({ page, cartPage, checkoutPage, paymentPage }) => {
    const user = generateUser('checkout_reg');
    await addFirstProductToCart(page);
    await page.locator('a.btn.btn-default.check_out').click();
    const modal = page.locator('#checkoutModal');
    if (await modal.isVisible()) {
      await modal.locator('a[href="/login"]').click();
      await page.waitForURL('**/login**');
    }
    await registerAndLogin(page, user);
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await checkoutPage.addComment('Please deliver during business hours.');
    await checkoutPage.placeOrder();
    await paymentPage.fillPaymentDetails(DEFAULT_PAYMENT_CARD);
    await paymentPage.payAndConfirm();
    await expect(paymentPage.orderPlacedHeading).toBeVisible();
    await deleteAccount(page);
    await expect(page.locator('h2[data-qa="account-deleted"]')).toBeVisible();
  });
});

test.describe('TC15 - Place Order: Register Before Checkout', () => {
  test('Should register first, add product, then checkout', async ({ page, paymentPage }) => {
    const user = generateUser('pre_reg');
    await registerAndLogin(page, user);
    await addFirstProductToCart(page);
    await page.locator('a.btn.btn-default.check_out').click();
    await page.waitForURL('**/checkout**');
    await expect(page.locator('#address_delivery')).toBeVisible();
    await page.locator('textarea.form-control').fill('TC15 test order');
    await page.locator('a.btn.btn-default.check_out').click();
    await page.waitForURL('**/payment**');
    await paymentPage.fillPaymentDetails(DEFAULT_PAYMENT_CARD);
    await paymentPage.payAndConfirm();
    await expect(paymentPage.orderPlacedHeading).toBeVisible();
    await deleteAccount(page);
  });
});

test.describe('TC16 - Place Order: Login before Checkout', () => {
  let email: string, password: string;

  baseTest.beforeAll(async ({ browser }: { browser: Browser }) => {
    const ctx  = await browser.newContext();
    const page = await ctx.newPage();
    const user = generateUser('login_checkout');
    ({ email, password } = user);
    await registerAndLogin(page, user);
    const hp = new HomePage(page);
    await hp.logout();
    await page.close();
    await ctx.close();
  });

  test('Should login, add product and complete order', async ({ page, paymentPage }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email, password);
    await addFirstProductToCart(page);
    await page.locator('a.btn.btn-default.check_out').click();
    await page.waitForURL('**/checkout**');
    await page.locator('textarea.form-control').fill('TC16 test order');
    await page.locator('a.btn.btn-default.check_out').click();
    await page.waitForURL('**/payment**');
    await paymentPage.fillPaymentDetails(DEFAULT_PAYMENT_CARD);
    await paymentPage.payAndConfirm();
    await expect(paymentPage.orderPlacedHeading).toBeVisible();
    await deleteAccount(page);
  });
});

test.describe('TC17 - Remove Products from Cart', () => {
  test('Should remove a product from the cart', async ({ page, homePage, productsPage, cartPage }) => {
    await homePage.goto();
    await homePage.clickProducts();
    await productsPage.hoverAndAddToCart(0);
    await productsPage.viewCartFromModal();
    const before = await cartPage.getCartItemCount();
    expect(before).toBeGreaterThan(0);
    await cartPage.removeItem(0);
    await page.waitForTimeout(1000);
    expect(await cartPage.getCartItemCount()).toBe(0);
  });
});

test.describe('TC23 - Verify Address Details in Checkout Page', () => {
  let email: string, password: string, firstName: string, address1: string, city: string;

  baseTest.beforeAll(async ({ browser }: { browser: Browser }) => {
    const ctx  = await browser.newContext();
    const page = await ctx.newPage();
    const user = generateUser('addr_verify');
    ({ email, password, firstName, address1, city } = user);
    await registerAndLogin(page, user);
    const hp = new HomePage(page);
    await hp.logout();
    await page.close();
    await ctx.close();
  });

  test('Should display correct delivery and billing address on checkout', async ({ page, paymentPage }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email, password);
    await addFirstProductToCart(page);
    await page.locator('a.btn.btn-default.check_out').click();
    await page.waitForURL('**/checkout**');
    const deliveryText = await page.locator('#address_delivery').innerText();
    expect(deliveryText).toContain(firstName);
    expect(deliveryText).toContain(address1);
    expect(deliveryText).toContain(city);
    const billingText = await page.locator('#address_invoice').innerText();
    expect(billingText).toContain(firstName);
    await page.locator('textarea.form-control').fill('TC23 verification');
    await page.locator('a.btn.btn-default.check_out').click();
    await page.waitForURL('**/payment**');
    await paymentPage.fillPaymentDetails(DEFAULT_PAYMENT_CARD);
    await paymentPage.payAndConfirm();
    await expect(paymentPage.orderPlacedHeading).toBeVisible();
    await deleteAccount(page);
  });
});

test.describe('TC24 - Download Invoice after Purchase', () => {
  test('Should download invoice file after placing an order', async ({ page, paymentPage }) => {
    const user = generateUser('invoice_dl');
    await registerAndLogin(page, user);
    await addProductAndGoToPayment(page);
    await paymentPage.fillPaymentDetails(DEFAULT_PAYMENT_CARD);
    await paymentPage.payAndConfirm();
    await expect(paymentPage.orderPlacedHeading).toBeVisible();
    const download = await paymentPage.downloadInvoice();
    expect(download.suggestedFilename()).toBeTruthy();
    await paymentPage.clickContinue();
    await deleteAccount(page);
  });
});
