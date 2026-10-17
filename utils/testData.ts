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

export interface PaymentData {
  name: string;
  cardNumber: string;
  cvc: string;
  expiryMonth: string;
  expiryYear: string;
}

/** Creates a unique user object for each test run */
export function generateUser(prefix: string = 'testuser'): UserData {
  const unique = Date.now();
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

export const PAYMENT_DETAILS: PaymentData = {
  name:        'John Doe',
  cardNumber:  '4111111111111111',
  cvc:         '123',
  expiryMonth: '12',
  expiryYear:  '2027',
};
