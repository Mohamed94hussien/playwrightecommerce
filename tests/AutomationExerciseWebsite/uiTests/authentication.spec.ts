// authentication.spec.ts  –  TC01–TC05: Register, Login, Logout, Duplicate email
import { test, expect } from '../fixtures/BaseFixture';

test.describe('TC01 - Register User', () => {
  test('Should register a new user successfully', async ({
    page, homePage, loginPage, registrationPage, newUser,
  }) => {
    await homePage.goto();
    await expect(page).toHaveTitle(/Automation Exercise/);

    await homePage.clickSignupLogin();
    await expect(loginPage.signupHeading).toBeVisible();

    await loginPage.signup(newUser.name, newUser.email);
    await registrationPage.register(newUser);
    await expect(registrationPage.accountCreatedMsg).toBeVisible();
    await registrationPage.clickContinue();

    await expect(homePage.loggedInUser).toBeVisible();
    await homePage.deleteAccount();
    await expect(homePage.accountDeletedHeading).toBeVisible();
  });
});

test.describe('TC02 - Login with correct credentials', () => {
  test('Should login with valid email & password', async ({ homePage, loginPage, registeredUser }) => {
    await homePage.goto();
    await homePage.clickSignupLogin();
    await expect(loginPage.loginHeading).toBeVisible();

    await loginPage.login(registeredUser.email, registeredUser.password);
    await expect(homePage.loggedInUser).toContainText(registeredUser.name);

    await homePage.deleteAccount();
    await expect(homePage.accountDeletedHeading).toBeVisible();
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
  test('Should logout successfully and redirect to login page', async ({ page, homePage, loginPage, registeredUser }) => {
    await homePage.goto();
    await homePage.clickSignupLogin();
    await loginPage.login(registeredUser.email, registeredUser.password);
    await expect(homePage.loggedInUser).toBeVisible();

    await homePage.logout();
    await expect(page).toHaveURL(/\/login/);
    await expect(homePage.loggedInUser).toBeHidden();
  });
});

test.describe('TC05 - Register with existing email', () => {
  test('Should show error when registering with existing email', async ({ homePage, loginPage, registeredUser }) => {
    await homePage.goto();
    await homePage.clickSignupLogin();
    await loginPage.signup(registeredUser.name, registeredUser.email);
    await expect(loginPage.signupError).toBeVisible();
  });
});
