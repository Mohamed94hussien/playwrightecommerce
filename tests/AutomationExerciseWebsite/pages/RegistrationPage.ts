import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { UserData } from '../utils/TestData/users';

interface AccountInfo {
  title?: 'Mr' | 'Mrs';
  password: string;
  day?: string;
  month?: string;
  year?: string;
  newsletter?: boolean;
  offers?: boolean;
}

interface AddressInfo {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  country?: string;
  state: string;
  city: string;
  zipcode: string;
  mobile: string;
}

export class RegistrationPage extends BasePage {
  readonly titleMr: Locator;
  readonly titleMrs: Locator;
  readonly password: Locator;
  readonly daySelect: Locator;
  readonly monthSelect: Locator;
  readonly yearSelect: Locator;
  readonly newsletterCheck: Locator;
  readonly offersCheck: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly company: Locator;
  readonly address1: Locator;
  readonly address2: Locator;
  readonly countrySelect: Locator;
  readonly state: Locator;
  readonly city: Locator;
  readonly zipcode: Locator;
  readonly mobileNumber: Locator;
  readonly createAccountBtn: Locator;
  readonly accountCreatedMsg: Locator;
  readonly continueBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.titleMr          = page.locator('input#id_gender1');
    this.titleMrs         = page.locator('input#id_gender2');
    this.password         = page.locator('input#password');
    this.daySelect        = page.locator('select#days');
    this.monthSelect      = page.locator('select#months');
    this.yearSelect       = page.locator('select#years');
    this.newsletterCheck  = page.locator('input#newsletter');
    this.offersCheck      = page.locator('input#optin');
    this.firstName        = page.locator('input#first_name');
    this.lastName         = page.locator('input#last_name');
    this.company          = page.locator('input#company');
    this.address1         = page.locator('input#address1');
    this.address2         = page.locator('input#address2');
    this.countrySelect    = page.locator('select#country');
    this.state            = page.locator('input#state');
    this.city             = page.locator('input#city');
    this.zipcode          = page.locator('input#zipcode');
    this.mobileNumber     = page.locator('input#mobile_number');
    this.createAccountBtn = page.locator('button[data-qa="create-account"]');
    this.accountCreatedMsg = page.locator('h2[data-qa="account-created"]');
    this.continueBtn      = page.locator('a[data-qa="continue-button"]');
  }

  async fillAccountInfo({
    title = 'Mr',
    password,
    day = '1',
    month = 'January',
    year = '1990',
    newsletter = false,
    offers = false,
  }: AccountInfo): Promise<void> {
    if (title === 'Mr') {
      await this.titleMr.check();
    } else {
      await this.titleMrs.check();
    }
    await this.password.fill(password);
    await this.daySelect.selectOption(day);
    await this.monthSelect.selectOption(month);
    await this.yearSelect.selectOption(year);
    if (newsletter) await this.newsletterCheck.check();
    if (offers)     await this.offersCheck.check();
  }

  async fillAddressInfo({
    firstName,
    lastName,
    company = '',
    address1,
    address2 = '',
    country = 'United States',
    state,
    city,
    zipcode,
    mobile,
  }: AddressInfo): Promise<void> {
    await this.firstName.fill(firstName);
    await this.lastName.fill(lastName);
    if (company)  await this.company.fill(company);
    await this.address1.fill(address1);
    if (address2) await this.address2.fill(address2);
    await this.countrySelect.selectOption(country);
    await this.state.fill(state);
    await this.city.fill(city);
    await this.zipcode.fill(zipcode);
    await this.mobileNumber.fill(mobile);
  }

  /** Fills the whole "Enter Account Information" form for `user` and submits it. Expects to be on /signup. */
  async register(user: UserData): Promise<void> {
    await this.fillAccountInfo({
      title: 'Mr', password: user.password,
      day: user.dob.day, month: user.dob.month, year: user.dob.year,
      newsletter: true, offers: true,
    });
    await this.fillAddressInfo({
      firstName: user.firstName, lastName: user.lastName, company: user.company,
      address1: user.address1, address2: user.address2, country: user.country,
      state: user.state, city: user.city, zipcode: user.zipcode, mobile: user.mobile,
    });
    await this.createAccount();
  }

  async createAccount(): Promise<void> {
    await this.createAccountBtn.click();
    await this.page.waitForURL('**/account_created**');
  }

  async clickContinue(): Promise<void> {
    await this.continueBtn.click();
  }
}
