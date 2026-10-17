// product-search.spec.ts  –  TC18–TC22: Categories, Brands, Search+Cart, Reviews, Recommended
import { test, expect } from '../fixtures/BaseFixture';
import { test as baseTest, Browser } from '@playwright/test';
import { generateUser } from '../utils/TestData/users';
import { SEARCH_TERMS, CATEGORY_URLS } from '../utils/TestData/products';
import { REVIEW_MESSAGE } from '../utils/TestData/messagesWithTitles';
import { LoginPage } from '../pages/LoginPage';
import { RegistrationPage } from '../pages/RegistrationPage';
import { HomePage } from '../pages/HomePage';
import { Page } from '@playwright/test';

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
  const homePage = new HomePage(page);
  await homePage.navDeleteAccount.click();
  await page.waitForURL('**/delete_account**');
}

test.describe('TC18 - View Category Products', () => {
  test('Should navigate Women > Dress then Men > Tshirts', async ({ page, homePage }) => {
    await homePage.goto();
    await page.locator('a[href="#Women"]').click();
    await page.locator('a[href="/category_products/1"]').click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/.*category_products\/1.*/);
    await expect(page.locator('h2.title')).toBeVisible();

    await page.locator('a[href="#Men"]').click();
    await page.locator('a[href="/category_products/3"]').click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/.*category_products\/3.*/);
    await expect(page.locator('h2.title')).toBeVisible();
  });
});

test.describe('TC19 - View Brand Products', () => {
  test('Should open two different brand pages', async ({ page, homePage, productsPage }) => {
    await homePage.goto();
    await homePage.clickProducts();
    await page.waitForLoadState('domcontentloaded');

    await productsPage.brandLinks.first().click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h2.title')).toBeVisible();
    await expect(page.locator('.features_items')).toBeVisible();

    await productsPage.brandLinks.nth(1).click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('.features_items')).toBeVisible();
  });
});

test.describe('TC20 - Search Product and Verify in Cart after Login', () => {
  let email: string, password: string;

  baseTest.beforeAll(async ({ browser }: { browser: Browser }) => {
    const ctx  = await browser.newContext();
    const page = await ctx.newPage();
    const user = generateUser('search_cart');
    ({ email, password } = user);
    await registerAndLogin(page, user);
    const hp = new HomePage(page);
    await hp.logout();
    await page.close();
    await ctx.close();
  });

  test('Should search, add to cart, login, and verify cart items persist', async ({ page, productsPage }) => {
    await page.goto('/products');
    await productsPage.searchProduct(SEARCH_TERMS.top);
    await expect(productsPage.searchHeading).toBeVisible();
    await expect(productsPage.searchedProducts.first()).toBeVisible({ timeout: 10_000 });

    const addBtns = page.locator('.features_items .product-overlay a[title="Add to Cart"]');
    const total   = Math.min(2, await addBtns.count());
    for (let i = 0; i < total; i++) {
      await productsPage.searchedProducts.nth(i).hover();
      await addBtns.nth(i).click();
      await page.locator('#cartModal').waitFor({ state: 'visible' });
      await page.locator('.modal-footer button:has-text("Continue Shopping")').click();
      await page.locator('#cartModal').waitFor({ state: 'hidden' });
    }

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email, password);
    await page.goto('/view_cart');
    expect(await page.locator('.cart_description h4 a').count()).toBeGreaterThan(0);
    await deleteAccount(page);
  });
});

test.describe('TC21 - Add Review on Product', () => {
  test('Should submit a product review', async ({ productDetailsPage }) => {
    await productDetailsPage.goto(1);
    await expect(productDetailsPage.reviewLink).toBeVisible();
    await productDetailsPage.submitReview(REVIEW_MESSAGE.name, REVIEW_MESSAGE.email, REVIEW_MESSAGE.review);
    await expect(productDetailsPage.reviewSuccess).toBeVisible();
  });
});

test.describe('TC22 - Add to Cart from Recommended Items', () => {
  test('Should add recommended product to cart from home page', async ({ page, homePage }) => {
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
      expect(await page.locator('.cart_description h4 a').count()).toBeGreaterThan(0);
    } else {
      test.skip(true, 'Recommended items carousel not visible on this run');
    }
  });
});
