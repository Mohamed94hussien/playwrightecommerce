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

/** Generates a unique user object per call to prevent conflicts on the shared public site */
export function generateUser(prefix: string = 'testuser'): UserData {
  const unique = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    name:      `${prefix}_${unique}`,
    email:     `${prefix}_${unique}@test.com`,
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
