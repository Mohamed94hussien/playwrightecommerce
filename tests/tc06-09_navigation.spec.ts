// TC06–TC09: Contact Us, Test Cases page, All Products, Search
import { test, expect } from '@playwright/test';
import * as path from 'path';
import { HomePage }     from '../pages/HomePage';
import { ContactPage }  from '../pages/ContactPage';

test.describe('TC06 - Contact Us Form', () => {
  test('Should submit contact us form successfully', async ({ page }) => {
    const homePage    = new HomePage(page);
    const contactPage = new ContactPage(page);

    await homePage.goto();
    await expect(page).toHaveTitle(/Automation Exercise/);

    await homePage.clickContactUs();
    await expect(contactPage.heading).toBeVisible();

    await contactPage.fillForm({
      name:    'Test User',
      email:   'testuser@example.com',
      subject: 'Automation Test - Contact',
      message: 'This is an automated test message for the contact form.',
    });

    // Upload a test file
    const filePath = path.join(__dirname, '../utils/test-upload.txt');
    await contactPage.uploadFile(filePath);

    // submit() handles the browser dialog internally
    await contactPage.submit();

    await expect(contactPage.successAlert).toBeVisible();
    await contactPage.goHome();
    await expect(page).toHaveURL('https://automationexercise.com/');
  });
});

test.describe('TC07 - Verify Test Cases Page', () => {
  test('Should navigate to Test Cases page', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();
    // navTestCases is scoped to the header to avoid multiple-match issues
    await homePage.clickTestCases();

    await expect(page).toHaveURL(/.*test_cases.*/);

    // Verify at least one test-case accordion panel is present
    const panels = page.locator('.panel-group .panel');
    await expect(panels.first()).toBeVisible();
    expect(await panels.count()).toBeGreaterThan(0);
  });
});

test.describe('TC08 - Verify All Products and Product Detail Page', () => {
  test('Should display all products and open a product detail page', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();
    await homePage.clickProducts();

    await expect(page).toHaveURL(/.*products.*/);

    const products = page.locator('.product-image-wrapper');
    expect(await products.count()).toBeGreaterThan(0);

    // Open the first product's detail page
    await page.locator('a[href*="/product_details/"]').first().click();
    await expect(page).toHaveURL(/.*product_details.*/);

    // Verify essential detail elements
    await expect(page.locator('.product-information h2')).toBeVisible();
    await expect(page.locator('.product-information span span')).toBeVisible();
    await expect(
      page.locator('.product-information p').filter({ hasText: 'Category:' })
    ).toBeVisible();
  });
});

test.describe('TC09 - Search Product', () => {
  test('Should find products matching search term', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();
    await homePage.clickProducts();

    await page.locator('input#search_product').fill('Blue Top');
    await page.locator('button#submit_search').click();

    // Wait for the "Searched Products" heading to confirm the results rendered
    const heading = page.locator('h2.title:has-text("Searched Products")');
    await expect(heading).toBeVisible();

    // FIX: results are rendered inside .features_items after a search, not a separate #searched-products wrapper
    const results = page.locator('.features_items .product-image-wrapper');
    await expect(results.first()).toBeVisible({ timeout: 10_000 });
    expect(await results.count()).toBeGreaterThan(0);
  });
});
