import {Budget, CategoryBudget} from '../types/budget';

export const mockBudget: Budget = {
  id: 'budget-1',
  monthlyBudget: 30000,
  month: 6,
  year: 2026,
};

export const mockCategoryBudgets: CategoryBudget[] = [
  {
    id: 'cb-1',
    category: 'Food',
    budgetAmount: 5000,
    month: 6,
    year: 2026,
  },
  {
    id: 'cb-2',
    category: 'Household',
    budgetAmount: 2000,
    month: 6,
    year: 2026,
  },
  {
    id: 'cb-3',
    category: 'Mobile Recharge',
    budgetAmount: 600,
    month: 6,
    year: 2026,
  },
  {
    id: 'cb-4',
    category: 'Groceries',
    budgetAmount: 8000,
    month: 6,
    year: 2026,
  },
  {
    id: 'cb-5',
    category: 'Snacks',
    budgetAmount: 2000,
    month: 6,
    year: 2026,
  },
  {
    id: 'cb-6',
    category: 'Health',
    budgetAmount: 3000,
    month: 6,
    year: 2026,
  },
  {
    id: 'cb-7',
    category: 'Apparel',
    budgetAmount: 5000,
    month: 6,
    year: 2026,
  },
  {
    id: 'cb-8',
    category: 'Other',
    budgetAmount: 4400,
    month: 6,
    year: 2026,
  },
];
