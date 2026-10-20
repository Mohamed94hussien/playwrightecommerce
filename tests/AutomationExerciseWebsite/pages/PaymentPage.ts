import { Locator, Page } from '@playwright/test';
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

  /**
   * Fetches the invoice behind the "Download Invoice" button using the page's session cookies.
   * Browser download events aren't portable: WebKit on Linux renders the text/plain invoice
   * inline instead of downloading it, so the test checks the server response directly.
   */
  async fetchInvoice(): Promise<{ filename: string | undefined; body: string }> {
    const href = await this.downloadInvoiceBtn.getAttribute('href');
    if (!href) throw new Error('Download Invoice button has no href');
    const response = await this.page.request.get(href);
    if (!response.ok()) throw new Error(`Invoice request failed: ${response.status()}`);
    const disposition = response.headers()['content-disposition'] ?? '';
    return {
      filename: /attachment;\s*filename="?([^";]+)"?/i.exec(disposition)?.[1],
      body:     await response.text(),
    };
  }

  async clickContinue(): Promise<void> {
    await this.continueBtn.click();
  }
}
