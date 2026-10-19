import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly cartTable: Locator;
  readonly cartProductNames: Locator;
  readonly cartQtys: Locator;
  readonly cartTotals: Locator;
  readonly deleteItemBtns: Locator;
  readonly emptyCartMsg: Locator;
  readonly proceedCheckoutBtn: Locator;
  readonly checkoutModal: Locator;
  readonly checkoutModalLoginLink: Locator;

  constructor(page: Page) {
    super(page);
    this.cartTable              = page.locator('#cart_info_table');
    this.cartProductNames       = page.locator('.cart_description h4 a');
    this.cartQtys               = page.locator('.cart_quantity button');
    this.cartTotals             = page.locator('.cart_total p');
    this.deleteItemBtns         = page.locator('a.cart_quantity_delete');
    this.emptyCartMsg           = page.locator('#empty_cart');
    this.proceedCheckoutBtn     = page.locator('a.btn.btn-default.check_out');
    this.checkoutModal          = page.locator('#checkoutModal');
    this.checkoutModalLoginLink = page.locator('#checkoutModal a[href="/login"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/view_cart');
    await this.waitForPageLoad();
  }

  async getCartItemNames(): Promise<string[]> {
    return this.cartProductNames.allInnerTexts();
  }

  /** Removes one row and waits for the AJAX delete to take it out of the table. */
  async removeItem(index: number = 0): Promise<void> {
    const before = await this.deleteItemBtns.count();
    await this.deleteItemBtns.nth(index).click();
    await expect(this.deleteItemBtns).toHaveCount(before - 1);
  }

  async removeAllItems(): Promise<void> {
    while ((await this.deleteItemBtns.count()) > 0) {
      await this.removeItem(0);
    }
  }

  /** Proceeds to /checkout. Only valid for a logged-in user; guests get the login modal instead. */
  async proceedToCheckout(): Promise<void> {
    await this.proceedCheckoutBtn.click();
    await this.page.waitForURL('**/checkout**');
  }

  /** As a guest: clicks Proceed To Checkout, waits for the login modal and follows it to /login. */
  async proceedToCheckoutAsGuest(): Promise<void> {
    await this.proceedCheckoutBtn.click();
    await this.checkoutModal.waitFor({ state: 'visible' });
    await this.checkoutModalLoginLink.click();
    await this.page.waitForURL('**/login**');
  }
}
