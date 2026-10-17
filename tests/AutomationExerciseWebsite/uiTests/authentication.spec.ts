// authentication.spec.ts  –  TC01–TC05: Register, Login, Logout, Duplicate email
import { test, expect } from '../fixtures/BaseFixture';
import { test as baseTest, Browser } from '@playwright/test';
import { generateUser } from '../utils/TestData/users';
import { DEFAULT_PAYMENT_CARD } from '../utils/TestData/paymentCard';

// ─── Shared helpers ──────────────────────────────────────────────────────────
import { Page } from '@playwright/test';
import { LoginPage }        from '../pages/LoginPage';
import { RegistrationPage } from '../pages/RegistrationPage';
import { HomePage }         from '../pages/HomePage';

async function registerAndLogin(page: Page, user: ReturnType<typeof generateUser>): Promise<void> {
  const loginPage    = new LoginPage(page);
  const regPage      = new RegistrationPage(page);
  await loginPage.goto();
  await loginPage.signup(user.name, user.email);
  await regPage.fillAccountInfo({ password: user.password, day: user.dob.day, month: user.dob.month, year: user.dob.year, newsletter: true, offers: true });
  await regPage.fillAddressInfo({ firstName: user.firstName, lastName: user.lastName, company: user.company, address1: user.address1, address2: user.address2, country: user.country, state: user.state, city: user.city, zipcode: user.zipcode, mobile: user.mobile });
  await regPage.createAccount();
  await regPage.clickContinue();
}

async function deleteAccount(page: Page): Promise<void> {
  const homePage = new HomePage(page);
  await homePage.navDeleteAccount.click();
  await page.waitForURL('**/delete_account**');
}
// ─────────────────────────────────────────────────────────────────────────────

test.describe('TC01 - Register User', () => {
  test('Should register a new user successfully', async ({
    page, homePage, loginPage, registrationPage,
  }) => {
    const user = generateUser('reg');

    await homePage.goto();
    await expect(page).toHaveTitle(/Automation Exercise/);

    await homePage.clickSignupLogin();
    await expect(loginPage.signupHeading).toBeVisible();

    await loginPage.signup(user.name, user.email);
    await expect(page).toHaveURL(/.*signup.*/);

    await registrationPage.fillAccountInfo({
      title: 'Mr', password: user.password,
      day: user.dob.day, month: user.dob.month, year: user.dob.year,
      newsletter: true, offers: true,
    });
    await registrationPage.fillAddressInfo({
      firstName: user.firstName, lastName: user.lastName, company: user.company,
      address1: user.address1, address2: user.address2, country: user.country,
      state: user.state, city: user.city, zipcode: user.zipcode, mobile: user.mobile,
    });

    await registrationPage.createAccount();
    await expect(registrationPage.accountCreatedMsg).toBeVisible();
    await registrationPage.clickContinue();

    await expect(homePage.loggedInUser).toBeVisible();
    await deleteAccount(page);
    await expect(page.locator('h2[data-qa="account-deleted"]')).toBeVisible();
  });
});

test.describe('TC02 - Login with correct credentials', () => {
  let email: string, password: string, name: string;

  baseTest.beforeAll(async ({ browser }: { browser: Browser }) => {
    const ctx  = await browser.newContext();
    const page = await ctx.newPage();
    const user = generateUser('login_tc02');
    ({ email, password, name } = user);
    await registerAndLogin(page, user);
    await page.close();
    await ctx.close();
  });

  test('Should login with valid email & password', async ({ page, homePage, loginPage }) => {
    await homePage.goto();
    await homePage.clickSignupLogin();
    await expect(loginPage.loginHeading).toBeVisible();

    await loginPage.login(email, password);
    await expect(homePage.loggedInUser).toBeVisible();

    const username = await homePage.getLoggedInUsername();
    expect(username).toContain(name);
    await deleteAccount(page);
  });
});

test.describe('TC03 - Login with incorrect credentials', () => {
  test('Should show error for invalid login', async ({ homePage, loginPage }) => {
    await homePage.goto();
    await homePage.clickSignupLogin();
    await loginPage.login('invalid_nobody@wrong.com', 'WrongPassword999');
    await expect(loginPage.loginError).toBeVisible();
  });
});

test.describe('TC04 - Logout User', () => {
  let email: string, password: string;

  baseTest.beforeAll(async ({ browser }: { browser: Browser }) => {
    const ctx  = await browser.newContext();
    const page = await ctx.newPage();
    const user = generateUser('logout_tc04');
    ({ email, password } = user);
    await registerAndLogin(page, user);
    const hp = new HomePage(page);
    await hp.logout();
    await page.close();
    await ctx.close();
  });

  test('Should logout successfully and redirect to login page', async ({ page, homePage, loginPage }) => {
    await homePage.goto();
    await homePage.clickSignupLogin();
    await loginPage.login(email, password);
    await expect(homePage.loggedInUser).toBeVisible();

    await homePage.logout();
    await expect(page).toHaveURL(/.*login.*/);

    await loginPage.login(email, password);
    await deleteAccount(page);
  });
});

test.describe('TC05 - Register with existing email', () => {
  let email: string, password: string, name: string;

  baseTest.beforeAll(async ({ browser }: { browser: Browser }) => {
    const ctx  = await browser.newContext();
    const page = await ctx.newPage();
    const user = generateUser('existing_tc05');
    ({ email, password, name } = user);
    await registerAndLogin(page, user);
    const hp = new HomePage(page);
    await hp.logout();
    await page.close();
    await ctx.close();
  });

  test('Should show error when registering with existing email', async ({ page, homePage, loginPage }) => {
    await homePage.goto();
    await homePage.clickSignupLogin();
    await loginPage.signup(name, email);
    await expect(loginPage.signupError).toBeVisible();

    await loginPage.goto();
    await loginPage.login(email, password);
    await deleteAccount(page);
  });
});
