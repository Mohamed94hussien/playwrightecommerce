import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CompletedOrderPage extends BasePage {
  readonly orderPlacedHeading: Locator;
  readonly downloadInvoiceBtn: Locator;
  readonly continueBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.orderPlacedHeading = page.locator('h2[data-qa="order-placed"]');
    this.downloadInvoiceBtn = page.locator('a.btn.btn-default.check_out');
    this.continueBtn        = page.locator('a[data-qa="continue-button"]');
  }

  async isOrderConfirmed(): Promise<boolean> {
    return this.orderPlacedHeading.isVisible();
  }

  async clickContinue(): Promise<void> {
    await this.continueBtn.click();
  }
}
