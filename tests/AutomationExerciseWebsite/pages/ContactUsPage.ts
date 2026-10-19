import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ContactUsPage extends BasePage {
  readonly heading: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly subjectInput: Locator;
  readonly messageInput: Locator;
  readonly fileUpload: Locator;
  readonly submitBtn: Locator;
  readonly successAlert: Locator;
  readonly homeBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.heading      = page.locator('h2.title:has-text("Contact Us")');
    this.nameInput    = page.locator('input[data-qa="name"]');
    this.emailInput   = page.locator('input[data-qa="email"]');
    this.subjectInput = page.locator('input[data-qa="subject"]');
    this.messageInput = page.locator('textarea[data-qa="message"]');
    this.fileUpload   = page.locator('input[name="upload_file"]');
    this.submitBtn    = page.locator('input[data-qa="submit-button"]');
    this.successAlert = page.locator('.status.alert.alert-success');
    this.homeBtn      = page.locator('a.btn.btn-success:has-text("Home")');
  }

  async goto(): Promise<void> {
    await this.page.goto('/contact_us');
    await this.waitForPageLoad();
  }

  async fillForm(data: { name: string; email: string; subject: string; message: string }): Promise<void> {
    await this.nameInput.fill(data.name);
    await this.emailInput.fill(data.email);
    await this.subjectInput.fill(data.subject);
    await this.messageInput.fill(data.message);
  }

  async uploadFile(filePath: string): Promise<void> {
    await this.fileUpload.setInputFiles(filePath);
  }

  async submit(): Promise<void> {
    this.page.once('dialog', (dialog) => dialog.accept());
    await this.submitBtn.click();
  }

  async goHome(): Promise<void> {
    await this.homeBtn.click();
    await this.page.waitForURL('/');
  }
}
