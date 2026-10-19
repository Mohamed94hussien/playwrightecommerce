// communications.spec.ts  –  TC06: Contact Us Form
import * as path from 'path';
import { test, expect } from '../fixtures/BaseFixture';
import { CONTACT_MESSAGE } from '../utils/TestData/messagesWithTitles';

test.describe('TC06 - Contact Us Form', () => {
  test('Should submit contact us form successfully', async ({ page, homePage, contactUsPage }) => {
    await homePage.goto();
    await expect(page).toHaveTitle(/Automation Exercise/);

    await homePage.clickContactUs();
    await expect(contactUsPage.heading).toBeVisible();

    await contactUsPage.fillForm(CONTACT_MESSAGE);
    await contactUsPage.uploadFile(path.join(__dirname, '../utils/TestData/test-upload.txt'));
    await contactUsPage.submit();

    await expect(contactUsPage.successAlert).toBeVisible();
    await contactUsPage.goHome();
    await expect(page).toHaveURL('/');
  });
});
