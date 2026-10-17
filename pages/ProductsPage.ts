import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductsPage extends BasePage {
  readonly productCards: Locator;
  readonly searchInput: Locator;
  readonly searchBtn: Locator;
  readonly searchedProducts: Locator;
  readonly searchHeading: Locator;
  readonly viewProductBtns: Locator;
  readonly addToCartBtns: Locator;
  readonly brandLinks: Locator;
  readonly addedToCartModal: Locator;
  readonly modalContinue: Locator;
  readonly modalViewCart: Locator;

  constructor(page: Page) {
    super(page);
    this.productCards      = page.locator('.product-image-wrapper');
    this.searchInput       = page.locator('input#search_product');
    this.searchBtn         = page.locator('button#submit_search');
    // FIX TC09: after search, results appear in .features_items not a dedicated #searched-products wrapper
    this.searchedProducts  = page.locator('.features_items .product-image-wrapper');
    this.searchHeading     = page.locator('h2.title:has-text("Searched Products")');
    this.viewProductBtns   = page.locator('a[href*="/product_details/"]');
    this.addToCartBtns     = page.locator('.product-overlay a[title="Add to Cart"]');
    this.brandLinks        = page.locator('.brands-name ul li a');
    this.addedToCartModal  = page.locator('#cartModal');
    this.modalContinue     = page.locator('.modal-footer button:has-text("Continue Shopping")');
    this.modalViewCart     = page.locator('#cartModal a:has-text("View Cart")');
  }

  async goto(): Promise<void> {
    await this.page.goto('/products');
    await this.waitForPageLoad();
  }

  async searchProduct(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchBtn.click();
    await this.searchHeading.waitFor({ state: 'visible', timeout: 10_000 });
  }

  async getProductCount(): Promise<number> {
    return this.productCards.count();
  }

  async viewProduct(index: number = 0): Promise<void> {
    await this.viewProductBtns.nth(index).click();
    await this.page.waitForURL('**/product_details/**');
  }

  async hoverAndAddToCart(index: number = 0): Promise<void> {
    await this.productCards.nth(index).hover();
    await this.addToCartBtns.nth(index).click();
    await this.addedToCartModal.waitFor({ state: 'visible' });
  }

  async continueShopping(): Promise<void> {
    await this.modalContinue.click();
    await this.addedToCartModal.waitFor({ state: 'hidden' });
  }

  async viewCartFromModal(): Promise<void> {
    await this.modalViewCart.click();
    await this.page.waitForURL('**/view_cart**');
  }
}
