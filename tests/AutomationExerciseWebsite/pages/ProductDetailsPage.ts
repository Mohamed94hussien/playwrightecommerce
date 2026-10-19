import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CartModal } from './components/CartModal';

export class ProductDetailsPage extends BasePage {
  readonly productName: Locator;
  readonly productCategory: Locator;
  readonly productPrice: Locator;
  readonly productBrand: Locator;
  readonly quantityInput: Locator;
  readonly addToCartBtn: Locator;
  readonly cartModal: CartModal;
  readonly reviewName: Locator;
  readonly reviewEmail: Locator;
  readonly reviewText: Locator;
  readonly reviewSubmitBtn: Locator;
  readonly reviewSuccess: Locator;
  readonly reviewLink: Locator;

  constructor(page: Page) {
    super(page);
    this.productName      = page.locator('.product-information h2');
    this.productCategory  = page.locator('.product-information p').filter({ hasText: 'Category:' });
    this.productPrice     = page.locator('.product-information span span');
    this.productBrand     = page.locator('.product-information p').filter({ hasText: 'Brand:' });
    this.quantityInput    = page.locator('input#quantity');
    this.addToCartBtn     = page.locator('button.cart');
    this.cartModal        = new CartModal(page);
    this.reviewName       = page.locator('input#name');
    this.reviewEmail      = page.locator('input#email');
    this.reviewText       = page.locator('textarea#review');
    this.reviewSubmitBtn  = page.locator('button#button-review');
    this.reviewSuccess    = page.locator('#review-section .alert-success');
    this.reviewLink       = page.locator('a[href="#reviews"]:has-text("Write Your Review")');
  }

  async goto(productId: number | string): Promise<void> {
    await this.page.goto('/product_details/' + productId);
    await this.waitForPageLoad();
  }

  async getProductName(): Promise<string> {
    return this.productName.innerText();
  }

  async setQuantity(qty: number): Promise<void> {
    await this.quantityInput.clear();
    await this.quantityInput.fill(String(qty));
  }

  async addToCart(): Promise<void> {
    await this.addToCartBtn.click();
    await this.cartModal.waitForOpen();
  }

  async continueShopping(): Promise<void> {
    await this.cartModal.continueShopping();
  }

  async viewCart(): Promise<void> {
    await this.cartModal.viewCart();
  }

  async submitReview(name: string, email: string, review: string): Promise<void> {
    await this.reviewName.fill(name);
    await this.reviewEmail.fill(email);
    await this.reviewText.fill(review);
    await this.reviewSubmitBtn.click();
  }
}
