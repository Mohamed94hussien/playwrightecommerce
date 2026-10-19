import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly loginEmail: Locator;
  readonly loginPassword: Locator;
  readonly loginBtn: Locator;
  readonly loginError: Locator;
  readonly signupName: Locator;
  readonly signupEmail: Locator;
  readonly signupBtn: Locator;
  readonly signupError: Locator;
  readonly loginHeading: Locator;
  readonly signupHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.loginEmail    = page.locator('input[data-qa="login-email"]');
    this.loginPassword = page.locator('input[data-qa="login-password"]');
    this.loginBtn      = page.locator('button[data-qa="login-button"]');
    this.loginError    = page.locator('p:has-text("Your email or password is incorrect!")');
    this.signupName    = page.locator('input[data-qa="signup-name"]');
    this.signupEmail   = page.locator('input[data-qa="signup-email"]');
    this.signupBtn     = page.locator('button[data-qa="signup-button"]');
    this.signupError   = page.locator('p:has-text("Email Address already exist!")');
    this.loginHeading  = page.locator('h2:has-text("Login to your account")');
    this.signupHeading = page.locator('h2:has-text("New User Signup!")');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
    await this.waitForPageLoad();
  }

  async login(email: string, password: string): Promise<void> {
    await this.loginEmail.fill(email);
    await this.loginPassword.fill(password);
    await this.loginBtn.click();
  }

  async signup(name: string, email: string): Promise<void> {
    await this.signupName.fill(name);
    await this.signupEmail.fill(email);
    await this.signupBtn.click();
    await this.page.waitForURL('**/signup**');
  }
}
