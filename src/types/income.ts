export interface Income {
  id: string;
  category: string;
  description: string;
  amount: number;
  account: 'cash' | 'credit' | 'card';
  date: string;
  createdAt: string;
}

export type IncomeFormData = Omit<Income, 'id' | 'createdAt'>;
