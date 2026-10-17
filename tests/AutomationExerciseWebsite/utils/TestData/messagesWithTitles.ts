export interface ContactMessage {
  name:    string;
  email:   string;
  subject: string;
  message: string;
}

export const CONTACT_MESSAGE: ContactMessage = {
  name:    'Test User',
  email:   'testuser@example.com',
  subject: 'Automation Test - Contact',
  message: 'This is an automated test message for the contact form.',
};

export const REVIEW_MESSAGE = {
  name:   'Review Tester',
  email:  'reviewer@test.com',
  review: 'This product is excellent! Great quality and very fast shipping.',
};
