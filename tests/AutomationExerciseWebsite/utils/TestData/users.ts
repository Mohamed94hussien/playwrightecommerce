export interface UserData {
  name: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobile: string;
  dob: { day: string; month: string; year: string };
}

/** Generates a unique user object per test run to prevent conflicts */
export function generateUser(prefix: string = 'testuser'): UserData {
  const unique = Date.now();
  return {
    name:      `_`,
    email:     `_@test.com`,
    password:  'Test@1234',
    firstName: 'John',
    lastName:  'Doe',
    company:   'Test Corp',
    address1:  '123 Main Street',
    address2:  'Suite 100',
    country:   'United States',
    state:     'California',
    city:      'Los Angeles',
    zipcode:   '90001',
    mobile:    '0501234567',
    dob:       { day: '15', month: 'March', year: '1995' },
  };
}
