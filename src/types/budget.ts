export interface Budget {
  id: string;
  monthlyBudget: number;
  month: number;
  year: number;
  userId?: string;
}

export interface CategoryBudget {
  id: string;
  category: string;
  budgetAmount: number;
  month: number;
  year: number;
  userId?: string;
  description?: string;
}
