export interface CreditCardItem {
  id: string;
  cardName: string;
  cardType: string;
  cardNumber: string;
  totalLimit: number;
  usedAmount: number;
  cardHolderName: string;
  expiryDate: string;
  cvv: string;
  statementDay: number;
  paymentDueDays: number;
  cardTheme?: string;
  userId?: string;
  createdAt?: string;
  sharedCardId?: string;
}

export interface CardTransaction {
  id: string;
  cardId: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  createdAt: string;
  userId: string;
  type?: 'expense' | 'income';
}
