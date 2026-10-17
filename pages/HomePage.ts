import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  // Navigation
  readonly navHome: Locator;
  readonly navProducts: Locator;
  readonly navCart: Locator;
  readonly navSignupLogin: Locator;
  readonly navLogout: Locator;
  readonly navDeleteAccount: Locator;
  readonly navContactUs: Locator;
  readonly navTestCases: Locator;

  // User state
  readonly loggedInUser: Locator;

  // Subscription
  readonly subscriptionEmail: Locator;
  readonly subscriptionBtn: Locator;
  readonly subscriptionSuccess: Locator;

  // Scroll up button
  readonly scrollUpBtn: Locator;

  // Category sidebar
  readonly womenCategory: Locator;
  readonly menCategory: Locator;

  // Recommended items
  readonly recommendedSection: Locator;

  constructor(page: Page) {
    super(page);
    this.navHome          = page.locator('a[href="/"]').first();
    this.navProducts      = page.locator('a[href="/products"]').first();
    this.navCart          = page.locator('a[href="/view_cart"]').first();
    this.navSignupLogin   = page.locator('a[href="/login"]').first();
    this.navLogout        = page.locator('a[href="/logout"]').first();
    this.navDeleteAccount = page.locator('a[href="/delete_account"]').first();
    this.navContactUs     = page.locator('a[href="/contact_us"]').first();
    // FIX TC07: site has multiple links to /test_cases; target the navbar one only
    this.navTestCases     = page.locator('header a[href="/test_cases"]').first();

    this.loggedInUser       = page.locator('a:has-text("Logged in as")');
    this.subscriptionEmail  = page.locator('#susbscribe_email');
    this.subscriptionBtn    = page.locator('#subscribe');
    this.subscriptionSuccess = page.locator('.alert-success');
    this.scrollUpBtn        = page.locator('#scrollUp');
    this.womenCategory      = page.locator('a[href="#Women"]');
    this.menCategory        = page.locator('a[href="#Men"]');
    this.recommendedSection = page.locator('#recommended-item-carousel');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.waitForPageLoad();
  }

  async clickProducts(): Promise<void> {
    await this.navProducts.click();
    await this.page.waitForURL('**/products**');
  }

  async clickCart(): Promise<void> {
    await this.navCart.click();
    await this.page.waitForURL('**/view_cart**');
  }

  async clickSignupLogin(): Promise<void> {
    await this.navSignupLogin.click();
    await this.page.waitForURL('**/login**');
  }

  async clickContactUs(): Promise<void> {
    await this.navContactUs.click();
    await this.page.waitForURL('**/contact_us**');
  }

  async clickTestCases(): Promise<void> {
    await this.navTestCases.click();
    await this.page.waitForURL('**/test_cases**');
  }

  async subscribeWithEmail(email: string): Promise<void> {
    await this.subscriptionEmail.fill(email);
    await this.subscriptionBtn.click();
  }

  async isLoggedIn(): Promise<boolean> {
    return this.loggedInUser.isVisible();
  }

  async getLoggedInUsername(): Promise<string> {
    const text = await this.loggedInUser.innerText();
    return text.replace('Logged in as', '').trim();
  }

  async logout(): Promise<void> {
    await this.navLogout.click();
  }

  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }
}
