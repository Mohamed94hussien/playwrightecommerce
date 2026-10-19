import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CartModal } from './components/CartModal';

export class HomePage extends BasePage {
  readonly navHome: Locator;
  readonly navProducts: Locator;
  readonly navCart: Locator;
  readonly navSignupLogin: Locator;
  readonly navLogout: Locator;
  readonly navDeleteAccount: Locator;
  readonly navContactUs: Locator;
  readonly navTestCases: Locator;
  readonly loggedInUser: Locator;
  readonly accountDeletedHeading: Locator;
  readonly scrollUpBtn: Locator;
  readonly slider: Locator;
  readonly womenCategory: Locator;
  readonly menCategory: Locator;
  readonly recommendedSection: Locator;
  readonly recommendedAddToCartBtns: Locator;
  readonly cartModal: CartModal;

  constructor(page: Page) {
    super(page);
    this.navHome          = page.locator('a[href="/"]').first();
    this.navProducts      = page.locator('a[href="/products"]').first();
    this.navCart          = page.locator('a[href="/view_cart"]').first();
    this.navSignupLogin   = page.locator('a[href="/login"]').first();
    this.navLogout        = page.locator('a[href="/logout"]').first();
    this.navDeleteAccount = page.locator('a[href="/delete_account"]').first();
    this.navContactUs     = page.locator('a[href="/contact_us"]').first();
    this.navTestCases     = page.locator('header a[href="/test_cases"]').first();
    this.loggedInUser     = page.locator('a:has-text("Logged in as")');
    this.accountDeletedHeading = page.locator('h2[data-qa="account-deleted"]');
    this.scrollUpBtn        = page.locator('#scrollUp');
    this.slider             = page.locator('#slider-carousel');
    this.womenCategory      = page.locator('a[href="#Women"]');
    this.menCategory        = page.locator('a[href="#Men"]');
    this.recommendedSection = page.locator('#recommended-item-carousel');
    this.recommendedAddToCartBtns = this.recommendedSection.locator('.item.active .add-to-cart');
    this.cartModal          = new CartModal(page);
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

  /** Opens a sidebar category (e.g. Women) and then one of its sub-category links. */
  async openCategory(category: Locator, subCategoryUrl: string): Promise<void> {
    await category.click();
    await this.page.locator(`a[href="${subCategoryUrl}"]`).click();
    await this.page.waitForURL(`**${subCategoryUrl}`);
  }

  async addFirstRecommendedToCart(): Promise<void> {
    await this.recommendedSection.scrollIntoViewIfNeeded();
    await this.recommendedAddToCartBtns.first().click();
    await this.cartModal.waitForOpen();
  }

  async getLoggedInUsername(): Promise<string> {
    const text = await this.loggedInUser.innerText();
    return text.replace('Logged in as', '').trim();
  }

  async logout(): Promise<void> {
    await this.navLogout.click();
  }

  /** Deletes the logged-in account through the UI. The header is present on every page. */
  async deleteAccount(): Promise<void> {
    await this.navDeleteAccount.click();
    await this.page.waitForURL('**/delete_account**');
  }
}
