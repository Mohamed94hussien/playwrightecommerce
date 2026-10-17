import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class BrandProductsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly productItems: Locator;
  readonly productCards: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle    = page.locator('h2.title');
    this.productItems = page.locator('.features_items');
    this.productCards = page.locator('.product-image-wrapper');
  }

  async goto(brandName: string): Promise<void> {
    await this.page.goto('/brand_products/' + brandName);
    await this.waitForPageLoad();
  }

  async getProductCount(): Promise<number> {
    return this.productCards.count();
  }

  async isTitleVisible(): Promise<boolean> {
    return this.pageTitle.isVisible();
  }
}
