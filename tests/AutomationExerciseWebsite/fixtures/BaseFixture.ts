import { test as base } from '@playwright/test';
import { HomePage }             from '../pages/HomePage';
import { LoginPage }            from '../pages/LoginPage';
import { RegistrationPage }     from '../pages/RegistrationPage';
import { ProductsPage }         from '../pages/ProductsPage';
import { ProductDetailsPage }   from '../pages/ProductDetailsPage';
import { CategoryProductsPage } from '../pages/CategoryProductsPage';
import { BrandProductsPage }    from '../pages/BrandProductsPage';
import { ContactUsPage }        from '../pages/ContactUsPage';
import { CartPage }             from '../pages/CartPage';
import { CheckoutPage }         from '../pages/CheckoutPage';
import { PaymentPage }          from '../pages/PaymentPage';
import { generateUser, UserData } from '../utils/TestData/users';
import { createAccountViaApi, deleteAccountViaApi } from '../utils/Api/accountApi';

const AD_HOSTS = /^https?:\/\/([^/]+\.)?(googlesyndication\.com|doubleclick\.net|googleadservices\.com|adservice\.google\.com|google-analytics\.com|googletagmanager\.com|fundingchoicesmessages\.google\.com)\//;

type PageFixtures = {
  homePage:             HomePage;
  loginPage:            LoginPage;
  registrationPage:     RegistrationPage;
  productsPage:         ProductsPage;
  productDetailsPage:   ProductDetailsPage;
  categoryProductsPage: CategoryProductsPage;
  brandProductsPage:    BrandProductsPage;
  contactUsPage:        ContactUsPage;
  cartPage:             CartPage;
  checkoutPage:         CheckoutPage;
  paymentPage:          PaymentPage;
};

type AccountFixtures = {
  /** Fresh, not-yet-registered user data. Deleted via the API after the test if the test registered it. */
  newUser:        UserData;
  /** A user already registered via the API before the test. Deleted via the API after the test. */
  registeredUser: UserData;
};

/**
 * Extended Playwright test fixture that pre-instantiates all page objects
 * and manages test accounts so they are cleaned up even when a test fails.
 * Import `test` from this file instead of @playwright/test in spec files.
 */
export const test = base.extend<PageFixtures & AccountFixtures>({
  // The site serves Google ads, including full-screen vignettes that cover the page and hijack
  // navigation. Block them for every page in the context so they can't intercept clicks.
  context: async ({ context }, use) => {
    await context.route(AD_HOSTS, (route) => route.abort());
    await use(context);
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registrationPage: async ({ page }, use) => {
    await use(new RegistrationPage(page));
  },
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
  productDetailsPage: async ({ page }, use) => {
    await use(new ProductDetailsPage(page));
  },
  categoryProductsPage: async ({ page }, use) => {
    await use(new CategoryProductsPage(page));
  },
  brandProductsPage: async ({ page }, use) => {
    await use(new BrandProductsPage(page));
  },
  contactUsPage: async ({ page }, use) => {
    await use(new ContactUsPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  paymentPage: async ({ page }, use) => {
    await use(new PaymentPage(page));
  },

  newUser: async ({ request }, use, testInfo) => {
    const user = generateUser(testInfo.project.name);
    await use(user);
    await deleteAccountViaApi(request, user);
  },
  registeredUser: async ({ request }, use, testInfo) => {
    const user = generateUser(testInfo.project.name);
    await createAccountViaApi(request, user);
    await use(user);
    await deleteAccountViaApi(request, user);
  },
});

export { expect } from '@playwright/test';
