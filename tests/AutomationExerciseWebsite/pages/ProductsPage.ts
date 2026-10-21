import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CartModal } from './components/CartModal';

export class ProductsPage extends BasePage {
  readonly productCards: Locator;
  readonly productNames: Locator;
  readonly searchInput: Locator;
  readonly searchBtn: Locator;
  readonly searchedProducts: Locator;
  readonly searchHeading: Locator;
  readonly viewProductBtns: Locator;
  readonly addToCartBtns: Locator;
  readonly brandLinks: Locator;
  readonly cartModal: CartModal;

  constructor(page: Page) {
    super(page);
    this.productCards     = page.locator('.features_items .product-image-wrapper');
    this.searchInput      = page.locator('input#search_product');
    this.searchBtn        = page.locator('button#submit_search');
    this.productNames     = page.locator('.features_items .productinfo p');
    this.searchedProducts = page.locator('.features_items .product-image-wrapper');
    this.searchHeading    = page.locator('h2.title:has-text("Searched Products")');
    this.viewProductBtns  = page.locator('a[href*="/product_details/"]');
    this.addToCartBtns    = page.locator('.features_items .productinfo a.add-to-cart');
    this.brandLinks       = page.locator('.brands-name ul li a');
    this.cartModal        = new CartModal(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/products');
    await this.waitForPageLoad();
  }

  async searchProduct(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchBtn.click();
    // The heading renders before cart.js (end of <body>) binds the "Add to cart" handlers,
    // so wait for DOMContentLoaded or an immediate add-to-cart click is silently ignored.
    await this.page.waitForURL(/\/products\?search=/, { waitUntil: 'domcontentloaded' });
    await this.searchHeading.waitFor({ state: 'visible', timeout: 10_000 });
  }

  async viewProduct(index: number = 0): Promise<void> {
    await this.viewProductBtns.nth(index).click();
    await this.page.waitForURL('**/product_details/**');
  }

  /** Clicks the card's own "Add to cart" button, which is always visible (no hover over the overlay needed). */
  async addToCart(index: number = 0): Promise<void> {
    await this.addToCartBtns.nth(index).click();
    await this.cartModal.waitForOpen();
  }

  async continueShopping(): Promise<void> {
    await this.cartModal.continueShopping();
  }

  async viewCartFromModal(): Promise<void> {
    await this.cartModal.viewCart();
  }

  /** Adds the first product on /products to the cart and lands on /view_cart. */
  async addFirstProductAndViewCart(): Promise<void> {
    await this.goto();
    await this.addToCart(0);
    await this.viewCartFromModal();
  }
}
