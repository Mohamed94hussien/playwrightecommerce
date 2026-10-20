// product-search.spec.ts  –  TC18–TC22: Categories, Brands, Search+Cart, Reviews, Recommended
import { test, expect } from '../fixtures/BaseFixture';
import { SEARCH_TERMS, CATEGORY_URLS } from '../utils/TestData/products';
import { REVIEW_MESSAGE } from '../utils/TestData/messagesWithTitles';

test.describe('TC18 - View Category Products', () => {
  test('Should navigate Women > Dress then Men > Tshirts', async ({ homePage, categoryProductsPage }) => {
    await homePage.goto();

    await homePage.openCategory(homePage.womenCategory, CATEGORY_URLS.womenDress);
    // The site renders these titles with a double space after the dash
    await expect(categoryProductsPage.pageTitle).toContainText(/Women -\s+Dress Products/i);
    await expect(categoryProductsPage.productCards.first()).toBeVisible();

    await homePage.openCategory(homePage.menCategory, CATEGORY_URLS.menTshirts);
    await expect(categoryProductsPage.pageTitle).toContainText(/Men -\s+Tshirts Products/i);
    await expect(categoryProductsPage.productCards.first()).toBeVisible();
  });
});

test.describe('TC19 - View Brand Products', () => {
  test('Should open two different brand pages', async ({ page, homePage, productsPage, brandProductsPage }) => {
    await homePage.goto();
    await homePage.clickProducts();

    for (const index of [0, 1]) {
      const link  = productsPage.brandLinks.nth(index);
      const href  = (await link.getAttribute('href')) ?? '';
      const brand = decodeURIComponent(href.split('/').pop() ?? '');
      await link.click();
      await page.waitForURL(`**${href}`);
      await expect(brandProductsPage.pageTitle).toContainText(new RegExp(`Brand -\\s+${brand} Products`, 'i'));
      await expect(brandProductsPage.productCards.first()).toBeVisible();
    }
  });
});

test.describe('TC20 - Search Product and Verify in Cart after Login', () => {
  test('Should search, add to cart, login, and verify cart items persist', async ({
    homePage, loginPage, productsPage, cartPage, registeredUser,
  }) => {
    await productsPage.goto();
    await productsPage.searchProduct(SEARCH_TERMS.top);
    await expect(productsPage.searchedProducts.nth(1)).toBeVisible();

    const addedNames = (await productsPage.productNames.allInnerTexts()).slice(0, 2);
    for (let i = 0; i < addedNames.length; i++) {
      await productsPage.addToCart(i);
      await productsPage.continueShopping();
    }

    await homePage.clickCart();
    await expect(cartPage.cartProductNames).toHaveText(addedNames);

    await loginPage.goto();
    await loginPage.login(registeredUser.email, registeredUser.password);
    await expect(homePage.loggedInUser).toBeVisible();

    await homePage.clickCart();
    await expect(cartPage.cartProductNames).toHaveText(addedNames);
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
  test('Should add recommended product to cart from home page', async ({ homePage, cartPage }) => {
    await homePage.goto();
    await homePage.scrollToBottom();
    await expect(homePage.recommendedSection).toBeVisible();

    await homePage.addFirstRecommendedToCart();
    await homePage.cartModal.viewCart();
    await expect(cartPage.cartProductNames).toHaveCount(1);
  });
});
