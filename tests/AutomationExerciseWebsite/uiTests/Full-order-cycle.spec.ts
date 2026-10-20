// Full-order-cycle.spec.ts  –  TC10–TC17 + TC23–TC24: Subscriptions, Cart, Full Checkout Flows, Address, Invoice
import { test, expect } from '../fixtures/BaseFixture';
import { DEFAULT_PAYMENT_CARD } from '../utils/TestData/paymentCard';
import { CheckoutPage } from '../pages/CheckoutPage';
import { PaymentPage }  from '../pages/PaymentPage';

/** From /checkout: adds a comment, places the order, pays and asserts the confirmation. */
async function placeOrderAndPay(checkoutPage: CheckoutPage, paymentPage: PaymentPage, comment: string): Promise<void> {
  await checkoutPage.addComment(comment);
  await checkoutPage.placeOrder();
  await paymentPage.fillPaymentDetails(DEFAULT_PAYMENT_CARD);
  await paymentPage.payAndConfirm();
  await expect(paymentPage.orderPlacedHeading).toBeVisible();
}

test.describe('TC10 - Verify Subscription in Home Page', () => {
  test('Should subscribe with valid email on home page', async ({ homePage }) => {
    await homePage.goto();
    await homePage.scrollToBottom();
    await expect(homePage.subscriptionHeading).toBeVisible();
    await homePage.subscribeWithEmail('subscriber_home@example.com');
    await expect(homePage.subscriptionSuccess).toContainText('You have been successfully subscribed!');
  });
});

test.describe('TC11 - Verify Subscription in Cart Page', () => {
  test('Should subscribe with valid email on cart page', async ({ homePage, cartPage }) => {
    await homePage.goto();
    await homePage.clickCart();
    await cartPage.scrollToBottom();
    await expect(cartPage.subscriptionHeading).toBeVisible();
    await cartPage.subscribeWithEmail('subscriber_cart@example.com');
    await expect(cartPage.subscriptionSuccess).toContainText('You have been successfully subscribed!');
  });
});

test.describe('TC12 - Add Products to Cart', () => {
  test('Should add multiple products and verify cart', async ({ cartPage, productsPage, homePage }) => {
    await homePage.goto();
    await homePage.clickProducts();
    await productsPage.addToCart(0);
    await productsPage.continueShopping();
    await productsPage.addToCart(1);
    await productsPage.viewCartFromModal();
    await expect(cartPage.cartProductNames).toHaveCount(2);
    await expect(cartPage.cartQtys.first()).toBeVisible();
    await expect(cartPage.cartTotals.first()).toBeVisible();
  });
});

test.describe('TC13 - Verify Product Quantity in Cart', () => {
  test('Should add product with quantity 4 and verify in cart', async ({ productDetailsPage, cartPage }) => {
    await productDetailsPage.goto(1);
    await productDetailsPage.setQuantity(4);
    await productDetailsPage.addToCart();
    await productDetailsPage.viewCart();
    await expect(cartPage.cartQtys.first()).toHaveText('4');
  });
});

test.describe('TC14 - Place Order: Register while Checkout', () => {
  test('Should register mid-checkout and complete order', async ({
    homePage, loginPage, registrationPage, productsPage, cartPage, checkoutPage, paymentPage, newUser,
  }) => {
    await productsPage.addFirstProductAndViewCart();
    await cartPage.proceedToCheckoutAsGuest();

    await loginPage.signup(newUser.name, newUser.email);
    await registrationPage.register(newUser);
    await expect(registrationPage.accountCreatedMsg).toBeVisible();
    await registrationPage.clickContinue();
    await expect(homePage.loggedInUser).toContainText(newUser.name);

    await homePage.clickCart();
    await cartPage.proceedToCheckout();
    await expect(checkoutPage.deliveryAddress).toContainText(newUser.address1);
    await placeOrderAndPay(checkoutPage, paymentPage, 'Please deliver during business hours.');

    await homePage.deleteAccount();
    await expect(homePage.accountDeletedHeading).toBeVisible();
  });
});

test.describe('TC15 - Place Order: Register Before Checkout', () => {
  test('Should register first, add product, then checkout', async ({
    homePage, loginPage, registrationPage, productsPage, cartPage, checkoutPage, paymentPage, newUser,
  }) => {
    await loginPage.goto();
    await loginPage.signup(newUser.name, newUser.email);
    await registrationPage.register(newUser);
    await registrationPage.clickContinue();
    await expect(homePage.loggedInUser).toContainText(newUser.name);

    await productsPage.addFirstProductAndViewCart();
    await cartPage.proceedToCheckout();
    await expect(checkoutPage.deliveryAddress).toBeVisible();
    await placeOrderAndPay(checkoutPage, paymentPage, 'TC15 test order');

    await homePage.deleteAccount();
    await expect(homePage.accountDeletedHeading).toBeVisible();
  });
});

test.describe('TC16 - Place Order: Login before Checkout', () => {
  test('Should login, add product and complete order', async ({
    homePage, loginPage, productsPage, cartPage, checkoutPage, paymentPage, registeredUser,
  }) => {
    await loginPage.goto();
    await loginPage.login(registeredUser.email, registeredUser.password);
    await expect(homePage.loggedInUser).toContainText(registeredUser.name);

    await productsPage.addFirstProductAndViewCart();
    await cartPage.proceedToCheckout();
    await placeOrderAndPay(checkoutPage, paymentPage, 'TC16 test order');

    await homePage.deleteAccount();
    await expect(homePage.accountDeletedHeading).toBeVisible();
  });
});

test.describe('TC17 - Remove Products from Cart', () => {
  test('Should remove a product from the cart', async ({ homePage, productsPage, cartPage }) => {
    await homePage.goto();
    await homePage.clickProducts();
    await productsPage.addToCart(0);
    await productsPage.viewCartFromModal();
    await expect(cartPage.cartProductNames).toHaveCount(1);

    await cartPage.removeItem(0);
    await expect(cartPage.cartProductNames).toHaveCount(0);
    await expect(cartPage.emptyCartMsg).toBeVisible();
  });
});

test.describe('TC23 - Verify Address Details in Checkout Page', () => {
  test('Should display correct delivery and billing address on checkout', async ({
    homePage, loginPage, productsPage, cartPage, checkoutPage, registeredUser,
  }) => {
    await loginPage.goto();
    await loginPage.login(registeredUser.email, registeredUser.password);
    await expect(homePage.loggedInUser).toBeVisible();

    await productsPage.addFirstProductAndViewCart();
    await cartPage.proceedToCheckout();

    for (const address of [checkoutPage.deliveryAddress, checkoutPage.billingAddress]) {
      await expect(address).toContainText(registeredUser.firstName);
      await expect(address).toContainText(registeredUser.lastName);
      await expect(address).toContainText(registeredUser.address1);
      await expect(address).toContainText(registeredUser.city);
      await expect(address).toContainText(registeredUser.zipcode);
      await expect(address).toContainText(registeredUser.mobile);
    }

    await homePage.deleteAccount();
    await expect(homePage.accountDeletedHeading).toBeVisible();
  });
});

test.describe('TC24 - Download Invoice after Purchase', () => {
  test('Should download invoice file after placing an order', async ({
    homePage, loginPage, registrationPage, productsPage, cartPage, checkoutPage, paymentPage, newUser,
  }) => {
    await loginPage.goto();
    await loginPage.signup(newUser.name, newUser.email);
    await registrationPage.register(newUser);
    await registrationPage.clickContinue();

    await productsPage.addFirstProductAndViewCart();
    await cartPage.proceedToCheckout();
    await placeOrderAndPay(checkoutPage, paymentPage, 'TC24 invoice order');

    const invoice = await paymentPage.fetchInvoice();
    expect(invoice.filename).toBe('invoice.txt');
    expect(invoice.body).toContain(`${newUser.firstName} ${newUser.lastName}`);
    expect(invoice.body).toMatch(/total purchase amount is \d+/);
    await paymentPage.clickContinue();

    await homePage.deleteAccount();
    await expect(homePage.accountDeletedHeading).toBeVisible();
  });
});
