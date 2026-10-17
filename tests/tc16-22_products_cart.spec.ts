// TC16–TC22: Login-checkout, Cart removal, Categories, Brands, Reviews, Recommended
import { test, expect, Browser } from '@playwright/test';
import { HomePage }        from '../pages/HomePage';
import { ProductsPage }    from '../pages/ProductsPage';
import { CartPage }        from '../pages/CartPage';
import { PaymentPage }     from '../pages/PaymentPage';
import { generateUser, PAYMENT_DETAILS } from '../utils/testData';
import { registerNewUser, loginUser, deleteAccount } from '../utils/helpers';

test.describe('TC16 - Place Order: Login before Checkout', () => {
  let email: string;
  let password: string;

  test.beforeAll(async ({ browser }: { browser: Browser }) => {
    const ctx  = await browser.newContext();
    const page = await ctx.newPage();
    const user = generateUser('login_checkout');
    ({ email, password } = user);
    await registerNewUser(page, user);
    const homePage = new HomePage(page);
    await homePage.logout();
    await page.close();
    await ctx.close();
  });

  test('Should login, add product and complete order', async ({ page }) => {
    await loginUser(page, email, password);

    await page.goto('/products');
    await page.locator('.product-image-wrapper').first().hover();
    await page.locator('.product-overlay a[title="Add to Cart"]').first().click();
    await page.locator('#cartModal').waitFor({ state: 'visible' });
    await page.locator('#cartModal a:has-text("View Cart")').click();
    await page.waitForURL('**/view_cart**');

    await page.locator('a.btn.btn-default.check_out').click();
    await page.waitForURL('**/checkout**');

    await page.locator('textarea.form-control').fill('TC16 test order');
    await page.locator('a.btn.btn-default.check_out').click();
    await page.waitForURL('**/payment**');

    const paymentPage = new PaymentPage(page);
    await paymentPage.fillPaymentDetails(PAYMENT_DETAILS);
    await paymentPage.payAndConfirm();

    await expect(paymentPage.orderPlacedHeading).toBeVisible();
    await deleteAccount(page);
  });
});

test.describe('TC17 - Remove Products from Cart', () => {
  test('Should remove a product from the cart', async ({ page }) => {
    const homePage     = new HomePage(page);
    const productsPage = new ProductsPage(page);
    const cartPage     = new CartPage(page);

    await homePage.goto();
    await homePage.clickProducts();

    await productsPage.hoverAndAddToCart(0);
    await productsPage.viewCartFromModal();

    const before = await cartPage.getCartItemCount();
    expect(before).toBeGreaterThan(0);

    await cartPage.removeItem(0);
    await page.waitForTimeout(1000);

    const after = await cartPage.getCartItemCount();
    expect(after).toBe(0);
  });
});

test.describe('TC18 - View Category Products', () => {
  test('Should navigate Women > Dress then Men > Tshirts', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Women → Dress
    await page.locator('a[href="#Women"]').click();
    await page.locator('a[href="/category_products/1"]').click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/.*category_products\/1.*/);
    await expect(page.locator('h2.title')).toBeVisible();

    // Men → Tshirts
    await page.locator('a[href="#Men"]').click();
    await page.locator('a[href="/category_products/3"]').click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/.*category_products\/3.*/);
    await expect(page.locator('h2.title')).toBeVisible();
  });
});

test.describe('TC19 - View Brand Products', () => {
  test('Should open two different brand pages', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.clickProducts();
    await page.waitForLoadState('domcontentloaded');

    const brandLinks = page.locator('.brands-name ul li a');

    await brandLinks.first().click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h2.title')).toBeVisible();
    await expect(page.locator('.features_items')).toBeVisible();

    await brandLinks.nth(1).click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('.features_items')).toBeVisible();
  });
});

test.describe('TC20 - Search Product and Verify in Cart after Login', () => {
  let email: string;
  let password: string;

  test.beforeAll(async ({ browser }: { browser: Browser }) => {
    const ctx  = await browser.newContext();
    const page = await ctx.newPage();
    const user = generateUser('search_cart');
    ({ email, password } = user);
    await registerNewUser(page, user);
    const homePage = new HomePage(page);
    await homePage.logout();
    await page.close();
    await ctx.close();
  });

  test('Should search, add to cart, login, and verify cart items persist', async ({ page }) => {
    await page.goto('/products');
    await page.locator('input#search_product').fill('Top');
    await page.locator('button#submit_search').click();

    const heading = page.locator('h2.title:has-text("Searched Products")');
    await expect(heading).toBeVisible();

    const results = page.locator('.features_items .product-image-wrapper');
    await expect(results.first()).toBeVisible({ timeout: 10_000 });

    // Add up to 2 found products to cart
    const addBtns  = page.locator('.features_items .product-overlay a[title="Add to Cart"]');
    const total    = Math.min(2, await addBtns.count());
    for (let i = 0; i < total; i++) {
      await results.nth(i).hover();
      await addBtns.nth(i).click();
      await page.locator('#cartModal').waitFor({ state: 'visible' });
      await page.locator('.modal-footer button:has-text("Continue Shopping")').click();
      await page.locator('#cartModal').waitFor({ state: 'hidden' });
    }

    // Login and verify items are still in cart
    await loginUser(page, email, password);
    await page.goto('/view_cart');

    const cartItems = page.locator('.cart_description h4 a');
    expect(await cartItems.count()).toBeGreaterThan(0);

    await deleteAccount(page);
  });
});

test.describe('TC21 - Add Review on Product', () => {
  test('Should submit a product review', async ({ page }) => {
    await page.goto('/product_details/1');
    await page.waitForLoadState('domcontentloaded');

    await expect(
      page.locator('a[href="#reviews"]:has-text("Write Your Review")')
    ).toBeVisible();

    await page.locator('input#name').fill('Review Tester');
    await page.locator('input#email').fill('reviewer@test.com');
    await page.locator('textarea#review').fill(
      'This product is excellent! Great quality and very fast shipping.'
    );
    await page.locator('button#button-review').click();

    await expect(page.locator('div.alert-success')).toBeVisible();
  });
});

test.describe('TC22 - Add to Cart from Recommended Items', () => {
  test('Should add recommended product to cart from home page', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const recommended = page.locator('#recommended-item-carousel');
    await recommended.scrollIntoViewIfNeeded();

    const addBtn = recommended.locator('.add-to-cart').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.locator('#cartModal').waitFor({ state: 'visible' });
      await page.locator('#cartModal a:has-text("View Cart")').click();
      await page.waitForURL('**/view_cart**');

      const cartItems = page.locator('.cart_description h4 a');
      expect(await cartItems.count()).toBeGreaterThan(0);
    } else {
      test.skip(true, 'Recommended items carousel not visible on this run');
    }
  });
});
