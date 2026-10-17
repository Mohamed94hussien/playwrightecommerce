// TC10–TC15: Subscription, Cart, Full Checkout Flows
import { test, expect, Browser } from '@playwright/test';
import { HomePage }     from '../pages/HomePage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage }     from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { PaymentPage }  from '../pages/PaymentPage';
import { generateUser, PAYMENT_DETAILS } from '../utils/testData';
import { registerNewUser, deleteAccount } from '../utils/helpers';

test.describe('TC10 - Verify Subscription in Home Page', () => {
  test('Should subscribe with valid email on home page', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();
    await homePage.scrollToBottom();

    await expect(page.locator('h2:has-text("Subscription")')).toBeVisible();
    await homePage.subscribeWithEmail('subscriber_home@example.com');
    await expect(homePage.subscriptionSuccess).toBeVisible();
    await expect(homePage.subscriptionSuccess).toContainText(
      'You have been successfully subscribed!'
    );
  });
});

test.describe('TC11 - Verify Subscription in Cart Page', () => {
  test('Should subscribe with valid email on cart page', async ({ page }) => {
    const homePage = new HomePage(page);

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
  test('Should add multiple products and verify cart', async ({ page }) => {
    const homePage     = new HomePage(page);
    const productsPage = new ProductsPage(page);

    await homePage.goto();
    await homePage.clickProducts();

    // Add first product, continue shopping
    await productsPage.hoverAndAddToCart(0);
    await productsPage.continueShopping();

    // Add second product, go to cart
    await productsPage.hoverAndAddToCart(1);
    await productsPage.viewCartFromModal();

    const cartPage = new CartPage(page);
    expect(await cartPage.getCartItemCount()).toBeGreaterThanOrEqual(2);
    await expect(cartPage.cartTable).toBeVisible();
    await expect(cartPage.cartQtys.first()).toBeVisible();
    await expect(cartPage.cartTotals.first()).toBeVisible();
  });
});

test.describe('TC13 - Verify Product Quantity in Cart', () => {
  test('Should add product with quantity 4 and verify in cart', async ({ page }) => {
    await page.goto('/product_details/1');
    await page.waitForLoadState('domcontentloaded');

    const qtyInput = page.locator('input#quantity');
    await qtyInput.clear();
    await qtyInput.fill('4');

    await page.locator('button.cart').click();
    await page.locator('#cartModal').waitFor({ state: 'visible' });
    await page.locator('#cartModal a:has-text("View Cart")').click();
    await page.waitForURL('**/view_cart**');

    const qty = page.locator('.cart_quantity button').first();
    await expect(qty).toHaveText('4');
  });
});

test.describe('TC14 - Place Order: Register while Checkout', () => {
  test('Should register mid-checkout and complete order', async ({ page }) => {
    const user = generateUser('checkout_reg');

    // Add product to cart
    await page.goto('/products');
    await page.locator('.product-image-wrapper').first().hover();
    await page.locator('.product-overlay a[title="Add to Cart"]').first().click();
    await page.locator('#cartModal').waitFor({ state: 'visible' });
    await page.locator('#cartModal a:has-text("View Cart")').click();
    await page.waitForURL('**/view_cart**');

    // Proceed to checkout – modal pops up for guests
    await page.locator('a.btn.btn-default.check_out').click();
    const modal = page.locator('#checkoutModal');
    if (await modal.isVisible()) {
      await modal.locator('a[href="/login"]').click();
      await page.waitForURL('**/login**');
    }

    // Register
    await registerNewUser(page, user);

    // Back to cart → checkout
    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.proceedToCheckout();

    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.addComment('Please deliver during business hours.');
    await checkoutPage.placeOrder();

    const paymentPage = new PaymentPage(page);
    await paymentPage.fillPaymentDetails(PAYMENT_DETAILS);
    await paymentPage.payAndConfirm();

    await expect(paymentPage.orderPlacedHeading).toBeVisible();
    await deleteAccount(page);
    await expect(page.locator('h2[data-qa="account-deleted"]')).toBeVisible();
  });
});

test.describe('TC15 - Place Order: Register Before Checkout', () => {
  test('Should register first, add product, then checkout', async ({ page }) => {
    const user = generateUser('pre_reg');
    await registerNewUser(page, user);

    await page.goto('/products');
    await page.locator('.product-image-wrapper').first().hover();
    await page.locator('.product-overlay a[title="Add to Cart"]').first().click();
    await page.locator('#cartModal').waitFor({ state: 'visible' });
    await page.locator('#cartModal a:has-text("View Cart")').click();
    await page.waitForURL('**/view_cart**');

    await page.locator('a.btn.btn-default.check_out').click();
    await page.waitForURL('**/checkout**');

    await expect(page.locator('#address_delivery')).toBeVisible();
    await page.locator('textarea.form-control').fill('TC15 test order');
    await page.locator('a.btn.btn-default.check_out').click();
    await page.waitForURL('**/payment**');

    const paymentPage = new PaymentPage(page);
    await paymentPage.fillPaymentDetails(PAYMENT_DETAILS);
    await paymentPage.payAndConfirm();

    await expect(paymentPage.orderPlacedHeading).toBeVisible();
    await deleteAccount(page);
  });
});
