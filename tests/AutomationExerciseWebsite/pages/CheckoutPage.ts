import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  readonly deliveryAddress: Locator;
  readonly billingAddress: Locator;
  readonly orderProductNames: Locator;
  readonly commentTextarea: Locator;
  readonly placeOrderBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.deliveryAddress   = page.locator('#address_delivery');
    this.billingAddress    = page.locator('#address_invoice');
    this.orderProductNames = page.locator('.cart_description h4 a');
    this.commentTextarea   = page.locator('textarea.form-control');
    this.placeOrderBtn     = page.locator('a.btn.btn-default.check_out');
  }

  async goto(): Promise<void> {
    await this.page.goto('/checkout');
    await this.waitForPageLoad();
  }

  async addComment(comment: string): Promise<void> {
    await this.commentTextarea.fill(comment);
  }

  async placeOrder(): Promise<void> {
    await this.placeOrderBtn.click();
    await this.page.waitForURL('**/payment**');
  }
}
