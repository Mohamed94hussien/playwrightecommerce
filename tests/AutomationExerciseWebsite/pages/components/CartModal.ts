import { Locator, Page } from '@playwright/test';

/** The "Added!" modal shown after adding a product to the cart from any listing or detail page. */
export class CartModal {
  readonly root: Locator;
  readonly continueShoppingBtn: Locator;
  readonly viewCartLink: Locator;

  constructor(private readonly page: Page) {
    this.root                = page.locator('#cartModal');
    this.continueShoppingBtn = this.root.locator('button:has-text("Continue Shopping")');
    this.viewCartLink        = this.root.locator('a:has-text("View Cart")');
  }

  async waitForOpen(): Promise<void> {
    await this.root.waitFor({ state: 'visible' });
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingBtn.click();
    await this.root.waitFor({ state: 'hidden' });
  }

  async viewCart(): Promise<void> {
    await this.viewCartLink.click();
    await this.page.waitForURL('**/view_cart**');
  }
}
