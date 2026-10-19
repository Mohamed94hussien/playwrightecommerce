# Playwright Automation Framework - Automation Exercise Website

## Project Overview

A modern, scalable UI test automation framework built with **Playwright + TypeScript** targeting [automationexercise.com](https://automationexercise.com).

Key features:
- Page Object Model (POM) with clean separation of concerns
- Custom Playwright Fixtures for automatic page injection
- Account fixtures that create/delete test users through the site's API, so accounts are cleaned up even when a test fails
- Split test data management (users, products, messages, payment)
- Global Setup for pre-test configuration
- Allure + HTML reporting
- Cross-browser execution (Chromium & WebKit)
- GitHub Actions CI/CD pipeline

---

## Tools & Technologies

| Tool | Purpose |
|------|---------|
| TypeScript | Programming language |
| Playwright | Browser automation |
| Playwright Test | Test runner |
| Page Object Model | Design pattern |
| Custom Fixtures | Dependency injection for pages |
| Allure Playwright | Rich test reporting |
| GitHub Actions | CI/CD pipeline |

---

## Framework Architecture

```text
playwright-automation-exercise/
|
+-- .github/
|   +-- workflows/
|       +-- playwright.yml
|
+-- tests/
|   +-- AutomationExerciseWebsite/
|       +-- fixtures/
|       |   +-- BaseFixture.ts
|       |
|       +-- pages/
|       |   +-- components/
|       |   |   +-- CartModal.ts
|       |   +-- BasePage.ts
|       |   +-- HomePage.ts
|       |   +-- LoginPage.ts
|       |   +-- RegistrationPage.ts
|       |   +-- ProductsPage.ts
|       |   +-- ProductDetailsPage.ts
|       |   +-- CategoryProductsPage.ts
|       |   +-- BrandProductsPage.ts
|       |   +-- ContactUsPage.ts
|       |   +-- CartPage.ts
|       |   +-- CheckoutPage.ts
|       |   +-- PaymentPage.ts
|       |
|       +-- uiTests/
|       |   +-- authentication.spec.ts
|       |   +-- communications.spec.ts
|       |   +-- product-catalog.spec.ts
|       |   +-- product-search.spec.ts
|       |   +-- Full-order-cycle.spec.ts
|       |   +-- scroll-tests.spec.ts
|       |
|       +-- utils/
|           +-- Api/
|           |   +-- accountApi.ts
|           +-- Setup/
|           |   +-- globalSetup.ts
|           +-- TestData/
|               +-- users.ts
|               +-- products.ts
|               +-- messagesWithTitles.ts
|               +-- paymentCard.ts
|               +-- test-upload.txt
|
+-- allure-report/
+-- allure-results/
+-- playwright-report/
+-- playwright.config.ts
+-- package.json
+-- README.md
```

---

## Quick Start

### Prerequisites
- Node.js 24+
- npm

### Installation

```bash
npm install
npx playwright install chromium webkit
```

### Running Tests

```bash
# Run ALL 26 test cases
npm test

# Run specific spec files
npm run test:auth            # TC01-TC05
npm run test:communications  # TC06
npm run test:catalog         # TC07-TC09
npm run test:orders          # TC10-TC17, TC23-TC24
npm run test:search          # TC18-TC22
npm run test:scroll          # TC25-TC26

# Cross-browser
npm run test:chromium
npm run test:webkit

# Modes
npm run test:headed
npm run test:ui
npm run test:report

# Static checks
npm run typecheck
```

### Allure Reports

```bash
npm run allure:generate
npm run allure:open
npm run allure:serve
```

---

## Test Cases Coverage

| TC | Title | Spec File |
|----|-------|-----------|
| TC01 | Register new user | authentication.spec.ts |
| TC02 | Login with correct credentials | authentication.spec.ts |
| TC03 | Login with incorrect credentials | authentication.spec.ts |
| TC04 | Logout user | authentication.spec.ts |
| TC05 | Register with existing email | authentication.spec.ts |
| TC06 | Contact Us form submission | communications.spec.ts |
| TC07 | Verify Test Cases page | product-catalog.spec.ts |
| TC08 | All Products and Product Detail | product-catalog.spec.ts |
| TC09 | Search product | product-catalog.spec.ts |
| TC10 | Subscription on Home page | Full-order-cycle.spec.ts |
| TC11 | Subscription on Cart page | Full-order-cycle.spec.ts |
| TC12 | Add multiple products to cart | Full-order-cycle.spec.ts |
| TC13 | Verify product quantity in cart | Full-order-cycle.spec.ts |
| TC14 | Place order: Register during checkout | Full-order-cycle.spec.ts |
| TC15 | Place order: Register before checkout | Full-order-cycle.spec.ts |
| TC16 | Place order: Login before checkout | Full-order-cycle.spec.ts |
| TC17 | Remove product from cart | Full-order-cycle.spec.ts |
| TC18 | View category products | product-search.spec.ts |
| TC19 | View brand products | product-search.spec.ts |
| TC20 | Search product + verify in cart after login | product-search.spec.ts |
| TC21 | Add review on product | product-search.spec.ts |
| TC22 | Add from Recommended items | product-search.spec.ts |
| TC23 | Verify address in Checkout | Full-order-cycle.spec.ts |
| TC24 | Download invoice after purchase | Full-order-cycle.spec.ts |
| TC25 | Scroll up using Arrow button | scroll-tests.spec.ts |
| TC26 | Scroll up without Arrow button | scroll-tests.spec.ts |

---

## Architecture: Key Concepts

### Custom Fixtures (BaseFixture.ts)

All page objects are pre-instantiated and injected. Tests declare what they need:

```typescript
import { test, expect } from '../fixtures/BaseFixture';

test('Should show error for invalid login', async ({ homePage, loginPage }) => {
  await homePage.goto();
  await homePage.clickSignupLogin();
  await loginPage.login('invalid_nobody@wrong.com', 'WrongPassword999');
  await expect(loginPage.loginError).toBeVisible();
});
```

### Account Fixtures

Tests that need a user ask for one instead of registering it by hand:

| Fixture | Before the test | After the test |
|---------|-----------------|----------------|
| `newUser` | Generates unique, unregistered user data | Deletes the account via API if it exists |
| `registeredUser` | Registers the user via `POST /api/createAccount` | Deletes the account via `DELETE /api/deleteAccount` |

```typescript
test('Should login', async ({ loginPage, homePage, registeredUser }) => {
  await loginPage.goto();
  await loginPage.login(registeredUser.email, registeredUser.password);
  await expect(homePage.loggedInUser).toContainText(registeredUser.name);
});
```

Teardown runs even when the test fails, so no orphaned accounts are left on the shared public site.

### Split Test Data

```typescript
import { generateUser }         from '../utils/TestData/users';
import { DEFAULT_PAYMENT_CARD } from '../utils/TestData/paymentCard';
import { CONTACT_MESSAGE }      from '../utils/TestData/messagesWithTitles';
import { SEARCH_TERMS }         from '../utils/TestData/products';
```

---

## Configuration

| Setting | Value |
|---------|-------|
| Base URL | https://automationexercise.com |
| Browsers | Chromium, WebKit |
| Headless | true |
| Retries | 0 locally (2 on CI) |
| Workers | 1 (sequential) |
| Screenshots | On failure only |
| Video | Retained on failure |
| Reporting | Allure + HTML + List |

---

## 👨‍💻 Author

**Mohamed Hussien Mohamed**
*Test Automation Engineer | 6× ISTQB® Certified | AI Testing & Agent-Based Test Automation*

- **LinkedIn**: [linkedin.com/in/mohamedhussien94](https://linkedin.com/in/mohamedhussien94)
- **GitHub**: [@Mohamed94hussien](https://github.com/Mohamed94hussien)
- **Email**: [mohamed94hussien@gmail.com](mailto:mohamed94hussien@gmail.com)
- **Phone / WhatsApp**: [+20 101 780 1980](https://wa.me/2001017801980)

