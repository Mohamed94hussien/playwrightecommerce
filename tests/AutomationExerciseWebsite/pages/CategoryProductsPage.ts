import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CategoryProductsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly productItems: Locator;
  readonly productCards: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle    = page.locator('h2.title');
    this.productItems = page.locator('.features_items');
    this.productCards = page.locator('.product-image-wrapper');
  }

  async goto(categoryId: number | string): Promise<void> {
    await this.page.goto('/category_products/' + categoryId);
    await this.waitForPageLoad();
  }

  async getProductCount(): Promise<number> {
    return this.productCards.count();
  }

  async isTitleVisible(): Promise<boolean> {
    return this.pageTitle.isVisible();
  }
}
