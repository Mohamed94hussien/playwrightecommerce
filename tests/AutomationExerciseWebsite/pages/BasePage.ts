import { Locator, Page } from '@playwright/test';

export class BasePage {
  // Footer subscription block — present on every page
  readonly subscriptionHeading: Locator;
  readonly subscriptionEmail: Locator;
  readonly subscriptionBtn: Locator;
  readonly subscriptionSuccess: Locator;

  constructor(protected readonly page: Page) {
    this.subscriptionHeading = page.locator('footer h2:has-text("Subscription")');
    this.subscriptionEmail   = page.locator('#susbscribe_email');
    this.subscriptionBtn     = page.locator('#subscribe');
    this.subscriptionSuccess = page.locator('#success-subscribe .alert-success');
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  async getScrollY(): Promise<number> {
    return this.page.evaluate(() => window.scrollY);
  }

  async subscribeWithEmail(email: string): Promise<void> {
    await this.subscriptionEmail.fill(email);
    await this.subscriptionBtn.click();
  }
}
