import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class BrandProductsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly productCards: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle    = page.locator('.features_items h2.title');
    this.productCards = page.locator('.features_items .product-image-wrapper');
  }

  async goto(brandName: string): Promise<void> {
    await this.page.goto('/brand_products/' + brandName);
    await this.waitForPageLoad();
  }
}
