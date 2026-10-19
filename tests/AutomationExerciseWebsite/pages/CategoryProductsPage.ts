import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CategoryProductsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly productCards: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle    = page.locator('.features_items h2.title');
    this.productCards = page.locator('.features_items .product-image-wrapper');
  }

  async goto(categoryId: number | string): Promise<void> {
    await this.page.goto('/category_products/' + categoryId);
    await this.waitForPageLoad();
  }
}
