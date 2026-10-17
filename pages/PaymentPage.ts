import { Download, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export interface PaymentDetails {
  name: string;
  cardNumber: string;
  cvc: string;
  expiryMonth: string;
  expiryYear: string;
}

export class PaymentPage extends BasePage {
  readonly nameOnCard: Locator;
  readonly cardNumber: Locator;
  readonly cvc: Locator;
  readonly expiryMonth: Locator;
  readonly expiryYear: Locator;
  readonly payAndConfirmBtn: Locator;
  readonly orderPlacedHeading: Locator;
  readonly downloadInvoiceBtn: Locator;
  readonly continueBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.nameOnCard        = page.locator('input[data-qa="name-on-card"]');
    this.cardNumber        = page.locator('input[data-qa="card-number"]');
    this.cvc               = page.locator('input[data-qa="cvc"]');
    this.expiryMonth       = page.locator('input[data-qa="expiry-month"]');
    this.expiryYear        = page.locator('input[data-qa="expiry-year"]');
    this.payAndConfirmBtn  = page.locator('button[data-qa="pay-button"]');
    this.orderPlacedHeading = page.locator('h2[data-qa="order-placed"]');
    this.downloadInvoiceBtn = page.locator('a.btn.btn-default.check_out');
    this.continueBtn        = page.locator('a[data-qa="continue-button"]');
  }

  async fillPaymentDetails(details: PaymentDetails): Promise<void> {
    await this.nameOnCard.fill(details.name);
    await this.cardNumber.fill(details.cardNumber);
    await this.cvc.fill(details.cvc);
    await this.expiryMonth.fill(details.expiryMonth);
    await this.expiryYear.fill(details.expiryYear);
  }

  async payAndConfirm(): Promise<void> {
    await this.payAndConfirmBtn.click();
    await this.page.waitForURL('**/payment_done/**');
  }

  async isOrderPlaced(): Promise<boolean> {
    return this.orderPlacedHeading.isVisible();
  }

  async downloadInvoice(): Promise<Download> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.downloadInvoiceBtn.click(),
    ]);
    return download;
  }

  async clickContinue(): Promise<void> {
    await this.continueBtn.click();
  }
}
