export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  account: 'cash' | 'credit' | 'card';
  fixedCommitment: boolean;
  date: string;
  createdAt: string;
}

export type ExpenseFormData = Omit<Expense, 'id' | 'createdAt'>;
