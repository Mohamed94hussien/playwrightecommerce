import { Page } from '@playwright/test';
import { LoginPage }    from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { HomePage }     from '../pages/HomePage';
import { UserData }     from './testData';

/** Full registration flow starting from /login */
export async function registerNewUser(page: Page, user: UserData): Promise<void> {
  const loginPage    = new LoginPage(page);
  const registerPage = new RegisterPage(page);

  await loginPage.goto();
  await loginPage.signup(user.name, user.email);

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
  await registerPage.clickContinue();
}

/** Login an existing user */
export async function loginUser(page: Page, email: string, password: string): Promise<void> {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(email, password);
}

/** Delete the currently logged-in account */
export async function deleteAccount(page: Page): Promise<void> {
  const homePage = new HomePage(page);
  await homePage.navDeleteAccount.click();
  await page.waitForURL('**/delete_account**');
}
