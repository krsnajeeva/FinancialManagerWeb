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
    description: 'Monthly dining and groceries',
    budgetAmount: 5000,
    month: 6,
    year: 2026,
  },
  {
    id: 'cb-2',
    category: 'Household',
    description: 'Rent, maintenance and utilities',
    budgetAmount: 2000,
    month: 6,
    year: 2026,
  },
  {
    id: 'cb-3',
    category: 'Mobile Recharge',
    description: 'Data plan and voice packs',
    budgetAmount: 600,
    month: 6,
    year: 2026,
  },
  {
    id: 'cb-4',
    category: 'Groceries',
    description: 'Weekly supermarket supplies',
    budgetAmount: 8000,
    month: 6,
    year: 2026,
  },
  {
    id: 'cb-5',
    category: 'Snacks',
    description: 'Tea, coffee, and light snacks',
    budgetAmount: 2000,
    month: 6,
    year: 2026,
  },
  {
    id: 'cb-6',
    category: 'Health',
    description: 'Medicines and health checkups',
    budgetAmount: 3000,
    month: 6,
    year: 2026,
  },
  {
    id: 'cb-7',
    category: 'Apparel',
    description: 'Shopping for clothes and shoes',
    budgetAmount: 5000,
    month: 6,
    year: 2026,
  },
  {
    id: 'cb-8',
    category: 'Other',
    description: 'Miscellaneous expenses',
    budgetAmount: 4400,
    month: 6,
    year: 2026,
  },
];
