import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly cartTable: Locator;
  readonly cartProductNames: Locator;
  readonly cartQtys: Locator;
  readonly cartTotals: Locator;
  readonly deleteItemBtns: Locator;
  readonly emptyCartMsg: Locator;
  readonly proceedCheckout: Locator;
  readonly checkoutModal: Locator;
  readonly checkoutModalLoginLink: Locator;

  constructor(page: Page) {
    super(page);
    this.cartTable              = page.locator('#cart_info_table');
    this.cartProductNames       = page.locator('.cart_description h4 a');
    this.cartQtys               = page.locator('.cart_quantity button');
    this.cartTotals             = page.locator('.cart_total p');
    this.deleteItemBtns         = page.locator('a.cart_quantity_delete');
    this.emptyCartMsg           = page.locator('p:has-text("Cart is empty!")');
    this.proceedCheckout        = page.locator('a.btn.btn-default.check_out');
    this.checkoutModal          = page.locator('#checkoutModal');
    this.checkoutModalLoginLink = page.locator('#checkoutModal a[href="/login"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/view_cart');
    await this.waitForPageLoad();
  }

  async getCartItemCount(): Promise<number> {
    return this.cartProductNames.count();
  }

  async getCartItemNames(): Promise<string[]> {
    return this.cartProductNames.allInnerTexts();
  }

  async removeItem(index: number = 0): Promise<void> {
    await this.deleteItemBtns.nth(index).click();
    await this.page.waitForTimeout(800);
  }

  async removeAllItems(): Promise<void> {
    const count = await this.deleteItemBtns.count();
    for (let i = count - 1; i >= 0; i--) {
      await this.deleteItemBtns.nth(i).click();
      await this.page.waitForTimeout(500);
    }
  }

  async isCartEmpty(): Promise<boolean> {
    return this.emptyCartMsg.isVisible();
  }

  async proceedToCheckout(): Promise<void> {
    await this.proceedCheckout.click();
  }

  async handleCheckoutLoginModal(): Promise<void> {
    if (await this.checkoutModal.isVisible()) {
      await this.checkoutModalLoginLink.click();
      await this.page.waitForURL('**/login**');
    }
  }
}
