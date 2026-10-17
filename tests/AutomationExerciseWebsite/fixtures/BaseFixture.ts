import { test as base, Page } from '@playwright/test';
import { HomePage }            from '../pages/HomePage';
import { LoginPage }           from '../pages/LoginPage';
import { RegistrationPage }    from '../pages/RegistrationPage';
import { ProductsPage }        from '../pages/ProductsPage';
import { ProductDetailsPage }  from '../pages/ProductDetailsPage';
import { CategoryProductsPage } from '../pages/CategoryProductsPage';
import { BrandProductsPage }   from '../pages/BrandProductsPage';
import { ContactUsPage }       from '../pages/ContactUsPage';
import { CartPage }            from '../pages/CartPage';
import { CheckoutPage }        from '../pages/CheckoutPage';
import { PaymentPage }         from '../pages/PaymentPage';
import { CompletedOrderPage }  from '../pages/CompletedOrderPage';

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
  completedOrderPage:   CompletedOrderPage;
};

/**
 * Extended Playwright test fixture that pre-instantiates all page objects.
 * Import 	est from this file instead of @playwright/test in spec files.
 */
export const test = base.extend<PageFixtures>({
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
  completedOrderPage: async ({ page }, use) => {
    await use(new CompletedOrderPage(page));
  },
});

export { expect } from '@playwright/test';
