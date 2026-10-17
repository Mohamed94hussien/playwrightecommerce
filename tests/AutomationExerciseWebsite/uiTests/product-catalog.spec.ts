// product-catalog.spec.ts  –  TC07–TC09: Test Cases page, All Products, Search
import { test, expect } from '../fixtures/BaseFixture';
import { SEARCH_TERMS } from '../utils/TestData/products';

test.describe('TC07 - Verify Test Cases Page', () => {
  test('Should navigate to Test Cases page', async ({ page, homePage }) => {
    await homePage.goto();
    await homePage.clickTestCases();
    await expect(page).toHaveURL(/.*test_cases.*/);
    const panels = page.locator('.panel-group .panel');
    await expect(panels.first()).toBeVisible();
    expect(await panels.count()).toBeGreaterThan(0);
  });
});

test.describe('TC08 - Verify All Products and Product Detail Page', () => {
  test('Should display all products and open a product detail page', async ({
    page, homePage, productsPage, productDetailsPage,
  }) => {
    await homePage.goto();
    await homePage.clickProducts();
    await expect(page).toHaveURL(/.*products.*/);
    expect(await productsPage.getProductCount()).toBeGreaterThan(0);

    await page.locator('a[href*="/product_details/"]').first().click();
    await expect(page).toHaveURL(/.*product_details.*/);

    await expect(productDetailsPage.productName).toBeVisible();
    await expect(productDetailsPage.productPrice).toBeVisible();
    await expect(productDetailsPage.productCategory).toBeVisible();
  });
});

test.describe('TC09 - Search Product', () => {
  test('Should find products matching search term', async ({ page, homePage, productsPage }) => {
    await homePage.goto();
    await homePage.clickProducts();
    await productsPage.searchProduct(SEARCH_TERMS.blue);

    await expect(productsPage.searchHeading).toBeVisible();
    await expect(productsPage.searchedProducts.first()).toBeVisible({ timeout: 10_000 });
    expect(await productsPage.searchedProducts.count()).toBeGreaterThan(0);
  });
});
