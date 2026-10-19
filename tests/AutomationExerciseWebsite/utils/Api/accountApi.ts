import { APIRequestContext } from '@playwright/test';
import { UserData } from '../TestData/users';

/** The site returns HTTP 200 for every call and reports the real status in the JSON body. */
interface ApiResponse {
  responseCode: number;
  message: string;
}

/** Creates an account through the public API — faster and more reliable than the UI for test setup. */
export async function createAccountViaApi(request: APIRequestContext, user: UserData): Promise<void> {
  const response = await request.post('/api/createAccount', {
    form: {
      name:          user.name,
      email:         user.email,
      password:      user.password,
      title:         'Mr',
      birth_date:    user.dob.day,
      birth_month:   user.dob.month,
      birth_year:    user.dob.year,
      firstname:     user.firstName,
      lastname:      user.lastName,
      company:       user.company,
      address1:      user.address1,
      address2:      user.address2,
      country:       user.country,
      zipcode:       user.zipcode,
      state:         user.state,
      city:          user.city,
      mobile_number: user.mobile,
    },
  });
  const body = (await response.json()) as ApiResponse;
  if (body.responseCode !== 201) {
    throw new Error(`createAccount failed for ${user.email}: ${body.responseCode} ${body.message}`);
  }
}

/** Deletes an account if it still exists. Safe to call after a test already deleted it through the UI. */
export async function deleteAccountViaApi(request: APIRequestContext, user: UserData): Promise<void> {
  const response = await request.delete('/api/deleteAccount', {
    form: { email: user.email, password: user.password },
  });
  const body = (await response.json()) as ApiResponse;
  if (body.responseCode !== 200 && body.responseCode !== 404) {
    throw new Error(`deleteAccount failed for ${user.email}: ${body.responseCode} ${body.message}`);
  }
}
