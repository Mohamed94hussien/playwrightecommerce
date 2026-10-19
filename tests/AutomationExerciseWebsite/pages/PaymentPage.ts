import { Download, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { PaymentCard } from '../utils/TestData/paymentCard';

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
    this.nameOnCard         = page.locator('input[data-qa="name-on-card"]');
    this.cardNumber         = page.locator('input[data-qa="card-number"]');
    this.cvc                = page.locator('input[data-qa="cvc"]');
    this.expiryMonth        = page.locator('input[data-qa="expiry-month"]');
    this.expiryYear         = page.locator('input[data-qa="expiry-year"]');
    this.payAndConfirmBtn   = page.locator('button[data-qa="pay-button"]');
    this.orderPlacedHeading = page.locator('h2[data-qa="order-placed"]');
    this.downloadInvoiceBtn = page.locator('a.btn.btn-default.check_out');
    this.continueBtn        = page.locator('a[data-qa="continue-button"]');
  }

  async fillPaymentDetails(card: PaymentCard): Promise<void> {
    await this.nameOnCard.fill(card.nameOnCard);
    await this.cardNumber.fill(card.cardNumber);
    await this.cvc.fill(card.cvc);
    await this.expiryMonth.fill(card.expiryMonth);
    await this.expiryYear.fill(card.expiryYear);
  }

  async payAndConfirm(): Promise<void> {
    await this.payAndConfirmBtn.click();
    await this.page.waitForURL('**/payment_done/**');
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
