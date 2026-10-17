export interface PaymentCard {
  nameOnCard: string;
  cardNumber: string;
  cvc: string;
  expiryMonth: string;
  expiryYear: string;
}

export const DEFAULT_PAYMENT_CARD: PaymentCard = {
  nameOnCard:  'John Doe',
  cardNumber:  '4111111111111111',
  cvc:         '123',
  expiryMonth: '12',
  expiryYear:  '2027',
};
