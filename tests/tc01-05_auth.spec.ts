// TC01–TC05: Registration, Login, Logout, Duplicate email
import { test, expect, Browser } from '@playwright/test';
import { HomePage }     from '../pages/HomePage';
import { LoginPage }    from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { generateUser } from '../utils/testData';
import { registerNewUser, deleteAccount } from '../utils/helpers';

test.describe('TC01 - Register User', () => {
  test('Should register a new user successfully', async ({ page }) => {
    const user         = generateUser('reg');
    const homePage     = new HomePage(page);
    const loginPage    = new LoginPage(page);
    const registerPage = new RegisterPage(page);

    await homePage.goto();
    await expect(page).toHaveTitle(/Automation Exercise/);

    await homePage.clickSignupLogin();
    await expect(loginPage.signupHeading).toBeVisible();

    await loginPage.signup(user.name, user.email);
    await expect(page).toHaveURL(/.*signup.*/);

    await registerPage.fillAccountInfo({
      title:      'Mr',
      password:   user.password,
      day:        user.dob.day,
      month:      user.dob.month,
      year:       user.dob.year,
      newsletter: true,
      offers:     true,
    });
    await registerPage.fillAddressInfo({
      firstName: user.firstName,
      lastName:  user.lastName,
      company:   user.company,
      address1:  user.address1,
      address2:  user.address2,
      country:   user.country,
      state:     user.state,
      city:      user.city,
      zipcode:   user.zipcode,
      mobile:    user.mobile,
    });

    await registerPage.createAccount();
    await expect(registerPage.accountCreatedMsg).toBeVisible();
    await registerPage.clickContinue();

    await expect(homePage.loggedInUser).toBeVisible();
    await deleteAccount(page);
    await expect(page.locator('h2[data-qa="account-deleted"]')).toBeVisible();
  });
});

test.describe('TC02 - Login with correct credentials', () => {
  let email: string;
  let password: string;
  let name: string;

  test.beforeAll(async ({ browser }: { browser: Browser }) => {
    const ctx  = await browser.newContext();
    const page = await ctx.newPage();
    const user = generateUser('login_tc02');
    ({ email, password, name } = user);
    await registerNewUser(page, user);
    await page.close();
    await ctx.close();
  });

  test('Should login with valid email & password', async ({ page }) => {
    const homePage  = new HomePage(page);
    const loginPage = new LoginPage(page);

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
  test('Should show error for invalid login', async ({ page }) => {
    const homePage  = new HomePage(page);
    const loginPage = new LoginPage(page);

    await homePage.goto();
    await homePage.clickSignupLogin();
    await loginPage.login('invalid_nobody@wrong.com', 'WrongPassword999');

    await expect(loginPage.loginError).toBeVisible();
  });
});

test.describe('TC04 - Logout User', () => {
  let email: string;
  let password: string;

  test.beforeAll(async ({ browser }: { browser: Browser }) => {
    const ctx  = await browser.newContext();
    const page = await ctx.newPage();
    const user = generateUser('logout_tc04');
    ({ email, password } = user);
    await registerNewUser(page, user);
    const homePage = new HomePage(page);
    await homePage.logout();
    await page.close();
    await ctx.close();
  });

  test('Should logout successfully and redirect to login page', async ({ page }) => {
    const homePage  = new HomePage(page);
    const loginPage = new LoginPage(page);

    await homePage.goto();
    await homePage.clickSignupLogin();
    await loginPage.login(email, password);
    await expect(homePage.loggedInUser).toBeVisible();

    await homePage.logout();
    await expect(page).toHaveURL(/.*login.*/);

    // Cleanup: log back in and delete
    await loginPage.login(email, password);
    await deleteAccount(page);
  });
});

test.describe('TC05 - Register with existing email', () => {
  let email: string;
  let password: string;
  let name: string;

  test.beforeAll(async ({ browser }: { browser: Browser }) => {
    const ctx  = await browser.newContext();
    const page = await ctx.newPage();
    const user = generateUser('existing_tc05');
    ({ email, password, name } = user);
    await registerNewUser(page, user);
    const homePage = new HomePage(page);
    await homePage.logout();
    await page.close();
    await ctx.close();
  });

  test('Should show error when registering with existing email', async ({ page }) => {
    const homePage  = new HomePage(page);
    const loginPage = new LoginPage(page);

    await homePage.goto();
    await homePage.clickSignupLogin();
    await loginPage.signup(name, email);

    await expect(loginPage.signupError).toBeVisible();

    // Cleanup
    await loginPage.goto();
    await loginPage.login(email, password);
    await deleteAccount(page);
  });
});
